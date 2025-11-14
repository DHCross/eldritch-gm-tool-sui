
import { describe, it, expect } from 'vitest';
import { calculateCPSpent, createCharacterShell } from '../src/utils/characterBuild';

describe('calculateCPSpent', () => {
  it('correctly calculates the CP spent on a character', () => {
    const { character: baseCharacter } = createCharacterShell('Human', 'Warrior', 1);
    const finalCharacter = JSON.parse(JSON.stringify(baseCharacter));

    finalCharacter.abilities.Prowess = 'd10';
    finalCharacter.specialties.Prowess.Melee = 'd8';
    finalCharacter.focuses.Prowess.Threat = '+2';

    const spent = calculateCPSpent(finalCharacter, baseCharacter, false);

    expect(spent.total).toBe(22);
  });
});
