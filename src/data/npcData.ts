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