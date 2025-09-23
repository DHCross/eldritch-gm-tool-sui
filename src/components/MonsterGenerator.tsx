'use client';

import { useState, useEffect } from 'react';
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
  determineCreatureCategory,
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

export default function MonsterGenerator() {
  // Official QSB Construction State
  const [creatureNature, setCreatureNature] = useState<CreatureNature>('Mundane');
  const [defenseSplit, setDefenseSplit] = useState<DefenseSplit>('Regular');

  // QSB Additional Components
  const [extraAttacks, setExtraAttacks] = useState<string[]>([]);
  const [damageReduction, setDamageReduction] = useState('None');
  const [speedModifiers, setSpeedModifiers] = useState<string[]>([]);
  const [agilityMV, setAgilityMV] = useState(0);

  // Legacy HP calculator state (still used by the UI below)
  const [monsterNature, setMonsterNature] = useState('1');
  const [monsterSize, setMonsterSize] = useState('1');
  const [tier1Threat, setTier1Threat] = useState('4');
  const [tier2Threat, setTier2Threat] = useState('0');
  const [tier3Threat, setTier3Threat] = useState('0');
  const [monsterArmor, setMonsterArmor] = useState('0');
  const [primaryAttack, setPrimaryAttack] = useState('Melee attack is highest potential harm');
  const [result, setResult] = useState<{
    hitPoints: number;
    threatLevel: string;
    totalThreatMV: number;
  } | null>(null);

  // Results and Saving
  const [qsbResult] = useState<QSBResult | null>(null);
  const [monsterName, setMonsterName] = useState('');
  const [monsterTrope, setMonsterTrope] = useState('');
  const [weaponsArmorTreasure, setWeaponsArmorTreasure] = useState<string[]>([]);
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
    setCreatureNature(getCreatureNatureFromLegacy(monsterNature));
  }, [monsterNature]);

  // Official Eldritch RPG Constants
  const creatureNatures: CreatureNature[] = ['Mundane', 'Magical', 'Preternatural', 'Supernatural'];
  const defenseSplits: DefenseSplit[] = ['Regular', 'Tough', 'Fast'];

  const monsterNatures = creatureNatures.map((nature, index) => ({
    value: String(index + 1),
    label: nature
  }));

  const monsterSizes = [
    { value: '0', label: 'Minuscule or Tiny' },
    { value: '1', label: 'Small or Medium' },
    { value: '2', label: 'Large' },
    { value: '3', label: 'Huge' },
    { value: '4', label: 'Gargantuan' }
  ];

  const legacyThreatDiceOptions = [
    { value: '0', label: 'None' },
    { value: '4', label: 'd4' },
    { value: '6', label: 'd6' },
    { value: '8', label: 'd8' },
    { value: '10', label: 'd10' },
    { value: '12', label: 'd12' },
    { value: '14', label: 'd14' },
    { value: '16', label: 'd16' },
    { value: '18', label: 'd18' },
    { value: '20', label: 'd20' },
    { value: '30', label: 'd30' }
  ];

  const armorTypes = [
    { value: '0', label: 'None' },
    { value: '2', label: 'Hide' },
    { value: '3', label: 'Leather' },
    { value: '4', label: 'Chain' },
    { value: '5', label: 'Plate' },
    { value: '6', label: 'Magical' }
  ];

  const commonTropes = getSuggestedTropes(creatureNature, qsbResult?.creature_category || 'Minor');

  function calculateHitPoints(
    threatMinor: number,
    threatStandard: number,
    threatExceptional: number,
    creatureSize: number,
    creatureNature: number,
    armorBonus: number
  ): number {
    const sizeModifier = parseFloat(creatureSize.toString());
    const natureModifier = parseFloat(creatureNature.toString());

    const totalModifier = (sizeModifier + natureModifier) / 2;
    const totalHitPoints = threatMinor + threatStandard + threatExceptional;
    let finalHitPoints = Math.ceil(totalHitPoints * totalModifier);

    finalHitPoints += armorBonus; // Add armor bonus to final hit points

    return finalHitPoints;
  }

  function determineThreatLevel(minor: string, standard: string, exceptional: string): string {
    if (minor !== "0" && standard === "0" && exceptional === "0") {
      return "a Minor";
    } else if (standard === "0" && exceptional !== "0") {
      return "a Standard";
    } else if (standard !== "0" && exceptional === "0") {
      return "a Standard";
    } else if (standard === "0" && exceptional === "0") {
      return "a Minor";
    } else {
      return "an Exceptional";
    }
  }

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();

    const minor = parseInt(tier1Threat);
    const standard = parseInt(tier2Threat);
    const exceptional = parseInt(tier3Threat);
    const armorBonus = parseFloat(monsterArmor);

    const totalThreatMV = minor + standard + exceptional;
    const threatLevel = determineThreatLevel(tier1Threat, tier2Threat, tier3Threat);

    const hitPoints = calculateHitPoints(
      minor,
      standard,
      exceptional,
      parseFloat(monsterSize),
      parseFloat(monsterNature),
      armorBonus
    );

    setResult({
      hitPoints,
      threatLevel,
      totalThreatMV
    });
  };

  const saveMonster = () => {
    if (!result) {
      alert('Generate monster stats first!');
      return;
    }
    setShowSaveDialog(true);
  };

  const getCreatureNatureFromLegacy = (value: string): CreatureNature => {
    switch (value) {
      case '2':
        return 'Magical';
      case '3':
        return 'Preternatural';
      case '4':
        return 'Supernatural';
      default:
        return 'Mundane';
    }
  };

  const getCreatureSizeFromLegacy = (value: string): CreatureSize => {
    switch (value) {
      case '0':
        return 'Minuscule';
      case '2':
        return 'Large';
      case '3':
        return 'Huge';
      case '4':
        return 'Gargantuan';
      case '1':
      default:
        return 'Medium';
    }
  };

  const mapPrimaryAttackToThreatType = (selection: string): ThreatType | null => {
    if (selection.includes('Melee')) return 'Melee';
    if (selection.includes('Natural')) return 'Natural';
    if (selection.includes('Ranged')) return 'Ranged';
    if (selection.includes('Arcane')) return 'Arcane';
    return null;
  };

  const confirmSaveMonster = () => {
    const trimmedMonsterName = monsterName.trim();

    if (!result || !trimmedMonsterName) {
      alert('Please enter a monster name');
      return;
    }

    const creatureNatureValue = getCreatureNatureFromLegacy(monsterNature);
    const creatureSizeValue = getCreatureSizeFromLegacy(monsterSize);
    const defenseSplitValue = defenseSplit;

    const tierValues = [tier1Threat, tier2Threat, tier3Threat];
    const tierNumbers = tierValues.map(value => parseInt(value, 10) || 0);
    const totalThreatMV = tierNumbers.reduce((sum, current) => sum + current, 0);

    const primaryOverride = mapPrimaryAttackToThreatType(primaryAttack);
    const threatTypeOrder: ThreatType[] = ['Melee', 'Natural', 'Ranged', 'Arcane'];
    const prioritizedThreatTypes = primaryOverride
      ? [primaryOverride, ...threatTypeOrder.filter(type => type !== primaryOverride)]
      : threatTypeOrder;

    const toThreatDie = (value: string) => (value !== '0' ? `d${value}` : 'None');
    const fallbackThreatDice: ThreatDice = {
      melee: 'None',
      natural: 'None',
      ranged: 'None',
      arcane: 'None'
    };

    prioritizedThreatTypes.forEach((type, index) => {
      if (index >= tierValues.length) return;
      const die = toThreatDie(tierValues[index]);
      switch (type) {
        case 'Melee':
          fallbackThreatDice.melee = die;
          break;
        case 'Natural':
          fallbackThreatDice.natural = die;
          break;
        case 'Ranged':
          fallbackThreatDice.ranged = die;
          break;
        case 'Arcane':
          fallbackThreatDice.arcane = die;
          break;
      }
    });

    const threatDiceForSave: ThreatDice = qsbResult
      ? { ...qsbResult.threat_dice }
      : fallbackThreatDice;

    const threatMV = qsbResult?.threat_mv ?? Math.max(
      parseThreatDice(threatDiceForSave.melee),
      parseThreatDice(threatDiceForSave.natural),
      parseThreatDice(threatDiceForSave.ranged),
      parseThreatDice(threatDiceForSave.arcane)
    );

    if (threatMV === 0) {
      alert('Please configure threat dice before saving the monster.');
      return;
    }

    const creatureCategory = qsbResult?.creature_category ?? determineCreatureCategory(threatDiceForSave);
    const battlePhase = qsbResult?.battle_phase ?? generateBattlePhase(creatureCategory, creatureNatureValue);
    const savingThrow = qsbResult?.saving_throw ?? generateSavingThrow(creatureCategory, creatureNatureValue);

    const sanitizedSpeedModifiers = speedModifiers.map(modifier => modifier.trim()).filter(Boolean);
    const movementCalculation = qsbResult?.movement_calculation ??
      calculateMovementRate(parseThreatDice(battlePhase), creatureSizeValue, agilityMV, sanitizedSpeedModifiers);
    const hpCalculation = qsbResult?.hp_calculation ??
      calculateMonsterHP(threatMV, creatureSizeValue, creatureNatureValue, defenseSplitValue);

    const primaryThreatType = primaryOverride ?? qsbResult?.primary_threat_type ?? getPrimaryThreatType(threatDiceForSave);
    const abilitySource = Math.max(threatMV, totalThreatMV, 1);

    const toDieRank = (value: number, steps: number[]) => {
      for (const step of steps) {
        if (value <= step) {
          return step;
        }
      }
      return steps[steps.length - 1];
    };

    const coreSteps = [4, 6, 8, 10, 12];
    const supportSteps = [4, 6, 8];

    const baseAbilities = {
      prowess_mv: toDieRank(abilitySource / 3, coreSteps),
      agility_mv: toDieRank(abilitySource / 3, coreSteps),
      melee_mv: toDieRank(abilitySource / 2, coreSteps),
      fortitude_mv: toDieRank(abilitySource / 3, coreSteps),
      endurance_mv: toDieRank(abilitySource / 3, coreSteps),
      strength_mv: toDieRank(abilitySource / 3, coreSteps),
      competence_mv: toDieRank(abilitySource / 4, supportSteps),
      willpower_mv: toDieRank(abilitySource / 4, supportSteps),
      expertise_mv: toDieRank(abilitySource / 4, supportSteps),
      perception_mv: toDieRank(abilitySource / 4, supportSteps),
      adroitness_mv: toDieRank(abilitySource / 4, supportSteps),
      precision_mv: toDieRank(abilitySource / 4, supportSteps)
    };

    const levelSource = Math.max(threatMV, totalThreatMV);
    const level = Math.max(1, Math.floor(levelSource / 6));

    const natureLabel = monsterNatures.find(nature => nature.value === monsterNature)?.label || creatureNatureValue;
    const sizeLabel = monsterSizes.find(size => size.value === monsterSize)?.label || creatureSizeValue;

    const trimmedTrope = monsterTrope.trim();
    const trimmedNotes = notes.trim();
    const sanitizedExtraAttacks = extraAttacks.map(attack => attack.trim()).filter(Boolean);
    const sanitizedGear = weaponsArmorTreasure.map(item => item.trim()).filter(Boolean);
    const sanitizedDamageReduction = damageReduction.trim() || 'None';

    const summaryParts = [
      `Category: ${creatureCategory}`,
      `Size: ${sizeLabel}`,
      `Nature: ${natureLabel}`,
      `Defense Split: ${defenseSplitValue}`,
      `Primary Threat: ${primaryThreatType}`,
      `Threat MV: ${threatMV}`
    ];

    const statusNotes = [...summaryParts, trimmedNotes].filter(Boolean).join(' | ');
    const finalNotes = statusNotes;

    const tags = Array.from(new Set([
      trimmedTrope,
      primaryThreatType.toLowerCase(),
      creatureCategory.toLowerCase(),
      creatureNatureValue.toLowerCase(),
      creatureSizeValue.toLowerCase()
    ].filter(Boolean))).sort();

    const timestamp = new Date().toISOString();

    const storedThreatDice: ThreatDice = { ...threatDiceForSave };

    const savedMonster: MonsterData = {
      id: generateId(),
      user_id: getCurrentUserId(),
      name: trimmedMonsterName,
      type: 'Monster',
      level,
      race: `${creatureNatureValue} ${creatureSizeValue} Creature`,
      class: 'Monster',
      abilities: baseAbilities,
      computed: calculateComputedStats(baseAbilities),
      status: {
        current_hp_active: hpCalculation.active_hp,
        current_hp_passive: hpCalculation.passive_hp,
        status_flags: [],
        gear: sanitizedGear,
        notes: statusNotes
      },
      tags,
      monster_trope: trimmedTrope,
      threat_dice: storedThreatDice,
      primary_threat_type: primaryThreatType,
      threat_mv: threatMV,
      preferred_encounter_roles: determineThreatRoles(threatMV, primaryThreatType),
      creature_category: creatureCategory,
      creature_nature: creatureNatureValue,
      creature_size: creatureSizeValue,
      defense_split: defenseSplitValue,
      extra_attacks: sanitizedExtraAttacks,
      damage_reduction: sanitizedDamageReduction,
      saving_throw: savingThrow,
      battle_phase: battlePhase,
      movement_calculation: movementCalculation,
      hp_calculation: hpCalculation,
      notes: finalNotes,
      weapons_armor_treasure: sanitizedGear,
      created_at: timestamp,
      updated_at: timestamp,
      full_data: {
        legacy: {
          monsterNature,
          monsterSize,
          tier1Threat,
          tier2Threat,
          tier3Threat,
          monsterArmor,
          primaryAttack,
          totalThreatMV
        },
        qsb: {
          defenseSplit: defenseSplitValue,
          threatDice: storedThreatDice,
          primaryThreatType,
          battlePhase,
          savingThrow,
          movementCalculation,
          hpCalculation,
          speedModifiers: sanitizedSpeedModifiers,
          agilityMV,
          extraAttacks: sanitizedExtraAttacks,
          damageReduction: sanitizedDamageReduction
        }
      }
    };

    saveCharacter(savedMonster);

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
      alert(`Monster "${trimmedMonsterName}" saved and added to ${partyName}!`);
    } else {
      alert(`Monster "${trimmedMonsterName}" saved!`);
    }

    setShowSaveDialog(false);
    setMonsterName('');
    setMonsterTrope('');
    setSelectedParty('');
    setNotes('');
    setWeaponsArmorTreasure([]);
    setExtraAttacks([]);
    setDamageReduction('None');
    setSpeedModifiers([]);
    setAgilityMV(0);
  };

  const determineThreatRoles = (
    threatMV: number,
    primaryThreat: ThreatType
  ): ('minion' | 'boss' | 'ambush' | 'elite' | 'brute' | 'caster')[] => {
    const roles = new Set<'minion' | 'boss' | 'ambush' | 'elite' | 'brute' | 'caster'>();

    if (threatMV <= 12) {
      roles.add('minion');
    } else if (threatMV <= 18) {
      roles.add('elite');
    } else if (threatMV <= 24) {
      roles.add('brute');
    } else {
      roles.add('boss');
    }

    switch (primaryThreat) {
      case 'Melee':
      case 'Natural':
        roles.add('brute');
        break;
      case 'Ranged':
        roles.add('ambush');
        break;
      case 'Arcane':
        roles.add('caster');
        break;
    }

    const rolePriority: ('minion' | 'elite' | 'brute' | 'boss' | 'ambush' | 'caster')[] =
      ['minion', 'elite', 'brute', 'boss', 'ambush', 'caster'];

    return rolePriority.filter(role => roles.has(role));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Eldritch RPG Monster HP Calculator
        </h1>
        <p className="text-gray-600">
          Calculate monster hit points based on threat tiers, size, nature, and armor
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <form onSubmit={handleCalculate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Monster Nature */}
            <div>
              <label htmlFor="monsterNature" className="block text-sm font-medium text-gray-700 mb-2">
                Monster Nature:
              </label>
              <select
                id="monsterNature"
                value={monsterNature}
                onChange={(e) => setMonsterNature(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-center"
              >
                {monsterNatures.map(nature => (
                  <option key={nature.value} value={nature.value}>{nature.label}</option>
                ))}
              </select>
            </div>

            {/* Monster Size */}
            <div>
              <label htmlFor="monsterSize" className="block text-sm font-medium text-gray-700 mb-2">
                Monster Size:
              </label>
              <select
                id="monsterSize"
                value={monsterSize}
                onChange={(e) => setMonsterSize(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-center"
              >
                {monsterSizes.map(size => (
                  <option key={size.value} value={size.value}>{size.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Threat Tier 1 */}
            <div>
              <label htmlFor="tier1Threat" className="block text-sm font-medium text-gray-700 mb-2">
                Threat Tier 1 (MV):
              </label>
              <select
                id="tier1Threat"
                value={tier1Threat}
                onChange={(e) => setTier1Threat(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-center"
              >
                {legacyThreatDiceOptions.filter(die => die.value !== '0').map(die => (
                  <option key={die.value} value={die.value}>{die.label}</option>
                ))}
              </select>
            </div>

            {/* Threat Tier 2 */}
            <div>
              <label htmlFor="tier2Threat" className="block text-sm font-medium text-gray-700 mb-2">
                Threat Tier 2 (MV):
              </label>
              <select
                id="tier2Threat"
                value={tier2Threat}
                onChange={(e) => setTier2Threat(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-center"
              >
                {legacyThreatDiceOptions.map(die => (
                  <option key={die.value} value={die.value}>{die.label}</option>
                ))}
              </select>
            </div>

            {/* Threat Tier 3 */}
            <div>
              <label htmlFor="tier3Threat" className="block text-sm font-medium text-gray-700 mb-2">
                Threat Tier 3 (MV):
              </label>
              <select
                id="tier3Threat"
                value={tier3Threat}
                onChange={(e) => setTier3Threat(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-center"
              >
                {legacyThreatDiceOptions.map(die => (
                  <option key={die.value} value={die.value}>{die.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Monster Armor */}
          <div>
            <label htmlFor="monsterArmor" className="block text-sm font-medium text-gray-700 mb-2">
              Monster Armor:
            </label>
            <select
              id="monsterArmor"
              value={monsterArmor}
              onChange={(e) => setMonsterArmor(e.target.value)}
              className="w-full md:w-1/2 rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-center"
            >
              {armorTypes.map(armor => (
                <option key={armor.value} value={armor.value}>{armor.label}</option>
              ))}
            </select>
          </div>

          {/* Defense Split */}
          <div>
            <label htmlFor="defenseSplit" className="block text-sm font-medium text-gray-700 mb-2">
              Defense Split:
            </label>
            <select
              id="defenseSplit"
              value={defenseSplit}
              onChange={(e) => setDefenseSplit(e.target.value as DefenseSplit)}
              className="w-full md:w-1/2 rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-center"
            >
              {defenseSplits.map(split => (
                <option key={split} value={split}>{split}</option>
              ))}
            </select>
          </div>

          <div className="text-center space-x-4">
            <button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Calculate Hit Points
            </button>
            {result && (
              <button
                type="button"
                onClick={saveMonster}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Save Monster
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Results */}
      {result && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Calculation Results</h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="text-3xl font-bold text-red-600 mb-2">
                {result.hitPoints} Hit Points
              </div>
              <div className="text-lg text-gray-700">
                This creature is <strong>{result.threatLevel}</strong> threat (MV {result.totalThreatMV}).
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Additional Notes */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Calculation Notes</h3>
        <div className="text-sm text-gray-700 space-y-2">
          <p><strong>Size and Nature Modifier:</strong> (Size Value + Nature Value) ÷ 2</p>
          <p><strong>Base Hit Points:</strong> Tier 1 + Tier 2 + Tier 3 threat dice values</p>
          <p><strong>Final Hit Points:</strong> Ceil(Base HP × Modifier) + Armor Bonus</p>
        </div>
      </div>

      {/* Attack Type Selector */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Primary Attack Type</h3>
        <select
          value={primaryAttack}
          onChange={(e) => setPrimaryAttack(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-center"
        >
          <option>Melee attack is highest potential harm</option>
          <option>Natural weapons is highest potential harm</option>
          <option>Ranged attack is highest potential harm</option>
          <option>Arcane attack is highest potential harm</option>
        </select>
        <p className="text-sm text-gray-500 mt-2">
          This selection helps you determine which attack type should be the monster&apos;s primary threat.
        </p>
      </div>

      {/* Save Monster Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Save Monster</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Monster Name</label>
                <input
                  type="text"
                  value={monsterName}
                  onChange={(e) => setMonsterName(e.target.value)}
                  placeholder="e.g. Shadow Wolf, Iron Golem, Bandit Captain"
                  className="w-full border border-gray-300 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Monster Trope/Tag</label>
                <div className="flex flex-col gap-2 md:flex-row md:space-x-2">
                  <select
                    value={monsterTrope}
                    onChange={(e) => setMonsterTrope(e.target.value)}
                    className="border border-gray-300 rounded-lg p-2 md:flex-1"
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
                    className="border border-gray-300 rounded-lg p-2 md:flex-1"
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
                    No monster trope folders available. Create one in the Party Management page.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Temperament, tactics, lair details..."
                  className="w-full border border-gray-300 rounded-lg p-2"
                />
                <p className="text-xs text-gray-500 mt-1">These notes are saved with the monster profile.</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Weapons, Armor &amp; Treasure</label>
                <textarea
                  value={weaponsArmorTreasure.join('\n')}
                  onChange={(e) => setWeaponsArmorTreasure(
                    e.target.value
                      .split('\n')
                      .map(item => item.trim())
                      .filter(line => line.length > 0)
                  )}
                  rows={3}
                  placeholder={"Claws and teeth\nBone charms\nAncient coins"}
                  className="w-full border border-gray-300 rounded-lg p-2"
                />
                <p className="text-xs text-gray-500 mt-1">Enter one item per line.</p>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={confirmSaveMonster}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded"
              >
                Save Monster
              </button>
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  setMonsterName('');
                  setMonsterTrope('');
                  setSelectedParty('');
                  setNotes('');
                  setWeaponsArmorTreasure([]);
                }}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded"
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