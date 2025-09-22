import {
  QuickNPC,
  npcRaces,
  npcRoles,
  npcLevels,
  npcTemplates,
  npcNameDatabase,
  levelProgression,
  dieProgression,
  npcPersonalities,
  npcMotivations
} from '../data/npcData';

export function getRandomElement<T>(array: readonly T[]): T {
  return array[Math.floor(Math.random() * array.length)];
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