'use client';

import { useState } from 'react';
import {
  DetailedNPC,
  npcRaces,
  npcRoles,
  npcLevels
} from '../data/npcData';
import {
  generateDetailedNPC,
  exportDetailedNPCToMarkdown,
  createDetailedNPCForBattle
} from '../utils/npcUtils';
import { saveNPCToRoster, getFolderList, createCustomFolder } from '../utils/rosterUtils';

export default function AdvancedNPCGenerator() {
  const [npcs, setNpcs] = useState<DetailedNPC[]>([]);

  // Generation options
  const [selectedRace, setSelectedRace] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<number | ''>('');
  const [selectedGender, setSelectedGender] = useState<'Male' | 'Female' | ''>('');
  const [includeMagic, setIncludeMagic] = useState(false);

  // Roster functionality
  const [rosterFolders, setRosterFolders] = useState<string[]>(getFolderList());
  const [selectedRosterFolder, setSelectedRosterFolder] = useState('NPCs');
  const [showRosterSaveDialog, setShowRosterSaveDialog] = useState(false);
  const [customFolderName, setCustomFolderName] = useState('');
  const [npcToSave, setNpcToSave] = useState<DetailedNPC | null>(null);

  const handleGenerate = () => {
    const npc = generateDetailedNPC(
      selectedRace || undefined,
      selectedRole || undefined,
      selectedLevel || undefined,
      selectedGender || undefined,
      includeMagic
    );

    setNpcs([npc]);
  };

  const handleExport = (npc: DetailedNPC) => {
    const markdown = exportDetailedNPCToMarkdown(npc);
    navigator.clipboard.writeText(markdown);
    alert('Detailed NPC exported to clipboard!');
  };

  const handleAddToBattle = (npc: DetailedNPC) => {
    const battleData = createDetailedNPCForBattle(npc);
    const json = JSON.stringify(battleData, null, 2);
    navigator.clipboard.writeText(json);
    alert(`${npc.name} battle data copied to clipboard!`);
  };

  const handleSaveToRoster = (npc: DetailedNPC) => {
    setNpcToSave(npc);
    setShowRosterSaveDialog(true);
  };

  const saveNPCToRosterFunc = () => {
    if (!npcToSave) return;

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

    const success = saveNPCToRoster(npcToSave, folderName);

    if (success) {
      alert(`NPC "${npcToSave.name}" saved to roster folder "${folderName}" successfully!`);
      setShowRosterSaveDialog(false);
      setCustomFolderName('');
      setNpcToSave(null);
    } else {
      alert('Failed to save NPC to roster. Please try again.');
    }
  };

  const handleRemoveNPC = (id: number) => {
    setNpcs(prev => prev.filter(npc => npc.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Advanced NPC Generator
        </h1>
        <p className="text-gray-600">
          Generate detailed NPCs with complete ability systems for Eldritch RPG
        </p>
      </div>

      {/* Generation Controls */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-bold">Generate Detailed NPC</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Race (Optional)
              </label>
              <select
                value={selectedRace}
                onChange={(e) => setSelectedRace(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
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
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Random</option>
                {npcRoles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Level (Optional)
              </label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value ? parseInt(e.target.value) : '')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
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
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
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
                checked={includeMagic}
                onChange={(e) => setIncludeMagic(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">Include Magical Properties for Iconic Items</span>
            </label>
            <button
              onClick={handleGenerate}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded transition-colors"
            >
              Generate Character
            </button>
          </div>
        </div>

        {npcs.length > 0 && (
          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Generated NPCs ({npcs.length})</h3>
              <button
                onClick={() => setNpcs([])}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Generated NPCs Display */}
      {npcs.length > 0 && (
        <div className="space-y-6">
          {npcs.map(npc => (
            <div key={npc.id} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-green-700 mb-2">
                    Level {npc.level} {npc.gender} {npc.race} {npc.role}
                  </h2>
                  <h3 className="text-xl font-semibold text-gray-800">{npc.name}</h3>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddToBattle(npc)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                    title="Copy Battle Data"
                  >
                    Battle
                  </button>
                  <button
                    onClick={() => handleExport(npc)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm transition-colors"
                    title="Export to Markdown"
                  >
                    Export
                  </button>
                  <button
                    onClick={() => handleSaveToRoster(npc)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                    title="Save to Roster"
                  >
                    Roster
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

              {/* Abilities Section */}
              <div className="mb-6">
                <h4 className="text-lg font-bold text-gray-800 mb-3">Abilities</h4>
                <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                  <div>
                    <span className="font-semibold">Competence {npc.abilities.competence} →</span>
                    <div className="ml-4 text-sm">
                      Expertise {npc.specialties.competence.expertise} ({Object.keys(npc.focuses.expertise || {})[0]} {Object.values(npc.focuses.expertise || {})[0]}),
                      Perception {npc.specialties.competence.perception} ({Object.keys(npc.focuses.perception || {})[0]} {Object.values(npc.focuses.perception || {})[0]}).
                    </div>
                  </div>
                  <div>
                    <span className="font-semibold">Prowess {npc.abilities.prowess} →</span>
                    <div className="ml-4 text-sm">
                      Melee {npc.specialties.prowess.melee} ({Object.keys(npc.focuses.melee || {})[0]} {Object.values(npc.focuses.melee || {})[0]}),
                      Agility {npc.specialties.prowess.agility} ({Object.keys(npc.focuses.agility || {})[0]} {Object.values(npc.focuses.agility || {})[0]}).
                    </div>
                  </div>
                  <div>
                    <span className="font-semibold">Fortitude {npc.abilities.fortitude} →</span>
                    <div className="ml-4 text-sm">
                      Endurance {npc.specialties.fortitude.endurance} ({Object.keys(npc.focuses.endurance || {})[0]} {Object.values(npc.focuses.endurance || {})[0]}),
                      Strength {npc.specialties.fortitude.strength} ({Object.keys(npc.focuses.strength || {})[0]} {Object.values(npc.focuses.strength || {})[0]}),
                      Willpower {npc.specialties.fortitude.willpower} ({Object.keys(npc.focuses.willpower || {})[0]} {Object.values(npc.focuses.willpower || {})[0]}).
                    </div>
                  </div>
                </div>
              </div>

              {/* Combat Stats & Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-red-50 rounded-lg p-4">
                  <h4 className="font-bold text-red-800 mb-3">Combat Stats</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Spirit Points:</span>
                      <span className="font-medium">{npc.spiritPoints}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Defense:</span>
                      <span className="font-medium">{npc.activeDefense}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Passive Defense:</span>
                      <span className="font-medium">{npc.passiveDefense}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Mastery Die:</span>
                      <span className="font-medium">{npc.masteryDie}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Armor:</span>
                      <span className="font-medium">{npc.armor}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 rounded-lg p-4">
                  <h4 className="font-bold text-amber-800 mb-3">Actions</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Melee Attack:</span>
                      <div className="text-xs">{npc.actions.meleeAttack}</div>
                    </div>
                    <div>
                      <span className="font-medium">Ranged Attack:</span>
                      <div className="text-xs">{npc.actions.rangedAttack}</div>
                    </div>
                    <div>
                      <span className="font-medium">Magic Attack:</span>
                      <div className="text-xs">{npc.actions.magicAttack}</div>
                    </div>
                    <div>
                      <span className="font-medium">Perception Check:</span>
                      <div className="text-xs">{npc.actions.perceptionCheck}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Iconic Item */}
              {npc.iconicItem && (
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-bold text-green-800 mb-3">{npc.iconicItem.type}</h4>
                  {npc.iconicItem.details && (
                    <p className="text-sm mb-2">
                      <span className="font-medium">Details:</span> {npc.iconicItem.details}
                    </p>
                  )}
                  {npc.iconicItem.properties !== 'No special properties.' && (
                    <p className="text-sm mb-2">
                      <span className="font-medium">{npc.iconicItem.properties}</span>
                    </p>
                  )}
                  {npc.iconicItem.potency && (
                    <div className="text-sm space-y-1">
                      <div>
                        <span className="font-medium">Potency:</span> {npc.iconicItem.potency},
                        <span className="font-medium"> Rarity:</span> {npc.iconicItem.rarity}
                      </div>
                      {npc.iconicItem.energyPoints && (
                        <div>
                          <span className="font-medium">Energy Points:</span> {npc.iconicItem.energyPoints},
                          <span className="font-medium"> Activation Cost:</span> {npc.iconicItem.activationCost} energy point(s)
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Roster Save Dialog */}
      {showRosterSaveDialog && npcToSave && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Save NPC to Roster</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  NPC: {npcToSave.name}
                </label>
              </div>

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
                onClick={saveNPCToRosterFunc}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Save to Roster
              </button>
              <button
                onClick={() => {
                  setShowRosterSaveDialog(false);
                  setCustomFolderName('');
                  setNpcToSave(null);
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