import {
  Monster,
  MonsterCategory,
  MonsterSize,
  MonsterNature,
  CreatureType,
  CreatureTrope,
  ArmorType,
  threatDiceByCategory,
  hpMultipliers,
  armorBonuses,
  tropeConfig,
  monsterNames
} from '../data/monsterData';

export function weightedRandom(weights: Record<string, number>): string {
  const entries = Object.entries(weights);
  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  let r = Math.random() * total;

  for (const [key, w] of entries) {
    if ((r -= w) <= 0) return key;
  }

  return entries[entries.length - 1][0];
}

export function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function calculateThreatMV(threatDice: string): number {
  const match = threatDice.match(/(\d+)d(\d+)/);
  if (!match) return 0;

  const [, count, sides] = match.map(Number);
  return count * sides;
}

export function getRandomSizeForTrope(trope: CreatureTrope, nonMediumPercentage: number): MonsterSize {
  const config = tropeConfig[trope];

  if (Math.random() * 100 > nonMediumPercentage && config.sizeWeights.Medium) {
    return 'Medium';
  }

  return weightedRandom(config.sizeWeights) as MonsterSize;
}

export function getRandomNatureForTrope(trope: CreatureTrope, nonMundanePercentage: number): MonsterNature {
  const config = tropeConfig[trope];

  if (Math.random() * 100 > nonMundanePercentage && config.natureWeights.Mundane) {
    return 'Mundane';
  }

  return weightedRandom(config.natureWeights) as MonsterNature;
}

export function getCreatureType(specialTypePercentage: number): CreatureType {
  if (Math.random() * 100 > specialTypePercentage) {
    return 'Normal';
  }

  const types: CreatureType[] = ['Fast', 'Tough'];
  return getRandomElement(types);
}

export function calculateHitPointsAdvanced(
  baseHP: number,
  size: MonsterSize,
  nature: MonsterNature,
  armorBonus: number = 0
): { hitPoints: number; multiplier: number } {
  const multiplier = hpMultipliers[size][nature];
  const hitPoints = Math.round(baseHP * multiplier) + armorBonus;

  return { hitPoints, multiplier };
}

export function calculateDefenses(
  hitPoints: number,
  creatureType: CreatureType
): { activeDefense: number; passiveDefense: number } {
  let activeDefense: number, passiveDefense: number;

  if (creatureType === 'Fast') {
    activeDefense = Math.round(hitPoints * 0.75);
    passiveDefense = hitPoints - activeDefense;
  } else if (creatureType === 'Tough') {
    passiveDefense = Math.round(hitPoints * 0.75);
    activeDefense = hitPoints - passiveDefense;
  } else { // Normal
    activeDefense = Math.round(hitPoints / 2);
    passiveDefense = hitPoints - activeDefense;
  }

  return { activeDefense, passiveDefense };
}

export function assignProwessDie(threatDice: string): number {
  const match = threatDice.match(/\d*d(\d+)/);
  if (!match) return 6;

  const sides = parseInt(match[1]);

  switch (sides) {
    case 4: return 4;
    case 6: return 6;
    case 8: return 8;
    case 10: return 10;
    case 12:
    case 14:
    case 16:
    case 18:
    case 20: return 12;
    default: return 6;
  }
}

export function calculateBattlePhase(prowessDie: number): number {
  switch (prowessDie) {
    case 12: return 1;
    case 10: return 2;
    case 8: return 3;
    case 6: return 4;
    default: return 5;
  }
}

export function assignWeaponReach(size: MonsterSize): string {
  const reachMap: Record<MonsterSize, string> = {
    'Minuscule': 'Short',
    'Tiny': 'Short',
    'Small': 'Short',
    'Medium': 'Medium',
    'Large': 'Medium',
    'Huge': 'Long',
    'Gargantuan': 'Long'
  };

  return reachMap[size] || 'Medium';
}

export function calculateSavingThrow(category: MonsterCategory): string {
  const categoryToSave: Record<MonsterCategory, string> = {
    'Minor': 'd4',
    'Standard': 'd6',
    'Exceptional': 'd8',
    'Legendary': 'd12'
  };

  return categoryToSave[category];
}

export function generateRandomName(trope: CreatureTrope): string {
  const names = monsterNames[trope];
  return getRandomElement(names);
}

export function generateMonster(
  selectedCategories: MonsterCategory[] = ['Minor', 'Standard', 'Exceptional', 'Legendary'],
  selectedTropes: CreatureTrope[] = ['Human', 'Goblinoid', 'Beast', 'Undead'],
  nonMediumPercentage: number = 10,
  nonMundanePercentage: number = 20,
  specialTypePercentage: number = 30
): Monster {
  // Select random category and trope
  const category = getRandomElement(selectedCategories);
  const trope = getRandomElement(selectedTropes);

  // Generate threat dice and calculate MV
  const threatDice = getRandomElement(threatDiceByCategory[category]);
  const threatMV = calculateThreatMV(threatDice);

  // Determine size and nature based on trope and percentages
  const size = getRandomSizeForTrope(trope, nonMediumPercentage);
  const nature = getRandomNatureForTrope(trope, nonMundanePercentage);

  // Determine creature type (Fast/Tough/Normal)
  const creatureType = getCreatureType(specialTypePercentage);

  // Determine armor type (weighted toward none/light armor)
  const armorTypes: ArmorType[] = ['None', 'None', 'None', 'Hide', 'Leather', 'Chain', 'Plate'];
  const armorType = getRandomElement(armorTypes);
  const armorBonus = armorBonuses[armorType];

  // Calculate hit points
  const baseHP = threatMV;
  const { hitPoints, multiplier } = calculateHitPointsAdvanced(baseHP, size, nature, armorBonus);

  // Calculate defenses
  const { activeDefense, passiveDefense } = calculateDefenses(hitPoints, creatureType);

  // Calculate battle mechanics
  const prowessDie = assignProwessDie(threatDice);
  const battlePhase = calculateBattlePhase(prowessDie);
  const weaponReach = assignWeaponReach(size);
  const savingThrow = calculateSavingThrow(category);

  // Generate name
  const name = generateRandomName(trope);

  return {
    name,
    trope,
    category,
    threatDice,
    threatMV,
    size,
    nature,
    creatureType,
    hitPoints,
    activeDefense,
    passiveDefense,
    multiplier,
    savingThrow,
    battlePhase,
    prowessDie,
    weaponReach,
    armorType,
    armorBonus
  };
}

export function exportMonsterToMarkdown(monster: Monster): string {
  return `# ${monster.name}

**Type:** ${monster.trope} ${monster.category}
**Size:** ${monster.size}
**Nature:** ${monster.nature}
**Creature Type:** ${monster.creatureType}

## Combat Stats
- **Threat Dice:** ${monster.threatDice}
- **Threat MV:** ${monster.threatMV}
- **Hit Points:** ${monster.hitPoints} (${monster.multiplier}x multiplier)
- **Active Defense Pool:** ${monster.activeDefense}
- **Passive Defense Pool:** ${monster.passiveDefense}
- **Saving Throw:** ${monster.savingThrow}

## Physical Attributes
- **Armor:** ${monster.armorType}${monster.armorBonus > 0 ? ` (+${monster.armorBonus} HP)` : ''}
- **Weapon Reach:** ${monster.weaponReach}
- **Prowess Die:** d${monster.prowessDie}
- **Battle Phase:** ${monster.battlePhase}

---
*Generated with Eldritch GM Tools*`;
}

export function validateMonsterSettings(settings: {
  categories: MonsterCategory[];
  tropes: CreatureTrope[];
  nonMediumPercentage: number;
  nonMundanePercentage: number;
  specialTypePercentage: number;
}): string[] {
  const warnings: string[] = [];

  if (settings.categories.length === 0) {
    warnings.push('At least one monster category must be selected');
  }

  if (settings.tropes.length === 0) {
    warnings.push('At least one creature trope must be selected');
  }

  if (settings.nonMediumPercentage < 0 || settings.nonMediumPercentage > 100) {
    warnings.push('Non-medium percentage must be between 0 and 100');
  }

  if (settings.nonMundanePercentage < 0 || settings.nonMundanePercentage > 100) {
    warnings.push('Non-mundane percentage must be between 0 and 100');
  }

  if (settings.specialTypePercentage < 0 || settings.specialTypePercentage > 100) {
    warnings.push('Special type percentage must be between 0 and 100');
  }

  return warnings;
}