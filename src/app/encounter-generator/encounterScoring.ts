// src/app/encounter-generator/encounterScoring.ts

/**
 * Advanced Encounter Scoring System
 * Evaluates and ranks encounters based on party composition and challenge.
 */

import { SavedCharacter, MonsterData } from '../../types/party';

export interface EncounterScoreResult {
  score: number;
  details: string;
}

/**
 * Example scoring function: considers party average level, monster threat, and defense profile
 */
export function scoreEncounter(party: SavedCharacter[], monsters: MonsterData[]): EncounterScoreResult {
  // Calculate party average level
  const avgLevel = party.length ? party.reduce((sum, pc) => sum + pc.level, 0) / party.length : 1;
  // Sum monster threat values
  const totalThreat = monsters.reduce((sum, m) => {
    const threatVal = typeof m.full_data?.threat === 'number' ? m.full_data.threat : 0;
    return sum + threatVal;
  }, 0);
  // Calculate party defense (simple sum for now)
  const partyDefense = party.reduce((sum, pc) => sum + (pc.computed.active_dp + pc.computed.passive_dp), 0);

  // Score formula: higher score = more challenging
  // Example: score = (totalThreat * 2) / (partyDefense * avgLevel)
  const score = partyDefense > 0 ? (totalThreat * 2) / (partyDefense * avgLevel) : 0;
  const details = `Party Avg Level: ${avgLevel.toFixed(2)}, Total Threat: ${totalThreat}, Party Defense: ${partyDefense}`;

  // Add more advanced logic as needed (e.g., monster abilities, resistances, party composition)

  return { score, details };
}
