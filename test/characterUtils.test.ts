
import { describe, it, expect } from 'vitest';

import {
  classes,
  costToRankUpDie,
  costToRankUpFocus,
  races
} from '../src/data/gameData';
import { createEmptyCharacter, validateCharacterBuild } from '../src/utils/characterUtils';

describe('Eldritch data regressions', () => {
  it('keeps Human minima aligned with rules', () => {
    expect(races.Human.minima.Competence).toBe('d6');
    expect(races.Human.minima.Prowess).toBe('d6');
    expect(races.Human.minima.Threat).toBe('+1');
  });

  it('keeps Warrior minima aligned with rules', () => {
    expect(classes.Warrior.minima.Prowess).toBe('d8');
    expect(classes.Warrior.minima.Melee).toBe('d6');
    expect(classes.Warrior.minima.Threat).toBe('+1');
  });

  it('enforces CP upgrade costs', () => {
    expect(costToRankUpDie.d4).toBe(6);
    expect(costToRankUpDie.d6).toBe(8);
    expect(costToRankUpDie.d8).toBe(10);
    expect(costToRankUpDie.d10).toBe(12);
    expect(costToRankUpFocus).toBe(4);
  });

  it('flags characters that fall below Eldritch minima', () => {
    const character = createEmptyCharacter();
    character.race = 'Human';
    character.class = 'Warrior';
    character.abilities.Competence = 'd4';
    character.focuses.Prowess.Threat = '+0';

    const warnings = validateCharacterBuild(character);
    expect(warnings).toContainEqual(expect.stringContaining('Competence is below racial minimum (d6)'));
    expect(warnings).toContainEqual(expect.stringContaining('Threat focus is below class minimum (+1)'));
  });
});
