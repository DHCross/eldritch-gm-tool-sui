import {
  getAllCharacters,
  getAllPartyFolders,
  getAllPartyMemberships,
} from './partyStorage';
import { SavedCharacter, PartyFolder } from '../types/party';

export interface CharacterInRoster extends SavedCharacter {
  partyId: string | null;
  partyName: string | null;
}

export interface PartyWithMembers extends PartyFolder {
  members: CharacterInRoster[];
}

export function prepareRosterData() {
  const allCharacters = getAllCharacters();
  const allParties = getAllPartyFolders();
  const allMemberships = getAllPartyMemberships();

  const characterMap = new Map<string, SavedCharacter>(
    allCharacters.map((char) => [char.id, char])
  );
  const partyMap = new Map<string, PartyFolder>(
    allParties.map((party) => [party.id, party])
  );

  const charactersWithPartyInfo: CharacterInRoster[] = allCharacters.map(
    (char) => {
      const membership = allMemberships.find((m) => m.character_id === char.id);
      const party = membership ? partyMap.get(membership.party_id) : null;
      return {
        ...char,
        partyId: party ? party.id : null,
        partyName: party ? party.name : null,
      };
    }
  );

  const unassignedCharacters = charactersWithPartyInfo.filter(
    (char) => !char.partyId
  );

  const partiesWithMembers: PartyWithMembers[] = allParties
    .filter((party) => party.folder_type === 'PC_party')
    .map((party) => {
      const memberIds = allMemberships
        .filter((m) => m.party_id === party.id)
        .map((m) => m.character_id);
      const members = memberIds
        .map((id) =>
          charactersWithPartyInfo.find((char) => char.id === id)
        )
        .filter((char): char is CharacterInRoster => !!char);
      return {
        ...party,
        members,
      };
    });

  return {
    unassignedCharacters,
    partiesWithMembers,
    allCharacters: charactersWithPartyInfo,
  };
}
