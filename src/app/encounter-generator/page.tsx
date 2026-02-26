'use client';

import { Suspense, useCallback, useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  getAllPartyFolders,
  getPartyCharacters,
  calculatePartyDefenseProfile,
  getCharactersByType,
  initializeDefaultFolders
} from '../../utils/partyStorage';
import { PartyFolder, SavedCharacter, MonsterData, PartyDefenseProfile } from '../../types/party';
import { resolveBackTargetFromParam } from '../../utils/backNavigation';
import ContentBox from '@/components/ContentBox';
import {
  addToVault,
  getVaultCreatures,
  removeFromVaultByIndex,
  clearVault,
  onVaultChange,
  type VaultCreature,
} from '../../utils/encounterVaultStorage';

const difficultyLevels = ['Easy', 'Moderate', 'Difficult', 'Demanding', 'Formidable', 'Deadly'] as const;
const defenseLevels = ['Practitioner', 'Competent', 'Proficient', 'Advanced', 'Elite'] as const;

const encounterDifficultyTable: Record<number, Record<(typeof defenseLevels)[number], number[]>> = {
  1: {
    Practitioner: [7, 10, 12, 14, 16, 18],
    Competent: [14, 20, 24, 28, 32, 36],
    Proficient: [21, 29, 36, 42, 48, 55],
    Advanced: [28, 39, 48, 56, 64, 73],
    Elite: [35, 49, 60, 70, 80, 110],
  },
  2: {
    Practitioner: [14, 20, 24, 28, 32, 36],
    Competent: [28, 39, 48, 56, 64, 73],
    Proficient: [42, 59, 72, 84, 96, 108],
    Advanced: [56, 77, 96, 112, 128, 144],
    Elite: [70, 95, 120, 140, 160, 190],
  },
  3: {
    Practitioner: [21, 30, 36, 42, 48, 54],
    Competent: [42, 59, 72, 84, 96, 108],
    Proficient: [63, 84, 108, 126, 144, 162],
    Advanced: [84, 111, 144, 168, 192, 216],
    Elite: [105, 140, 180, 210, 240, 270],
  },
  4: {
    Practitioner: [28, 42, 50, 56, 64, 72],
    Competent: [56, 77, 96, 112, 128, 144],
    Proficient: [84, 111, 144, 168, 192, 216],
    Advanced: [112, 147, 180, 224, 256, 288],
    Elite: [140, 185, 228, 280, 320, 360],
  },
};

type CreatureCategory = 'Minor' | 'Standard' | 'Exceptional' | 'Legendary';

const threatDiceByCategory: Record<CreatureCategory, string[]> = {
  Minor: ['1d4', '1d6', '1d8', '1d10', '1d12'],
  Standard: ['2d4', '2d6', '2d8', '2d10', '2d12'],
  Exceptional: ['3d4', '3d6', '3d8', '3d10', '3d12'],
  Legendary: ['3d12', '3d14', '3d16', '3d18', '3d20'],
};

const hpMultipliers = {
  Minuscule: { Mundane: 0.5, Magical: 1, Preternatural: 1.5, Supernatural: 2 },
  Tiny: { Mundane: 0.5, Magical: 1, Preternatural: 1.5, Supernatural: 2 },
  Small: { Mundane: 1, Magical: 1.5, Preternatural: 2, Supernatural: 2.5 },
  Medium: { Mundane: 1, Magical: 1.5, Preternatural: 2, Supernatural: 2.5 },
  Large: { Mundane: 1.5, Magical: 2, Preternatural: 2.5, Supernatural: 3 },
  Huge: { Mundane: 2, Magical: 2.5, Preternatural: 3, Supernatural: 3.5 },
  Gargantuan: { Mundane: 2.5, Magical: 3, Preternatural: 3.5, Supernatural: 4 },
} as const;

const sizeOrder = Object.keys(hpMultipliers) as Array<keyof typeof hpMultipliers>;
const natureOrder = ['Mundane', 'Magical', 'Preternatural', 'Supernatural'] as const;

interface MonsterResult {
  category: CreatureCategory;
  threatDice: string;
  threatMV: number;
  size: keyof typeof hpMultipliers;
  nature: (typeof natureOrder)[number];
  creatureType: 'Normal' | 'Fast' | 'Tough';
  hitPoints: number;
  multiplier: number;
  activeDefense: number;
  passiveDefense: number;
  savingThrow: string;
  battlePhase: number;
  // New QSB fields
  name: string;
  attackType: 'Melee' | 'Natural' | 'Ranged' | 'Arcane';
  extraAttacks: number; // EA
  damageReduction: number; // DR (0 means None)
  battlePhaseDie: `d${number}`; // e.g., d8
  specialAbilities: string[];
}

function formatVaultThreatDice(threatDice: VaultCreature['threatDice']): string {
  const entries: Array<[label: string, value: string | undefined]> = [
    ['Melee', threatDice.melee],
    ['Natural', threatDice.natural],
    ['Ranged', threatDice.ranged],
    ['Arcane', threatDice.arcane],
  ];

  const formatted = entries
    .filter(([, value]) => typeof value === 'string' && value.trim().length > 0)
    .map(([label, value]) => `${label} ${value}`);

  return formatted.length > 0 ? formatted.join(', ') : '—';
}

function formatVaultDR(dr: string): string {
  const trimmed = dr.trim();
  if (!trimmed || trimmed === '0' || trimmed.toLowerCase() === 'none') {
    return 'None';
  }
  return dr;
}

function formatVaultExtraAttacks(extraAttacks?: string): string {
  if (!extraAttacks || extraAttacks.trim().length === 0 || extraAttacks.trim() === '0') {
    return 'None';
  }
  return extraAttacks;
}

function deriveCategoryFromThreat(threatMV: number): CreatureCategory {
  if (threatMV <= 12) return 'Minor';
  if (threatMV <= 24) return 'Standard';
  if (threatMV <= 40) return 'Exceptional';
  return 'Legendary';
}

function extractThreatFromNpcData(npc: SavedCharacter): number | undefined {
  const rawData = npc.full_data;
  if (!rawData || typeof rawData !== 'object') {
    return undefined;
  }

  const candidate = rawData as Record<string, unknown>;
  if (typeof candidate.threatMV === 'number' && Number.isFinite(candidate.threatMV)) {
    return candidate.threatMV;
  }
  if (typeof candidate.threat_mv === 'number' && Number.isFinite(candidate.threat_mv)) {
    return candidate.threat_mv;
  }
  return undefined;
}

function estimateNpcThreatMV(npc: SavedCharacter): number {
  const directThreat = extractThreatFromNpcData(npc);
  if (typeof directThreat === 'number' && directThreat > 0) {
    return Math.round(directThreat);
  }

  const levelThreat = Math.max(4, npc.level * 4);
  const defenseThreat = Math.round((npc.computed.active_dp + npc.computed.passive_dp) / 2);
  const spiritBonus = Math.round(npc.computed.spirit_pts / 2);

  return Math.max(4, Math.max(levelThreat, defenseThreat + spiritBonus));
}

function buildVaultNpcEntry(npc: SavedCharacter): VaultCreature {
  const threatMV = estimateNpcThreatMV(npc);
  const category = deriveCategoryFromThreat(threatMV);
  const fullData = (npc.full_data && typeof npc.full_data === 'object')
    ? (npc.full_data as Record<string, unknown>)
    : {};
  const activeHp = npc.status.current_hp_active || npc.computed.active_dp;
  const passiveHp = npc.status.current_hp_passive || npc.computed.passive_dp;
  const totalHp = activeHp + passiveHp;
  const hp = `${totalHp} (${activeHp}/${passiveHp})`;
  const masteryDie = typeof fullData.masteryDie === 'string' ? fullData.masteryDie : 'd6';
  const armor = typeof fullData.armor === 'string' && fullData.armor.trim().length > 0
    ? fullData.armor
    : 'None';
  const notes = typeof npc.status.notes === 'string' ? npc.status.notes.trim() : '';

  return {
    id: npc.id,
    entryType: 'npc',
    name: npc.name,
    category,
    nature: 'Mundane',
    size: 'Medium',
    threatMV,
    threatDice: {},
    hp,
    dr: armor,
    savingThrow: masteryDie,
    battlePhase: masteryDie,
    extraAttacks: undefined,
    specialAbilities: notes ? [notes] : [],
    source: 'NPC Roster',
    addedAt: new Date().toISOString()
  };
}


function calculateHitPoints(threatMV: number, size: keyof typeof hpMultipliers, nature: (typeof natureOrder)[number]) {
  const multiplier = hpMultipliers[size][nature];
  return {
    hitPoints: Math.round(threatMV * multiplier),
    multiplier,
  };
}

function calculateBattlePhase(prowessDie: number) {
  if (prowessDie >= 12) return 1;
  if (prowessDie >= 10) return 2;
  if (prowessDie >= 8) return 3;
  if (prowessDie >= 6) return 4;
  return 5;
}

function mapBattlePhaseToDieRank(battlePhase: number): `d${number}` {
  switch (battlePhase) {
    case 1:
      return 'd12';
    case 2:
      return 'd10';
    case 3:
      return 'd8';
    case 4:
      return 'd6';
    default:
      return 'd4';
  }
}

const attackTypes: Array<MonsterResult['attackType']> = ['Melee', 'Natural', 'Ranged', 'Arcane'];

function chooseAttackType(nature: (typeof natureOrder)[number]): MonsterResult['attackType'] {
  // Weighted by nature flavor
  switch (nature) {
    case 'Mundane':
      return Math.random() < 0.6 ? 'Melee' : 'Ranged';
    case 'Magical':
      return Math.random() < 0.5 ? 'Melee' : 'Arcane';
    case 'Preternatural':
      return Math.random() < 0.6 ? 'Natural' : 'Melee';
    case 'Supernatural':
      return Math.random() < 0.7 ? 'Arcane' : 'Natural';
    default:
      return attackTypes[Math.floor(Math.random() * attackTypes.length)];
  }
}

function computeExtraAttacks(category: CreatureCategory): number {
  if (category === 'Legendary') return 2;
  if (category === 'Exceptional') return 1;
  return 0;
}

function computeDR(category: CreatureCategory, creatureType: MonsterResult['creatureType'], nature: (typeof natureOrder)[number]): number {
  // Simple DR heuristic; can be refined later
  let base = 0;
  if (category === 'Standard') base = 1;
  if (category === 'Exceptional') base = 2;
  if (category === 'Legendary') base = 3;
  if (creatureType === 'Tough') base += 1;
  if (nature === 'Supernatural') base += 1;
  return Math.max(0, base);
}

function sizeAdjective(size: keyof typeof hpMultipliers): string | null {
  switch (size) {
    case 'Small':
      return 'Lesser';
    case 'Large':
      return 'Dire';
    case 'Huge':
      return 'Greater';
    case 'Gargantuan':
      return 'Titanic';
    default:
      return null;
  }
}

function generateMonsterName(size: keyof typeof hpMultipliers, nature: (typeof natureOrder)[number]): string {
  const mundane = ['Bandit', 'Mercenary', 'Wolf', 'Bear', 'Brigand'];
  const magical = ['Dire Wolf', 'Arcane Construct', 'Enchanted Sentinel', 'Spellhound'];
  const preternatural = ['Ghoul', 'Revenant', 'Shadow Beast', 'Night Stalker'];
  const supernatural = ['Wraith', 'Specter', 'Hellion', 'Dread Knight'];
  let pool = mundane;
  if (nature === 'Magical') pool = magical;
  if (nature === 'Preternatural') pool = preternatural;
  if (nature === 'Supernatural') pool = supernatural;
  const adj = sizeAdjective(size);
  const base = pool[Math.floor(Math.random() * pool.length)];
  const prefix = adj ? `${adj} ` : '';
  return `${prefix}${base}`;
}

function generateMonster(
  selectedTypes: CreatureCategory[],
  nonMediumPercentage: number,
  nonMundanePercentage: number,
  specialTypePercentage: number,
): MonsterResult {
  const category = selectedTypes[Math.floor(Math.random() * selectedTypes.length)];
  const diceOptions = threatDiceByCategory[category];
  const threatDice = diceOptions[Math.floor(Math.random() * diceOptions.length)];
  const [count, sides] = threatDice.split('d').map(Number);
  const threatMV = count * sides;

  let size: keyof typeof hpMultipliers = 'Medium';
  if (Math.random() * 100 < nonMediumPercentage) {
    const options = sizeOrder.filter(current => current !== 'Medium');
    size = options[Math.floor(Math.random() * options.length)];
  }

  let nature: (typeof natureOrder)[number] = 'Mundane';
  if (Math.random() * 100 < nonMundanePercentage) {
    const options = natureOrder.filter(current => current !== 'Mundane');
    nature = options[Math.floor(Math.random() * options.length)];
  }

  let creatureType: MonsterResult['creatureType'] = 'Normal';
  if (Math.random() * 100 < specialTypePercentage) {
    creatureType = Math.random() < 0.5 ? 'Fast' : 'Tough';
  }

  const { hitPoints, multiplier } = calculateHitPoints(threatMV, size, nature);
  let activeDefense: number;
  let passiveDefense: number;

  if (creatureType === 'Fast') {
    activeDefense = Math.round(hitPoints * 0.75);
    passiveDefense = hitPoints - activeDefense;
  } else if (creatureType === 'Tough') {
    passiveDefense = Math.round(hitPoints * 0.75);
    activeDefense = hitPoints - passiveDefense;
  } else {
    activeDefense = Math.round(hitPoints / 2);
    passiveDefense = hitPoints - activeDefense;
  }

  const battlePhase = calculateBattlePhase(sides);
  const savingThrow = `d${4 * (['Minor', 'Standard', 'Exceptional', 'Legendary'].indexOf(category) + 1)}`;

  // Enrich with QSB-required details
  const attackType = chooseAttackType(nature);
  const extraAttacks = computeExtraAttacks(category);
  const damageReduction = computeDR(category, creatureType, nature);
  const battlePhaseDie = mapBattlePhaseToDieRank(battlePhase);
  const name = generateMonsterName(size, nature);
  const specialAbilities: string[] = [];
  if (category === 'Exceptional' || category === 'Legendary') {
    // Light-touch flavorful specials; non-numeric by default
    const pool = [
      'Pack Tactics: +1 TD vs isolated foes',
      'Celerity Surge: +1 square per phase when charging',
      'Terrifying Presence: foes ST at encounter start',
      'Resilient Hide: ignores first 1 Threat per hit',
      'Arcane Lash: may convert one attack to Arcane'
    ];
    // Pick up to 2 unique abilities
    const count = category === 'Legendary' ? 2 : 1;
    while (specialAbilities.length < count && pool.length) {
      const idx = Math.floor(Math.random() * pool.length);
      specialAbilities.push(pool.splice(idx, 1)[0]);
    }
  }

  return {
    category,
    threatDice,
    threatMV,
    size,
    nature,
    creatureType,
    hitPoints,
    multiplier,
    activeDefense,
    passiveDefense,
    savingThrow,
    battlePhase,
    name,
    attackType,
    extraAttacks,
    damageReduction,
    battlePhaseDie,
    specialAbilities,
  };
}

export default function EncounterGeneratorPage() {
  return (
    <Suspense fallback={<div className="p-4 text-center">Loading encounter generator...</div>}>
      <EncounterGeneratorContent />
    </Suspense>
  );
}

function EncounterGeneratorContent() {
  const searchParams = useSearchParams();
  const backTarget = resolveBackTargetFromParam(searchParams.get('from'), 'gm-tools');

  const [partySize, setPartySize] = useState<number>(4);
  const [defenseLevelIndex, setDefenseLevelIndex] = useState<number>(0);
  const [difficultyIndex, setDifficultyIndex] = useState<number>(1);
  const [nonMediumPercentage, setNonMediumPercentage] = useState<number>(10);
  const [nonMundanePercentage, setNonMundanePercentage] = useState<number>(20);
  const [specialTypePercentage, setSpecialTypePercentage] = useState<number>(30);
  const [selectedTypes, setSelectedTypes] = useState<Record<CreatureCategory, boolean>>({
    Minor: true,
    Standard: true,
    Exceptional: true,
    Legendary: false,
  });
  const [encounterOutput, setEncounterOutput] = useState<string>('');

  // Party management state
  const [partyFolders, setPartyFolders] = useState<PartyFolder[]>([]);
  const [selectedPartyIds, setSelectedPartyIds] = useState<string[]>([]);
  const [selectedCharacterIds, setSelectedCharacterIds] = useState<string[]>([]);
  const [availableCharacters, setAvailableCharacters] = useState<SavedCharacter[]>([]);
  const [usePartyStats, setUsePartyStats] = useState<boolean>(false);
  const [partyDefenseProfile, setPartyDefenseProfile] = useState<PartyDefenseProfile | null>(null);
  const [availableMonsters, setAvailableMonsters] = useState<MonsterData[]>([]);
  const [selectedNpcIdToStage, setSelectedNpcIdToStage] = useState<string>('');
  const [importedVaultCreatures, setImportedVaultCreatures] = useState<VaultCreature[]>([]);

  // Encounter Vault — persisted bestiary picks
  const [vaultCreatures, setVaultCreatures] = useState<VaultCreature[]>([]);

  const availableNpcCharacters = useMemo(
    () => availableCharacters.filter(character => character.type === 'NPC'),
    [availableCharacters]
  );

  const vaultCreatureRows = useMemo(
    () => vaultCreatures
      .map((creature, index) => ({ creature, index }))
      .filter(({ creature }) => creature.entryType !== 'npc'),
    [vaultCreatures]
  );

  const vaultNpcRows = useMemo(
    () => vaultCreatures
      .map((creature, index) => ({ creature, index }))
      .filter(({ creature }) => creature.entryType === 'npc'),
    [vaultCreatures]
  );

  const vaultThreatTotal = useMemo(
    () => vaultCreatures.reduce((sum, c) => sum + c.threatMV, 0),
    [vaultCreatures],
  );

  const importedThreatTotal = useMemo(
    () => importedVaultCreatures.reduce((sum, c) => sum + c.threatMV, 0),
    [importedVaultCreatures]
  );

  const activeDefenseLevel = defenseLevels[defenseLevelIndex];
  const activeDifficultyLabel = difficultyLevels[difficultyIndex];

  useEffect(() => {
    initializeDefaultFolders();
    // Load party folders and characters
    const pcFolders = getAllPartyFolders().filter(f => f.folder_type === 'PC_party');
    const npcFolders = getAllPartyFolders().filter(f => f.folder_type === 'NPC_roster');
    setPartyFolders([...pcFolders, ...npcFolders]);

    const allChars = getCharactersByType('PC').concat(getCharactersByType('NPC'));
    setAvailableCharacters(allChars);

    const monsters = getCharactersByType('Monster') as MonsterData[];
    setAvailableMonsters(monsters);

    // Vault sync
    setVaultCreatures(getVaultCreatures());
    const unsub = onVaultChange(() => setVaultCreatures(getVaultCreatures()));
    return unsub;
  }, []);

  useEffect(() => {
    if (availableNpcCharacters.length === 0) {
      if (selectedNpcIdToStage) {
        setSelectedNpcIdToStage('');
      }
      return;
    }

    const stillAvailable = availableNpcCharacters.some(character => character.id === selectedNpcIdToStage);
    if (!stillAvailable) {
      setSelectedNpcIdToStage(availableNpcCharacters[0].id);
    }
  }, [availableNpcCharacters, selectedNpcIdToStage]);

  useEffect(() => {
    // Calculate party defense profile when selection changes
    if (usePartyStats && (selectedPartyIds.length > 0 || selectedCharacterIds.length > 0)) {
      let allSelectedCharIds: string[] = [...selectedCharacterIds];

      // Add characters from selected parties
      selectedPartyIds.forEach(partyId => {
        const partyChars = getPartyCharacters(partyId);
        allSelectedCharIds = [...allSelectedCharIds, ...partyChars.map(c => c.id)];
      });

      // Remove duplicates
      allSelectedCharIds = Array.from(new Set(allSelectedCharIds));

      if (allSelectedCharIds.length > 0) {
        const profile = calculatePartyDefenseProfile(allSelectedCharIds);
        setPartyDefenseProfile(profile);

        // Auto-update party size and defense level based on party
        setPartySize(profile.character_count);
        const defenseIndex = defenseLevels.indexOf(profile.defense_tier as typeof defenseLevels[number]);
        if (defenseIndex >= 0) {
          setDefenseLevelIndex(defenseIndex);
        }
      } else {
        setPartyDefenseProfile(null);
      }
    } else {
      setPartyDefenseProfile(null);
    }
  }, [selectedPartyIds, selectedCharacterIds, usePartyStats]);

  const toggleCreatureType = useCallback((type: CreatureCategory) => {
    setSelectedTypes(prev => ({ ...prev, [type]: !prev[type] }));
  }, []);

  const handleStageNpc = useCallback(() => {
    if (!selectedNpcIdToStage) {
      return;
    }

    const npc = availableNpcCharacters.find(character => character.id === selectedNpcIdToStage);
    if (!npc) {
      return;
    }

    addToVault(buildVaultNpcEntry(npc));
  }, [availableNpcCharacters, selectedNpcIdToStage]);

  const handleImportStagedRoster = useCallback(() => {
    setImportedVaultCreatures(vaultCreatures);
  }, [vaultCreatures]);

  const handleClearImportedRoster = useCallback(() => {
    setImportedVaultCreatures([]);
  }, []);

  const handleGenerate = useCallback(() => {
    const enabledTypes = (Object.keys(selectedTypes) as CreatureCategory[]).filter(type => selectedTypes[type]);
    if (!enabledTypes.length) {
      setEncounterOutput('Please select at least one creature type.');
      return;
    }

    // Always use calculated defense tier if party stats are enabled
    let defenseTier = activeDefenseLevel;
    let partySz = partySize;
    if (usePartyStats && partyDefenseProfile) {
      defenseTier = partyDefenseProfile.defense_tier;
      partySz = partyDefenseProfile.character_count;
    }
    const difficultyBand = encounterDifficultyTable[partySz];
    const targetThreat = difficultyBand[defenseTier][difficultyIndex];

    const importedEntries = importedVaultCreatures;
    const importedThreat = importedEntries.reduce((sum, creature) => sum + creature.threatMV, 0);

    // Start from imported staged roster, then fill to budget.
    let totalThreatMV = importedThreat;
    let remainingBudget = Math.max(0, targetThreat - importedThreat);

    const stagedReinforcements: VaultCreature[] = [];
    const reinforcementPool = importedEntries.filter(creature => creature.threatMV > 0);
    if (remainingBudget > 0 && reinforcementPool.length > 0) {
      const minReinforcementThreat = Math.min(...reinforcementPool.map(creature => creature.threatMV));
      let reinforcementSafety = 0;

      while (remainingBudget >= minReinforcementThreat && reinforcementSafety < 120) {
        const candidate = reinforcementPool
          .filter(creature => creature.threatMV <= remainingBudget)
          .sort((a, b) => b.threatMV - a.threatMV)[0];

        if (!candidate) {
          break;
        }

        stagedReinforcements.push(candidate);
        totalThreatMV += candidate.threatMV;
        remainingBudget -= candidate.threatMV;
        reinforcementSafety++;
      }
    }

    // Procedural generation fills whatever threat remains after imported roster.
    const monsters: MonsterResult[] = [];
    let safety = 0;

    const minThreats: Record<CreatureCategory, number> = {
      Minor: 4,
      Standard: 8,
      Exceptional: 12,
      Legendary: 36,
    };

    const minPossibleThreat = Math.min(...enabledTypes.map(t => minThreats[t]));

    while (remainingBudget >= minPossibleThreat && safety < 100) {
      const monster = generateMonster(
        enabledTypes,
        nonMediumPercentage,
        nonMundanePercentage,
        specialTypePercentage,
      );

      if (monster.threatMV === 0) break;

      // Only add monster if it fits within the remaining budget
      if (monster.threatMV <= remainingBudget) {
        monsters.push(monster);
        totalThreatMV += monster.threatMV;
        remainingBudget -= monster.threatMV;
      }

      safety++;
    }

    // Check if encounter exceeds budget (should not happen with new logic)
    const budgetExceeded = totalThreatMV > targetThreat;
    const budgetUtilization = targetThreat > 0 ? (totalThreatMV / targetThreat) * 100 : 0;

    const lines: string[] = [];
    lines.push('Eldritch RPG Encounter');
    lines.push('=========================');

    // Add party information if using party stats
    if (usePartyStats && partyDefenseProfile) {
      lines.push('Party Information:');
      lines.push(`Selected Parties: ${selectedPartyIds.map(id => partyFolders.find(f => f.id === id)?.name).filter(Boolean).join(', ') || 'None'}`);
      lines.push(`Party Size: ${partyDefenseProfile.character_count} characters`);
      lines.push(`Active DP: ${partyDefenseProfile.total_active_dp} | Passive DP: ${partyDefenseProfile.total_passive_dp} | Spirit: ${partyDefenseProfile.total_spirit_pts}`);
      lines.push(`Calculated Defense Tier: ${partyDefenseProfile.defense_tier}`);
      lines.push('');
      lines.push('Character Breakdown:');
      partyDefenseProfile.character_breakdown.forEach((char) => {
        lines.push(`  ${char.name}: A${char.active_dp}/P${char.passive_dp}/S${char.spirit_pts}`);
      });
      lines.push('');
    } else {
      lines.push(`Party Size: ${partySize}`);
      lines.push(`Defense Level: ${activeDefenseLevel}`);
    }

    lines.push(`Difficulty: ${activeDifficultyLabel}`);
    lines.push(`Target Threat Budget: ${targetThreat}`);
    lines.push(`Encounter Threat Total: ${totalThreatMV} (${budgetUtilization.toFixed(1)}% of budget)`);
    lines.push(`Imported Roster Threat: ${importedThreat}`);
    lines.push(`Remaining Threat After Fill: ${remainingBudget}`);

    if (budgetExceeded) {
      lines.push('⚠️  WARNING: Encounter exceeds target threat budget after imports.');
    } else if (budgetUtilization < 80) {
      lines.push(`ℹ️  Note: Encounter uses ${budgetUtilization.toFixed(1)}% of available threat budget`);
    }

    if (importedEntries.length > 0) {
      lines.push('');
      lines.push('Imported Staged Roster:');
      lines.push('=========================');
      importedEntries.forEach(creature => {
        const rosterLabel = creature.entryType === 'npc' ? 'NPC' : creature.category;
        lines.push(`${rosterLabel} — ${creature.name}`);
        lines.push(
          `TD: ${formatVaultThreatDice(creature.threatDice)} | EA: ${formatVaultExtraAttacks(creature.extraAttacks)} | DR: ${formatVaultDR(creature.dr)} | ST: ${creature.savingThrow} | BP: ${creature.battlePhase}`
        );
        lines.push(`HP: ${creature.hp} [${creature.size}, ${creature.nature}] – Threat MV: ${creature.threatMV}`);
        if (creature.specialAbilities.length > 0) {
          lines.push(`Special: ${creature.specialAbilities.join('; ')}`);
        }
        lines.push('');
      });
    }

    if (stagedReinforcements.length > 0) {
      lines.push('Auto-Added Reinforcements (from imported roster):');
      lines.push('=========================');
      stagedReinforcements.forEach((creature, index) => {
        const rosterLabel = creature.entryType === 'npc' ? 'NPC Reinforcement' : 'Creature Reinforcement';
        lines.push(`${index + 1}. ${rosterLabel}: ${creature.name} (Threat MV ${creature.threatMV})`);
      });
      lines.push('');
    }

    lines.push('Generated Additions:');
    lines.push('=========================');
    if (monsters.length === 0) {
      lines.push(importedEntries.length > 0
        ? 'No procedural additions were required.'
        : 'No creatures could be generated with current settings.');
      lines.push('');
    } else {
      monsters.forEach((monster) => {
        lines.push(`${monster.category} — ${monster.name}`);
        lines.push(
          `TD: ${monster.threatDice} [${monster.attackType}] | EA: ${monster.extraAttacks} | DR: ${monster.damageReduction === 0 ? 'None' : monster.damageReduction} | ST: ${monster.savingThrow} | BP: ${monster.battlePhase} (${monster.battlePhaseDie})`
        );
        lines.push(
          `HP: ${monster.hitPoints} (AD ${monster.activeDefense} / PD ${monster.passiveDefense}) [${monster.size}, ${monster.nature}; ×${monster.multiplier}] ${monster.creatureType}`
        );
        if (monster.specialAbilities.length > 0) {
          lines.push(`Special: ${monster.specialAbilities.join('; ')}`);
        }
        lines.push('');
      });
    }

    if (remainingBudget > 0) {
      lines.push(`⚠️  Unfilled threat budget remains: ${remainingBudget}`);
      lines.push('');
    }

    // Add monster suggestions from saved library
    if (availableMonsters.length > 0) {
      lines.push('Saved Monster Suggestions:');
      lines.push('=========================');

      // Find monsters that fit within the threat budget
      const suitableMonsters = availableMonsters.filter(monster => {
        const monsterThreat = monster.threat_mv;
        return monsterThreat <= targetThreat && monsterThreat >= targetThreat * 0.1; // Within 10% to 100% of budget
      });

      if (suitableMonsters.length > 0) {
        // Group by trope
        const monstersByTrope = suitableMonsters.reduce((acc, monster) => {
          if (!acc[monster.monster_trope]) acc[monster.monster_trope] = [];
          acc[monster.monster_trope].push(monster);
          return acc;
        }, {} as Record<string, MonsterData[]>);

        Object.entries(monstersByTrope).forEach(([trope, monsters]) => {
          lines.push(`${trope.toUpperCase()}:`);
          monsters.slice(0, 3).forEach(monster => { // Limit to 3 per trope
            const roles = monster.preferred_encounter_roles.join(', ');
            lines.push(`  ${monster.name} (Threat MV ${monster.threat_mv}, HP ${monster.hp_calculation.final_hp}) [${roles}]`);
          });
          lines.push('');
        });
      } else {
        lines.push('No saved monsters match the current threat budget.');
        lines.push('Consider creating monsters in the Monster Generator.');
        lines.push('');
      }
    }

    setEncounterOutput(lines.join('\n'));
  }, [
    selectedTypes,
    partySize,
    activeDefenseLevel,
    difficultyIndex,
    activeDifficultyLabel,
    nonMediumPercentage,
    nonMundanePercentage,
    specialTypePercentage,
    usePartyStats,
    partyDefenseProfile,
    selectedPartyIds,
    partyFolders,
    availableMonsters,
    importedVaultCreatures,
  ]);

  const selectedCount = useMemo(
    () => (Object.values(selectedTypes).filter(Boolean).length),
    [selectedTypes],
  );


  return (
    <div className="container mx-auto px-4 py-8">
      <ContentBox>
        <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
          <header className="flex items-center gap-4">
            <Link
              href={backTarget.href}
              className="inline-flex items-center gap-2 rounded-md bg-btn-bg px-4 py-2 text-sm font-semibold text-off-white shadow hover:bg-btn-hover"
            >
              {backTarget.label}
            </Link>
          </header>


          <h1 className="text-center text-3xl font-bold tracking-tight text-soft-amethyst sm:text-4xl">
            Eldritch RPG Encounter Generator
          </h1>

          {/* Party Selection Section */}
          <ContentBox>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-soft-amethyst">Party Selection</h2>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={usePartyStats}
                  onChange={(e) => setUsePartyStats(e.target.checked)}
                  className="rounded border-gray-300 text-soft-amethyst focus:ring-soft-amethyst"
                />
                <span className="text-sm text-off-white/80">Use saved party stats</span>
              </label>
            </div>

            {usePartyStats && (
              <div className="space-y-4">
                {/* Party Folder Selection */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-soft-amethyst">
                      Select Party Folders
                    </label>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => setSelectedPartyIds(partyFolders.map(f => f.id))}
                        className="text-xs bg-btn-bg hover:bg-btn-hover text-off-white px-2 py-1 rounded"
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedPartyIds([])}
                        className="text-xs bg-gray-600 hover:bg-gray-700 text-off-white px-2 py-1 rounded"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {partyFolders.map(folder => {
                      const folderChars = getPartyCharacters(folder.id);
                      return (
                        <label key={folder.id} className="flex items-center space-x-2 p-2 bg-charcoal-violet/50 rounded">
                          <input
                            type="checkbox"
                            checked={selectedPartyIds.includes(folder.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedPartyIds([...selectedPartyIds, folder.id]);
                              } else {
                                setSelectedPartyIds(selectedPartyIds.filter(id => id !== folder.id));
                              }
                            }}
                            className="rounded border-gray-300 text-soft-amethyst"
                          />
                          <div className="flex-1">
                            <span className="text-sm text-off-white/80 font-medium">
                              {folder.name}
                            </span>
                            <span className="text-xs text-off-white/60 ml-1">
                              ({folder.folder_type === 'PC_party' ? 'PC' : 'NPC'}) - {folderChars.length} characters
                            </span>
                            {folderChars.length > 0 && (
                              <div className="text-xs text-off-white/50 mt-1">
                                {folderChars.slice(0, 3).map(char => char.name).join(', ')}
                                {folderChars.length > 3 && ` +${folderChars.length - 3} more`}
                              </div>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Individual Character Selection */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-soft-amethyst">
                      Additional Individual Characters
                    </label>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => setSelectedCharacterIds(availableCharacters.map(c => c.id))}
                        className="text-xs bg-btn-bg hover:bg-btn-hover text-off-white px-2 py-1 rounded"
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedCharacterIds([])}
                        className="text-xs bg-gray-600 hover:bg-gray-700 text-off-white px-2 py-1 rounded"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {availableCharacters.map(character => (
                      <label key={character.id} className="flex items-center space-x-2 p-2 bg-charcoal-violet/50 rounded">
                        <input
                          type="checkbox"
                          checked={selectedCharacterIds.includes(character.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCharacterIds([...selectedCharacterIds, character.id]);
                            } else {
                              setSelectedCharacterIds(selectedCharacterIds.filter(id => id !== character.id));
                            }
                          }}
                          className="rounded border-gray-300 text-soft-amethyst"
                        />
                        <div className="flex-1">
                          <span className="text-xs text-off-white/80 font-medium">
                            {character.name}
                          </span>
                          <span className="text-xs text-off-white/60 ml-1">
                            ({character.type})
                          </span>
                          <div className="text-xs text-off-white/50">
                            Level {character.level} • {character.race} {character.class}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Party Stats Display */}
                {partyDefenseProfile && (
                  <div className="mt-4 p-4 bg-charcoal-violet/50 rounded-lg">
                    <h3 className="text-lg font-semibold text-soft-amethyst mb-2">Calculated Party Stats</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-off-white/60">Party Size:</span>
                        <div className="text-muted-eldritch-green font-bold">{partyDefenseProfile.character_count}</div>
                      </div>
                      <div>
                        <span className="text-off-white/60">Defense Tier:</span>
                        <div className="text-muted-eldritch-green font-bold">{partyDefenseProfile.defense_tier}</div>
                      </div>
                      <div>
                        <span className="text-off-white/60">Active DP:</span>
                        <div className="text-muted-eldritch-green font-bold">{partyDefenseProfile.total_active_dp}</div>
                      </div>
                      <div>
                        <span className="text-off-white/60">Passive DP:</span>
                        <div className="text-muted-eldritch-green font-bold">{partyDefenseProfile.total_passive_dp}</div>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-off-white/50">
                      Auto-updating manual party size and defense level settings based on calculated values.
                    </div>
                  </div>
                )}
              </div>
            )}
          </ContentBox>

          {/* Staged Session Roster */}
          <ContentBox>
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h2 className="text-xl font-semibold text-soft-amethyst">
                  Staged Session Roster
                  {vaultCreatures.length > 0 && (
                    <span className="ml-2 text-sm font-normal text-muted-eldritch-green">
                      ({vaultCreatures.length} staged · Threat {vaultThreatTotal})
                    </span>
                  )}
                </h2>
                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    href="/bestiary?from=encounter-generator"
                    className="text-xs bg-btn-bg hover:bg-btn-hover text-off-white px-3 py-1.5 rounded font-semibold"
                  >
                    ← Browse Bestiary
                  </Link>
                  <Link
                    href="/npc-roster?from=encounter-generator"
                    className="text-xs bg-charcoal-violet/70 hover:bg-charcoal-violet text-off-white px-3 py-1.5 rounded font-semibold border border-white/15"
                  >
                    Open NPC Roster →
                  </Link>
                  {vaultCreatures.length > 0 && (
                    <button
                      type="button"
                      onClick={() => clearVault()}
                      className="text-xs text-red-400 hover:text-red-300 border border-red-400/40 px-2 py-1.5 rounded"
                    >
                      Clear Staged
                    </button>
                  )}
                </div>
              </div>

              <div className="rounded-md border border-white/10 bg-charcoal-violet/40 px-3 py-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-soft-amethyst">Stage NPC:</span>
                  {availableNpcCharacters.length === 0 ? (
                    <span className="text-xs text-off-white/60">No saved NPCs found.</span>
                  ) : (
                    <>
                      <select
                        value={selectedNpcIdToStage}
                        onChange={(event) => setSelectedNpcIdToStage(event.target.value)}
                        className="text-xs border border-white/15 rounded px-2 py-1 bg-charcoal-violet/80 text-off-white"
                      >
                        {availableNpcCharacters.map(npc => (
                          <option key={npc.id} value={npc.id}>
                            {npc.name} (Threat {estimateNpcThreatMV(npc)})
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={handleStageNpc}
                        className="text-xs bg-btn-bg hover:bg-btn-hover text-off-white px-3 py-1.5 rounded font-semibold"
                      >
                        Stage NPC
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleImportStagedRoster}
                  disabled={vaultCreatures.length === 0}
                  className="text-xs bg-btn-bg hover:bg-btn-hover disabled:bg-white/20 disabled:text-off-white/40 text-off-white px-3 py-1.5 rounded font-semibold"
                >
                  Import Staged Roster to Encounter
                </button>
                {importedVaultCreatures.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearImportedRoster}
                    className="text-xs text-red-300 hover:text-red-200 border border-red-300/40 px-2 py-1.5 rounded"
                  >
                    Clear Imported
                  </button>
                )}
                <span className="text-xs text-off-white/60">
                  Imported: {importedVaultCreatures.length} {importedVaultCreatures.length === 1 ? 'entry' : 'entries'} · Threat {importedThreatTotal}
                </span>
              </div>

              {vaultCreatures.length === 0 ? (
                <p className="text-sm text-off-white/50 text-center py-2">
                  No staged entries yet. Stage creatures from Bestiary and NPCs here, then import them into encounter generation.
                </p>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-soft-amethyst">
                      Creatures / Monsters ({vaultCreatureRows.length})
                    </h3>
                    {vaultCreatureRows.length === 0 ? (
                      <p className="text-xs text-off-white/50">No staged creatures yet.</p>
                    ) : (
                      vaultCreatureRows.map(({ creature, index }) => (
                        <div
                          key={`${creature.id}-${index}`}
                          className="flex items-start justify-between gap-3 rounded-md bg-charcoal-violet/60 border border-muted-eldritch-green/30 px-4 py-3"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-off-white/90 text-sm">{creature.name}</span>
                              <span className="text-xs text-soft-amethyst/80 border border-soft-amethyst/30 px-1.5 rounded">
                                {creature.category}
                              </span>
                              <span className="text-xs text-muted-eldritch-green/80">
                                Threat {creature.threatMV}
                              </span>
                            </div>
                            <div className="text-xs text-off-white/50 mt-0.5">
                              TD: {formatVaultThreatDice(creature.threatDice)} · HP: {creature.hp} · DR: {formatVaultDR(creature.dr)} · ST: {creature.savingThrow} · BP: {creature.battlePhase}
                              {formatVaultExtraAttacks(creature.extraAttacks) !== 'None' && ` · EA: ${formatVaultExtraAttacks(creature.extraAttacks)}`}
                            </div>
                            <div className="text-xs text-off-white/40">
                              {creature.size} {creature.nature} [{creature.source}]
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFromVaultByIndex(index)}
                            className="shrink-0 text-xs text-red-400 hover:text-red-300 mt-0.5"
                            aria-label={`Remove ${creature.name}`}
                          >
                            ✕
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-soft-amethyst">
                      NPCs ({vaultNpcRows.length})
                    </h3>
                    {vaultNpcRows.length === 0 ? (
                      <p className="text-xs text-off-white/50">No staged NPCs yet.</p>
                    ) : (
                      vaultNpcRows.map(({ creature, index }) => (
                        <div
                          key={`${creature.id}-${index}`}
                          className="flex items-start justify-between gap-3 rounded-md bg-charcoal-violet/60 border border-soft-amethyst/30 px-4 py-3"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-off-white/90 text-sm">{creature.name}</span>
                              <span className="text-xs text-soft-amethyst/80 border border-soft-amethyst/30 px-1.5 rounded">
                                NPC
                              </span>
                              <span className="text-xs text-muted-eldritch-green/80">
                                Threat {creature.threatMV}
                              </span>
                            </div>
                            <div className="text-xs text-off-white/50 mt-0.5">
                              HP: {creature.hp} · DR: {formatVaultDR(creature.dr)} · ST: {creature.savingThrow} · BP: {creature.battlePhase}
                            </div>
                            <div className="text-xs text-off-white/40">
                              {creature.size} {creature.nature} [{creature.source}]
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFromVaultByIndex(index)}
                            className="shrink-0 text-xs text-red-400 hover:text-red-300 mt-0.5"
                            aria-label={`Remove ${creature.name}`}
                          >
                            ✕
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </ContentBox>

          <section className="space-y-6">
            <Slider
              label="Party Size"
              value={partySize}
              min={1}
              max={4}
              onChange={setPartySize}
              displayValue={String(partySize)}
            />
            <Slider
              label="Party Defense Level"
              value={defenseLevelIndex}
              min={0}
              max={defenseLevels.length - 1}
              onChange={setDefenseLevelIndex}
              displayValue={activeDefenseLevel}
            />
            <Slider
              label="Desired Difficulty"
              value={difficultyIndex}
              min={0}
              max={difficultyLevels.length - 1}
              onChange={setDifficultyIndex}
              displayValue={activeDifficultyLabel}
            />
            <Slider
              label="Non-Medium Size Percentage"
              value={nonMediumPercentage}
              min={0}
              max={100}
              onChange={setNonMediumPercentage}
              displayValue={`${nonMediumPercentage}%`}
            />
            <Slider
              label="Non-Mundane Nature Percentage"
              value={nonMundanePercentage}
              min={0}
              max={100}
              onChange={setNonMundanePercentage}
              displayValue={`${nonMundanePercentage}%`}
            />
            <Slider
              label="Fast/Tough Creature Percentage"
              value={specialTypePercentage}
              min={0}
              max={100}
              onChange={setSpecialTypePercentage}
              displayValue={`${specialTypePercentage}%`}
            />
          </section>

          <ContentBox>
            <h2 className="text-lg font-semibold text-soft-amethyst">Creature Pool</h2>
            <p className="mt-1 text-sm text-off-white/80">
              Select the threat categories to include. Currently enabled: {selectedCount}.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {(Object.keys(selectedTypes) as CreatureCategory[]).map(type => (
                <label key={type} className="flex items-center gap-3 rounded-md border border-muted-eldritch-green/40 bg-charcoal-violet/50 px-4 py-3 text-sm shadow-sm">
                  <input
                    type="checkbox"
                    checked={selectedTypes[type]}
                    onChange={() => toggleCreatureType(type)}
                    className="h-4 w-4 rounded border-muted-eldritch-green/60 bg-charcoal-violet text-soft-amethyst focus:ring-soft-amethyst"
                  />
                  <span className="font-medium text-off-white/80">{type}</span>
                </label>
              ))}
            </div>
          </ContentBox>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={handleGenerate}
              className="inline-flex items-center justify-center rounded-md border border-soft-amethyst/40 bg-btn-bg px-5 py-3 text-base font-semibold text-off-white shadow-md transition-all hover:bg-btn-hover hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-soft-amethyst active:translate-y-px"
            >
              Generate Encounter
            </button>
            <span className="text-sm text-off-white/60">
              Tips: adjust sliders, then regenerate for new results.
            </span>
          </div>

          <pre className="min-h-[12rem] whitespace-pre-wrap rounded-lg border border-muted-eldritch-green/40 bg-charcoal-violet/50 p-6 text-sm text-off-white shadow-inner">
            {encounterOutput || 'Encounter details will appear here. Adjust settings and generate to begin.'}
          </pre>
        </div>
      </ContentBox>
    </div>
  );
}

interface SliderProps {
  label: string;
  value: number;
  displayValue: string;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

function Slider({ label, value, displayValue, min, max, onChange }: SliderProps) {
  return (
    <ContentBox>
      <span className="flex items-center justify-between text-sm font-medium text-soft-amethyst">
        {label}
        <span className="text-off-white">{displayValue}</span>
      </span>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        onChange={event => onChange(Number(event.target.value))}
        className="mt-4 h-2 w-full cursor-pointer appearance-none rounded-full bg-charcoal-violet/50 accent-soft-amethyst"
      />
    </ContentBox>
  );
}
