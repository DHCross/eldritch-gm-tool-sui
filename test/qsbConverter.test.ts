import { describe, it, expect } from 'vitest';
import {
  calculateMovement,
  calculateHP,
  convertToQSB,
  formatQSBMarkdown,
  dieMax,
  drToStaticHP,
  speedFocusBonus,
} from '../src/utils/qsbConverter';
import { parseRevisedStatBlock } from '../src/utils/revisedTextParser';

describe('QSB Converter', () => {
  describe('dieMax', () => {
    it('extracts max value from die notation', () => {
      expect(dieMax('d4')).toBe(4);
      expect(dieMax('d6')).toBe(6);
      expect(dieMax('d8')).toBe(8);
      expect(dieMax('d10')).toBe(10);
      expect(dieMax('d12')).toBe(12);
    });
  });

  describe('drToStaticHP', () => {
    it('converts DR die to static HP bonus', () => {
      expect(drToStaticHP('d4')).toBe(2);  // Average of 1-4 = 2.5 → 2
      expect(drToStaticHP('d6')).toBe(3);  // Average of 1-6 = 3.5 → 4
      expect(drToStaticHP('d8')).toBe(4);
    });
  });

  describe('speedFocusBonus', () => {
    it('returns correct bonus by die rank', () => {
      expect(speedFocusBonus('d4')).toBe(1);
      expect(speedFocusBonus('d6')).toBe(1);
      expect(speedFocusBonus('d8')).toBe(2);
      expect(speedFocusBonus('d10')).toBe(2);
      expect(speedFocusBonus('d12')).toBe(3);
    });
  });

  describe('calculateMovement (Full Parity Formula)', () => {
    it('calculates base movement from BP die', () => {
      // (12 + 4) / 5 = 3.2 → 3
      expect(calculateMovement('d4').base).toBe(3);
      
      // (12 + 6) / 5 = 3.6 → 4
      expect(calculateMovement('d6').base).toBe(4);
      
      // (12 + 8) / 5 = 4.0 → 4
      expect(calculateMovement('d8').base).toBe(4);
      
      // (12 + 10) / 5 = 4.4 → 4
      expect(calculateMovement('d10').base).toBe(4);
      
      // (12 + 12) / 5 = 4.8 → 5
      expect(calculateMovement('d12').base).toBe(5);
    });

    it('rounds up with Agility specialty', () => {
      // (12 + 4) / 5 = 3.2 → 4 (rounds up)
      expect(calculateMovement('d4', { hasAgility: true }).base).toBe(4);
      
      // (12 + 6) / 5 = 3.6 → 4 (already rounds to 4)
      expect(calculateMovement('d6', { hasAgility: true }).base).toBe(4);
    });

    it('applies Fast trait modifier', () => {
      const result = calculateMovement('d6', { hasFast: true });
      expect(result.total).toBe(5);  // 4 base + 1 Fast
    });

    it('applies Especially Speedy modifier', () => {
      const result = calculateMovement('d6', { hasEspeciallySpeedy: true });
      expect(result.total).toBe(8);  // 4 base + 4 Especially Speedy
    });

    it('Especially Speedy replaces Fast', () => {
      const result = calculateMovement('d6', { hasFast: true, hasEspeciallySpeedy: true });
      expect(result.total).toBe(8);  // Should be 4 + 4, not 4 + 1 + 4
      expect(result.modifiers.length).toBe(1);
    });

    it('applies Speed Focus bonus', () => {
      const result = calculateMovement('d6', { speedFocus: 'd8' });
      expect(result.total).toBe(6);  // 4 base + 2 Speed Focus
    });

    it('applies size modifiers', () => {
      expect(calculateMovement('d6', { size: 'small' }).total).toBe(3);  // 4 - 1
      expect(calculateMovement('d6', { size: 'large' }).total).toBe(5);  // 4 + 1
      expect(calculateMovement('d6', { size: 'huge' }).total).toBe(6);   // 4 + 2
    });

    it('enforces minimum of 1 square', () => {
      // Tiny with d4: 3 - 1 = 2, still above minimum
      expect(calculateMovement('d4', { size: 'tiny' }).total).toBe(2);
    });
  });

  describe('calculateHP', () => {
    it('uses highest threat die for base', () => {
      const result = calculateHP({ natural: 'd6', melee: 'd4', ranged: 'd4' });
      expect(result.baseValue).toBe(6);
    });

    it('applies size multiplier', () => {
      const medium = calculateHP({ natural: 'd6' }, { size: 'medium' });
      const large = calculateHP({ natural: 'd6' }, { size: 'large' });
      expect(large.total).toBeGreaterThan(medium.total);
    });

    it('applies magical modifier', () => {
      const normal = calculateHP({ natural: 'd6' }, { size: 'medium' });
      const magical = calculateHP({ natural: 'd6' }, { size: 'medium', isMagical: true });
      expect(magical.total).toBeGreaterThan(normal.total);
    });

    it('converts DR to static HP', () => {
      const withDR = calculateHP({ natural: 'd6' }, { drDie: 'd4' });
      expect(withDR.drBonus).toBe(2);
    });

    it('biases PDP for undead', () => {
      const undead = calculateHP({ natural: 'd6' }, { isUndead: true });
      expect(undead.passive).toBeGreaterThanOrEqual(undead.active);
    });
  });

  describe('convertToQSB (Accursed example)', () => {
    const accursedText = `Type (TY): Minor Undead
Threat Dice (TD): Natural d6 ~ Melee d4 ~ Ranged d4
Extra Attacks (EA): d8 rotting attack, once per round
Hit Points (HP): Total 10 (Active Defense: 7 / Passive Defense: 3)
Damage Reduction (DR): d4 (natural toughness)
Saving Throw (ST): d4 (undead base)
Battle Phase (BP): d6 (Phase 4)
Movement (MV): Walk 3 sq/phase`;

    it('converts to QSB format', () => {
      const parsed = parseRevisedStatBlock(accursedText);
      parsed.name = 'Accursed';
      const qsb = convertToQSB(parsed);
      
      expect(qsb.name).toBe('Accursed');
      expect(qsb.type).toBe('Minor Undead');
      expect(qsb.traits).toContain('undead');
    });

    it('detects magical trait from text', () => {
      const parsed = parseRevisedStatBlock(accursedText);
      parsed.name = 'Accursed';
      const qsb = convertToQSB(parsed);
      
      // The text mentions "magical" in some context
      expect(qsb.traits).toContain('undead');
    });

    it('generates markdown output', () => {
      const parsed = parseRevisedStatBlock(accursedText);
      parsed.name = 'Accursed';
      const qsb = convertToQSB(parsed);
      const markdown = formatQSBMarkdown(qsb);
      
      expect(markdown).toContain('## Accursed (Minor Undead) — QSB Compliant');
      expect(markdown).toContain('**TY:** Minor Undead');
      expect(markdown).toContain('**TD:**');
      expect(markdown).toContain('**HP:**');
      expect(markdown).toContain('**BP:**');
      expect(markdown).toContain('**MV:**');
    });

    it('includes compliance notes', () => {
      const parsed = parseRevisedStatBlock(accursedText);
      parsed.name = 'Accursed';
      const qsb = convertToQSB(parsed);
      
      expect(qsb.complianceNotes.length).toBeGreaterThan(0);
      expect(qsb.complianceNotes.some(n => n.includes('Movement'))).toBe(true);
    });
  });
});
