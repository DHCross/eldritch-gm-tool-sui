'use client';

import { useState } from 'react';
import {
  Character,
  DieRank,
  dieRanks,
  abilities,
  specialties,
  races,
  classes,
  magicPaths,
  buildPhilosophies,
  levelProgression
} from '../data/gameData';
import {
  createEmptyCharacter,
  generateRandomCharacter,
  generateRandomName,
  validateCharacterBuild,
  calculateCharacterCPSpent,
  updateDerivedStats,
  getNextDieRank,
  getPreviousDieRank,
  calculateCPCost
} from '../utils/characterUtils';

export default function CharacterGenerator() {
  const [character, setCharacter] = useState<Character>(createEmptyCharacter());
  const [warnings, setWarnings] = useState<string[]>([]);

  const updateCharacter = (updates: Partial<Character>) => {
    const newCharacter = { ...character, ...updates };

    // Recalculate CP and derived stats
    newCharacter.cp.spent = calculateCharacterCPSpent(newCharacter);
    newCharacter.cp.available = newCharacter.cp.total - newCharacter.cp.spent;
    updateDerivedStats(newCharacter);

    setCharacter(newCharacter);
    setWarnings(validateCharacterBuild(newCharacter));
  };

  const handleRandomGenerate = () => {
    const newCharacter = generateRandomCharacter();
    setCharacter(newCharacter);
    setWarnings(validateCharacterBuild(newCharacter));
  };

  const handleNameGenerate = () => {
    const name = generateRandomName(
      character.race as keyof typeof races,
      character.gender
    );
    updateCharacter({ name });
  };

  const handleRaceChange = (race: string) => {
    const raceData = races[race as keyof typeof races];
    const newAbilities = { ...character.abilities };

    // Apply racial minima
    abilities.forEach(ability => {
      const minimum = raceData.minima[ability] as DieRank;
      const current = newAbilities[ability] as DieRank;
      if (dieRanks.indexOf(current) < dieRanks.indexOf(minimum)) {
        newAbilities[ability] = minimum;
      }
    });

    updateCharacter({ race, abilities: newAbilities });
  };

  const handleClassChange = (characterClass: string) => {
    const classData = classes[characterClass as keyof typeof classes];
    const newAbilities = { ...character.abilities };

    // Apply class minima
    abilities.forEach(ability => {
      const minimum = classData.minima[ability] as DieRank;
      const current = newAbilities[ability] as DieRank;
      if (dieRanks.indexOf(current) < dieRanks.indexOf(minimum)) {
        newAbilities[ability] = minimum;
      }
    });

    // Set magic path if applicable
    const magicPath = classData.magicPaths.length > 0 ? classData.magicPaths[0] : undefined;

    updateCharacter({
      class: characterClass,
      abilities: newAbilities,
      magicPath
    });
  };

  const handleLevelChange = (level: number) => {
    const newTotal = levelProgression[level as keyof typeof levelProgression].totalCP;
    updateCharacter({
      level,
      cp: { ...character.cp, total: newTotal }
    });
  };

  const upgradeAbility = (ability: string) => {
    const current = character.abilities[ability] as DieRank;
    const next = getNextDieRank(current);
    if (next) {
      const cost = calculateCPCost(current, next);
      if (character.cp.available >= cost) {
        updateCharacter({
          abilities: { ...character.abilities, [ability]: next }
        });
      }
    }
  };

  const downgradeAbility = (ability: string) => {
    const current = character.abilities[ability] as DieRank;
    const previous = getPreviousDieRank(current);
    if (previous) {
      updateCharacter({
        abilities: { ...character.abilities, [ability]: previous }
      });
    }
  };

  const upgradeSpecialty = (specialty: string) => {
    const current = character.specialties[specialty] as DieRank;
    const next = getNextDieRank(current);
    if (next) {
      const cost = calculateCPCost(current, next);
      if (character.cp.available >= cost) {
        updateCharacter({
          specialties: { ...character.specialties, [specialty]: next }
        });
      }
    }
  };

  const downgradeSpecialty = (specialty: string) => {
    const current = character.specialties[specialty] as DieRank;
    const previous = getPreviousDieRank(current);
    if (previous) {
      updateCharacter({
        specialties: { ...character.specialties, [specialty]: previous }
      });
    }
  };

  const exportToMarkdown = () => {
    const markdown = `# ${character.name}

**Race:** ${character.race}
**Class:** ${character.class}
**Level:** ${character.level}
**Build Philosophy:** ${character.buildPhilosophy}
${character.magicPath ? `**Magic Path:** ${character.magicPath}  ` : ''}

## Abilities
${abilities.map(ability => `**${ability}:** ${character.abilities[ability]}`).join('  \n')}

## Specialties
${Object.entries(character.specialties).map(([specialty, die]) => `**${specialty}:** ${die}`).join('  \n')}

## Derived Stats
- **Active Defense Pool (ADP):** ${character.derivedStats.adp}
- **Passive Defense Pool (PDP):** ${character.derivedStats.pdp}
- **Spirit Defense Pool (SDP):** ${character.derivedStats.sdp}
- **Battle Phase:** ${character.derivedStats.battlePhase}
${character.derivedStats.spellCount > 0 ? `- **Spell Count:** ${character.derivedStats.spellCount}` : ''}

## Character Points
- **Total CP:** ${character.cp.total}
- **Spent CP:** ${character.cp.spent}
- **Available CP:** ${character.cp.available}

${character.iconicInheritance ? '**Has Iconic Arcane Inheritance**' : ''}
`;

    navigator.clipboard.writeText(markdown);
    alert('Character exported to clipboard as Markdown!');
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Character Generator
        </h1>
        <p className="text-gray-600">
          Create characters for Eldritch RPG 2nd Edition
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-wrap gap-4 mb-4">
          <button
            onClick={handleRandomGenerate}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            Generate Random Character
          </button>
          <button
            onClick={handleNameGenerate}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            Random Name
          </button>
          <button
            onClick={exportToMarkdown}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            Export to Markdown
          </button>
        </div>

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <h3 className="font-bold text-red-800 mb-2">Character Issues:</h3>
            <ul className="list-disc list-inside text-red-700">
              {warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Basic Information</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={character.name}
                onChange={(e) => updateCharacter({ name: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter character name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                value={character.gender}
                onChange={(e) => updateCharacter({ gender: e.target.value as 'Male' | 'Female' })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Race
              </label>
              <select
                value={character.race}
                onChange={(e) => handleRaceChange(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(races).map((race) => (
                  <option key={race} value={race}>{race}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class
              </label>
              <select
                value={character.class}
                onChange={(e) => handleClassChange(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(classes).map((cls) => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Level
              </label>
              <select
                value={character.level}
                onChange={(e) => handleLevelChange(parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(levelProgression).map((level) => (
                  <option key={level} value={level}>Level {level}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Build Philosophy
              </label>
              <select
                value={character.buildPhilosophy}
                onChange={(e) => updateCharacter({ buildPhilosophy: e.target.value as 'Balanced' | 'Hybrid' | 'Specialist' })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(buildPhilosophies).map((philosophy) => (
                  <option key={philosophy} value={philosophy}>{philosophy}</option>
                ))}
              </select>
              <p className="text-sm text-gray-600 mt-1">
                {buildPhilosophies[character.buildPhilosophy].description}
              </p>
            </div>

            {classes[character.class as keyof typeof classes].magicPaths.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Magic Path
                </label>
                <select
                  value={character.magicPath || ''}
                  onChange={(e) => updateCharacter({ magicPath: e.target.value || undefined })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {classes[character.class as keyof typeof classes].magicPaths.map((path) => (
                    <option key={path} value={path}>{path}</option>
                  ))}
                </select>
                {character.magicPath && (
                  <p className="text-sm text-gray-600 mt-1">
                    {magicPaths[character.magicPath as keyof typeof magicPaths].description}
                  </p>
                )}
              </div>
            )}

            <div className="flex items-center">
              <input
                type="checkbox"
                id="iconicInheritance"
                checked={character.iconicInheritance}
                onChange={(e) => updateCharacter({ iconicInheritance: e.target.checked })}
                className="mr-2"
              />
              <label htmlFor="iconicInheritance" className="text-sm font-medium text-gray-700">
                Iconic Arcane Inheritance (4 CP)
              </label>
            </div>
          </div>
        </div>

        {/* Character Points */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Character Points</h2>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Total CP:</span>
              <span>{character.cp.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Spent CP:</span>
              <span className={character.cp.spent > character.cp.total ? 'text-red-600' : ''}>{character.cp.spent}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="font-bold">Available CP:</span>
              <span className={`font-bold ${character.cp.available < 0 ? 'text-red-600' : 'text-green-600'}`}>
                {character.cp.available}
              </span>
            </div>
          </div>

          <h3 className="text-lg font-bold mt-6 mb-4">Derived Stats</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Active Defense Pool:</span>
              <span className="font-medium">{character.derivedStats.adp}</span>
            </div>
            <div className="flex justify-between">
              <span>Passive Defense Pool:</span>
              <span className="font-medium">{character.derivedStats.pdp}</span>
            </div>
            <div className="flex justify-between">
              <span>Spirit Defense Pool:</span>
              <span className="font-medium">{character.derivedStats.sdp}</span>
            </div>
            <div className="flex justify-between">
              <span>Battle Phase:</span>
              <span className="font-medium">{character.derivedStats.battlePhase}</span>
            </div>
            {character.derivedStats.spellCount > 0 && (
              <div className="flex justify-between">
                <span>Spell Count:</span>
                <span className="font-medium">{character.derivedStats.spellCount}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Abilities */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">Abilities</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {abilities.map((ability) => (
            <div key={ability} className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">{ability}</h3>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => downgradeAbility(ability)}
                  className="bg-red-500 hover:bg-red-600 text-white w-8 h-8 rounded transition-colors"
                  disabled={!getPreviousDieRank(character.abilities[ability] as DieRank)}
                >
                  -
                </button>
                <span className="mx-4 font-bold text-lg">{character.abilities[ability]}</span>
                <button
                  onClick={() => upgradeAbility(ability)}
                  className="bg-green-500 hover:bg-green-600 text-white w-8 h-8 rounded transition-colors"
                  disabled={!getNextDieRank(character.abilities[ability] as DieRank) ||
                           character.cp.available < calculateCPCost(character.abilities[ability] as DieRank, getNextDieRank(character.abilities[ability] as DieRank)!)}
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Specialties */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">Specialties</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {abilities.map((ability) => (
            <div key={ability}>
              <h3 className="font-medium mb-3 text-center bg-gray-100 py-2 rounded">{ability}</h3>
              <div className="space-y-3">
                {specialties[ability].map((specialty) => (
                  <div key={specialty} className="border rounded-lg p-3">
                    <h4 className="text-sm font-medium mb-2">{specialty}</h4>
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => downgradeSpecialty(specialty)}
                        className="bg-red-500 hover:bg-red-600 text-white w-6 h-6 rounded text-sm transition-colors"
                        disabled={!getPreviousDieRank(character.specialties[specialty] as DieRank)}
                      >
                        -
                      </button>
                      <span className="mx-2 font-medium">{character.specialties[specialty]}</span>
                      <button
                        onClick={() => upgradeSpecialty(specialty)}
                        className="bg-green-500 hover:bg-green-600 text-white w-6 h-6 rounded text-sm transition-colors"
                        disabled={!getNextDieRank(character.specialties[specialty] as DieRank) ||
                                 character.cp.available < calculateCPCost(character.specialties[specialty] as DieRank, getNextDieRank(character.specialties[specialty] as DieRank)!)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}