'use client';

import { useState, useEffect } from 'react';
import {
  DetailedNPC,
  npcRaces,
  npcRoles,
  npcLevels,
  dieValues
} from '../data/npcData';
import {
  generateDetailedNPC,
  exportDetailedNPCToMarkdown,
  createDetailedNPCForBattle
} from '../utils/npcUtils';
import { getAllPartyFolders, saveCharacter } from '../utils/partyStorage';
import { SavedCharacter, PartyFolder } from '../types/party';
import exporter from '../utils/exporters/htmlExporter';

export default function AdvancedNPCGenerator() {
  const [npcs, setNpcs] = useState<DetailedNPC[]>([]);

  // Generation options
  const [selectedRace, setSelectedRace] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<number | ''>('');
  const [selectedGender, setSelectedGender] = useState<'Male' | 'Female' | ''>('');
  const [includeMagic, setIncludeMagic] = useState(false);

  // Saving functionality
  const [partyFolders, setPartyFolders] = useState<PartyFolder[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [selectedPartyId, setSelectedPartyId] = useState('');
  const [npcToSave, setNpcToSave] = useState<DetailedNPC | null>(null);

  useEffect(() => {
    setPartyFolders(getAllPartyFolders());
  }, []);

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

  const handleExportHTML = async (npc: DetailedNPC) => {
    try {
      const html = exporter.npcToHTML(npc);
      const wrapped = exporter.wrapForWord(html);
      if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
        const blob = new Blob([wrapped], { type: 'text/html' });
        const item = new ClipboardItem({ 'text/html': blob, 'text/plain': new Blob([exportDetailedNPCToMarkdown(npc)], { type: 'text/plain' }) });
        await navigator.clipboard.write([item]);
        alert('Detailed NPC HTML copied to clipboard');
      } else {
        await navigator.clipboard.writeText(exportDetailedNPCToMarkdown(npc));
        alert('HTML clipboard not supported — copied Markdown instead');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to copy HTML');
    }
  };

  const handleAddToBattle = (npc: DetailedNPC) => {
    const battleData = createDetailedNPCForBattle(npc);
    const json = JSON.stringify(battleData, null, 2);
    navigator.clipboard.writeText(json);
    alert(`${npc.name} battle data copied to clipboard!`);
  };

  const handleOpenSaveDialog = (npc: DetailedNPC) => {
    setNpcToSave(npc);
    setShowSaveDialog(true);
  };

  const saveNPC = () => {
    if (!npcToSave) return;

    // Map DetailedNPC to SavedCharacter
    const character: SavedCharacter = {
      id: Date.now().toString(),
      user_id: 'default_user',
      name: npcToSave.name,
      type: 'NPC',
      level: npcToSave.level || 1,
      race: npcToSave.race,
      class: npcToSave.role,
      abilities: {
        prowess_mv: dieValues[npcToSave.abilities.prowess] || 4,
        agility_mv: dieValues[npcToSave.abilities.prowess] || 4, // Approximate if not distinct
        melee_mv: dieValues[npcToSave.abilities.prowess] || 4, // Approximate
        fortitude_mv: dieValues[npcToSave.abilities.fortitude] || 4,
        endurance_mv: dieValues[npcToSave.abilities.fortitude] || 4,
        strength_mv: dieValues[npcToSave.abilities.fortitude] || 4,
        competence_mv: dieValues[npcToSave.abilities.competence] || 4,
        willpower_mv: dieValues[npcToSave.abilities.fortitude] || 4,
        expertise_mv: dieValues[npcToSave.abilities.competence] || 4,
        perception_mv: dieValues[npcToSave.abilities.competence] || 4,
        adroitness_mv: dieValues[npcToSave.abilities.competence] || 4,
        precision_mv: dieValues[npcToSave.abilities.prowess] || 4
      },
      computed: {
        active_dp: npcToSave.activeDefense,
        passive_dp: npcToSave.passiveDefense,
        spirit_pts: npcToSave.spiritPoints
      },
      status: {
        current_hp_active: npcToSave.activeDefense,
        current_hp_passive: npcToSave.passiveDefense,
        status_flags: [],
        gear: npcToSave.iconicItem ? [npcToSave.iconicItem.type] : [],
        notes: npcToSave.notes || ''
      },
      tags: [npcToSave.race.toLowerCase(), npcToSave.role.toLowerCase(), 'detailed'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      full_data: npcToSave as unknown as Record<string, unknown>
    };

    saveCharacter(character);
    alert(`NPC "${npcToSave.name}" saved successfully!`);
    setShowSaveDialog(false);
    setNpcToSave(null);
  };

  const handleRemoveNPC = (id: number) => {
    setNpcs(prev => prev.filter(npc => npc.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-off-white mb-2">
          Advanced NPC Generator
        </h1>
        <p className="text-off-white/60">
          Generate detailed NPCs with complete ability systems for Eldritch RPG
        </p>
      </div>

      {/* Generation Controls */}
      <div className="bg-white/5 rounded-lg shadow-lg p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-bold">Generate Detailed NPC</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-off-white/80 mb-1">
                Race (Optional)
              </label>
              <select
                value={selectedRace}
                onChange={(e) => setSelectedRace(e.target.value)}
                className="npc-native-select w-full border border-white/15 rounded-md px-3 py-2 bg-charcoal-violet text-off-white [color-scheme:dark] focus:outline-none focus:ring-2 focus:ring-soft-amethyst"
              >
                <option value="" className="bg-charcoal-violet text-off-white">Random</option>
                {npcRaces.map(race => (
                  <option key={race} value={race} className="bg-charcoal-violet text-off-white">{race}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-off-white/80 mb-1">
                Role (Optional)
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="npc-native-select w-full border border-white/15 rounded-md px-3 py-2 bg-charcoal-violet text-off-white [color-scheme:dark] focus:outline-none focus:ring-2 focus:ring-soft-amethyst"
              >
                <option value="" className="bg-charcoal-violet text-off-white">Random</option>
                {npcRoles.map(role => (
                  <option key={role} value={role} className="bg-charcoal-violet text-off-white">{role}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-off-white/80 mb-1">
                Level (Optional)
              </label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value ? parseInt(e.target.value) : '')}
                className="npc-native-select w-full border border-white/15 rounded-md px-3 py-2 bg-charcoal-violet text-off-white [color-scheme:dark] focus:outline-none focus:ring-2 focus:ring-soft-amethyst"
              >
                <option value="" className="bg-charcoal-violet text-off-white">Random</option>
                {npcLevels.map(level => (
                  <option key={level} value={level} className="bg-charcoal-violet text-off-white">Level {level}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-off-white/80 mb-1">
                Gender (Optional)
              </label>
              <select
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value as 'Male' | 'Female' | '')}
                className="npc-native-select w-full border border-white/15 rounded-md px-3 py-2 bg-charcoal-violet text-off-white [color-scheme:dark] focus:outline-none focus:ring-2 focus:ring-soft-amethyst"
              >
                <option value="" className="bg-charcoal-violet text-off-white">Random</option>
                <option value="Male" className="bg-charcoal-violet text-off-white">Male</option>
                <option value="Female" className="bg-charcoal-violet text-off-white">Female</option>
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
              className="bg-muted-eldritch-green hover:bg-muted-eldritch-green/80 text-white font-bold py-2 px-6 rounded transition-colors"
            >
              Generate Character
            </button>
          </div>
        </div>

        {npcs.length > 0 && (
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-off-white">Generated NPCs ({npcs.length})</h3>
              <button
                onClick={() => setNpcs([])}
                className="bg-white/10 hover:bg-white/15 text-off-white font-bold py-2 px-4 rounded transition-colors"
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
            <div key={npc.id} className="bg-white/5 rounded-lg shadow-lg p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-muted-eldritch-green mb-2">
                    Level {npc.level} {npc.gender} {npc.race} {npc.role}
                  </h2>
                  <h3 className="text-xl font-semibold text-off-white">{npc.name}</h3>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddToBattle(npc)}
                    className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-sm transition-colors"
                    title="Copy Battle Data"
                  >
                    Battle
                  </button>
                  <button
                    onClick={() => handleExport(npc)}
                    className="bg-soft-amethyst hover:bg-soft-amethyst/80 text-white px-3 py-1 rounded text-sm transition-colors"
                    title="Export to Markdown"
                  >
                    Export
                  </button>
                  <button
                    onClick={() => handleExportHTML(npc)}
                    className="bg-soft-amethyst hover:bg-soft-amethyst/80 text-white px-3 py-1 rounded text-sm transition-colors"
                    title="Copy as HTML"
                  >
                    Copy HTML
                  </button>
                  <button
                    onClick={() => handleOpenSaveDialog(npc)}
                    className="bg-soft-amethyst hover:bg-soft-amethyst/80 text-white px-3 py-1 rounded text-sm transition-colors"
                    title="Save NPC"
                  >
                    Save NPC
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
                <h4 className="text-lg font-bold text-off-white mb-3">Abilities</h4>
                <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-2 text-off-white/90">
                  <div>
                    <span className="font-semibold text-off-white">Competence {npc.abilities.competence} →</span>
                    <div className="ml-4 text-sm text-off-white/75">
                      Expertise {npc.specialties.competence.expertise} ({Object.keys(npc.focuses.expertise || {})[0]} {Object.values(npc.focuses.expertise || {})[0]}),
                      Perception {npc.specialties.competence.perception} ({Object.keys(npc.focuses.perception || {})[0]} {Object.values(npc.focuses.perception || {})[0]}).
                    </div>
                  </div>
                  <div>
                    <span className="font-semibold text-off-white">Prowess {npc.abilities.prowess} →</span>
                    <div className="ml-4 text-sm text-off-white/75">
                      Melee {npc.specialties.prowess.melee} ({Object.keys(npc.focuses.melee || {})[0]} {Object.values(npc.focuses.melee || {})[0]}),
                      Agility {npc.specialties.prowess.agility} ({Object.keys(npc.focuses.agility || {})[0]} {Object.values(npc.focuses.agility || {})[0]}).
                    </div>
                  </div>
                  <div>
                    <span className="font-semibold text-off-white">Fortitude {npc.abilities.fortitude} →</span>
                    <div className="ml-4 text-sm text-off-white/75">
                      Endurance {npc.specialties.fortitude.endurance} ({Object.keys(npc.focuses.endurance || {})[0]} {Object.values(npc.focuses.endurance || {})[0]}),
                      Strength {npc.specialties.fortitude.strength} ({Object.keys(npc.focuses.strength || {})[0]} {Object.values(npc.focuses.strength || {})[0]}),
                      Willpower {npc.specialties.fortitude.willpower} ({Object.keys(npc.focuses.willpower || {})[0]} {Object.values(npc.focuses.willpower || {})[0]}).
                    </div>
                  </div>
                </div>
              </div>

              {/* Combat Stats & Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-red-900/20 rounded-lg p-4 text-off-white/90">
                  <h4 className="font-bold text-red-400 mb-3">Combat Stats</h4>
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

                <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-off-white/90">
                  <h4 className="font-bold text-muted-eldritch-green mb-3">Actions</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-off-white">Melee Attack:</span>
                      <div className="text-xs text-off-white/70">{npc.actions.meleeAttack}</div>
                    </div>
                    <div>
                      <span className="font-medium text-off-white">Ranged Attack:</span>
                      <div className="text-xs text-off-white/70">{npc.actions.rangedAttack}</div>
                    </div>
                    <div>
                      <span className="font-medium text-off-white">Magic Attack:</span>
                      <div className="text-xs text-off-white/70">{npc.actions.magicAttack}</div>
                    </div>
                    <div>
                      <span className="font-medium text-off-white">Perception Check:</span>
                      <div className="text-xs text-off-white/70">{npc.actions.perceptionCheck}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Iconic Item */}
              {npc.iconicItem && (
                <div className="bg-green-900/20 rounded-lg p-4">
                  <h4 className="font-bold text-muted-eldritch-green mb-3">{npc.iconicItem.type}</h4>
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

      {/* Save Dialog */}
      {showSaveDialog && npcToSave && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white/5 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Save NPC</h3>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-off-white/80">
                  Saving <strong>{npcToSave.name}</strong> to your NPC collection.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-off-white/80 mb-2">
                  Add to Party Folder (Optional):
                </label>
                <select
                  value={selectedPartyId}
                  onChange={(e) => setSelectedPartyId(e.target.value)}
                  className="npc-native-select w-full border border-white/15 rounded-md px-3 py-2 bg-charcoal-violet text-off-white [color-scheme:dark]"
                >
                  <option value="" className="bg-charcoal-violet text-off-white">No specific folder</option>
                  {partyFolders.map(folder => (
                    <option key={folder.id} value={folder.id} className="bg-charcoal-violet text-off-white">
                      {folder.name} ({folder.folder_type})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                onClick={saveNPC}
                className="flex-1 bg-soft-amethyst hover:bg-soft-amethyst/80 text-white font-bold py-2 px-4 rounded"
              >
                Save NPC
              </button>
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  setNpcToSave(null);
                }}
                className="flex-1 bg-white/10 hover:bg-white/15 text-white font-bold py-2 px-4 rounded"
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
