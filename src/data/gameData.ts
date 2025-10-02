
// Game data for Eldritch RPG 2nd Edition Character Generator

export const dieRanks = ['d4', 'd6', 'd8', 'd10', 'd12'] as const;
export type DieRank = typeof dieRanks[number];

export const abilities = ['Competence', 'Prowess', 'Fortitude'] as const;
export type Ability = typeof abilities[number];

export const specs = {
  Competence: ['Adroitness', 'Expertise', 'Perception'],
  Prowess: ['Agility', 'Melee', 'Precision'],
  Fortitude: ['Endurance', 'Strength', 'Willpower']
} as const satisfies Record<Ability, readonly string[]>;
export type Specialty = (typeof specs)[Ability][number];

export const foci = {
  Adroitness: ['Skulduggery', 'Cleverness'],
  Expertise: ['Wizardry', 'Theurgy'],
  Perception: ['Alertness', 'Perspicacity'],
  Agility: ['Speed', 'Reaction'],
  Melee: ['Threat', 'Finesse'],
  Precision: ['Ranged Threat', 'Ranged Finesse'],
  Endurance: ['Vitality', 'Resilience'],
  Strength: ['Ferocity', 'Might'],
  Willpower: ['Courage', 'Resistance']
} as const satisfies Record<Specialty, readonly string[]>;
export type Focus = (typeof foci)[Specialty][number];

export const raceNames = ['Human', 'Elf', 'Dwarf', 'Gnome', 'Half-Elf', 'Half-Orc', 'Halfling', 'Drakkin'] as const;
export type RaceName = typeof raceNames[number];

export const classNames = ['Adept', 'Assassin', 'Barbarian', 'Mage', 'Mystic', 'Rogue', 'Theurgist', 'Warrior'] as const;
export type ClassName = typeof classNames[number];

export interface RaceDefinition {
  minima: Record<string, string>;
  advantages: readonly string[];
  flaws?: readonly string[];
}

export interface ClassDefinition {
  minima: Record<string, string>;
  advantages: readonly string[];
  feats: readonly string[];
  equipment: readonly string[];
  magicPaths: readonly string[];
  axes: readonly string[];
}

export const raceMinima: Record<RaceName, Record<string, string>> = {
  Drakkin: { Competence: 'd6', Prowess: 'd6', Fortitude: 'd6', Endurance: 'd6', Strength: 'd4' },
  Dwarf: { Fortitude: 'd8', Endurance: 'd4', Prowess: 'd6', Melee: 'd6' },
  Elf: { Competence: 'd6', Expertise: 'd6', Wizardry: '+1', Prowess: 'd4', Agility: 'd4', Reaction: '+1' },
  Gnome: { Competence: 'd4', Adroitness: 'd6', Expertise: 'd6', Perception: 'd4', Perspicacity: '+1' },
  'Half-Elf': { Competence: 'd6', Prowess: 'd6', Agility: 'd4', Fortitude: 'd4', Endurance: 'd4', Willpower: 'd4' },
  'Half-Orc': { Fortitude: 'd6', Strength: 'd8', Ferocity: '+1', Endurance: 'd6' },
  Halfling: { Competence: 'd6', Adroitness: 'd6', Cleverness: '+1', Fortitude: 'd6', Willpower: 'd4', Courage: '+1' },
  Human: { Competence: 'd6', Prowess: 'd6', Melee: 'd4', Threat: '+1', Fortitude: 'd4', Willpower: 'd6' }
};

export const classMinima: Record<ClassName, Record<string, string>> = {
  Adept: { Competence: 'd6', Adroitness: 'd4', Cleverness: '+1', Expertise: 'd6', Wizardry: '+1', Perception: 'd4', Perspicacity: '+1' },
  Assassin: { Competence: 'd4', Adroitness: 'd6', Perception: 'd4', Prowess: 'd4', Agility: 'd4', Endurance: 'd6', Melee: 'd4', Finesse: '+1' },
  Barbarian: { Prowess: 'd6', Melee: 'd8', Fortitude: 'd4', Strength: 'd4', Ferocity: '+1' },
  Mage: { Competence: 'd6', Expertise: 'd8', Wizardry: '+1', Fortitude: 'd4', Willpower: 'd6', Resistance: '+1' },
  Mystic: { Competence: 'd6', Expertise: 'd6', Wizardry: '+1', Prowess: 'd4', Melee: 'd4', Fortitude: 'd4', Endurance: 'd6', Resilience: '+1', Vitality: '+2' },
  Rogue: { Competence: 'd4', Adroitness: 'd4', Skulduggery: '+1', Perception: 'd4', Prowess: 'd6', Agility: 'd8' },
  Theurgist: { Competence: 'd8', Expertise: 'd4', Theurgy: '+1', Fortitude: 'd6', Willpower: 'd4' },
  Warrior: { Prowess: 'd8', Melee: 'd6', Threat: '+1', Fortitude: 'd6' }
};

export const advantageGroups: Record<RaceName | ClassName, readonly string[]> = {
  Human: ['Fortunate', 'Survival'],
  Elf: ['Night Vision', 'Gift of Magic', 'Magic Resistance (+1)'],
  Dwarf: ['Night Vision', 'Strong-willed', 'Sense of Direction'],
  Gnome: ['Eidetic Memory', 'Low-Light Vision', 'Observant'],
  'Half-Elf': ['Heightened Senses', 'Low-Light Vision', 'Magic Resistance (+1)'],
  'Half-Orc': ['Low-light Vision', 'Intimidation', 'Menacing'],
  Halfling: ['Low Light Vision', 'Read Emotions', 'Resilient'],
  Drakkin: ['Natural Armor', 'Breath Weapon', 'Night Vision'],
  Adept: ['Arcanum', 'Gift of Magic', 'Literacy', 'Scholar'],
  Assassin: ['Expeditious', 'Heightened Senses (hearing)', 'Observant', 'Read Emotions'],
  Barbarian: ['Animal Affinity', 'Brutishness', 'Menacing', 'Resilient'],
  Mage: ['Arcanum', 'Gift of Magic', 'Magic Defense', 'Scholar'],
  Mystic: ['Empathic', 'Gift of Magic', 'Intuitive', 'Magic Resistance (Lesser)', 'Strong-Willed'],
  Rogue: ['Expeditious', 'Fortunate', 'Streetwise', 'Underworld Contacts'],
  Theurgist: ['Gift of Magic', 'Magic Defense', 'Religion', 'Strong-Willed'],
  Warrior: ['Commanding', 'Intimidation', 'Magic Resistance (+1)', 'Tactician']
};

export const raceFlaws: Partial<Record<RaceName, readonly string[]>> = {
  Gnome: ['Restriction: small weapons only'],
  Halfling: ['Restriction: small weapons only'],
  'Half-Orc': ['Ugliness']
};

export const classFeats: Record<ClassName, readonly string[]> = {
  Adept: ['Guile', 'Lore', 'Ritual Magic', 'Quick-witted'],
  Assassin: ['Death Strike', 'Lethal Exploit', 'Ranged Ambush', 'Shadow Walk'],
  Barbarian: ['Berserk', 'Brawl', 'Feat of Strength', 'Grapple'],
  Mage: ['Arcane Finesse', 'Dweomers', 'Intangible Threat', 'Path Mastery'],
  Mystic: ['Iron Mind', 'Path Mastery', 'Premonition', 'Psychic Powers'],
  Rogue: ['Backstab', 'Evasion', 'Roguish Charm', 'Stealth'],
  Theurgist: ['Divine Healing', 'Path Mastery', 'Spiritual Smite', 'Supernatural Intervention'],
  Warrior: ['Battle Savvy', 'Maneuvers', 'Stunning Reversal', 'Sunder Foe']
};

export const startingEquipment: Record<'common' | ClassName, readonly string[]> = {
  common: [
    'Set of ordinary clothes',
    'Purse of 5 gold coins',
    'Backpack',
    'Small dagger',
    "Week's rations",
    'Waterskin',
    'Tinderbox',
    "50' rope",
    'Iron spikes',
    'Small hammer',
    "6' traveling staff or 10' pole",
    'Hooded lantern and 2 oil flasks or d4+1 torches'
  ],
  Adept: ['Book of knowledge (area of expertise)'],
  Assassin: ['Assassin hood, jacket, cape, robe, or tunic'],
  Barbarian: ['Garments of woven wool or linen', 'Tunic', 'Overcoat or cloak'],
  Mage: ['Spellbook', 'Staff or focus item'],
  Mystic: ['Robes or shawl', 'Cloak', 'Armor up to leather'],
  Rogue: ["Set of thieves' tools", 'Light armor (up to leather)', 'One weapon'],
  Theurgist: ['Prayer book', 'Holy relic or symbol', 'Focus item', 'Armor up to chain'],
  Warrior: ['One weapon of choice', 'Armor up to chain', 'Small to large shield', 'Steed']
};

export const classAxes: Record<ClassName, readonly string[]> = {
  Warrior: ['Prowess', 'Melee', 'Strength', 'Fortitude', 'Endurance', 'Threat', 'Agility', 'Might'],
  Barbarian: ['Prowess', 'Melee', 'Strength', 'Fortitude', 'Endurance', 'Ferocity', 'Might', 'Vitality'],
  Rogue: ['Prowess', 'Agility', 'Competence', 'Adroitness', 'Perception', 'Skulduggery', 'Cleverness', 'Speed'],
  Assassin: ['Prowess', 'Agility', 'Melee', 'Competence', 'Adroitness', 'Finesse', 'Speed', 'Perception'],
  Mage: ['Competence', 'Expertise', 'Wizardry', 'Fortitude', 'Willpower', 'Resistance', 'Perception'],
  Mystic: ['Fortitude', 'Willpower', 'Competence', 'Expertise', 'Endurance', 'Prowess', 'Melee', 'Resilience', 'Vitality'],
  Adept: ['Competence', 'Expertise', 'Adroitness', 'Perception', 'Cleverness', 'Wizardry', 'Perspicacity'],
  Theurgist: ['Competence', 'Expertise', 'Theurgy', 'Fortitude', 'Willpower', 'Endurance', 'Courage']
};

export const casterClasses = ['Adept', 'Mage', 'Mystic', 'Theurgist'] as const;

export const magicPathsByClass: Record<ClassName, readonly string[]> = {
  Adept: ['Thaumaturgy', 'Elementalism', 'Sorcery'],
  Assassin: [],
  Barbarian: [],
  Mage: ['Thaumaturgy', 'Elementalism', 'Sorcery'],
  Mystic: ['Mysticism'],
  Rogue: [],
  Theurgist: ['Druidry', 'Hieraticism'],
  Warrior: []
};

const baseEquipment = startingEquipment.common;
const getEquipment = (klass: ClassName) => [
  ...baseEquipment,
  ...(startingEquipment[klass] ?? [])
];

export const races: Record<RaceName, RaceDefinition> = {
  Human: {
    minima: raceMinima.Human,
    advantages: advantageGroups.Human
  },
  Elf: {
    minima: raceMinima.Elf,
    advantages: advantageGroups.Elf
  },
  Dwarf: {
    minima: raceMinima.Dwarf,
    advantages: advantageGroups.Dwarf
  },
  Gnome: {
    minima: raceMinima.Gnome,
    advantages: advantageGroups.Gnome,
    flaws: raceFlaws.Gnome
  },
  'Half-Elf': {
    minima: raceMinima['Half-Elf'],
    advantages: advantageGroups['Half-Elf']
  },
  'Half-Orc': {
    minima: raceMinima['Half-Orc'],
    advantages: advantageGroups['Half-Orc'],
    flaws: raceFlaws['Half-Orc']
  },
  Halfling: {
    minima: raceMinima.Halfling,
    advantages: advantageGroups.Halfling,
    flaws: raceFlaws.Halfling
  },
  Drakkin: {
    minima: raceMinima.Drakkin,
    advantages: advantageGroups.Drakkin
  }
};

export const classes: Record<ClassName, ClassDefinition> = {
  Adept: {
    minima: classMinima.Adept,
    advantages: advantageGroups.Adept,
    feats: classFeats.Adept,
    equipment: getEquipment('Adept'),
    magicPaths: magicPathsByClass.Adept,
    axes: classAxes.Adept
  },
  Assassin: {
    minima: classMinima.Assassin,
    advantages: advantageGroups.Assassin,
    feats: classFeats.Assassin,
    equipment: getEquipment('Assassin'),
    magicPaths: magicPathsByClass.Assassin,
    axes: classAxes.Assassin
  },
  Barbarian: {
    minima: classMinima.Barbarian,
    advantages: advantageGroups.Barbarian,
    feats: classFeats.Barbarian,
    equipment: getEquipment('Barbarian'),
    magicPaths: magicPathsByClass.Barbarian,
    axes: classAxes.Barbarian
  },
  Mage: {
    minima: classMinima.Mage,
    advantages: advantageGroups.Mage,
    feats: classFeats.Mage,
    equipment: getEquipment('Mage'),
    magicPaths: magicPathsByClass.Mage,
    axes: classAxes.Mage
  },
  Mystic: {
    minima: classMinima.Mystic,
    advantages: advantageGroups.Mystic,
    feats: classFeats.Mystic,
    equipment: getEquipment('Mystic'),
    magicPaths: magicPathsByClass.Mystic,
    axes: classAxes.Mystic
  },
  Rogue: {
    minima: classMinima.Rogue,
    advantages: advantageGroups.Rogue,
    feats: classFeats.Rogue,
    equipment: getEquipment('Rogue'),
    magicPaths: magicPathsByClass.Rogue,
    axes: classAxes.Rogue
  },
  Theurgist: {
    minima: classMinima.Theurgist,
    advantages: advantageGroups.Theurgist,
    feats: classFeats.Theurgist,
    equipment: getEquipment('Theurgist'),
    magicPaths: magicPathsByClass.Theurgist,
    axes: classAxes.Theurgist
  },
  Warrior: {
    minima: classMinima.Warrior,
    advantages: advantageGroups.Warrior,
    feats: classFeats.Warrior,
    equipment: getEquipment('Warrior'),
    magicPaths: magicPathsByClass.Warrior,
    axes: classAxes.Warrior
  }
};

export const levelInfo = [
  { level: 1, masteryDie: 'd4' },
  { level: 2, masteryDie: 'd6' },
  { level: 3, masteryDie: 'd8' },
  { level: 4, masteryDie: 'd10' },
  { level: 5, masteryDie: 'd12' }
] as const;

export const levels = [1, 2, 3, 4, 5] as const;

export const costToRankUpDie: Record<DieRank, number> = {
  d4: 6,
  d6: 8,
  d8: 10,
  d10: 12,
  d12: Infinity
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
export type BuildPhilosophy = keyof typeof buildPhilosophies;

export const levelProgression = {
  1: { masteryDice: 1, totalCP: 30, newCP: 30 },
  2: { masteryDice: 2, totalCP: 45, newCP: 15 },
  3: { masteryDice: 3, totalCP: 65, newCP: 20 },
  4: { masteryDice: 4, totalCP: 90, newCP: 25 },
  5: { masteryDice: 5, totalCP: 120, newCP: 30 }
} as const;

export const rookieProfiles = {
  Pure: { description: 'Basic racial and class minima only', cpBonus: 6 },
  Balanced: { description: 'Some advancement in key areas', cpBonus: 3 },
  Specialist: { description: 'Focused development', cpBonus: 0 }
} as const;

export interface Character {
  name: string;
  race: RaceName;
  class: ClassName;
  level: number;
  gender: 'Male' | 'Female';
  buildPhilosophy: BuildPhilosophy;
  abilities: Record<Ability, DieRank>;
  specialties: Record<Ability, Record<Specialty, DieRank>>;
  focuses: Record<Ability, Record<Focus, string>>;
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
