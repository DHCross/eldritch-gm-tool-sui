/**
 * TypeScript port of Eldritch Revised Edition entity types.
 * Based on Purity and Parity Suite eldritch_converter/models.py
 */

export type DieRank = 'd3' | 'd4' | 'd6' | 'd8' | 'd10' | 'd12';

export type AbilityTier = 'basic' | 'specialty' | 'mastery';

export interface RevisedAbility {
  name: string;
  tier: AbilityTier;
  die_rank: DieRank;
}

export interface RevisedEntity {
  name: string;
  kind: string; // NPC, Opponent, Item, etc.
  abilities: RevisedAbility[];
  notes?: string;
}

export interface AbilityMapping {
  target_root: 'Competence' | 'Prowess' | 'Fortitude';
  target_name: string;
  target_tier: AbilityTier;
}

/**
 * Mapping table from Revised Edition ability names to 2nd Edition equivalents.
 */
export const ABILITY_TRANSLATION_TABLE: Record<string, AbilityMapping> = {
  // Competence root
  Perception: { target_root: 'Competence', target_name: 'Perception', target_tier: 'basic' },
  Knowledge: { target_root: 'Competence', target_name: 'Expertise', target_tier: 'specialty' },
  Influence: { target_root: 'Competence', target_name: 'Adroitness', target_tier: 'specialty' },
  Skullduggery: { target_root: 'Competence', target_name: 'Adroitness', target_tier: 'specialty' },
  // Prowess root
  Agility: { target_root: 'Prowess', target_name: 'Agility', target_tier: 'basic' },
  'Melee Weapons': { target_root: 'Prowess', target_name: 'Melee', target_tier: 'basic' },
  Unarmed: { target_root: 'Prowess', target_name: 'Melee', target_tier: 'basic' },
  'Ranged Weapons': { target_root: 'Prowess', target_name: 'Precision', target_tier: 'basic' },
  Speed: { target_root: 'Prowess', target_name: 'Speed', target_tier: 'mastery' },
  // Fortitude root
  Fortitude: { target_root: 'Fortitude', target_name: 'Fortitude', target_tier: 'basic' },
  Endurance: { target_root: 'Fortitude', target_name: 'Endurance', target_tier: 'specialty' },
  Athletics: { target_root: 'Fortitude', target_name: 'Endurance', target_tier: 'specialty' },
  'Feats of Strength': { target_root: 'Fortitude', target_name: 'Strength', target_tier: 'specialty' },
  Willpower: { target_root: 'Fortitude', target_name: 'Willpower', target_tier: 'basic' },
  // Magic pillars (all map to Expertise (Magic) specialty under Competence)
  Alteration: { target_root: 'Competence', target_name: 'Expertise (Magic)', target_tier: 'specialty' },
  Conjuration: { target_root: 'Competence', target_name: 'Expertise (Magic)', target_tier: 'specialty' },
  Divination: { target_root: 'Competence', target_name: 'Expertise (Magic)', target_tier: 'specialty' },
  Enchantment: { target_root: 'Competence', target_name: 'Expertise (Magic)', target_tier: 'specialty' },
  Illusion: { target_root: 'Competence', target_name: 'Expertise (Magic)', target_tier: 'specialty' },
  Necromancy: { target_root: 'Competence', target_name: 'Expertise (Magic)', target_tier: 'specialty' },
  Transmutation: { target_root: 'Competence', target_name: 'Expertise (Magic)', target_tier: 'specialty' },
};

/**
 * Mastery die rank → focus bonus mapping.
 */
export const MASTERY_TO_FOCUS_BONUS: Record<DieRank, number> = {
  d3: 0,
  d4: 1,
  d6: 2,
  d8: 3,
  d10: 4,
  d12: 5,
};

/**
 * Initiative phase by best Prowess die rank.
 */
export const INITIATIVE_PHASE_BY_RANK: Record<DieRank, number> = {
  d3: 6,
  d12: 1,
  d10: 2,
  d8: 3,
  d6: 4,
  d4: 5,
};
