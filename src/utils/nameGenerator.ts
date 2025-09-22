// Name Generation System for Eldritch RPG
// Based on "Extraordinary Book of Names"

export type Gender = 'Male' | 'Female' | 'Non-binary';
export type NameCulture = 'English' | 'Scottish' | 'Welsh' | 'Irish' | 'Norse' | 'French' | 'Germanic' | 'Fantasy';

interface NameSet {
  male: string[];
  female: string[];
  surnames?: string[];
}

// Sample name sets extracted from the Extraordinary Book of Names
export const NAME_SETS: Record<NameCulture, NameSet> = {
  English: {
    male: [
      'Adam', 'Adrian', 'Alan', 'Albert', 'Alexander', 'Alfred', 'Andrew', 'Anthony', 'Arthur', 'Benjamin',
      'Bernard', 'Brian', 'Charles', 'Christopher', 'Daniel', 'David', 'Edward', 'Eric', 'Francis', 'Frederick',
      'Geoffrey', 'George', 'Gilbert', 'Harold', 'Henry', 'Hugh', 'James', 'John', 'Joseph', 'Kenneth',
      'Leonard', 'Mark', 'Matthew', 'Michael', 'Nicholas', 'Oliver', 'Patrick', 'Paul', 'Peter', 'Philip',
      'Ralph', 'Richard', 'Robert', 'Roger', 'Samuel', 'Stephen', 'Thomas', 'Walter', 'William'
    ],
    female: [
      'Alice', 'Amanda', 'Angela', 'Ann', 'Anne', 'Barbara', 'Betty', 'Carol', 'Catherine', 'Christine',
      'Deborah', 'Diana', 'Dorothy', 'Elizabeth', 'Emily', 'Emma', 'Frances', 'Helen', 'Jane', 'Janet',
      'Jean', 'Jennifer', 'Jessica', 'Joan', 'Joyce', 'Julia', 'Karen', 'Katherine', 'Laura', 'Linda',
      'Lisa', 'Margaret', 'Maria', 'Marie', 'Mary', 'Michelle', 'Nancy', 'Patricia', 'Rebecca', 'Ruth',
      'Sandra', 'Sarah', 'Sharon', 'Susan', 'Teresa', 'Victoria', 'Virginia'
    ],
    surnames: [
      'Adams', 'Anderson', 'Baker', 'Brown', 'Clark', 'Davis', 'Evans', 'Garcia', 'Hall', 'Harris',
      'Jackson', 'Johnson', 'Jones', 'Lewis', 'Martin', 'Miller', 'Moore', 'Robinson', 'Smith', 'Taylor',
      'Thomas', 'Thompson', 'Turner', 'Walker', 'White', 'Williams', 'Wilson', 'Wood', 'Wright', 'Young'
    ]
  },

  Scottish: {
    male: [
      'Alasdair', 'Angus', 'Archie', 'Bruce', 'Callum', 'Cameron', 'Colin', 'Craig', 'Duncan', 'Ewan',
      'Fergus', 'Fraser', 'Gavin', 'Gordon', 'Graham', 'Grant', 'Hamish', 'Ian', 'Iain', 'Jamie',
      'Kenneth', 'Lachlan', 'Malcolm', 'Neil', 'Niall', 'Ross', 'Scott', 'Sean', 'Stewart', 'Stuart'
    ],
    female: [
      'Aileas', 'Aileen', 'Caoimhe', 'Fiona', 'Iona', 'Isla', 'Jean', 'Kirsty', 'Mairi', 'Morag',
      'Niamh', 'Sine', 'Sorcha'
    ],
    surnames: [
      'Campbell', 'MacDonald', 'MacLeod', 'Stewart', 'Thomson', 'Robertson', 'Anderson', 'MacKenzie',
      'Wilson', 'Morrison', 'Bell', 'Watson', 'Ferguson', 'Cameron', 'Clark', 'Ross', 'Young', 'Mitchell'
    ]
  },

  Welsh: {
    male: [
      'Dai', 'Dylan', 'Gareth', 'Gethin', 'Griffith', 'Gwilym', 'Huw', 'Iestyn', 'Ifor', 'Ioan',
      'Iolo', 'Iorwerth', 'Llew', 'Llywelyn', 'Meirion', 'Morgan', 'Owen', 'Rhys', 'Sion', 'Taliesin'
    ],
    female: [
      'Angharad', 'Bethan', 'Bronwen', 'Carys', 'Cerys', 'Elen', 'Gwen', 'Gwenlliant', 'Lowri',
      'Mair', 'Mali', 'Megan', 'Morwenna', 'Nerys', 'Olwen', 'Rhiannon', 'Sian', 'Tegwen'
    ],
    surnames: [
      'Davies', 'Evans', 'Griffiths', 'Hughes', 'Jenkins', 'Jones', 'Lewis', 'Morgan', 'Owen',
      'Phillips', 'Powell', 'Price', 'Pritchard', 'Roberts', 'Thomas', 'Williams'
    ]
  },

  Irish: {
    male: [
      'Aidan', 'Brian', 'Ciaran', 'Colm', 'Conor', 'Cormac', 'Daire', 'Declan', 'Eamon', 'Eoin',
      'Fergal', 'Finan', 'Fintan', 'Liam', 'Niall', 'Oisin', 'Padraig', 'Ruairi', 'Sean', 'Tadhg'
    ],
    female: [
      'Aine', 'Aoife', 'Brigid', 'Caoimhe', 'Ciara', 'Deirdre', 'Grainne', 'Maeve', 'Mairead',
      'Niamh', 'Orla', 'Roisin', 'Sadhbh', 'Siobhan', 'Sinead', 'Una'
    ],
    surnames: [
      'Murphy', 'Kelly', 'O\'Sullivan', 'Walsh', 'Smith', 'O\'Brien', 'Byrne', 'O\'Connor', 'Ryan',
      'O\'Neill', 'O\'Reilly', 'Doyle', 'McCarthy', 'Gallagher', 'O\'Doherty', 'Kennedy', 'Lynch',
      'Murray', 'Quinn', 'Moore'
    ]
  },

  Norse: {
    male: [
      'Bjorn', 'Dag', 'Einar', 'Erik', 'Gunnar', 'Gustav', 'Haakon', 'Harald', 'Ivar', 'Jarl',
      'Knut', 'Lars', 'Magnus', 'Olaf', 'Ragnar', 'Rolf', 'Sven', 'Thor', 'Ulf', 'Viggo'
    ],
    female: [
      'Astrid', 'Brunhild', 'Freydis', 'Gudrun', 'Helga', 'Hilda', 'Ingrid', 'Kari', 'Ragnhild',
      'Sigrid', 'Solveig', 'Thora', 'Unn', 'Valdis'
    ],
    surnames: [
      'Erikson', 'Bjornsson', 'Gunnarsson', 'Haraldsson', 'Magnusson', 'Olafsson', 'Ragnarsson',
      'Svensson', 'Thorsson', 'Ulfsson'
    ]
  },

  French: {
    male: [
      'Alain', 'Andre', 'Antoine', 'Bernard', 'Charles', 'Claude', 'Denis', 'François', 'Georges',
      'Henri', 'Jacques', 'Jean', 'Louis', 'Marcel', 'Michel', 'Patrick', 'Philippe', 'Pierre',
      'Raymond', 'Robert'
    ],
    female: [
      'Anne', 'Brigitte', 'Catherine', 'Christine', 'Claire', 'Françoise', 'Isabelle', 'Jacqueline',
      'Marie', 'Martine', 'Michelle', 'Monique', 'Nicole', 'Sylvie', 'Valérie'
    ],
    surnames: [
      'Bernard', 'Dubois', 'Durand', 'Fournier', 'Garcia', 'Lambert', 'Leroy', 'Martin', 'Moreau',
      'Petit', 'Richard', 'Robert', 'Roux', 'Simon', 'Thomas'
    ]
  },

  Germanic: {
    male: [
      'Albrecht', 'Arnold', 'Bernd', 'Conrad', 'Dietrich', 'Eberhard', 'Friedrich', 'Gerhard',
      'Gottfried', 'Heinrich', 'Hermann', 'Klaus', 'Ludwig', 'Otto', 'Reinhard', 'Rudolf',
      'Siegfried', 'Ulrich', 'Walter', 'Wilhelm'
    ],
    female: [
      'Adelheid', 'Bertha', 'Brunhild', 'Edith', 'Else', 'Emma', 'Gertrude', 'Greta', 'Hedwig',
      'Helga', 'Hilda', 'Ingrid', 'Irma', 'Liesel', 'Margarete', 'Ursula', 'Waltraud'
    ],
    surnames: [
      'Bauer', 'Becker', 'Fischer', 'Hoffmann', 'Klein', 'Koch', 'Kruger', 'Meyer', 'Muller',
      'Schmidt', 'Schneider', 'Schulz', 'Wagner', 'Weber', 'Wolf'
    ]
  },

  Fantasy: {
    male: [
      'Aldric', 'Aramis', 'Bastian', 'Cadmus', 'Darian', 'Eldric', 'Falken', 'Garion', 'Hadrian',
      'Isador', 'Jarek', 'Kael', 'Lysander', 'Malachar', 'Nolan', 'Orion', 'Peregrine', 'Quinlan',
      'Raiden', 'Soren', 'Thane', 'Ulrich', 'Varian', 'Wren', 'Xander', 'Yorick', 'Zephyr'
    ],
    female: [
      'Alayna', 'Brielle', 'Celeste', 'Delara', 'Elysia', 'Fiora', 'Gwyneth', 'Hesper', 'Isadora',
      'Jaelithe', 'Kiara', 'Lirazel', 'Morgana', 'Nyx', 'Ophelia', 'Seraphina', 'Thalia',
      'Umbra', 'Vaelynn', 'Whisper', 'Xara', 'Ysara', 'Zara'
    ],
    surnames: [
      'Ashbrook', 'Blackthorne', 'Cindermane', 'Drakemoor', 'Emberheart', 'Frostwind', 'Goldleaf',
      'Ironforge', 'Moonwhisper', 'Nightshade', 'Ravencrest', 'Silverstone', 'Stormwind',
      'Thornfield', 'Valorheart', 'Winterborn'
    ]
  }
};

// Race-to-culture mapping for automatic name selection
export const RACE_CULTURE_MAP: Record<string, NameCulture> = {
  'Human': 'English',
  'Dwarf': 'Germanic',
  'Elf': 'Fantasy',
  'Halfling': 'English',
  'Gnome': 'Germanic',
  'Half-Elf': 'Fantasy',
  'Half-Orc': 'Fantasy',
  'Tiefling': 'Fantasy',
  'Dragonborn': 'Fantasy',
  'Drakkin': 'Fantasy',
  'Goliath': 'Norse',
  'Firbolg': 'Irish',
  'Genasi': 'Fantasy'
};

// Generate a random name
export function generateRandomName(
  gender: Gender,
  culture: NameCulture,
  includeFamily: boolean = true,
  customRace?: string
): { firstName: string; familyName?: string; culture: NameCulture } {

  // Auto-select culture based on race if provided
  const actualCulture = customRace && RACE_CULTURE_MAP[customRace] ? RACE_CULTURE_MAP[customRace] : culture;
  const nameSet = NAME_SETS[actualCulture];

  if (!nameSet) {
    throw new Error(`Culture ${actualCulture} not found`);
  }

  let firstName: string;

  if (gender === 'Non-binary') {
    // For non-binary, randomly pick from either male or female names
    const allNames = [...nameSet.male, ...nameSet.female];
    firstName = allNames[Math.floor(Math.random() * allNames.length)];
  } else {
    const nameList = gender === 'Male' ? nameSet.male : nameSet.female;
    firstName = nameList[Math.floor(Math.random() * nameList.length)];
  }

  let familyName: string | undefined;
  if (includeFamily && nameSet.surnames) {
    familyName = nameSet.surnames[Math.floor(Math.random() * nameSet.surnames.length)];
  }

  return {
    firstName,
    familyName,
    culture: actualCulture
  };
}

// Generate multiple name suggestions
export function generateNameSuggestions(
  gender: Gender,
  culture: NameCulture,
  count: number = 5,
  includeFamily: boolean = true,
  customRace?: string
): Array<{ firstName: string; familyName?: string; culture: NameCulture }> {
  const names: Array<{ firstName: string; familyName?: string; culture: NameCulture }> = [];

  for (let i = 0; i < count; i++) {
    names.push(generateRandomName(gender, culture, includeFamily, customRace));
  }

  return names;
}

// Get name suggestions for a specific race/class combination
export function getNameSuggestionsForCharacter(
  race: string,
  characterClass: string,
  gender: Gender,
  count: number = 3
): Array<{ firstName: string; familyName?: string; culture: NameCulture; suggestion: string }> {

  const culture = RACE_CULTURE_MAP[race] || 'Fantasy';
  const baseSuggestions = generateNameSuggestions(gender, culture, count, true, race);

  return baseSuggestions.map(name => ({
    ...name,
    suggestion: `${name.firstName}${name.familyName ? ` ${name.familyName}` : ''} (${culture} ${race} ${characterClass})`
  }));
}

// Validate name appropriateness (basic check)
export function validateNameForRace(name: string, race: string, gender: Gender): boolean {
  const culture = RACE_CULTURE_MAP[race] || 'Fantasy';
  const nameSet = NAME_SETS[culture];

  if (!nameSet) return true; // Allow if culture not found

  const allNames = gender === 'Male' ? nameSet.male :
                   gender === 'Female' ? nameSet.female :
                   [...nameSet.male, ...nameSet.female];

  return allNames.some(n => n.toLowerCase() === name.toLowerCase());
}

// Get culture-appropriate name endings for custom names
export function getNameEndingsForCulture(culture: NameCulture, gender: Gender): string[] {
  const endings: Record<NameCulture, { male: string[]; female: string[] }> = {
    English: {
      male: ['son', 'ton', 'ford', 'ham'],
      female: ['a', 'e', 'ella', 'ina']
    },
    Scottish: {
      male: ['Mac', 'son', 'ach'],
      female: ['ina', 'ag', 'ean']
    },
    Welsh: {
      male: ['yn', 'wyn', 'ion'],
      female: ['wen', 'an', 'eth']
    },
    Irish: {
      male: ['an', 'in', 'aidh'],
      female: ['ín', 'eann', 'aith']
    },
    Norse: {
      male: ['son', 'sen', 'sson'],
      female: ['dottir', 'a', 'rid']
    },
    French: {
      male: ['ier', 'ois', 'ard'],
      female: ['ette', 'elle', 'ine']
    },
    Germanic: {
      male: ['rich', 'fried', 'helm'],
      female: ['hild', 'gard', 'trud']
    },
    Fantasy: {
      male: ['ion', 'ius', 'an', 'eth'],
      female: ['ia', 'ara', 'iel', 'ynn']
    }
  };

  return endings[culture]?.[gender.toLowerCase() as 'male' | 'female'] || endings.Fantasy[gender.toLowerCase() as 'male' | 'female'];
}