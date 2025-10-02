import {
  EncounterTemplate,
  PartyFolder,
  PartyMembership,
  SavedCharacter
} from '@/types/party';
import {
  getAllCharacters,
  getAllEncounterTemplates,
  getAllPartyFolders,
  getAllPartyMemberships,
  STORAGE_KEYS
} from '@/utils/partyStorage';
import {
  ROSTER_STORAGE_KEYS,
  RosterEntry,
  RosterFolder,
  getAllRosterEntries,
  getAllRosterFolders
} from '@/utils/rosterUtils';

export interface CampaignBackupData {
  characters: SavedCharacter[];
  partyFolders: PartyFolder[];
  partyMemberships: PartyMembership[];
  encounterTemplates: EncounterTemplate[];
  rosterFolders: RosterFolder[];
  rosterEntries: Record<string, RosterEntry>;
  exportedAt: string;
  version: number;
}

export interface CampaignImportResult {
  success: boolean;
  error?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isCampaignBackup(payload: unknown): payload is CampaignBackupData {
  if (!isRecord(payload)) {
    return false;
  }

  const {
    characters,
    partyFolders,
    partyMemberships,
    encounterTemplates,
    rosterFolders,
    rosterEntries
  } = payload as Record<string, unknown>;

  const arraysAreValid =
    Array.isArray(characters) &&
    Array.isArray(partyFolders) &&
    Array.isArray(partyMemberships) &&
    Array.isArray(encounterTemplates) &&
    Array.isArray(rosterFolders);

  const rosterEntriesValid = isRecord(rosterEntries || {});

  return arraysAreValid && rosterEntriesValid;
}

export function exportCampaign(): CampaignBackupData {
  return {
    characters: getAllCharacters(),
    partyFolders: getAllPartyFolders(),
    partyMemberships: getAllPartyMemberships(),
    encounterTemplates: getAllEncounterTemplates(),
    rosterFolders: getAllRosterFolders(),
    rosterEntries: getAllRosterEntries(),
    exportedAt: new Date().toISOString(),
    version: 1
  };
}

export function importCampaign(payload: unknown): CampaignImportResult {
  try {
    if (!isCampaignBackup(payload)) {
      return { success: false, error: 'Invalid campaign backup format.' };
    }

    const campaign: CampaignBackupData = {
      ...payload,
      exportedAt:
        typeof (payload as CampaignBackupData).exportedAt === 'string'
          ? (payload as CampaignBackupData).exportedAt
          : new Date().toISOString(),
      version:
        typeof (payload as CampaignBackupData).version === 'number'
          ? (payload as CampaignBackupData).version
          : 1
    };

    const serialized = {
      characters: JSON.stringify(campaign.characters),
      partyFolders: JSON.stringify(campaign.partyFolders),
      partyMemberships: JSON.stringify(campaign.partyMemberships),
      encounterTemplates: JSON.stringify(campaign.encounterTemplates),
      rosterFolders: JSON.stringify(campaign.rosterFolders),
      rosterEntries: JSON.stringify(campaign.rosterEntries),
      selectedPartyMembers: JSON.stringify([])
    };

    const keys = [
      STORAGE_KEYS.CHARACTERS,
      STORAGE_KEYS.PARTY_FOLDERS,
      STORAGE_KEYS.PARTY_MEMBERSHIPS,
      STORAGE_KEYS.ENCOUNTER_TEMPLATES,
      STORAGE_KEYS.SELECTED_PARTY_MEMBERS,
      ROSTER_STORAGE_KEYS.FOLDERS,
      ROSTER_STORAGE_KEYS.PCS
    ];

    const previousValues = new Map<string, string | null>();
    keys.forEach(key => {
      previousValues.set(key, localStorage.getItem(key));
    });

    try {
      keys.forEach(key => {
        localStorage.removeItem(key);
      });

      localStorage.setItem(STORAGE_KEYS.CHARACTERS, serialized.characters);
      localStorage.setItem(STORAGE_KEYS.PARTY_FOLDERS, serialized.partyFolders);
      localStorage.setItem(STORAGE_KEYS.PARTY_MEMBERSHIPS, serialized.partyMemberships);
      localStorage.setItem(STORAGE_KEYS.ENCOUNTER_TEMPLATES, serialized.encounterTemplates);
      localStorage.setItem(STORAGE_KEYS.SELECTED_PARTY_MEMBERS, serialized.selectedPartyMembers);
      localStorage.setItem(ROSTER_STORAGE_KEYS.FOLDERS, serialized.rosterFolders);
      localStorage.setItem(ROSTER_STORAGE_KEYS.PCS, serialized.rosterEntries);
    } catch (error) {
      previousValues.forEach((value, key) => {
        if (value === null) {
          localStorage.removeItem(key);
        } else {
          localStorage.setItem(key, value);
        }
      });
      throw error;
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('eldritch-campaign-imported'));
    }

    return { success: true };
  } catch (error) {
    console.error('Error importing campaign backup:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error importing campaign.'
    };
  }
}
