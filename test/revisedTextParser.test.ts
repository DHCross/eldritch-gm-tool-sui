import { describe, it, expect } from 'vitest';
import {
  parseRevisedStatBlock,
  isRevisedStatBlockText,
  parseTextToRevisedEntity,
  statBlockToRevisedEntity,
} from '../src/utils/revisedTextParser';

// Sample stat block from user's example (The Accursed)
const accursedStatBlock = `Type (TY): Minor Undead
Threat Dice (TD): Natural d6 ~ Melee d4 ~ Ranged d4
Extra Attacks (EA): d8 rotting attack, once per round
Hit Points (HP): Total 10 (Active Defense: 7 / Passive Defense: 3)
Damage Reduction (DR): d4 (natural toughness; applied after ADP is depleted and before remaining Threat Points affect PDP)
Saving Throw (ST): d4 (undead base)
Battle Phase (BP): d6 (Phase 4)
Movement (MV): Walk 3 sq/phase (Run ×2, Sprint ×4; see Tactical Grid Movement)
Abilities and Powers:
Rotting Strike: If the Accursed's rotting attack (d8) penetrates a target's Active Defense, the victim loses d4 Fortitude each round. This affliction can only be cured by Invocation (Life) → Control → Heal vs d8 or an equivalent restorative effect.
Immunities: Immune to curses, mental afflictions, and harm spells of the Entropy path.
Undead Limitations: Devoid of will and speech, existing only to inflict harm. Cannot wield complex weapons or armor that provides specific bonuses (any such equipment is mechanically inert).
Resilience: The Accursed's Passive Defense regenerates only through magical restoration.`;

describe('Revised Text Parser', () => {
  describe('isRevisedStatBlockText', () => {
    it('detects plain text stat blocks', () => {
      expect(isRevisedStatBlockText(accursedStatBlock)).toBe(true);
    });

    it('rejects JSON', () => {
      const json = '{ "name": "Test", "kind": "NPC", "abilities": [] }';
      expect(isRevisedStatBlockText(json)).toBe(false);
    });

    it('rejects random text', () => {
      const text = 'Just some random text about nothing in particular.';
      expect(isRevisedStatBlockText(text)).toBe(false);
    });
  });

  describe('parseRevisedStatBlock', () => {
    it('parses type correctly', () => {
      const parsed = parseRevisedStatBlock(accursedStatBlock);
      expect(parsed.type).toBe('Minor Undead');
    });

    it('parses threat dice correctly', () => {
      const parsed = parseRevisedStatBlock(accursedStatBlock);
      expect(parsed.threatDice.natural).toBe('d6');
      expect(parsed.threatDice.melee).toBe('d4');
      expect(parsed.threatDice.ranged).toBe('d4');
    });

    it('parses hit points correctly', () => {
      const parsed = parseRevisedStatBlock(accursedStatBlock);
      expect(parsed.hitPoints.total).toBe(10);
      expect(parsed.hitPoints.activeDefense).toBe(7);
      expect(parsed.hitPoints.passiveDefense).toBe(3);
    });

    it('parses saving throw correctly', () => {
      const parsed = parseRevisedStatBlock(accursedStatBlock);
      expect(parsed.savingThrow).toBe('d4');
    });

    it('parses battle phase correctly', () => {
      const parsed = parseRevisedStatBlock(accursedStatBlock);
      expect(parsed.battlePhase).toBeDefined();
      expect(parsed.battlePhase?.die).toBe('d6');
      expect(parsed.battlePhase?.phase).toBe(4);
    });

    it('parses movement correctly', () => {
      const parsed = parseRevisedStatBlock(accursedStatBlock);
      expect(parsed.movement).toBeDefined();
      expect(parsed.movement?.type).toBe('Walk');
      expect(parsed.movement?.squares).toBe(3);
    });

    it('parses extra attacks', () => {
      const parsed = parseRevisedStatBlock(accursedStatBlock);
      expect(parsed.extraAttacks).toBeDefined();
      expect(parsed.extraAttacks?.length).toBeGreaterThan(0);
      expect(parsed.extraAttacks?.[0]).toContain('d8 rotting attack');
    });

    it('parses damage reduction', () => {
      const parsed = parseRevisedStatBlock(accursedStatBlock);
      expect(parsed.damageReduction).toBeDefined();
      expect(parsed.damageReduction).toContain('d4');
    });

    it('parses immunities', () => {
      const parsed = parseRevisedStatBlock(accursedStatBlock);
      expect(parsed.immunities).toBeDefined();
      expect(parsed.immunities?.length).toBeGreaterThan(0);
    });
  });

  describe('statBlockToRevisedEntity', () => {
    it('converts parsed stat block to RevisedEntity', () => {
      const parsed = parseRevisedStatBlock(accursedStatBlock);
      const entity = statBlockToRevisedEntity(parsed);
      
      expect(entity.kind).toBe('Minor Undead');
      expect(entity.abilities.length).toBeGreaterThan(0);
      
      // Should have melee ability from threat dice
      const meleeAbility = entity.abilities.find(a => a.name === 'Melee Weapons');
      expect(meleeAbility).toBeDefined();
      expect(meleeAbility?.die_rank).toBe('d4');
      
      // Should have ranged ability from threat dice
      const rangedAbility = entity.abilities.find(a => a.name === 'Ranged Weapons');
      expect(rangedAbility).toBeDefined();
      expect(rangedAbility?.die_rank).toBe('d4');
      
      // Should have Speed from battle phase
      const speedAbility = entity.abilities.find(a => a.name === 'Speed');
      expect(speedAbility).toBeDefined();
      expect(speedAbility?.tier).toBe('mastery');
    });
  });

  describe('parseTextToRevisedEntity', () => {
    it('full pipeline: text to RevisedEntity', () => {
      const entity = parseTextToRevisedEntity(accursedStatBlock);
      
      expect(entity.kind).toBe('Minor Undead');
      expect(entity.abilities.length).toBeGreaterThan(0);
      expect(entity.notes).toBeDefined();
    });
  });
});
