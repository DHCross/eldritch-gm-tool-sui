'use client';

import { useState, useEffect, FormEvent } from 'react';
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
  parseThreatDice,
  determineThreatRoles
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

// ---------------------------------------------
// Interfaces and Types
// ---------------------------------------------

interface QSBResult {
  creature_category: CreatureCategory;
  creature_nature: CreatureNature;
  creature_size: CreatureSize;
  defense_split: DefenseSplit;
  threat_dice: ThreatDice;
  primary_threat_type: ThreatType;
  threat_mv: number;
  hp_calculation: MonsterData['hp_calculation'];
  movement_calculation: MovementCalculation;
  battle_phase: string;
  saving_throw: string;
  damage_reduction: string;
  extra_attacks: string[];
}

interface LegacyCalculatorResult {
  hitPoints: number;
  threatLevel: string;
  totalThreatMV: number;
}

// ---------------------------------------------
// Options (Single, De-duplicated Definitions)
// ---------------------------------------------

const monsterNatureOptions = [
  { value: '1', label: 'Mundane', nature: 'Mundane' as CreatureNature, modifier: 1 },
  { value: '2', label: 'Magical', nature: 'Magical' as CreatureNature, modifier: 2 },
  { value: '3', label: 'Preternatural', nature: 'Preternatural' as CreatureNature, modifier: 3 },
  { value: '4', label: 'Supernatural', nature: 'Supernatural' as CreatureNature, modifier: 4 }
];

const monsterSizeOptions = [
  { value: '0', label: 'Minuscule or Tiny', size: 'Minuscule' as CreatureSize, modifier: 0 },
  { value: '1', label: 'Small or Medium', size: 'Medium' as CreatureSize, modifier: 1 },
  { value: '2', label: 'Large', size: 'Large' as CreatureSize, modifier: 2 },
  { value: '3', label: 'Huge', size: 'Huge' as CreatureSize, modifier: 3 },
  { value: '4', label: 'Gargantuan', size: 'Gargantuan' as CreatureSize, modifier: 4 }
];

const threatDieSelections = [
  { value: '0', label: 'None (0)' },
  { value: '4', label: 'd4 (4)' },
  { value: '6', label: 'd6 (6)' },
  { value: '8', label: 'd8 (8)' },
  { value: '10', label: 'd10 (10)' },
  { value: '12', label: 'd12 (12)' },
  { value: '14', label: 'd14 (14)' },
  { value: '16', label: 'd16 (16)' },
  { value: '18', label: 'd18 (18)' },
  { value: '20', label: 'd20 (20)' },
  { value: '30', label: 'd30 (30)' }
];

const monsterArmorOptions = [
  { value: '0', label: 'None (+0)' },
  { value: '2', label: 'Hide (+2)' },
  { value: '3', label: 'Leather (+3)' },
  { value: '4', label: 'Chain (+4)' },
  { value: '5', label: 'Plate (+5)' },
  { value: '6', label: 'Magical (+6)' }
];

const defenseSplits: DefenseSplit[] = ['Regular', 'Tough', 'Fast'];

// ---------------------------------------------
// Helper Functions
// ---------------------------------------------

const toDieRank = (value: number, steps: number[]) => {
  for (const step of steps) {
    if (value <= step) return step;
  }
  return steps[steps.length - 1];
};

// ---------------------------------------------
// Component
// ---------------------------------------------

export default function MonsterGenerator() {
  // QSB core toggles
  const [creatureNature, setCreatureNature] = useState<CreatureNature>('Mundane');
  const [creatureSize, setCreatureSize] = useState<CreatureSize>('Medium');
  const [defenseSplit, setDefenseSplit] = useState<DefenseSplit>('Regular');

  // QSB additional properties
  const [extraAttacks, setExtraAttacks] = useState<string[]>([]);
  const [damageReduction, setDamageReduction] = useState('None');
  const [speedModifiers, setSpeedModifiers] = useState<string[]>([]);
  const [agilityMV, setAgilityMV] = useState(0);

  // Legacy UI state (drives calculator)
  const [monsterNature, setMonsterNature] = useState('1');
  const [monsterSize, setMonsterSize] = useState('1');
  const [tier1Threat, setTier1Threat] = useState('6');
  const [tier2Threat, setTier2Threat] = useState('0');
  const [tier3Threat, setTier3Threat] = useState('0');
  const [monsterArmor, setMonsterArmor] = useState('0');
  const [primaryAttack, setPrimaryAttack] = useState('Melee attack is highest potential harm');
  const [result, setResult] = useState<LegacyCalculatorResult | null>(null);

  // Results & saving state
  const [qsbResult, setQSBResult] = useState<QSBResult | null>(null);
  const [monsterName, setMonsterName] = useState('');
  const [monsterTrope, setMonsterTrope] = useState('');
  const [weaponsArmorTreasure, setWeaponsArmorTreasure] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  // Party assignment state
  const [partyFolders, setPartyFolders] = useState<PartyFolder[]>([]);
  const [selectedParty, setSelectedParty] = useState<string>('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  // Load trope folders on component mount
  useEffect(() => {
    const monsterFolders = getAllPartyFolders().filter(f => f.folder_type === 'Monster_trope');
    setPartyFolders(monsterFolders);
  }, []);

  // Sync derived QSB state from legacy selectors
  useEffect(() => {
    const selected = monsterNatureOptions.find(n => n.value === monsterNature);
    setCreatureNature(selected?.nature ?? 'Mundane');
  }, [monsterNature]);

  useEffect(() => {
    const selected = monsterSizeOptions.find(s => s.value === monsterSize);
    setCreatureSize(selected?.size ?? 'Medium');
  }, [monsterSize]);
  
  const commonTropes = getSuggestedTropes(
    creatureNature,
    qsbResult?.creature_category || 'Minor'
  );

  const calculateHitPoints = (
    threatMinor: number,
    threatStandard: number,
    threatExceptional: number,
    sizeMod: number,
    natureMod: number,
    armorBonus: number
  ): number => {
    const totalModifier = (sizeMod + natureMod) / 2;
    const baseHP = threatMinor + threatStandard + threatExceptional;
    let finalHP = Math.ceil(baseHP * totalModifier);
    finalHP += armorBonus;
    return finalHP;
  };

  const determineThreatLevel = (minor: string, standard: string, exceptional: string): string => {
    if (minor !== '0' && standard === '0' && exceptional === '0') return 'a Minor';
    if (standard !== '0' || exceptional !== '0') return 'an Exceptional';
    return 'a Standard';
  };

  const handleCalculate = (e: FormEvent) => {
    e.preventDefault();

    const minor = parseInt(tier1Threat);
    const standard = parseInt(tier2Threat);
    const exceptional = parseInt(tier3Threat);
    const armorBonus = parseFloat(monsterArmor) || 0;

    const selectedNature = monsterNatureOptions.find(n => n.value === monsterNature) ?? monsterNatureOptions[0];
    const selectedSize = monsterSizeOptions.find(s => s.value === monsterSize) ?? monsterSizeOptions[1];

    const totalThreatMV = minor + standard + exceptional;
    const threatLevel = determineThreatLevel(tier1Threat, tier2Threat, tier3Threat);

    const hitPoints = calculateHitPoints(
      minor, standard, exceptional,
      selectedSize.modifier,
      selectedNature.modifier,
      armorBonus
    );

    setResult({ hitPoints, threatLevel, totalThreatMV });
  };

  const saveMonster = () => {
    if (!result) {
      alert('Generate monster stats first!');
      return;
    }
    setShowSaveDialog(true);
  };

  const mapPrimaryAttackToThreatType = (selection: string): ThreatType => {
      if (selection.includes('Natural')) return 'Natural';
      if (selection.includes('Ranged')) return 'Ranged';
      if (selection.includes('Arcane')) return 'Arcane';
      return 'Melee';
  };
  
  const confirmSaveMonster = () => {
    const trimmedMonsterName = monsterName.trim();
    if (!result || !trimmedMonsterName) {
      alert('Please enter a monster name');
      return;
    }

    // 1. Resolve threat dice from legacy tiers
    const primaryType = mapPrimaryAttackToThreatType(primaryAttack);
    const tierNumbers = [tier1Threat, tier2Threat, tier3Threat].map(v => parseInt(v, 10) || 0);
    const highestThreatValue = Math.max(...tierNumbers);

    const threatDiceForMonster: ThreatDice = { melee: 'None', natural: 'None', ranged: 'None', arcane: 'None' };
    if (highestThreatValue > 0) {
        const key = primaryType.toLowerCase() as keyof ThreatDice;
        threatDiceForMonster[key] = `d${highestThreatValue}`;
    }
    
    const resolvedThreatMV = parseThreatDice(threatDiceForMonster[primaryType.toLowerCase() as keyof ThreatDice]);

    if (resolvedThreatMV <= 0) {
      alert('Please configure at least one threat die before saving this monster.');
      return;
    }

    // 2. Derive QSB stats
    const creatureCategory = determineCreatureCategory(threatDiceForMonster);
    const battlePhase = generateBattlePhase(creatureCategory, creatureNature);
    const savingThrow = generateSavingThrow(creatureCategory, creatureNature);
    const movementCalculation = calculateMovementRate(parseThreatDice(battlePhase), creatureSize, agilityMV, speedModifiers);
    const hpCalculation = calculateMonsterHP(resolvedThreatMV, creatureSize, creatureNature, defenseSplit);

    const qsbSnapshot: QSBResult = {
      creature_category: creatureCategory,
      creature_nature: creatureNature,
      creature_size: creatureSize,
      defense_split: defenseSplit,
      threat_dice: threatDiceForMonster,
      primary_threat_type: primaryType,
      threat_mv: resolvedThreatMV,
      hp_calculation: hpCalculation,
      movement_calculation: movementCalculation,
      battle_phase: battlePhase,
      saving_throw: savingThrow,
      damage_reduction: damageReduction.trim() || 'None',
      extra_attacks: extraAttacks.map(a => a.trim()).filter(Boolean),
    };
    setQSBResult(qsbSnapshot);

    // 3. Build base abilities from MV
    const abilitySource = Math.max(resolvedThreatMV, result.totalThreatMV, 1);
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
    
    // 4. Finalize monster data
    const level = Math.max(1, Math.floor(result.totalThreatMV / 6));
    const summaryNotes = `Size: ${creatureSize}, Nature: ${creatureNature}, Primary Threat: ${primaryType}`;
    const userNotes = notes.trim();
    const combinedNotes = userNotes ? `${summaryNotes} | ${userNotes}` : summaryNotes;
    const tags = Array.from(new Set([monsterTrope, primaryType.toLowerCase(), creatureNature.toLowerCase(), creatureSize.toLowerCase()].filter(Boolean))).sort();
    const timestamp = new Date().toISOString();
    
    const savedMonster: MonsterData = {
      id: generateId(),
      user_id: getCurrentUserId(),
      name: trimmedMonsterName,
      type: 'Monster',
      level,
      race: `${creatureNature} ${creatureSize} Creature`,
      class: 'Monster',
      abilities: baseAbilities,
      computed: calculateComputedStats(baseAbilities),
      status: {
        current_hp_active: hpCalculation.active_hp,
        current_hp_passive: hpCalculation.passive_hp,
        status_flags: [],
        gear: weaponsArmorTreasure.map(g => g.trim()).filter(Boolean),
        notes: combinedNotes
      },
      tags,
      monster_trope: monsterTrope.trim(),
      ...qsbSnapshot,
      preferred_encounter_roles: determineThreatRoles(resolvedThreatMV, primaryType),
      notes: combinedNotes,
      weapons_armor_treasure: weaponsArmorTreasure.map(g => g.trim()).filter(Boolean),
      created_at: timestamp,
      updated_at: timestamp,
      full_data: { legacy: { ...result, monsterNature, monsterSize, tier1Threat, tier2Threat, tier3Threat, monsterArmor, primaryAttack }, qsb: qsbSnapshot }
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

    // Reset dialog inputs
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
  
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Eldritch RPG Monster HP Calculator</h1>
        <p className="text-gray-600">Calculate monster hit points based on threat tiers, size, nature, and armor</p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <form onSubmit={handleCalculate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="monsterNature" className="block text-sm font-medium text-gray-700 mb-2">Monster Nature:</label>
              <select
                id="monsterNature"
                value={monsterNature}
                onChange={(e) => setMonsterNature(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-center"
              >
                {monsterNatureOptions.map(nature => (
                  <option key={nature.value} value={nature.value}>{nature.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="monsterSize" className="block text-sm font-medium text-gray-700 mb-2">Monster Size:</label>
              <select
                id="monsterSize"
                value={monsterSize}
                onChange={(e) => setMonsterSize(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-center"
              >
                {monsterSizeOptions.map(size => (
                  <option key={size.value} value={size.value}>{size.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="tier1Threat" className="block text-sm font-medium text-gray-700 mb-2">Threat Tier 1 (MV):</label>
              <select
                id="tier1Threat"
                value={tier1Threat}
                onChange={(e) => setTier1Threat(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-center"
              >
                {threatDieSelections.filter(die => die.value !== '0').map(die => (
                  <option key={die.value} value={die.value}>{die.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="tier2Threat" className="block text-sm font-medium text-gray-700 mb-2">Threat Tier 2 (MV):</label>
              <select
                id="tier2Threat"
                value={tier2Threat}
                onChange={(e) => setTier2Threat(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-center"
              >
                {threatDieSelections.map(die => (
                  <option key={die.value} value={die.value}>{die.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="tier3Threat" className="block text-sm font-medium text-gray-700 mb-2">Threat Tier 3 (MV):</label>
              <select
                id="tier3Threat"
                value={tier3Threat}
                onChange={(e) => setTier3Threat(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-center"
              >
                {threatDieSelections.map(die => (
                  <option key={die.value} value={die.value}>{die.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="monsterArmor" className="block text-sm font-medium text-gray-700 mb-2">Monster Armor:</label>
            <select
              id="monsterArmor"
              value={monsterArmor}
              onChange={(e) => setMonsterArmor(e.target.value)}
              className="w-full md:w-1/2 rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-center"
            >
              {monsterArmorOptions.map(armor => (
                <option key={armor.value} value={armor.value}>{armor.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="defenseSplit" className="block text-sm font-medium text-gray-700 mb-2">Defense Split:</label>
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
            <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
              Calculate Hit Points
            </button>
            {result && (
              <button type="button" onClick={saveMonster} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                Save Monster
              </button>
            )}
          </div>
        </form>
      </div>

      {result && (
        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Calculation Results</h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="text-3xl font-bold text-red-600 mb-2">{result.hitPoints} Hit Points</div>
              <div className="text-lg text-gray-700">This creature is <strong>{result.threatLevel}</strong> threat (MV {result.totalThreatMV}).</div>
            </div>
        </div>
      )}

      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Calculation Notes</h3>
        <div className="text-sm text-gray-700 space-y-2">
          <p><strong>Size and Nature Modifier:</strong> (Size Value + Nature Value) ÷ 2</p>
          <p><strong>Base Hit Points:</strong> Tier 1 + Tier 2 + Tier 3 threat dice values</p>
          <p><strong>Final Hit Points:</strong> Ceil(Base HP × Modifier) + Armor Bonus</p>
        </div>
      </div>

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
        <p className="text-sm text-gray-500 mt-2">This selection determines the monster&apos;s primary threat type.</p>
      </div>

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
                <label className="block text-sm font-medium mb-2">Assign to Trope Group (Optional)</label>
                <select
                  value={selectedParty}
                  onChange={(e) => setSelectedParty(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2"
                >
                  <option value="">No group assignment</option>
                  {partyFolders.map(folder => (
                    <option key={folder.id} value={folder.id}>{folder.name}</option>
                  ))}
                </select>
                {partyFolders.length === 0 && (
                  <p className="text-sm text-gray-500 mt-1">No monster trope folders available. Create one in the Party Management page.</p>
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
                  onChange={(e) => setWeaponsArmorTreasure(e.target.value.split('\n'))}
                  rows={3}
                  placeholder={"Claws and teeth\nBone charms\nAncient coins"}
                  className="w-full border border-gray-300 rounded-lg p-2"
                />
                <p className="text-xs text-gray-500 mt-1">Enter one item per line.</p>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button onClick={confirmSaveMonster} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded">
                Save Monster
              </button>
              <button onClick={() => setShowSaveDialog(false)} className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}