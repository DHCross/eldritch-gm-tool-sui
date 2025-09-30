// Storage utilities for party management system

import {
  SavedCharacter,
  MonsterData,
  PartyFolder,
  PartyMembership,
  PartyDefenseProfile,
  EncounterTemplate,
  ComputedStats,
  FolderType
} from '../types/party';

// Storage keys
export const STORAGE_KEYS = {
  CHARACTERS: 'eldritch_characters',
  PARTY_FOLDERS: 'eldritch_party_folders',
  PARTY_MEMBERSHIPS: 'eldritch_party_memberships',
  ENCOUNTER_TEMPLATES: 'eldritch_encounter_templates',
} as const;

// Utility functions
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function getCurrentUserId(): string {
  // For now, use a single user. In a real app, this would come from auth
  return 'default_user';
}

// Character storage functions
export function saveCharacter(character: SavedCharacter): void {
  const characters = getAllCharacters();
  const existingIndex = characters.findIndex(c => c.id === character.id);

  if (existingIndex >= 0) {
    characters[existingIndex] = { ...character, updated_at: new Date().toISOString() };
  } else {
    characters.push(character);
  }

  localStorage.setItem(STORAGE_KEYS.CHARACTERS, JSON.stringify(characters));
}

export function getAllCharacters(): SavedCharacter[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CHARACTERS);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading characters:', error);
    return [];
  }
}

export function getCharacterById(id: string): SavedCharacter | null {
  const characters = getAllCharacters();
  return characters.find(c => c.id === id) || null;
}

export function getCharactersByType(type: 'PC' | 'NPC' | 'Monster'): SavedCharacter[] {
  return getAllCharacters().filter(c => c.type === type);
}

export function deleteCharacter(id: string): void {
  const characters = getAllCharacters().filter(c => c.id !== id);
  localStorage.setItem(STORAGE_KEYS.CHARACTERS, JSON.stringify(characters));

  // Also remove from any party memberships
  const memberships = getAllPartyMemberships().filter(m => m.character_id !== id);
  localStorage.setItem(STORAGE_KEYS.PARTY_MEMBERSHIPS, JSON.stringify(memberships));
}

// Party folder functions
export function savePartyFolder(folder: PartyFolder): void {
  const folders = getAllPartyFolders();
  const existingIndex = folders.findIndex(f => f.id === folder.id);

  if (existingIndex >= 0) {
    folders[existingIndex] = { ...folder, updated_at: new Date().toISOString() };
  } else {
    folders.push(folder);
  }

  localStorage.setItem(STORAGE_KEYS.PARTY_FOLDERS, JSON.stringify(folders));
}

export function getAllPartyFolders(): PartyFolder[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PARTY_FOLDERS);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading party folders:', error);
    return [];
  }
}

export function getPartyFoldersByType(type: FolderType): PartyFolder[] {
  return getAllPartyFolders().filter(f => f.folder_type === type);
}

export function deletePartyFolder(id: string): void {
  const folders = getAllPartyFolders().filter(f => f.id !== id);
  localStorage.setItem(STORAGE_KEYS.PARTY_FOLDERS, JSON.stringify(folders));

  // Also remove all memberships for this party
  const memberships = getAllPartyMemberships().filter(m => m.party_id !== id);
  localStorage.setItem(STORAGE_KEYS.PARTY_MEMBERSHIPS, JSON.stringify(memberships));
}

// Party membership functions
export function savePartyMembership(membership: PartyMembership): void {
  const memberships = getAllPartyMemberships();
  const existingIndex = memberships.findIndex(m =>
    m.party_id === membership.party_id && m.character_id === membership.character_id
  );

  if (existingIndex >= 0) {
    memberships[existingIndex] = membership;
  } else {
    memberships.push(membership);
  }

  localStorage.setItem(STORAGE_KEYS.PARTY_MEMBERSHIPS, JSON.stringify(memberships));
}

export function getAllPartyMemberships(): PartyMembership[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PARTY_MEMBERSHIPS);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading party memberships:', error);
    return [];
  }
}

export function getPartyMemberships(partyId: string): PartyMembership[] {
  return getAllPartyMemberships()
    .filter(m => m.party_id === partyId)
    .sort((a, b) => a.order_index - b.order_index);
}

export function getCharacterMemberships(characterId: string): PartyMembership[] {
  return getAllPartyMemberships().filter(m => m.character_id === characterId);
}

export function removePartyMembership(partyId: string, characterId: string): void {
  const memberships = getAllPartyMemberships().filter(m =>
    !(m.party_id === partyId && m.character_id === characterId)
  );
  localStorage.setItem(STORAGE_KEYS.PARTY_MEMBERSHIPS, JSON.stringify(memberships));
}

// Party analysis functions
export function calculateComputedStats(abilities: Record<string, unknown>): ComputedStats {
  // Extract MV values from abilities (convert die ranks to numbers)
  const getMV = (value: unknown): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string' && value.startsWith('d')) {
      return parseInt(value.slice(1), 10);
    }
    return 4; // Default to d4
  };

  const prowess_mv = getMV(abilities.Prowess || abilities.prowess_mv || 4);
  const agility_mv = getMV(abilities.Agility || abilities.agility_mv || 4);
  const melee_mv = getMV(abilities.Melee || abilities.melee_mv || 4);
  const fortitude_mv = getMV(abilities.Fortitude || abilities.fortitude_mv || 4);
  const endurance_mv = getMV(abilities.Endurance || abilities.endurance_mv || 4);
  const strength_mv = getMV(abilities.Strength || abilities.strength_mv || 4);
  const competence_mv = getMV(abilities.Competence || abilities.competence_mv || 4);
  const willpower_mv = getMV(abilities.Willpower || abilities.willpower_mv || 4);

  return {
    active_dp: prowess_mv + agility_mv + melee_mv,
    passive_dp: fortitude_mv + endurance_mv + strength_mv,
    spirit_pts: competence_mv + willpower_mv
  };
}

export function calculatePartyDefenseProfile(characterIds: string[]): PartyDefenseProfile {
  const characters = characterIds.map(id => getCharacterById(id)).filter(Boolean) as SavedCharacter[];

  let total_active_dp = 0;
  let total_passive_dp = 0;
  let total_spirit_pts = 0;

  const character_breakdown = characters.map(char => {
    const stats = char.computed;
    total_active_dp += stats.active_dp;
    total_passive_dp += stats.passive_dp;
    total_spirit_pts += stats.spirit_pts;

    return {
      id: char.id,
      name: char.name,
      active_dp: stats.active_dp,
      passive_dp: stats.passive_dp,
      spirit_pts: stats.spirit_pts
    };
  });

  // Determine defense tier based on total defensive capability
  const total_defense = total_active_dp + total_passive_dp;
  const avg_defense_per_char = characters.length > 0 ? total_defense / characters.length : 0;

  let defense_tier: PartyDefenseProfile['defense_tier'] = 'Practitioner';
  if (avg_defense_per_char >= 30) defense_tier = 'Elite';
  else if (avg_defense_per_char >= 24) defense_tier = 'Advanced';
  else if (avg_defense_per_char >= 18) defense_tier = 'Proficient';
  else if (avg_defense_per_char >= 12) defense_tier = 'Competent';

  return {
    total_active_dp,
    total_passive_dp,
    total_spirit_pts,
    character_count: characters.length,
    character_breakdown,
    defense_tier
  };
}

export function getPartyCharacters(partyId: string): SavedCharacter[] {
  const memberships = getPartyMemberships(partyId);
  return memberships
    .filter(m => m.active)
    .map(m => getCharacterById(m.character_id))
    .filter(Boolean) as SavedCharacter[];
}

// Encounter template functions
export function saveEncounterTemplate(template: EncounterTemplate): void {
  const templates = getAllEncounterTemplates();
  const existingIndex = templates.findIndex(t => t.id === template.id);

  if (existingIndex >= 0) {
    templates[existingIndex] = template;
  } else {
    templates.push(template);
  }

  localStorage.setItem(STORAGE_KEYS.ENCOUNTER_TEMPLATES, JSON.stringify(templates));
}

export function getAllEncounterTemplates(): EncounterTemplate[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.ENCOUNTER_TEMPLATES);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading encounter templates:', error);
    return [];
  }
}

// Monster helper functions
export function saveMonster(monsterData: MonsterData): void {
  saveCharacter(monsterData);
}

export function getMonstersByTrope(trope: string): MonsterData[] {
  return getAllCharacters()
    .filter(c => c.type === 'Monster')
    .filter(c => (c as MonsterData).monster_trope === trope) as MonsterData[];
}

export function getAvailableTropes(): string[] {
  const monsters = getCharactersByType('Monster') as MonsterData[];
  const tropes = new Set(monsters.map(m => m.monster_trope));
  return Array.from(tropes).sort();
}

// Initialize default party folders if none exist
export function initializeDefaultFolders(): void {
  const existing = getAllPartyFolders();
  if (existing.length === 0) {
    const defaultFolders: PartyFolder[] = [
      {
        id: generateId(),
        user_id: getCurrentUserId(),
        name: 'Main Party',
        folder_type: 'PC_party',
        description: 'Primary adventuring group',
        visibility: 'private',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: generateId(),
        user_id: getCurrentUserId(),
        name: 'Town NPCs',
        folder_type: 'NPC_roster',
        description: 'Recurring characters in settlements',
        visibility: 'private',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: generateId(),
        user_id: getCurrentUserId(),
        name: 'Humanoid Enemies',
        folder_type: 'Monster_trope',
        description: 'Bandits, guards, cultists',
        visibility: 'private',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    defaultFolders.forEach(folder => savePartyFolder(folder));
  }
}