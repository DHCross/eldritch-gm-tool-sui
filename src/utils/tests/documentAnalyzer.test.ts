import { describe, it, expect } from 'vitest';
import { generateAutoCorrections } from '../documentAnalyzer';

describe('generateAutoCorrections', () => {
  it('should capitalize the first letter of the sentence', () => {
    const input = 'this is a test sentence.';
    // Note: generateAutoCorrections also bolds what it thinks is a magic item name at the start
    // If we fix the bolding logic to not bold arbitrary sentences, we might need to update this expectation.
    // For now, assuming the bolding logic stays aggressive for non-abbreviations:
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
    // We expect abbreviations NOT to be bolded.
    const expected = 'HP: 10, AC: 15, PA: physical';
    expect(generateAutoCorrections(input)).toBe(expected);
  });
});
