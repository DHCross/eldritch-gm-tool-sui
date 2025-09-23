'use client';

import React, { useState, useEffect } from 'react';
import {
  PartyFolder,
  SavedCharacter,
  PartyMembership,
  FolderType,
  PartyDefenseProfile
} from '../types/party';
import {
  getAllPartyFolders,
  savePartyFolder,
  deletePartyFolder,
  getAllCharacters,
  getPartyMemberships,
  savePartyMembership,
  removePartyMembership,
  generateId,
  getCurrentUserId,
  calculatePartyDefenseProfile,
  getPartyCharacters,
  initializeDefaultFolders
} from '../utils/partyStorage';

export default function PartyManagement() {
  const [folders, setFolders] = useState<PartyFolder[]>([]);
  const [characters, setCharacters] = useState<SavedCharacter[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<PartyFolder | null>(null);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderType, setNewFolderType] = useState<FolderType>('PC_party');
  const [newFolderDescription, setNewFolderDescription] = useState('');
  const [partyDefense, setPartyDefense] = useState<PartyDefenseProfile | null>(null);

  useEffect(() => {
    initializeDefaultFolders();
    loadData();
  }, []);

  useEffect(() => {
    if (selectedFolder) {
      const partyChars = getPartyCharacters(selectedFolder.id);
      const profile = calculatePartyDefenseProfile(partyChars.map(c => c.id));
      setPartyDefense(profile);
    } else {
      setPartyDefense(null);
    }
  }, [selectedFolder, folders]);

  const loadData = () => {
    setFolders(getAllPartyFolders());
    setCharacters(getAllCharacters());
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;

    const folder: PartyFolder = {
      id: generateId(),
      user_id: getCurrentUserId(),
      name: newFolderName,
      folder_type: newFolderType,
      description: newFolderDescription,
      visibility: 'private',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    savePartyFolder(folder);
    setFolders(getAllPartyFolders());
    setNewFolderName('');
    setNewFolderDescription('');
    setShowCreateFolder(false);
  };

  const handleDeleteFolder = (folderId: string) => {
    if (confirm('Are you sure you want to delete this folder? All party memberships will be removed.')) {
      deletePartyFolder(folderId);
      setFolders(getAllPartyFolders());
      if (selectedFolder?.id === folderId) {
        setSelectedFolder(null);
      }
    }
  };

  const handleAddMember = (characterId: string) => {
    if (!selectedFolder) return;

    const existingMemberships = getPartyMemberships(selectedFolder.id);
    const membership: PartyMembership = {
      id: generateId(),
      party_id: selectedFolder.id,
      character_id: characterId,
      order_index: existingMemberships.length,
      active: true
    };

    savePartyMembership(membership);
    loadData();
    setShowAddMember(false);
  };

  const handleRemoveMember = (characterId: string) => {
    if (!selectedFolder) return;
    removePartyMembership(selectedFolder.id, characterId);
    loadData();
  };

  const toggleMemberActive = (characterId: string) => {
    if (!selectedFolder) return;

    const memberships = getPartyMemberships(selectedFolder.id);
    const membership = memberships.find(m => m.character_id === characterId);
    if (membership) {
      membership.active = !membership.active;
      savePartyMembership(membership);
      loadData();
    }
  };

  const getAvailableCharacters = () => {
    if (!selectedFolder) return [];

    const partyMemberIds = getPartyMemberships(selectedFolder.id).map(m => m.character_id);
    const typeFilter = selectedFolder.folder_type === 'PC_party' ? 'PC' :
                      selectedFolder.folder_type === 'NPC_roster' ? 'NPC' : 'Monster';

    return characters.filter(c =>
      c.type === typeFilter && !partyMemberIds.includes(c.id)
    );
  };

  const getPartyMembers = () => {
    if (!selectedFolder) return [];

    const memberships = getPartyMemberships(selectedFolder.id);
    return memberships.map(membership => {
      const character = characters.find(c => c.id === membership.character_id);
      return { membership, character };
    }).filter(item => item.character);
  };

  const getFolderIcon = (type: FolderType) => {
    switch (type) {
      case 'PC_party': return '🗡️';
      case 'NPC_roster': return '🧙';
      case 'Monster_trope': return '👹';
      default: return '📁';
    }
  };

  const getThreatColor = (tier: string) => {
    switch (tier) {
      case 'Elite': return 'text-red-600';
      case 'Advanced': return 'text-orange-600';
      case 'Proficient': return 'text-yellow-600';
      case 'Competent': return 'text-green-600';
      case 'Practitioner': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Folder List */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Party Folders</h2>
          <button
            onClick={() => setShowCreateFolder(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
          >
            + New Folder
          </button>
        </div>

        {showCreateFolder && (
          <div className="mb-4 p-4 border rounded-lg bg-gray-50">
            <h3 className="font-semibold mb-2">Create New Folder</h3>
            <input
              type="text"
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="w-full p-2 border rounded mb-2"
            />
            <select
              value={newFolderType}
              onChange={(e) => setNewFolderType(e.target.value as FolderType)}
              className="w-full p-2 border rounded mb-2"
            >
              <option value="PC_party">PC Party</option>
              <option value="NPC_roster">NPC Roster</option>
              <option value="Monster_trope">Monster Trope</option>
            </select>
            <textarea
              placeholder="Description (optional)"
              value={newFolderDescription}
              onChange={(e) => setNewFolderDescription(e.target.value)}
              className="w-full p-2 border rounded mb-2"
              rows={2}
            />
            <div className="flex space-x-2">
              <button
                onClick={handleCreateFolder}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
              >
                Create
              </button>
              <button
                onClick={() => setShowCreateFolder(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {folders.map(folder => (
            <div
              key={folder.id}
              className={`p-3 rounded cursor-pointer border transition-colors ${
                selectedFolder?.id === folder.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => setSelectedFolder(folder)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getFolderIcon(folder.folder_type)}</span>
                    <span className="font-medium">{folder.name}</span>
                  </div>
                  {folder.description && (
                    <p className="text-sm text-gray-600 mt-1">{folder.description}</p>
                  )}
                  <p className="text-xs text-gray-500 capitalize">
                    {folder.folder_type.replace('_', ' ')}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteFolder(folder.id);
                  }}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Party Members */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {selectedFolder ? `${selectedFolder.name} Members` : 'Select a Folder'}
          </h2>
          {selectedFolder && (
            <button
              onClick={() => setShowAddMember(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
            >
              + Add Member
            </button>
          )}
        </div>

        {selectedFolder ? (
          <>
            {showAddMember && (
              <div className="mb-4 p-4 border rounded-lg bg-gray-50">
                <h3 className="font-semibold mb-2">Add Member</h3>
                <div className="space-y-2">
                  {getAvailableCharacters().map(char => (
                    <div key={char.id} className="flex justify-between items-center p-2 border rounded">
                      <div>
                        <span className="font-medium">{char.name}</span>
                        <span className="text-sm text-gray-600 ml-2">
                          ({char.race} {char.class})
                        </span>
                      </div>
                      <button
                        onClick={() => handleAddMember(char.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-sm"
                      >
                        Add
                      </button>
                    </div>
                  ))}
                  {getAvailableCharacters().length === 0 && (
                    <p className="text-gray-500 text-sm">No available characters to add</p>
                  )}
                </div>
                <button
                  onClick={() => setShowAddMember(false)}
                  className="mt-2 bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
                >
                  Done
                </button>
              </div>
            )}

            <div className="space-y-2">
              {getPartyMembers().map(({ membership, character }) => (
                <div key={membership.id} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className={`font-medium ${membership.active ? '' : 'opacity-50'}`}>
                          {character!.name}
                        </span>
                        {!membership.active && (
                          <span className="text-xs bg-gray-200 px-2 py-1 rounded">Inactive</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {character!.race} {character!.class} (Level {character!.level})
                      </p>
                      <div className="text-xs text-gray-500 mt-1">
                        Active DP: {character!.computed.active_dp} |
                        Passive DP: {character!.computed.passive_dp} |
                        Spirit: {character!.computed.spirit_pts}
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => toggleMemberActive(character!.id)}
                        className={`px-2 py-1 rounded text-xs ${
                          membership.active
                            ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                            : 'bg-green-500 hover:bg-green-600 text-white'
                        }`}
                      >
                        {membership.active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleRemoveMember(character!.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {getPartyMembers().length === 0 && (
                <p className="text-gray-500 text-center py-4">No members in this folder</p>
              )}
            </div>
          </>
        ) : (
          <p className="text-gray-500 text-center py-8">
            Select a folder to view and manage its members
          </p>
        )}
      </div>

      {/* Party Stats */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">Party Defense Profile</h2>

        {partyDefense && selectedFolder ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded">
                <div className="text-2xl font-bold text-blue-600">
                  {partyDefense.total_active_dp}
                </div>
                <div className="text-sm text-gray-600">Total Active DP</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded">
                <div className="text-2xl font-bold text-green-600">
                  {partyDefense.total_passive_dp}
                </div>
                <div className="text-sm text-gray-600">Total Passive DP</div>
              </div>
            </div>

            <div className="text-center p-3 bg-purple-50 rounded">
              <div className="text-2xl font-bold text-purple-600">
                {partyDefense.total_spirit_pts}
              </div>
              <div className="text-sm text-gray-600">Total Spirit Points</div>
            </div>

            <div className="text-center p-3 bg-gray-50 rounded">
              <div className={`text-lg font-bold ${getThreatColor(partyDefense.defense_tier)}`}>
                {partyDefense.defense_tier}
              </div>
              <div className="text-sm text-gray-600">Defense Tier</div>
              <div className="text-xs text-gray-500 mt-1">
                {partyDefense.character_count} active members
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Character Breakdown</h3>
              <div className="space-y-2">
                {partyDefense.character_breakdown.map(char => (
                  <div key={char.id} className="text-sm p-2 bg-gray-50 rounded">
                    <div className="font-medium">{char.name}</div>
                    <div className="text-xs text-gray-600">
                      A:{char.active_dp} | P:{char.passive_dp} | S:{char.spirit_pts}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-xs text-gray-500 mt-4 p-3 bg-gray-50 rounded">
              <strong>Defense Calculation:</strong><br/>
              Active DP = Prowess + Agility + Melee<br/>
              Passive DP = Fortitude + Endurance + Strength<br/>
              Spirit Points = Competence + Willpower
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            Select a folder with members to view party stats
          </p>
        )}
      </div>
    </div>
  );
}