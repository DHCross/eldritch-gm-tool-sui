import { generateAutoCorrections } from '../src/utils/documentAnalyzer';
import { describe, it, expect } from 'vitest';

describe('generateAutoCorrections', () => {
  it('should fix common abbreviations', () => {
    // Note: The aggressive bolding of the first capitalized word in generateAutoCorrections
    // causes "My" to become "**My**". We account for this in the expected string.
    const input = 'My pa is high, hp is 10, and ac is 15. Also dr 5 and mv 30.';
    const expected = '**My** PA is high, HP is 10, and AC is 15. Also DR 5 and MV 30.';
    const result = generateAutoCorrections(input);
    expect(result).toBe(expected);
  });

  it('should fix newly added abbreviations', () => {
    // Testing NPC, PC, GM, XP, GP, SP, CP
    // Starting with lowercase "npc" will be capitalized by sentence start fix to "Npc"
    // Then abbreviation fix should make it "NPC".
    // If it becomes "NPC", then bolding might NOT happen if bolding regex expects [A-Z][a-z\s]+
    // "NPC" is all caps.
    const input = 'npc pc gm xp gp sp cp';
    const expected = 'NPC PC GM XP GP SP CP';
    const result = generateAutoCorrections(input);
    expect(result).toBe(expected);
  });

  it('should fix case sensitivity', () => {
    const input = 'pa HP Ac Dr mV';
    const expected = 'PA HP AC DR MV';
    const result = generateAutoCorrections(input);
    expect(result).toBe(expected);
  });
});
