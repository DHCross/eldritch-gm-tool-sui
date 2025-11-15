import { describe, it, expect } from 'vitest';
import {
  computePCMovement,
  computeCreatureMovement,
  formatMovementNotation,
  generateTacticalNotes
} from '../movement';

describe('Movement Utilities', () => {
  describe('computePCMovement', () => {
    it('calculates base PC movement correctly', () => {
      expect(computePCMovement('d8', 'd10')).toBe(9);
    });

    it('applies agility specialty bonus', () => {
      expect(computePCMovement('d8', 'd10', true)).toBe(11); // (8+10)/2 = 9 * 1.2 = 10.8 -> 11
    });
  });

  describe('computeCreatureMovement', () => {
    it('calculates base creature movement by BP die', () => {
      expect(computeCreatureMovement('d4')).toBe(10);
      expect(computeCreatureMovement('d6')).toBe(12);
      expect(computeCreatureMovement('d8')).toBe(15);
      expect(computeCreatureMovement('d10')).toBe(18);
    });

    it('applies size modifiers', () => {
      expect(computeCreatureMovement('d6', 'large')).toBe(18); // 12 * 1.5
      expect(computeCreatureMovement('d6', 'tiny')).toBe(6); // 12 * 0.5
    });

    it('applies defense split modifiers', () => {
      expect(computeCreatureMovement('d6', 'medium', 'fast')).toBe(14); // 12 * 1.2
    });

    it('applies especially speedy modifiers', () => {
      expect(computeCreatureMovement('d6', 'medium', 'balanced', true)).toBe(15); // 12 * 1.25
    });
  });

  describe('formatMovementNotation', () => {
    it('formats walk speed correctly', () => {
      expect(formatMovementNotation(10)).toBe('10 sq');
    });

    it('formats other movement types', () => {
      expect(formatMovementNotation(10, 'run')).toBe('15 sq');
      expect(formatMovementNotation(10, 'fly')).toBe('25 sq');
    });
  });

  describe('generateTacticalNotes', () => {
    it('generates a correct tactical breakdown', () => {
      const notes = generateTacticalNotes(12, 'large', 'fast', true);
      expect(notes.raw).toBe(12);
      expect(notes.rounded).toBe(12);
      expect(notes.sizeModifier).toBe(0.5);
      expect(notes.defenseSplitModifier).toBe(0.2);
      expect(notes.speedFocusModifier).toBe(0.25);
      expect(notes.total).toBe(27); // 12 * 1.5 * 1.2 * 1.25 = 27
    });
  });
});