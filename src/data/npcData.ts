// NPC Generator data for Eldritch RPG 2nd Edition

export interface QuickNPC {
  id: number;
  name: string;
  race: string;
  role: string;
  level: number;
  gender: 'Male' | 'Female';

  // Quick stats for combat
  activeDefense: number;
  passiveDefense: number;
  spiritPoints: number;
  battlePhase: number;
  prowessDie: number;

  // Simple ability summary
  primaryAbility: string;
  keySpecialty: string;

  // Role-specific equipment
  iconicItem?: string;
  notes?: string;
}

export interface DetailedNPC {
  id: number;
  name: string;
  race: string;
  role: string;
  level: number;
  gender: 'Male' | 'Female';

  // Full Ability System (like legacy generator)
  abilities: {
    competence: string;
    prowess: string;
    fortitude: string;
  };

  specialties: {
    competence: {
      expertise: string;
      perception: string;
      adroitness: string;
    };
    prowess: {
      melee: string;
      agility: string;
      precision: string;
    };
    fortitude: {
      endurance: string;
      strength: string;
      willpower: string;
    };
  };

  focuses: {
    [specialty: string]: {
      [focus: string]: string;
    };
  };

  // Combat Stats
  activeDefense: number;
  passiveDefense: number;
  spiritPoints: number;
  masteryDie: string;
  armor: string;

  // Actions (calculated from abilities)
  actions: {
    meleeAttack: string;
    rangedAttack: string;
    magicAttack: string;
    perceptionCheck: string;
  };

  // Personality & Background
  personality?: string[];
  motivation?: string;
  appearance?: string;
  quirks?: string[];
  secrets?: string[];
  relationships?: string[];
  background?: string;

  // Iconic Item System
  iconicItem?: IconicItem;

  // Story Elements
  rumors?: string[];
  plotHooks?: string[];

  // Notes
  notes?: string;
}

export interface IconicItem {
  type: 'Iconic Weapon' | 'Iconic Magic Focus' | 'Iconic Inspirational Item';
  name?: string;
  description?: string;
  details?: string;
  properties: string;
  rarity?: 'Common' | 'Uncommon' | 'Esoteric' | 'Occult' | 'Legendary';
  potency?: string;
  energyPoints?: number;
  activationCost?: number;
  magicalProperties?: {
    effect: string;
    description: string;
  };
}

export interface NPCTemplate {
  role: string;
  primaryAbility: 'Competence' | 'Prowess' | 'Fortitude';
  keySpecialty: string;
  iconicItems: string[];
  baseADP: number;
  basePDP: number;
  prowessDie: number;
}

export const npcRaces = [
  'Human', 'Elf', 'Dwarf', 'Gnome', 'Half-Elf', 'Half-Orc', 'Halfling', 'Tiefling'
] as const;

export const npcRoles = [
  'Warrior', 'Rogue', 'Adept', 'Mage', 'Mystic', 'Theurgist', 'Barbarian', 'Guard'
] as const;

export const npcLevels = [1, 2, 3, 4, 5] as const;

export const npcTemplates: Record<string, NPCTemplate> = {
  Warrior: {
    role: 'Warrior',
    primaryAbility: 'Prowess',
    keySpecialty: 'Melee',
    iconicItems: ['Sword', 'Axe', 'Mace', 'Spear', 'Warhammer'],
    baseADP: 12,
    basePDP: 15,
    prowessDie: 8
  },
  Rogue: {
    role: 'Rogue',
    primaryAbility: 'Competence',
    keySpecialty: 'Adroitness',
    iconicItems: ['Daggers', 'Short Sword', 'Thieves Tools', 'Lockpicks', 'Poisoned Blade'],
    baseADP: 15,
    basePDP: 10,
    prowessDie: 8
  },
  Adept: {
    role: 'Adept',
    primaryAbility: 'Competence',
    keySpecialty: 'Expertise',
    iconicItems: ['Staff', 'Wand', 'Tome', 'Crystal Focus', 'Scrolls'],
    baseADP: 10,
    basePDP: 12,
    prowessDie: 6
  },
  Mage: {
    role: 'Mage',
    primaryAbility: 'Competence',
    keySpecialty: 'Expertise',
    iconicItems: ['Spellbook', 'Staff of Power', 'Arcane Focus', 'Ritual Components', 'Magic Robes'],
    baseADP: 8,
    basePDP: 10,
    prowessDie: 6
  },
  Mystic: {
    role: 'Mystic',
    primaryAbility: 'Fortitude',
    keySpecialty: 'Willpower',
    iconicItems: ['Crystal Ball', 'Divination Tools', 'Blessed Symbol', 'Meditation Beads', 'Occult Tome'],
    baseADP: 10,
    basePDP: 15,
    prowessDie: 6
  },
  Theurgist: {
    role: 'Theurgist',
    primaryAbility: 'Fortitude',
    keySpecialty: 'Willpower',
    iconicItems: ['Holy Symbol', 'Blessed Mace', 'Prayer Book', 'Divine Focus', 'Healing Herbs'],
    baseADP: 12,
    basePDP: 18,
    prowessDie: 6
  },
  Barbarian: {
    role: 'Barbarian',
    primaryAbility: 'Fortitude',
    keySpecialty: 'Strength',
    iconicItems: ['Great Axe', 'Tribal Weapons', 'Bone Charms', 'Animal Hide Armor', 'War Paint'],
    baseADP: 10,
    basePDP: 20,
    prowessDie: 10
  },
  Guard: {
    role: 'Guard',
    primaryAbility: 'Prowess',
    keySpecialty: 'Melee',
    iconicItems: ['Sword and Shield', 'Crossbow', 'Chain Mail', 'Guard Uniform', 'Whistle'],
    baseADP: 10,
    basePDP: 12,
    prowessDie: 6
  }
};

export const npcNameDatabase = {
  Human: {
    Male: ['Aiden', 'Blake', 'Connor', 'Derek', 'Ethan', 'Felix', 'Gabriel', 'Henry', 'Marcus', 'Owen'],
    Female: ['Alice', 'Bella', 'Claire', 'Diana', 'Emma', 'Fiona', 'Grace', 'Hannah', 'Ivy', 'Julia']
  },
  Dwarf: {
    Male: ['Thorin', 'Balin', 'Dwalin', 'Gloin', 'Gimli', 'Dain', 'Nali', 'Ori', 'Bifur', 'Bofur'],
    Female: ['Disa', 'Nala', 'Vera', 'Kili', 'Mira', 'Tova', 'Rina', 'Hela', 'Nara', 'Gilda']
  },
  Elf: {
    Male: ['Legolas', 'Elrond', 'Thranduil', 'Celeborn', 'Haldir', 'Lindir', 'Erestor', 'Glorfindel', 'Elladan', 'Elrohir'],
    Female: ['Arwen', 'Galadriel', 'Tauriel', 'Elaria', 'Nimrodel', 'Idril', 'Luthien', 'Celebrian', 'Elaria', 'Aredhel']
  },
  Halfling: {
    Male: ['Frodo', 'Bilbo', 'Samwise', 'Merry', 'Pippin', 'Hamfast', 'Mungo', 'Bungo', 'Drogo', 'Fosco'],
    Female: ['Rosie', 'Pearl', 'Lily', 'Daisy', 'Poppy', 'Primula', 'Lobelia', 'Belladonna', 'Mirabella', 'Pansy']
  },
  Gnome: {
    Male: ['Gimble', 'Fonkin', 'Wrenn', 'Boddynock', 'Dimble', 'Glim', 'Gerrig', 'Namfoodle', 'Zook', 'Warryn'],
    Female: ['Bimpnottin', 'Breena', 'Caramip', 'Carlin', 'Donella', 'Duvamil', 'Ella', 'Kars', 'Nyx', 'Oda']
  },
  'Half-Elf': {
    Male: ['Aelar', 'Berris', 'Dayereth', 'Enna', 'Galinndan', 'Hadarai', 'Immeral', 'Ivellios', 'Korfel', 'Lamlis'],
    Female: ['Andra', 'Dara', 'Diesa', 'Eldara', 'Halimath', 'Helja', 'Hlin', 'Kathra', 'Lavinia', 'Mardred']
  },
  'Half-Orc': {
    Male: ['Dench', 'Feng', 'Gell', 'Henk', 'Holg', 'Imsh', 'Keth', 'Krusk', 'Mhurren', 'Ront'],
    Female: ['Baggi', 'Emen', 'Engong', 'Kansif', 'Myev', 'Neega', 'Ovak', 'Ownka', 'Shautha', 'Vola']
  },
  Tiefling: {
    Male: ['Akmenos', 'Amnon', 'Barakas', 'Damakos', 'Ekemon', 'Iados', 'Kairon', 'Leucis', 'Melech', 'Mordai'],
    Female: ['Akta', 'Anakir', 'Bryseis', 'Criella', 'Damaia', 'Ea', 'Kallista', 'Lerissa', 'Makaria', 'Nemeia']
  }
};

export const levelProgression = {
  1: { dieMod: 0, adpMod: 0, pdpMod: 0, spMod: 0 },
  2: { dieMod: 1, adpMod: 2, pdpMod: 3, spMod: 1 },
  3: { dieMod: 2, adpMod: 4, pdpMod: 6, spMod: 2 },
  4: { dieMod: 3, adpMod: 6, pdpMod: 9, spMod: 3 },
  5: { dieMod: 4, adpMod: 8, pdpMod: 12, spMod: 4 }
};

export const dieProgression = ['d4', 'd6', 'd8', 'd10', 'd12'];

export const npcPersonalities = [
  'Aggressive', 'Cautious', 'Friendly', 'Suspicious', 'Arrogant', 'Humble', 'Talkative', 'Silent',
  'Nervous', 'Confident', 'Greedy', 'Generous', 'Lazy', 'Energetic', 'Wise', 'Foolish'
];

export const npcMotivations = [
  'Seeking wealth', 'Protecting family', 'Following orders', 'Personal glory', 'Religious duty',
  'Revenge', 'Knowledge', 'Power', 'Freedom', 'Justice', 'Survival', 'Love'
];

export const npcAppearances = [
  'Tall and imposing', 'Short and stocky', 'Average height, athletic build', 'Lean and wiry',
  'Heavyset and strong', 'Graceful and elegant', 'Weathered and scarred', 'Young and fresh-faced',
  'Middle-aged and experienced', 'Elderly and wise', 'Mysterious hooded figure', 'Well-dressed and refined'
];

export const npcQuirks = [
  'Always taps fingers when thinking', 'Speaks in riddles', 'Collects unusual trinkets',
  'Never makes direct eye contact', 'Constantly adjusts their clothing', 'Whistles old tavern songs',
  'Has a pet that follows them everywhere', 'Chews on a toothpick', 'Counts everything in threes',
  'Never sits with their back to a door', 'Always carries a lucky charm', 'Speaks to themselves quietly'
];

export const npcSecrets = [
  'Is secretly working for a rival faction', 'Has a hidden magical ability', 'Is not who they claim to be',
  'Owes a significant debt to dangerous people', 'Is related to someone important', 'Witnessed a terrible crime',
  'Knows the location of hidden treasure', 'Is being blackmailed', 'Has a forbidden love affair',
  'Is planning to leave town soon', 'Carries a cursed item', 'Is immortal but hiding it'
];

export const npcRelationships = [
  'Has a brother in the city guard', 'Is married to a local merchant', 'Owes money to the tavern keeper',
  'Is childhood friends with the mayor', 'Has a rivalry with another NPC', 'Is the cousin of a noble',
  'Was trained by a famous warrior', 'Is the apprentice of a renowned mage', 'Has a secret lover',
  'Is estranged from their family', 'Mentors young adventurers', 'Is allied with a thieves guild'
];

export const npcBackgrounds = [
  'Former soldier who saw too much war', 'Merchant who lost everything in a bad deal',
  'Scholar seeking forbidden knowledge', 'Exile from a distant kingdom', 'Retired adventurer',
  'Orphan who grew up on the streets', 'Noble who fell from grace', 'Faithful servant of the temple',
  'Craftsperson with a family tradition', 'Wanderer searching for their destiny',
  'Survivor of a great tragedy', 'Reformed criminal trying to make amends'
];

export const npcRumors = [
  'They say he knows where the old king buried his treasure',
  'Some claim she can speak to the dead',
  'Word is he\'s got connections with smugglers',
  'They whisper she once killed a dragon',
  'People say he can predict the weather perfectly',
  'Rumor has it she\'s got noble blood',
  'They claim he was once a famous thief',
  'Some believe she\'s cursed with bad luck',
  'Word is he fought in the great war',
  'People whisper she knows ancient magic'
];

export const npcPlotHooks = [
  'Needs help recovering a stolen family heirloom',
  'Has information about mysterious disappearances in town',
  'Seeks brave souls to explore an ancient ruin',
  'Is being stalked by unknown assassins',
  'Has a map to a lost temple but needs protection',
  'Wants to hire guards for a dangerous journey',
  'Knows the secret entrance to a villain\'s hideout',
  'Has witnessed strange cult activities',
  'Is planning a heist and needs accomplices',
  'Holds the key to solving a local mystery'
];

// Race ability minimums (from legacy generator)
export const raceMinimums: Record<string, Record<string, string>> = {
  Human: { competence: 'd6', prowess: 'd6', fortitude: 'd4', willpower: 'd6' },
  Elf: { competence: 'd6', prowess: 'd8', fortitude: 'd4', willpower: 'd6' },
  Dwarf: { competence: 'd6', prowess: 'd6', fortitude: 'd8', willpower: 'd4' },
  Gnome: { competence: 'd6', prowess: 'd4', fortitude: 'd6', willpower: 'd6' },
  'Half-Elf': { competence: 'd6', prowess: 'd6', fortitude: 'd6', willpower: 'd6' },
  'Half-Orc': { competence: 'd6', prowess: 'd8', fortitude: 'd6', willpower: 'd4' },
  Halfling: { competence: 'd6', prowess: 'd4', fortitude: 'd4', willpower: 'd6' },
  Tiefling: { competence: 'd8', prowess: 'd6', fortitude: 'd4', willpower: 'd8' }
};

export const dieValues: Record<string, number> = {
  'd4': 4, 'd6': 6, 'd8': 8, 'd10': 10, 'd12': 12
};

// Role ability minimums (from legacy generator)
export const roleMinimums: Record<string, Record<string, string>> = {
  Warrior: { prowess: 'd8', melee: 'd6', fortitude: 'd6' },
  Rogue: { prowess: 'd6', agility: 'd6', fortitude: 'd4' },
  Adept: { competence: 'd6', expertise: 'd6', willpower: 'd6' },
  Mage: { competence: 'd8', expertise: 'd6', willpower: 'd8' },
  Mystic: { competence: 'd6', expertise: 'd6', willpower: 'd8' },
  Theurgist: { competence: 'd8', expertise: 'd6', willpower: 'd8' },
  Barbarian: { prowess: 'd8', melee: 'd6', fortitude: 'd6' },
  Guard: { prowess: 'd6', melee: 'd6', fortitude: 'd6' }
};

// Abilities and their specialties
export const abilities = ['competence', 'prowess', 'fortitude'];
export const dieRanks = ['d4', 'd6', 'd8', 'd10', 'd12'];

export const specialties: Record<string, string[]> = {
  competence: ['adroitness', 'expertise', 'perception'],
  prowess: ['agility', 'melee', 'precision'],
  fortitude: ['endurance', 'strength', 'willpower']
};

export const focuses: Record<string, string[]> = {
  adroitness: ['skulduggery', 'cleverness'],
  expertise: ['wizardry', 'theurgy'],
  perception: ['alertness', 'perspicacity'],
  agility: ['speed', 'reaction'],
  melee: ['threat', 'finesse'],
  precision: ['ranged threat', 'ranged finesse'],
  endurance: ['vitality', 'resilience'],
  strength: ['ferocity', 'might'],
  willpower: ['courage', 'resistance']
};

export const magicalEffects = {
  weapon: [
    { effect: 'Harm', description: 'Inflicts additional elemental damage (e.g., fire, ice).' },
    { effect: 'Afflict', description: 'Has a chance to inflict status ailments (e.g., paralysis).' },
    { effect: 'Modify', description: 'Enhances weapon\'s sharpness, increasing damage output.' }
  ],
  focus: [
    { effect: 'Activate', description: 'Allows casting of specific spells (e.g., teleportation).' },
    { effect: 'Restore', description: 'Augments healing spells, restoring more health.' },
    { effect: 'Protect', description: 'Strengthens defensive spells, providing better protection.' }
  ],
  inspirational: [
    { effect: 'Modify', description: 'Enhances attributes (e.g., increased agility).' },
    { effect: 'Afflict', description: 'Can impose disadvantages on opponents in social encounters.' },
    { effect: 'Activate', description: 'Triggers specific events (e.g., unlocking hidden doors).' }
  ]
};

export const potencyLevels = ['d4', 'd6', 'd8', 'd10', 'd12'];

export const energyPointsByRarity = {
  Common: 8,
  Uncommon: 12,
  Esoteric: 16,
  Occult: 20,
  Legendary: 30
};

