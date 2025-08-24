// Comprehensive game data for Eldritch RPG

// Battle Phases based on Prowess
export const BATTLE_PHASES = {
  'd12': { phase: 1, initiativeRange: '12+' },
  'd10': { phase: 2, initiativeRange: '9-11' },
  'd8': { phase: 3, initiativeRange: '7-8' },
  'd6': { phase: 4, initiativeRange: '5-6' },
  'd4': { phase: 5, initiativeRange: '1-4' }
} as const;

// Challenge Difficulties
export const CHALLENGE_DIFFICULTIES = {
  Easy: { base: 'd4', withDisadvantage: '2d4' },
  Moderate: { base: 'd6', withDisadvantage: '2d6' },
  Difficult: { base: 'd8', withDisadvantage: '2d8' },
  Demanding: { base: 'd10', withDisadvantage: '2d10' },
  Formidable: { base: 'd12', withDisadvantage: '2d12' }
} as const;

// Spell System Tables
export const SPELL_CHALLENGE_TABLE = {
  Common: { challenge: 'd0', maintenancePenalty: 0 },
  Uncommon: { challenge: 'd6', maintenancePenalty: -2 },
  Esoteric: { challenge: 'd8', maintenancePenalty: -3 },
  Occult: { challenge: 'd10', maintenancePenalty: -4 },
  Legendary: { challenge: 'd12', maintenancePenalty: -5 }
} as const;

export const SPELL_POTENCY_TABLE = {
  1: { challenge: 'd4', rarity: 'Common', modifier: '±1' },
  2: { challenge: 'd6', rarity: 'Uncommon', modifier: '±2' },
  3: { challenge: 'd8', rarity: 'Esoteric', modifier: '±3' },
  4: { challenge: 'd10', rarity: 'Occult', modifier: '±4' },
  5: { challenge: 'd12', rarity: 'Legendary', modifier: '±5' }
} as const;

export const SPELL_FAILURE_TABLE = {
  'd0': { reattemptConsequence: 'N/A None', rounds: 0 },
  'd4': { reattemptConsequence: 'Next Round Spell Fizzles', rounds: 1 },
  'd6': { reattemptConsequence: '2 rounds -1 spirit point', rounds: 2, spiritLoss: 1 },
  'd8': { reattemptConsequence: '3 rounds -3 spirit points', rounds: 3, spiritLoss: 3 },
  'd10': { reattemptConsequence: '4 rounds -4 spirit points', rounds: 4, spiritLoss: 4 },
  'd12': { reattemptConsequence: '5 rounds -5 spirit points', rounds: 5, spiritLoss: 5 }
} as const;

// Rarity Unlock Requirements
export const RARITY_UNLOCK_TABLE = {
  'Weak (1-3)': 'd4 (Common)',
  'Average (4+)': 'd6 (Uncommon)',
  'Respectable (12+)': 'd8 (Esoteric)',
  'Skilled (16+)': 'd10 (Occult)',
  'Great (20+)': 'd12 (Legendary)',
  'Phenomenal (24+)': 'd12+ (Legendary+)'
} as const;

// Crafting Challenge Table
export const CRAFTING_CHALLENGE_TABLE = {
  1: { challenge: '2d4 (Easy)', itemType: 'Common', craftingTime: '1 hour' },
  2: { challenge: '2d6 (Moderate)', itemType: 'Uncommon', craftingTime: '2 hours' },
  3: { challenge: '2d8 (Difficult)', itemType: 'Esoteric', craftingTime: '3 hours' },
  4: { challenge: '2d10 (Demanding)', itemType: 'Occult', craftingTime: '4 hours' },
  5: { challenge: '2d12 (Formidable)', itemType: 'Legendary', craftingTime: '5 hours' }
} as const;

// Success Chance Table
export const SUCCESS_CHANCE_TABLE = {
  'Average (2d4)': {
    'Easy (≥1d4)': { standard: 94, disadvantage: 59 },
    'Moderate (≥1d6)': { standard: 79, disadvantage: 31 },
    'Difficult (≥1d8)': { standard: 62, disadvantage: 18 },
    'Demanding (≥1d10)': { standard: 50, disadvantage: 11 },
    'Formidable (≥1d12)': { standard: 41, disadvantage: 8 }
  },
  'Respectable (2d6)': {
    'Easy (≥1d4)': { standard: 97, disadvantage: 80 },
    'Moderate (≥1d6)': { standard: 90, disadvantage: 56 },
    'Difficult (≥1d8)': { standard: 81, disadvantage: 36 },
    'Demanding (≥1d10)': { standard: 69, disadvantage: 24 },
    'Formidable (≥1d12)': { standard: 58, disadvantage: 17 }
  },
  'Skilled (2d8)': {
    'Easy (≥1d4)': { standard: 98, disadvantage: 89 },
    'Moderate (≥1d6)': { standard: 94, disadvantage: 72 },
    'Difficult (≥1d8)': { standard: 88, disadvantage: 54 },
    'Demanding (≥1d10)': { standard: 81, disadvantage: 39 },
    'Formidable (≥1d12)': { standard: 72, disadvantage: 28 }
  },
  'Great (2d10)': {
    'Easy (≥1d4)': { standard: 99, disadvantage: 93 },
    'Moderate (≥1d6)': { standard: 96, disadvantage: 82 },
    'Difficult (≥1d8)': { standard: 93, disadvantage: 68 },
    'Demanding (≥1d10)': { standard: 88, disadvantage: 53 },
    'Formidable (≥1d12)': { standard: 81, disadvantage: 41 }
  },
  'Phenomenal (2d12)': {
    'Easy (≥1d4)': { standard: 99, disadvantage: 95 },
    'Moderate (≥1d6)': { standard: 97, disadvantage: 88 },
    'Difficult (≥1d8)': { standard: 95, disadvantage: 77 },
    'Demanding (≥1d10)': { standard: 91, disadvantage: 65 },
    'Formidable (≥1d12)': { standard: 87, disadvantage: 53 }
  }
} as const;

// Encounter Difficulty Table (Defense Level vs. Total Opponent Threat Score)
export const ENCOUNTER_DIFFICULTY_TABLE = {
  1: {
    'Practitioner (8-14)': [7, 10, 12, 14, 16, 18],
    'Competent (15-28)': [14, 20, 24, 28, 32, 36],
    'Proficient (29-42)': [21, 29, 36, 42, 48, 55],
    'Advanced (43-56)': [28, 39, 48, 56, 64, 73],
    'Elite (57-72)': [35, 49, 60, 70, 80, 110]
  },
  2: {
    'Practitioner (16-28)': [14, 20, 24, 28, 32, 36],
    'Competent (30-56)': [28, 39, 48, 56, 64, 73],
    'Proficient (58-84)': [42, 59, 72, 84, 96, 108],
    'Advanced (86-112)': [56, 77, 96, 112, 128, 144],
    'Elite (114-144)': [70, 95, 120, 140, 160, 190]
  },
  3: {
    'Practitioner (24-42)': [21, 30, 36, 42, 48, 54],
    'Competent (45-84)': [42, 59, 72, 84, 96, 108],
    'Proficient (87-126)': [63, 84, 108, 126, 144, 162],
    'Advanced (129-168)': [84, 111, 144, 168, 192, 216],
    'Elite (171-216)': [105, 140, 180, 210, 240, 270]
  },
  4: {
    'Practitioner (32-56)': [28, 42, 50, 56, 64, 72],
    'Competent (60-112)': [56, 77, 96, 112, 128, 144],
    'Proficient (116-168)': [84, 111, 144, 168, 192, 216],
    'Advanced (172-224)': [112, 147, 180, 224, 256, 288],
    'Elite (228-288)': [140, 185, 228, 280, 320, 360]
  }
} as const;

// Threat MV by Dice Combinations
export const THREAT_MV_TABLE = {
  'Minor Threat': {
    '2-4': ['d2', 'd4'],
    '6-8': ['d6', 'd8'],
    '10-12': ['d10', 'd12'],
    '14-16': ['d10 + d4', 'd16'],
    '18-20': ['d12 + d6', '2d10'],
    '22-24': ['d10 + d12', '3d8'],
    '28-30': ['2d10 + d4', '3d10'],
    '32-36': ['2d8 + d6', '3d12']
  },
  'Standard Threat': {
    '2-4': ['2d2'],
    '6-8': ['d6 + 2', '2d4'],
    '10-12': ['d6 + d4', '2d6'],
    '14-16': ['2d6 + 2', '2d8'],
    '18-20': ['d10 + d8', '2d6 + d8'],
    '22-24': ['2d12'],
    '28-30': ['2d10 + d8', 'd10 + 2d8'],
    '32-36': ['2d12 + d6']
  },
  'Exceptional Threat': {
    '10-12': ['3d4'],
    '14-16': ['d6 + 2d4', 'd10 + d6'],
    '18-20': ['3d6', '2d8 + d6'],
    '22-24': ['d10 + 2d6', '3d8'],
    '28-30': ['2d10 + d6', '3d8 + d4'],
    '32-36': ['2d10 + 2d8', '3d12']
  }
} as const;

// Weapons Data
export const WEAPONS = {
  melee: {
    'Club': { size: 'Small', reach: 'Short', damageType: 'Crushing' },
    'Warhammer': { size: 'Large', reach: 'Short', damageType: 'Crushing' },
    'Footman\'s Mace': { size: 'Medium', reach: 'Short', damageType: 'Crushing' },
    'Staff': { size: 'Medium', reach: 'Short', damageType: 'Crushing' },
    'Dagger': { size: 'Small', reach: 'Short', damageType: 'Impaling' },
    'Great Axe': { size: 'Large', reach: 'Medium', damageType: 'Slashing' },
    'Greatsword': { size: 'Large', reach: 'Medium', damageType: 'Slashing' },
    'Handaxe': { size: 'Small', reach: 'Short', damageType: 'Slashing' },
    'Standard Sword': { size: 'Medium', reach: 'Medium', damageType: 'Slashing' },
    'Rapier': { size: 'Medium', reach: 'Medium', damageType: 'Impaling' },
    'Halberd': { size: 'Large', reach: 'Long', damageType: 'Slashing' },
    'Fauchard': { size: 'Large', reach: 'Long', damageType: 'Slashing' },
    'Lance': { size: 'Large', reach: 'Long', damageType: 'Impaling' },
    'Spear': { size: 'Large', reach: 'Long', damageType: 'Impaling' },
    'Fists': { size: 'Small', reach: 'Short', damageType: 'Crushing' },
    'Kicks': { size: 'Small', reach: 'Short', damageType: 'Crushing' }
  },
  ranged: {
    'Compound Bow': { range: '50\'/100\'/300\'', damageType: 'Impaling' },
    'Crossbow, Heavy': { range: '55\'/115\'/200\'', damageType: 'Impaling' },
    'Crossbow, Light': { range: '75\'/150\'/300\'', damageType: 'Impaling' },
    'Dagger (thrown)': { range: '10\'/30\'/50\'', damageType: 'Impaling' },
    'Great Bow': { range: '40\'/100\'/200\'', damageType: 'Impaling' },
    'Longbow': { range: '30\'/75\'/150\'', damageType: 'Impaling' },
    'Shortbow': { range: '20\'/50\'/100\'', damageType: 'Impaling' },
    'Sling': { range: '10\'/20\'/50\'', damageType: 'Crushing' },
    'Spear (thrown)': { range: '10\'/30\'/50\'', damageType: 'Impaling' },
    'Throwing Axe': { range: '10\'/30\'/50\'', damageType: 'Slashing' }
  }
} as const;

// Damage Type Synergies
export const DAMAGE_TYPE_SYNERGIES = {
  Crushing: { focus: 'Might (Strength)', examples: 'Warhammer, clubs, maces, slingshot' },
  Slashing: { focus: 'Ferocity (Strength)', examples: 'Swords, axes, throwing axe' },
  Impaling: { focus: 'Speed (Agility) or Skulduggery (Adroitness)', examples: 'Rapiers, spears, bows, crossbows, thrown spears' }
} as const;

// Armor & Shields
export const ARMOR = {
  'Hide': { damageReduction: '1d4', notes: 'Basic protection, like tough skin' },
  'Leather': { damageReduction: '1d6', notes: 'Moderate protection, akin to scales or armored plates' },
  'Chain Mail': { damageReduction: '1d8', notes: 'Strong protection, resembling a bony outer layer' },
  'Plate Mail': { damageReduction: '1d10', notes: 'High-level protection, similar to a heavy outer shell' },
  'Magic Armor': { damageReduction: '1d12', notes: 'Can increase die-rank or grant a static bonus' }
} as const;

export const SHIELDS = {
  'Small Shield': { threatNegation: 1, notes: 'Compact defense; e.g., hardened forearm guard' },
  'Medium Shield': { threatNegation: 2, notes: 'Standard protection; e.g., sturdy bone or wood piece' },
  'Large Shield': { threatNegation: 3, notes: 'Substantial defense; e.g., large carapace section' }
} as const;

// Hit Point Modifiers
export const HIT_POINT_MODIFIERS = {
  'Minuscule': { Mundane: 0.5, Magical: 1, Preternatural: 1.5, Supernatural: 2 },
  'Tiny': { Mundane: 0.5, Magical: 1, Preternatural: 1.5, Supernatural: 2 },
  'Small': { Mundane: 1, Magical: 1.5, Preternatural: 2, Supernatural: 2.5 },
  'Medium': { Mundane: 1, Magical: 1.5, Preternatural: 2, Supernatural: 2.5 },
  'Large': { Mundane: 1.5, Magical: 2, Preternatural: 2.5, Supernatural: 3 },
  'Huge': { Mundane: 2, Magical: 2.5, Preternatural: 3, Supernatural: 3.5 },
  'Gargantuan': { Mundane: 2.5, Magical: 3, Preternatural: 3.5, Supernatural: 4 }
} as const;

// Trap Level Table
export const TRAP_LEVELS = {
  1: {
    description: 'Low Hazard',
    types: 'Mechanical',
    detection: 'Easy (1d4 to 2d4)',
    disarm: '1d4 to 2d4',
    effect: '1d4 to 2d6 threat',
    defenseNegation: 'Mitigated by Active DP or basic armor'
  },
  2: {
    description: 'Moderate Hazard',
    types: 'Mechanical',
    detection: 'Moderate (2d6)',
    disarm: '1d8',
    effect: '2d8 to 3d6 threat',
    defenseNegation: 'May bypass basic armor but not Active DP'
  },
  3: {
    description: 'Considerable Hazard',
    types: 'Mechanical/Magical',
    detection: 'Difficult (2d8)',
    disarm: '2d8',
    effect: '3d10 to 4d6 threat',
    defenseNegation: 'May bypass both armor and Active DP'
  },
  4: {
    description: 'High Hazard',
    types: 'Magical',
    detection: 'Demanding (2d10)',
    disarm: '2d10',
    effect: '5d10 to 6d6 threat',
    defenseNegation: 'Likely to bypass both Active DP and armor'
  },
  5: {
    description: 'Extreme Hazard',
    types: 'Magical',
    detection: 'Formidable (2d12)',
    disarm: '2d12',
    effect: '6d10+ threat',
    defenseNegation: 'Bypasses standard defenses'
  }
} as const;

// Character Advancement Levels
export const ADVANCEMENT_LEVELS = {
  1: { totalCPBand: '30-100', earnedCPRequired: 0, description: 'All initial build is free/bonus' },
  2: { totalCPBand: '101-199', earnedCPRequired: 100, description: '100 earned CP' },
  3: { totalCPBand: '200-299', earnedCPRequired: 200, description: '200 earned CP' },
  4: { totalCPBand: '300-399', earnedCPRequired: 300, description: '300 earned CP' },
  5: { totalCPBand: '400-500+', earnedCPRequired: 500, description: '500 earned CP' }
} as const;