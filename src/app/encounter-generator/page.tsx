'use client';

import { useCallback, useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import {
  getAllPartyFolders,
  getPartyCharacters,
  calculatePartyDefenseProfile,
  getCharactersByType,
  initializeDefaultFolders
} from '../../utils/partyStorage';
import { PartyFolder, SavedCharacter, MonsterData, PartyDefenseProfile } from '../../types/party';

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
}

const readLocalPartyDefense = () => {
  if (typeof window === 'undefined') return null;
  try {
    const value = window.localStorage.getItem('eldritch_party_defense');
    if (!value) return null;
    return JSON.parse(value) as {
      totalAD: number;
      totalPD: number;
      total: number;
      tier: (typeof defenseLevels)[number];
      range?: string;
      count?: number;
    };
  } catch (error) {
    console.error('Unable to read stored party defense', error);
    return null;
  }
};

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
  };
}

export default function EncounterGeneratorPage() {
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
  }, []);

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

    // Generate monsters so that their total threatMV matches or is just under the targetThreat
    let totalThreatMV = 0;
    const monsters: MonsterResult[] = [];
    let safety = 0;
    let remainingBudget = targetThreat;

    while (remainingBudget > 0 && safety < 100) {
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

      // Stop if remaining budget is too small for any meaningful threat
      if (remainingBudget < 4) break;
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
    lines.push(`Generated Total Threat: ${totalThreatMV} (${budgetUtilization.toFixed(1)}% of budget)`);

    if (budgetExceeded) {
      lines.push('⚠️  WARNING: Generated encounter exceeds target threat budget!');
    } else if (budgetUtilization < 80) {
      lines.push(`ℹ️  Note: Encounter uses ${budgetUtilization.toFixed(1)}% of available threat budget`);
    }

    lines.push('');
    lines.push('Creatures:');
    lines.push('=========================');

    monsters.forEach((monster, index) => {
      lines.push(`Monster ${index + 1}`);
      lines.push(
        `Type: ${monster.category} | TD: ${monster.threatDice} | HP: ${monster.hitPoints} (${monster.activeDefense}/${monster.passiveDefense}) [${monster.size}, ${monster.nature}; ×${monster.multiplier}] ${monster.creatureType}`,
      );
      lines.push(`ST: ${monster.savingThrow} | BP: ${monster.battlePhase}`);
      lines.push('');
    });

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
  ]);

  const selectedCount = useMemo(
    () => (Object.values(selectedTypes).filter(Boolean).length),
    [selectedTypes],
  );


  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
        <header className="flex items-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
          >
            ← Back to Home
          </Link>
        </header>


        <h1 className="text-center text-3xl font-bold tracking-tight text-emerald-400 sm:text-4xl">
          Eldritch RPG Encounter Generator
        </h1>

        {/* Party Selection Section */}
        <section className="rounded-lg border border-slate-700 bg-slate-900/70 p-6 shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-emerald-300">Party Selection</h2>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={usePartyStats}
                onChange={(e) => setUsePartyStats(e.target.checked)}
                className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-sm text-slate-200">Use saved party stats</span>
            </label>
          </div>

          {usePartyStats && (
            <div className="space-y-4">
              {/* Party Folder Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-emerald-300">
                    Select Party Folders
                  </label>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setSelectedPartyIds(partyFolders.map(f => f.id))}
                      className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded"
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPartyIds([])}
                      className="text-xs bg-slate-600 hover:bg-slate-700 text-white px-2 py-1 rounded"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {partyFolders.map(folder => {
                    const folderChars = getPartyCharacters(folder.id);
                    return (
                      <label key={folder.id} className="flex items-center space-x-2 p-2 bg-slate-800 rounded">
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
                          className="rounded border-gray-300 text-emerald-600"
                        />
                        <div className="flex-1">
                          <span className="text-sm text-slate-200 font-medium">
                            {folder.name}
                          </span>
                          <span className="text-xs text-slate-400 ml-1">
                            ({folder.folder_type === 'PC_party' ? 'PC' : 'NPC'}) - {folderChars.length} characters
                          </span>
                          {folderChars.length > 0 && (
                            <div className="text-xs text-slate-500 mt-1">
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
                  <label className="text-sm font-medium text-emerald-300">
                    Additional Individual Characters
                  </label>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setSelectedCharacterIds(availableCharacters.map(c => c.id))}
                      className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded"
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedCharacterIds([])}
                      className="text-xs bg-slate-600 hover:bg-slate-700 text-white px-2 py-1 rounded"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {availableCharacters.map(character => (
                    <label key={character.id} className="flex items-center space-x-2 p-2 bg-slate-800 rounded">
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
                        className="rounded border-gray-300 text-emerald-600"
                      />
                      <div className="flex-1">
                        <span className="text-xs text-slate-200 font-medium">
                          {character.name}
                        </span>
                        <span className="text-xs text-slate-400 ml-1">
                          ({character.type})
                        </span>
                        <div className="text-xs text-slate-500">
                          Level {character.level} • {character.race} {character.class}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Party Stats Display */}
              {partyDefenseProfile && (
                <div className="mt-4 p-4 bg-slate-800 rounded-lg">
                  <h3 className="text-lg font-semibold text-emerald-300 mb-2">Calculated Party Stats</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-slate-400">Party Size:</span>
                      <div className="text-emerald-400 font-bold">{partyDefenseProfile.character_count}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Defense Tier:</span>
                      <div className="text-emerald-400 font-bold">{partyDefenseProfile.defense_tier}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Active DP:</span>
                      <div className="text-emerald-400 font-bold">{partyDefenseProfile.total_active_dp}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Passive DP:</span>
                      <div className="text-emerald-400 font-bold">{partyDefenseProfile.total_passive_dp}</div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-slate-500">
                    Auto-updating manual party size and defense level settings based on calculated values.
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

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

        <section className="rounded-lg border border-slate-700 bg-slate-900/70 p-4 shadow">
          <h2 className="text-lg font-semibold text-emerald-300">Creature Pool</h2>
          <p className="mt-1 text-sm text-slate-300">
            Select the threat categories to include. Currently enabled: {selectedCount}.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {(Object.keys(selectedTypes) as CreatureCategory[]).map(type => (
              <label key={type} className="flex items-center gap-3 rounded-md border border-slate-700/70 bg-slate-800/70 px-4 py-3 text-sm shadow-sm">
                <input
                  type="checkbox"
                  checked={selectedTypes[type]}
                  onChange={() => toggleCreatureType(type)}
                  className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
                />
                <span className="font-medium text-slate-200">{type}</span>
              </label>
            ))}
          </div>
        </section>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={handleGenerate}
            className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-5 py-3 text-base font-semibold text-white shadow hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
          >
            Generate Encounter
          </button>
          <span className="text-sm text-slate-400">
            Tips: adjust sliders, then regenerate for new results.
          </span>
        </div>

        <pre className="min-h-[12rem] whitespace-pre-wrap rounded-lg border border-emerald-700/50 bg-slate-900/80 p-6 text-sm text-slate-100 shadow-inner">
          {encounterOutput || 'Encounter details will appear here. Adjust settings and generate to begin.'}
        </pre>
      </div>
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
    <label className="block rounded-lg border border-slate-700 bg-slate-900/70 p-4 shadow">
      <span className="flex items-center justify-between text-sm font-medium text-emerald-300">
        {label}
        <span className="text-slate-100">{displayValue}</span>
      </span>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        onChange={event => onChange(Number(event.target.value))}
        className="mt-4 h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-700 accent-emerald-500"
      />
    </label>
  );
}
