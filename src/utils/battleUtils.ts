import {
  Combatant,
  CombatantCategory,
  CombatantRole,
  WeaponReach,
  NPCLevel,
  QSBClassification,
  RevitalizeOption,
  npcDefaults,
  qsbDefaults
} from '../data/battleData';

export function rollDie(dieSize: number): number {
  return Math.floor(Math.random() * dieSize) + 1;
}

export function calculateBattlePhase(prowessDie: number): number {
  switch (prowessDie) {
    case 12: return 1;
    case 10: return 2;
    case 8: return 3;
    case 6: return 4;
    default: return 5;
  }
}

export function reachPriority(reach: WeaponReach): number {
  switch (reach) {
    case 'long': return 1;
    case 'medium': return 2;
    case 'short': return 3;
    default: return 4;
  }
}

export function classificationPriority(classification: string): number {
  const priority: Record<string, number> = {
    'Player Adventurer': 1,
    'NPC': 2,
    'Legendary': 3,
    'Exceptional': 4,
    'Standard': 5,
    'Minor': 6
  };
  return priority[classification] || 7;
}

export function sortCombatants(combatants: Combatant[]): Combatant[] {
  return [...combatants].sort((a, b) => {
    if (a.battlePhase !== b.battlePhase) {
      return a.battlePhase - b.battlePhase;
    }
    if (reachPriority(a.weaponReach) !== reachPriority(b.weaponReach)) {
      return reachPriority(a.weaponReach) - reachPriority(b.weaponReach);
    }
    if (classificationPriority(a.classification) !== classificationPriority(b.classification)) {
      return classificationPriority(a.classification) - classificationPriority(b.classification);
    }
    return 0;
  });
}

export function rollArmorDice(armor: string): number {
  if (armor === '0' || armor.startsWith('Natural Armor')) {
    return 0;
  }

  const regex = /^(\d+)d(\d+)$/i;
  const match = armor.match(regex);
  if (!match) {
    return 0;
  }

  const numDice = parseInt(match[1]);
  const dieSize = parseInt(match[2]);
  let total = 0;
  for (let i = 0; i < numDice; i++) {
    total += rollDie(dieSize);
  }
  return total;
}

export function applyThreat(
  combatant: Combatant,
  threatPoints: number,
  armorRoll: number = 0,
  autoRoll: boolean = false
): { combatant: Combatant; defeated: boolean; armorRollResult?: number } {
  const newCombatant = { ...combatant };
  let remainingThreat = threatPoints;
  let armorRollResult: number | undefined;

  // Apply Shield Reduction First
  if (newCombatant.shield > 0) {
    remainingThreat -= newCombatant.shield;
    if (remainingThreat < 0) remainingThreat = 0;
  }

  // Apply Threat to ADP
  if (remainingThreat >= newCombatant.adp) {
    remainingThreat -= newCombatant.adp;
    newCombatant.adp = 0;
  } else {
    newCombatant.adp -= remainingThreat;
    remainingThreat = 0;
  }

  // Apply Armor Mitigation
  if (newCombatant.armor && newCombatant.armor !== '0') {
    if (newCombatant.armor.startsWith('Natural Armor')) {
      // Natural Armor HP increase already applied to PDP
    } else if (autoRoll) {
      armorRollResult = rollArmorDice(newCombatant.armor);
      remainingThreat -= armorRollResult;
    } else {
      remainingThreat -= armorRoll;
    }
  }

  if (remainingThreat < 0) remainingThreat = 0;

  // Apply Remaining Threat to PDP
  if (remainingThreat > 0 && newCombatant.pdp > 0) {
    newCombatant.pdp -= remainingThreat;
  }

  const defeated = newCombatant.pdp <= 0;

  return {
    combatant: newCombatant,
    defeated,
    armorRollResult
  };
}

export function performRevitalize(
  combatant: Combatant,
  option: RevitalizeOption,
  spentSP?: number
): { combatant: Combatant; message: string; success: boolean } {
  const newCombatant = { ...combatant };
  let message = '';
  let success = false;

  switch (option) {
    case 'invigorate': {
      const prowessRoll = rollDie(newCombatant.prowessDie);
      const adpGain = prowessRoll + newCombatant.reactionFocus;
      newCombatant.adp += adpGain;
      if (newCombatant.adp > newCombatant.maxAdp) {
        newCombatant.adp = newCombatant.maxAdp;
      }
      message = `${newCombatant.name} uses Invigorate and gains ${adpGain} ADP (rolled ${prowessRoll}).`;
      success = true;
      break;
    }

    case 'deepRecovery': {
      if (newCombatant.spiritPoints >= 1) {
        const adpGain = newCombatant.prowessDie + newCombatant.reactionFocus;
        newCombatant.adp += adpGain;
        if (newCombatant.adp > newCombatant.maxAdp) {
          newCombatant.adp = newCombatant.maxAdp;
        }
        newCombatant.spiritPoints -= 1;
        message = `${newCombatant.name} uses Deep Recovery, spends 1 SP, and gains ${adpGain} ADP.`;
        success = true;
      } else {
        message = `${newCombatant.name} does not have enough Spirit Points for Deep Recovery.`;
        success = false;
      }
      break;
    }

    case 'steadyRenewal': {
      if (spentSP === undefined || spentSP < 0 || spentSP > newCombatant.spiritPoints) {
        message = `Invalid SP amount for Steady Renewal.`;
        success = false;
        break;
      }

      const maxAdp = newCombatant.maxAdp;
      let adpGain = Math.floor(maxAdp * 0.25);
      adpGain += Math.floor(maxAdp * 0.10 * spentSP);

      newCombatant.adp += adpGain;
      if (newCombatant.adp > maxAdp) {
        newCombatant.adp = maxAdp;
      }
      newCombatant.spiritPoints -= spentSP;
      message = `${newCombatant.name} uses Steady Renewal, spends ${spentSP} SP, and gains ${adpGain} ADP.`;
      success = true;
      break;
    }

    default:
      message = 'Invalid Revitalize option.';
      success = false;
  }

  return { combatant: newCombatant, message, success };
}

export function createCombatant(
  category: CombatantCategory,
  name: string,
  prowessDie: number,
  weaponReach: WeaponReach,
  role: string,
  level?: NPCLevel,
  classification?: QSBClassification,
  customADP?: number,
  customPDP?: number,
  armor: string = '0',
  shield: number = 0,
  reactionFocus: number = 0,
  spiritPoints: number = 0,
  npcDetail?: string
): Combatant {
  let adp: number, pdp: number, classificationName: string;

  switch (category) {
    case 'pa':
      adp = customADP || 15;
      pdp = customPDP || 10;
      classificationName = 'Player Adventurer';
      break;

    case 'npc':
      if (level && npcDefaults[level]) {
        const defaults = npcDefaults[level];
        adp = customADP || defaults.adp;
        pdp = customPDP || defaults.pdp;
      } else {
        adp = customADP || 15;
        pdp = customPDP || 10;
      }
      classificationName = 'NPC';
      break;

    case 'qsb':
      if (classification && qsbDefaults[classification]) {
        const defaults = qsbDefaults[classification];
        adp = customADP || defaults.adp;
        pdp = customPDP || defaults.pdp;
        classificationName = classification;
      } else {
        adp = customADP || 10;
        pdp = customPDP || 5;
        classificationName = 'Standard';
      }
      break;

    default:
      adp = 15;
      pdp = 10;
      classificationName = 'Unknown';
  }

  // Apply natural armor bonus to PDP
  if (armor.startsWith('Natural Armor')) {
    const bonus = parseInt(armor.replace('Natural Armor +', '')) || 0;
    pdp += bonus;
  }

  const battlePhase = calculateBattlePhase(prowessDie);

  return {
    id: Date.now() + Math.random(), // Ensure uniqueness
    category,
    name,
    prowessDie,
    weaponReach,
    adp,
    pdp,
    maxAdp: adp,
    armor,
    shield,
    battlePhase,
    reactionFocus,
    spiritPoints,
    role: role as CombatantRole,
    classification: classificationName,
    npcDetail
  };
}

export function restoreAllADP(combatants: Combatant[]): Combatant[] {
  return combatants.map(combatant => ({
    ...combatant,
    adp: combatant.maxAdp
  }));
}

export function clearHostileCombatants(combatants: Combatant[]): Combatant[] {
  return combatants.filter(c => c.role.toLowerCase() !== 'hostile');
}

export function exportBattleToMarkdown(
  combatants: Combatant[],
  defeatedCombatants: Combatant[],
  round: number
): string {
  const sortedCombatants = sortCombatants(combatants);

  let markdown = `# Battle Phase Calculator - Round ${round}\n\n`;

  if (sortedCombatants.length > 0) {
    markdown += `## Active Combatants (Initiative Order)\n\n`;
    markdown += `| Name | BP | Reach | ADP | PDP | Armor | Role |\n`;
    markdown += `|------|----|----|-----|-----|-------|------|\n`;

    sortedCombatants.forEach(combatant => {
      markdown += `| ${combatant.name} | ${combatant.battlePhase} | ${combatant.weaponReach} | ${combatant.adp}/${combatant.maxAdp} | ${combatant.pdp} | ${combatant.armor} | ${combatant.role} |\n`;
    });

    markdown += '\n';
  }

  if (defeatedCombatants.length > 0) {
    markdown += `## Defeated Combatants\n\n`;
    defeatedCombatants.forEach(combatant => {
      markdown += `- ${combatant.name} (${combatant.classification})\n`;
    });
    markdown += '\n';
  }

  markdown += `---\n*Generated with Eldritch GM Tools*`;

  return markdown;
}