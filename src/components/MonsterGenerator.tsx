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
  CREATURE_TROPES,
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
  ThreatDice
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
  hp_calculation: any;
  movement_calculation: any;
  battle_phase: string;
  saving_throw: string;

  // Additional
  damage_reduction: string;
  extra_attacks: string[];
}

export default function MonsterGenerator() {
  // Official QSB Construction State
  const [creatureNature, setCreatureNature] = useState<CreatureNature>('Mundane');
  const [creatureSize, setCreatureSize] = useState<CreatureSize>('Medium');
  const [defenseSplit, setDefenseSplit] = useState<DefenseSplit>('Regular');

  // Threat Dice (QSB Core)
  const [threatDice, setThreatDice] = useState<ThreatDice>({
    melee: 'd6',
    natural: 'None',
    ranged: 'None',
    arcane: 'None'
  });

  // QSB Additional Components
  const [extraAttacks, setExtraAttacks] = useState<string[]>([]);
  const [damageReduction, setDamageReduction] = useState('None');
  const [speedModifiers, setSpeedModifiers] = useState<string[]>([]);
  const [agilityMV, setAgilityMV] = useState(0);

  // Results and Saving
  const [qsbResult, setQSBResult] = useState<QSBResult | null>(null);
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

  // Official Eldritch RPG Constants
  const creatureNatures: CreatureNature[] = ['Mundane', 'Magical', 'Preternatural', 'Supernatural'];
  const creatureSizes: CreatureSize[] = ['Minuscule', 'Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan'];
  const defenseSplits: DefenseSplit[] = ['Regular', 'Tough', 'Fast'];

  const threatDiceOptions = ['None', 'd4', 'd6', 'd8', 'd10', 'd12', 'd14', 'd16', 'd18', 'd20', 'd30'];
  const multiThreatDiceOptions = ['None', '1d4', '1d6', '1d8', '1d10', '1d12', '2d4', '2d6', '2d8', '2d10', '2d12', '3d4', '3d6', '3d8', '3d10', '3d12', '3d14', '3d16', '3d18', '3d20'];

  const speedModifierOptions = ['Fast', 'Especially Speedy', 'Speed Focus d4-d6', 'Speed Focus d8-d10', 'Speed Focus d12+'];

  const commonTropes = getSuggestedTropes(creatureNature, qsbResult?.creature_category || 'Minor');

  // QSB Construction Function (Official Algorithm)
  const generateQSB = () => {
    // Calculate primary threat MV from threat dice
    const primaryThreatType = getPrimaryThreatType(threatDice);
    const threatMV = Math.max(
      parseThreatDice(threatDice.melee),
      parseThreatDice(threatDice.natural),
      parseThreatDice(threatDice.ranged),
      parseThreatDice(threatDice.arcane)
    );

    if (threatMV === 0) {
      alert('Please set at least one threat dice category to a value other than "None"');
      return;
    }

    // Determine creature category based on threat dice
    const category = determineCreatureCategory(threatDice);

    // Calculate HP using official formula
    const hpCalculation = calculateMonsterHP(threatMV, creatureSize, creatureNature, defenseSplit);

    // Generate Battle Phase and Saving Throw
    const battlePhase = generateBattlePhase(category, creatureNature);
    const savingThrow = generateSavingThrow(category, creatureNature);

    // Calculate Movement Rate
    const battlePhaseMV = parseThreatDice(battlePhase);
    const movementCalculation = calculateMovementRate(battlePhaseMV, creatureSize, agilityMV, speedModifiers);

    const result: QSBResult = {
      creature_category: category,
      creature_nature: creatureNature,
      creature_size: creatureSize,
      defense_split: defenseSplit,
      threat_dice: threatDice,
      primary_threat_type: primaryThreatType,
      threat_mv: threatMV,
      hp_calculation: hpCalculation,
      movement_calculation: movementCalculation,
      battle_phase: battlePhase,
      saving_throw: savingThrow,
      damage_reduction: damageReduction,
      extra_attacks: extraAttacks
    };

    setQSBResult(result);
  };

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

  const confirmSaveMonster = () => {
    if (!result || !monsterName.trim()) {
      alert('Please enter a monster name');
      return;
    }

    // Determine threat dice and roles based on threat levels
    const threatDice = `${tier1Threat !== '0' ? `d${tier1Threat}` : ''}${tier2Threat !== '0' ? `+d${tier2Threat}` : ''}${tier3Threat !== '0' ? `+d${tier3Threat}` : ''}`;
    const roles = determineThreatRoles(result.totalThreatMV);

    // Create basic abilities based on threat level
    const baseAbilities = {
      prowess_mv: Math.max(4, Math.min(12, result.totalThreatMV / 3)),
      agility_mv: Math.max(4, Math.min(12, result.totalThreatMV / 3)),
      melee_mv: Math.max(4, Math.min(12, result.totalThreatMV / 2)),
      fortitude_mv: Math.max(4, Math.min(12, result.totalThreatMV / 3)),
      endurance_mv: Math.max(4, Math.min(12, result.totalThreatMV / 3)),
      strength_mv: Math.max(4, Math.min(12, result.totalThreatMV / 3)),
      competence_mv: Math.max(4, Math.min(8, result.totalThreatMV / 4)),
      willpower_mv: Math.max(4, Math.min(8, result.totalThreatMV / 4)),
      expertise_mv: Math.max(4, Math.min(8, result.totalThreatMV / 4)),
      perception_mv: Math.max(4, Math.min(8, result.totalThreatMV / 4)),
      adroitness_mv: Math.max(4, Math.min(8, result.totalThreatMV / 4)),
      precision_mv: Math.max(4, Math.min(8, result.totalThreatMV / 4))
    };

    const savedMonster: MonsterData = {
      id: generateId(),
      user_id: getCurrentUserId(),
      name: monsterName.trim(),
      type: 'Monster',
      level: Math.max(1, Math.floor(result.totalThreatMV / 6)),
      race: `${monsterNatures.find(n => n.value === monsterNature)?.label} Creature`,
      class: 'Monster',
      abilities: baseAbilities,
      computed: calculateComputedStats(baseAbilities),
      status: {
        current_hp_active: result.hitPoints,
        current_hp_passive: result.hitPoints,
        status_flags: [],
        gear: [],
        notes: `Size: ${monsterSizes.find(s => s.value === monsterSize)?.label || 'Unknown'}, Primary Attack: ${primaryAttack}`
      },
      tags: [monsterTrope, primaryAttack.split(' ')[0].toLowerCase()],
      monster_trope: monsterTrope,
      threat_dice: threatDice,
      threat_mv: result.totalThreatMV,
      preferred_encounter_roles: roles,
      hp_calculation: {
        base_hp: parseInt(tier1Threat) + parseInt(tier2Threat) + parseInt(tier3Threat),
        size_modifier: parseFloat(monsterSize),
        nature_modifier: parseFloat(monsterNature),
        final_hp: result.hitPoints
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      full_data: {
        monsterNature,
        monsterSize,
        tier1Threat,
        tier2Threat,
        tier3Threat,
        monsterArmor,
        primaryAttack
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
      alert(`Monster "${monsterName}" saved and added to ${partyName}!`);
    } else {
      alert(`Monster "${monsterName}" saved!`);
    }

    setShowSaveDialog(false);
    setMonsterName('');
    setMonsterTrope('');
    setSelectedParty('');
  };

  const determineThreatRoles = (threatMV: number): ('minion' | 'boss' | 'ambush' | 'elite' | 'brute' | 'caster')[] => {
    const roles: ('minion' | 'boss' | 'ambush' | 'elite' | 'brute' | 'caster')[] = [];

    if (threatMV <= 12) roles.push('minion');
    else if (threatMV <= 18) roles.push('elite');
    else if (threatMV <= 24) roles.push('brute');
    else roles.push('boss');

    // Add secondary roles based on primary attack type
    if (primaryAttack.includes('Melee') || primaryAttack.includes('Natural')) {
      roles.push('brute');
    } else if (primaryAttack.includes('Ranged')) {
      roles.push('ambush');
    } else if (primaryAttack.includes('Arcane')) {
      roles.push('caster');
    }

    return roles;
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
                {threatDice.filter(die => die.value !== '0').map(die => (
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
                {threatDice.map(die => (
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
                {threatDice.map(die => (
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
                    No monster trope folders available. Create one in the Party Management page.
                  </p>
                )}
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