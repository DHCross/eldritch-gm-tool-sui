'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  saveCharacter,
  generateId,
  getCurrentUserId,
  getAllPartyFolders,
  savePartyMembership,
  getPartyMemberships,
  calculateComputedStats
} from '../utils/partyStorage';
import {
  calculateMonsterHP,
  calculateMovementRate,
  getPrimaryThreatType,
  generateBattlePhase,
  generateSavingThrow,
  getSuggestedTropes,
  parseThreatDice
} from '../utils/monsterUtils';
import {
  MonsterData,
  PartyFolder,
  PartyMembership,
  CreatureCategory,
  CreatureNature,
  CreatureSize,
  DefenseSplit,
  ThreatType,
  ThreatDice,
  MovementCalculation
} from '../types/party';
import { armorTypes } from '../data/battleData';

interface QSBResult {
  // Core QSB Stats
  creature_category: CreatureCategory;
  creature_nature: CreatureNature;
  creature_size: CreatureSize;
  defense_split: DefenseSplit;

  // Threat System
  threat_dice: ThreatDice;
  primary_threat_type: ThreatType;
  threat_mv: number;

  // Calculated Stats
  hp_calculation: MonsterData['hp_calculation'];
  movement_calculation: MovementCalculation;
  battle_phase: string;
  saving_throw: string;

  // Additional
  damage_reduction: string;
  extra_attacks: string[];
}

const CREATURE_NATURE_OPTIONS: { value: CreatureNature; label: string; modifier: number }[] = [
  { value: 'Mundane', label: 'Mundane', modifier: 1 },
  { value: 'Magical', label: 'Magical', modifier: 2 },
  { value: 'Preternatural', label: 'Preternatural', modifier: 3 },
  { value: 'Supernatural', label: 'Supernatural', modifier: 4 }
];

const CREATURE_SIZE_OPTIONS: { value: CreatureSize; label: string; modifier: number }[] = [
  { value: 'Minuscule', label: 'Minuscule', modifier: 0 },
  { value: 'Tiny', label: 'Tiny', modifier: 0 },
  { value: 'Small', label: 'Small', modifier: 1 },
  { value: 'Medium', label: 'Medium', modifier: 1 },
  { value: 'Large', label: 'Large', modifier: 2 },
  { value: 'Huge', label: 'Huge', modifier: 3 },
  { value: 'Gargantuan', label: 'Gargantuan', modifier: 4 }
];

const CREATURE_CATEGORIES: CreatureCategory[] = ['Minor', 'Standard', 'Exceptional', 'Legendary'];
const DIE_RANK_OPTIONS = ['d4', 'd6', 'd8', 'd10', 'd12', 'd14', 'd16', 'd18', 'd20', 'd30'];
const DEFENSE_SPLITS: DefenseSplit[] = ['Regular', 'Tough', 'Fast'];

const DICE_SIDES = [4, 6, 8, 10, 12, 14, 16, 18, 20, 30];
const DICE_COUNTS_BY_CATEGORY: Record<CreatureCategory, number[]> = {
  Minor: [1],
  Standard: [1, 2],
  Exceptional: [1, 2, 3],
  Legendary: [1, 2, 3, 4]
};

const THREAT_DICE_FIELDS: { key: keyof ThreatDice; label: string; helper: string }[] = [
  { key: 'melee', label: 'Melee Threat Dice (TD)', helper: 'Weapon and close-combat maneuvers.' },
  { key: 'natural', label: 'Natural Threat Dice (TD)', helper: 'Claws, bites, or other innate weapons.' },
  { key: 'ranged', label: 'Ranged Threat Dice (TD)', helper: 'Thrown weapons, bows, or firearms.' },
  { key: 'arcane', label: 'Arcane Threat Dice (TD)', helper: 'Spells, prayers, or supernatural effects.' }
];

const SPEED_MODIFIER_OPTIONS = ['Fast', 'Especially Speedy', 'Speed Focus d4-d6', 'Speed Focus d8-d10', 'Speed Focus d12+'];

const parseDiceComponents = (value: string): { count: number; sides: number } => {
  if (!value) return { count: 0, sides: 0 };
  const trimmed = value.trim();
  if (!trimmed || trimmed.toLowerCase() === 'none') {
    return { count: 0, sides: 0 };
  }
  const match = trimmed.match(/^(\d*)d(\d+)$/i);
  if (!match) {
    return { count: 0, sides: 0 };
  }
  const count = match[1] ? parseInt(match[1], 10) : 1;
  const sides = parseInt(match[2], 10);
  if (!count || !sides) {
    return { count: 0, sides: 0 };
  }
  return { count, sides };
};

const normalizeThreatDieValue = (value: string): string => {
  if (!value) return 'None';
  const trimmed = value.trim();
  if (!trimmed || trimmed.toLowerCase() === 'none') {
    return 'None';
  }
  const { count, sides } = parseDiceComponents(trimmed);
  if (!count || !sides) {
    return 'None';
  }
  return `${count}d${sides}`;
};

const formatThreatOptionLabel = (value: string): string => {
  if (value === 'None') return 'None';
  const { count, sides } = parseDiceComponents(value);
  if (!count || !sides) return value;
  return `${value} (MV ${count * sides})`;
};

const DAMAGE_REDUCTION_OPTION_VALUES = (() => {
  const options = ['None'];
  armorTypes.forEach(armor => {
    if (armor === '0') {
      options.push('DR 0');
    } else if (armor.toLowerCase().startsWith('natural')) {
      options.push(armor);
    } else {
      options.push(`DR ${armor}`);
    }
  });
  return options;
})();

export default function MonsterGenerator() {
  // Official QSB Construction State
  const [creatureCategorySelection, setCreatureCategorySelection] = useState<CreatureCategory>('Minor');
  const [creatureNature, setCreatureNature] = useState<CreatureNature>('Mundane');
  const [creatureSize, setCreatureSize] = useState<CreatureSize>('Medium');
  const [defenseSplit, setDefenseSplit] = useState<DefenseSplit>('Regular');

  // Threat Dice (QSB Core)
  const [threatDice, setThreatDice] = useState<ThreatDice>({
    melee: '1d6',
    natural: 'None',
    ranged: 'None',
    arcane: 'None'
  });

  const threatDiceOptionsForCategory = useMemo(() => {
    const counts = DICE_COUNTS_BY_CATEGORY[creatureCategorySelection];
    const optionSet = new Set<string>(['None']);
    counts.forEach(count => {
      DICE_SIDES.forEach(sides => {
        optionSet.add(`${count}d${sides}`);
      });
    });
    return Array.from(optionSet);
  }, [creatureCategorySelection]);

  const handleThreatDiceChange = (type: keyof ThreatDice, value: string) => {
    const normalized = normalizeThreatDieValue(value);
    setThreatDice(prev => ({ ...prev, [type]: normalized }));
  };

  // QSB Additional Components
  const [extraAttacks, setExtraAttacks] = useState<string[]>([]);
  const [extraAttackInput, setExtraAttackInput] = useState('');
  const [damageReduction, setDamageReduction] = useState('None');
  const [speedModifiers, setSpeedModifiers] = useState<string[]>([]);
  const [agilityMV, setAgilityMV] = useState(0);
  const [battlePhaseDie, setBattlePhaseDie] = useState(() => generateBattlePhase('Minor', 'Mundane'));
  const [savingThrowRank, setSavingThrowRank] = useState(() => generateSavingThrow('Minor', 'Mundane'));
  const [battlePhaseCustom, setBattlePhaseCustom] = useState(false);
  const [savingThrowCustom, setSavingThrowCustom] = useState(false);

  // Results and Saving
  const [qsbResult, setQSBResult] = useState<QSBResult | null>(null);
  const [monsterName, setMonsterName] = useState('');
  const [monsterTrope, setMonsterTrope] = useState('');
  const [weaponsArmorTreasure] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  // Party assignment state
  const [partyFolders, setPartyFolders] = useState<PartyFolder[]>([]);
  const [selectedParty, setSelectedParty] = useState<string>('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  useEffect(() => {
    // Load Monster trope folders for assignment
    const monsterFolders = getAllPartyFolders().filter(folder => folder.folder_type === 'Monster_trope');
    setPartyFolders(monsterFolders);
  }, []);

  useEffect(() => {
    const maxAllowed = Math.max(...DICE_COUNTS_BY_CATEGORY[creatureCategorySelection]);
    setThreatDice(prev => {
      const clampValue = (value: string) => {
        const normalized = normalizeThreatDieValue(value);
        if (normalized === 'None') {
          return 'None';
        }
        const { count, sides } = parseDiceComponents(normalized);
        if (!count || !sides) {
          return 'None';
        }
        const clampedCount = Math.min(count, maxAllowed);
        return `${clampedCount}d${sides}`;
      };

      return {
        melee: clampValue(prev.melee),
        natural: clampValue(prev.natural),
        ranged: clampValue(prev.ranged),
        arcane: clampValue(prev.arcane)
      };
    });
  }, [creatureCategorySelection]);

  useEffect(() => {
    if (!battlePhaseCustom) {
      setBattlePhaseDie(generateBattlePhase(creatureCategorySelection, creatureNature));
    }
  }, [battlePhaseCustom, creatureCategorySelection, creatureNature]);

  useEffect(() => {
    if (!savingThrowCustom) {
      setSavingThrowRank(generateSavingThrow(creatureCategorySelection, creatureNature));
    }
  }, [creatureCategorySelection, creatureNature, savingThrowCustom]);

  const selectedCategoryForTropes = qsbResult?.creature_category ?? creatureCategorySelection;
  const commonTropes = getSuggestedTropes(creatureNature, selectedCategoryForTropes);

  // QSB Construction Function (Official Algorithm)
  const generateQSB = () => {
    // Normalize and validate threat dice based on creature category
    const sanitizedThreatDice: ThreatDice = {
      melee: normalizeThreatDieValue(threatDice.melee),
      natural: normalizeThreatDieValue(threatDice.natural),
      ranged: normalizeThreatDieValue(threatDice.ranged),
      arcane: normalizeThreatDieValue(threatDice.arcane)
    };

    const maxAllowedDice = Math.max(...DICE_COUNTS_BY_CATEGORY[creatureCategorySelection]);
    const invalidThreats = Object.entries(sanitizedThreatDice).filter(([, value]) => {
      const { count } = parseDiceComponents(value);
      return count > maxAllowedDice;
    });

    if (invalidThreats.length > 0) {
      alert(`The selected ${creatureCategorySelection} classification allows up to ${maxAllowedDice} die${maxAllowedDice > 1 ? 's' : ''} in a threat category. Adjust ${invalidThreats.map(([type]) => type).join(', ')} to continue.`);
      return;
    }

    // Calculate primary threat MV from threat dice
    const primaryThreatType = getPrimaryThreatType(sanitizedThreatDice);
    const threatMV = Math.max(
      parseThreatDice(sanitizedThreatDice.melee),
      parseThreatDice(sanitizedThreatDice.natural),
      parseThreatDice(sanitizedThreatDice.ranged),
      parseThreatDice(sanitizedThreatDice.arcane)
    );

    if (threatMV === 0) {
      alert('Set at least one threat dice category above "None" to generate a Quick Stat Block.');
      return;
    }

    const hpCalculation = calculateMonsterHP(threatMV, creatureSize, creatureNature, defenseSplit);

    const recommendedBattlePhase = generateBattlePhase(creatureCategorySelection, creatureNature);
    const resolvedBattlePhase = battlePhaseDie || recommendedBattlePhase;
    const recommendedSavingThrow = generateSavingThrow(creatureCategorySelection, creatureNature);
    const resolvedSavingThrow = savingThrowRank || recommendedSavingThrow;

    const movementCalculation = calculateMovementRate(
      parseThreatDice(resolvedBattlePhase),
      creatureSize,
      agilityMV,
      speedModifiers
    );

    const cleanedExtraAttacks = extraAttacks.map(entry => entry.trim()).filter(entry => entry.length > 0);
    const resolvedDamageReduction = damageReduction && damageReduction.trim().length > 0 ? damageReduction : 'None';

    const result: QSBResult = {
      creature_category: creatureCategorySelection,
      creature_nature: creatureNature,
      creature_size: creatureSize,
      defense_split: defenseSplit,
      threat_dice: sanitizedThreatDice,
      primary_threat_type: primaryThreatType,
      threat_mv: threatMV,
      hp_calculation: hpCalculation,
      movement_calculation: movementCalculation,
      battle_phase: resolvedBattlePhase,
      saving_throw: resolvedSavingThrow,
      damage_reduction: resolvedDamageReduction,
      extra_attacks: cleanedExtraAttacks
    };

    setThreatDice(sanitizedThreatDice);
    setQSBResult(result);
  };

  const addExtraAttack = () => {
    const trimmed = extraAttackInput.trim();
    if (!trimmed) return;
    setExtraAttacks(prev => Array.from(new Set([...prev, trimmed])));
    setExtraAttackInput('');
  };

  const removeExtraAttack = (index: number) => {
    setExtraAttacks(prev => prev.filter((_, i) => i !== index));
  };

  const toggleSpeedModifier = (modifier: string) => {
    setSpeedModifiers(prev => (
      prev.includes(modifier)
        ? prev.filter(entry => entry !== modifier)
        : [...prev, modifier]
    ));
  };

  const resetBattlePhaseToRecommended = () => {
    setBattlePhaseCustom(false);
    setBattlePhaseDie(generateBattlePhase(creatureCategorySelection, creatureNature));
  };

  const resetSavingThrowToRecommended = () => {
    setSavingThrowCustom(false);
    setSavingThrowRank(generateSavingThrow(creatureCategorySelection, creatureNature));
  };

  const normalizedThreatDicePreview: ThreatDice = {
    melee: normalizeThreatDieValue(threatDice.melee),
    natural: normalizeThreatDieValue(threatDice.natural),
    ranged: normalizeThreatDieValue(threatDice.ranged),
    arcane: normalizeThreatDieValue(threatDice.arcane)
  };

  const previewThreatMV = Math.max(
    parseThreatDice(normalizedThreatDicePreview.melee),
    parseThreatDice(normalizedThreatDicePreview.natural),
    parseThreatDice(normalizedThreatDicePreview.ranged),
    parseThreatDice(normalizedThreatDicePreview.arcane)
  );

  const previewPrimaryThreatType = previewThreatMV > 0
    ? getPrimaryThreatType(normalizedThreatDicePreview)
    : null;

  const hpPreview = previewThreatMV > 0
    ? calculateMonsterHP(previewThreatMV, creatureSize, creatureNature, defenseSplit)
    : null;

    const maxAllowedDice = Math.max(...DICE_COUNTS_BY_CATEGORY[creatureCategorySelection]);
  const recommendedBattlePhase = generateBattlePhase(creatureCategorySelection, creatureNature);
  const recommendedSavingThrow = generateSavingThrow(creatureCategorySelection, creatureNature);
  const resolvedBattlePhasePreview = battlePhaseDie || recommendedBattlePhase;
  const movementPreview = calculateMovementRate(
    parseThreatDice(resolvedBattlePhasePreview),
    creatureSize,
    agilityMV,
    speedModifiers
  );

  const hpBreakdown = qsbResult?.hp_calculation ?? hpPreview;
  const movementBreakdown = qsbResult?.movement_calculation ?? movementPreview;
  const displayedThreatMV = qsbResult?.threat_mv ?? previewThreatMV;
  const displayedPrimaryThreatType = qsbResult?.primary_threat_type ?? previewPrimaryThreatType;

  const formatThreatDiceSummary = (dice: ThreatDice) => [
    `Melee ${dice.melee}`,
    `Natural ${dice.natural}`,
    `Ranged ${dice.ranged}`,
    `Arcane ${dice.arcane}`
  ].join(' | ');

  const formattedExtraAttacks = (qsbResult?.extra_attacks ?? extraAttacks).filter(entry => entry.trim().length > 0);
  const hpMultiplierDisplay = hpBreakdown ? `x${hpBreakdown.hp_multiplier.toFixed(2)}` : 'x0';

  const extraAttackSummary = formattedExtraAttacks.length ? `EA: ${formattedExtraAttacks.join(', ')}` : 'EA: None';

  const quickStatBlockString = qsbResult ?
    `${qsbResult.creature_category} | ${formatThreatDiceSummary(qsbResult.threat_dice)} | ${extraAttackSummary} | ` +
    `HP: ${qsbResult.hp_calculation.final_hp} (${qsbResult.hp_calculation.active_hp}/${qsbResult.hp_calculation.passive_hp}) [` +
    `${qsbResult.defense_split}, ${qsbResult.creature_size}, ${qsbResult.creature_nature}; ${hpMultiplierDisplay}] | ` +
    `${qsbResult.damage_reduction} | ${qsbResult.saving_throw} | ${qsbResult.battle_phase} | ` +
    `${displayedPrimaryThreatType ? `Primary Threat: ${displayedPrimaryThreatType}` : 'Primary Threat: TBD'}` +
    `${notes.trim() ? ` | ${notes.trim()}` : ''}`
    : 'Generate the Quick Stat Block to view the formatted summary.';

  const diceAllowanceDescription = (() => {
    switch (creatureCategorySelection) {
      case 'Legendary':
        return 'up to four dice';
      case 'Exceptional':
        return 'up to three dice';
      case 'Standard':
        return 'up to two dice';
      default:
        return 'a single die';
    }
  })();

  const openSaveDialog = () => {
    if (!qsbResult) {
      alert('Generate and review the Quick Stat Block before saving this opponent.');
      return;
    }
    setShowSaveDialog(true);
  };

  const confirmSaveMonster = () => {
    if (!qsbResult || !monsterName.trim()) {
      alert('Generate a Quick Stat Block and enter a monster name before saving.');
      return;
    }
    const threatDiceForMonster: ThreatDice = qsbResult.threat_dice;
    const resolvedThreatMV = qsbResult.threat_mv;
    const resolvedPrimaryThreatType = qsbResult.primary_threat_type;
    const creatureCategory = qsbResult.creature_category;
    const hpCalculation = qsbResult.hp_calculation;
    const battlePhase = qsbResult.battle_phase;
    const savingThrow = qsbResult.saving_throw;
    const movementCalculation = qsbResult.movement_calculation;

    const selectedNature = CREATURE_NATURE_OPTIONS.find(option => option.value === qsbResult.creature_nature) ?? CREATURE_NATURE_OPTIONS[0];
    const selectedSize = CREATURE_SIZE_OPTIONS.find(option => option.value === qsbResult.creature_size) ?? CREATURE_SIZE_OPTIONS[3];

    // Create basic abilities based on threat level
    const baseAbilities = {
      prowess_mv: Math.max(4, Math.min(12, resolvedThreatMV / 3)),
      agility_mv: Math.max(4, Math.min(12, resolvedThreatMV / 3)),
      melee_mv: Math.max(4, Math.min(12, resolvedThreatMV / 2)),
      fortitude_mv: Math.max(4, Math.min(12, resolvedThreatMV / 3)),
      endurance_mv: Math.max(4, Math.min(12, resolvedThreatMV / 3)),
      strength_mv: Math.max(4, Math.min(12, resolvedThreatMV / 3)),
      competence_mv: Math.max(4, Math.min(8, resolvedThreatMV / 4)),
      willpower_mv: Math.max(4, Math.min(8, resolvedThreatMV / 4)),
      expertise_mv: Math.max(4, Math.min(8, resolvedThreatMV / 4)),
      perception_mv: Math.max(4, Math.min(8, resolvedThreatMV / 4)),
      adroitness_mv: Math.max(4, Math.min(8, resolvedThreatMV / 4)),
      precision_mv: Math.max(4, Math.min(8, resolvedThreatMV / 4))
    };

    const roles = determineThreatRoles(resolvedThreatMV, resolvedPrimaryThreatType);
    const statusNotes = `Size: ${selectedSize.label}, Nature: ${selectedNature.label}, Primary Threat: ${resolvedPrimaryThreatType}`;
    const userNotes = notes.trim();
    const combinedStatusNotes = userNotes ? `${statusNotes} | ${userNotes}` : statusNotes;
    const tags = [monsterTrope, resolvedPrimaryThreatType.toLowerCase()].filter(Boolean) as string[];
    const timestamp = new Date().toISOString();

    const savedMonster: MonsterData = {
      id: generateId(),
      user_id: getCurrentUserId(),
      name: monsterName.trim(),
      type: 'Monster',
      level: Math.max(1, Math.floor(resolvedThreatMV / 6)),
      race: `${selectedNature.label} Creature`,
      class: 'Monster',
      abilities: baseAbilities,
      computed: calculateComputedStats(baseAbilities),
      status: {
        current_hp_active: hpCalculation.active_hp,
        current_hp_passive: hpCalculation.passive_hp,
        status_flags: [],
        gear: weaponsArmorTreasure,
        notes: combinedStatusNotes
      },
      tags,
      monster_trope: monsterTrope,
      creature_category: creatureCategory,
      creature_nature: qsbResult.creature_nature,
      creature_size: qsbResult.creature_size,
      defense_split: defenseSplit,
      threat_dice: threatDiceForMonster,
      primary_threat_type: resolvedPrimaryThreatType,
      threat_mv: resolvedThreatMV,
      extra_attacks: qsbResult.extra_attacks,
      damage_reduction: qsbResult.damage_reduction,
      saving_throw: savingThrow,
      battle_phase: battlePhase,
      movement_calculation: movementCalculation,
      preferred_encounter_roles: roles,
      hp_calculation: hpCalculation,
      notes: userNotes || statusNotes,
      weapons_armor_treasure: weaponsArmorTreasure,
      created_at: timestamp,
      updated_at: timestamp,
      full_data: {
        creature_category: creatureCategory,
        creature_nature: qsbResult.creature_nature,
        creature_size: qsbResult.creature_size,
        defense_split: defenseSplit,
        threat_dice: threatDiceForMonster,
        damage_reduction: qsbResult.damage_reduction,
        saving_throw: savingThrow,
        battle_phase: battlePhase,
        movement_calculation: movementCalculation,
        speed_modifiers: speedModifiers,
        agility_mv: agilityMV,
        extra_attacks: qsbResult.extra_attacks,
        notes: userNotes
      }
    };

    saveCharacter(savedMonster);

    // Add to selected party if one was chosen
    if (selectedParty) {
      const existingMemberships = getPartyMemberships(selectedParty);
      const membership: PartyMembership = {
        id: generateId(),
        party_id: selectedParty,
        character_id: savedMonster.id,
        order_index: existingMemberships.length,
        active: true
      };
      savePartyMembership(membership);

      const partyName = partyFolders.find(f => f.id === selectedParty)?.name || 'trope group';
      alert(`Opponent "${monsterName}" saved and added to ${partyName}!`);
    } else {
      alert(`Opponent "${monsterName}" saved!`);
    }

    setShowSaveDialog(false);
    setMonsterName('');
    setMonsterTrope('');
    setSelectedParty('');
  };

  const determineThreatRoles = (threatMV: number, primaryType: ThreatType): ('minion' | 'boss' | 'ambush' | 'elite' | 'brute' | 'caster')[] => {
    const roles: ('minion' | 'boss' | 'ambush' | 'elite' | 'brute' | 'caster')[] = [];

    if (threatMV <= 12) roles.push('minion');
    else if (threatMV <= 18) roles.push('elite');
    else if (threatMV <= 24) roles.push('brute');
    else roles.push('boss');

    // Add secondary roles based on primary attack type
    switch (primaryType) {
      case 'Melee':
      case 'Natural':
        roles.push('brute');
        break;
      case 'Ranged':
        roles.push('ambush');
        break;
      case 'Arcane':
        roles.push('caster');
        break;
    }

    return Array.from(new Set(roles));
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div className="space-y-4 text-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Eldritch RPG Opponent Generator
        </h1>
        <p className="text-gray-700">
          Build Eldritch opponents by following the official Quick Stat Block sequence so every encounter-ready foe shares the same tactical shorthand.
        </p>
        <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 text-left space-y-3">
          <p className="text-sm text-indigo-900">
            The Quick Stat Block (QSB) is the standardized statistical template used for defining most creatures, including monsters, animals, and Non-Player Characters (NPCs). These blocks serve Minor, Standard, Exceptional, and Legendary adversaries, accelerating play and encounter design by consolidating combat attributes.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-indigo-900">
            <li><strong>Type (TY):</strong> Minor, Standard, Exceptional, or Legendary.</li>
            <li><strong>Threat Dice (TD):</strong> Melee, Natural, Ranged, and Arcane attack dice.</li>
            <li><strong>Extra Attacks (EA):</strong> Additional strikes or multi-action routines.</li>
            <li><strong>Hit Points (HP):</strong> Total durability split into Active and Passive pools.</li>
            <li><strong>Damage Reduction (DR):</strong> Armor, shields, or passive resilience.</li>
            <li><strong>Saving Throw (ST):</strong> The die rank rolled against afflictions.</li>
            <li><strong>Battle Phase (BP):</strong> The initiative die for determining action order.</li>
          </ul>
        </div>
      </div>

      <section className="bg-white rounded-lg shadow-lg p-6 space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-900">I. Core Identity & Threat Definition</h2>
          <p className="text-sm text-gray-600">
            Select the creature category according to the quantity of dice in its most dangerous attack, then assign Threat Dice (TD) to each combat form.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Creature Category (Type, TY)
            </label>
            <select
              value={creatureCategorySelection}
              onChange={(e) => {
                const category = e.target.value as CreatureCategory;
                setCreatureCategorySelection(category);
                setBattlePhaseCustom(false);
                setSavingThrowCustom(false);
              }}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2.5 focus:border-emerald-500 focus:ring-emerald-500"
            >
              {CREATURE_CATEGORIES.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-gray-500">
              {`This classification supports ${diceAllowanceDescription} (maximum ${maxAllowedDice} die${maxAllowedDice > 1 ? 's' : ''}) in its most dangerous attack category.`}
            </p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-gray-700">Primary Threat (auto-calculated)</p>
            <p className="mt-1 text-sm text-gray-600">
              {displayedPrimaryThreatType
                ? `${displayedPrimaryThreatType} threat with MV ${displayedThreatMV}`
                : 'Assign Threat Dice to determine the opponent\'s primary threat profile.'}
            </p>
            <p className="mt-2 text-xs text-gray-500">
              The highest MV establishes base hit points and encounter role suggestions.
            </p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {THREAT_DICE_FIELDS.map(field => (
            <div key={field.key}>
              <label className="block text-sm font-semibold text-gray-700">{field.label}</label>
              <input
                type="text"
                list={`threat-dice-${field.key}`}
                value={threatDice[field.key]}
                onChange={(e) => handleThreatDiceChange(field.key, e.target.value)}
                placeholder="e.g. 2d8"
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2.5 focus:border-emerald-500 focus:ring-emerald-500"
              />
              <datalist id={`threat-dice-${field.key}`}>
                {threatDiceOptionsForCategory.map(option => (
                  <option key={option} value={option} label={formatThreatOptionLabel(option)} />
                ))}
              </datalist>
              <p className="mt-2 text-xs text-gray-500">
                {field.helper} Enter <span className="font-semibold">None</span> if this attack form is unavailable.
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-lg shadow-lg p-6 space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-900">II. Durability & Defense Calculation Inputs</h2>
          <p className="text-sm text-gray-600">
            Determine how resilient the opponent is, how it distributes Active and Passive defense, and which combat cadence it follows.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-gray-700">Creature Nature</label>
            <select
              value={creatureNature}
              onChange={(e) => {
                const nature = e.target.value as CreatureNature;
                setCreatureNature(nature);
                setBattlePhaseCustom(false);
                setSavingThrowCustom(false);
              }}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2.5 focus:border-emerald-500 focus:ring-emerald-500"
            >
              {CREATURE_NATURE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">Creature Size</label>
            <select
              value={creatureSize}
              onChange={(e) => setCreatureSize(e.target.value as CreatureSize)}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2.5 focus:border-emerald-500 focus:ring-emerald-500"
            >
              {CREATURE_SIZE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">Creature Constitution (Defense Split)</label>
            <select
              value={defenseSplit}
              onChange={(e) => setDefenseSplit(e.target.value as DefenseSplit)}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2.5 focus:border-emerald-500 focus:ring-emerald-500"
            >
              {DEFENSE_SPLITS.map(split => (
                <option key={split} value={split}>{split}</option>
              ))}
            </select>
            <p className="mt-2 text-xs text-gray-500">
              Regular = 50/50, Tough = 25/75, Fast = 75/25 Active-to-Passive HP distribution.
            </p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">Damage Reduction (DR) / Armor Type</label>
            <input
              type="text"
              list="damage-reduction-options"
              value={damageReduction}
              onChange={(e) => setDamageReduction(e.target.value)}
              placeholder="e.g. DR 1d6 or Natural Armor +4"
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2.5 focus:border-emerald-500 focus:ring-emerald-500"
            />
            <datalist id="damage-reduction-options">
              {DAMAGE_REDUCTION_OPTION_VALUES.map(option => (
                <option key={option} value={option} />
              ))}
            </datalist>
            <p className="mt-2 text-xs text-gray-500">
              Use die ranks for traditional armor or bonus HP for simplified natural armor.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-gray-700">Saving Throw (ST) Rank</label>
            <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-center">
              <select
                value={savingThrowRank}
                onChange={(e) => {
                  setSavingThrowRank(e.target.value);
                  setSavingThrowCustom(true);
                }}
                className="w-full rounded-lg border border-gray-300 bg-white p-2.5 focus:border-emerald-500 focus:ring-emerald-500 sm:w-48"
              >
                {DIE_RANK_OPTIONS.map(rank => (
                  <option key={rank} value={rank}>{rank}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={resetSavingThrowToRecommended}
                className="inline-flex items-center justify-center rounded-lg border border-indigo-200 px-3 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50"
              >
                Use recommended ({recommendedSavingThrow})
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Default saving throw for a {creatureCategorySelection.toLowerCase()} {creatureNature.toLowerCase()} opponent: {recommendedSavingThrow}.
            </p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">Battle Phase (BP) Die</label>
            <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-center">
              <select
                value={battlePhaseDie}
                onChange={(e) => {
                  setBattlePhaseDie(e.target.value);
                  setBattlePhaseCustom(true);
                }}
                className="w-full rounded-lg border border-gray-300 bg-white p-2.5 focus:border-emerald-500 focus:ring-emerald-500 sm:w-48"
              >
                {DIE_RANK_OPTIONS.filter(rank => rank !== 'd30').map(rank => (
                  <option key={rank} value={rank}>{rank}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={resetBattlePhaseToRecommended}
                className="inline-flex items-center justify-center rounded-lg border border-indigo-200 px-3 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50"
              >
                Use recommended ({recommendedBattlePhase})
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Battle Phase establishes initiative order and feeds movement rate calculations.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-gray-700">Extra Attacks (EA)</label>
            <div className="mt-1 flex gap-2">
              <input
                type="text"
                value={extraAttackInput}
                onChange={(e) => setExtraAttackInput(e.target.value)}
                placeholder="e.g. Bite follow-up, Tail sweep"
                className="flex-1 rounded-lg border border-gray-300 bg-white p-2.5 focus:border-emerald-500 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={addExtraAttack}
                className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Add
              </button>
            </div>
            {extraAttacks.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {extraAttacks.map((attack, index) => (
                  <span
                    key={`${attack}-${index}`}
                    className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700"
                  >
                    {attack}
                    <button
                      type="button"
                      onClick={() => removeExtraAttack(index)}
                      className="text-emerald-600 hover:text-emerald-900"
                      aria-label={`Remove ${attack}`}
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-xs text-gray-500">
                List additional strikes such as grab follow-ups, spell bursts, or summoned minions.
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">Mobility Adjustments</label>
            <div className="mt-1 space-y-2 rounded-lg border border-gray-200 p-3">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Agility MV bonus</span>
                <input
                  type="number"
                  value={agilityMV}
                  onChange={(e) => setAgilityMV(Number(e.target.value) || 0)}
                  className="mt-1 w-24 rounded-lg border border-gray-300 bg-white p-2.5 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>
              <div className="space-y-1">
                {SPEED_MODIFIER_OPTIONS.map(option => (
                  <label key={option} className="flex items-center gap-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={speedModifiers.includes(option)}
                      onChange={() => toggleSpeedModifier(option)}
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-lg shadow-lg p-6 space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-900">III. Calculation, Notes, and Final Output</h2>
          <p className="text-sm text-gray-600">
            Review derived totals, record scenario notes, and finalize the Quick Stat Block format for play.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-3">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <h3 className="text-sm font-semibold text-gray-700">Hit Point Breakdown</h3>
              <ul className="mt-2 space-y-1 text-sm text-gray-600">
                <li><strong>Base HP:</strong> {displayedThreatMV > 0 ? displayedThreatMV : '--'} (highest Threat MV)</li>
                <li><strong>Modifiers:</strong> Size {hpBreakdown ? hpBreakdown.size_modifier : '--'} + Nature {hpBreakdown ? hpBreakdown.nature_modifier : '--'}</li>
                <li><strong>Multiplier:</strong> {hpBreakdown ? hpBreakdown.hp_multiplier.toFixed(2) : '--'}</li>
                <li><strong>Total HP:</strong> {hpBreakdown ? hpBreakdown.final_hp : '--'} ({hpBreakdown ? `${hpBreakdown.active_hp}/${hpBreakdown.passive_hp}` : '--/--'} Active/Passive • {defenseSplit})</li>
              </ul>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <h3 className="text-sm font-semibold text-gray-700">Battle Phase & Movement</h3>
              <ul className="mt-2 space-y-1 text-sm text-gray-600">
                <li><strong>Battle Phase Die:</strong> {qsbResult ? qsbResult.battle_phase : resolvedBattlePhasePreview}</li>
                <li><strong>Squares per Phase:</strong> {movementBreakdown ? movementBreakdown.final_movement_per_phase : '--'} (Base {movementBreakdown ? movementBreakdown.base_movement_per_phase : '--'} + Size {movementBreakdown ? movementBreakdown.size_modifier : '--'} + Modifiers {speedModifiers.length > 0 ? speedModifiers.join(', ') : 'None'})</li>
              </ul>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700">Encounter Notes & Traits</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Tactics, lair actions, morale triggers, or roleplay hooks."
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2.5 focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Quick Stat Block (QSB) Output</h3>
              <div className="rounded-lg bg-gray-900 p-4 font-mono text-sm text-emerald-100 break-words">
                {quickStatBlockString}
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Format: TY | TD | EA | HP: total (active/passive) [constitution, size, nature; multiplier] | DR | ST | BP | Notes
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <button
            type="button"
            onClick={generateQSB}
            className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            Generate Quick Stat Block
          </button>
          <button
            type="button"
            onClick={openSaveDialog}
            disabled={!qsbResult}
            className={`inline-flex items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold shadow focus:outline-none focus:ring-2 focus:ring-offset-2 ${qsbResult ? 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500' : 'bg-gray-300 text-gray-500 cursor-not-allowed focus:ring-gray-400'}`}
          >
            Save Opponent
          </button>
        </div>
      </section>

      {showSaveDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Save Opponent</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Opponent Name</label>
                <input
                  type="text"
                  value={monsterName}
                  onChange={(e) => setMonsterName(e.target.value)}
                  placeholder="e.g. Shadow Wolf, Iron Golem, Bandit Captain"
                  className="w-full border border-gray-300 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Opponent Trope/Tag</label>
                <div className="flex space-x-2">
                  <select
                    value={monsterTrope}
                    onChange={(e) => setMonsterTrope(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg p-2"
                  >
                    <option value="">Select trope...</option>
                    {commonTropes.map(trope => (
                      <option key={trope} value={trope}>{trope}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={monsterTrope}
                    onChange={(e) => setMonsterTrope(e.target.value)}
                    placeholder="Custom trope"
                    className="flex-1 border border-gray-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Assign to Trope Group (Optional)
                </label>
                <select
                  value={selectedParty}
                  onChange={(e) => setSelectedParty(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2"
                >
                  <option value="">No group assignment</option>
                  {partyFolders.map(folder => (
                    <option key={folder.id} value={folder.id}>
                      {folder.name}
                    </option>
                  ))}
                </select>
                {partyFolders.length === 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    No opponent trope folders available. Create one in the Party Management page.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                onClick={confirmSaveMonster}
                className="flex-1 rounded bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700"
              >
                Save Opponent
              </button>
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  setMonsterName('');
                  setMonsterTrope('');
                  setSelectedParty('');
                }}
                className="flex-1 rounded bg-gray-500 px-4 py-2 font-semibold text-white hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}