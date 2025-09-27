// Enhanced Monster data for Eldritch RPG 2nd Edition Monster Generator

export type MonsterCategory = 'Minor' | 'Standard' | 'Exceptional' | 'Legendary';
export type MonsterSize = 'Minuscule' | 'Tiny' | 'Small' | 'Medium' | 'Large' | 'Huge' | 'Gargantuan';
export type MonsterNature = 'Mundane' | 'Magical' | 'Preternatural' | 'Supernatural';
export type CreatureType = 'Normal' | 'Fast' | 'Tough';
export type CreatureTrope = 'Human' | 'Goblinoid' | 'Beast' | 'Undead' | 'Construct' |
                           'Elemental' | 'Aberration' | 'Fey' | 'Dragon' | 'Ooze' | 'Demon';
export type ArmorType = 'None' | 'Hide' | 'Leather' | 'Chain' | 'Plate' | 'Magical';
export type ThreatFocusType = 'Threat' | 'Ranged Threat' | 'Might' | 'Ferocity' | 'Speed';
export type TreasureCacheType = 'Trinkets' | 'Small cache' | 'Cache' | 'Small trove' | 'Trove' | 'Hoard' | 'Dragon\'s hoard';
export type SpecialDefenseType = 'Ethereal' | 'Natural Armor' | 'Immunity to Element' | 'Immunity to Magic' |
                                'Damage Reduction' | 'Spell Resistance' | 'Regeneration' | 'Fast Healing';
export type ExtraAttackType = 'Secondary Attack' | 'Follow-up Attack' | 'Area Effect' | 'Special Ability';

// Enhanced threat dice with focus bonuses
export interface EnhancedThreatDice {
  melee: string;
  natural: string;
  ranged: string;
  arcane: string;
  // Focus bonuses (static +1 to +5 bonuses)
  threatFocus?: number;      // Melee threat bonus
  rangedThreatFocus?: number; // Ranged threat bonus
  mightFocus?: number;       // Damage bonus
  ferocityFocus?: number;    // Damage bonus
  speedFocus?: number;       // Movement bonus
}

// Structured armor and defense system
export interface ArmorDefenseSystem {
  armorDieRank: string;      // d4, d6, d8, d10, d12
  armorDRBonus: number;      // Additional DR bonus (e.g., +2)
  naturalDR?: number;        // Natural toughness bonus
  shieldType: string;        // None, Small, Medium, Large
  shieldDRReduction: number; // Threat reduction from shield
}

// Special abilities and defenses
export interface SpecialAbilities {
  specialDefenses: SpecialDefenseType[];
  extraAttacks: {
    type: ExtraAttackType;
    description: string;
    damage?: string;
    effect?: string;
  }[];
  immunities: string[];
  resistances: string[];
  vulnerabilities: string[];
  specialMovement: string[];
}

// Treasure cache system
export interface TreasureCache {
  cacheType: TreasureCacheType;
  baseValue: { min: number; max: number };
  magicItemChance: number;
  magicItemCount: string;
  description?: string;
}

export interface EnhancedMonster {
  name: string;
  trope: CreatureTrope;
  category: MonsterCategory;
  threatDice: EnhancedThreatDice;
  threatMV: number;
  size: MonsterSize;
  nature: MonsterNature;
  creatureType: CreatureType;
  hitPoints: number;
  activeDefense: number;
  passiveDefense: number;
  multiplier: number;
  savingThrow: string;
  battlePhase: number;
  prowessDie: number;
  weaponReach: string;
  armorDefense: ArmorDefenseSystem;
  specialAbilities: SpecialAbilities;
  treasureCache?: TreasureCache;
  movementFocus: {
    speedFocusBonus: number;
    especiallySpeedy: boolean;
    baseMovement: number;
  };
}

// Legacy interface for backward compatibility
export interface Monster {
  name: string;
  trope: CreatureTrope;
  category: MonsterCategory;
  threatDice: string;
  threatMV: number;
  size: MonsterSize;
  nature: MonsterNature;
  creatureType: CreatureType;
  hitPoints: number;
  activeDefense: number;
  passiveDefense: number;
  multiplier: number;
  savingThrow: string;
  battlePhase: number;
  prowessDie: number;
  weaponReach: string;
  armorType: ArmorType;
  armorBonus: number;
}

// Comprehensive threat dice options (not restricted by category)
export const ALL_THREAT_DICE_OPTIONS = [
  'None',
  // Single dice
  'd2', 'd3', 'd4', 'd6', 'd8', 'd10', 'd12', 'd14', 'd16', 'd18', 'd20',
  // Two dice combinations
  '2d2', '2d3', '2d4', '2d6', '2d8', '2d10', '2d12',
  // Mixed two dice
  'd4+d6', 'd6+d8', 'd8+d10', 'd10+d12',
  // Three dice combinations
  '3d4', '3d6', '3d8', '3d10', '3d12',
  // Mixed three dice
  '2d6+d4', '2d8+d4', '2d10+d6', '2d12+d8',
  // Four+ dice for legendary creatures
  '4d6', '4d8', '4d10', '4d12',
  '3d8+d10', '3d10+d12', '2d12+2d8',
  // Legendary combinations
  '5d8', '5d10', '5d12', '6d10', '6d12',
  '3d12+2d10', '4d12+d20', '6d12', '8d10', '10d12'
];

// Category minimums - at least ONE threat type must meet these requirements
export const CATEGORY_MINIMUM_REQUIREMENTS: Record<MonsterCategory, {
  minDiceCount: number;
  minDieSizeForPrimary: number;
  description: string;
}> = {
  Minor: {
    minDiceCount: 1,
    minDieSizeForPrimary: 4,
    description: 'At least 1 die, minimum d4'
  },
  Standard: {
    minDiceCount: 2,
    minDieSizeForPrimary: 6,
    description: 'At least 2 dice or 1d8+, minimum d6 for primary'
  },
  Exceptional: {
    minDiceCount: 3,
    minDieSizeForPrimary: 8,
    description: 'At least 3 dice or 2d10+, minimum d8 for primary'
  },
  Legendary: {
    minDiceCount: 3,
    minDieSizeForPrimary: 12,
    description: '3+ dice with d12s or 4+ dice combinations'
  }
};

// Legacy system for backward compatibility
export const threatDiceByCategory: Record<MonsterCategory, string[]> = {
  Minor: ['d4', 'd6', 'd8', 'd10', 'd12'],
  Standard: ['2d4', '2d6', '2d8', 'd6+d8', '2d10'],
  Exceptional: ['3d4', '3d6', '3d8', '2d8+d6', '2d10+d6'],
  Legendary: ['3d12', '4d10', '5d8', '3d12+d10', '6d10']
};

export const hpMultipliers: Record<MonsterSize, Record<MonsterNature, number>> = {
  'Minuscule': { 'Mundane': 0.5, 'Magical': 1, 'Preternatural': 1.5, 'Supernatural': 2 },
  'Tiny': { 'Mundane': 0.5, 'Magical': 1, 'Preternatural': 1.5, 'Supernatural': 2 },
  'Small': { 'Mundane': 1, 'Magical': 1.5, 'Preternatural': 2, 'Supernatural': 2.5 },
  'Medium': { 'Mundane': 1, 'Magical': 1.5, 'Preternatural': 2, 'Supernatural': 2.5 },
  'Large': { 'Mundane': 1.5, 'Magical': 2, 'Preternatural': 2.5, 'Supernatural': 3 },
  'Huge': { 'Mundane': 2, 'Magical': 2.5, 'Preternatural': 3, 'Supernatural': 3.5 },
  'Gargantuan': { 'Mundane': 2.5, 'Magical': 3, 'Preternatural': 3.5, 'Supernatural': 4 }
};

// Enhanced armor system with die ranks and bonuses
export const ARMOR_DIE_RANKS = ['None', 'd4', 'd6', 'd8', 'd10', 'd12'];
export const SHIELD_TYPES = ['None', 'Small (-1 Threat)', 'Medium (-2 Threat)', 'Large (-3 Threat)'];

export const ARMOR_DESCRIPTIONS: Record<string, string> = {
  'None': 'No armor protection',
  'd4': 'Light protection (Hide armor, thick clothing)',
  'd6': 'Moderate protection (Leather armor, studded leather)',
  'd8': 'Good protection (Chain mail, scale armor)',
  'd10': 'Heavy protection (Plate armor, full mail)',
  'd12': 'Exceptional protection (Masterwork plate, magical armor)'
};

export const armorBonuses: Record<ArmorType, number> = {
  'None': 0,
  'Hide': 2,
  'Leather': 3,
  'Chain': 4,
  'Plate': 5,
  'Magical': 6
};

// Enhanced threat dice validation
export function validateThreatDiceForCategory(
  threatDice: { melee: string; natural: string; ranged: string; arcane: string },
  category: MonsterCategory
): { isValid: boolean; errors: string[]; primaryThreat?: string } {
  const errors: string[] = [];
  const requirements = CATEGORY_MINIMUM_REQUIREMENTS[category];

  // Parse all threat dice to find the primary (highest) threat
  const threats = {
    melee: parseThreatDiceValue(threatDice.melee),
    natural: parseThreatDiceValue(threatDice.natural),
    ranged: parseThreatDiceValue(threatDice.ranged),
    arcane: parseThreatDiceValue(threatDice.arcane)
  };

  const maxThreat = Math.max(...Object.values(threats));
  const primaryThreatEntry = Object.entries(threats).find(([, value]) => value === maxThreat);
  const primaryThreatType = primaryThreatEntry?.[0];

  if (maxThreat === 0) {
    errors.push('At least one threat type must be specified');
    return { isValid: false, errors };
  }

  // Check if primary threat meets minimum requirements
  const primaryThreatString = threatDice[primaryThreatType as keyof typeof threatDice];
  const diceInfo = parseThreatDiceStructure(primaryThreatString);

  if (diceInfo.totalDice < requirements.minDiceCount && diceInfo.maxDieSize < requirements.minDieSizeForPrimary * 2) {
    errors.push(`${category} category requires ${requirements.description}. Primary threat (${primaryThreatType}: ${primaryThreatString}) doesn't meet requirements.`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    primaryThreat: primaryThreatType
  };
}

// Parse threat dice to get total maximum value
function parseThreatDiceValue(diceString: string): number {
  if (!diceString || diceString === 'None') return 0;

  // Handle complex combinations like '2d8+d6', '3d12+2d10'
  const parts = diceString.split('+');
  let total = 0;

  for (const part of parts) {
    const match = part.trim().match(/(\d+)?d(\d+)/);
    if (match) {
      const count = parseInt(match[1] || '1', 10);
      const sides = parseInt(match[2], 10);
      total += count * sides;
    }
  }

  return total;
}

// Parse threat dice structure for validation
function parseThreatDiceStructure(diceString: string): {
  totalDice: number;
  maxDieSize: number;
  combinations: Array<{ count: number; size: number }>;
} {
  if (!diceString || diceString === 'None') {
    return { totalDice: 0, maxDieSize: 0, combinations: [] };
  }

  const parts = diceString.split('+');
  const combinations: Array<{ count: number; size: number }> = [];
  let totalDice = 0;
  let maxDieSize = 0;

  for (const part of parts) {
    const match = part.trim().match(/(\d+)?d(\d+)/);
    if (match) {
      const count = parseInt(match[1] || '1', 10);
      const size = parseInt(match[2], 10);
      combinations.push({ count, size });
      totalDice += count;
      maxDieSize = Math.max(maxDieSize, size);
    }
  }

  return { totalDice, maxDieSize, combinations };
}

// Treasure generation by creature power
export function generateTreasureForCreature(
  category: MonsterCategory,
  nature: MonsterNature,
  size: MonsterSize
): TreasureCacheType {
  // Base treasure by category
  const treasureByCategory: Record<MonsterCategory, TreasureCacheType[]> = {
    'Minor': ['Trinkets', 'Small cache'],
    'Standard': ['Small cache', 'Cache'],
    'Exceptional': ['Cache', 'Small trove'],
    'Legendary': ['Trove', 'Hoard', 'Dragon\'s hoard']
  };

  // Nature modifies treasure likelihood
  let options = treasureByCategory[category];

  if (nature === 'Supernatural' && category !== 'Minor') {
    // Supernatural creatures tend to have better treasure
    options = options.slice(-1); // Take highest tier
  }

  if (size === 'Gargantuan' || size === 'Huge') {
    // Large creatures accumulate more treasure
    const higherTier = treasureByCategory['Legendary'] || ['Hoard'];
    options = [...options, ...higherTier];
  }

  return options[Math.floor(Math.random() * options.length)];
}

// Export the parsing functions for use in components
export { parseThreatDiceValue };

export const tropeConfig: Record<CreatureTrope, {
  sizeWeights: Record<string, number>;
  natureWeights: Record<string, number>;
}> = {
  Human: {
    sizeWeights: { Small: 1, Medium: 8, Large: 1 },
    natureWeights: { Mundane: 8, Magical: 1, Preternatural: 0.5, Supernatural: 0.25 }
  },
  Goblinoid: {
    sizeWeights: { Small: 2, Medium: 7, Large: 1 },
    natureWeights: { Mundane: 6, Magical: 1, Preternatural: 0.5, Supernatural: 0.25 }
  },
  Beast: {
    sizeWeights: { Tiny: 1, Small: 3, Medium: 5, Large: 3, Huge: 1 },
    natureWeights: { Mundane: 9, Magical: 0.5, Preternatural: 0.5, Supernatural: 0.25 }
  },
  Undead: {
    sizeWeights: { Small: 1, Medium: 6, Large: 2, Huge: 1 },
    natureWeights: { Supernatural: 10 }
  },
  Construct: {
    sizeWeights: { Small: 1, Medium: 5, Large: 3, Huge: 1 },
    natureWeights: { Magical: 10 }
  },
  Elemental: {
    sizeWeights: { Small: 1, Medium: 4, Large: 3, Huge: 2 },
    natureWeights: { Preternatural: 8, Supernatural: 2 }
  },
  Aberration: {
    sizeWeights: { Small: 1, Medium: 4, Large: 3, Huge: 2 },
    natureWeights: { Preternatural: 6, Supernatural: 3, Magical: 1 }
  },
  Fey: {
    sizeWeights: { Tiny: 1, Small: 2, Medium: 6, Large: 1 },
    natureWeights: { Magical: 7, Preternatural: 2, Supernatural: 1 }
  },
  Dragon: {
    sizeWeights: { Medium: 2, Large: 5, Huge: 3, Gargantuan: 1 },
    natureWeights: { Preternatural: 6, Supernatural: 3, Magical: 1 }
  },
  Ooze: {
    sizeWeights: { Small: 2, Medium: 5, Large: 3 },
    natureWeights: { Preternatural: 7, Supernatural: 1, Mundane: 1, Magical: 1 }
  },
  Demon: {
    sizeWeights: { Medium: 4, Large: 4, Huge: 2 },
    natureWeights: { Supernatural: 9, Preternatural: 1 }
  }
};

// Enhanced treasure cache system
export const TREASURE_CACHE_TYPES: Record<TreasureCacheType, TreasureCache> = {
  'Trinkets': {
    cacheType: 'Trinkets',
    baseValue: { min: 1, max: 5 },
    magicItemChance: 1,
    magicItemCount: '1 item',
    description: 'Small personal effects, coins, simple tools'
  },
  'Small cache': {
    cacheType: 'Small cache',
    baseValue: { min: 2, max: 20 },
    magicItemChance: 5,
    magicItemCount: '1 item',
    description: 'Hidden stash, personal savings, small collection'
  },
  'Cache': {
    cacheType: 'Cache',
    baseValue: { min: 20, max: 200 },
    magicItemChance: 10,
    magicItemCount: '1 item',
    description: 'Buried treasure, merchant\'s strongbox, raider\'s loot'
  },
  'Small trove': {
    cacheType: 'Small trove',
    baseValue: { min: 100, max: 500 },
    magicItemChance: 20,
    magicItemCount: 'd2 items',
    description: 'Noble\'s vault, successful merchant\'s savings, adventurer\'s hoard'
  },
  'Trove': {
    cacheType: 'Trove',
    baseValue: { min: 200, max: 2000 },
    magicItemChance: 30,
    magicItemCount: 'd3 items',
    description: 'Bandit king\'s treasury, wizard\'s collection, ancient tomb'
  },
  'Hoard': {
    cacheType: 'Hoard',
    baseValue: { min: 1000, max: 10000 },
    magicItemChance: 40,
    magicItemCount: 'd4 items',
    description: 'Royal treasury, lich\'s accumulation, demon lord\'s spoils'
  },
  'Dragon\'s hoard': {
    cacheType: 'Dragon\'s hoard',
    baseValue: { min: 10000, max: 50000 },
    magicItemChance: 50,
    magicItemCount: 'd8 items',
    description: 'Ancient wyrm\'s legendary collection, god\'s treasury'
  }
};

// Focus bonus ranges by die rank
export const FOCUS_BONUS_RANGES = {
  'd4-d6': { min: 1, max: 1 },
  'd8-d10': { min: 2, max: 2 },
  'd12+': { min: 3, max: 3 },
  'Exceptional': { min: 4, max: 4 },
  'Legendary': { min: 5, max: 5 }
};

// Special defenses by nature
export const SPECIAL_DEFENSES_BY_NATURE: Record<MonsterNature, SpecialDefenseType[]> = {
  'Mundane': ['Natural Armor', 'Damage Reduction'],
  'Magical': ['Spell Resistance', 'Immunity to Element', 'Fast Healing'],
  'Preternatural': ['Ethereal', 'Immunity to Magic', 'Regeneration', 'Damage Reduction'],
  'Supernatural': ['Ethereal', 'Immunity to Magic', 'Immunity to Element', 'Spell Resistance', 'Regeneration']
};

// Common extra attacks by category
export const EXTRA_ATTACKS_BY_CATEGORY: Record<MonsterCategory, string[]> = {
  'Minor': ['Bite follow-up d4', 'Claw swipe d3', 'Tail slap d4'],
  'Standard': ['Multi-attack (2 claws)', 'Bite grapple d6', 'Tail sweep (area)', 'Wing buffet'],
  'Exceptional': ['Devastating combo', 'Area breath weapon', 'Triple strike', 'Spell-like ability'],
  'Legendary': ['Legendary action', 'Mythic power', 'Reality-warping attack', 'Divine intervention']
};

export const monsterNames: Record<CreatureTrope, string[]> = {
  Human: ['Bandit', 'Guard', 'Soldier', 'Cultist', 'Brigand', 'Mercenary', 'Assassin', 'Berserker'],
  Goblinoid: ['Goblin', 'Hobgoblin', 'Bugbear', 'Orc', 'Uruk', 'Worg-rider', 'Shaman', 'Chieftain'],
  Beast: ['Wolf', 'Bear', 'Lion', 'Tiger', 'Boar', 'Eagle', 'Spider', 'Snake', 'Dire Wolf', 'Cave Bear'],
  Undead: ['Skeleton', 'Zombie', 'Ghoul', 'Wight', 'Wraith', 'Specter', 'Lich', 'Vampire', 'Mummy'],
  Construct: ['Golem', 'Automaton', 'Animated Armor', 'Iron Guardian', 'Stone Sentinel', 'Clockwork'],
  Elemental: ['Fire Elemental', 'Water Elemental', 'Air Elemental', 'Earth Elemental', 'Storm Spirit'],
  Aberration: ['Mind Flayer', 'Beholder', 'Aboleth', 'Gibbering Mouther', 'Owlbear', 'Bulezau'],
  Fey: ['Pixie', 'Dryad', 'Satyr', 'Redcap', 'Banshee', 'Will-o-Wisp', 'Treant', 'Unicorn'],
  Dragon: ['Young Dragon', 'Adult Dragon', 'Ancient Dragon', 'Wyrmling', 'Drake', 'Wyvern'],
  Ooze: ['Gelatinous Cube', 'Black Pudding', 'Ochre Jelly', 'Gray Ooze', 'Green Slime'],
  Demon: ['Imp', 'Quasit', 'Succubus', 'Balor', 'Marilith', 'Vrock', 'Hezrou', 'Glabrezu']
};