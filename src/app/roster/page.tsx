'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  getCharactersByType,
  getPartyFoldersByType,
  savePartyFolder,
  generateId,
  getCurrentUserId,
  initializeDefaultFolders,
  getPartyCharacters,
  calculatePartyDefenseProfile,
  savePartyMembership,
  getPartyMemberships,
  removePartyMembership
} from '../../utils/partyStorage';
import { SavedCharacter, PartyFolder, PartyMembership } from '../../types/party';

export default function Roster() {
  const [characters, setCharacters] = useState<SavedCharacter[]>([]);
  const [partyFolders, setPartyFolders] = useState<PartyFolder[]>([]);
  const [selectedCharacters, setSelectedCharacters] = useState<Set<string>>(new Set());
  const [showNewPartyForm, setShowNewPartyForm] = useState(false);
  const [newPartyName, setNewPartyName] = useState('');
  const [expandedParties, setExpandedParties] = useState<Set<string>>(new Set());

  useEffect(() => {
    initializeDefaultFolders();
    loadData();
  }, []);

  const loadData = () => {
    const pcs = getCharactersByType('PC');
    const pcFolders = getPartyFoldersByType('PC_party');
    setCharacters(pcs);
    setPartyFolders(pcFolders);
  };

  const createNewParty = () => {
    if (!newPartyName.trim()) return;

    const newFolder: PartyFolder = {
      id: generateId(),
      user_id: getCurrentUserId(),
      name: newPartyName.trim(),
      folder_type: 'PC_party',
      description: '',
      visibility: 'private',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    savePartyFolder(newFolder);
    setNewPartyName('');
    setShowNewPartyForm(false);
    loadData();
  };

  const toggleCharacterSelection = (characterId: string) => {
    const newSelection = new Set(selectedCharacters);
    if (newSelection.has(characterId)) {
      newSelection.delete(characterId);
    } else {
      newSelection.add(characterId);
    }
    setSelectedCharacters(newSelection);
  };

  const addSelectedToParty = (partyId: string) => {
    const existingMemberships = getPartyMemberships(partyId);
    let nextOrderIndex = Math.max(0, ...existingMemberships.map(m => m.order_index)) + 1;

    selectedCharacters.forEach(characterId => {
      // Check if already in party
      const exists = existingMemberships.some(m => m.character_id === characterId);
      if (!exists) {
        const membership: PartyMembership = {
          id: generateId(),
          party_id: partyId,
          character_id: characterId,
          order_index: nextOrderIndex++,
          active: true
        };
        savePartyMembership(membership);
      }
    });

    setSelectedCharacters(new Set());
    loadData();
  };

  const removeFromParty = (partyId: string, characterId: string) => {
    removePartyMembership(partyId, characterId);
    loadData();
  };

  const togglePartyExpansion = (partyId: string) => {
    const newExpanded = new Set(expandedParties);
    if (newExpanded.has(partyId)) {
      newExpanded.delete(partyId);
    } else {
      newExpanded.add(partyId);
    }
    setExpandedParties(newExpanded);
  };

  const calculatePartyDefense = (partyId: string) => {
    const partyChars = getPartyCharacters(partyId);
    return calculatePartyDefenseProfile(partyChars.map(c => c.id));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Player Character Roster
        </h1>
        <p className="text-lg text-gray-600">
          Manage PCs, organize parties, and calculate party defense levels
        </p>
      </header>

      {characters.length === 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">No Characters Created Yet</h2>
          <p className="text-gray-600 mb-4">
            You haven&apos;t created any player characters yet. Use the Character Generator to create
            characters that will appear in this roster.
          </p>
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-sm text-gray-600">
              Your character roster will display:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 mt-2">
              <li>Character names and levels</li>
              <li>Party organization and management</li>
              <li>Defense level calculations</li>
              <li>Encounter balancing integration</li>
            </ul>
          </div>
        </div>
      ) : (
        <>
          {/* Character Selection Panel */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Available Characters ({characters.length})</h2>
              <div className="space-x-2">
                <Link
                  href="/character-generator"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
                >
                  Create New PC
                </Link>
                <button
                  onClick={() => setShowNewPartyForm(true)}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors"
                >
                  New Party
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {characters.map(char => (
                <div
                  key={char.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedCharacters.has(char.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => toggleCharacterSelection(char.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold">{char.name}</h3>
                    <input
                      type="checkbox"
                      checked={selectedCharacters.has(char.id)}
                      onChange={() => toggleCharacterSelection(char.id)}
                      className="ml-2"
                    />
                  </div>
                  <p className="text-sm text-gray-600">
                    Level {char.level} {char.race} {char.class}
                  </p>
                  <div className="text-xs text-gray-500 mt-2">
                    Active DP: {char.computed.active_dp} | Passive DP: {char.computed.passive_dp} | SP: {char.computed.spirit_pts}
                  </div>
                </div>
              ))}
            </div>

            {selectedCharacters.size > 0 && (
              <div className="mt-4 p-4 bg-gray-50 rounded">
                <p className="font-medium mb-2">{selectedCharacters.size} character(s) selected</p>
                <div className="flex flex-wrap gap-2">
                  {partyFolders.map(party => (
                    <button
                      key={party.id}
                      onClick={() => addSelectedToParty(party.id)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Add to {party.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* New Party Form */}
          {showNewPartyForm && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h3 className="text-lg font-bold mb-4">Create New Party</h3>
              <div className="flex gap-4">
                <input
                  type="text"
                  value={newPartyName}
                  onChange={(e) => setNewPartyName(e.target.value)}
                  placeholder="Party name (e.g., 'Main Adventurers', 'Backup Party')"
                  className="flex-1 border border-gray-300 rounded px-3 py-2"
                />
                <button
                  onClick={createNewParty}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                >
                  Create
                </button>
                <button
                  onClick={() => setShowNewPartyForm(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Party Folders */}
          <div className="space-y-6">
            {partyFolders.map(party => {
              const partyMembers = getPartyCharacters(party.id);
              const defenseProfile = partyMembers.length > 0 ? calculatePartyDefense(party.id) : null;
              const isExpanded = expandedParties.has(party.id);

              return (
                <div key={party.id} className="bg-white rounded-lg shadow-lg">
                  <div
                    className="p-6 cursor-pointer hover:bg-gray-50"
                    onClick={() => togglePartyExpansion(party.id)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-xl font-bold">{party.name}</h3>
                        <p className="text-gray-600">{partyMembers.length} members</p>
                        {defenseProfile && (
                          <p className="text-sm text-gray-500">
                            Defense Tier: {defenseProfile.defense_tier} |
                            Total Active DP: {defenseProfile.total_active_dp} |
                            Total Passive DP: {defenseProfile.total_passive_dp} |
                            Total SP: {defenseProfile.total_spirit_pts}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-400">
                          {isExpanded ? '▼' : '▶'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-6 pb-6">
                      {partyMembers.length === 0 ? (
                        <p className="text-gray-500 italic">No members in this party yet.</p>
                      ) : (
                        <div className="space-y-3">
                          {partyMembers.map(member => (
                            <div key={member.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                              <div>
                                <span className="font-medium">{member.name}</span>
                                <span className="text-gray-600 ml-2">
                                  (Level {member.level} {member.race} {member.class})
                                </span>
                                <div className="text-xs text-gray-500">
                                  Active DP: {member.computed.active_dp} |
                                  Passive DP: {member.computed.passive_dp} |
                                  SP: {member.computed.spirit_pts}
                                </div>
                              </div>
                              <button
                                onClick={() => removeFromParty(party.id, member.id)}
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                Remove
                              </button>
                            </div>
                          ))}

                          {defenseProfile && (
                            <div className="mt-4 p-4 bg-blue-50 rounded border border-blue-200">
                              <h4 className="font-bold text-blue-900 mb-2">Party Defense Summary</h4>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <span className="font-medium">Total Active DP:</span>
                                  <div className="text-lg font-bold text-blue-700">{defenseProfile.total_active_dp}</div>
                                </div>
                                <div>
                                  <span className="font-medium">Total Passive DP:</span>
                                  <div className="text-lg font-bold text-blue-700">{defenseProfile.total_passive_dp}</div>
                                </div>
                                <div>
                                  <span className="font-medium">Total Spirit Points:</span>
                                  <div className="text-lg font-bold text-blue-700">{defenseProfile.total_spirit_pts}</div>
                                </div>
                                <div>
                                  <span className="font-medium">Defense Tier:</span>
                                  <div className="text-lg font-bold text-blue-700">{defenseProfile.defense_tier}</div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {partyFolders.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">Create party folders to organize your characters.</p>
              <button
                onClick={() => setShowNewPartyForm(true)}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors"
              >
                Create Your First Party
              </button>
            </div>
          )}
        </>
      )}

      <div className="text-center mt-8">
        <Link
          href="/"
          className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}