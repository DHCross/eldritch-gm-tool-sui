
import { describe, it, expect } from 'vitest';
import {
  calculateCPSpent,
  createCharacterShell,
  getAdvantages,
  getCreationRuleSummary,
  getCrossDisciplineSpellcastingSummary,
  getCustomizationBudget,
  getFocusSwapCPCost,
  getMulticlassFeatCost
} from '../src/utils/characterBuild';

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

  it('counts custom focus bonuses from a zero baseline', () => {
    const { character, baseCharacter } = createCharacterShell('Human', 'Warrior', 1);
    const finalCharacter = JSON.parse(JSON.stringify(character));

    finalCharacter.customFocuses.push({
      id: 'custom-focus-1',
      ability: 'Competence',
      specialty: 'Expertise',
      name: 'Diplomacy',
      value: '+2'
    });

    const spent = calculateCPSpent(finalCharacter, baseCharacter, false);

    expect(spent.focuses).toBe(8);
  });
});

describe('creation rule helpers', () => {
  it('detects duplicate minima and focus swap targets for Human Warrior', () => {
    const summary = getCreationRuleSummary('Human', 'Warrior');

    expect(summary.duplicateBenefitAvailable).toBe(true);
    expect(summary.singleSpecialtyFocusSwap).toBe(true);
    expect(summary.duplicateMinima).toContainEqual(
      expect.objectContaining({ key: 'Threat', value: '+1', kind: 'focus' })
    );
    expect(summary.focusSwapTargets).toContainEqual(
      expect.objectContaining({ focus: 'Finesse', specialty: 'Melee' })
    );
    expect(summary.focusSwapTargets).toContainEqual(
      expect.objectContaining({ focus: 'Cleverness', specialty: 'Adroitness' })
    );
  });

  it('adds Magic Defense when Gift of Magic is duplicated between race and class', () => {
    expect(getAdvantages('Elf', 'Adept')).toContain('Magic Defense');
  });

  it('applies focus swaps to starting minima without charging CP', () => {
    const { character, baseCharacter } = createCharacterShell('Human', 'Warrior', 1, {
      focusSwap: {
        sourceFocus: 'Threat',
        targetFocus: 'Finesse',
        mode: 'single_specialty_broad'
      }
    });

    expect(baseCharacter.focuses.Prowess.Threat).toBe('+1');
    expect(baseCharacter.focuses.Prowess.Finesse).toBe('+1');
    expect(calculateCPSpent(character, baseCharacter, false).total).toBe(0);
  });

  it('supports the single-specialty +2 focus swap path for 4 CP', () => {
    const selection = {
      sourceFocus: 'Threat',
      targetFocus: 'Cleverness',
      mode: 'single_specialty_upgrade' as const
    };
    const { character, baseCharacter } = createCharacterShell('Human', 'Warrior', 1, {
      focusSwap: selection
    });

    expect(baseCharacter.focuses.Prowess.Threat).toBe('+1');
    expect(baseCharacter.focuses.Competence.Cleverness).toBe('+2');
    expect(getFocusSwapCPCost(selection)).toBe(4);
    expect(calculateCPSpent(character, baseCharacter, false, getFocusSwapCPCost(selection)).total).toBe(4);
  });

  it('computes budget, multiclass cost, and cross-discipline spell capacity', () => {
    expect(getCustomizationBudget(1, true)).toBe(20);
    expect(getCustomizationBudget(5, true)).toBe(420);
    expect(getMulticlassFeatCost(2)).toBeNull();
    expect(getMulticlassFeatCost(4)).toBe(6);

    const { character } = createCharacterShell('Human', 'Theurgist', 1);
    character.focuses.Competence.Wizardry = '+2';

    const summary = getCrossDisciplineSpellcastingSummary(character);

    expect(summary).not.toBeNull();
    expect(summary).toMatchObject({
      primaryFocus: 'Theurgy',
      secondaryFocus: 'Wizardry',
      spellCapacity: 2,
      available: true
    });
  });
});
