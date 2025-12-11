/**
 * TypeScript port of Eldritch Revised → 2nd Edition converter.
 * Based on Purity and Parity Suite eldritch_converter/converter.py
 */

import {
  RevisedEntity,
  RevisedAbility,
  AbilityMapping,
  DieRank,
  ABILITY_TRANSLATION_TABLE,
  MASTERY_TO_FOCUS_BONUS,
  INITIATIVE_PHASE_BY_RANK,
} from '../types/revisedEntity';
import { DetailedNPC } from '../data/npcData';

export interface ConvertedAbilityNode {
  root: string;
  name: string;
  tier: string;
  die_rank: DieRank;
  max_value: number;
}

export interface ConvertedFocus {
  root: string;
  name: string;
  bonus: number;
}

export interface ConvertedEntity {
  name: string;
  kind: string;
  abilities: ConvertedAbilityNode[];
  foci: ConvertedFocus[];
  active_defense_pool: number;
  passive_defense_pool: number;
  spirit_points: number;
  initiative_phase: number;
  movement_per_phase: number;
  notes?: string;
}

function dieValue(die: DieRank): number {
  return parseInt(die.replace('d', ''), 10);
}

function normalizeKey(value: string): string {
  return value.trim().toLowerCase();
}

function lookupMapping(abilityName: string): AbilityMapping | undefined {
  // Try exact match first
  if (ABILITY_TRANSLATION_TABLE[abilityName]) {
    return ABILITY_TRANSLATION_TABLE[abilityName];
  }
  // Case-insensitive fallback
  const key = Object.keys(ABILITY_TRANSLATION_TABLE).find(
    (k) => normalizeKey(k) === normalizeKey(abilityName)
  );
  return key ? ABILITY_TRANSLATION_TABLE[key] : undefined;
}

function maxValue(
  abilities: ConvertedAbilityNode[],
  opts: { targetName?: string; targetRoot?: string }
): number {
  const filtered = abilities.filter((a) => {
    if (opts.targetName && a.name !== opts.targetName) return false;
    if (opts.targetRoot && a.root !== opts.targetRoot) return false;
    return true;
  });
  return Math.max(0, ...filtered.map((a) => a.max_value));
}

function bestDieRank(
  abilities: ConvertedAbilityNode[],
  opts: { targetRoot?: string }
): DieRank | null {
  const filtered = abilities.filter((a) => {
    if (opts.targetRoot && a.root !== opts.targetRoot) return false;
    return true;
  });
  if (!filtered.length) return null;
  return filtered.reduce((best, cur) =>
    dieValue(cur.die_rank) > dieValue(best.die_rank) ? cur : best
  ).die_rank;
}

export function convertRevisedTo2E(entity: RevisedEntity): ConvertedEntity {
  const abilityNodes: Map<string, ConvertedAbilityNode> = new Map();
  const focusNodes: Map<string, ConvertedFocus> = new Map();

  for (const ability of entity.abilities) {
    const mapping = lookupMapping(ability.name);
    if (!mapping) {
      // Skip unmapped abilities
      continue;
    }

    if (ability.tier === 'mastery') {
      const bonus = MASTERY_TO_FOCUS_BONUS[ability.die_rank] ?? 1;
      const focus: ConvertedFocus = {
        root: mapping.target_root,
        name: mapping.target_name,
        bonus,
      };
      const key = `${focus.root}:${focus.name}`;
      const existing = focusNodes.get(key);
      if (!existing || focus.bonus > existing.bonus) {
        focusNodes.set(key, focus);
      }
    } else {
      const node: ConvertedAbilityNode = {
        root: mapping.target_root,
        name: mapping.target_name,
        tier: mapping.target_tier,
        die_rank: ability.die_rank,
        max_value: dieValue(ability.die_rank),
      };
      const key = `${node.root}:${node.name}`;
      const existing = abilityNodes.get(key);
      if (!existing || node.max_value > existing.max_value) {
        abilityNodes.set(key, node);
      }
    }
  }

  const abilityList = Array.from(abilityNodes.values()).sort((a, b) =>
    `${a.root}:${a.name}`.localeCompare(`${b.root}:${b.name}`)
  );
  const focusList = Array.from(focusNodes.values()).sort((a, b) =>
    `${a.root}:${a.name}`.localeCompare(`${b.root}:${b.name}`)
  );

  // Derive stats
  const prowessMV = maxValue(abilityList, { targetRoot: 'Prowess' });
  const agilityMV = maxValue(abilityList, { targetName: 'Agility' });
  const meleeMV = maxValue(abilityList, { targetName: 'Melee' });

  const fortitudeMV = maxValue(abilityList, { targetRoot: 'Fortitude' });
  const enduranceMV = maxValue(abilityList, { targetName: 'Endurance' });
  const strengthMV = maxValue(abilityList, { targetName: 'Strength' });

  const competenceMV = maxValue(abilityList, { targetRoot: 'Competence' });
  const willpowerMV = maxValue(abilityList, { targetName: 'Willpower' });

  const activeDefensePool = prowessMV + agilityMV + meleeMV;
  const passiveDefensePool = fortitudeMV + enduranceMV + strengthMV;
  const spiritPoints = competenceMV + willpowerMV;

  const bestProwessRank = bestDieRank(abilityList, { targetRoot: 'Prowess' });
  const initiativePhase = bestProwessRank
    ? INITIATIVE_PHASE_BY_RANK[bestProwessRank]
    : 5;

  const speedFocusBonus = Math.max(
    0,
    ...focusList
      .filter((f) => f.name.toLowerCase() === 'speed')
      .map((f) => f.bonus)
  );
  const movementPerPhase = Math.round(
    ((12 + prowessMV + agilityMV + speedFocusBonus) / 5) * 100
  ) / 100;

  return {
    name: entity.name,
    kind: entity.kind,
    abilities: abilityList,
    foci: focusList,
    active_defense_pool: activeDefensePool,
    passive_defense_pool: passiveDefensePool,
    spirit_points: spiritPoints,
    initiative_phase: initiativePhase,
    movement_per_phase: movementPerPhase,
    notes: entity.notes,
  };
}

/**
 * Convert a 2E ConvertedEntity into a partial DetailedNPC shape.
 */
export function convertedEntityToDetailedNPC(entity: ConvertedEntity): Partial<DetailedNPC> {
  return {
    id: Date.now() + Math.random(),
    name: entity.name,
    role: entity.kind,
    level: 1, // Default; can be adjusted
    activeDefense: entity.active_defense_pool,
    passiveDefense: entity.passive_defense_pool,
    spiritPoints: entity.spirit_points,
    abilities: {
      competence: (entity.abilities.find((a) => a.root === 'Competence')?.die_rank ?? 'd4') as string,
      prowess: (entity.abilities.find((a) => a.root === 'Prowess')?.die_rank ?? 'd4') as string,
      fortitude: (entity.abilities.find((a) => a.root === 'Fortitude')?.die_rank ?? 'd4') as string,
    },
  };
}

export default convertRevisedTo2E;
