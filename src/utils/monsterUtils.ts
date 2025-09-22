// Official Eldritch RPG Monster/QSB Construction Utilities

import {
  CreatureCategory,
  CreatureNature,
  CreatureSize,
  DefenseSplit,
  ThreatType,
  ThreatDice,
  MovementCalculation
} from '../types/party';

// Size Modifiers (for HP calculation)
export const SIZE_MODIFIERS: Record<CreatureSize, number> = {
  'Minuscule': 0,
  'Tiny': 0,
  'Small': 1,
  'Medium': 1,
  'Large': 2,
  'Huge': 3,
  'Gargantuan': 4
};

// Nature Modifiers (for HP calculation)
export const NATURE_MODIFIERS: Record<CreatureNature, number> = {
  'Mundane': 1,
  'Magical': 2,
  'Preternatural': 3,
  'Supernatural': 4
};

// Movement Size Modifiers (per phase)
export const MOVEMENT_SIZE_MODIFIERS: Record<CreatureSize, number> = {
  'Minuscule': -1,
  'Tiny': -1,
  'Small': -1,
  'Medium': 0,
  'Large': 1,
  'Huge': 2,
  'Gargantuan': 3
};

// Parse threat dice string to get maximum value
export function parseThreatDice(diceString: string): number {
  if (!diceString || diceString === 'None') return 0;

  // Handle formats like "2d8", "3d12", "1d6"
  const match = diceString.match(/(\d+)d(\d+)/);
  if (match) {
    const count = parseInt(match[1], 10);
    const sides = parseInt(match[2], 10);
    return count * sides;
  }

  // Handle single die like "d8"
  const singleMatch = diceString.match(/d(\d+)/);
  if (singleMatch) {
    return parseInt(singleMatch[1], 10);
  }

  return 0;
}

// Determine creature category based on threat dice
export function determineCreatureCategory(threatDice: ThreatDice): CreatureCategory {
  const maxMV = Math.max(
    parseThreatDice(threatDice.melee),
    parseThreatDice(threatDice.natural),
    parseThreatDice(threatDice.ranged),
    parseThreatDice(threatDice.arcane)
  );

  // Count total dice to determine if legendary
  const totalDiceCount = Object.values(threatDice).reduce((total, diceStr) => {
    if (!diceStr || diceStr === 'None') return total;
    const match = diceStr.match(/(\d+)d\d+/);
    return total + (match ? parseInt(match[1], 10) : 1);
  }, 0);

  if (totalDiceCount >= 3 && maxMV > 36) return 'Legendary';
  if (maxMV > 24) return 'Exceptional';
  if (maxMV > 12) return 'Standard';
  return 'Minor';
}

// Get primary threat type (highest MV)
export function getPrimaryThreatType(threatDice: ThreatDice): ThreatType {
  const threatValues = {
    'Melee': parseThreatDice(threatDice.melee),
    'Natural': parseThreatDice(threatDice.natural),
    'Ranged': parseThreatDice(threatDice.ranged),
    'Arcane': parseThreatDice(threatDice.arcane)
  };

  return Object.entries(threatValues).reduce((max, [type, value]) =>
    value > threatValues[max] ? type as ThreatType : max
  , 'Melee' as ThreatType);
}

// Calculate Hit Points using official QSB formula
export function calculateMonsterHP(
  baseThreatMV: number,
  size: CreatureSize,
  nature: CreatureNature,
  defenseSplit: DefenseSplit = 'Regular'
): {
  base_hp: number;
  size_modifier: number;
  nature_modifier: number;
  hp_multiplier: number;
  final_hp: number;
  active_hp: number;
  passive_hp: number;
} {
  const sizeModifier = SIZE_MODIFIERS[size];
  const natureModifier = NATURE_MODIFIERS[nature];

  // HP Multiplier = (Size Modifier + Nature Modifier) ÷ 2
  const hpMultiplier = (sizeModifier + natureModifier) / 2;

  // Total HP = ceil(Base HP × HP Multiplier)
  const finalHP = Math.ceil(baseThreatMV * hpMultiplier);

  // Apply defense split
  let activeHP: number, passiveHP: number;
  switch (defenseSplit) {
    case 'Fast': // 75% Active / 25% Passive
      activeHP = Math.ceil(finalHP * 0.75);
      passiveHP = Math.floor(finalHP * 0.25);
      break;
    case 'Tough': // 25% Active / 75% Passive
      activeHP = Math.floor(finalHP * 0.25);
      passiveHP = Math.ceil(finalHP * 0.75);
      break;
    case 'Regular': // 50% Active / 50% Passive
    default:
      activeHP = Math.ceil(finalHP * 0.5);
      passiveHP = Math.floor(finalHP * 0.5);
      break;
  }

  return {
    base_hp: baseThreatMV,
    size_modifier: sizeModifier,
    nature_modifier: natureModifier,
    hp_multiplier: hpMultiplier,
    final_hp: finalHP,
    active_hp: activeHP,
    passive_hp: passiveHP
  };
}

// Calculate Movement Rate using official formula
export function calculateMovementRate(
  battlePhaseMV: number,
  size: CreatureSize,
  agilityMV: number = 0,
  speedModifiers: string[] = []
): MovementCalculation {
  // Base Movement Formula: (12 + BP MV [+ Agility MV]) ÷ 5
  const baseMovement = (12 + battlePhaseMV + agilityMV) / 5;

  // Round up if has Agility specialty, down if not
  const hasAgilitySpecialty = agilityMV > 0;
  const roundedBase = hasAgilitySpecialty ? Math.ceil(baseMovement) : Math.floor(baseMovement);

  // Apply size modifier
  const sizeModifier = MOVEMENT_SIZE_MODIFIERS[size];
  let finalMovement = roundedBase + sizeModifier;

  // Apply speed modifiers
  speedModifiers.forEach(modifier => {
    switch (modifier) {
      case 'Fast':
        finalMovement += 1;
        break;
      case 'Especially Speedy':
        finalMovement += 4; // Replaces Fast
        break;
      case 'Speed Focus d4-d6':
        finalMovement += 1;
        break;
      case 'Speed Focus d8-d10':
        finalMovement += 2;
        break;
      case 'Speed Focus d12+':
        finalMovement += 3;
        break;
    }
  });

  // Minimum 1 square per phase
  finalMovement = Math.max(1, finalMovement);

  return {
    base_movement_per_phase: roundedBase,
    battle_phase_mv: battlePhaseMV,
    agility_mv: agilityMV,
    size_modifier: sizeModifier,
    speed_modifiers: speedModifiers,
    final_movement_per_phase: finalMovement
  };
}

// Generate appropriate Battle Phase die based on creature category
export function generateBattlePhase(category: CreatureCategory, nature: CreatureNature): string {
  const baseRanks = {
    'Minor': ['d4', 'd6'],
    'Standard': ['d6', 'd8'],
    'Exceptional': ['d8', 'd10'],
    'Legendary': ['d10', 'd12', 'd14', 'd16']
  };

  const ranks = baseRanks[category];

  // Nature can influence battle phase (supernatural creatures tend to be faster)
  if (nature === 'Supernatural' && category !== 'Minor') {
    return ranks[ranks.length - 1]; // Use highest rank
  }

  // Random selection from appropriate range
  return ranks[Math.floor(Math.random() * ranks.length)];
}

// Generate appropriate Saving Throw die
export function generateSavingThrow(category: CreatureCategory, nature: CreatureNature): string {
  const baseRanks = {
    'Minor': ['d4', 'd6'],
    'Standard': ['d6', 'd8'],
    'Exceptional': ['d8', 'd10'],
    'Legendary': ['d12', 'd14', 'd16', 'd20', 'd30']
  };

  const ranks = baseRanks[category];

  // Nature influences saving throws (preternatural and supernatural are more resilient)
  if ((nature === 'Preternatural' || nature === 'Supernatural') && ranks.length > 1) {
    return ranks[ranks.length - 1];
  }

  return ranks[Math.floor(Math.random() * ranks.length)];
}

// Common creature tropes based on nature and category
export const CREATURE_TROPES: Record<CreatureNature, string[]> = {
  'Mundane': [
    'human-soldier', 'human-bandit', 'human-guard', 'human-cultist',
    'wolf-pack', 'bear', 'boar', 'hawk', 'snake'
  ],
  'Magical': [
    'fey-sprite', 'fey-dryad', 'elemental-fire', 'elemental-water',
    'elemental-earth', 'elemental-air', 'wizard', 'sorcerer', 'druid'
  ],
  'Preternatural': [
    'undead-skeleton', 'undead-zombie', 'undead-ghost', 'undead-wight',
    'werewolf', 'vampire', 'shapeshifter', 'nightmare', 'shadow'
  ],
  'Supernatural': [
    'angel', 'demon', 'devil', 'titan', 'elder-dragon',
    'god-avatar', 'primordial', 'archfey', 'lich-lord'
  ]
};

// Get suggested tropes for nature/category combination
export function getSuggestedTropes(nature: CreatureNature, category: CreatureCategory): string[] {
  const baseTropes = CREATURE_TROPES[nature] || [];

  // Filter by category appropriateness
  if (category === 'Legendary') {
    return baseTropes.filter(trope =>
      trope.includes('elder') || trope.includes('lord') ||
      trope.includes('god') || trope.includes('titan') ||
      trope.includes('primordial')
    );
  }

  return baseTropes;
}