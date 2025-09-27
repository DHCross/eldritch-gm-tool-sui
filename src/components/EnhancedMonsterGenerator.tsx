'use client';

import { useState, useEffect, useRef } from 'react';
import {
  CreatureCategory,
  CreatureNature,
  CreatureSize,
  DefenseSplit,
  ThreatDice,
  SavedCharacter,
  PartyFolder
} from '../types/party';
import {
  EnhancedThreatDice,
  ArmorDefenseSystem,
  SpecialAbilities,
  TreasureCache,
  TREASURE_CACHE_TYPES,
  ARMOR_DIE_RANKS,
  SHIELD_TYPES,
  ARMOR_DESCRIPTIONS,
  SPECIAL_DEFENSES_BY_NATURE,
  EXTRA_ATTACKS_BY_CATEGORY
} from '../data/monsterData';
import {
  calculateEnhancedMonsterHP,
  generateEnhancedThreatDice,
  generateArmorDefenseSystem,
  generateSpecialAbilities,
  calculateEnhancedMovement,
  generateTreasureCache,
  determineCreatureCategory,
  generateBattlePhase,
  generateSavingThrow,
  getAvailableThreatDiceOptions,
  getSuggestedThreatDiceForCategory,
  isValidThreatDiceForCategory,
  getThreatDiceSummary,
  generateEnhancedQSBString,
  ThreatDiceSummary,
  parseThreatDice
} from '../utils/monsterUtils';
import { getAllPartyFolders, saveCharacter } from '../utils/partyStorage';
import { saveMonsterToRoster, getFolderList, createCustomFolder } from '../utils/rosterUtils';

// Enhanced form interface
interface EnhancedMonsterForm {
  name: string;
  category: CreatureCategory;
  nature: CreatureNature;
  size: CreatureSize;
  defenseSplit: DefenseSplit;

  // Enhanced threat dice with focus bonuses
  threatDice: EnhancedThreatDice;

  // Structured armor system
  armorDefense: ArmorDefenseSystem;

  // Special abilities
  specialAbilities: SpecialAbilities;

  // Movement system
  speedFocusBonus: number;
  especiallySpeedy: boolean;

  // Treasure system
  treasureCache?: TreasureCache;
  includeTreasure: boolean;

  // Standard fields
  savingThrow: string;
  battlePhase: string;
  notes: string;
  concept: string;
  storyTrope: string;
  useEldritchRealms: boolean;
}

export default function EnhancedMonsterGenerator() {
  const [monsterForm, setMonsterForm] = useState<EnhancedMonsterForm>({
    name: '',
    category: 'Minor',
    nature: 'Mundane',
    size: 'Medium',
    defenseSplit: 'Regular',
    threatDice: {
      melee: 'd6',
      natural: 'None',
      ranged: 'None',
      arcane: 'None'
    },
    armorDefense: {
      armorDieRank: 'None',
      armorDRBonus: 0,
      naturalDR: 0,
      shieldType: 'None',
      shieldDRReduction: 0
    },
    specialAbilities: {
      specialDefenses: [],
      extraAttacks: [],
      immunities: [],
      resistances: [],
      vulnerabilities: [],
      specialMovement: []
    },
    speedFocusBonus: 0,
    especiallySpeedy: false,
    includeTreasure: false,
    savingThrow: 'd6',
    battlePhase: 'd6',
    notes: '',
    concept: '',
    storyTrope: '',
    useEldritchRealms: false
  });

  const [partyFolders, setPartyFolders] = useState<PartyFolder[]>([]);
  const [selectedParty, setSelectedParty] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Roster functionality
  const [rosterFolders, setRosterFolders] = useState<string[]>([]);
  const [selectedRosterFolder, setSelectedRosterFolder] = useState('Monsters');
  const [showRosterSaveDialog, setShowRosterSaveDialog] = useState(false);
  const [customFolderName, setCustomFolderName] = useState('');

  // Refs for navigation
  const basicInfoRef = useRef<HTMLDivElement>(null);
  const threatDiceRef = useRef<HTMLDivElement>(null);
  const armorDefenseRef = useRef<HTMLDivElement>(null);
  const specialAbilitiesRef = useRef<HTMLDivElement>(null);
  const movementRef = useRef<HTMLDivElement>(null);
  const treasureRef = useRef<HTMLDivElement>(null);
  const qsbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPartyFolders(getAllPartyFolders());
    setRosterFolders(getFolderList());
  }, []);

  // Auto-generate enhanced threat dice when category changes
  useEffect(() => {
    const validation = isValidThreatDiceForCategory(monsterForm.threatDice, monsterForm.category);
    setValidationErrors(validation.errors);
  }, [monsterForm.threatDice, monsterForm.category]);

  // Smooth scroll function
  const scrollToSection = (ref: { current: HTMLDivElement | null }) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Calculate current stats
  const highestThreatMV = Math.max(
    parseThreatDice(monsterForm.threatDice.melee),
    parseThreatDice(monsterForm.threatDice.natural),
    parseThreatDice(monsterForm.threatDice.ranged),
    parseThreatDice(monsterForm.threatDice.arcane)
  );

  const calculatedCategory = determineCreatureCategory(monsterForm.threatDice);
  const hpCalc = calculateEnhancedMonsterHP(
    highestThreatMV,
    monsterForm.size,
    monsterForm.nature,
    monsterForm.defenseSplit,
    monsterForm.armorDefense
  );

  const battlePhaseMV = parseThreatDice(monsterForm.battlePhase);
  const movement = calculateEnhancedMovement(
    battlePhaseMV,
    monsterForm.size,
    monsterForm.speedFocusBonus,
    monsterForm.especiallySpeedy
  );

  const sizeModifierForMovement =
    movement.finalMovement -
    movement.baseMovement -
    monsterForm.speedFocusBonus -
    (monsterForm.especiallySpeedy ? 2 : 0);

  const formatModifier = (value: number) => (value >= 0 ? `+${value}` : `${value}`);

  const movementBreakdown = [
    `Base ${movement.baseMovement}`,
    `Size ${formatModifier(sizeModifierForMovement)}`,
    `Focus ${formatModifier(monsterForm.speedFocusBonus)}`,
    monsterForm.especiallySpeedy ? '+2 Especially Speedy' : undefined
  ]
    .filter(Boolean)
    .join(' + ')
    .concat(` = ${movement.finalMovement}`);

  const threatSummary: ThreatDiceSummary = getThreatDiceSummary(monsterForm.threatDice);

  // Update form functions
  const updateForm = <K extends keyof EnhancedMonsterForm>(
    field: K,
    value: EnhancedMonsterForm[K]
  ) => {
    setMonsterForm(prev => ({ ...prev, [field]: value }));
  };

  const updateThreatDice = (type: keyof ThreatDice, value: string) => {
    setMonsterForm(prev => ({
      ...prev,
      threatDice: { ...prev.threatDice, [type]: value }
    }));
  };

  const updateArmorDefense = <K extends keyof ArmorDefenseSystem>(
    field: K,
    value: ArmorDefenseSystem[K]
  ) => {
    setMonsterForm(prev => ({
      ...prev,
      armorDefense: { ...prev.armorDefense, [field]: value }
    }));
  };

  // Auto-generate enhanced features
  const autoGenerateEnhanced = () => {
    const enhancedThreatDice = generateEnhancedThreatDice(monsterForm.threatDice, monsterForm.category, true);
    const armorDefense = generateArmorDefenseSystem(monsterForm.category, monsterForm.nature, monsterForm.size);
    const specialAbilities = generateSpecialAbilities(monsterForm.category, monsterForm.nature);
    const newBattlePhase = generateBattlePhase(calculatedCategory, monsterForm.nature);
    const newSavingThrow = generateSavingThrow(calculatedCategory, monsterForm.nature);

    let treasureCache: TreasureCache | undefined;
    if (monsterForm.includeTreasure) {
      treasureCache = generateTreasureCache(monsterForm.category, monsterForm.nature, monsterForm.size);
    }

    setMonsterForm(prev => ({
      ...prev,
      threatDice: enhancedThreatDice,
      armorDefense,
      specialAbilities,
      battlePhase: newBattlePhase,
      savingThrow: newSavingThrow,
      category: calculatedCategory,
      treasureCache
    }));
  };

  // Generate QSB string
  const generateQSBString = () => {
    return generateEnhancedQSBString(
      monsterForm.name,
      monsterForm.category,
      monsterForm.threatDice,
      hpCalc,
      monsterForm.armorDefense,
      monsterForm.battlePhase,
      monsterForm.savingThrow,
      movement,
      monsterForm.specialAbilities,
      monsterForm.treasureCache,
      monsterForm.notes
    );
  };

  const saveMonster = () => {
    if (!monsterForm.name.trim()) {
      alert('Please enter a monster name');
      return;
    }

    const character: SavedCharacter = {
      id: Date.now().toString(),
      user_id: 'default_user',
      name: monsterForm.name,
      type: 'Monster',
      level: Math.max(1, Math.floor(highestThreatMV / 6)),
      race: `${monsterForm.nature} ${monsterForm.size}`,
      class: 'Monster',
      abilities: {
        prowess_mv: Math.max(4, Math.min(12, highestThreatMV / 3)),
        agility_mv: Math.max(4, Math.min(12, highestThreatMV / 3)),
        melee_mv: Math.max(4, Math.min(12, highestThreatMV / 2)),
        fortitude_mv: Math.max(4, Math.min(12, highestThreatMV / 3)),
        endurance_mv: Math.max(4, Math.min(12, highestThreatMV / 3)),
        strength_mv: Math.max(4, Math.min(12, highestThreatMV / 3)),
        competence_mv: Math.max(4, Math.min(8, highestThreatMV / 4)),
        willpower_mv: Math.max(4, Math.min(8, highestThreatMV / 4)),
        expertise_mv: Math.max(4, Math.min(8, highestThreatMV / 4)),
        perception_mv: Math.max(4, Math.min(8, highestThreatMV / 4)),
        adroitness_mv: Math.max(4, Math.min(8, highestThreatMV / 4)),
        precision_mv: Math.max(4, Math.min(8, highestThreatMV / 4))
      },
      computed: {
        active_dp: hpCalc.active_hp,
        passive_dp: hpCalc.passive_hp,
        spirit_pts: Math.max(4, highestThreatMV / 2)
      },
      status: {
        current_hp_active: hpCalc.active_hp,
        current_hp_passive: hpCalc.passive_hp,
        status_flags: [],
        gear: [],
        notes: monsterForm.notes
      },
      tags: [monsterForm.category.toLowerCase(), monsterForm.nature.toLowerCase(), monsterForm.size.toLowerCase(), 'enhanced'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      full_data: {
        ...monsterForm,
        threatMV: highestThreatMV,
        finalHP: hpCalc.final_hp,
        finalActiveHP: hpCalc.active_hp,
        finalPassiveHP: hpCalc.passive_hp,
        baseMovement: movement.finalMovement,
        qsbString: generateQSBString(),
        enhanced: true
      }
    };

    saveCharacter(character);
    alert(`Enhanced Monster "${monsterForm.name}" saved successfully!`);
    setShowSaveDialog(false);
  };

  // Save monster to roster function
  const saveMonsterToRosterFunc = () => {
    if (!monsterForm.name.trim()) {
      alert('Please enter a monster name');
      return;
    }

    let folderName = selectedRosterFolder;

    // If custom folder name is provided, create it and use it
    if (customFolderName.trim()) {
      const success = createCustomFolder(customFolderName.trim());
      if (success) {
        folderName = customFolderName.trim();
        setRosterFolders(getFolderList()); // Refresh folder list
      } else {
        folderName = customFolderName.trim(); // Use it anyway, might already exist
      }
    }

    // Create monster object for roster
    const monsterForRoster = {
      name: monsterForm.name,
      category: monsterForm.category,
      nature: monsterForm.nature,
      size: monsterForm.size,
      AD: hpCalc.active_hp,
      PD: hpCalc.passive_hp,
      summary: `${monsterForm.category} ${monsterForm.nature} ${monsterForm.size} creature`,
      threatDice: monsterForm.threatDice,
      armorDefense: monsterForm.armorDefense,
      specialAbilities: monsterForm.specialAbilities,
      movement: movement,
      treasureCache: monsterForm.treasureCache,
      notes: monsterForm.notes,
      qsbString: generateQSBString(),
      enhanced: true,
      threatMV: highestThreatMV
    };

    const success = saveMonsterToRoster(monsterForRoster, folderName);

    if (success) {
      alert(`Monster "${monsterForm.name}" saved to roster folder "${folderName}" successfully!`);
      setShowRosterSaveDialog(false);
      setCustomFolderName('');
    } else {
      alert('Failed to save monster to roster. Please try again.');
    }
  };

  return (
    <div className="relative">
      {/* Enhanced Navigation Sidebar */}
      <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-10 hidden lg:block">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 space-y-2 max-h-96 overflow-y-auto">
          <h3 className="text-sm font-bold text-gray-800 mb-3 text-center">Enhanced Nav</h3>
          {[
            { ref: basicInfoRef, label: 'Basic Info', color: 'blue' },
            { ref: threatDiceRef, label: 'Threat Dice', color: 'red' },
            { ref: armorDefenseRef, label: 'Armor/Defense', color: 'gray' },
            { ref: specialAbilitiesRef, label: 'Special Abilities', color: 'purple' },
            { ref: movementRef, label: 'Movement', color: 'green' },
            { ref: treasureRef, label: 'Treasure', color: 'yellow' },
            { ref: qsbRef, label: 'QSB Result', color: 'indigo' }
          ].map(({ ref, label, color }) => (
            <button
              key={label}
              onClick={() => scrollToSection(ref)}
              className={`w-full text-left text-xs bg-${color}-50 hover:bg-${color}-100 text-${color}-700 px-3 py-2 rounded transition-colors`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Enhanced Eldritch RPG Monster Builder
          </h1>
          <p className="text-gray-600">
            Complete QSB generator with Focus Bonuses, Structured Defense, Treasure, and Special Abilities
          </p>
        </div>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-red-800 font-semibold mb-2">Validation Errors:</h3>
            <ul className="text-red-700 text-sm space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* I. Basic Information */}
        <div ref={basicInfoRef} className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">I. Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Monster Name:</label>
              <input
                type="text"
                value={monsterForm.name}
                onChange={(e) => updateForm('name', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Enter monster name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Creature Category:</label>
              <select
                value={monsterForm.category}
                onChange={(e) => updateForm('category', e.target.value as CreatureCategory)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="Minor">Minor (1 die minimum)</option>
                <option value="Standard">Standard (2 dice minimum)</option>
                <option value="Exceptional">Exceptional (3 dice minimum)</option>
                <option value="Legendary">Legendary (3+ dice, d12s)</option>
              </select>
              {calculatedCategory !== monsterForm.category && (
                <p className="text-xs text-orange-600 mt-1">
                  Auto-calculated category: {calculatedCategory}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Size:</label>
              <select
                value={monsterForm.size}
                onChange={(e) => updateForm('size', e.target.value as CreatureSize)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                {['Minuscule', 'Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan'].map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nature:</label>
              <select
                value={monsterForm.nature}
                onChange={(e) => updateForm('nature', e.target.value as CreatureNature)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="Mundane">Mundane - Mortal Kin</option>
                <option value="Magical">Magical - Enchanted Kin</option>
                <option value="Preternatural">Preternatural - Unquiet Kin</option>
                <option value="Supernatural">Supernatural - Reifiants</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Constitution:</label>
              <select
                value={monsterForm.defenseSplit}
                onChange={(e) => updateForm('defenseSplit', e.target.value as DefenseSplit)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="Regular">Regular (50/50 HP split)</option>
                <option value="Fast">Fast (75/25 HP split)</option>
                <option value="Tough">Tough (25/75 HP split)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Concept:</label>
              <input
                type="text"
                value={monsterForm.concept}
                onChange={(e) => updateForm('concept', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="e.g., Ancient forest guardian, Corrupted knight"
              />
            </div>
          </div>
        </div>

        {/* II. Enhanced Threat Dice with Focus Bonuses */}
        <div ref={threatDiceRef} className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">II. Enhanced Threat Dice & Focus Bonuses</h2>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="text-blue-900 font-semibold mb-2">Flexible Threat Dice System</h3>
            <p className="text-blue-800 text-sm mb-2">
              Only ONE threat type needs to meet the category minimum. Others can be any valid combination.
            </p>
            <p className="text-blue-700 text-xs">
              Category minimum: {monsterForm.category} requires {
                monsterForm.category === 'Minor' ? '1 die (d4+)' :
                monsterForm.category === 'Standard' ? '2 dice or 1d8+ (d6+ for primary)' :
                monsterForm.category === 'Exceptional' ? '3 dice or 2d10+ (d8+ for primary)' :
                '3+ dice with d12s or 4+ dice combinations'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">Threat Dice Configuration</h4>
              <div className="space-y-3">
                {Object.entries(monsterForm.threatDice).filter(([key]) => key !== 'threatFocus' && key !== 'rangedThreatFocus' && key !== 'mightFocus' && key !== 'ferocityFocus' && key !== 'speedFocus').map(([type, value]) => (
                  <div key={type}>
                    <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                      {type} Threat Dice:
                    </label>
                    <select
                      value={value}
                      onChange={(e) => updateThreatDice(type as keyof ThreatDice, e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      {getAvailableThreatDiceOptions().map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <h5 className="text-sm font-semibold text-gray-700 mb-2">Suggested for {monsterForm.category}:</h5>
                <div className="flex flex-wrap gap-1">
                  {getSuggestedThreatDiceForCategory(monsterForm.category).slice(1, 8).map(suggestion => (
                    <button
                      key={suggestion}
                      onClick={() => updateThreatDice('melee', suggestion)}
                      className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-800 mb-3">Auto-Generated Focus Bonuses</h4>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Threat Focus (Melee):</span>
                    <span className="font-medium">+{monsterForm.threatDice.threatFocus || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ranged Threat Focus:</span>
                    <span className="font-medium">+{monsterForm.threatDice.rangedThreatFocus || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Might Focus (Damage):</span>
                    <span className="font-medium">+{monsterForm.threatDice.mightFocus || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ferocity Focus (Damage):</span>
                    <span className="font-medium">+{monsterForm.threatDice.ferocityFocus || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Speed Focus (Movement):</span>
                    <span className="font-medium">+{monsterForm.threatDice.speedFocus || 0}</span>
                  </div>
                </div>
                <p className="text-xs text-green-700 mt-2">
                  Static bonuses (+1 to +5) based on creature category and power level.
                </p>
              </div>

              <div className="mt-4">
                <h5 className="text-sm font-semibold text-gray-700 mb-2">Current Threat Summary:</h5>
                <div className="bg-gray-50 border border-gray-200 rounded p-3 text-sm">
                  <p><strong>Primary:</strong> {threatSummary.primary}</p>
                  {threatSummary.secondary.length > 0 && (
                    <p><strong>Secondary:</strong> {threatSummary.secondary.join(', ')}</p>
                  )}
                  <p><strong>Max Damage:</strong> {threatSummary.totalMaxDamage}</p>
                  {threatSummary.focusBonuses.length > 0 && (
                    <p><strong>Focus Bonuses:</strong> {threatSummary.focusBonuses.join(', ')}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* III. Structured Armor & Defense System */}
        <div ref={armorDefenseRef} className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">III. Structured Armor & Defense System</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">Armor Configuration</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Armor Die Rank:</label>
                  <select
                    value={monsterForm.armorDefense.armorDieRank}
                    onChange={(e) => updateArmorDefense('armorDieRank', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    {ARMOR_DIE_RANKS.map(rank => (
                      <option key={rank} value={rank}>
                        {rank} - {ARMOR_DESCRIPTIONS[rank]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Additional DR Bonus:</label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    value={monsterForm.armorDefense.armorDRBonus}
                    onChange={(e) => updateArmorDefense('armorDRBonus', parseInt(e.target.value) || 0)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Natural DR (Toughness):</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={monsterForm.armorDefense.naturalDR}
                    onChange={(e) => updateArmorDefense('naturalDR', parseInt(e.target.value) || 0)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">Natural toughness, size-based bonus</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Shield Type:</label>
                  <select
                    value={monsterForm.armorDefense.shieldType}
                    onChange={(e) => updateArmorDefense('shieldType', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    {SHIELD_TYPES.map(shield => (
                      <option key={shield} value={shield}>{shield}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-800 mb-3">Defense Calculation</h4>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h5 className="font-medium mb-3">HP Breakdown:</h5>
                <div className="text-sm space-y-1">
                  <div>Base HP: {hpCalc.base_hp} (highest threat MV)</div>
                  <div>Size Modifier: +{hpCalc.size_modifier} ({monsterForm.size})</div>
                  <div>Nature Modifier: +{hpCalc.nature_modifier} ({monsterForm.nature})</div>
                  <div>HP Multiplier: ×{hpCalc.hp_multiplier.toFixed(2)}</div>
                  <div>Armor Bonus: +{hpCalc.armor_bonus}</div>
                  <hr className="my-2" />
                  <div className="font-semibold">
                    Final HP: {hpCalc.final_hp} ({hpCalc.active_hp} Active / {hpCalc.passive_hp} Passive)
                  </div>
                </div>
              </div>

              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h5 className="font-medium mb-2">DR Summary:</h5>
                <div className="text-sm space-y-1">
                  {monsterForm.armorDefense.armorDieRank !== 'None' && (
                    <div>Armor DR: {monsterForm.armorDefense.armorDieRank}</div>
                  )}
                  {monsterForm.armorDefense.armorDRBonus > 0 && (
                    <div>Armor Bonus: +{monsterForm.armorDefense.armorDRBonus}</div>
                  )}
                  {monsterForm.armorDefense.naturalDR && monsterForm.armorDefense.naturalDR > 0 && (
                    <div>Natural DR: +{monsterForm.armorDefense.naturalDR}</div>
                  )}
                  {monsterForm.armorDefense.shieldType !== 'None' && (
                    <div>Shield: {monsterForm.armorDefense.shieldType}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* IV. Special Abilities & Defenses */}
        <div ref={specialAbilitiesRef} className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">IV. Special Abilities & Defenses</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">Special Defenses</h4>
              <div className="space-y-2">
                {SPECIAL_DEFENSES_BY_NATURE[monsterForm.nature]?.map(defense => (
                  <label key={defense} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={monsterForm.specialAbilities.specialDefenses.includes(defense)}
                      onChange={(e) => {
                        const defenses = e.target.checked
                          ? [...monsterForm.specialAbilities.specialDefenses, defense]
                          : monsterForm.specialAbilities.specialDefenses.filter(d => d !== defense);
                        updateForm('specialAbilities', {
                          ...monsterForm.specialAbilities,
                          specialDefenses: defenses
                        });
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm">{defense}</span>
                  </label>
                ))}
              </div>

              <h4 className="font-semibold text-gray-800 mb-3 mt-6">Extra Attacks</h4>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Available Extra Attacks:</label>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      const newAttack = {
                        type: 'Secondary Attack' as const,
                        description: e.target.value,
                        damage: monsterForm.category === 'Minor' ? 'd4' : monsterForm.category === 'Standard' ? 'd6' : 'd8'
                      };
                      updateForm('specialAbilities', {
                        ...monsterForm.specialAbilities,
                        extraAttacks: [...monsterForm.specialAbilities.extraAttacks, newAttack]
                      });
                      e.target.value = '';
                    }
                  }}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">Add extra attack...</option>
                  {EXTRA_ATTACKS_BY_CATEGORY[monsterForm.category]?.map(attack => (
                    <option key={attack} value={attack}>{attack}</option>
                  ))}
                </select>

                <div className="space-y-1">
                  {monsterForm.specialAbilities.extraAttacks.map((attack, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm">{attack.description} ({attack.damage})</span>
                      <button
                        onClick={() => {
                          const attacks = monsterForm.specialAbilities.extraAttacks.filter((_, i) => i !== index);
                          updateForm('specialAbilities', {
                            ...monsterForm.specialAbilities,
                            extraAttacks: attacks
                          });
                        }}
                        className="text-red-600 hover:text-red-800 text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-800 mb-3">Immunities & Resistances</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Immunities:</label>
                  <input
                    type="text"
                    value={monsterForm.specialAbilities.immunities.join(', ')}
                    onChange={(e) => {
                      const immunities = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                      updateForm('specialAbilities', {
                        ...monsterForm.specialAbilities,
                        immunities
                      });
                    }}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="poison, disease, charm, sleep"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Resistances:</label>
                  <input
                    type="text"
                    value={monsterForm.specialAbilities.resistances.join(', ')}
                    onChange={(e) => {
                      const resistances = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                      updateForm('specialAbilities', {
                        ...monsterForm.specialAbilities,
                        resistances
                      });
                    }}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="physical damage, magic damage"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vulnerabilities:</label>
                  <input
                    type="text"
                    value={monsterForm.specialAbilities.vulnerabilities.join(', ')}
                    onChange={(e) => {
                      const vulnerabilities = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                      updateForm('specialAbilities', {
                        ...monsterForm.specialAbilities,
                        vulnerabilities
                      });
                    }}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="fire, cold, silver"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Special Movement:</label>
                  <input
                    type="text"
                    value={monsterForm.specialAbilities.specialMovement.join(', ')}
                    onChange={(e) => {
                      const specialMovement = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                      updateForm('specialAbilities', {
                        ...monsterForm.specialAbilities,
                        specialMovement
                      });
                    }}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="fly, swim, burrow, teleport"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* V. Enhanced Movement System */}
        <div ref={movementRef} className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">V. Enhanced Movement System</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">Movement Configuration</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Speed Focus Bonus:</label>
                  <select
                    value={monsterForm.speedFocusBonus}
                    onChange={(e) => updateForm('speedFocusBonus', parseInt(e.target.value))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value={0}>No Speed Focus (0)</option>
                    <option value={1}>d4-d6 Speed Focus (+1)</option>
                    <option value={2}>d8-d10 Speed Focus (+2)</option>
                    <option value={3}>d12+ Speed Focus (+3)</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Static bonus from Speed Focus ability (+1 to +3 based on die rank)
                  </p>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={monsterForm.especiallySpeedy}
                      onChange={(e) => updateForm('especiallySpeedy', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Especially Speedy</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Grants enhanced Run/Sprint multipliers and Burst movement
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Battle Phase (for movement):</label>
                  <input
                    type="text"
                    value={monsterForm.battlePhase}
                    onChange={(e) => updateForm('battlePhase', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="d6, d8, d10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Saving Throw:</label>
                  <input
                    type="text"
                    value={monsterForm.savingThrow}
                    onChange={(e) => updateForm('savingThrow', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="d6, d8, d10"
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-800 mb-3">Movement Calculation</h4>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-sm space-y-2">
                  <div className="font-medium">Movement Formula Breakdown:</div>
                  <div>{movementBreakdown}</div>
                  <hr className="my-2" />
                  <div className="font-semibold">Final Movement: {movement.finalMovement} squares/phase</div>
                </div>
              </div>

              <div className="mt-4">
                <h5 className="font-medium mb-2">Movement Actions:</h5>
                <div className="space-y-1 text-sm">
                  {Object.entries(movement.movementActions).map(([action, data]) => (
                    <div key={action} className="flex justify-between">
                      <span className="font-medium">{action}:</span>
                      <span>{data.squares} sq ({data.squares * 5}ft) - {data.penalty}</span>
                    </div>
                  ))}
                </div>
              </div>

              {monsterForm.specialAbilities.specialMovement.length > 0 && (
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded p-3">
                  <h5 className="font-medium mb-1">Special Movement:</h5>
                  <div className="text-sm">
                    {monsterForm.specialAbilities.specialMovement.join(', ')}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* VI. Treasure Generation System */}
        <div ref={treasureRef} className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">VI. Treasure Generation System</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={monsterForm.includeTreasure}
                    onChange={(e) => updateForm('includeTreasure', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Include Treasure Cache</span>
                </label>
              </div>

              {monsterForm.includeTreasure && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Treasure Cache Type:</label>
                  <select
                    value={monsterForm.treasureCache?.cacheType || ''}
                    onChange={(e) => {
                      if (e.target.value) {
                        updateForm('treasureCache', TREASURE_CACHE_TYPES[e.target.value as keyof typeof TREASURE_CACHE_TYPES]);
                      }
                    }}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">Auto-generate based on creature</option>
                    {Object.keys(TREASURE_CACHE_TYPES).map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>

                  <button
                    onClick={() => {
                      const autoTreasure = generateTreasureCache(monsterForm.category, monsterForm.nature, monsterForm.size);
                      updateForm('treasureCache', autoTreasure);
                    }}
                    className="mt-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm px-3 py-1 rounded"
                  >
                    Auto-Generate Treasure
                  </button>
                </div>
              )}
            </div>

            <div>
              {monsterForm.treasureCache && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">{monsterForm.treasureCache.cacheType}</h4>
                  <div className="text-sm space-y-1">
                    <div>
                      <span className="font-medium">Value Range:</span>
                      ${monsterForm.treasureCache.baseValue.min}-${monsterForm.treasureCache.baseValue.max}
                    </div>
                    <div>
                      <span className="font-medium">Magic Items:</span>
                      {monsterForm.treasureCache.magicItemChance}% chance, {monsterForm.treasureCache.magicItemCount}
                    </div>
                    <div className="text-xs text-yellow-700 mt-2">
                      {monsterForm.treasureCache.description}
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4">
                <h5 className="font-medium mb-2">Treasure Guidelines:</h5>
                <div className="text-xs space-y-1 text-gray-600">
                  <div>• Trinkets: $1-5, 1% magic (personal effects)</div>
                  <div>• Small cache: $2-20, 5% magic (hidden stash)</div>
                  <div>• Cache: $20-200, 10% magic (buried treasure)</div>
                  <div>• Small trove: $100-500, 20% magic (noble&apos;s vault)</div>
                  <div>• Trove: $200-2000, 30% magic (bandit treasury)</div>
                  <div>• Hoard: $1000-10000, 40% magic (royal treasury)</div>
                  <div>• Dragon&apos;s hoard: $10000-50000+, 50% magic (legendary)</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* VII. Generated Enhanced QSB */}
        <div ref={qsbRef} className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Generated Enhanced Quick Stat Block (QSB)</h2>

          <div className="bg-black text-green-400 p-4 rounded font-mono text-sm whitespace-pre-wrap mb-4">
            {generateQSBString()}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <h4 className="font-semibold text-blue-800 mb-2">Combat Summary</h4>
              <div className="text-sm space-y-1">
                <div>Max Threat Damage: {threatSummary.totalMaxDamage}</div>
                <div>Final HP: {hpCalc.final_hp} ({hpCalc.active_hp}/{hpCalc.passive_hp})</div>
                <div>Movement: {movement.finalMovement} sq/phase</div>
                <div>Category: {calculatedCategory}</div>
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded p-3">
              <h4 className="font-semibold text-purple-800 mb-2">Enhancement Summary</h4>
              <div className="text-sm space-y-1">
                <div>Focus Bonuses: {threatSummary.focusBonuses.length}</div>
                <div>Special Defenses: {monsterForm.specialAbilities.specialDefenses.length}</div>
                <div>Extra Attacks: {monsterForm.specialAbilities.extraAttacks.length}</div>
                <div>Treasure: {monsterForm.treasureCache ? 'Yes' : 'No'}</div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={autoGenerateEnhanced}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
            >
              Auto-Generate All Enhanced Features
            </button>
            <button
              onClick={() => setShowSaveDialog(true)}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-3"
            >
              Save Enhanced Monster
            </button>
            <button
              onClick={() => setShowRosterSaveDialog(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Save to Roster
            </button>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Additional Notes</h2>
          <textarea
            value={monsterForm.notes}
            onChange={(e) => updateForm('notes', e.target.value)}
            rows={4}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            placeholder="Additional notes, tactics, lore, or special rules..."
          />
        </div>
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Save Enhanced Monster</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign to Party/Roster:
                </label>
                <select
                  value={selectedParty}
                  onChange={(e) => setSelectedParty(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">Default Monster Roster</option>
                  {partyFolders.map(folder => (
                    <option key={folder.id} value={folder.id}>
                      {folder.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                onClick={saveMonster}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              >
                Save Enhanced Monster
              </button>
              <button
                onClick={() => setShowSaveDialog(false)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Roster Save Dialog */}
      {showRosterSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Save Monster to Roster</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Roster Folder:
                </label>
                <select
                  value={selectedRosterFolder}
                  onChange={(e) => setSelectedRosterFolder(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  {rosterFolders.map(folder => (
                    <option key={folder} value={folder}>
                      {folder}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Or Create New Folder:
                </label>
                <input
                  type="text"
                  value={customFolderName}
                  onChange={(e) => setCustomFolderName(e.target.value)}
                  placeholder="Enter new folder name..."
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to use selected folder above
                </p>
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                onClick={saveMonsterToRosterFunc}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Save to Roster
              </button>
              <button
                onClick={() => {
                  setShowRosterSaveDialog(false);
                  setCustomFolderName('');
                }}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
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