import { describe, it, expect } from 'vitest';
import convertRevisedTo2E, { convertedEntityToDetailedNPC } from '../src/utils/revisedConverter';
import { RevisedEntity } from '../src/types/revisedEntity';

// Sample entity ported from Purity and Parity Suite examples.py
const sampleCultist: RevisedEntity = {
  name: 'Cultist Acolyte',
  kind: 'NPC',
  notes: 'Converted from Eldritch Revised Edition bestiary.',
  abilities: [
    { name: 'Perception', tier: 'basic', die_rank: 'd6' },
    { name: 'Knowledge', tier: 'specialty', die_rank: 'd4' },
    { name: 'Influence', tier: 'specialty', die_rank: 'd6' },
    { name: 'Agility', tier: 'basic', die_rank: 'd6' },
    { name: 'Melee Weapons', tier: 'basic', die_rank: 'd6' },
    { name: 'Ranged Weapons', tier: 'basic', die_rank: 'd4' },
    { name: 'Fortitude', tier: 'basic', die_rank: 'd6' },
    { name: 'Endurance', tier: 'specialty', die_rank: 'd4' },
    { name: 'Feats of Strength', tier: 'specialty', die_rank: 'd4' },
    { name: 'Willpower', tier: 'basic', die_rank: 'd6' },
    { name: 'Speed', tier: 'mastery', die_rank: 'd6' },
  ],
};

describe('Revised → 2E Converter', () => {
  it('converts sample Cultist Acolyte', () => {
    const result = convertRevisedTo2E(sampleCultist);
    expect(result.name).toBe('Cultist Acolyte');
    expect(result.kind).toBe('NPC');
    // Should have ability nodes for Prowess, Fortitude, Competence branches
    expect(result.abilities.length).toBeGreaterThan(0);
    // Should have Speed focus from mastery
    expect(result.foci.find((f) => f.name === 'Speed')).toBeDefined();
    // Derived pools should be positive
    expect(result.active_defense_pool).toBeGreaterThan(0);
    expect(result.passive_defense_pool).toBeGreaterThan(0);
    expect(result.spirit_points).toBeGreaterThan(0);
  });

  it('produces a DetailedNPC partial', () => {
    const entity = convertRevisedTo2E(sampleCultist);
    const npc = convertedEntityToDetailedNPC(entity);
    expect(npc.name).toBe('Cultist Acolyte');
    expect(npc.activeDefense).toBe(entity.active_defense_pool);
  });
});
