// Core game data for Eldritch RPG

export const DICE_RANKS = ['d4', 'd6', 'd8', 'd10', 'd12'] as const
export const ABILITIES = ['Competence', 'Prowess', 'Fortitude'] as const
export const DIFFICULTY_LEVELS = ['Easy', 'Moderate', 'Difficult', 'Demanding', 'Formidable', 'Deadly'] as const
export const DEFENSE_LEVELS = ['Practitioner', 'Competent', 'Proficient', 'Advanced', 'Elite'] as const

export const SPECIALTIES = {
  Competence: ['Adroitness', 'Expertise', 'Perception'],
  Prowess: ['Agility', 'Melee', 'Precision'],
  Fortitude: ['Endurance', 'Strength', 'Willpower']
} as const

export const FOCUSES = {
  Adroitness: ['Skulduggery', 'Cleverness'],
  Expertise: ['Wizardry', 'Theurgy'],
  Perception: ['Alertness', 'Perspicacity'],
  Agility: ['Speed', 'Reaction'],
  Melee: ['Threat', 'Finesse'],
  Precision: ['Ranged Threat', 'Ranged Finesse'],
  Endurance: ['Vitality', 'Resilience'],
  Strength: ['Ferocity', 'Might'],
  Willpower: ['Courage', 'Resistance']
} as const

export const RACES = ['Human', 'Elf', 'Dwarf', 'Gnome', 'Half-Elf', 'Half-Orc', 'Halfling', 'Drakkin'] as const
export const CLASSES = ['Adept', 'Assassin', 'Barbarian', 'Mage', 'Mystic', 'Rogue', 'Theurgist', 'Warrior'] as const
export const LEVELS = [1, 2, 3, 4, 5] as const

export const CASTER_CLASSES = ['Adept', 'Mage', 'Mystic', 'Theurgist'] as const

export const MAGIC_PATHS_BY_CLASS = {
  Adept: ['Thaumaturgy', 'Elementalism', 'Sorcery'],
  Mage: ['Thaumaturgy', 'Elementalism', 'Sorcery'],
  Mystic: ['Mysticism'],
  Theurgist: ['Druidry', 'Hieraticism']
} as const

// Encounter generation data
export const ENCOUNTER_DIFFICULTY_TABLE = {
  1: { 
    Practitioner: [7,10,12,14,16,18], 
    Competent: [14,20,24,28,32,36], 
    Proficient: [21,29,36,42,48,55], 
    Advanced: [28,39,48,56,64,73], 
    Elite: [35,49,60,70,80,110] 
  },
  2: { 
    Practitioner: [14,20,24,28,32,36], 
    Competent: [28,39,48,56,64,73], 
    Proficient: [42,59,72,84,96,108], 
    Advanced: [56,77,96,112,128,144], 
    Elite: [70,95,120,140,160,190] 
  },
  3: { 
    Practitioner: [21,30,36,42,48,54], 
    Competent: [42,59,72,84,96,108], 
    Proficient: [63,84,108,126,144,162], 
    Advanced: [84,111,144,168,192,216], 
    Elite: [105,140,180,210,240,270] 
  },
  4: { 
    Practitioner: [28,42,50,56,64,72], 
    Competent: [56,77,96,112,128,144], 
    Proficient: [84,111,144,168,192,216], 
    Advanced: [112,147,180,224,256,288], 
    Elite: [140,185,228,280,320,360] 
  }
} as const

export const THREAT_DICE_BY_CATEGORY = {
  Minor: ['1d4','1d6','1d8','1d10','1d12'],
  Standard: ['2d4','2d6','2d8','2d10','2d12'],
  Exceptional: ['3d4','3d6','3d8','3d10','3d12'],
  Legendary: ['3d12','3d14','3d16','3d18','3d20']
} as const

export const CREATURE_SIZES = ['Minuscule', 'Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan'] as const
export const CREATURE_NATURES = ['Mundane', 'Magical', 'Preternatural', 'Supernatural'] as const
export const CREATURE_TYPES = ['Minor', 'Standard', 'Exceptional', 'Legendary'] as const

export const HIT_POINT_MODIFIERS = {
  'Minuscule': {'Mundane': 0.5, 'Magical': 1, 'Preternatural': 1.5, 'Supernatural': 2},
  'Tiny': {'Mundane': 0.5, 'Magical': 1, 'Preternatural': 1.5, 'Supernatural': 2},
  'Small': {'Mundane': 1, 'Magical': 1.5, 'Preternatural': 2, 'Supernatural': 2.5},
  'Medium': {'Mundane': 1, 'Magical': 1.5, 'Preternatural': 2, 'Supernatural': 2.5},
  'Large': {'Mundane': 1.5, 'Magical': 2, 'Preternatural': 2.5, 'Supernatural': 3},
  'Huge': {'Mundane': 2, 'Magical': 2.5, 'Preternatural': 3, 'Supernatural': 3.5},
  'Gargantuan': {'Mundane': 2.5, 'Magical': 3, 'Preternatural': 3.5, 'Supernatural': 4}
} as const

// Also keep the original name for backwards compatibility
export const HP_MULTIPLIERS = HIT_POINT_MODIFIERS

// Character creation data
export const RACE_MINIMA = {
  Drakkin: {Competence: 'd6', Prowess: 'd6', Fortitude: 'd6', Endurance: 'd6', Strength: 'd4'},
  Dwarf: {Fortitude: 'd8', Endurance: 'd4', Prowess: 'd6', Melee: 'd6'},
  Elf: {Competence: 'd6', Expertise: 'd6', Wizardry: '+1', Prowess: 'd4', Agility: 'd4', Reaction: '+1'},
  Gnome: {Competence: 'd4', Adroitness: 'd6', Expertise: 'd6', Perception: 'd4', Perspicacity: '+1'},
  'Half-Elf': {Competence: 'd6', Prowess: 'd6', Agility: 'd4', Fortitude: 'd4', Endurance: 'd4', Willpower: 'd4'},
  'Half-Orc': {Fortitude: 'd6', Strength: 'd8', Ferocity: '+1', Endurance: 'd6'},
  Halfling: {Competence: 'd6', Adroitness: 'd6', Cleverness: '+1', Fortitude: 'd6', Willpower: 'd4', Courage: '+1'},
  Human: {Competence: 'd6', Prowess: 'd6', Melee: 'd4', Threat: '+1', Fortitude: 'd4', Willpower: 'd6'}
} as const

export const CLASS_MINIMA = {
  Adept: {Competence: 'd6', Adroitness: 'd4', Cleverness: '+1', Expertise: 'd6', Wizardry: '+1', Perception: 'd4', Perspicacity: '+1'},
  Assassin: {Competence: 'd4', Adroitness: 'd6', Perception: 'd4', Prowess: 'd4', Agility: 'd4', Endurance: 'd6', Melee: 'd4', Finesse: '+1'},
  Barbarian: {Prowess: 'd6', Melee: 'd8', Fortitude: 'd4', Strength: 'd4', Ferocity: '+1'},
  Mage: {Competence: 'd6', Expertise: 'd8', Wizardry: '+1', Fortitude: 'd4', Willpower: 'd6', Resistance: '+1'},
  Mystic: {Competence: 'd6', Expertise: 'd6', Wizardry: '+1', Prowess: 'd4', Melee: 'd4', Fortitude: 'd4', Endurance: 'd6', Resilience: '+1', Vitality: '+2'},
  Rogue: {Competence: 'd4', Adroitness: 'd4', Skulduggery: '+1', Perception: 'd4', Prowess: 'd6', Agility: 'd8'},
  Theurgist: {Competence: 'd8', Expertise: 'd4', Theurgy: '+1', Fortitude: 'd6', Willpower: 'd4'},
  Warrior: {Prowess: 'd8', Melee: 'd6', Threat: '+1', Fortitude: 'd6'}
} as const

export const CLASS_FEATS = {
  Adept: ['Guile', 'Lore', 'Ritual Magic', 'Quick-witted'],
  Assassin: ['Death Strike', 'Lethal Exploit', 'Ranged Ambush', 'Shadow Walk'],
  Barbarian: ['Berserk', 'Brawl', 'Feat of Strength', 'Grapple'],
  Mage: ['Arcane Finesse', 'Dweomers', 'Intangible Threat', 'Path Mastery'],
  Mystic: ['Iron Mind', 'Path Mastery', 'Premonition', 'Psychic Powers'],
  Rogue: ['Backstab', 'Evasion', 'Roguish Charm', 'Stealth'],
  Theurgist: ['Divine Healing', 'Path Mastery', 'Spiritual Smite', 'Supernatural Intervention'],
  Warrior: ['Battle Savvy', 'Maneuvers', 'Stunning Reversal', 'Sunder Foe']
} as const

export const LEVEL_INFO = [
  { level: 1, masteryDie: 'd4', usesPerDay: 2, cp_range: '10 to 100' },
  { level: 2, masteryDie: 'd6', usesPerDay: 4, cp_range: '101 to 199' },
  { level: 3, masteryDie: 'd8', usesPerDay: 6, cp_range: '200 to 299' },
  { level: 4, masteryDie: 'd10', usesPerDay: 8, cp_range: '300 to 399' },
  { level: 5, masteryDie: 'd12', usesPerDay: 10, cp_range: '400 to 500+' }
] as const

export const STEP_COSTS = {'d4': 6, 'd6': 8, 'd8': 10, 'd10': 12, 'd12': Infinity} as const
export const FOCUS_STEP_COST = 4

// Battle phase calculation
export const BATTLE_PHASE_TABLE = {
  'd12': 1,
  'd10': 2,
  'd8': 3,
  'd6': 4,
  'd4': 5
} as const