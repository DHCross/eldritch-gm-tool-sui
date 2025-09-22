'use client';

import { useState } from 'react';
import {
  Monster,
  MonsterCategory,
  CreatureTrope,
  threatDiceByCategory,
  tropeConfig
} from '../data/monsterData';
import {
  generateMonster,
  exportMonsterToMarkdown,
  validateMonsterSettings
} from '../utils/monsterUtils';

export default function MonsterGenerator() {
  const [monster, setMonster] = useState<Monster | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<MonsterCategory[]>(['Minor', 'Standard', 'Exceptional', 'Legendary']);
  const [selectedTropes, setSelectedTropes] = useState<CreatureTrope[]>(['Human', 'Goblinoid', 'Beast', 'Undead']);
  const [nonMediumPercentage, setNonMediumPercentage] = useState(10);
  const [nonMundanePercentage, setNonMundanePercentage] = useState(20);
  const [specialTypePercentage, setSpecialTypePercentage] = useState(30);
  const [warnings, setWarnings] = useState<string[]>([]);

  const handleGenerateMonster = () => {
    const settings = {
      categories: selectedCategories,
      tropes: selectedTropes,
      nonMediumPercentage,
      nonMundanePercentage,
      specialTypePercentage
    };

    const validationWarnings = validateMonsterSettings(settings);
    setWarnings(validationWarnings);

    if (validationWarnings.length === 0) {
      const newMonster = generateMonster(
        selectedCategories,
        selectedTropes,
        nonMediumPercentage,
        nonMundanePercentage,
        specialTypePercentage
      );
      setMonster(newMonster);
    }
  };

  const handleExportToMarkdown = () => {
    if (monster) {
      const markdown = exportMonsterToMarkdown(monster);
      navigator.clipboard.writeText(markdown);
      alert('Monster stat block copied to clipboard!');
    }
  };

  const handleCategoryToggle = (category: MonsterCategory) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleTropeToggle = (trope: CreatureTrope) => {
    setSelectedTropes(prev =>
      prev.includes(trope)
        ? prev.filter(t => t !== trope)
        : [...prev, trope]
    );
  };

  const categories: MonsterCategory[] = ['Minor', 'Standard', 'Exceptional', 'Legendary'];
  const tropes: CreatureTrope[] = ['Human', 'Goblinoid', 'Beast', 'Undead', 'Construct', 'Elemental', 'Aberration', 'Fey', 'Dragon', 'Ooze', 'Demon'];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Monster Generator
        </h1>
        <p className="text-gray-600">
          Generate balanced creatures for Eldritch RPG 2nd Edition
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={handleGenerateMonster}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            Generate Monster
          </button>
          {monster && (
            <button
              onClick={handleExportToMarkdown}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              Export to Markdown
            </button>
          )}
        </div>

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="font-bold text-red-800 mb-2">Configuration Issues:</h3>
            <ul className="list-disc list-inside text-red-700">
              {warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Categories */}
          <div>
            <h3 className="text-lg font-bold mb-3">Monster Categories</h3>
            <div className="space-y-2">
              {categories.map(category => (
                <label key={category} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category)}
                    onChange={() => handleCategoryToggle(category)}
                    className="mr-2"
                  />
                  <span className="flex-1">{category}</span>
                  <span className="text-sm text-gray-500 ml-2">
                    ({threatDiceByCategory[category].join(', ')})
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Tropes */}
          <div>
            <h3 className="text-lg font-bold mb-3">Creature Tropes</h3>
            <div className="space-y-2">
              {tropes.map(trope => (
                <label key={trope} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedTropes.includes(trope)}
                    onChange={() => handleTropeToggle(trope)}
                    className="mr-2"
                  />
                  <span>{trope}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Generation Settings */}
        <div className="mt-6 pt-6 border-t">
          <h3 className="text-lg font-bold mb-4">Generation Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Non-Medium Size %
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={nonMediumPercentage}
                onChange={(e) => setNonMediumPercentage(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="text-center text-sm text-gray-600">{nonMediumPercentage}%</div>
              <p className="text-xs text-gray-500 mt-1">
                Chance for creatures to be sizes other than Medium
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Non-Mundane Nature %
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={nonMundanePercentage}
                onChange={(e) => setNonMundanePercentage(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="text-center text-sm text-gray-600">{nonMundanePercentage}%</div>
              <p className="text-xs text-gray-500 mt-1">
                Chance for magical/supernatural natures
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Special Type %
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={specialTypePercentage}
                onChange={(e) => setSpecialTypePercentage(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="text-center text-sm text-gray-600">{specialTypePercentage}%</div>
              <p className="text-xs text-gray-500 mt-1">
                Chance for Fast/Tough creature types
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Monster Display */}
      {monster && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{monster.name}</h2>
            <div className="text-lg text-gray-600">
              {monster.size} {monster.trope} {monster.category}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {monster.nature} • {monster.creatureType}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Core Stats */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-bold text-gray-900 mb-3">Core Stats</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Threat Dice:</span>
                  <span className="font-medium">{monster.threatDice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Threat MV:</span>
                  <span className="font-medium">{monster.threatMV}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">HP Multiplier:</span>
                  <span className="font-medium">{monster.multiplier}x</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Battle Phase:</span>
                  <span className="font-medium">{monster.battlePhase}</span>
                </div>
              </div>
            </div>

            {/* Combat Stats */}
            <div className="bg-red-50 rounded-lg p-4">
              <h3 className="font-bold text-gray-900 mb-3">Combat Stats</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Hit Points:</span>
                  <span className="font-bold text-red-600">{monster.hitPoints}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Defense:</span>
                  <span className="font-medium">{monster.activeDefense}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Passive Defense:</span>
                  <span className="font-medium">{monster.passiveDefense}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Saving Throw:</span>
                  <span className="font-medium">{monster.savingThrow}</span>
                </div>
              </div>
            </div>

            {/* Physical Traits */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-bold text-gray-900 mb-3">Physical Traits</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Armor:</span>
                  <span className="font-medium">
                    {monster.armorType}
                    {monster.armorBonus > 0 && ` (+${monster.armorBonus})`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Weapon Reach:</span>
                  <span className="font-medium">{monster.weaponReach}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Prowess Die:</span>
                  <span className="font-medium">d{monster.prowessDie}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Creature Type Effects */}
          {monster.creatureType !== 'Normal' && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-bold text-yellow-800 mb-2">
                {monster.creatureType} Creature Effects:
              </h3>
              <p className="text-yellow-700">
                {monster.creatureType === 'Fast' &&
                  'This creature emphasizes Active Defense Pool (75% of total HP) for evasion and mobility.'}
                {monster.creatureType === 'Tough' &&
                  'This creature emphasizes Passive Defense Pool (75% of total HP) for durability and resilience.'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}