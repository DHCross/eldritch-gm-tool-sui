'use client';

import { useState } from 'react';
import {
  QuickNPC,
  npcRaces,
  npcRoles,
  npcLevels,
  npcTemplates
} from '../data/npcData';
import {
  generateQuickNPC,
  generateNPCGroup,
  addPersonalityToNPC,
  exportNPCToMarkdown,
  exportNPCGroupToMarkdown,
  createNPCForBattle
} from '../utils/npcUtils';

export default function NPCGenerator() {
  const [npcs, setNpcs] = useState<QuickNPC[]>([]);
  const [generationMode, setGenerationMode] = useState<'single' | 'group'>('single');

  // Single NPC options
  const [selectedRace, setSelectedRace] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<number | ''>('');
  const [selectedGender, setSelectedGender] = useState<'Male' | 'Female' | ''>('');
  const [includePersonality, setIncludePersonality] = useState(false);

  // Group generation options
  const [groupSize, setGroupSize] = useState(3);
  const [groupRace, setGroupRace] = useState<string>('');
  const [groupRole, setGroupRole] = useState<string>('');
  const [groupLevel, setGroupLevel] = useState<number | ''>('');
  const [mixedGroup, setMixedGroup] = useState(false);

  const handleGenerateSingle = () => {
    let npc = generateQuickNPC(
      selectedRace || undefined,
      selectedRole || undefined,
      selectedLevel || undefined,
      selectedGender || undefined
    );

    if (includePersonality) {
      npc = addPersonalityToNPC(npc);
    }

    setNpcs([npc]);
  };

  const handleGenerateGroup = () => {
    const newNpcs = generateNPCGroup(groupSize, {
      race: groupRace || undefined,
      role: groupRole || undefined,
      level: groupLevel || undefined,
      mixedGroup
    });

    if (includePersonality) {
      const npcsWithPersonality = newNpcs.map(npc => addPersonalityToNPC(npc));
      setNpcs(npcsWithPersonality);
    } else {
      setNpcs(newNpcs);
    }
  };

  const handleAddToBattle = (npc: QuickNPC) => {
    // In a real implementation, this would integrate with the Battle Calculator
    const markdown = exportNPCToMarkdown(npc);
    navigator.clipboard.writeText(markdown);
    alert(`${npc.name} copied to clipboard! You can manually add to Battle Calculator.`);
  };

  const handleExportSingle = (npc: QuickNPC) => {
    const markdown = exportNPCToMarkdown(npc);
    navigator.clipboard.writeText(markdown);
    alert('NPC exported to clipboard!');
  };

  const handleExportGroup = () => {
    const markdown = exportNPCGroupToMarkdown(npcs);
    navigator.clipboard.writeText(markdown);
    alert('NPC group exported to clipboard!');
  };

  const handleRemoveNPC = (id: number) => {
    setNpcs(prev => prev.filter(npc => npc.id !== id));
  };

  const getTemplateInfo = (role: string) => {
    const template = npcTemplates[role];
    if (!template) return '';
    return `${template.primaryAbility} focus, ${template.keySpecialty} specialty`;
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          NPC Generator
        </h1>
        <p className="text-gray-600">
          Quickly generate NPCs for your Eldritch RPG sessions
        </p>
      </div>

      {/* Generation Mode Toggle */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-4 mb-6">
          <label className="flex items-center">
            <input
              type="radio"
              value="single"
              checked={generationMode === 'single'}
              onChange={(e) => setGenerationMode(e.target.value as 'single')}
              className="mr-2"
            />
            <span className="font-medium">Single NPC</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="group"
              checked={generationMode === 'group'}
              onChange={(e) => setGenerationMode(e.target.value as 'group')}
              className="mr-2"
            />
            <span className="font-medium">Group Generation</span>
          </label>
        </div>

        {generationMode === 'single' ? (
          // Single NPC Generation
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Generate Single NPC</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Race (Optional)
                </label>
                <select
                  value={selectedRace}
                  onChange={(e) => setSelectedRace(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Random</option>
                  {npcRaces.map(race => (
                    <option key={race} value={race}>{race}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role (Optional)
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Random</option>
                  {npcRoles.map(role => (
                    <option key={role} value={role} title={getTemplateInfo(role)}>
                      {role}
                    </option>
                  ))}
                </select>
                {selectedRole && (
                  <p className="text-xs text-gray-500 mt-1">
                    {getTemplateInfo(selectedRole)}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Level (Optional)
                </label>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value ? parseInt(e.target.value) : '')}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Random</option>
                  {npcLevels.map(level => (
                    <option key={level} value={level}>Level {level}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender (Optional)
                </label>
                <select
                  value={selectedGender}
                  onChange={(e) => setSelectedGender(e.target.value as 'Male' | 'Female' | '')}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Random</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includePersonality}
                  onChange={(e) => setIncludePersonality(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm">Include personality & motivation</span>
              </label>
              <button
                onClick={handleGenerateSingle}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
              >
                Generate NPC
              </button>
            </div>
          </div>
        ) : (
          // Group Generation
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Generate NPC Group</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Group Size
                </label>
                <input
                  type="number"
                  value={groupSize}
                  onChange={(e) => setGroupSize(parseInt(e.target.value) || 1)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Primary Race
                </label>
                <select
                  value={groupRace}
                  onChange={(e) => setGroupRace(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Mixed/Random</option>
                  {npcRaces.map(race => (
                    <option key={race} value={race}>{race}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Primary Role
                </label>
                <select
                  value={groupRole}
                  onChange={(e) => setGroupRole(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Mixed/Random</option>
                  {npcRoles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Primary Level
                </label>
                <select
                  value={groupLevel}
                  onChange={(e) => setGroupLevel(e.target.value ? parseInt(e.target.value) : '')}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Mixed/Random</option>
                  {npcLevels.map(level => (
                    <option key={level} value={level}>Level {level}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={mixedGroup}
                  onChange={(e) => setMixedGroup(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm">Allow variation within group</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includePersonality}
                  onChange={(e) => setIncludePersonality(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm">Include personalities</span>
              </label>
              <button
                onClick={handleGenerateGroup}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors"
              >
                Generate Group
              </button>
            </div>
          </div>
        )}

        {npcs.length > 0 && (
          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Generated NPCs ({npcs.length})</h3>
              <div className="flex gap-2">
                {npcs.length > 1 && (
                  <button
                    onClick={handleExportGroup}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition-colors"
                  >
                    Export Group
                  </button>
                )}
                <button
                  onClick={() => setNpcs([])}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Generated NPCs Display */}
      {npcs.length > 0 && (
        <div className="space-y-4">
          {npcs.map(npc => (
            <div key={npc.id} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{npc.name}</h3>
                  <p className="text-gray-600">
                    {npc.race} {npc.role} (Level {npc.level}) • {npc.gender}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddToBattle(npc)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                    title="Add to Battle Calculator"
                  >
                    Battle
                  </button>
                  <button
                    onClick={() => handleExportSingle(npc)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm transition-colors"
                    title="Export to Markdown"
                  >
                    Export
                  </button>
                  <button
                    onClick={() => handleRemoveNPC(npc.id)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm transition-colors"
                    title="Remove NPC"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Combat Stats */}
                <div className="bg-red-50 rounded-lg p-4">
                  <h4 className="font-bold text-red-800 mb-2">Combat Stats</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Active Defense:</span>
                      <span className="font-medium">{npc.activeDefense}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Passive Defense:</span>
                      <span className="font-medium">{npc.passiveDefense}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Spirit Points:</span>
                      <span className="font-medium">{npc.spiritPoints}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Battle Phase:</span>
                      <span className="font-medium">{npc.battlePhase}</span>
                    </div>
                  </div>
                </div>

                {/* Abilities */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-bold text-blue-800 mb-2">Abilities</h4>
                  <div className="space-y-1 text-sm">
                    <div>
                      <span className="text-gray-600">Primary:</span>
                      <div className="font-medium">{npc.primaryAbility}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Key Specialty:</span>
                      <div className="font-medium">{npc.keySpecialty}</div>
                    </div>
                  </div>
                </div>

                {/* Equipment & Notes */}
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-bold text-green-800 mb-2">Equipment</h4>
                  <div className="space-y-1 text-sm">
                    <div>
                      <span className="text-gray-600">Iconic Item:</span>
                      <div className="font-medium">{npc.iconicItem}</div>
                    </div>
                    {npc.notes && (
                      <div>
                        <span className="text-gray-600">Notes:</span>
                        <div className="text-sm mt-1">{npc.notes}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}