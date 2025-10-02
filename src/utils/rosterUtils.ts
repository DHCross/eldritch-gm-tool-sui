// Utility functions for saving NPCs and Monsters to the roster system
// Integrates with the existing localStorage-based roster system

export interface RosterEntry {
  name: string;
  player?: string;
  gender?: string;
  summary?: string;
  AD: number;
  PD: number;
  details: {
    source: string;
    summary?: string;
    fullData?: unknown;
  };
}

export interface RosterFolder {
  name: string;
  pcs: string[];
}

interface GeneratorDetails {
  summary?: string;
}

export interface NPCLike {
  name?: string;
  gender?: string;
  summary?: string;
  AD?: number | string;
  PD?: number | string;
  details?: GeneratorDetails;
}

export interface MonsterLike extends NPCLike {
  category?: string;
  nature?: string;
}

const FOLDERS_KEY = 'eldritch_roster_folders';
const PCS_KEY = 'eldritch_roster_pcs';

export const ROSTER_STORAGE_KEYS = {
  FOLDERS: FOLDERS_KEY,
  PCS: PCS_KEY
} as const;

function loadFolders(): RosterFolder[] {
  return JSON.parse(localStorage.getItem(FOLDERS_KEY) || '[]');
}

function saveFolders(folders: RosterFolder[]): void {
  localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
}

function loadPCs(): Record<string, RosterEntry> {
  return JSON.parse(localStorage.getItem(PCS_KEY) || '{}');
}

function savePCs(pcs: Record<string, RosterEntry>): void {
  localStorage.setItem(PCS_KEY, JSON.stringify(pcs));
}

export function getAllRosterFolders(): RosterFolder[] {
  try {
    return loadFolders();
  } catch (error) {
    console.error('Error loading roster folders:', error);
    return [];
  }
}

export function getAllRosterEntries(): Record<string, RosterEntry> {
  try {
    return loadPCs();
  } catch (error) {
    console.error('Error loading roster entries:', error);
    return {};
  }
}

function findFolderIndexByName(folders: RosterFolder[], name: string): number {
  return folders.findIndex(folder => folder.name.toLowerCase() === name.toLowerCase());
}

export function saveNPCToRoster<T extends NPCLike>(npc: T, folderName: string = 'NPCs'): boolean {
  try {
    const pcs = loadPCs();
    const folders = loadFolders();

    // Create unique ID for the NPC
    const id = `npc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Convert NPC to roster entry format
    const rosterEntry: RosterEntry = {
      name: npc.name || 'Unnamed NPC',
      player: '', // NPCs don't have players
      gender: npc.gender || '',
      summary: npc.details?.summary || npc.summary || '',
      AD: Number(npc.AD || 0),
      PD: Number(npc.PD || 0),
      details: {
        source: 'npc-generator',
        summary: npc.details?.summary || npc.summary || '',
        fullData: npc
      }
    };

    // Save NPC
    pcs[id] = rosterEntry;
    savePCs(pcs);

    // Find or create folder
    let folderIdx = findFolderIndexByName(folders, folderName);
    if (folderIdx === -1) {
      folders.push({ name: folderName, pcs: [] });
      folderIdx = folders.length - 1;
    }

    // Add NPC to folder
    if (!folders[folderIdx].pcs.includes(id)) {
      folders[folderIdx].pcs.push(id);
    }

    saveFolders(folders);
    return true;
  } catch (error) {
    console.error('Error saving NPC to roster:', error);
    return false;
  }
}

export function saveMonsterToRoster<T extends MonsterLike>(monster: T, folderName: string = 'Monsters'): boolean {
  try {
    const pcs = loadPCs();
    const folders = loadFolders();

    // Create unique ID for the monster
    const id = `monster_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Convert Monster to roster entry format
    const rosterEntry: RosterEntry = {
      name: monster.name || 'Unnamed Monster',
      player: '', // Monsters don't have players
      gender: monster.gender || '',
      summary: monster.summary || `${monster.category || 'Unknown'} ${monster.nature || 'creature'}`,
      AD: Number(monster.AD || 0),
      PD: Number(monster.PD || 0),
      details: {
        source: 'monster-generator',
        summary: monster.summary || `${monster.category || 'Unknown'} ${monster.nature || 'creature'}`,
        fullData: monster
      }
    };

    // Save Monster
    pcs[id] = rosterEntry;
    savePCs(pcs);

    // Find or create folder
    let folderIdx = findFolderIndexByName(folders, folderName);
    if (folderIdx === -1) {
      folders.push({ name: folderName, pcs: [] });
      folderIdx = folders.length - 1;
    }

    // Add Monster to folder
    if (!folders[folderIdx].pcs.includes(id)) {
      folders[folderIdx].pcs.push(id);
    }

    saveFolders(folders);
    return true;
  } catch (error) {
    console.error('Error saving monster to roster:', error);
    return false;
  }
}

export function createCustomFolder(folderName: string): boolean {
  try {
    const folders = loadFolders();

    // Check if folder already exists
    if (findFolderIndexByName(folders, folderName) !== -1) {
      return false; // Folder already exists
    }

    // Create new folder
    folders.push({ name: folderName, pcs: [] });
    saveFolders(folders);
    return true;
  } catch (error) {
    console.error('Error creating custom folder:', error);
    return false;
  }
}

export function getFolderList(): string[] {
  try {
    const folders = loadFolders();
    return folders.map(folder => folder.name);
  } catch (error) {
    console.error('Error getting folder list:', error);
    return ['NPCs', 'Monsters']; // Default folders
  }
}

export function getRosterStats(): { totalEntries: number; folders: number } {
  try {
    const pcs = loadPCs();
    const folders = loadFolders();

    return {
      totalEntries: Object.keys(pcs).length,
      folders: folders.length
    };
  } catch (error) {
    console.error('Error getting roster stats:', error);
    return { totalEntries: 0, folders: 0 };
  }
}