import { describe, it, expect } from 'vitest';
import { generateAutoCorrections } from '../documentAnalyzer';

describe('generateAutoCorrections', () => {

  it('corrects monster-specific formatting', () => {
    const input = `
threat dice: melee 2d6
threat mv: 30
special abilities: None
extra attacks: 1
type: beast
size: large
nature: mundane
    `;

    const result = generateAutoCorrections(input);

    expect(result).toContain('Threat Dice: melee 2d6');
    expect(result).toContain('Threat MV: 30');
    expect(result).toContain('Special Abilities: None');

    // These are the new ones we plan to add
    expect(result).toContain('Extra Attacks: 1');
    expect(result).toContain('Type: beast');
    expect(result).toContain('Size: large');
    expect(result).toContain('Nature: mundane');
  });

  it('corrects common abbreviations', () => {
    const input = 'hp: 10\nac: 15\ndr: 2\nmv: 30\npa: physical';
    const result = generateAutoCorrections(input);
    expect(result).toContain('HP: 10');
    expect(result).toContain('AC: 15');
    expect(result).toContain('DR: 2');
    expect(result).toContain('MV: 30');
    expect(result).toContain('PA: physical');
  });

  it('corrects common field names', () => {
    const input = 'disposition: neutral\nbattle phase: d6\nsaving throw: +2';
    const result = generateAutoCorrections(input);
    expect(result).toContain('Disposition: neutral');
    expect(result).toContain('Battle Phase: d6');
    expect(result).toContain('Saving Throw: +2');
  });

  it('corrects spell-specific formatting', () => {
    const input = 'path: sorcery\nrank: d4\ntier: common\nrarity: common';
    const result = generateAutoCorrections(input);
    expect(result).toContain('Path: sorcery');
    expect(result).toContain('Rank: d4');
    expect(result).toContain('Tier: common');
    expect(result).toContain('Rarity: common');

  it('should capitalize the first letter of the sentence', () => {
    const input = 'this is a test sentence.';
    // Note: generateAutoCorrections also bolds what it thinks is a magic item name at the start
    const expected = '**This is a test** sentence.';
    expect(generateAutoCorrections(input)).toBe(expected);
  });

  it('should not change already capitalized sentences (other than bolding)', () => {
    const input = 'This is already capitalized.';
    const expected = '**This is already** capitalized.';
    expect(generateAutoCorrections(input)).toBe(expected);
  });

  it('should handle empty strings', () => {
    const input = '';
    const expected = '';
    expect(generateAutoCorrections(input)).toBe(expected);
  });

  it('should handle strings starting with non-letters', () => {
    const input = '123 test.';
    const expected = '123 test.';
    expect(generateAutoCorrections(input)).toBe(expected);
  });

  it('should capitalize sentences after periods', () => {
    const input = 'This is one sentence. this is another.';
    // formatting applies to the first "sentence" (magic item name candidate)
    const expected = '**This is one** sentence. This is another.';
    expect(generateAutoCorrections(input)).toBe(expected);
  });

  it('should fix common abbreviations', () => {
    const input = 'hp: 10, ac: 15, pa: physical';
    const expected = 'HP: 10, AC: 15, PA: physical';
    expect(generateAutoCorrections(input)).toBe(expected);

  });
});
