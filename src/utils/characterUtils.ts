import {
  Ability,
  Character,
  ClassKey,
  DieRank,
  Focus,
  FocusBonus,
  MagicPathKey,
  MinimaBlock,
  RaceKey,
  abilities,
  buildPhilosophies,
  casterClassKeys,
  classes,
  costToRankUpDie,
  dieRanks,
  focusStepCost,
  focusToAbility,
  focusesByAbility,
  races,
  specialtiesByAbility,
  specialtyToAbility
} from '../data/gameData';

export function rollDie(sides: number): number {
  return Math.floor(Math.random() * sides) + 1;
}

export function getRandomElement<T>(array: readonly T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

const baseDie: DieRank = 'd4';

const dieRankValues: Record<DieRank, number> = {
  d4: 4,
  d6: 6,
  d8: 8,
  d10: 10,
  d12: 12
};

export function getDieValue(die: DieRank): number {
  return dieRankValues[die];
}

export function getNextDieRank(current: DieRank): DieRank | null {
  const currentIndex = dieRanks.indexOf(current);
  return currentIndex < dieRanks.length - 1 ? dieRanks[currentIndex + 1] : null;
}

export function getPreviousDieRank(current: DieRank): DieRank | null {
  const currentIndex = dieRanks.indexOf(current);
  return currentIndex > 0 ? dieRanks[currentIndex - 1] : null;
}

export function calculateCPCost(fromDie: DieRank, toDie: DieRank): number {
  const fromIndex = dieRanks.indexOf(fromDie);
  const toIndex = dieRanks.indexOf(toDie);

  if (toIndex <= fromIndex) return 0;

  let cost = 0;
  for (let i = fromIndex; i < toIndex; i++) {
    cost += costToRankUpDie[dieRanks[i]];
  }
  return cost;
}

export function getDefensePool(die: DieRank): number {
  const poolValues: Record<DieRank, number> = {
    d4: 2,
    d6: 3,
    d8: 4,
    d10: 5,
    d12: 6
  };
  return poolValues[die];
}

export function calculateBattlePhase(prowessDie: DieRank, agilityDie: DieRank): number {
  const prowessValue = getDieValue(prowessDie);
  const agilityValue = getDieValue(agilityDie);
  return Math.floor((prowessValue + agilityValue) / 2);
}

export function calculateSpellCount(level: number, magicPath?: MagicPathKey): number {
  if (!magicPath) return 0;

  const baseSpells = Math.floor(level / 2) + 1;
  return Math.max(1, baseSpells);
}

function focusBonusToNumber(bonus: FocusBonus | string | undefined): number {
  if (!bonus) return 0;
  return parseInt(String(bonus).replace('+', ''), 10) || 0;
}

function formatFocusBonus(value: number): FocusBonus {
  return (`+${value}`) as FocusBonus;
}

export function generateRandomName(race: RaceKey, gender: 'Male' | 'Female'): string {
  const nameDatabase: Record<RaceKey, Record<'Male' | 'Female', string[]>> = {
    Human: {
      Male: ['Aiden', 'Blake', 'Connor', 'Derek', 'Ethan', 'Felix', 'Gabriel', 'Henry'],
      Female: ['Alice', 'Bella', 'Claire', 'Diana', 'Emma', 'Fiona', 'Grace', 'Hannah']
    },
    Elf: {
      Male: ['Legolas', 'Elrond', 'Thranduil', 'Celeborn', 'Haldir', 'Lindir', 'Erestor', 'Glorfindel'],
      Female: ['Arwen', 'Galadriel', 'Tauriel', 'Elaria', 'Nimrodel', 'Idril', 'Luthien', 'Celebrian']
    },
    Dwarf: {
      Male: ['Thorin', 'Balin', 'Dwalin', 'Gloin', 'Gimli', 'Dain', 'Nali', 'Ori'],
      Female: ['Disa', 'Nala', 'Vera', 'Kili', 'Mira', 'Tova', 'Rina', 'Hela']
    },
    Gnome: {
      Male: ['Gimble', 'Fonkin', 'Wrenn', 'Boddynock', 'Dimble', 'Glim', 'Gerrig', 'Namfoodle'],
      Female: ['Bimpnottin', 'Breena', 'Caramip', 'Carlin', 'Donella', 'Duvamil', 'Ella', 'Kars']
    },
    'Half-Elf': {
      Male: ['Aelar', 'Berris', 'Dayereth', 'Enna', 'Galinndan', 'Hadarai', 'Immeral', 'Ivellios'],
      Female: ['Andra', 'Dara', 'Diesa', 'Eldara', 'Halimath', 'Helja', 'Hlin', 'Kathra']
    },
    'Half-Orc': {
      Male: ['Dench', 'Feng', 'Gell', 'Henk', 'Holg', 'Imsh', 'Keth', 'Krusk'],
      Female: ['Baggi', 'Emen', 'Engong', 'Kansif', 'Myev', 'Neega', 'Ovak', 'Ownka']
    },
    Halfling: {
      Male: ['Frodo', 'Bilbo', 'Samwise', 'Merry', 'Pippin', 'Hamfast', 'Mungo', 'Bungo'],
      Female: ['Rosie', 'Pearl', 'Lily', 'Daisy', 'Poppy', 'Primula', 'Lobelia', 'Belladonna']
    },
    Drakkin: {
      Male: ['Azhur', 'Dravos', 'Kaelith', 'Mordran', 'Rhyzor', 'Saryth', 'Tarkesh', 'Zerath'],
      Female: ['Azura', 'Delyth', 'Kaelis', 'Lanyra', 'Mireth', 'Rhyla', 'Seris', 'Zeryn']
    }
  };

  const fallback = nameDatabase.Human;
  const names = nameDatabase[race] || fallback;
  return getRandomElement(names[gender] || fallback[gender]);
}

function ensureDieAtLeast(current: DieRank, required: DieRank): DieRank {
  return dieRanks.indexOf(current) < dieRanks.indexOf(required) ? required : current;
}

export function applyMinima(target: Pick<Character, 'abilities' | 'specialties' | 'focuses'>, minima: MinimaBlock): void {
  if (minima.abilities) {
    Object.entries(minima.abilities).forEach(([abilityKey, required]) => {
      const ability = abilityKey as Ability;
      if (!required) return;
      target.abilities[ability] = ensureDieAtLeast(target.abilities[ability], required);
    });
  }

  if (minima.specialties) {
    Object.entries(minima.specialties).forEach(([specialtyKey, required]) => {
      const specialty = specialtyKey as keyof typeof specialtyToAbility;
      if (!required) return;
      const ability = specialtyToAbility[specialty];
      const bucket = target.specialties[ability] as Record<string, DieRank>;
      const current = bucket[specialty as string] as DieRank | undefined;
      bucket[specialty as string] = ensureDieAtLeast(current ?? baseDie, required);
    });
  }

  if (minima.focuses) {
    Object.entries(minima.focuses).forEach(([focusKey, required]) => {
      const focus = focusKey as Focus;
      if (!required) return;
      const ability = focusToAbility[focus];
      const bucket = target.focuses[ability] as Record<string, FocusBonus>;
      const current = focusBonusToNumber(bucket[focus as string]);
      const minimum = focusBonusToNumber(required);
      if (current < minimum) {
        bucket[focus as string] = formatFocusBonus(minimum);
      }
    });
  }
}

export function validateCharacterBuild(character: Character): string[] {
  const warnings: string[] = [];
  const raceData = races[character.race];
  const classData = classes[character.class];

  const checkMinima = (label: string, minima: MinimaBlock) => {
    if (minima.abilities) {
      Object.entries(minima.abilities).forEach(([abilityKey, required]) => {
        if (!required) return;
        const ability = abilityKey as Ability;
        if (dieRanks.indexOf(character.abilities[ability]) < dieRanks.indexOf(required)) {
          warnings.push(`${ability} is below ${label} minimum (${required})`);
        }
      });
    }

    if (minima.specialties) {
      Object.entries(minima.specialties).forEach(([specialtyKey, required]) => {
        if (!required) return;
        const specialty = specialtyKey as keyof typeof specialtyToAbility;
        const ability = specialtyToAbility[specialty];
        const bucket = character.specialties[ability] as Record<string, DieRank>;
        const current = bucket[specialty as string] as DieRank | undefined;
        if (!current || dieRanks.indexOf(current) < dieRanks.indexOf(required)) {
          warnings.push(`${specialty} is below ${label} minimum (${required})`);
        }
      });
    }

    if (minima.focuses) {
      Object.entries(minima.focuses).forEach(([focusKey, required]) => {
        if (!required) return;
        const focus = focusKey as Focus;
        const ability = focusToAbility[focus];
        const bucket = character.focuses[ability] as Record<string, FocusBonus>;
        const current = focusBonusToNumber(bucket[focus as string]);
        const requiredValue = focusBonusToNumber(required);
        if (current < requiredValue) {
          warnings.push(`${focus} is below ${label} minimum (+${requiredValue})`);
        }
      });
    }
  };

  checkMinima('racial', raceData.minima);
  checkMinima('class', classData.minima);

  if (character.cp.spent > character.cp.total) {
    warnings.push(`Over CP budget by ${character.cp.spent - character.cp.total} points`);
  }

  const philosophy = buildPhilosophies[character.buildPhilosophy];
  const softCapAbility = philosophy.softCaps.abilities;

  abilities.forEach(ability => {
    if (dieRanks.indexOf(character.abilities[ability]) > dieRanks.indexOf(softCapAbility)) {
      warnings.push(`${ability} exceeds ${character.buildPhilosophy} soft cap (${softCapAbility})`);
    }
  });

  return warnings;
}

export function createEmptyCharacter(): Character {
  const abilityRanks = abilities.reduce((acc, ability) => {
    acc[ability] = baseDie;
    return acc;
  }, {} as Record<Ability, DieRank>);

  const specialties = {} as Character['specialties'];
  const focuses = {} as Character['focuses'];

  abilities.forEach(ability => {
    specialties[ability] = {} as Character['specialties'][Ability];
    focuses[ability] = {} as Character['focuses'][Ability];

    specialtiesByAbility[ability].forEach(specialty => {
      (specialties[ability] as Record<string, DieRank>)[specialty as string] = baseDie;
    });

    focusesByAbility[ability].forEach(focus => {
      (focuses[ability] as Record<string, FocusBonus>)[focus as string] = '+0' as FocusBonus;
    });
  });

  return {
    name: '',
    race: 'Human',
    class: 'Warrior',
    level: 1,
    gender: 'Male',
    buildPhilosophy: 'Balanced',
    abilities: abilityRanks,
    specialties,
    focuses,
    magicPath: undefined,
    iconicInheritance: false,
    cp: {
      total: 30,
      spent: 0,
      available: 30
    },
    derivedStats: {
      adp: 2,
      pdp: 2,
      sdp: 2,
      battlePhase: 4,
      spellCount: 0
    }
  };
}

export function generateRandomCharacter(): Character {
  const race = getRandomElement(Object.keys(races) as RaceKey[]);
  const characterClass = getRandomElement(Object.keys(classes) as ClassKey[]);
  const gender = getRandomElement(['Male', 'Female'] as const);
  const name = generateRandomName(race, gender);
  const buildPhilosophy = getRandomElement(['Balanced', 'Hybrid', 'Specialist'] as const);

  const character = createEmptyCharacter();
  character.name = name;
  character.race = race;
  character.class = characterClass;
  character.gender = gender;
  character.buildPhilosophy = buildPhilosophy;

  applyMinima(character, races[race].minima);
  applyMinima(character, classes[characterClass].minima);

  const magicPaths = classes[characterClass].magicPaths;
  character.magicPath = magicPaths.length > 0 ? getRandomElement(magicPaths) : undefined;

  character.cp.spent = calculateCharacterCPSpent(character);
  character.cp.available = character.cp.total - character.cp.spent;
  updateDerivedStats(character);

  return character;
}

export function calculateCharacterCPSpent(character: Character): number {
  let spent = 0;

  abilities.forEach(ability => {
    spent += calculateCPCost(baseDie, character.abilities[ability]);

    specialtiesByAbility[ability].forEach(specialty => {
      const bucket = character.specialties[ability] as Record<string, DieRank>;
      const current = bucket[specialty as string] as DieRank | undefined;
      spent += calculateCPCost(baseDie, current ?? baseDie);
    });

    focusesByAbility[ability].forEach(focus => {
      const bucket = character.focuses[ability] as Record<string, FocusBonus>;
      const focusValue = focusBonusToNumber(bucket[focus as string]);
      spent += focusValue * focusStepCost;
    });
  });

  if (character.iconicInheritance) {
    spent += 4;
  }

  return spent;
}

export function updateDerivedStats(character: Character): void {
  character.derivedStats.adp = getDefensePool(character.abilities.Prowess);
  character.derivedStats.pdp = getDefensePool(character.abilities.Fortitude);
  character.derivedStats.sdp = getDefensePool(character.abilities.Competence);

  character.derivedStats.battlePhase = calculateBattlePhase(
    character.abilities.Prowess,
    character.specialties.Prowess.Agility
  );

  character.derivedStats.spellCount = calculateSpellCount(character.level, character.magicPath);
}

export function isCasterClass(klass: ClassKey): boolean {
  return casterClassKeys.includes(klass);
}
