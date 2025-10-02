import { describe, it, expect } from 'vitest';
import {
  abilities,
  classes,
  classKeys,
  costToRankUpDie,
  dieRanks,
  focusToSpecialty,
  magicPathsByClass,
  races,
  raceKeys,
  specialtyToAbility
} from '../src/data/gameData';

describe('game data integrity', () => {
  it('defines a CP cost for every die rank', () => {
    const rankKeys = Object.keys(costToRankUpDie).sort();
    expect(rankKeys).toEqual([...dieRanks].sort());
    expect(costToRankUpDie['d12']).toBe(Infinity);
  });

  it('ensures race minima reference known abilities, specialties, and focuses', () => {
    raceKeys.forEach(race => {
      const minima = races[race].minima;
      minima.abilities && Object.keys(minima.abilities).forEach(ability => {
        expect(abilities).toContain(ability);
      });
      minima.specialties && Object.keys(minima.specialties).forEach(specialty => {
        expect(specialtyToAbility).toHaveProperty(specialty);
      });
      minima.focuses && Object.keys(minima.focuses).forEach(focus => {
        expect(focusToSpecialty).toHaveProperty(focus);
      });
    });
  });

  it('ensures class minima reference known abilities, specialties, and focuses', () => {
    classKeys.forEach(klass => {
      const minima = classes[klass].minima;
      minima.abilities && Object.keys(minima.abilities).forEach(ability => {
        expect(abilities).toContain(ability);
      });
      minima.specialties && Object.keys(minima.specialties).forEach(specialty => {
        expect(specialtyToAbility).toHaveProperty(specialty);
      });
      minima.focuses && Object.keys(minima.focuses).forEach(focus => {
        expect(focusToSpecialty).toHaveProperty(focus);
      });
    });
  });

  it('keeps magic path listings in sync with class definitions', () => {
    classKeys.forEach(klass => {
      const expected = classes[klass].magicPaths;
      expect(magicPathsByClass[klass]).toEqual(expected);
    });
  });
});
