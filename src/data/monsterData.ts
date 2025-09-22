// Monster data for Eldritch RPG 2nd Edition Monster Generator

export type MonsterCategory = 'Minor' | 'Standard' | 'Exceptional' | 'Legendary';
export type MonsterSize = 'Minuscule' | 'Tiny' | 'Small' | 'Medium' | 'Large' | 'Huge' | 'Gargantuan';
export type MonsterNature = 'Mundane' | 'Magical' | 'Preternatural' | 'Supernatural';
export type CreatureType = 'Normal' | 'Fast' | 'Tough';
export type CreatureTrope = 'Human' | 'Goblinoid' | 'Beast' | 'Undead' | 'Construct' |
                           'Elemental' | 'Aberration' | 'Fey' | 'Dragon' | 'Ooze' | 'Demon';
export type ArmorType = 'None' | 'Hide' | 'Leather' | 'Chain' | 'Plate' | 'Magical';

export interface Monster {
  name: string;
  trope: CreatureTrope;
  category: MonsterCategory;
  threatDice: string;
  threatMV: number;
  size: MonsterSize;
  nature: MonsterNature;
  creatureType: CreatureType;
  hitPoints: number;
  activeDefense: number;
  passiveDefense: number;
  multiplier: number;
  savingThrow: string;
  battlePhase: number;
  prowessDie: number;
  weaponReach: string;
  armorType: ArmorType;
  armorBonus: number;
}

export const threatDiceByCategory: Record<MonsterCategory, string[]> = {
  Minor: ['1d4', '1d6', '1d8', '1d10', '1d12'],
  Standard: ['2d4', '2d6', '2d8', '2d10', '2d12'],
  Exceptional: ['3d4', '3d6', '3d8', '3d10', '3d12'],
  Legendary: ['3d12', '3d14', '3d16', '3d18', '3d20']
};

export const hpMultipliers: Record<MonsterSize, Record<MonsterNature, number>> = {
  'Minuscule': { 'Mundane': 0.5, 'Magical': 1, 'Preternatural': 1.5, 'Supernatural': 2 },
  'Tiny': { 'Mundane': 0.5, 'Magical': 1, 'Preternatural': 1.5, 'Supernatural': 2 },
  'Small': { 'Mundane': 1, 'Magical': 1.5, 'Preternatural': 2, 'Supernatural': 2.5 },
  'Medium': { 'Mundane': 1, 'Magical': 1.5, 'Preternatural': 2, 'Supernatural': 2.5 },
  'Large': { 'Mundane': 1.5, 'Magical': 2, 'Preternatural': 2.5, 'Supernatural': 3 },
  'Huge': { 'Mundane': 2, 'Magical': 2.5, 'Preternatural': 3, 'Supernatural': 3.5 },
  'Gargantuan': { 'Mundane': 2.5, 'Magical': 3, 'Preternatural': 3.5, 'Supernatural': 4 }
};

export const armorBonuses: Record<ArmorType, number> = {
  'None': 0,
  'Hide': 2,
  'Leather': 3,
  'Chain': 4,
  'Plate': 5,
  'Magical': 6
};

export const tropeConfig: Record<CreatureTrope, {
  sizeWeights: Record<string, number>;
  natureWeights: Record<string, number>;
}> = {
  Human: {
    sizeWeights: { Small: 1, Medium: 8, Large: 1 },
    natureWeights: { Mundane: 8, Magical: 1, Preternatural: 0.5, Supernatural: 0.25 }
  },
  Goblinoid: {
    sizeWeights: { Small: 2, Medium: 7, Large: 1 },
    natureWeights: { Mundane: 6, Magical: 1, Preternatural: 0.5, Supernatural: 0.25 }
  },
  Beast: {
    sizeWeights: { Tiny: 1, Small: 3, Medium: 5, Large: 3, Huge: 1 },
    natureWeights: { Mundane: 9, Magical: 0.5, Preternatural: 0.5, Supernatural: 0.25 }
  },
  Undead: {
    sizeWeights: { Small: 1, Medium: 6, Large: 2, Huge: 1 },
    natureWeights: { Supernatural: 10 }
  },
  Construct: {
    sizeWeights: { Small: 1, Medium: 5, Large: 3, Huge: 1 },
    natureWeights: { Magical: 10 }
  },
  Elemental: {
    sizeWeights: { Small: 1, Medium: 4, Large: 3, Huge: 2 },
    natureWeights: { Preternatural: 8, Supernatural: 2 }
  },
  Aberration: {
    sizeWeights: { Small: 1, Medium: 4, Large: 3, Huge: 2 },
    natureWeights: { Preternatural: 6, Supernatural: 3, Magical: 1 }
  },
  Fey: {
    sizeWeights: { Tiny: 1, Small: 2, Medium: 6, Large: 1 },
    natureWeights: { Magical: 7, Preternatural: 2, Supernatural: 1 }
  },
  Dragon: {
    sizeWeights: { Medium: 2, Large: 5, Huge: 3, Gargantuan: 1 },
    natureWeights: { Preternatural: 6, Supernatural: 3, Magical: 1 }
  },
  Ooze: {
    sizeWeights: { Small: 2, Medium: 5, Large: 3 },
    natureWeights: { Preternatural: 7, Supernatural: 1, Mundane: 1, Magical: 1 }
  },
  Demon: {
    sizeWeights: { Medium: 4, Large: 4, Huge: 2 },
    natureWeights: { Supernatural: 9, Preternatural: 1 }
  }
};

export const monsterNames: Record<CreatureTrope, string[]> = {
  Human: ['Bandit', 'Guard', 'Soldier', 'Cultist', 'Brigand', 'Mercenary', 'Assassin', 'Berserker'],
  Goblinoid: ['Goblin', 'Hobgoblin', 'Bugbear', 'Orc', 'Uruk', 'Worg-rider', 'Shaman', 'Chieftain'],
  Beast: ['Wolf', 'Bear', 'Lion', 'Tiger', 'Boar', 'Eagle', 'Spider', 'Snake', 'Dire Wolf', 'Cave Bear'],
  Undead: ['Skeleton', 'Zombie', 'Ghoul', 'Wight', 'Wraith', 'Specter', 'Lich', 'Vampire', 'Mummy'],
  Construct: ['Golem', 'Automaton', 'Animated Armor', 'Iron Guardian', 'Stone Sentinel', 'Clockwork'],
  Elemental: ['Fire Elemental', 'Water Elemental', 'Air Elemental', 'Earth Elemental', 'Storm Spirit'],
  Aberration: ['Mind Flayer', 'Beholder', 'Aboleth', 'Gibbering Mouther', 'Owlbear', 'Bulezau'],
  Fey: ['Pixie', 'Dryad', 'Satyr', 'Redcap', 'Banshee', 'Will-o-Wisp', 'Treant', 'Unicorn'],
  Dragon: ['Young Dragon', 'Adult Dragon', 'Ancient Dragon', 'Wyrmling', 'Drake', 'Wyvern'],
  Ooze: ['Gelatinous Cube', 'Black Pudding', 'Ochre Jelly', 'Gray Ooze', 'Green Slime'],
  Demon: ['Imp', 'Quasit', 'Succubus', 'Balor', 'Marilith', 'Vrock', 'Hezrou', 'Glabrezu']
};