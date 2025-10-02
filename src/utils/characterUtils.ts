
import {
  abilities,
  buildPhilosophies,
  casterClasses,
  classNames,
  classes,
  costToRankUpDie,
  costToRankUpFocus,
  dieRanks,
  foci,
  magicPathsByClass,
  raceNames,
  races,
  specs,
  type Ability,
  type Character,
  type ClassName,
  type DieRank,
  type Focus,
  type RaceName,
  type Specialty
} from '../data/gameData';

export function rollDie(sides: number): number {
  return Math.floor(Math.random() * sides) + 1;
}

export function getRandomElement<T>(array: readonly T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function getDieValue(die: DieRank): number {
  const values: Record<DieRank, number> = {
    d4: 4,
    d6: 6,
    d8: 8,
    d10: 10,
    d12: 12
  };
  return values[die];
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
  const values: Record<DieRank, number> = {
    d4: 2,
    d6: 3,
    d8: 4,
    d10: 5,
    d12: 6
  };
  return values[die];
}

export function calculateBattlePhase(prowessDie: DieRank, agilityDie: DieRank): number {
  const prowessValue = getDieValue(prowessDie);
  const agilityValue = getDieValue(agilityDie);
  return Math.floor((prowessValue + agilityValue) / 2);
}

export function calculateSpellCount(level: number, magicPath?: string): number {
  if (!magicPath) return 0;

  const baseSpells = Math.floor(level / 2) + 1;
  return Math.max(1, baseSpells);
}

const abilitySet = new Set<Ability>(abilities as readonly Ability[]);
const specialtyToAbility = new Map<Specialty, Ability>();
(Object.entries(specs) as Array<[Ability, readonly Specialty[]]>).forEach(([ability, specialtyList]) => {
  specialtyList.forEach(specialty => specialtyToAbility.set(specialty, ability));
});

interface FocusParent {
  ability: Ability;
  specialty: Specialty;
}

const focusToParents = new Map<Focus, FocusParent>();
(Object.entries(foci) as Array<[Specialty, readonly Focus[]]>).forEach(([specialty, focusList]) => {
  const ability = specialtyToAbility.get(specialty);
  if (!ability) return;
  focusList.forEach(focus => focusToParents.set(focus, { ability, specialty }));
});

function isDieRank(value: string): value is DieRank {
  return (dieRanks as readonly string[]).includes(value);
}

function parseFocusBonus(value: string | number | undefined): number {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  const match = String(value).match(/-?\d+/);
  return match ? parseInt(match[0], 10) : 0;
}

function formatFocusBonus(value: number): string {
  return value >= 0 ? `+${value}` : `${value}`;
}

function applyMinimaToCharacter(character: Character, minima: Record<string, string>) {
  Object.entries(minima || {}).forEach(([key, requirement]) => {
    if (!requirement) return;

    if (abilitySet.has(key as Ability) && isDieRank(requirement)) {
      const ability = key as Ability;
      if (dieRanks.indexOf(character.abilities[ability]) < dieRanks.indexOf(requirement)) {
        character.abilities[ability] = requirement;
      }
      return;
    }

    const specialtyParent = specialtyToAbility.get(key as Specialty);
    if (specialtyParent && isDieRank(requirement)) {
      const specialty = key as Specialty;
      const current = character.specialties[specialtyParent][specialty];
      if (dieRanks.indexOf(current) < dieRanks.indexOf(requirement)) {
        character.specialties[specialtyParent][specialty] = requirement;
      }
      return;
    }

    const focusParent = focusToParents.get(key as Focus);
    if (focusParent) {
      const focus = key as Focus;
      const requiredValue = parseFocusBonus(requirement);
      const currentValue = parseFocusBonus(character.focuses[focusParent.ability][focus]);
      if (currentValue < requiredValue) {
        character.focuses[focusParent.ability][focus] = formatFocusBonus(requiredValue);
      }
    }
  });
}

export function generateRandomName(race: RaceName, gender: 'Male' | 'Female'): string {
  const nameDatabase: Record<RaceName, { Male: string[]; Female: string[] }> = {
    Human: {
      Male: ['Aiden', 'Blake', 'Connor', 'Derek', 'Ethan', 'Felix', 'Gabriel', 'Henry'],
      Female: ['Alice', 'Bella', 'Claire', 'Diana', 'Emma', 'Fiona', 'Grace', 'Hannah']
    },
    Dwarf: {
      Male: ['Thorin', 'Balin', 'Dwalin', 'Gloin', 'Gimli', 'Dain', 'Nali', 'Ori'],
      Female: ['Disa', 'Nala', 'Vera', 'Kili', 'Mira', 'Tova', 'Rina', 'Hela']
    },
    Elf: {
      Male: ['Legolas', 'Elrond', 'Thranduil', 'Celeborn', 'Haldir', 'Lindir', 'Erestor', 'Glorfindel'],
      Female: ['Arwen', 'Galadriel', 'Tauriel', 'Elaria', 'Nimrodel', 'Idril', 'Luthien', 'Celebrian']
    },
    Halfling: {
      Male: ['Frodo', 'Bilbo', 'Samwise', 'Merry', 'Pippin', 'Hamfast', 'Mungo', 'Bungo'],
      Female: ['Rosie', 'Pearl', 'Lily', 'Daisy', 'Poppy', 'Primula', 'Lobelia', 'Belladonna']
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
    Drakkin: {
      Male: ['Vaelor', 'Seryth', 'Kalyth', 'Drazor', 'Iveron', 'Zareth', 'Maelor', 'Kharos'],
      Female: ['Vaela', 'Seris', 'Kalira', 'Drazia', 'Ivera', 'Zareen', 'Maela', 'Khari']
    }
  };

  const names = nameDatabase[race]?.[gender] || nameDatabase.Human[gender];
  return getRandomElement(names);
}

export function validateCharacterBuild(character: Character): string[] {
  const warnings: string[] = [];
  const raceData = races[character.race];
  const classData = classes[character.class as ClassName];

  const checkMinima = (label: 'racial' | 'class', minima?: Record<string, string>) => {
    if (!minima) return;
    Object.entries(minima).forEach(([key, requirement]) => {
      if (!requirement) return;

      if (abilitySet.has(key as Ability) && isDieRank(requirement)) {
        const ability = key as Ability;
        if (dieRanks.indexOf(character.abilities[ability]) < dieRanks.indexOf(requirement)) {
          warnings.push(`${ability} is below ${label} minimum (${requirement})`);
        }
        return;
      }

      const specialtyParent = specialtyToAbility.get(key as Specialty);
      if (specialtyParent && isDieRank(requirement)) {
        const specialty = key as Specialty;
        if (dieRanks.indexOf(character.specialties[specialtyParent][specialty]) < dieRanks.indexOf(requirement)) {
          warnings.push(`${specialty} specialty is below ${label} minimum (${requirement})`);
        }
        return;
      }

      const focusParent = focusToParents.get(key as Focus);
      if (focusParent) {
        const focus = key as Focus;
        const requiredValue = parseFocusBonus(requirement);
        const currentValue = parseFocusBonus(character.focuses[focusParent.ability][focus]);
        if (currentValue < requiredValue) {
          warnings.push(`${focus} focus is below ${label} minimum (${formatFocusBonus(requiredValue)})`);
        }
      }
    });
  };

  checkMinima('racial', raceData?.minima);
  checkMinima('class', classData?.minima);

  if (character.cp.spent > character.cp.total) {
    warnings.push(`Over CP budget by ${character.cp.spent - character.cp.total} points`);
  }

  const philosophy = buildPhilosophies[character.buildPhilosophy];
  const softCapAbility = philosophy.softCaps.abilities as DieRank;

  (abilities as readonly Ability[]).forEach(ability => {
    const current = character.abilities[ability];
    if (dieRanks.indexOf(current) > dieRanks.indexOf(softCapAbility)) {
      warnings.push(`${ability} exceeds ${character.buildPhilosophy} soft cap (${softCapAbility})`);
    }
  });

  return warnings;
}

export function createEmptyCharacter(): Character {
  const abilityRanks = {} as Record<Ability, DieRank>;
  const specialtyRanks = {} as Record<Ability, Record<Specialty, DieRank>>;
  const focusRanks = {} as Record<Ability, Record<Focus, string>>;

  (abilities as readonly Ability[]).forEach(ability => {
    abilityRanks[ability] = 'd4';
    specialtyRanks[ability] = {} as Record<Specialty, DieRank>;
    focusRanks[ability] = {} as Record<Focus, string>;

    specs[ability].forEach(specialty => {
      specialtyRanks[ability][specialty] = 'd4';
      foci[specialty].forEach(focus => {
        focusRanks[ability][focus] = '+0';
      });
    });
  });

  return {
    name: '',
    race: raceNames[0],
    class: classNames[classNames.length - 1],
    level: 1,
    gender: 'Male',
    buildPhilosophy: 'Balanced',
    abilities: abilityRanks,
    specialties: specialtyRanks,
    focuses: focusRanks,
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

export function calculateCharacterCPSpent(character: Character): number {
  let spent = 0;

  (abilities as readonly Ability[]).forEach(ability => {
    spent += calculateCPCost('d4', character.abilities[ability]);

    Object.values(character.specialties[ability]).forEach(specRank => {
      spent += calculateCPCost('d4', specRank);
    });

    Object.values(character.focuses[ability]).forEach(focusValue => {
      spent += parseFocusBonus(focusValue) * costToRankUpFocus;
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

export function generateRandomCharacter(): Character {
  const race = getRandomElement(raceNames);
  const characterClass = getRandomElement(classNames);
  const gender = getRandomElement(['Male', 'Female'] as const);
  const name = generateRandomName(race, gender);
  const buildPhilosophy = getRandomElement(['Balanced', 'Hybrid', 'Specialist'] as const);

  const character = createEmptyCharacter();
  character.name = name;
  character.race = race;
  character.class = characterClass;
  character.gender = gender;
  character.buildPhilosophy = buildPhilosophy;

  applyMinimaToCharacter(character, races[race]?.minima || {});
  applyMinimaToCharacter(character, classes[characterClass]?.minima || {});

  const magicPaths = magicPathsByClass[characterClass] || [];
  if (magicPaths.length > 0) {
    character.magicPath = getRandomElement(magicPaths);
  }

  character.cp.spent = calculateCharacterCPSpent(character);
  character.cp.available = character.cp.total - character.cp.spent;
  updateDerivedStats(character);

  return character;
}
