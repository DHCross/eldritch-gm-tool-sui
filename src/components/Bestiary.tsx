'use client';

import { useState, useMemo } from 'react';
import { CreatureCategory, CreatureNature, CreatureSize } from '../types/party';

interface BestiaryCreature {
  id: string;
  name: string;
  category: CreatureCategory;
  nature: CreatureNature;
  size: CreatureSize;
  threatDice: {
    melee?: string;
    natural?: string;
    ranged?: string;
    arcane?: string;
  };
  threatMV: number;
  hp: string;
  dr: string;
  savingThrow: string;
  battlePhase: string;
  extraAttacks?: string;
  specialAbilities?: string[];
  description: string;
  source: 'QSB' | 'Bestiary' | 'Trope' | 'Summoned';
  tags: string[];
}

// Comprehensive creature database from "Beings Diverse and Malign"
const BESTIARY_CREATURES: BestiaryCreature[] = [
  // QSB Examples & Named Adversaries
  {
    id: 'bandit',
    name: 'Bandit',
    category: 'Standard',
    nature: 'Mundane',
    size: 'Medium',
    threatDice: { melee: '2d6', ranged: '2d4' },
    threatMV: 12,
    hp: '18 (9/9)',
    dr: 'Leather (d6)',
    savingThrow: 'd6',
    battlePhase: 'd6',
    description: 'Highway robbers and cutthroats who prey on travelers.',
    source: 'QSB',
    tags: ['humanoid', 'criminal', 'mundane']
  },
  {
    id: 'bear',
    name: 'Bear',
    category: 'Exceptional',
    nature: 'Mundane',
    size: 'Large',
    threatDice: { natural: '3d8' },
    threatMV: 24,
    hp: '48 (24/24)',
    dr: 'Thick Hide (+4 HP)',
    savingThrow: 'd8',
    battlePhase: 'd8',
    description: 'Massive forest predators with crushing strength and fierce territorial instincts.',
    source: 'QSB',
    tags: ['beast', 'predator', 'forest']
  },
  {
    id: 'chimera',
    name: 'Chimera',
    category: 'Legendary',
    nature: 'Magical',
    size: 'Large',
    threatDice: { melee: '2d10', natural: '2d8' },
    threatMV: 20,
    hp: '80 (20/60)',
    dr: 'Thick Hide (+6 HP)',
    savingThrow: 'd12',
    battlePhase: 'd12',
    extraAttacks: 'Breath Weapon (2d6 fire), Venomous Fumes (d10)',
    specialAbilities: ['Fire Breath', 'Poison Gas', 'Flight'],
    description: 'A monstrous hybrid with the body of a lion, wings of an eagle, and tail of a serpent.',
    source: 'QSB',
    tags: ['magical', 'hybrid', 'fire', 'poison']
  },
  {
    id: 'demon',
    name: 'Demon',
    category: 'Legendary',
    nature: 'Supernatural',
    size: 'Large',
    threatDice: { melee: '3d16', natural: '2d18', arcane: '2d12' },
    threatMV: 48,
    hp: '120 (30/90)',
    dr: 'Supernatural Hide (d12)',
    savingThrow: 'd20',
    battlePhase: 'd16',
    extraAttacks: 'Fear Aura (opposed roll), Hellfire (3d6)',
    specialAbilities: ['Fear Aura', 'Hellfire', 'Teleportation', 'Damage Resistance'],
    description: 'Malevolent entities from the infernal planes, bent on corruption and destruction.',
    source: 'QSB',
    tags: ['fiend', 'evil', 'fire', 'fear']
  },
  {
    id: 'dire-wolf',
    name: 'Dire Wolf',
    category: 'Minor',
    nature: 'Mundane',
    size: 'Medium',
    threatDice: { melee: 'd8' },
    threatMV: 8,
    hp: '10 (5/5)',
    dr: 'Thick Fur (+2 HP)',
    savingThrow: 'd4',
    battlePhase: 'd4',
    extraAttacks: 'Pack Tactics (advantage when flanking)',
    specialAbilities: ['Pack Tactics', 'Keen Scent'],
    description: 'Large wolves with supernatural cunning and pack coordination.',
    source: 'QSB',
    tags: ['beast', 'pack', 'forest']
  },
  {
    id: 'vampire-lord',
    name: 'Vampire Lord',
    category: 'Legendary',
    nature: 'Preternatural',
    size: 'Medium',
    threatDice: { natural: '3d12', melee: '3d10' },
    threatMV: 36,
    hp: '108 (27/81)',
    dr: 'Supernatural Resilience (d10)',
    savingThrow: 'd16',
    battlePhase: 'd14',
    extraAttacks: 'Charm (opposed roll), Blood Drain, Dominate',
    specialAbilities: ['Charm', 'Blood Drain', 'Shapeshifting', 'Regeneration', 'Undead Immunities'],
    description: 'Ancient undead noble with vast supernatural powers and centuries of cunning.',
    source: 'QSB',
    tags: ['undead', 'noble', 'charm', 'blood']
  },

  // Bestiary Entries
  {
    id: 'basilisk',
    name: 'Basilisk',
    category: 'Exceptional',
    nature: 'Magical',
    size: 'Large',
    threatDice: { natural: '3d8', arcane: '2d10' },
    threatMV: 24,
    hp: '72 (18/54)',
    dr: 'Armored Scales (d8)',
    savingThrow: 'd10',
    battlePhase: 'd10',
    extraAttacks: 'Petrifying Gaze (opposed roll)',
    specialAbilities: ['Petrifying Gaze', 'Poison Bite', 'Magic Resistance'],
    description: 'A serpentine creature whose gaze turns living beings to stone.',
    source: 'Bestiary',
    tags: ['serpent', 'petrification', 'poison', 'magical']
  },
  {
    id: 'dragon',
    name: 'Dragon',
    category: 'Legendary',
    nature: 'Magical',
    size: 'Gargantuan',
    threatDice: { melee: '3d12', natural: '3d12', arcane: '3d10' },
    threatMV: 36,
    hp: '180 (45/135)',
    dr: 'Dragon Scales (d12)',
    savingThrow: 'd20',
    battlePhase: 'd16',
    extraAttacks: 'Breath Weapon (varies), Wing Buffet (2d8), Tail Sweep (2d10)',
    specialAbilities: ['Breath Weapon', 'Flight', 'Spell Casting', 'Frightful Presence', 'Legendary Actions'],
    description: 'Ancient wyrms of immense power, intelligence, and magical might.',
    source: 'Bestiary',
    tags: ['dragon', 'ancient', 'magic', 'flight', 'breath-weapon']
  },
  {
    id: 'lich',
    name: 'Lich',
    category: 'Legendary',
    nature: 'Preternatural',
    size: 'Medium',
    threatDice: { arcane: '3d12', melee: '2d8' },
    threatMV: 36,
    hp: '108 (27/81)',
    dr: 'Undead Resilience (d10)',
    savingThrow: 'd16',
    battlePhase: 'd12',
    extraAttacks: 'Paralyzing Touch, Fear Aura, Spell Casting',
    specialAbilities: ['Undead Immunities', 'Spell Casting', 'Phylactery', 'Paralyzing Touch', 'Legendary Resistance'],
    description: 'Undead spellcasters of terrible power who have achieved immortality through dark magic.',
    source: 'Bestiary',
    tags: ['undead', 'spellcaster', 'lich', 'paralysis', 'immortal']
  },

  // Creature Tropes - Mundane
  {
    id: 'villager',
    name: 'Villager',
    category: 'Minor',
    nature: 'Mundane',
    size: 'Medium',
    threatDice: { melee: 'd4' },
    threatMV: 4,
    hp: '6 (3/3)',
    dr: 'None',
    savingThrow: 'd4',
    battlePhase: 'd4',
    description: 'Common folk with little combat training.',
    source: 'Trope',
    tags: ['humanoid', 'commoner', 'noncombatant']
  },
  {
    id: 'veteran-warrior',
    name: 'Veteran Warrior',
    category: 'Exceptional',
    nature: 'Mundane',
    size: 'Medium',
    threatDice: { melee: '3d8' },
    threatMV: 24,
    hp: '36 (18/18)',
    dr: 'Chain Mail (d8)',
    savingThrow: 'd8',
    battlePhase: 'd8',
    extraAttacks: 'Shield Bash (d6), Weapon Master techniques',
    specialAbilities: ['Combat Veteran', 'Weapon Mastery', 'Tactical Knowledge'],
    description: 'Seasoned fighters with years of battlefield experience.',
    source: 'Trope',
    tags: ['humanoid', 'warrior', 'veteran', 'tactical']
  },

  // Creature Tropes - Magical
  {
    id: 'pixie',
    name: 'Pixie',
    category: 'Minor',
    nature: 'Magical',
    size: 'Tiny',
    threatDice: { arcane: 'd6' },
    threatMV: 6,
    hp: '6 (3/3)',
    dr: 'Fey Magic Resistance (+2)',
    savingThrow: 'd6',
    battlePhase: 'd8',
    extraAttacks: 'Fairy Dust (sleep), Invisibility',
    specialAbilities: ['Flight', 'Invisibility', 'Fairy Magic', 'Sleep Dust'],
    description: 'Tiny fey creatures with mischievous nature and minor magical abilities.',
    source: 'Trope',
    tags: ['fey', 'tiny', 'magic', 'invisibility', 'flight']
  },
  {
    id: 'archmage',
    name: 'Archmage',
    category: 'Legendary',
    nature: 'Magical',
    size: 'Medium',
    threatDice: { arcane: '3d12' },
    threatMV: 36,
    hp: '72 (18/54)',
    dr: 'Magical Wards (d8)',
    savingThrow: 'd14',
    battlePhase: 'd10',
    extraAttacks: 'Spell Casting, Teleportation, Counterspell',
    specialAbilities: ['Master Spellcaster', 'Spell Resistance', 'Teleportation', 'Legendary Actions'],
    description: 'Masters of arcane magic with access to the most powerful spells.',
    source: 'Trope',
    tags: ['humanoid', 'spellcaster', 'arcane', 'legendary', 'teleport']
  },

  // Creature Tropes - Preternatural
  {
    id: 'zombie',
    name: 'Zombie',
    category: 'Minor',
    nature: 'Preternatural',
    size: 'Medium',
    threatDice: { natural: 'd6' },
    threatMV: 6,
    hp: '12 (3/9)',
    dr: 'Undead Resilience (+2)',
    savingThrow: 'd4',
    battlePhase: 'd4',
    specialAbilities: ['Undead Immunities', 'Slow Movement', 'Disease Bite'],
    description: 'Reanimated corpses driven by dark magic to consume the living.',
    source: 'Trope',
    tags: ['undead', 'slow', 'disease', 'mindless']
  },

  // Creature Tropes - Supernatural
  {
    id: 'angel',
    name: 'Angel',
    category: 'Legendary',
    nature: 'Supernatural',
    size: 'Large',
    threatDice: { melee: '3d10', arcane: '3d8' },
    threatMV: 30,
    hp: '120 (30/90)',
    dr: 'Divine Protection (d12)',
    savingThrow: 'd16',
    battlePhase: 'd12',
    extraAttacks: 'Divine Radiance, Healing Touch, Command',
    specialAbilities: ['Flight', 'Divine Magic', 'Healing', 'Radiant Damage', 'Fear Immunity'],
    description: 'Celestial beings of pure divine essence and unwavering righteousness.',
    source: 'Trope',
    tags: ['celestial', 'divine', 'flight', 'healing', 'radiant']
  }
];

// Encounter Difficulty Table
const ENCOUNTER_DIFFICULTY_TABLE = {
  1: {
    'Practitioner': { easy: 7, moderate: 10, difficult: 12, demanding: 14, formidable: 16, deadly: 18 },
    'Competent': { easy: 14, moderate: 20, difficult: 24, demanding: 28, formidable: 32, deadly: 36 },
    'Proficient': { easy: 21, moderate: 29, difficult: 36, demanding: 42, formidable: 48, deadly: 55 },
    'Advanced': { easy: 28, moderate: 39, difficult: 48, demanding: 56, formidable: 64, deadly: 73 },
    'Elite': { easy: 35, moderate: 49, difficult: 60, demanding: 70, formidable: 80, deadly: 110 }
  },
  2: {
    'Practitioner': { easy: 14, moderate: 20, difficult: 24, demanding: 28, formidable: 32, deadly: 36 },
    'Competent': { easy: 28, moderate: 39, difficult: 48, demanding: 56, formidable: 64, deadly: 73 },
    'Proficient': { easy: 42, moderate: 59, difficult: 72, demanding: 84, formidable: 96, deadly: 108 },
    'Advanced': { easy: 56, moderate: 77, difficult: 96, demanding: 112, formidable: 128, deadly: 144 },
    'Elite': { easy: 70, moderate: 95, difficult: 120, demanding: 140, formidable: 160, deadly: 190 }
  },
  3: {
    'Practitioner': { easy: 21, moderate: 30, difficult: 36, demanding: 42, formidable: 48, deadly: 54 },
    'Competent': { easy: 42, moderate: 59, difficult: 72, demanding: 84, formidable: 96, deadly: 108 },
    'Proficient': { easy: 63, moderate: 84, difficult: 108, demanding: 126, formidable: 144, deadly: 162 },
    'Advanced': { easy: 84, moderate: 111, difficult: 144, demanding: 168, formidable: 192, deadly: 216 },
    'Elite': { easy: 105, moderate: 140, difficult: 180, demanding: 210, formidable: 240, deadly: 270 }
  },
  4: {
    'Practitioner': { easy: 28, moderate: 42, difficult: 50, demanding: 56, formidable: 64, deadly: 72 },
    'Competent': { easy: 56, moderate: 77, difficult: 96, demanding: 112, formidable: 128, deadly: 144 },
    'Proficient': { easy: 84, moderate: 111, difficult: 144, demanding: 168, formidable: 192, deadly: 216 },
    'Advanced': { easy: 112, moderate: 147, difficult: 180, demanding: 224, formidable: 256, deadly: 288 },
    'Elite': { easy: 140, moderate: 185, difficult: 228, demanding: 280, formidable: 320, deadly: 360 }
  }
};

type DefenseLevel = 'Practitioner' | 'Competent' | 'Proficient' | 'Advanced' | 'Elite';
type Difficulty = 'easy' | 'moderate' | 'difficult' | 'demanding' | 'formidable' | 'deadly';

export default function Bestiary() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CreatureCategory | 'All'>('All');
  const [selectedNature, setSelectedNature] = useState<CreatureNature | 'All'>('All');
  const [selectedSource, setSelectedSource] = useState<string>('All');
  const [selectedCreature, setSelectedCreature] = useState<BestiaryCreature | null>(null);
  const [showEncounterBuilder, setShowEncounterBuilder] = useState(false);

  // Encounter Builder State
  const [partySize, setPartySize] = useState(4);
  const [defenseLevel, setDefenseLevel] = useState<DefenseLevel>('Competent');
  const [difficulty, setDifficulty] = useState<Difficulty>('moderate');
  const [encounterCreatures, setEncounterCreatures] = useState<BestiaryCreature[]>([]);

  // Filtered creatures
  const filteredCreatures = useMemo(() => {
    return BESTIARY_CREATURES.filter(creature => {
      const matchesSearch = creature.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           creature.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           creature.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory = selectedCategory === 'All' || creature.category === selectedCategory;
      const matchesNature = selectedNature === 'All' || creature.nature === selectedNature;
      const matchesSource = selectedSource === 'All' || creature.source === selectedSource;

      return matchesSearch && matchesCategory && matchesNature && matchesSource;
    });
  }, [searchTerm, selectedCategory, selectedNature, selectedSource]);

  // Calculate threat budget
  const threatBudget = useMemo(() => {
    const sizeData = ENCOUNTER_DIFFICULTY_TABLE[partySize as keyof typeof ENCOUNTER_DIFFICULTY_TABLE];
    if (!sizeData) return 0;
    const levelData = sizeData[defenseLevel];
    return levelData[difficulty];
  }, [partySize, defenseLevel, difficulty]);

  // Calculate current encounter threat
  const currentThreat = useMemo(() => {
    return encounterCreatures.reduce((total, creature) => total + creature.threatMV, 0);
  }, [encounterCreatures]);

  const addToEncounter = (creature: BestiaryCreature) => {
    if (currentThreat + creature.threatMV <= threatBudget * 1.2) { // Allow 20% overage
      setEncounterCreatures(prev => [...prev, creature]);
    }
  };

  const removeFromEncounter = (index: number) => {
    setEncounterCreatures(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Beings Diverse and Malign
        </h1>
        <p className="text-gray-600 mb-4">
          The Eldritch RPG Bestiary - A comprehensive guide to creatures, monsters, and adversaries
        </p>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
          <p className="font-semibold">⚠️ Warning: Dangerous Knowledge</p>
          <p>This information is considered not safe to know and is normally kept locked and chained in the archives of the Octocirculi Academy.</p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-wrap gap-4 items-center justify-between mb-4">
          <div className="flex-1 min-w-64">
            <input
              type="text"
              placeholder="Search creatures, abilities, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as CreatureCategory | 'All')}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="All">All Categories</option>
              <option value="Minor">Minor</option>
              <option value="Standard">Standard</option>
              <option value="Exceptional">Exceptional</option>
              <option value="Legendary">Legendary</option>
            </select>

            <select
              value={selectedNature}
              onChange={(e) => setSelectedNature(e.target.value as CreatureNature | 'All')}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="All">All Natures</option>
              <option value="Mundane">Mundane</option>
              <option value="Magical">Magical</option>
              <option value="Preternatural">Preternatural</option>
              <option value="Supernatural">Supernatural</option>
            </select>

            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="All">All Sources</option>
              <option value="QSB">QSB Examples</option>
              <option value="Bestiary">Bestiary Entries</option>
              <option value="Trope">Creature Tropes</option>
              <option value="Summoned">Summoned</option>
            </select>
          </div>

          <button
            onClick={() => setShowEncounterBuilder(!showEncounterBuilder)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
          >
            {showEncounterBuilder ? 'Hide' : 'Show'} Encounter Builder
          </button>
        </div>

        {/* Encounter Builder */}
        {showEncounterBuilder && (
          <div className="border-t pt-4 bg-purple-50 -m-6 mt-4 p-6 rounded-b-lg">
            <h3 className="text-lg font-bold mb-4">Encounter Builder</h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Party Size:</label>
                <select
                  value={partySize}
                  onChange={(e) => setPartySize(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value={1}>1 PC</option>
                  <option value={2}>2 PCs</option>
                  <option value={3}>3 PCs</option>
                  <option value={4}>4 PCs</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Defense Level:</label>
                <select
                  value={defenseLevel}
                  onChange={(e) => setDefenseLevel(e.target.value as DefenseLevel)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="Practitioner">Practitioner</option>
                  <option value="Competent">Competent</option>
                  <option value="Proficient">Proficient</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Elite">Elite</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty:</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="easy">Easy</option>
                  <option value="moderate">Moderate</option>
                  <option value="difficult">Difficult</option>
                  <option value="demanding">Demanding</option>
                  <option value="formidable">Formidable</option>
                  <option value="deadly">Deadly</option>
                </select>
              </div>

              <div className="bg-white p-3 rounded border">
                <p className="text-sm font-semibold text-gray-700">Threat Budget: {threatBudget}</p>
                <p className="text-sm text-gray-600">Current: {currentThreat}</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: `${Math.min(100, (currentThreat / threatBudget) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Current Encounter */}
            {encounterCreatures.length > 0 && (
              <div className="bg-white p-4 rounded border mb-4">
                <h4 className="font-semibold mb-2">Current Encounter:</h4>
                <div className="space-y-2">
                  {encounterCreatures.map((creature, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm">
                        {creature.name} ({creature.category}) - Threat MV: {creature.threatMV}
                      </span>
                      <button
                        onClick={() => removeFromEncounter(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Creature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCreatures.map((creature) => (
          <div key={creature.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-bold text-gray-900">{creature.name}</h3>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                creature.category === 'Minor' ? 'bg-green-100 text-green-800' :
                creature.category === 'Standard' ? 'bg-blue-100 text-blue-800' :
                creature.category === 'Exceptional' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {creature.category}
              </span>
            </div>

            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <p><strong>Nature:</strong> {creature.nature}</p>
              <p><strong>Size:</strong> {creature.size}</p>
              <p><strong>Threat MV:</strong> {creature.threatMV}</p>
              <p><strong>HP:</strong> {creature.hp}</p>
              <p><strong>Source:</strong> {creature.source}</p>
            </div>

            <p className="text-sm text-gray-700 mb-4">{creature.description}</p>

            <div className="flex flex-wrap gap-1 mb-4">
              {creature.tags.map((tag) => (
                <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSelectedCreature(creature)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded text-sm"
              >
                View Details
              </button>
              {showEncounterBuilder && (
                <button
                  onClick={() => addToEncounter(creature)}
                  disabled={currentThreat + creature.threatMV > threatBudget * 1.2}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-bold py-2 px-3 rounded text-sm"
                >
                  Add
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Creature Detail Modal */}
      {selectedCreature && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">{selectedCreature.name}</h2>
              <button
                onClick={() => setSelectedCreature(null)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>

            {/* Full QSB Display */}
            <div className="bg-black text-green-400 p-4 rounded font-mono text-sm mb-4">
              {selectedCreature.name}<br/>
              TY: {selectedCreature.category} |
              TD: {Object.entries(selectedCreature.threatDice).map(([type, dice]) =>
                dice ? `${type.charAt(0).toUpperCase() + type.slice(1)} ${dice}` : null
              ).filter(Boolean).join(', ')} |
              {selectedCreature.extraAttacks && `EA: ${selectedCreature.extraAttacks} | `}
              HP: {selectedCreature.hp} [{selectedCreature.nature}, {selectedCreature.size}] |
              DR: {selectedCreature.dr} |
              ST: {selectedCreature.savingThrow} |
              BP: {selectedCreature.battlePhase}
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700">{selectedCreature.description}</p>
              </div>

              {selectedCreature.specialAbilities && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Special Abilities</h3>
                  <ul className="list-disc pl-5 text-gray-700">
                    {selectedCreature.specialAbilities.map((ability, index) => (
                      <li key={index}>{ability}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Combat Statistics</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Category:</strong> {selectedCreature.category}</p>
                    <p><strong>Nature:</strong> {selectedCreature.nature}</p>
                    <p><strong>Size:</strong> {selectedCreature.size}</p>
                    <p><strong>Threat MV:</strong> {selectedCreature.threatMV}</p>
                  </div>
                  <div>
                    <p><strong>Hit Points:</strong> {selectedCreature.hp}</p>
                    <p><strong>Damage Reduction:</strong> {selectedCreature.dr}</p>
                    <p><strong>Saving Throw:</strong> {selectedCreature.savingThrow}</p>
                    <p><strong>Battle Phase:</strong> {selectedCreature.battlePhase}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {selectedCreature.tags.map((tag) => (
                  <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold mb-4">Bestiary Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-blue-600">{BESTIARY_CREATURES.length}</p>
            <p className="text-sm text-gray-600">Total Creatures</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">
              {BESTIARY_CREATURES.filter(c => c.source === 'Bestiary').length}
            </p>
            <p className="text-sm text-gray-600">Bestiary Entries</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-yellow-600">
              {BESTIARY_CREATURES.filter(c => c.category === 'Legendary').length}
            </p>
            <p className="text-sm text-gray-600">Legendary Beings</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-600">
              {BESTIARY_CREATURES.filter(c => c.nature === 'Supernatural').length}
            </p>
            <p className="text-sm text-gray-600">Supernatural Entities</p>
          </div>
        </div>
      </div>
    </div>
  );
}