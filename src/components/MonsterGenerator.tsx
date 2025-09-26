'use client';

import { useState, useEffect } from 'react';
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
  calculateMonsterHP,
  determineCreatureCategory,
  generateBattlePhase,
  generateSavingThrow,
  parseThreatDice
} from '../utils/monsterUtils';
import { getAllPartyFolders, saveCharacter } from '../utils/partyStorage';

// Armor types with DR values and HP bonuses
const ARMOR_TYPES = [
  { name: 'None', dr_die: 'None', hp_bonus: 0 },
  { name: 'Hide', dr_die: 'd4', hp_bonus: 2 },
  { name: 'Leather', dr_die: 'd6', hp_bonus: 3 },
  { name: 'Chain', dr_die: 'd8', hp_bonus: 4 },
  { name: 'Plate', dr_die: 'd10', hp_bonus: 5 },
  { name: 'Mithral', dr_die: 'd12', hp_bonus: 6 }
];

// Shield types with threat reduction
const SHIELD_TYPES = [
  { name: 'None', threat_reduction: 0 },
  { name: 'Small', threat_reduction: 1 },
  { name: 'Medium', threat_reduction: 2 },
  { name: 'Large', threat_reduction: 3 }
];

// Creature categories with threat dice counts
const CREATURE_CATEGORIES = [
  { name: 'Minor', description: '1 Threat Die', threat_dice_count: 1 },
  { name: 'Standard', description: '2 Threat Dice', threat_dice_count: 2 },
  { name: 'Exceptional', description: '3 Threat Dice', threat_dice_count: 3 },
  { name: 'Legendary', description: '3+ Threat Dice', threat_dice_count: 3 }
];

// Size categories
const SIZE_CATEGORIES = [
  'Minuscule', 'Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan'
];

// Nature categories
const NATURE_CATEGORIES = [
  'Mundane', 'Magical', 'Preternatural', 'Supernatural'
];

// Constitution types
const CONSTITUTION_TYPES = [
  { name: 'Regular', description: '50/50 HP split' },
  { name: 'Tough', description: '25/75 HP split' },
  { name: 'Fast', description: '75/25 HP split' }
];

// Meterea Conceptual Manifestations
const METEREA_MANIFESTATIONS = {
  'Reifiants': 'Legend-forged archetypes crystallized from collective belief',
  'Inklings': 'Raw dream-spirits, unstable flickers of subconscious intent',
  'Extantars': 'Perception-reactive entities that morph based on observer expectations',
  'Aethelborn': 'Stabilized forms fixed by focused external will'
};

// Racial Archetypal Tropes
const RACIAL_ARCHETYPES = {
  'Goblinoids': 'Cunning and covetous kin, blending bestial ferocity with reptilian traits',
  'Alfar': 'Magical humanoids sharing a spark of Meterea\'s dream-stuff',
  'Dwarves': 'Resilient mountain-dwellers, renowned miners and smiths',
  'Elves': 'Forest-bound, long-lived beings where nature\'s magic is strongest',
  'Halflings': 'Diminutive beings with nimble grace and adventurous spirits',
  'Gnomes': 'Intricate workshop masters favoring arcane experiments',
  'Drakkin': 'Dragon-descended humanoids blending ambition with draconic power'
};

// Expanded creature tropes by nature and tier (Quick Stat Block Tool)
const CREATURE_TROPES = {
  'Mundane': {
    'Minor': ['Villager (1d4)', 'Inexperienced Bandit (1d6)', 'Small Animal (1d3)', 'Farmer (1d4)', 'Street Thief (1d6)'],
    'Standard': ['Trained Guard (2d6)', 'Seasoned Brigand (2d8)', 'Wolf Pack (2d6)', 'Soldier (2d8)', 'Mercenary (2d6)'],
    'Exceptional': ['Veteran Warrior (3d8)', 'Cunning Assassin (3d10)', 'Tiger (3d10)', 'Elite Guard (3d8)', 'Master Archer (3d10)'],
    'Legendary': ['Renowned Champion (3d12+)', 'Warlord (3d12+)', 'Elephant (3d12+)', 'Legendary Beast (3d12+)', 'Master Tactician (3d12+)']
  },
  'Magical': {
    'Minor': ['Pixie (1d4)', 'Sprite (1d6)', 'Novice Druid (1d6)', 'Hedge Wizard (1d8)', 'Minor Familiar (1d4)'],
    'Standard': ['Elven Mage (2d8)', 'Druidic Circle (2d8)', 'Unicorn (2d10)', 'Fey Noble (2d8)', 'Elemental (2d10)'],
    'Exceptional': ['Powerful Sorcerer (3d10)', 'Archdruid (3d10)', 'Griffin (3d8)', 'Manticore (3d10)', 'Fey Lord (3d12)'],
    'Legendary': ['Archmage (3d12+)', 'Fey Nobility (3d12+)', 'True Dragon (3d12+)', 'Elemental Lord (3d12+)', 'Celestial (3d12+)']
  },
  'Preternatural': {
    'Minor': ['Skeleton (1d4)', 'Zombie (1d6)', 'Doppelganger (1d8)', 'Mimic (1d8)', 'Shadow (1d6)'],
    'Standard': ['Vampire (2d8)', 'Werewolf (2d10)', 'Potent Specter (2d10)', 'Wraith (2d8)', 'Ghoul Pack (2d6)'],
    'Exceptional': ['Lich (3d10)', 'Vampire Lord (3d12)', 'Ancient Shapeshifter (3d10)', 'Death Knight (3d12)', 'Nightmare (3d10)'],
    'Legendary': ['Undead Dragon (3d12+)', 'Bound Demon (3d12+)', 'Legendary Shapeshifter (3d12+)', 'Lich King (3d12+)', 'Avatar of Death (3d12+)']
  },
  'Supernatural': {
    'Minor': ['Lesser Angel (1d8)', 'Minor Fiend (1d8)', 'Dryad (1d6)', 'Nymph (1d6)', 'Guardian Spirit (1d8)'],
    'Standard': ['True Angel (2d10)', 'Powerful Demon (2d12)', 'Elder Nature Spirit (2d10)', 'Celestial Guardian (2d10)', 'Infernal Warrior (2d12)'],
    'Exceptional': ['Archangel (3d10)', 'Demon Lord (3d12)', 'Avatar of Minor Deity (3d12)', 'Seraph (3d12)', 'Balor (3d12)'],
    'Legendary': ['God/Goddess (3d12+)', 'Primordial Titan (3d12+)', 'Cosmic Force (3d12+)', 'Divine Avatar (3d12+)', 'World Spirit (3d12+)']
  }
};

// Speed focus bonuses
const SPEED_FOCUS_BONUSES = {
  'd4': 1, 'd6': 1, 'd8': 2, 'd10': 2, 'd12': 3, 'd14': 3, 'd16': 3, 'd18': 3, 'd20': 3
};

// Movement action multipliers
const MOVEMENT_MULTIPLIERS = {
  'Walk': { normal: 1, speedy: 1, penalty: 'None' },
  'Run': { normal: 2, speedy: 3, penalty: '-3 Threat Points to attacks' },
  'Sprint': { normal: 4, speedy: 5, penalty: 'No other actions permitted' },
  'Burst': { normal: 0, speedy: 7, penalty: 'Lasts 1 phase, must rest 1 round (Especially Speedy only)' }
};

interface MonsterForm {
  name: string;
  category: CreatureCategory;
  nature: CreatureNature;
  size: CreatureSize;
  defenseSplit: DefenseSplit;
  threatDice: ThreatDice;
  extraAttacks: string;
  armor: string;
  shield: string;
  savingThrow: string;
  battlePhase: string;
  notes: string;
  concept: string;
  trope: string;
  speedFocus: string;
  especiallySpeedy: boolean;
}

export default function MonsterGenerator() {
  const [monsterForm, setMonsterForm] = useState<MonsterForm>({
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
    extraAttacks: '',
    armor: 'None',
    shield: 'None',
    savingThrow: 'd6',
    battlePhase: 'd6',
    notes: '',
    concept: '',
    trope: '',
    speedFocus: 'None',
    especiallySpeedy: false
  });

  const [partyFolders, setPartyFolders] = useState<PartyFolder[]>([]);
  const [selectedParty, setSelectedParty] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  useEffect(() => {
    setPartyFolders(getAllPartyFolders());
  }, []);

  // Calculate stats based on current form
  const highestThreatMV = Math.max(
    parseThreatDice(monsterForm.threatDice.melee),
    parseThreatDice(monsterForm.threatDice.natural),
    parseThreatDice(monsterForm.threatDice.ranged),
    parseThreatDice(monsterForm.threatDice.arcane)
  );

  const calculatedCategory = determineCreatureCategory(monsterForm.threatDice);
  const hpCalc = calculateMonsterHP(highestThreatMV, monsterForm.size, monsterForm.nature, monsterForm.defenseSplit);

  // Get armor and shield bonuses
  const selectedArmor = ARMOR_TYPES.find(a => a.name === monsterForm.armor) || ARMOR_TYPES[0];
  const selectedShield = SHIELD_TYPES.find(s => s.name === monsterForm.shield) || SHIELD_TYPES[0];

  // Calculate final HP with armor bonus
  const finalHP = hpCalc.final_hp + selectedArmor.hp_bonus;

  // Recalculate active/passive split with final HP
  let finalActiveHP: number, finalPassiveHP: number;
  switch (monsterForm.defenseSplit) {
    case 'Fast':
      finalActiveHP = Math.ceil(finalHP * 0.75);
      finalPassiveHP = Math.floor(finalHP * 0.25);
      break;
    case 'Tough':
      finalActiveHP = Math.floor(finalHP * 0.25);
      finalPassiveHP = Math.ceil(finalHP * 0.75);
      break;
    case 'Regular':
    default:
      finalActiveHP = Math.ceil(finalHP * 0.5);
      finalPassiveHP = Math.floor(finalHP * 0.5);
      break;
  }

  // Calculate DR display
  const drDisplay = selectedArmor.dr_die === 'None' && selectedShield.threat_reduction === 0
    ? 'None'
    : `${selectedArmor.dr_die === 'None' ? '' : selectedArmor.dr_die}${selectedArmor.dr_die !== 'None' && selectedShield.threat_reduction > 0 ? ', ' : ''}${selectedShield.threat_reduction > 0 ? `-${selectedShield.threat_reduction} Shield` : ''}`;

  // Calculate tactical movement
  const calculateMovement = () => {
    const bpMV = parseThreatDice(monsterForm.battlePhase);
    const baseMovement = Math.floor((12 + bpMV) / 5);

    let movement = baseMovement;

    // Add speed focus bonus
    if (monsterForm.speedFocus !== 'None') {
      movement += SPEED_FOCUS_BONUSES[monsterForm.speedFocus as keyof typeof SPEED_FOCUS_BONUSES] || 0;
    }

    // Size modifiers (larger creatures move faster)
    const sizeBonus = {
      'Minuscule': -1, 'Tiny': -1, 'Small': 0, 'Medium': 0,
      'Large': 1, 'Huge': 2, 'Gargantuan': 3
    }[monsterForm.size] || 0;

    movement += sizeBonus;

    // Fast trait bonus
    if (monsterForm.defenseSplit === 'Fast') {
      movement += 1;
    }

    return Math.max(1, movement); // Minimum 1 square per phase
  };

  const baseMovement = calculateMovement();

  // Get suggested tropes
  // Get suggested tropes based on nature and category
  const suggestedTropes = CREATURE_TROPES[monsterForm.nature]?.[monsterForm.category] || [];
  const allRacialArchetypes = Object.keys(RACIAL_ARCHETYPES);
  const allManifestations = Object.keys(METEREA_MANIFESTATIONS);

  // Generate formatted QSB string
  const generateQSBString = () => {
    const tdString = `Melee ${monsterForm.threatDice.melee}, Natural ${monsterForm.threatDice.natural}, Ranged ${monsterForm.threatDice.ranged}, Arcane ${monsterForm.threatDice.arcane}`;
    const eaString = monsterForm.extraAttacks ? monsterForm.extraAttacks : 'None';
    const hpString = `${finalHP} (${finalActiveHP}/${finalPassiveHP})`;
    const hpMultiplier = hpCalc.hp_multiplier.toFixed(1);
    const hpModifiers = `[${monsterForm.defenseSplit}, ${monsterForm.size}, ${monsterForm.nature}; x${hpMultiplier}]`;

    const movementString = `${baseMovement} sq/phase (Walk ×${MOVEMENT_MULTIPLIERS.Walk.normal}, Run ×${monsterForm.especiallySpeedy ? MOVEMENT_MULTIPLIERS.Run.speedy : MOVEMENT_MULTIPLIERS.Run.normal}, Sprint ×${monsterForm.especiallySpeedy ? MOVEMENT_MULTIPLIERS.Sprint.speedy : MOVEMENT_MULTIPLIERS.Sprint.normal}${monsterForm.especiallySpeedy ? ', Burst ×7' : ''})`;

    return `${monsterForm.name || '[Monster Name]'}
TY: ${monsterForm.category} | TD: ${tdString} | EA: ${eaString} | HP: ${hpString} ${hpModifiers} | DR: ${drDisplay} | ST: ${monsterForm.savingThrow} | BP: ${monsterForm.battlePhase} | Movement: ${movementString} | Notes: ${monsterForm.notes || 'None'}`;
  };

  const updateForm = (field: keyof MonsterForm, value: string | boolean) => {
    setMonsterForm(prev => ({ ...prev, [field]: value }));
  };

  const updateThreatDice = (type: keyof ThreatDice, value: string) => {
    setMonsterForm(prev => ({
      ...prev,
      threatDice: { ...prev.threatDice, [type]: value }
    }));
  };

  const autoGenerateStats = () => {
    const newBattlePhase = generateBattlePhase(calculatedCategory, monsterForm.nature);
    const newSavingThrow = generateSavingThrow(calculatedCategory, monsterForm.nature);

    setMonsterForm(prev => ({
      ...prev,
      battlePhase: newBattlePhase,
      savingThrow: newSavingThrow,
      category: calculatedCategory
    }));
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
        active_dp: finalActiveHP,
        passive_dp: finalPassiveHP,
        spirit_pts: Math.max(4, highestThreatMV / 2)
      },
      status: {
        current_hp_active: finalActiveHP,
        current_hp_passive: finalPassiveHP,
        status_flags: [],
        gear: [],
        notes: monsterForm.notes
      },
      tags: [monsterForm.category.toLowerCase(), monsterForm.nature.toLowerCase(), monsterForm.size.toLowerCase()],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    saveCharacter(character);
    alert(`Monster "${monsterForm.name}" saved successfully!`);
    setShowSaveDialog(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Eldritch RPG Monster Builder
        </h1>
        <p className="text-gray-600">
          Create complete Quick Stat Block (QSB) monsters based on Eldritch Rules 8.17.2025
        </p>
      </div>

      {/* Basic Information */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">I. Basic Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              {CREATURE_CATEGORIES.map(cat => (
                <option key={cat.name} value={cat.name}>
                  {cat.name} ({cat.description})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Size:</label>
            <select
              value={monsterForm.size}
              onChange={(e) => updateForm('size', e.target.value as CreatureSize)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              {SIZE_CATEGORIES.map(size => (
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
              {NATURE_CATEGORIES.map(nature => (
                <option key={nature} value={nature}>{nature}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Constitution:</label>
            <select
              value={monsterForm.defenseSplit}
              onChange={(e) => updateForm('defenseSplit', e.target.value as DefenseSplit)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              {CONSTITUTION_TYPES.map(type => (
                <option key={type.name} value={type.name}>
                  {type.name} ({type.description})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Semantic Design Section */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Creature Concept & Semantics</h3>
          <p className="text-sm text-blue-800 mb-4">
            The narrative concept guides classification and GM arbitration. Semantics override strict mechanics.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Creature Concept:</label>
              <input
                type="text"
                value={monsterForm.concept}
                onChange={(e) => updateForm('concept', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="e.g., Ancient forest guardian, Corrupted knight"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Suggested Tropes ({monsterForm.nature} {monsterForm.category}):</label>
              <select
                value={monsterForm.trope}
                onChange={(e) => updateForm('trope', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">Select a trope...</option>
                {suggestedTropes.map(trope => (
                  <option key={trope} value={trope}>{trope}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Ainerêve Classifications */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-semibold text-purple-700 mb-2">Meterea Manifestations</h4>
              <div className="space-y-1 text-xs">
                {Object.entries(METEREA_MANIFESTATIONS).map(([type, desc]) => (
                  <div key={type} className="bg-purple-50 p-2 rounded border border-purple-200">
                    <span className="font-medium text-purple-800">{type}:</span>
                    <p className="text-purple-600">{desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-blue-700 mb-2">Racial Archetypes</h4>
              <div className="space-y-1 text-xs">
                {Object.entries(RACIAL_ARCHETYPES).slice(0, 4).map(([race, desc]) => (
                  <div key={race} className="bg-blue-50 p-2 rounded border border-blue-200">
                    <span className="font-medium text-blue-800">{race}:</span>
                    <p className="text-blue-600">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Combat Statistics */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">II. Combat Statistics</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Threat Dice (TD):</label>
            <div className="space-y-2">
              <div>
                <label className="block text-xs text-gray-600">Melee:</label>
                <input
                  type="text"
                  value={monsterForm.threatDice.melee}
                  onChange={(e) => updateThreatDice('melee', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-1"
                  placeholder="e.g., d6, 2d8"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600">Natural:</label>
                <input
                  type="text"
                  value={monsterForm.threatDice.natural}
                  onChange={(e) => updateThreatDice('natural', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-1"
                  placeholder="e.g., d4, None"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600">Ranged:</label>
                <input
                  type="text"
                  value={monsterForm.threatDice.ranged}
                  onChange={(e) => updateThreatDice('ranged', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-1"
                  placeholder="e.g., d8, None"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600">Arcane:</label>
                <input
                  type="text"
                  value={monsterForm.threatDice.arcane}
                  onChange={(e) => updateThreatDice('arcane', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-1"
                  placeholder="e.g., d12, None"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Extra Attacks (EA):</label>
            <input
              type="text"
              value={monsterForm.extraAttacks}
              onChange={(e) => updateForm('extraAttacks', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="e.g., Bite follow-up d4, Tail sweep"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Armor Type:</label>
            <select
              value={monsterForm.armor}
              onChange={(e) => updateForm('armor', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              {ARMOR_TYPES.map(armor => (
                <option key={armor.name} value={armor.name}>
                  {armor.name} {armor.dr_die !== 'None' ? `(${armor.dr_die} or +${armor.hp_bonus} HP)` : '(+0 HP)'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Shield Type:</label>
            <select
              value={monsterForm.shield}
              onChange={(e) => updateForm('shield', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              {SHIELD_TYPES.map(shield => (
                <option key={shield.name} value={shield.name}>
                  {shield.name} {shield.threat_reduction > 0 ? `(-${shield.threat_reduction} Threat)` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Saving Throw (ST):</label>
            <input
              type="text"
              value={monsterForm.savingThrow}
              onChange={(e) => updateForm('savingThrow', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="e.g., d6, d8"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Battle Phase (BP):</label>
            <input
              type="text"
              value={monsterForm.battlePhase}
              onChange={(e) => updateForm('battlePhase', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="e.g., d6, d8"
            />
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={autoGenerateStats}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-4"
          >
            Auto-Generate ST & BP
          </button>
        </div>

        {/* Tactical Movement Section */}
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="text-lg font-semibold text-green-900 mb-3">Tactical Movement (5-foot squares)</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Speed Focus:</label>
              <select
                value={monsterForm.speedFocus}
                onChange={(e) => updateForm('speedFocus', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="None">None</option>
                <option value="d4">d4-d6 (+1 sq/phase)</option>
                <option value="d8">d8-d10 (+2 sq/phase)</option>
                <option value="d12">d12+ (+3 sq/phase)</option>
              </select>
            </div>

            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={monsterForm.especiallySpeedy}
                  onChange={(e) => updateForm('especiallySpeedy', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Especially Speedy</span>
              </label>
            </div>

            <div className="bg-white p-3 rounded border">
              <p className="text-sm font-semibold text-gray-700">Base Movement: {baseMovement} sq/phase</p>
              <p className="text-xs text-gray-600">Formula: (12 + BP MV) ÷ 5 + modifiers</p>
            </div>
          </div>

          {/* Movement Action Table */}
          <div className="mt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Movement Action Multipliers:</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 px-2 py-1">Action</th>
                    <th className="border border-gray-300 px-2 py-1">Normal</th>
                    <th className="border border-gray-300 px-2 py-1">Especially Speedy</th>
                    <th className="border border-gray-300 px-2 py-1">Squares</th>
                    <th className="border border-gray-300 px-2 py-1">Penalty/Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(MOVEMENT_MULTIPLIERS).map(([action, data]) => (
                    <tr key={action}>
                      <td className="border border-gray-300 px-2 py-1 font-medium">{action}</td>
                      <td className="border border-gray-300 px-2 py-1 text-center">
                        {data.normal > 0 ? `×${data.normal}` : 'N/A'}
                      </td>
                      <td className="border border-gray-300 px-2 py-1 text-center">
                        {data.speedy > 0 ? `×${data.speedy}` : 'N/A'}
                      </td>
                      <td className="border border-gray-300 px-2 py-1 text-center">
                        {data.normal > 0 ? (
                          monsterForm.especiallySpeedy ?
                            `${baseMovement * data.speedy}` :
                            `${baseMovement * data.normal}`
                        ) : (
                          monsterForm.especiallySpeedy && data.speedy > 0 ?
                            `${baseMovement * data.speedy}` : 'N/A'
                        )}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">{data.penalty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">III. Notes</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Special Abilities, Treasure, etc.:</label>
          <textarea
            value={monsterForm.notes}
            onChange={(e) => updateForm('notes', e.target.value)}
            rows={4}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            placeholder="Describe special abilities, tactics, treasure, or other notes..."
          />
        </div>
      </div>

      {/* Generated QSB */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">Generated Quick Stat Block (QSB)</h2>

        {/* HP Calculation Display */}
        <div className="mb-4 p-4 bg-gray-50 rounded">
          <h3 className="font-semibold mb-2">HP Calculation:</h3>
          <div className="text-sm space-y-1">
            <p>Base HP: {hpCalc.base_hp} (highest threat MV: {highestThreatMV})</p>
            <p>Size Modifier: +{hpCalc.size_modifier} | Nature Modifier: +{hpCalc.nature_modifier}</p>
            <p>HP Multiplier: {hpCalc.hp_multiplier.toFixed(2)} = (Size + Nature) ÷ 2</p>
            <p>Base Total: {hpCalc.final_hp} = {hpCalc.base_hp} × {hpCalc.hp_multiplier.toFixed(2)}</p>
            <p>Armor Bonus: +{selectedArmor.hp_bonus}</p>
            <p><strong>Final HP: {finalHP} ({finalActiveHP} Active / {finalPassiveHP} Passive)</strong></p>
          </div>
        </div>

        {/* Semantic Validation */}
        {monsterForm.concept && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <h3 className="font-semibold text-yellow-800 mb-2">Concept Validation:</h3>
            <p className="text-sm text-yellow-700">
              <strong>Concept:</strong> {monsterForm.concept}
            </p>
            {monsterForm.trope && (
              <p className="text-sm text-yellow-700">
                <strong>Trope:</strong> {monsterForm.trope}
              </p>
            )}
            <p className="text-xs text-yellow-600 mt-2">
              Remember: Narrative concept should guide classification and abilities.
              GM may override mechanical calculations if they don&apos;t fit the creature&apos;s essential nature.
            </p>
          </div>
        )}

        <div className="bg-black text-green-400 p-4 rounded font-mono text-sm whitespace-pre-wrap">
          {generateQSBString()}
        </div>

        {/* Movement Summary */}
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
          <h4 className="font-semibold text-green-800 mb-2">Tactical Movement Summary</h4>
          <div className="text-sm text-green-700 space-y-1">
            <p><strong>Base Movement:</strong> {baseMovement} squares per phase</p>
            <p><strong>Walk:</strong> {baseMovement} sq ({baseMovement * 5}ft)</p>
            <p><strong>Run:</strong> {baseMovement * (monsterForm.especiallySpeedy ? MOVEMENT_MULTIPLIERS.Run.speedy : MOVEMENT_MULTIPLIERS.Run.normal)} sq ({baseMovement * (monsterForm.especiallySpeedy ? MOVEMENT_MULTIPLIERS.Run.speedy : MOVEMENT_MULTIPLIERS.Run.normal) * 5}ft) - {MOVEMENT_MULTIPLIERS.Run.penalty}</p>
            <p><strong>Sprint:</strong> {baseMovement * (monsterForm.especiallySpeedy ? MOVEMENT_MULTIPLIERS.Sprint.speedy : MOVEMENT_MULTIPLIERS.Sprint.normal)} sq ({baseMovement * (monsterForm.especiallySpeedy ? MOVEMENT_MULTIPLIERS.Sprint.speedy : MOVEMENT_MULTIPLIERS.Sprint.normal) * 5}ft) - {MOVEMENT_MULTIPLIERS.Sprint.penalty}</p>
            {monsterForm.especiallySpeedy && (
              <p><strong>Burst:</strong> {baseMovement * MOVEMENT_MULTIPLIERS.Burst.speedy} sq ({baseMovement * MOVEMENT_MULTIPLIERS.Burst.speedy * 5}ft) - {MOVEMENT_MULTIPLIERS.Burst.penalty}</p>
            )}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="text-center">
        <button
          onClick={() => setShowSaveDialog(true)}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg"
        >
          Save to Monster Roster
        </button>
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Save Monster</h3>

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
                Save Monster
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
    </div>
  );
}