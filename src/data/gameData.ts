// Game data for Eldritch RPG 2nd Edition Character Generator

export interface Character {
  name: string;
  race: string;
  class: string;
  level: number;
  gender: 'Male' | 'Female';
  buildPhilosophy: 'Balanced' | 'Hybrid' | 'Specialist';
  abilities: Record<string, string>;
  specialties: Record<string, string>;
  focuses: Record<string, string>;
  magicPath?: string;
  iconicInheritance: boolean;
  cp: {
    total: number;
    spent: number;
    available: number;
  };
  derivedStats: {
    adp: number;
    pdp: number;
    sdp: number;
    battlePhase: number;
    spellCount: number;
  };
}

export const dieRanks = ['d4', 'd6', 'd8', 'd10', 'd12'] as const;
export type DieRank = typeof dieRanks[number];

export const abilities = ['Competence', 'Prowess', 'Fortitude'] as const;

export const specialties = {
  Competence: ['Adroitness', 'Expertise', 'Perception'],
  Prowess: ['Agility', 'Melee', 'Precision'],
  Fortitude: ['Endurance', 'Strength', 'Willpower']
} as const;

export const focuses = {
  Adroitness: ['Skulduggery', 'Cleverness'],
  Expertise: ['Wizardry', 'Theurgy'],
  Perception: ['Insight', 'Awareness'],
  Agility: ['Stealth', 'Grace'],
  Melee: ['Savagery', 'Defense'],
  Precision: ['Marksmanship', 'Finesse'],
  Endurance: ['Athletics', 'Resilience'],
  Strength: ['Might', 'Intimidation'],
  Willpower: ['Composure', 'Faith']
} as const;

export const races = {
  Human: {
    minima: { Competence: 'd6', Prowess: 'd6', Fortitude: 'd6' },
    advantages: ['Versatile Nature (2 CP)', 'Favored Training (2 CP)', 'Leadership (2 CP)']
  },
  Dwarf: {
    minima: { Competence: 'd6', Prowess: 'd4', Fortitude: 'd8' },
    advantages: ['Stonecunning (1 CP)', 'Resilient Constitution (3 CP)', 'Artisan Heritage (2 CP)']
  },
  Elf: {
    minima: { Competence: 'd8', Prowess: 'd6', Fortitude: 'd4' },
    advantages: ['Keen Senses (2 CP)', 'Ancestral Memory (2 CP)', 'Graceful Movement (1 CP)']
  },
  Halfling: {
    minima: { Competence: 'd6', Prowess: 'd8', Fortitude: 'd4' },
    advantages: ['Lucky (3 CP)', 'Small Size (1 CP)', 'Brave Heart (2 CP)']
  },
  Gnome: {
    minima: { Competence: 'd8', Prowess: 'd4', Fortitude: 'd6' },
    advantages: ['Tinker (2 CP)', 'Magic Resistance (3 CP)', 'Small Size (1 CP)']
  },
  'Half-Elf': {
    minima: { Competence: 'd6', Prowess: 'd6', Fortitude: 'd6' },
    advantages: ['Dual Heritage (2 CP)', 'Adaptable (2 CP)', 'Diplomatic (2 CP)']
  },
  'Half-Orc': {
    minima: { Competence: 'd4', Prowess: 'd8', Fortitude: 'd6' },
    advantages: ['Savage Resilience (3 CP)', 'Intimidating Presence (2 CP)', 'Relentless (1 CP)']
  },
  Tiefling: {
    minima: { Competence: 'd6', Prowess: 'd4', Fortitude: 'd8' },
    advantages: ['Infernal Heritage (3 CP)', 'Fire Resistance (2 CP)', 'Dark Vision (1 CP)']
  }
} as const;

export const classes = {
  Fighter: {
    minima: { Competence: 'd4', Prowess: 'd8', Fortitude: 'd6' },
    magicPaths: [],
    axes: ['Prowess', 'Fortitude'],
    feats: ['Weapon Specialization', 'Combat Reflexes', 'Armor Training'],
    equipment: ['Weapon', 'Armor', 'Shield']
  },
  Ranger: {
    minima: { Competence: 'd6', Prowess: 'd8', Fortitude: 'd4' },
    magicPaths: ['Druidry'],
    axes: ['Prowess', 'Competence'],
    feats: ['Track', 'Favored Enemy', 'Two-Weapon Fighting'],
    equipment: ['Bow', 'Melee Weapon', 'Leather Armor']
  },
  Rogue: {
    minima: { Competence: 'd8', Prowess: 'd6', Fortitude: 'd4' },
    magicPaths: [],
    axes: ['Competence', 'Prowess'],
    feats: ['Sneak Attack', 'Trap Finding', 'Evasion'],
    equipment: ['Thieves Tools', 'Light Weapons', 'Leather Armor']
  },
  Wizard: {
    minima: { Competence: 'd8', Prowess: 'd4', Fortitude: 'd6' },
    magicPaths: ['Elementalism', 'Sorcery', 'Thaumaturgy'],
    axes: ['Competence', 'Fortitude'],
    feats: ['Arcane Focus', 'Spell Research', 'Ritual Casting'],
    equipment: ['Spellbook', 'Component Pouch', 'Staff']
  },
  Cleric: {
    minima: { Competence: 'd6', Prowess: 'd4', Fortitude: 'd8' },
    magicPaths: ['Hieraticism'],
    axes: ['Fortitude', 'Competence'],
    feats: ['Turn Undead', 'Divine Favor', 'Healing Touch'],
    equipment: ['Holy Symbol', 'Mace', 'Chain Mail']
  },
  Warlock: {
    minima: { Competence: 'd6', Prowess: 'd6', Fortitude: 'd6' },
    magicPaths: ['Mysticism'],
    axes: ['Competence', 'Fortitude'],
    feats: ['Eldritch Blast', 'Pact Magic', 'Otherworldly Patron'],
    equipment: ['Pact Focus', 'Light Armor', 'Simple Weapons']
  },
  Barbarian: {
    minima: { Competence: 'd4', Prowess: 'd6', Fortitude: 'd8' },
    magicPaths: [],
    axes: ['Fortitude', 'Prowess'],
    feats: ['Rage', 'Danger Sense', 'Reckless Attack'],
    equipment: ['Great Weapon', 'Javelins', 'Leather Armor']
  },
  Bard: {
    minima: { Competence: 'd6', Prowess: 'd6', Fortitude: 'd6' },
    magicPaths: ['Universal'],
    axes: ['Competence', 'Prowess'],
    feats: ['Bardic Inspiration', 'Jack of All Trades', 'Song Magic'],
    equipment: ['Instrument', 'Rapier', 'Leather Armor']
  }
} as const;

export const magicPaths = {
  Universal: {
    description: 'Versatile magic affecting all schools',
    primaryAbility: 'Competence'
  },
  Elementalism: {
    description: 'Magic of the four classical elements',
    primaryAbility: 'Competence'
  },
  Sorcery: {
    description: 'Raw magical power and energy manipulation',
    primaryAbility: 'Competence'
  },
  Thaumaturgy: {
    description: 'Scholarly magic and divine mysteries',
    primaryAbility: 'Competence'
  },
  Mysticism: {
    description: 'Occult knowledge and forbidden arts',
    primaryAbility: 'Fortitude'
  },
  Hieraticism: {
    description: 'Divine magic and holy power',
    primaryAbility: 'Fortitude'
  },
  Druidry: {
    description: 'Nature magic and primal forces',
    primaryAbility: 'Fortitude'
  }
} as const;

export const levelProgression = {
  1: { masteryDice: 1, totalCP: 30, newCP: 30 },
  2: { masteryDice: 2, totalCP: 45, newCP: 15 },
  3: { masteryDice: 3, totalCP: 65, newCP: 20 },
  4: { masteryDice: 4, totalCP: 90, newCP: 25 },
  5: { masteryDice: 5, totalCP: 120, newCP: 30 }
} as const;

export const costToRankUpDie: Record<DieRank, number> = {
  'd4': 6,
  'd6': 8,
  'd8': 10,
  'd10': 12,
  'd12': Infinity
};

export const costToRankUpFocus = 4;

export const buildPhilosophies = {
  Balanced: {
    description: 'Well-rounded character development',
    softCaps: { abilities: 'd10', specialties: 'd8', focuses: 'd6' }
  },
  Hybrid: {
    description: 'Mix of specialization and versatility',
    softCaps: { abilities: 'd12', specialties: 'd10', focuses: 'd8' }
  },
  Specialist: {
    description: 'Focused on specific strengths',
    softCaps: { abilities: 'd12', specialties: 'd12', focuses: 'd10' }
  }
} as const;

export const rookieProfiles = {
  Pure: { description: 'Basic racial and class minima only', cpBonus: 6 },
  Balanced: { description: 'Some advancement in key areas', cpBonus: 3 },
  Specialist: { description: 'Focused development', cpBonus: 0 }
} as const;