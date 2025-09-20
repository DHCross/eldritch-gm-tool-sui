import { describe, it, expect } from 'vitest';

// Example: import EncounterGenerator from '../src/js/gm-tools.js';
// For now, we'll test a simple dice roll utility

function rollDice(sides) {
  return Math.floor(Math.random() * sides) + 1;
}

describe('Encounter Generator', () => {
  it('rollDice returns a value between 1 and sides', () => {
    for (let i = 0; i < 100; i++) {
      const result = rollDice(6);
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(6);
    }
  });
});
