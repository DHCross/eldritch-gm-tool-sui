// Centralized game data for the Eldritch RPG 2nd Edition tools

export const dieRanks = ['d4', 'd6', 'd8', 'd10', 'd12'] as const;
export type DieRank = typeof dieRanks[number];

export const abilities = ['Competence', 'Prowess', 'Fortitude'] as const;
export type Ability = typeof abilities[number];

export const specialtiesByAbility = {
  Competence: ['Adroitness', 'Expertise', 'Perception'],
  Prowess: ['Agility', 'Melee', 'Precision'],
  Fortitude: ['Endurance', 'Strength', 'Willpower']
} as const satisfies Record<Ability, readonly string[]>;

export type SpecialtiesForAbility<A extends Ability> = typeof specialtiesByAbility[A][number];
export type Specialty = { [A in Ability]: SpecialtiesForAbility<A> }[Ability];

export const focusesBySpecialty = {
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

export type FocusesForSpecialty<S extends Specialty> = typeof focusesBySpecialty[S][number];
export type Focus = { [S in Specialty]: FocusesForSpecialty<S> }[Specialty];
export type FocusesForAbility<A extends Ability> = {
  [S in SpecialtiesForAbility<A>]: FocusesForSpecialty<S>;
}[SpecialtiesForAbility<A>];

export const focusesByAbility = Object.fromEntries(
  (Object.entries(specialtiesByAbility) as Array<[Ability, readonly Specialty[]]>).map(([ability, specs]) => [
    ability,
    specs.flatMap(spec => focusesBySpecialty[spec as Specialty])
  ])
) as { [A in Ability]: readonly FocusesForAbility<A>[] };

export const specialtyToAbility = Object.fromEntries(
  (Object.entries(specialtiesByAbility) as Array<[Ability, readonly Specialty[]]>).flatMap(([ability, specs]) =>
    specs.map(spec => [spec, ability])
  )
) as Record<Specialty, Ability>;

export const focusToSpecialty = Object.fromEntries(
  (Object.entries(focusesBySpecialty) as Array<[Specialty, readonly Focus[]]>).flatMap(([specialty, focusList]) =>
    focusList.map(focus => [focus, specialty])
  )
) as Record<Focus, Specialty>;

export const focusToAbility = Object.fromEntries(
  (Object.entries(focusToSpecialty) as Array<[Focus, Specialty]>).map(([focus, specialty]) => [
    focus,
    specialtyToAbility[specialty]
  ])
) as Record<Focus, Ability>;

export type FocusBonus = `+${number}`;

export interface MinimaBlock {
  abilities?: Partial<Record<Ability, DieRank>>;
  specialties?: Partial<Record<Specialty, DieRank>>;
  focuses?: Partial<Record<Focus, FocusBonus>>;
}

export const raceKeys = ['Human', 'Elf', 'Dwarf', 'Gnome', 'Half-Elf', 'Half-Orc', 'Halfling', 'Drakkin'] as const;
export type RaceKey = typeof raceKeys[number];

export interface RaceData {
  minima: MinimaBlock;
  advantages: readonly string[];
  flaws?: readonly string[];
}

export const classKeys = ['Adept', 'Assassin', 'Barbarian', 'Mage', 'Mystic', 'Rogue', 'Theurgist', 'Warrior'] as const;
export type ClassKey = typeof classKeys[number];

export const magicPaths = {
  Thaumaturgy: {
    description: 'Disciplined arcane formulae and ritual spellcraft',
    primaryAbility: 'Competence' as Ability
  },
  Elementalism: {
    description: 'Mastery of the classical elements and primal forces',
    primaryAbility: 'Competence' as Ability
  },
  Sorcery: {
    description: 'Innate arcane power channeled through will',
    primaryAbility: 'Competence' as Ability
  },
  Mysticism: {
    description: 'Psychic intuition, spiritual insight, and inner focus',
    primaryAbility: 'Fortitude' as Ability
  },
  Druidry: {
    description: 'Primal magic guided by the balance of nature',
    primaryAbility: 'Fortitude' as Ability
  },
  Hieraticism: {
    description: 'Divine channeling through faith and conviction',
    primaryAbility: 'Fortitude' as Ability
  }
} as const;
export type MagicPathKey = keyof typeof magicPaths;

export const startingEquipment = {
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
  byClass: {
    Adept: ['Book of knowledge (area of expertise)'],
    Assassin: ['Assassin hood, jacket, cape, robe, or tunic'],
    Barbarian: ['Garments of woven wool or linen', 'Tunic', 'Overcoat or cloak'],
    Mage: ['Spellbook', 'Staff or focus item'],
    Mystic: ['Robes or shawl', 'Cloak', 'Armor up to leather'],
    Rogue: ["Set of thieves' tools", 'Light armor (up to leather)', 'One weapon'],
    Theurgist: ['Prayer book', 'Holy relic or symbol', 'Focus item', 'Armor up to chain'],
    Warrior: ['One weapon of choice', 'Armor up to chain', 'Small to large shield', 'Steed']
  }
} as const satisfies {
  common: readonly string[];
  byClass: Record<ClassKey, readonly string[]>;
};

export interface ClassData {
  minima: MinimaBlock;
  magicPaths: readonly MagicPathKey[];
  axes: readonly string[];
  advantages: readonly string[];
  feats: readonly string[];
  startingEquipment: readonly string[];
}

export const races: Record<RaceKey, RaceData> = {
  Human: {
    minima: {
      abilities: { Competence: 'd6', Prowess: 'd6', Fortitude: 'd4' },
      specialties: { Melee: 'd4', Willpower: 'd6' },
      focuses: { Threat: '+1' }
    },
    advantages: ['Fortunate', 'Survival']
  },
  Elf: {
    minima: {
      abilities: { Competence: 'd6', Prowess: 'd4' },
      specialties: { Expertise: 'd6', Agility: 'd4' },
      focuses: { Wizardry: '+1', Reaction: '+1' }
    },
    advantages: ['Night Vision', 'Gift of Magic', 'Magic Resistance (+1)']
  },
  Dwarf: {
    minima: {
      abilities: { Prowess: 'd6', Fortitude: 'd8' },
      specialties: { Endurance: 'd4', Melee: 'd6' }
    },
    advantages: ['Night Vision', 'Strong-willed', 'Sense of Direction']
  },
  Gnome: {
    minima: {
      abilities: { Competence: 'd4' },
      specialties: { Adroitness: 'd6', Expertise: 'd6', Perception: 'd4' },
      focuses: { Perspicacity: '+1' }
    },
    advantages: ['Eidetic Memory', 'Low-Light Vision', 'Observant']
  },
  'Half-Elf': {
    minima: {
      abilities: { Competence: 'd6', Prowess: 'd6', Fortitude: 'd4' },
      specialties: { Agility: 'd4', Endurance: 'd4', Willpower: 'd4' }
    },
    advantages: ['Heightened Senses', 'Low-Light Vision', 'Magic Resistance (+1)']
  },
  'Half-Orc': {
    minima: {
      abilities: { Fortitude: 'd6' },
      specialties: { Strength: 'd8', Endurance: 'd6' },
      focuses: { Ferocity: '+1' }
    },
    advantages: ['Low-light Vision', 'Intimidation', 'Menacing'],
    flaws: ['Ugliness']
  },
  Halfling: {
    minima: {
      abilities: { Competence: 'd6', Fortitude: 'd6' },
      specialties: { Adroitness: 'd6', Willpower: 'd4' },
      focuses: { Cleverness: '+1', Courage: '+1' }
    },
    advantages: ['Low Light Vision', 'Read Emotions', 'Resilient'],
    flaws: ['Restriction: small weapons only']
  },
  Drakkin: {
    minima: {
      abilities: { Competence: 'd6', Prowess: 'd6', Fortitude: 'd6' },
      specialties: { Endurance: 'd6', Strength: 'd4' }
    },
    advantages: ['Natural Armor', 'Breath Weapon', 'Night Vision']
  }
} as const;

export const classes: Record<ClassKey, ClassData> = {
  Adept: {
    minima: {
      abilities: { Competence: 'd6' },
      specialties: { Adroitness: 'd4', Expertise: 'd6', Perception: 'd4' },
      focuses: { Cleverness: '+1', Wizardry: '+1', Perspicacity: '+1' }
    },
    magicPaths: ['Thaumaturgy', 'Elementalism', 'Sorcery'],
    axes: ['Competence', 'Expertise', 'Adroitness', 'Perception', 'Cleverness', 'Wizardry', 'Perspicacity'],
    advantages: ['Arcanum', 'Gift of Magic', 'Literacy', 'Scholar'],
    feats: ['Guile', 'Lore', 'Ritual Magic', 'Quick-witted'],
    startingEquipment: startingEquipment.byClass.Adept
  },
  Assassin: {
    minima: {
      abilities: { Competence: 'd4', Prowess: 'd4' },
      specialties: { Adroitness: 'd6', Perception: 'd4', Agility: 'd4', Endurance: 'd6', Melee: 'd4' },
      focuses: { Finesse: '+1' }
    },
    magicPaths: [],
    axes: ['Prowess', 'Agility', 'Melee', 'Competence', 'Adroitness', 'Finesse', 'Speed', 'Perception'],
    advantages: ['Expeditious', 'Heightened Senses (hearing)', 'Observant', 'Read Emotions'],
    feats: ['Death Strike', 'Lethal Exploit', 'Ranged Ambush', 'Shadow Walk'],
    startingEquipment: startingEquipment.byClass.Assassin
  },
  Barbarian: {
    minima: {
      abilities: { Prowess: 'd6', Fortitude: 'd4' },
      specialties: { Melee: 'd8', Strength: 'd4' },
      focuses: { Ferocity: '+1' }
    },
    magicPaths: [],
    axes: ['Prowess', 'Melee', 'Strength', 'Fortitude', 'Endurance', 'Ferocity', 'Might', 'Vitality'],
    advantages: ['Animal Affinity', 'Brutishness', 'Menacing', 'Resilient'],
    feats: ['Berserk', 'Brawl', 'Feat of Strength', 'Grapple'],
    startingEquipment: startingEquipment.byClass.Barbarian
  },
  Mage: {
    minima: {
      abilities: { Competence: 'd6', Fortitude: 'd4' },
      specialties: { Expertise: 'd8', Willpower: 'd6' },
      focuses: { Wizardry: '+1', Resistance: '+1' }
    },
    magicPaths: ['Thaumaturgy', 'Elementalism', 'Sorcery'],
    axes: ['Competence', 'Expertise', 'Wizardry', 'Fortitude', 'Willpower', 'Resistance', 'Perception'],
    advantages: ['Arcanum', 'Gift of Magic', 'Magic Defense', 'Scholar'],
    feats: ['Arcane Finesse', 'Dweomers', 'Intangible Threat', 'Path Mastery'],
    startingEquipment: startingEquipment.byClass.Mage
  },
  Mystic: {
    minima: {
      abilities: { Competence: 'd6', Prowess: 'd4', Fortitude: 'd4' },
      specialties: { Expertise: 'd6', Melee: 'd4', Endurance: 'd6' },
      focuses: { Wizardry: '+1', Resilience: '+1', Vitality: '+2' }
    },
    magicPaths: ['Mysticism'],
    axes: ['Fortitude', 'Willpower', 'Competence', 'Expertise', 'Endurance', 'Prowess', 'Melee', 'Resilience', 'Vitality'],
    advantages: ['Empathic', 'Gift of Magic', 'Intuitive', 'Magic Resistance (Lesser)', 'Strong-Willed'],
    feats: ['Iron Mind', 'Path Mastery', 'Premonition', 'Psychic Powers'],
    startingEquipment: startingEquipment.byClass.Mystic
  },
  Rogue: {
    minima: {
      abilities: { Competence: 'd4', Prowess: 'd6' },
      specialties: { Adroitness: 'd4', Perception: 'd4', Agility: 'd8' },
      focuses: { Skulduggery: '+1' }
    },
    magicPaths: [],
    axes: ['Prowess', 'Agility', 'Competence', 'Adroitness', 'Perception', 'Skulduggery', 'Cleverness', 'Speed'],
    advantages: ['Expeditious', 'Fortunate', 'Streetwise', 'Underworld Contacts'],
    feats: ['Backstab', 'Evasion', 'Roguish Charm', 'Stealth'],
    startingEquipment: startingEquipment.byClass.Rogue
  },
  Theurgist: {
    minima: {
      abilities: { Competence: 'd8', Fortitude: 'd6' },
      specialties: { Expertise: 'd4', Willpower: 'd4' },
      focuses: { Theurgy: '+1' }
    },
    magicPaths: ['Druidry', 'Hieraticism'],
    axes: ['Competence', 'Expertise', 'Theurgy', 'Fortitude', 'Willpower', 'Endurance', 'Courage'],
    advantages: ['Gift of Magic', 'Magic Defense', 'Religion', 'Strong-Willed'],
    feats: ['Divine Healing', 'Path Mastery', 'Spiritual Smite', 'Supernatural Intervention'],
    startingEquipment: startingEquipment.byClass.Theurgist
  },
  Warrior: {
    minima: {
      abilities: { Prowess: 'd8', Fortitude: 'd6' },
      specialties: { Melee: 'd6' },
      focuses: { Threat: '+1' }
    },
    magicPaths: [],
    axes: ['Prowess', 'Melee', 'Strength', 'Fortitude', 'Endurance', 'Threat', 'Agility', 'Might'],
    advantages: ['Commanding', 'Intimidation', 'Magic Resistance (+1)', 'Tactician'],
    feats: ['Battle Savvy', 'Maneuvers', 'Stunning Reversal', 'Sunder Foe'],
    startingEquipment: startingEquipment.byClass.Warrior
  }
} as const;

export const levelProgression = {
  1: { masteryDie: 'd4', totalCP: 30, newCP: 30 },
  2: { masteryDie: 'd6', totalCP: 45, newCP: 15 },
  3: { masteryDie: 'd8', totalCP: 65, newCP: 20 },
  4: { masteryDie: 'd10', totalCP: 90, newCP: 25 },
  5: { masteryDie: 'd12', totalCP: 120, newCP: 30 }
} as const satisfies Record<number, { masteryDie: DieRank; totalCP: number; newCP: number }>;

export const costToRankUpDie: Record<DieRank, number> = {
  d4: 6,
  d6: 8,
  d8: 10,
  d10: 12,
  d12: Infinity
};

export const focusStepCost = 4;

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

export const levels = Object.keys(levelProgression).map(level => Number(level)).sort((a, b) => a - b) as number[];

export const magicPathsByClass = Object.fromEntries(
  (Object.entries(classes) as Array<[ClassKey, ClassData]>).map(([klass, data]) => [klass, data.magicPaths])
) as Record<ClassKey, readonly MagicPathKey[]>;

export const casterClassKeys = (Object.entries(magicPathsByClass) as Array<[ClassKey, readonly MagicPathKey[]]>).
  filter(([, paths]) => paths.length > 0).
  map(([klass]) => klass);

export interface Character {
  name: string;
  race: RaceKey;
  class: ClassKey;
  level: number;
  gender: 'Male' | 'Female';
  buildPhilosophy: keyof typeof buildPhilosophies;
  abilities: Record<Ability, DieRank>;
  specialties: { [A in Ability]: Record<SpecialtiesForAbility<A>, DieRank> };
  focuses: { [A in Ability]: Record<FocusesForAbility<A>, FocusBonus> };
  magicPath?: MagicPathKey;
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
