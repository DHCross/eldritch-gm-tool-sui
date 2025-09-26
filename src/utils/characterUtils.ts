import {
  Character,
  DieRank,
  dieRanks,
  abilities,
  races,
  classes,
  costToRankUpDie,
  buildPhilosophies
} from '../data/gameData';

export function rollDie(sides: number): number {
  return Math.floor(Math.random() * sides) + 1;
}

export function getRandomElement<T>(array: readonly T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function getDieValue(die: DieRank): number {
  const values: Record<DieRank, number> = {
    'd4': 4, 'd6': 6, 'd8': 8, 'd10': 10, 'd12': 12
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
    'd4': 2, 'd6': 3, 'd8': 4, 'd10': 5, 'd12': 6
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

export function generateRandomName(race: keyof typeof races, gender: 'Male' | 'Female'): string {
  const nameDatabase = {
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
    Tiefling: {
      Male: ['Akmenos', 'Amnon', 'Barakas', 'Damakos', 'Ekemon', 'Iados', 'Kairon', 'Leucis'],
      Female: ['Akta', 'Anakir', 'Bryseis', 'Criella', 'Damaia', 'Ea', 'Kallista', 'Lerissa']
    }
  };

  const names = nameDatabase[race]?.[gender] || nameDatabase.Human[gender];
  return getRandomElement(names);
}

export function validateCharacterBuild(character: Character): string[] {
  const warnings: string[] = [];
  const raceData = races[character.race as keyof typeof races];
  const classData = classes[character.class as keyof typeof classes];

  // Check racial minima
  abilities.forEach(ability => {
    const minimum = raceData.minima[ability] as DieRank;
    const current = character.abilities[ability] as DieRank;
    if (dieRanks.indexOf(current) < dieRanks.indexOf(minimum)) {
      warnings.push(`${ability} is below racial minimum (${minimum})`);
    }
  });

  // Check class minima
  abilities.forEach(ability => {
    const minimum = classData.minima[ability] as DieRank;
    const current = character.abilities[ability] as DieRank;
    if (dieRanks.indexOf(current) < dieRanks.indexOf(minimum)) {
      warnings.push(`${ability} is below class minimum (${minimum})`);
    }
  });

  // Check CP budget
  if (character.cp.spent > character.cp.total) {
    warnings.push(`Over CP budget by ${character.cp.spent - character.cp.total} points`);
  }

  // Check build philosophy soft caps
  const philosophy = buildPhilosophies[character.buildPhilosophy];
  const softCapAbility = philosophy.softCaps.abilities;

  abilities.forEach(ability => {
    const current = character.abilities[ability] as DieRank;
    if (dieRanks.indexOf(current) > dieRanks.indexOf(softCapAbility)) {
      warnings.push(`${ability} exceeds ${character.buildPhilosophy} soft cap (${softCapAbility})`);
    }
  });

  return warnings;
}

export function createEmptyCharacter(): Character {
  return {
    name: '',
    race: 'Human',
    class: 'Fighter',
    level: 1,
    gender: 'Male',
    buildPhilosophy: 'Balanced',
    abilities: {
      Competence: 'd4',
      Prowess: 'd4',
      Fortitude: 'd4'
    },
    specialties: {
      Adroitness: 'd4',
      Expertise: 'd4',
      Perception: 'd4',
      Agility: 'd4',
      Melee: 'd4',
      Precision: 'd4',
      Endurance: 'd4',
      Strength: 'd4',
      Willpower: 'd4'
    },
    focuses: {},
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
  const race = getRandomElement(Object.keys(races) as Array<keyof typeof races>);
  const characterClass = getRandomElement(Object.keys(classes) as Array<keyof typeof classes>);
  const gender = getRandomElement(['Male', 'Female'] as const);
  const name = generateRandomName(race, gender);
  const buildPhilosophy = getRandomElement(['Balanced', 'Hybrid', 'Specialist'] as const);

  const character = createEmptyCharacter();
  character.name = name;
  character.race = race;
  character.class = characterClass;
  character.gender = gender;
  character.buildPhilosophy = buildPhilosophy;

  // Apply racial and class minima
  const raceData = races[race];
  const classData = classes[characterClass];

  abilities.forEach(ability => {
    const raceMin = raceData.minima[ability] as DieRank;
    const classMin = classData.minima[ability] as DieRank;
    const minimum = dieRanks.indexOf(raceMin) > dieRanks.indexOf(classMin) ? raceMin : classMin;
    character.abilities[ability] = minimum;
  });

  // Set magic path if applicable
  if (classData.magicPaths.length > 0) {
    character.magicPath = getRandomElement(classData.magicPaths);
  }

  // Calculate initial CP spent and derived stats
  character.cp.spent = calculateCharacterCPSpent(character);
  character.cp.available = character.cp.total - character.cp.spent;
  updateDerivedStats(character);

  return character;
}

export function calculateCharacterCPSpent(character: Character): number {
  let spent = 0;

  // Calculate ability costs
  abilities.forEach(ability => {
    const current = character.abilities[ability] as DieRank;
    spent += calculateCPCost('d4', current);
  });

  // Calculate specialty costs
  Object.values(character.specialties).forEach(specialty => {
    spent += calculateCPCost('d4', specialty as DieRank);
  });

  // Calculate focus costs
  Object.values(character.focuses).forEach(focus => {
    spent += calculateCPCost('d4', focus as DieRank);
  });

  // Add iconic inheritance cost
  if (character.iconicInheritance) {
    spent += 4;
  }

  return spent;
}

export function updateDerivedStats(character: Character): void {
  // Calculate defense pools
  character.derivedStats.adp = getDefensePool(character.abilities.Prowess as DieRank);
  character.derivedStats.pdp = getDefensePool(character.abilities.Fortitude as DieRank);
  character.derivedStats.sdp = getDefensePool(character.abilities.Competence as DieRank);

  // Calculate battle phase
  character.derivedStats.battlePhase = calculateBattlePhase(
    character.abilities.Prowess as DieRank,
    character.specialties.Agility as DieRank
  );

  // Calculate spell count
  character.derivedStats.spellCount = calculateSpellCount(character.level, character.magicPath);
}