import {
  QuickNPC,
  DetailedNPC,
  IconicItem,
  npcRaces,
  npcRoles,
  npcLevels,
  npcTemplates,
  npcNameDatabase,
  levelProgression,
  dieProgression,
  npcPersonalities,
  npcMotivations,
  raceMinimums,
  roleMinimums,
  abilities,
  dieRanks,
  specialties,
  focuses,
  dieValues,
  magicalEffects,
  potencyLevels,
  energyPointsByRarity
} from '../data/npcData';

export function getRandomElement<T>(array: readonly T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Utility function to get die value
export function getDieValue(dieRank: string): number {
  return dieValues[dieRank as keyof typeof dieValues] || 4;
}

// Function to get higher die rank
export function getHigherDieRank(die1: string, die2: string): string {
  return getDieValue(die1) >= getDieValue(die2) ? die1 : die2;
}

// Function to increase die rank
export function increaseDieRank(obj: Record<string, string>, key: string): void {
  const currentRank = obj[key];
  const currentIndex = dieRanks.indexOf(currentRank);
  if (currentIndex < dieRanks.length - 1) {
    obj[key] = dieRanks[currentIndex + 1];
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

export function generateNPCName(race: string, gender: 'Male' | 'Female'): string {
  const names = npcNameDatabase[race as keyof typeof npcNameDatabase]?.[gender] || npcNameDatabase.Human[gender];
  return getRandomElement(names);
}

export function generateQuickNPC(
  race?: string,
  role?: string,
  level?: number,
  gender?: 'Male' | 'Female'
): QuickNPC {
  // Use provided values or generate random ones
  const selectedRace = race || getRandomElement(npcRaces);
  const selectedRole = role || getRandomElement(npcRoles);
  const selectedLevel = level || getRandomElement(npcLevels);
  const selectedGender = gender || getRandomElement(['Male', 'Female'] as const);

  const template = npcTemplates[selectedRole];
  const progression = levelProgression[selectedLevel as keyof typeof levelProgression];

  // Calculate stats based on template and level
  const activeDefense = template.baseADP + progression.adpMod;
  const passiveDefense = template.basePDP + progression.pdpMod;
  const spiritPoints = 2 + progression.spMod;

  // Calculate dice progression
  const baseDieIndex = dieProgression.indexOf('d6'); // Most NPCs start with d6
  const adjustedDieIndex = Math.min(
    baseDieIndex + progression.dieMod,
    dieProgression.length - 1
  );
  const primaryDie = dieProgression[adjustedDieIndex];

  // Prowess die calculation
  let prowessDie = template.prowessDie;
  if (template.primaryAbility === 'Prowess') {
    prowessDie = parseInt(primaryDie.replace('d', ''));
  }

  const battlePhase = calculateBattlePhase(prowessDie);

  // Generate iconic item
  const iconicItem = getRandomElement(template.iconicItems);

  return {
    id: Date.now() + Math.random(),
    name: generateNPCName(selectedRace, selectedGender),
    race: selectedRace,
    role: selectedRole,
    level: selectedLevel,
    gender: selectedGender,
    activeDefense,
    passiveDefense,
    spiritPoints,
    battlePhase,
    prowessDie,
    primaryAbility: `${template.primaryAbility} ${primaryDie}`,
    keySpecialty: `${template.keySpecialty} ${primaryDie}`,
    iconicItem,
    notes: ''
  };
}

export function generateNPCGroup(count: number, options?: {
  race?: string;
  role?: string;
  level?: number;
  mixedGroup?: boolean;
}): QuickNPC[] {
  const npcs: QuickNPC[] = [];

  for (let i = 0; i < count; i++) {
    let npcRace = options?.race;
    let npcRole = options?.role;
    let npcLevel = options?.level;

    // If mixed group, randomly vary some parameters
    if (options?.mixedGroup) {
      if (Math.random() > 0.7) npcRace = undefined; // 30% chance for different race
      if (Math.random() > 0.8) npcRole = undefined; // 20% chance for different role
      if (Math.random() > 0.6) npcLevel = undefined; // 40% chance for different level
    }

    const npc = generateQuickNPC(npcRace, npcRole, npcLevel);
    npcs.push(npc);
  }

  return npcs;
}

export function addPersonalityToNPC(npc: QuickNPC): QuickNPC {
  const personality = getRandomElement(npcPersonalities);
  const motivation = getRandomElement(npcMotivations);

  return {
    ...npc,
    notes: `Personality: ${personality}. Motivation: ${motivation}.`
  };
}

export function exportNPCToMarkdown(npc: QuickNPC): string {
  return `# ${npc.name}

**Race:** ${npc.race}
**Role:** ${npc.role} (Level ${npc.level})
**Gender:** ${npc.gender}

## Combat Stats
- **Active Defense Pool:** ${npc.activeDefense}
- **Passive Defense Pool:** ${npc.passiveDefense}
- **Spirit Points:** ${npc.spiritPoints}
- **Battle Phase:** ${npc.battlePhase}
- **Prowess Die:** d${npc.prowessDie}

## Abilities
- **Primary:** ${npc.primaryAbility}
- **Key Specialty:** ${npc.keySpecialty}

## Equipment
- **Iconic Item:** ${npc.iconicItem}

${npc.notes ? `## Notes\n${npc.notes}` : ''}

---
*Generated with Eldritch GM Tools*`;
}

export function exportNPCGroupToMarkdown(npcs: QuickNPC[]): string {
  let markdown = `# NPC Group\n\n`;
  markdown += `**Total NPCs:** ${npcs.length}\n\n`;

  npcs.forEach((npc, index) => {
    markdown += `## ${index + 1}. ${npc.name}\n`;
    markdown += `**${npc.race} ${npc.role}** (Level ${npc.level}) | `;
    markdown += `ADP: ${npc.activeDefense} | PDP: ${npc.passiveDefense} | BP: ${npc.battlePhase}\n`;
    markdown += `**Equipment:** ${npc.iconicItem}\n`;
    if (npc.notes) {
      markdown += `**Notes:** ${npc.notes}\n`;
    }
    markdown += '\n';
  });

  markdown += `---\n*Generated with Eldritch GM Tools*`;

  return markdown;
}

// Generate detailed NPC with full ability system
export function generateDetailedNPC(
  race?: string,
  role?: string,
  level?: number,
  gender?: 'Male' | 'Female',
  includeMagic?: boolean
): DetailedNPC {
  // Use provided values or generate random ones
  const selectedRace = race || getRandomElement(npcRaces);
  const selectedRole = role || getRandomElement(npcRoles);
  const selectedLevel = level || getRandomElement(npcLevels);
  const selectedGender = gender || getRandomElement(['Male', 'Female'] as const);

  const character: DetailedNPC = {
    id: Date.now() + Math.random(),
    name: generateNPCName(selectedRace, selectedGender),
    race: selectedRace,
    role: selectedRole,
    level: selectedLevel,
    gender: selectedGender,
    abilities: {
      competence: 'd4',
      prowess: 'd4',
      fortitude: 'd4'
    },
    specialties: {
      competence: {
        expertise: 'd4',
        perception: 'd4',
        adroitness: 'd4'
      },
      prowess: {
        melee: 'd4',
        agility: 'd4',
        precision: 'd4'
      },
      fortitude: {
        endurance: 'd4',
        strength: 'd4',
        willpower: 'd4'
      }
    },
    focuses: {},
    activeDefense: 0,
    passiveDefense: 0,
    spiritPoints: 0,
    masteryDie: 'd4',
    armor: 'd4',
    actions: {
      meleeAttack: '',
      rangedAttack: '',
      magicAttack: '',
      perceptionCheck: ''
    }
  };

  // Assign abilities and specialties based on minimums and level
  assignAbilities(character);
  character.activeDefense = calculateActiveDefense(character);
  character.passiveDefense = calculatePassiveDefense(character);
  character.spiritPoints = calculateSpiritPoints(character);
  character.masteryDie = getMasteryDie(character.level);
  character.armor = getArmor(character.level);
  character.actions = calculateActions(character);

  // Generate Iconic Item
  character.iconicItem = generateIconicItem(character, includeMagic);

  return character;
}

function assignAbilities(character: DetailedNPC): void {
  // Start with base minimums from race
  const raceMins = raceMinimums[character.race] || {};

  abilities.forEach(ability => {
    const minDieRank = raceMins[ability] || 'd4';
    (character.abilities as Record<string, string>)[ability] = minDieRank;

    // Initialize specialties for this ability
    const abilitySpecialties = specialties[ability];
    abilitySpecialties.forEach(specialty => {
      // Set specialty based on role minimums or race minimums
      const roleMin = roleMinimums[character.role]?.[specialty] || 'd4';
      const finalDie = getHigherDieRank(minDieRank, roleMin);

      // Set specialty die
      if (ability === 'competence') {
        (character.specialties.competence as Record<string, string>)[specialty] = finalDie;
      } else if (ability === 'prowess') {
        (character.specialties.prowess as Record<string, string>)[specialty] = finalDie;
      } else if (ability === 'fortitude') {
        (character.specialties.fortitude as Record<string, string>)[specialty] = finalDie;
      }

      // Initialize focuses for this specialty
      character.focuses[specialty] = {};
      const specialtyFocuses = focuses[specialty] || [];
      specialtyFocuses.forEach(focus => {
        character.focuses[specialty][focus] = `+${Math.floor(character.level / 2) || 1}`;
      });
    });
  });

  // Increase die ranks based on level
  for (let i = 1; i < character.level; i++) {
    // Distribute die increases based on role
    if (character.role === 'Warrior' || character.role === 'Barbarian') {
      increaseDieRank(character.abilities as Record<string, string>, 'prowess');
      increaseDieRank(character.specialties.prowess as Record<string, string>, 'melee');
    }
    if (['Mage', 'Mystic', 'Theurgist', 'Adept'].includes(character.role)) {
      increaseDieRank(character.abilities as Record<string, string>, 'competence');
      increaseDieRank(character.specialties.competence as Record<string, string>, 'expertise');
    }
    if (character.role === 'Rogue') {
      increaseDieRank(character.abilities as Record<string, string>, 'prowess');
      increaseDieRank(character.specialties.prowess as Record<string, string>, 'agility');
    }
  }

  // Ensure specialties are at least as high as their parent ability
  abilities.forEach(ability => {
    const abilityDieValue = getDieValue((character.abilities as Record<string, string>)[ability]);
    const abilitySpecialties = specialties[ability];

    abilitySpecialties.forEach(specialty => {
      let currentSpecialtyDie: string;
      if (ability === 'competence') {
        currentSpecialtyDie = (character.specialties.competence as Record<string, string>)[specialty];
      } else if (ability === 'prowess') {
        currentSpecialtyDie = (character.specialties.prowess as Record<string, string>)[specialty];
      } else {
        currentSpecialtyDie = (character.specialties.fortitude as Record<string, string>)[specialty];
      }

      if (getDieValue(currentSpecialtyDie) < abilityDieValue) {
        const newDie = (character.abilities as Record<string, string>)[ability];
        if (ability === 'competence') {
          (character.specialties.competence as Record<string, string>)[specialty] = newDie;
        } else if (ability === 'prowess') {
          (character.specialties.prowess as Record<string, string>)[specialty] = newDie;
        } else {
          (character.specialties.fortitude as Record<string, string>)[specialty] = newDie;
        }
      }
    });
  });
}

function calculateActiveDefense(character: DetailedNPC): number {
  const prowessDie = getDieValue(character.abilities.prowess);
  const agility = getDieValue(character.specialties.prowess.agility);
  const melee = getDieValue(character.specialties.prowess.melee);
  return prowessDie + agility + melee;
}

function calculatePassiveDefense(character: DetailedNPC): number {
  const fortitudeDie = getDieValue(character.abilities.fortitude);
  const endurance = getDieValue(character.specialties.fortitude.endurance);
  const strength = getDieValue(character.specialties.fortitude.strength);
  return fortitudeDie + endurance + strength;
}

function calculateSpiritPoints(character: DetailedNPC): number {
  const competenceDie = getDieValue(character.abilities.competence);
  const willpower = getDieValue(character.specialties.fortitude.willpower);
  return competenceDie + willpower;
}

function getMasteryDie(level: number): string {
  const masteryDice = ['d4', 'd6', 'd8', 'd10', 'd12'];
  return masteryDice[Math.min(level - 1, masteryDice.length - 1)];
}

function getArmor(level: number): string {
  const armorGrades = ['d4', 'd6', 'd8', 'd10', 'd12'];
  return armorGrades[Math.min(Math.floor(level / 2), armorGrades.length - 1)];
}

function calculateActions(character: DetailedNPC): {
  meleeAttack: string;
  rangedAttack: string;
  magicAttack: string;
  perceptionCheck: string;
} {
  return {
    meleeAttack: `${character.abilities.prowess} + ${character.specialties.prowess.melee} + Focus Bonus`,
    rangedAttack: `${character.abilities.prowess} + ${character.specialties.prowess.precision} + Focus Bonus`,
    magicAttack: `${character.abilities.competence} + ${character.specialties.competence.expertise} + Focus Bonus`,
    perceptionCheck: `${character.abilities.competence} + ${character.specialties.competence.perception} + Focus Bonus`
  };
}

function generateIconicItem(character: DetailedNPC, includeMagic?: boolean): IconicItem {
  const item: IconicItem = {
    type: 'Iconic Inspirational Item',
    properties: 'No special properties.'
  };

  // Determine the type of Iconic Item based on role
  if (['Warrior', 'Barbarian', 'Rogue'].includes(character.role)) {
    item.type = 'Iconic Weapon';
    if (includeMagic) {
      const selectedEffect = getRandomElement(magicalEffects.weapon);
      item.properties = `Magic Effect: ${selectedEffect.effect} - ${selectedEffect.description}`;
      item.potency = getRandomElement(potencyLevels);
      item.rarity = determineRarity(item.potency);
      item.energyPoints = energyPointsByRarity[item.rarity];
      item.activationCost = 1;
    } else {
      item.details = "A personalized weapon of great significance to the character. Can trigger 'Master Twist' when used with a mastery die.";
      item.properties = 'Nonmagical iconic weapon';
    }
  } else if (['Mage', 'Mystic', 'Theurgist', 'Adept'].includes(character.role)) {
    item.type = 'Iconic Magic Focus';
    if (includeMagic) {
      const selectedEffect = getRandomElement(magicalEffects.focus);
      item.properties = `Magic Effect: ${selectedEffect.effect} - ${selectedEffect.description}`;
      item.potency = getRandomElement(potencyLevels);
      item.rarity = determineRarity(item.potency);
      item.energyPoints = energyPointsByRarity[item.rarity];
      item.activationCost = 1;
    } else {
      item.details = "A personalized grimoire or focus significant to the character. Can trigger 'Master Twist' when used with a mastery die.";
      item.properties = 'Nonmagical magic focus';
    }
  } else {
    item.type = 'Iconic Inspirational Item';
    if (includeMagic) {
      const selectedEffect = getRandomElement(magicalEffects.inspirational);
      item.properties = `Magic Effect: ${selectedEffect.effect} - ${selectedEffect.description}`;
      item.potency = getRandomElement(potencyLevels);
      item.rarity = determineRarity(item.potency);
      item.energyPoints = energyPointsByRarity[item.rarity];
      item.activationCost = 1;
    } else {
      item.details = "An item of sentimental or historical value. Functions as Inspirational Aid, granting +1 bonus per character level to specific ability tests or feats.";
      item.properties = 'Nonmagical inspirational item';
    }
  }

  return item;
}

function determineRarity(potency: string): 'Common' | 'Uncommon' | 'Esoteric' | 'Occult' | 'Legendary' {
  switch (potency) {
    case 'd4': return 'Common';
    case 'd6': return 'Uncommon';
    case 'd8': return 'Esoteric';
    case 'd10': return 'Occult';
    case 'd12': return 'Legendary';
    default: return 'Common';
  }
}

export function exportDetailedNPCToMarkdown(npc: DetailedNPC): string {
  // Get first focus for each specialty for display
  const getFirstFocus = (specialty: string) => {
    const focusKeys = Object.keys(npc.focuses[specialty] || {});
    return focusKeys.length > 0 ? `${focusKeys[0]} ${Object.values(npc.focuses[specialty])[0]}` : '';
  };

  return `# Level ${npc.level} ${npc.gender} ${npc.race} ${npc.role}

## Abilities
**Competence ${npc.abilities.competence} →**
Expertise ${npc.specialties.competence.expertise} (${getFirstFocus('expertise')}),
Perception ${npc.specialties.competence.perception} (${getFirstFocus('perception')}).

**Prowess ${npc.abilities.prowess} →**
Melee ${npc.specialties.prowess.melee} (${getFirstFocus('melee')}),
Agility ${npc.specialties.prowess.agility} (${getFirstFocus('agility')}).

**Fortitude ${npc.abilities.fortitude} →**
Endurance ${npc.specialties.fortitude.endurance} (${getFirstFocus('endurance')}),
Strength ${npc.specialties.fortitude.strength} (${getFirstFocus('strength')}),
Willpower ${npc.specialties.fortitude.willpower} (${getFirstFocus('willpower')}).

## Combat Stats
**SP:** ${npc.spiritPoints}, **Active DP:** ${npc.activeDefense}, **Passive DP:** ${npc.passiveDefense}. **Mastery Die:** ${npc.masteryDie}. **Armor:** ${npc.armor}.

## Actions
**Melee Attack:** ${npc.actions.meleeAttack}
**Ranged Attack:** ${npc.actions.rangedAttack}
**Magic Attack:** ${npc.actions.magicAttack}
**Perception Check:** ${npc.actions.perceptionCheck}

${npc.iconicItem ? `## ${npc.iconicItem.type}
${npc.iconicItem.details ? `**Details:** ${npc.iconicItem.details}` : ''}
${npc.iconicItem.properties !== 'No special properties.' ? `**${npc.iconicItem.properties}**` : ''}
${npc.iconicItem.potency ? `**Potency:** ${npc.iconicItem.potency}, **Rarity:** ${npc.iconicItem.rarity}` : ''}
${npc.iconicItem.energyPoints ? `**Energy Points:** ${npc.iconicItem.energyPoints}, **Activation Cost:** ${npc.iconicItem.activationCost} energy point(s)` : ''}
` : ''}

---
*Generated with Eldritch GM Tools*`;
}

export function createNPCForBattle(npc: QuickNPC) {
  return {
    id: npc.id,
    category: 'npc' as const,
    name: npc.name,
    prowessDie: npc.prowessDie,
    weaponReach: 'medium' as const,
    adp: npc.activeDefense,
    pdp: npc.passiveDefense,
    maxAdp: npc.activeDefense,
    armor: '0',
    shield: 0,
    battlePhase: npc.battlePhase,
    reactionFocus: 0,
    spiritPoints: npc.spiritPoints,
    role: 'Hostile' as const,
    classification: 'NPC',
    npcDetail: `${npc.race} ${npc.role} (Level ${npc.level})`
  };
}

export function createDetailedNPCForBattle(npc: DetailedNPC) {
  const prowessValue = getDieValue(npc.abilities.prowess);
  const battlePhase = calculateBattlePhase(prowessValue);

  return {
    id: npc.id,
    category: 'npc' as const,
    name: npc.name,
    prowessDie: prowessValue,
    weaponReach: 'medium' as const,
    adp: npc.activeDefense,
    pdp: npc.passiveDefense,
    maxAdp: npc.activeDefense,
    armor: getDieValue(npc.armor).toString(),
    shield: 0,
    battlePhase: battlePhase,
    reactionFocus: 0,
    spiritPoints: npc.spiritPoints,
    role: 'Hostile' as const,
    classification: 'NPC',
    npcDetail: `${npc.race} ${npc.role} (Level ${npc.level})`
  };
}