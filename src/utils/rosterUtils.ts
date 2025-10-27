import type { DetailedNPC } from '../data/npcData';
import type {
  ArmorDefenseSystem,
  EnhancedThreatDice,
  SpecialAbilities,
  TreasureCache
} from '../data/monsterData';
import {
  getAllCharacters,
  getAllPartyFolders,
  getAllPartyMemberships
} from './partyStorage';
import type {
  CreatureCategory,
  CreatureNature,
  CreatureSize,
  PartyFolder,
  SavedCharacter
} from '../types/party';

export interface CharacterInRoster extends SavedCharacter {
  partyId: string | null;
  partyName: string | null;
}

export interface PartyWithMembers extends PartyFolder {
  members: CharacterInRoster[];
}

export type RosterEntryCategory = 'PC' | 'NPC' | 'Monster';
export type RosterFolderType = RosterEntryCategory | 'General';

export interface RosterEntry {
  id: string;
  name: string;
  type: RosterEntryCategory;
  folderName: string;
  summary?: string;
  AD?: number;
  PD?: number;
  spiritPoints?: number;
  threatMV?: number;
  tags?: string[];
  data: unknown;
  createdAt: string;
  updatedAt: string;
}

export interface RosterFolder {
  id: string;
  name: string;
  type: RosterFolderType;
  entries: string[];
  pcs?: string[];
  createdAt: string;
  updatedAt: string;
}

export const ROSTER_STORAGE_KEYS = {
  FOLDERS: 'eldritch_roster_folders',
  PCS: 'eldritch_roster_entries'
} as const;

const DEFAULT_FOLDERS: Array<{ name: string; type: RosterFolderType }> = [
  { name: 'NPCs', type: 'NPC' },
  { name: 'Monsters', type: 'Monster' }
];

const FALLBACK_TIMESTAMP = '1970-01-01T00:00:00.000Z';

type MovementDetails = {
  baseMovement: number;
  speedFocusBonus: number;
  especiallySpeedy: boolean;
  finalMovement: number;
  movementActions: Record<string, { squares: number; penalty: string }>;
};

export interface MonsterRosterPayload {
  name: string;
  category: CreatureCategory;
  nature: CreatureNature;
  size: CreatureSize;
  AD: number;
  PD: number;
  summary: string;
  threatDice: EnhancedThreatDice;
  armorDefense: ArmorDefenseSystem;
  specialAbilities: SpecialAbilities;
  movement: MovementDetails;
  treasureCache?: TreasureCache;
  notes?: string;
  qsbString?: string;
  enhanced?: boolean;
  threatMV?: number;
}

function generateRosterId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function safeParseJSON<T>(value: string | null, fallback: T): T {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.warn('Failed to parse roster JSON value', error);
    return fallback;
  }
}

function dedupeEntries(entries: string[]): string[] {
  return Array.from(new Set(entries.filter((entry): entry is string => typeof entry === 'string' && entry.trim() !== '')));
}

function normalizeFolder(raw: unknown, index: number): RosterFolder {
  if (!raw || typeof raw !== 'object') {
    const fallbackName = `Folder ${index + 1}`;
    return {
      id: generateRosterId('folder'),
      name: fallbackName,
      type: 'General',
      entries: [],
      pcs: [],
      createdAt: FALLBACK_TIMESTAMP,
      updatedAt: FALLBACK_TIMESTAMP
    };
  }

  const obj = raw as Record<string, unknown>;
  const name = typeof obj.name === 'string' && obj.name.trim() !== '' ? obj.name.trim() : `Folder ${index + 1}`;
  const typeCandidate = typeof obj.type === 'string' ? (obj.type as RosterFolderType) : undefined;
  const type: RosterFolderType = typeCandidate && ['PC', 'NPC', 'Monster', 'General'].includes(typeCandidate)
    ? typeCandidate
    : 'General';

  let entries: string[] = [];
  if (Array.isArray(obj.entries)) {
    entries = obj.entries as string[];
  } else if (Array.isArray(obj.pcs)) {
    entries = obj.pcs as string[];
  }

  const normalizedEntries = dedupeEntries(entries);
  const id = typeof obj.id === 'string' && obj.id.trim() !== ''
    ? obj.id
    : generateRosterId(`folder-${name.toLowerCase().replace(/\s+/g, '-')}`);

  const createdAt = typeof obj.createdAt === 'string'
    ? obj.createdAt
    : typeof obj.created_at === 'string'
      ? obj.created_at
      : FALLBACK_TIMESTAMP;

  const updatedAt = typeof obj.updatedAt === 'string'
    ? obj.updatedAt
    : typeof obj.updated_at === 'string'
      ? obj.updated_at
      : createdAt;

  return {
    id,
    name,
    type,
    entries: normalizedEntries,
    pcs: normalizedEntries,
    createdAt,
    updatedAt
  };
}

function normalizeEntry(id: string, raw: unknown): RosterEntry {
  if (!raw || typeof raw !== 'object') {
    return {
      id,
      name: 'Unnamed Entry',
      type: 'PC',
      folderName: 'Roster',
      summary: undefined,
      AD: undefined,
      PD: undefined,
      spiritPoints: undefined,
      threatMV: undefined,
      tags: undefined,
      data: raw ?? {},
      createdAt: FALLBACK_TIMESTAMP,
      updatedAt: FALLBACK_TIMESTAMP
    };
  }

  const obj = raw as Record<string, unknown>;
  const typeCandidate = typeof obj.type === 'string' ? (obj.type as RosterEntryCategory) : undefined;
  const type: RosterEntryCategory = typeCandidate && ['PC', 'NPC', 'Monster'].includes(typeCandidate)
    ? typeCandidate
    : 'PC';

  const tags = Array.isArray(obj.tags)
    ? (obj.tags as unknown[]).filter((tag): tag is string => typeof tag === 'string')
    : undefined;

  return {
    id,
    name: typeof obj.name === 'string' && obj.name.trim() !== '' ? obj.name.trim() : 'Unnamed Entry',
    type,
    folderName: typeof obj.folderName === 'string' && obj.folderName.trim() !== ''
      ? obj.folderName.trim()
      : typeof obj.folder === 'string' && obj.folder.trim() !== ''
        ? obj.folder.trim()
        : 'Roster',
    summary: typeof obj.summary === 'string' ? obj.summary : undefined,
    AD: typeof obj.AD === 'number' ? obj.AD : undefined,
    PD: typeof obj.PD === 'number' ? obj.PD : undefined,
    spiritPoints: typeof obj.spiritPoints === 'number' ? obj.spiritPoints : undefined,
    threatMV: typeof obj.threatMV === 'number' ? obj.threatMV : undefined,
    tags,
    data: 'data' in obj ? obj.data : obj,
    createdAt: typeof obj.createdAt === 'string'
      ? obj.createdAt
      : typeof obj.created_at === 'string'
        ? obj.created_at
        : FALLBACK_TIMESTAMP,
    updatedAt: typeof obj.updatedAt === 'string'
      ? obj.updatedAt
      : typeof obj.updated_at === 'string'
        ? obj.updated_at
        : FALLBACK_TIMESTAMP
  };
}

function readFolders(): RosterFolder[] {
  if (typeof window === 'undefined') {
    return [];
  }

  const stored = safeParseJSON<unknown[]>(
    window.localStorage.getItem(ROSTER_STORAGE_KEYS.FOLDERS),
    []
  );

  return stored.map((folder, index) => normalizeFolder(folder, index));
}

function writeFolders(folders: RosterFolder[]): void {
  if (typeof window === 'undefined') {
    return;
  }

  const payload = folders.map(folder => ({
    id: folder.id,
    name: folder.name,
    type: folder.type,
    entries: folder.entries,
    pcs: folder.entries,
    createdAt: folder.createdAt,
    updatedAt: folder.updatedAt
  }));

  window.localStorage.setItem(ROSTER_STORAGE_KEYS.FOLDERS, JSON.stringify(payload));
}

function readEntries(): Record<string, RosterEntry> {
  if (typeof window === 'undefined') {
    return {};
  }

  const stored = safeParseJSON<Record<string, unknown>>(
    window.localStorage.getItem(ROSTER_STORAGE_KEYS.PCS),
    {}
  );

  const entries: Record<string, RosterEntry> = {};
  Object.entries(stored).forEach(([id, raw]) => {
    entries[id] = normalizeEntry(id, raw);
  });
  return entries;
}

function writeEntries(entries: Record<string, RosterEntry>): void {
  if (typeof window === 'undefined') {
    return;
  }

  const payload = Object.fromEntries(
    Object.entries(entries).map(([id, entry]) => [
      id,
      {
        id: entry.id,
        name: entry.name,
        type: entry.type,
        folderName: entry.folderName,
        summary: entry.summary,
        AD: entry.AD,
        PD: entry.PD,
        spiritPoints: entry.spiritPoints,
        threatMV: entry.threatMV,
        tags: entry.tags,
        data: entry.data,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt
      }
    ])
  );

  window.localStorage.setItem(ROSTER_STORAGE_KEYS.PCS, JSON.stringify(payload));
}

function ensureDefaultFolders(): RosterFolder[] {
  if (typeof window === 'undefined') {
    return DEFAULT_FOLDERS.map((folder, index) => ({
      id: `default-${index}`,
      name: folder.name,
      type: folder.type,
      entries: [],
      pcs: [],
      createdAt: FALLBACK_TIMESTAMP,
      updatedAt: FALLBACK_TIMESTAMP
    }));
  }

  const folders = readFolders();
  let mutated = false;
  const now = new Date().toISOString();

  DEFAULT_FOLDERS.forEach(defaultFolder => {
    const existing = folders.find(folder => folder.name.toLowerCase() === defaultFolder.name.toLowerCase());
    if (!existing) {
      folders.push({
        id: generateRosterId('folder'),
        name: defaultFolder.name,
        type: defaultFolder.type,
        entries: [],
        pcs: [],
        createdAt: now,
        updatedAt: now
      });
      mutated = true;
    } else if (defaultFolder.type !== 'General' && existing.type === 'General') {
      existing.type = defaultFolder.type;
      existing.updatedAt = now;
      mutated = true;
    }
  });

  if (mutated) {
    writeFolders(folders);
  }

  return folders;
}

function getOrCreateFolder(
  folders: RosterFolder[],
  folderName: string,
  type: RosterFolderType
): RosterFolder {
  const normalizedName = folderName.trim();
  const targetName = normalizedName !== ''
    ? normalizedName
    : type === 'NPC'
      ? 'NPCs'
      : type === 'Monster'
        ? 'Monsters'
        : 'Roster';

  const existing = folders.find(folder => folder.name.toLowerCase() === targetName.toLowerCase());
  if (existing) {
    if (type !== 'General' && existing.type === 'General') {
      existing.type = type;
      existing.updatedAt = new Date().toISOString();
    }
    return existing;
  }

  const now = new Date().toISOString();
  const folder: RosterFolder = {
    id: generateRosterId('folder'),
    name: targetName,
    type,
    entries: [],
    pcs: [],
    createdAt: now,
    updatedAt: now
  };

  folders.push(folder);
  return folder;
}

function updateFolderEntries(folder: RosterFolder, entryId: string): void {
  if (!folder.entries.includes(entryId)) {
    folder.entries.push(entryId);
    folder.entries = dedupeEntries(folder.entries);
    folder.pcs = folder.entries;
    folder.updatedAt = new Date().toISOString();
  }
}

export function getFolderList(): string[] {
  if (typeof window === 'undefined') {
    return DEFAULT_FOLDERS.map(folder => folder.name);
  }

  const folders = ensureDefaultFolders();
  const names = folders.map(folder => folder.name);
  DEFAULT_FOLDERS.forEach(defaultFolder => {
    if (!names.includes(defaultFolder.name)) {
      names.push(defaultFolder.name);
    }
  });

  return Array.from(new Set(names)).sort((a, b) => a.localeCompare(b));
}

export function createCustomFolder(name: string, type: RosterFolderType = 'General'): boolean {
  const trimmedName = name.trim();
  if (trimmedName === '' || typeof window === 'undefined') {
    return false;
  }

  const folders = ensureDefaultFolders();
  const exists = folders.some(folder => folder.name.toLowerCase() === trimmedName.toLowerCase());
  if (exists) {
    return false;
  }

  const now = new Date().toISOString();
  folders.push({
    id: generateRosterId('folder'),
    name: trimmedName,
    type,
    entries: [],
    pcs: [],
    createdAt: now,
    updatedAt: now
  });

  writeFolders(folders);
  return true;
}

export function saveNPCToRoster(npc: DetailedNPC, folderName: string): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const folders = ensureDefaultFolders();
    const folder = getOrCreateFolder(folders, folderName, 'NPC');
    const entries = readEntries();

    const id = generateRosterId('npc');
    const now = new Date().toISOString();
    const summaryParts = [
      npc.role,
      npc.level ? `Level ${npc.level}` : undefined,
      npc.race
    ].filter(Boolean);

    const entry: RosterEntry = {
      id,
      name: npc.name || `NPC ${npc.id}`,
      type: 'NPC',
      folderName: folder.name,
      summary: summaryParts.join(' • '),
      AD: npc.activeDefense,
      PD: npc.passiveDefense,
      spiritPoints: npc.spiritPoints,
      data: npc,
      createdAt: now,
      updatedAt: now
    };

    entries[id] = entry;
    updateFolderEntries(folder, id);

    writeEntries(entries);
    writeFolders(folders);
    return true;
  } catch (error) {
    console.error('Error saving NPC to roster:', error);
    return false;
  }
}

export function saveMonsterToRoster(monster: MonsterRosterPayload, folderName: string): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const folders = ensureDefaultFolders();
    const folder = getOrCreateFolder(folders, folderName, 'Monster');
    const entries = readEntries();

    const id = generateRosterId('monster');
    const now = new Date().toISOString();

    const entry: RosterEntry = {
      id,
      name: monster.name,
      type: 'Monster',
      folderName: folder.name,
      summary: monster.summary,
      AD: monster.AD,
      PD: monster.PD,
      threatMV: monster.threatMV,
      data: monster,
      createdAt: now,
      updatedAt: now
    };

    entries[id] = entry;
    updateFolderEntries(folder, id);

    writeEntries(entries);
    writeFolders(folders);
    return true;
  } catch (error) {
    console.error('Error saving monster to roster:', error);
    return false;
  }
}

export function getAllRosterFolders(): RosterFolder[] {
  if (typeof window === 'undefined') {
    return [];
  }

  return ensureDefaultFolders();
}

export function getAllRosterEntries(): Record<string, RosterEntry> {
  if (typeof window === 'undefined') {
    return {};
  }

  return readEntries();
}

export function prepareRosterData() {
  const allCharacters = getAllCharacters();
  const allParties = getAllPartyFolders();
  const allMemberships = getAllPartyMemberships();

  const partyMap = new Map<string, PartyFolder>(
    allParties.map(party => [party.id, party])
  );

  const charactersWithPartyInfo: CharacterInRoster[] = allCharacters.map(char => {
    const membership = allMemberships.find(m => m.character_id === char.id);
    const party = membership ? partyMap.get(membership.party_id) : null;
    return {
      ...char,
      partyId: party ? party.id : null,
      partyName: party ? party.name : null
    };
  });

  const unassignedCharacters = charactersWithPartyInfo.filter(char => !char.partyId);

  const partiesWithMembers: PartyWithMembers[] = allParties
    .filter(party => party.folder_type === 'PC_party')
    .map(party => {
      const memberIds = allMemberships
        .filter(m => m.party_id === party.id)
        .map(m => m.character_id);
      const members = memberIds
        .map(id => charactersWithPartyInfo.find(char => char.id === id))
        .filter((char): char is CharacterInRoster => !!char);
      return {
        ...party,
        members
      };
    });

  return {
    unassignedCharacters,
    partiesWithMembers,
    allCharacters: charactersWithPartyInfo
  };
}
