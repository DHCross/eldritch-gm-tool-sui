// Enhanced Eldritch RPG Monster/QSB Construction Utilities

import {
  CreatureCategory,
  CreatureNature,
  CreatureSize,
  DefenseSplit,
  ThreatType,
  ThreatDice,
  MovementCalculation
} from '../types/party';
import {
  EnhancedThreatDice,
  ArmorDefenseSystem,
  SpecialAbilities,
  TreasureCache,
  TREASURE_CACHE_TYPES,
  FOCUS_BONUS_RANGES,
  SPECIAL_DEFENSES_BY_NATURE,
  EXTRA_ATTACKS_BY_CATEGORY,
  generateTreasureForCreature,
  ALL_THREAT_DICE_OPTIONS,
  validateThreatDiceForCategory,
  parseThreatDiceValue
} from '../data/monsterData';

type EncounterRole = 'minion' | 'boss' | 'ambush' | 'elite' | 'brute' | 'caster';

const ROLE_PRIORITY: EncounterRole[] = ['minion', 'ambush', 'elite', 'brute', 'caster', 'boss'];

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

// Enhanced threat dice parsing with complex combinations
export function parseThreatDice(diceString: string): number {
  return parseThreatDiceValue(diceString);
}

export interface ThreatDiceSummary {
  primary: ThreatType | 'None';
  secondary: ThreatType[];
  totalMaxDamage: number;
  focusBonuses: string[];
}

export function getThreatDiceSummary(threatDice: EnhancedThreatDice): ThreatDiceSummary {
  const threatEntries = (
    [
      { key: 'melee', label: 'Melee' as ThreatType },
      { key: 'natural', label: 'Natural' as ThreatType },
      { key: 'ranged', label: 'Ranged' as ThreatType },
      { key: 'arcane', label: 'Arcane' as ThreatType }
    ] as const
  ).map(entry => ({
    ...entry,
    value: parseThreatDice(threatDice[entry.key])
  }));

  const sortedByValue = threatEntries
    .filter(entry => entry.value > 0)
    .sort((a, b) => b.value - a.value);

  const primary = sortedByValue[0]?.label ?? 'None';
  const secondary = sortedByValue.slice(1).map(entry => entry.label);
  const totalMaxDamage = sortedByValue.reduce((sum, entry) => sum + entry.value, 0);

  const focusMap: Array<{ label: string; value?: number }> = [
    { label: 'Threat', value: threatDice.threatFocus },
    { label: 'Ranged', value: threatDice.rangedThreatFocus },
    { label: 'Might', value: threatDice.mightFocus },
    { label: 'Ferocity', value: threatDice.ferocityFocus },
    { label: 'Speed', value: threatDice.speedFocus }
  ];

  const focusBonuses = focusMap
    .filter(item => typeof item.value === 'number' && item.value !== undefined && item.value > 0)
    .map(item => `${item.label} +${item.value}`);

  return {
    primary,
    secondary,
    totalMaxDamage,
    focusBonuses
  };
}

// Get available threat dice options (not restricted by category)
export function getAvailableThreatDiceOptions(): string[] {
  return ALL_THREAT_DICE_OPTIONS;
}

// Get suggested threat dice for a category (helpful hints)
export function getSuggestedThreatDiceForCategory(category: CreatureCategory): string[] {
  switch (category) {
    case 'Minor':
      return ['None', 'd4', 'd6', 'd8', 'd10', 'd12'];
    case 'Standard':
      return ['None', 'd8', 'd10', 'd12', '2d4', '2d6', '2d8', 'd6+d8'];
    case 'Exceptional':
      return ['None', 'd12', '2d8', '2d10', '3d6', '3d8', '2d8+d6', '2d10+d6'];
    case 'Legendary':
      return ['None', '3d8', '3d10', '3d12', '4d8', '4d10', '3d12+d10', '5d8', '6d10'];
    default:
      return ['None'];
  }
}

// Validate if threat dice combination is valid for category
export function isValidThreatDiceForCategory(
  threatDice: { melee: string; natural: string; ranged: string; arcane: string },
  category: CreatureCategory
): { isValid: boolean; errors: string[]; suggestions?: string[] } {
  const validation = validateThreatDiceForCategory(threatDice, category);

  if (!validation.isValid) {
    return {
      isValid: false,
      errors: validation.errors,
      suggestions: getSuggestedThreatDiceForCategory(category)
    };
  }

  return { isValid: true, errors: [] };
}

// Enhanced creature category determination with flexible dice
export function determineCreatureCategory(threatDice: ThreatDice): CreatureCategory {
  const maxMV = Math.max(
    parseThreatDice(threatDice.melee),
    parseThreatDice(threatDice.natural),
    parseThreatDice(threatDice.ranged),
    parseThreatDice(threatDice.arcane)
  );

  // Count total dice across all threat types
  const totalDiceCount = Object.values(threatDice).reduce((total, diceStr) => {
    if (!diceStr || diceStr === 'None') return total;

    // Handle complex combinations like '2d8+d6'
    const parts = diceStr.split('+');
    let diceCount = 0;
    for (const part of parts) {
      const match = part.trim().match(/(\d+)?d\d+/);
      if (match) {
        diceCount += parseInt(match[1] || '1', 10);
      }
    }
    return total + diceCount;
  }, 0);

  // Enhanced category determination logic
  // Legendary: High dice count OR very high maximum values
  if (totalDiceCount >= 5 || maxMV >= 60 || (totalDiceCount >= 3 && maxMV >= 36)) {
    return 'Legendary';
  }

  // Exceptional: Moderate dice count with good values
  if (totalDiceCount >= 3 || maxMV >= 24 || (totalDiceCount >= 2 && maxMV >= 20)) {
    return 'Exceptional';
  }

  // Standard: Multiple dice or decent single die
  if (totalDiceCount >= 2 || maxMV >= 10) {
    return 'Standard';
  }

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

export function determineThreatRoles(
  threatMV: number,
  primaryType: ThreatType
): EncounterRole[] {
  const roles = new Set<EncounterRole>();

  if (threatMV <= 12) {
    roles.add('minion');
  }

  if (threatMV > 12) {
    roles.add('elite');
  }

  if (threatMV >= 30) {
    roles.add('boss');
  }

  switch (primaryType) {
    case 'Melee':
      if (threatMV >= 16) {
        roles.add('brute');
      } else {
        roles.add('minion');
      }
      break;
    case 'Natural':
      if (threatMV <= 12) {
        roles.add('ambush');
      } else {
        roles.add('brute');
      }
      break;
    case 'Ranged':
      roles.add('ambush');
      if (threatMV >= 24) {
        roles.add('elite');
      }
      break;
    case 'Arcane':
      roles.add('caster');
      if (threatMV >= 24) {
        roles.add('boss');
      } else {
        roles.add('elite');
      }
      break;
  }

  if (roles.size === 0) {
    roles.add('elite');
  }

  return ROLE_PRIORITY.filter(role => roles.has(role));
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
// Enhanced HP calculation with explicit source breakdown
export function calculateEnhancedMonsterHP(
  baseThreatMV: number,
  size: CreatureSize,
  nature: CreatureNature,
  defenseSplit: DefenseSplit = 'Regular',
  armorDefense?: ArmorDefenseSystem
): {
  base_hp: number;
  size_modifier: number;
  nature_modifier: number;
  hp_multiplier: number;
  armor_bonus: number;
  final_hp: number;
  active_hp: number;
  passive_hp: number;
  breakdown: string;
} {
  const sizeModifier = SIZE_MODIFIERS[size];
  const natureModifier = NATURE_MODIFIERS[nature];
  const armorBonus = armorDefense ? (armorDefense.naturalDR || 0) : 0;

  // HP Multiplier = (Size Modifier + Nature Modifier) ÷ 2
  const hpMultiplier = (sizeModifier + natureModifier) / 2;

  // Total HP = ceil(Base HP × HP Multiplier) + Armor Bonus
  const baseTotal = Math.ceil(baseThreatMV * hpMultiplier);
  const finalHP = baseTotal + armorBonus;

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

  const breakdown = `Base HP: ${baseThreatMV} | Size: +${sizeModifier} | Nature: +${natureModifier} | Multiplier: ×${hpMultiplier.toFixed(2)} | Armor: +${armorBonus} | Total: ${finalHP} (${activeHP}/${passiveHP})`;

  return {
    base_hp: baseThreatMV,
    size_modifier: sizeModifier,
    nature_modifier: natureModifier,
    hp_multiplier: hpMultiplier,
    armor_bonus: armorBonus,
    final_hp: finalHP,
    active_hp: activeHP,
    passive_hp: passiveHP,
    breakdown
  };
}

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

// Enhanced Focus Bonus Calculation
export function calculateFocusBonus(
  dieRank: string,
  category: CreatureCategory,
  focusType: 'threat' | 'ranged-threat' | 'might' | 'ferocity' | 'speed'
): number {
  // Determine tier based on die rank
  let tier: keyof typeof FOCUS_BONUS_RANGES;

  if (dieRank.includes('d4') || dieRank.includes('d6')) {
    tier = 'd4-d6';
  } else if (dieRank.includes('d8') || dieRank.includes('d10')) {
    tier = 'd8-d10';
  } else if (dieRank.includes('d12')) {
    tier = 'd12+';
  } else {
    tier = 'd4-d6'; // default
  }

  // Exceptional and Legendary creatures get higher bonuses
  if (category === 'Exceptional') {
    tier = 'Exceptional';
  } else if (category === 'Legendary') {
    tier = 'Legendary';
  }

  const range = FOCUS_BONUS_RANGES[tier];
  const baseValue = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;

  const focusAdjustments: Record<typeof focusType, number> = {
    threat: 0,
    'ranged-threat': 0,
    might: 1,
    ferocity: 1,
    speed: -1
  };

  const adjustedValue = baseValue + focusAdjustments[focusType];
  return Math.max(range.min, Math.min(range.max, adjustedValue));
}

// Enhanced Threat Dice with Focus Bonuses
export function generateEnhancedThreatDice(
  baseThreatDice: ThreatDice,
  category: CreatureCategory,
  includeThreeFocus = false
): EnhancedThreatDice {
  const enhanced: EnhancedThreatDice = {
    melee: baseThreatDice.melee,
    natural: baseThreatDice.natural,
    ranged: baseThreatDice.ranged,
    arcane: baseThreatDice.arcane
  };

  // Add focus bonuses for highly capable opponents
  if (category === 'Standard' || category === 'Exceptional' || category === 'Legendary') {
    // Threat Focus (for melee)
    if (baseThreatDice.melee !== 'None') {
      enhanced.threatFocus = calculateFocusBonus(baseThreatDice.melee, category, 'threat');
    }

    // Ranged Threat Focus
    if (baseThreatDice.ranged !== 'None') {
      enhanced.rangedThreatFocus = calculateFocusBonus(baseThreatDice.ranged, category, 'ranged-threat');
    }

    // Might/Ferocity for damage bonuses
    if (category === 'Exceptional' || category === 'Legendary') {
      enhanced.mightFocus = calculateFocusBonus('d8', category, 'might');
      enhanced.ferocityFocus = calculateFocusBonus('d8', category, 'ferocity');
    }

    // Speed focus for movement
    if (includeThreeFocus) {
      enhanced.speedFocus = calculateFocusBonus('d6', category, 'speed');
    }
  }

  return enhanced;
}

// Enhanced Armor Defense System
export function generateArmorDefenseSystem(
  category: CreatureCategory,
  nature: CreatureNature,
  size: CreatureSize
): ArmorDefenseSystem {
  // Base armor by category
  const armorByCategory: Record<CreatureCategory, string[]> = {
    'Minor': ['None', 'd4'],
    'Standard': ['d4', 'd6'],
    'Exceptional': ['d6', 'd8', 'd10'],
    'Legendary': ['d8', 'd10', 'd12']
  };

  // Natural armor by nature
  const naturalDRByNature: Record<CreatureNature, number> = {
    'Mundane': 0,
    'Magical': 1,
    'Preternatural': 2,
    'Supernatural': 3
  };

  const baseArmor = armorByCategory[category];
  const armorDieRank = baseArmor[Math.floor(Math.random() * baseArmor.length)];

  // Size affects natural DR
  const sizeBonus = {
    'Minuscule': 0, 'Tiny': 0, 'Small': 0, 'Medium': 0,
    'Large': 1, 'Huge': 2, 'Gargantuan': 3
  }[size] || 0;

  return {
    armorDieRank,
    armorDRBonus: Math.floor(Math.random() * 3), // 0-2 additional DR
    naturalDR: naturalDRByNature[nature] + sizeBonus,
    shieldType: Math.random() > 0.7 ? 'Small (-1 Threat)' : 'None',
    shieldDRReduction: Math.random() > 0.7 ? 1 : 0
  };
}

// Generate Special Abilities
export function generateSpecialAbilities(
  category: CreatureCategory,
  nature: CreatureNature
): SpecialAbilities {
  const abilities: SpecialAbilities = {
    specialDefenses: [],
    extraAttacks: [],
    immunities: [],
    resistances: [],
    vulnerabilities: [],
    specialMovement: []
  };

  // Special defenses by nature
  const availableDefenses = SPECIAL_DEFENSES_BY_NATURE[nature] || [];
  const defenseCount = {
    'Minor': 0,
    'Standard': 1,
    'Exceptional': 2,
    'Legendary': 3
  }[category];

  for (let i = 0; i < defenseCount && availableDefenses.length > 0; i++) {
    const defense = availableDefenses[Math.floor(Math.random() * availableDefenses.length)];
    if (!abilities.specialDefenses.includes(defense)) {
      abilities.specialDefenses.push(defense);
    }
  }

  // Extra attacks
  const extraAttackOptions = EXTRA_ATTACKS_BY_CATEGORY[category] || [];
  if (extraAttackOptions.length > 0 && Math.random() > 0.5) {
    const attack = extraAttackOptions[Math.floor(Math.random() * extraAttackOptions.length)];
    abilities.extraAttacks.push({
      type: 'Secondary Attack',
      description: attack,
      damage: category === 'Minor' ? 'd4' : category === 'Standard' ? 'd6' : 'd8'
    });
  }

  // Nature-specific immunities (based on common creature types)
  if (nature === 'Preternatural') {
    // Many preternatural creatures (like undead) have immunities
    abilities.immunities = ['poison', 'disease'];
    if (Math.random() > 0.5) {
      abilities.immunities.push('charm', 'sleep');
    }
  } else if (nature === 'Magical') {
    // Magical creatures often have resistances
    if (Math.random() > 0.7) {
      abilities.resistances = ['magic damage'];
    }
  } else if (nature === 'Supernatural') {
    // Supernatural beings often have broad immunities
    abilities.immunities = ['poison', 'disease', 'charm'];
    abilities.resistances = ['physical damage'];
  }

  return abilities;
}

// Enhanced Movement Focus Integration
export function calculateEnhancedMovement(
  battlePhaseMV: number,
  size: CreatureSize,
  speedFocusBonus: number = 0,
  especiallySpeedy: boolean = false
): {
  baseMovement: number;
  speedFocusBonus: number;
  especiallySpeedy: boolean;
  finalMovement: number;
  movementActions: Record<string, { squares: number; penalty: string }>;
} {
  // Base Movement Formula: (12 + BP MV) ÷ 5
  const baseMovement = Math.floor((12 + battlePhaseMV) / 5);

  // Size modifier
  const sizeModifier = MOVEMENT_SIZE_MODIFIERS[size];

  // Apply speed focus bonus (derived from die ranks)
  let finalMovement = baseMovement + sizeModifier + speedFocusBonus;

  // Especially Speedy trait
  if (especiallySpeedy) {
    finalMovement += 2; // Additional bonus for especially speedy creatures
  }

  finalMovement = Math.max(1, finalMovement);

  // Calculate movement action multipliers
  const movementActions: Record<string, { squares: number; penalty: string }> = {
    Walk: { squares: finalMovement, penalty: 'None' },
    Run: {
      squares: finalMovement * (especiallySpeedy ? 3 : 2),
      penalty: '-3 Threat Points to attacks'
    },
    Sprint: {
      squares: finalMovement * (especiallySpeedy ? 5 : 4),
      penalty: 'No other actions permitted'
    }
  };

  if (especiallySpeedy) {
    movementActions['Burst'] = {
      squares: finalMovement * 7,
      penalty: 'Lasts 1 phase, must rest 1 round'
    };
  }

  return {
    baseMovement,
    speedFocusBonus,
    especiallySpeedy,
    finalMovement,
    movementActions
  };
}

export function generateEnhancedQSBString(
  name: string,
  category: CreatureCategory,
  threatDice: EnhancedThreatDice,
  hpCalc: ReturnType<typeof calculateEnhancedMonsterHP>,
  armorDefense: ArmorDefenseSystem,
  battlePhase: string,
  savingThrow: string,
  movement: ReturnType<typeof calculateEnhancedMovement>,
  specialAbilities: SpecialAbilities,
  treasureCache?: TreasureCache,
  notes?: string
): string {
  const threatDiceString = `Melee ${threatDice.melee} | Natural ${threatDice.natural} | Ranged ${threatDice.ranged} | Arcane ${threatDice.arcane}`;

  const focusParts = [
    threatDice.threatFocus ? `Threat +${threatDice.threatFocus}` : undefined,
    threatDice.rangedThreatFocus ? `Ranged +${threatDice.rangedThreatFocus}` : undefined,
    threatDice.mightFocus ? `Might +${threatDice.mightFocus}` : undefined,
    threatDice.ferocityFocus ? `Ferocity +${threatDice.ferocityFocus}` : undefined,
    threatDice.speedFocus ? `Speed +${threatDice.speedFocus}` : undefined
  ].filter(Boolean);

  const armorPieces = [
    armorDefense.armorDieRank !== 'None' ? `${armorDefense.armorDieRank}` : 'No Armor Die',
    armorDefense.armorDRBonus ? `DR Bonus +${armorDefense.armorDRBonus}` : undefined,
    armorDefense.naturalDR ? `Natural DR +${armorDefense.naturalDR}` : undefined,
    armorDefense.shieldType !== 'None'
      ? `${armorDefense.shieldType} Shield${armorDefense.shieldDRReduction ? ` (-${armorDefense.shieldDRReduction})` : ''}`
      : undefined
  ].filter(Boolean);

  const movementOrder: Array<keyof typeof movement.movementActions> = ['Walk', 'Run', 'Sprint', 'Burst'];
  const movementDetails = movementOrder
    .filter(action => movement.movementActions[action])
    .map(action => {
      const detail = movement.movementActions[action];
      return `${action}: ${detail.squares} sq (${detail.penalty})`;
    })
    .join(' | ');

  const specialDefenseString = specialAbilities.specialDefenses.length > 0
    ? specialAbilities.specialDefenses.join(', ')
    : 'None';
  const extraAttacksString = specialAbilities.extraAttacks.length > 0
    ? specialAbilities.extraAttacks.map(attack => `${attack.type}${attack.description ? ` (${attack.description})` : ''}`).join('; ')
    : 'None';
  const immunitiesString = specialAbilities.immunities.length > 0 ? specialAbilities.immunities.join(', ') : 'None';
  const resistancesString = specialAbilities.resistances.length > 0 ? specialAbilities.resistances.join(', ') : 'None';
  const vulnerabilitiesString = specialAbilities.vulnerabilities.length > 0 ? specialAbilities.vulnerabilities.join(', ') : 'None';
  const specialMovementString = specialAbilities.specialMovement.length > 0 ? specialAbilities.specialMovement.join(', ') : 'None';

  const treasureString = treasureCache
    ? `${treasureCache.cacheType} ($${treasureCache.baseValue.min}-${treasureCache.baseValue.max}, ${treasureCache.magicItemChance}% chance, ${treasureCache.magicItemCount} magic items${treasureCache.description ? `; ${treasureCache.description}` : ''})`
    : 'None';

  const sanitizedNotes = notes && notes.trim().length > 0 ? notes : 'None';

  const focusLine = focusParts.length > 0 ? focusParts.join(', ') : 'None';
  const armorLine = armorPieces.length > 0 ? armorPieces.join(', ') : 'None';

  return [
    `${name || '[Monster Name]'}`,
    `CAT: ${category} | ST: ${savingThrow} | BP: ${battlePhase}`,
    `THREAT: ${threatDiceString}`,
    `FOCUS: ${focusLine}`,
    `HP: ${hpCalc.final_hp} (${hpCalc.active_hp}/${hpCalc.passive_hp}) | ${hpCalc.breakdown}`,
    `ARMOR: ${armorLine}`,
    `MOVE: ${movement.finalMovement} sq/phase | ${movementDetails}`,
    `SPECIAL DEFENSES: ${specialDefenseString}`,
    `EXTRA ATTACKS: ${extraAttacksString}`,
    `IMMUNITIES: ${immunitiesString}`,
    `RESISTANCES: ${resistancesString}`,
    `VULNERABILITIES: ${vulnerabilitiesString}`,
    `SPECIAL MOVEMENT: ${specialMovementString}`,
    `TREASURE: ${treasureString}`,
    `NOTES: ${sanitizedNotes}`
  ].join('\n');
}

// Generate Treasure Cache
export function generateTreasureCache(
  category: CreatureCategory,
  nature: CreatureNature,
  size: CreatureSize
): TreasureCache {
  const cacheType = generateTreasureForCreature(category, nature, size);
  return TREASURE_CACHE_TYPES[cacheType];
}

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