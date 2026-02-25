'use client';

import Link from 'next/link';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { SavedCharacter, CreatureCategory, CreatureNature, CreatureSize } from '../types/party';
import { getCharactersByType } from '../utils/partyStorage';
import { resolveBackTargetFromParam } from '../utils/backNavigation';
import ExportToEncounterPlus from './ExportToEncounterPlus';
import {
  addToVault,
  removeFromVaultByIndex,
  clearVault,
  getVaultCreatures,
  onVaultChange,
  type VaultCreature,
} from '../utils/encounterVaultStorage';

interface BestiaryCreature {
  id: string;
  name: string;
  category: CreatureCategory;
  nature: CreatureNature;
  size: CreatureSize;
  threatDice: {
    melee?: string;
    natural?: string;
    ranged?: string;
    arcane?: string;
  };
  threatMV: number;
  hp: string;
  dr: string;
  savingThrow: string;
  battlePhase: string;
  extraAttacks?: string;
  specialAbilities?: string[];
  description: string;
  source: 'QSB' | 'Bestiary' | 'Trope' | 'Summoned' | 'Custom';
  tags: string[];
}

interface StoredMonsterDetails {
  category?: CreatureCategory;
  nature?: CreatureNature;
  size?: CreatureSize;
  defenseSplit?: string;
  threatDice?: {
    melee?: string;
    natural?: string;
    ranged?: string;
    arcane?: string;
  };
  threatMV?: number;
  threatMvRange?: string;
  extraAttacks?: string;
  extraAttacksList?: string[];
  armor?: string;
  shield?: string;
  savingThrow?: string;
  battlePhase?: string;
  notes?: string;
  description?: string;
  dr?: string;
  hp?: string;
  finalHP?: number;
  finalActiveHP?: number;
  finalPassiveHP?: number;
  baseMovement?: number;
  speedFocus?: string;
  especiallySpeedy?: boolean;
  qsbString?: string;
}

const CATEGORY_VALUES: CreatureCategory[] = ['Minor', 'Standard', 'Exceptional', 'Legendary'];
const NATURE_VALUES: CreatureNature[] = ['Mundane', 'Magical', 'Preternatural', 'Supernatural'];
const SIZE_VALUES: CreatureSize[] = ['Minuscule', 'Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan'];

const ensureCategory = (value?: unknown): CreatureCategory | undefined => {
  if (typeof value === 'string') {
    return CATEGORY_VALUES.find(option => option.toLowerCase() === value.toLowerCase());
  }
  return undefined;
};

const ensureNature = (value?: unknown): CreatureNature | undefined => {
  if (typeof value === 'string') {
    return NATURE_VALUES.find(option => option.toLowerCase() === value.toLowerCase());
  }
  return undefined;
};

const ensureSize = (value?: unknown): CreatureSize | undefined => {
  if (typeof value === 'string') {
    return SIZE_VALUES.find(option => option.toLowerCase() === value.toLowerCase());
  }
  return undefined;
};

const findMatchingTag = <T extends string>(tags: string[], options: readonly T[]): T | undefined => {
  for (const option of options) {
    if (tags.includes(option.toLowerCase())) {
      return option;
    }
  }
  return undefined;
};

const mapSavedMonsterToBestiaryCreature = (monster: SavedCharacter): BestiaryCreature => {
  const details = (monster.full_data || {}) as StoredMonsterDetails;
  const tags = Array.isArray(monster.tags) ? monster.tags.map(tag => tag.toLowerCase()) : [];

  const category = ensureCategory(details.category)
    ?? findMatchingTag(tags, CATEGORY_VALUES)
    ?? 'Standard';

  const nature = ensureNature(details.nature)
    ?? findMatchingTag(tags, NATURE_VALUES)
    ?? 'Mundane';

  const size = ensureSize(details.size)
    ?? findMatchingTag(tags, SIZE_VALUES)
    ?? 'Medium';

  const threatDice = {
    melee: details.threatDice?.melee,
    natural: details.threatDice?.natural,
    ranged: details.threatDice?.ranged,
    arcane: details.threatDice?.arcane
  };

  const threatMV = typeof details.threatMV === 'number'
    ? details.threatMV
    : monster.computed?.active_dp ?? 0;

  const customDescription = typeof details.description === 'string' && details.description.trim().length > 0
    ? details.description.trim()
    : typeof monster.status?.notes === 'string' && monster.status.notes.trim().length > 0
      ? monster.status.notes.trim()
      : 'Custom creature crafted in the Monster Generator.';

  const combinedTags = Array.from(new Set([...tags, 'custom']));

  const extraAbilities = Array.isArray(details.extraAttacksList)
    ? details.extraAttacksList
    : undefined;

  const hp = details.hp
    ?? `${(monster.computed?.active_dp ?? 0) + (monster.computed?.passive_dp ?? 0)} (${monster.computed?.active_dp ?? 0}/${monster.computed?.passive_dp ?? 0})`;

  return {
    id: `custom-${monster.id}`,
    name: monster.name,
    category,
    nature,
    size,
    threatDice,
    threatMV,
    hp,
    dr: details.dr ?? 'None',
    savingThrow: details.savingThrow ?? 'Unknown',
    battlePhase: details.battlePhase ?? 'Unknown',
    extraAttacks: details.extraAttacks && details.extraAttacks.trim().length > 0 ? details.extraAttacks : undefined,
    specialAbilities: extraAbilities,
    description: customDescription,
    source: 'Custom',
    tags: combinedTags
  };
};

// Comprehensive creature database from "Beings Diverse and Malign"
const BESTIARY_CREATURES: BestiaryCreature[] = [
  // QSB Examples & Named Adversaries
  {
    id: 'bandit',
    name: 'Bandit',
    category: 'Standard',
    nature: 'Mundane',
    size: 'Medium',
    threatDice: { melee: '2d6', ranged: '2d4' },
    threatMV: 12,
    hp: '18 (9/9)',
    dr: 'Leather (d6)',
    savingThrow: 'd6',
    battlePhase: 'd6',
    description: 'Highway robbers and cutthroats who prey on travelers.',
    source: 'QSB',
    tags: ['humanoid', 'criminal', 'mundane']
  },
  {
    id: 'bear',
    name: 'Bear',
    category: 'Exceptional',
    nature: 'Mundane',
    size: 'Large',
    threatDice: { natural: '3d8' },
    threatMV: 24,
    hp: '48 (24/24)',
    dr: 'Thick Hide (+4 HP)',
    savingThrow: 'd8',
    battlePhase: 'd8',
    description: 'Massive forest predators with crushing strength and fierce territorial instincts.',
    source: 'QSB',
    tags: ['beast', 'predator', 'forest']
  },
  {
    id: 'chimera',
    name: 'Chimera',
    category: 'Legendary',
    nature: 'Magical',
    size: 'Large',
    threatDice: { melee: '2d10', natural: '2d8' },
    threatMV: 20,
    hp: '80 (20/60)',
    dr: 'Thick Hide (+6 HP)',
    savingThrow: 'd12',
    battlePhase: 'd12',
    extraAttacks: 'Breath Weapon (2d6 fire), Venomous Fumes (d10)',
    specialAbilities: ['Fire Breath', 'Poison Gas', 'Flight'],
    description: 'A monstrous hybrid with the body of a lion, wings of an eagle, and tail of a serpent.',
    source: 'QSB',
    tags: ['magical', 'hybrid', 'fire', 'poison']
  },
  {
    id: 'demon',
    name: 'Demon',
    category: 'Legendary',
    nature: 'Supernatural',
    size: 'Large',
    threatDice: { melee: '3d16', natural: '2d18', arcane: '2d12' },
    threatMV: 48,
    hp: '120 (30/90)',
    dr: 'Supernatural Hide (d12)',
    savingThrow: 'd20',
    battlePhase: 'd16',
    extraAttacks: 'Fear Aura (opposed roll), Hellfire (3d6)',
    specialAbilities: ['Fear Aura', 'Hellfire', 'Teleportation', 'Damage Resistance'],
    description: 'Malevolent entities from the infernal planes, bent on corruption and destruction.',
    source: 'QSB',
    tags: ['fiend', 'evil', 'fire', 'fear']
  },
  {
    id: 'dire-wolf',
    name: 'Dire Wolf',
    category: 'Minor',
    nature: 'Mundane',
    size: 'Medium',
    threatDice: { melee: 'd8' },
    threatMV: 8,
    hp: '10 (5/5)',
    dr: 'Thick Fur (+2 HP)',
    savingThrow: 'd4',
    battlePhase: 'd4',
    extraAttacks: 'Pack Tactics (advantage when flanking)',
    specialAbilities: ['Pack Tactics', 'Keen Scent'],
    description: 'Large wolves with supernatural cunning and pack coordination.',
    source: 'QSB',
    tags: ['beast', 'pack', 'forest']
  },
  {
    id: 'vampire-lord',
    name: 'Vampire Lord',
    category: 'Legendary',
    nature: 'Preternatural',
    size: 'Medium',
    threatDice: { natural: '3d12', melee: '3d10' },
    threatMV: 36,
    hp: '108 (27/81)',
    dr: 'Supernatural Resilience (d10)',
    savingThrow: 'd16',
    battlePhase: 'd14',
    extraAttacks: 'Charm (opposed roll), Blood Drain, Dominate',
    specialAbilities: ['Charm', 'Blood Drain', 'Shapeshifting', 'Regeneration', 'Undead Immunities'],
    description: 'Ancient undead noble with vast supernatural powers and centuries of cunning.',
    source: 'QSB',
    tags: ['undead', 'noble', 'charm', 'blood']
  },
  {
    id: 'gorgon',
    name: 'Gorgon',
    category: 'Legendary',
    nature: 'Magical',
    size: 'Large',
    threatDice: { melee: '2d8', natural: '2d6' },
    threatMV: 80,
    hp: '80 (40/40)',
    dr: 'Iron Scales (+6 HP)',
    savingThrow: 'd12',
    battlePhase: 'd12',
    extraAttacks: 'Petrifying Gaze (1d6 uses; d10 challenge), Venomous Bite (d8)',
    specialAbilities: ['Petrifying Gaze', 'Venomous Bite', 'Iron Scales'],
    description: 'A monstrous creature with snakes for hair whose gaze turns living beings to stone.',
    source: 'Bestiary',
    tags: ['monster', 'petrification', 'poison', 'serpent']
  },
  {
    id: 'goblin',
    name: 'Goblin',
    category: 'Minor',
    nature: 'Mundane',
    size: 'Small',
    threatDice: { melee: 'd6', natural: 'd4', ranged: 'd4' },
    threatMV: 6,
    hp: '6 (3/3)',
    dr: 'By armor/shield',
    savingThrow: 'd4–d8',
    battlePhase: 'd6–d12',
    description: 'Small, cunning humanoids known for their mischief and tribal warfare.',
    source: 'Bestiary',
    tags: ['goblinoid', 'tribal', 'rabble']
  },
  {
    id: 'skeleton',
    name: 'Skeleton',
    category: 'Minor',
    nature: 'Preternatural',
    size: 'Medium',
    threatDice: { natural: 'd4' },
    threatMV: 4,
    hp: '4 (2/2)',
    dr: 'By armor/shield',
    savingThrow: 'd4',
    battlePhase: 'd4',
    specialAbilities: ['Undead traits'],
    description: 'Animated bones of the long dead, shambling in eternal servitude.',
    source: 'Bestiary',
    tags: ['undead', 'shambling', 'bone']
  },
  {
    id: 'guard',
    name: 'Guard',
    category: 'Standard',
    nature: 'Mundane',
    size: 'Medium',
    threatDice: { melee: '2d6', natural: 'd8', ranged: '2d4' },
    threatMV: 16,
    hp: '16 (8/8)',
    dr: 'By armor/shield',
    savingThrow: 'd6',
    battlePhase: 'd6',
    specialAbilities: ['Trained formation fighter'],
    description: 'Professional soldiers trained in formation combat and battlefield tactics.',
    source: 'Bestiary',
    tags: ['humanoid', 'soldier', 'formation', 'trained']
  },
  {
    id: 'forest-troll',
    name: 'Forest Troll',
    category: 'Standard',
    nature: 'Magical',
    size: 'Large',
    threatDice: { melee: '2d6', natural: '2d8', ranged: '1d6' },
    threatMV: 20,
    hp: '20 (5/19)',
    dr: 'Thick hide (+4 HP)',
    savingThrow: 'd6',
    battlePhase: 'd6',
    extraAttacks: '1d6',
    specialAbilities: ['Regeneration (1d4 HP/round; fire/acid halt)'],
    description: 'Large, brutish creatures with incredible regenerative abilities that dwell in deep forests.',
    source: 'Bestiary',
    tags: ['troll', 'regeneration', 'forest', 'tough']
  },
  {
    id: 'orc-warrior',
    name: 'Orc Warrior',
    category: 'Standard',
    nature: 'Mundane',
    size: 'Medium',
    threatDice: { melee: '2d6', natural: '2d4', ranged: '1d6' },
    threatMV: 18,
    hp: '18 (9/9)',
    dr: 'By armor/shield',
    savingThrow: 'd6',
    battlePhase: 'd6',
    specialAbilities: ['Aggressive press'],
    description: 'Fierce tribal warriors known for their brutal combat tactics and relentless aggression.',
    source: 'Bestiary',
    tags: ['orc', 'warrior', 'aggressive', 'tribal']
  },
  {
    id: 'black-bear',
    name: 'Black Bear',
    category: 'Exceptional',
    nature: 'Mundane',
    size: 'Large',
    threatDice: { natural: '3d4' },
    threatMV: 18,
    hp: '18 (5/13)',
    dr: 'Thick fur (+3 HP)',
    savingThrow: 'd8',
    battlePhase: 'd6',
    extraAttacks: '2d4 (bear hug after hit)',
    specialAbilities: ['Bear hug extra attack (on armor penetration)'],
    description: 'Large forest bears with powerful claws and crushing embrace.',
    source: 'Bestiary',
    tags: ['bear', 'forest', 'grapple', 'tough']
  },
  {
    id: 'brown-bear',
    name: 'Brown Bear',
    category: 'Exceptional',
    nature: 'Mundane',
    size: 'Large',
    threatDice: { natural: '3d6' },
    threatMV: 27,
    hp: '27 (7/20)',
    dr: 'Thick fur (+3 HP)',
    savingThrow: 'd8',
    battlePhase: 'd6',
    extraAttacks: '2d6 (bear hug after hit)',
    specialAbilities: ['Bear hug extra attack (on armor penetration)'],
    description: 'Massive grizzly bears with incredible strength and territorial nature.',
    source: 'Bestiary',
    tags: ['bear', 'grizzly', 'grapple', 'tough']
  },
  {
    id: 'polar-bear',
    name: 'Polar Bear',
    category: 'Exceptional',
    nature: 'Mundane',
    size: 'Large',
    threatDice: { natural: '3d8' },
    threatMV: 36,
    hp: '36 (9/27)',
    dr: 'Thick fur (+3 HP)',
    savingThrow: 'd8',
    battlePhase: 'd6',
    extraAttacks: '2d8 (bear hug after hit)',
    specialAbilities: ['Bear hug extra attack (on armor penetration)'],
    description: 'Enormous arctic predators, the largest and most dangerous of all bears.',
    source: 'Bestiary',
    tags: ['bear', 'polar', 'arctic', 'grapple', 'tough']
  },

  // Additional Bestiary Entries from CSV
  {
    id: 'afriti',
    name: 'Afriti',
    category: 'Exceptional',
    nature: 'Preternatural',
    size: 'Large',
    threatDice: { melee: '2d10', arcane: '2d12' },
    threatMV: 32,
    hp: '48 (12/36)',
    dr: 'Elemental Resistance (d8)',
    savingThrow: 'd10',
    battlePhase: 'd10',
    specialAbilities: ['Fire Immunity', 'Heat Aura', 'Elemental Form'],
    description: 'Elemental beings of fire and air from distant planes.',
    source: 'Bestiary',
    tags: ['elemental', 'fire', 'air', 'planar']
  },
  {
    id: 'amphisbaena',
    name: 'Amphisbaena',
    category: 'Exceptional',
    nature: 'Magical',
    size: 'Large',
    threatDice: { natural: '3d6', arcane: '3d8' },
    threatMV: 30,
    hp: '45 (15/30)',
    dr: 'Scaled Hide (d8)',
    savingThrow: 'd10',
    battlePhase: 'd8',
    specialAbilities: ['Two-headed attacks', 'Poison bite', 'Magic resistance'],
    description: 'A serpent with heads at both ends, capable of moving in either direction.',
    source: 'Bestiary',
    tags: ['serpent', 'two-headed', 'poison', 'magical']
  },
  {
    id: 'centaur',
    name: 'Centaur',
    category: 'Exceptional',
    nature: 'Magical',
    size: 'Large',
    threatDice: { melee: '2d8', natural: '2d12' },
    threatMV: 36,
    hp: '54 (18/36)',
    dr: 'Natural Hide (d6)',
    savingThrow: 'd10',
    battlePhase: 'd8',
    specialAbilities: ['Charge attack', 'Archery mastery', 'Woodland knowledge'],
    description: 'Noble creatures with the torso of a human and body of a horse.',
    source: 'Bestiary',
    tags: ['fey', 'horse', 'archer', 'charge']
  },
  {
    id: 'changeling',
    name: 'Changeling',
    category: 'Standard',
    nature: 'Magical',
    size: 'Medium',
    threatDice: { melee: '2d6', natural: '2d8', ranged: '2d4', arcane: '2d8' },
    threatMV: 24,
    hp: '32 (8/24)',
    dr: 'Fey Resilience (d6)',
    savingThrow: 'd8',
    battlePhase: 'd8',
    specialAbilities: ['Shapechanging', 'Mimicry', 'Fey magic'],
    description: 'Fey creatures capable of perfectly mimicking other beings.',
    source: 'Bestiary',
    tags: ['fey', 'shapechanger', 'mimic', 'deception']
  },
  {
    id: 'cockatrice',
    name: 'Cockatrice',
    category: 'Standard',
    nature: 'Magical',
    size: 'Medium',
    threatDice: { natural: '2d10' },
    threatMV: 24,
    hp: '24 (8/16)',
    dr: 'Feathered Hide (d6)',
    savingThrow: 'd8',
    battlePhase: 'd8',
    specialAbilities: ['Petrifying bite', 'Flight', 'Keen sight'],
    description: 'A creature with the head of a rooster, wings of a bat, and tail of a serpent.',
    source: 'Bestiary',
    tags: ['hybrid', 'petrification', 'flight', 'rooster']
  },
  {
    id: 'gargoyle',
    name: 'Gargoyle',
    category: 'Standard',
    nature: 'Magical',
    size: 'Medium',
    threatDice: { melee: '2d6', natural: '2d8+1', arcane: 'd8' },
    threatMV: 24,
    hp: '32 (8/24)',
    dr: 'Stone Hide (d8)',
    savingThrow: 'd8',
    battlePhase: 'd8',
    specialAbilities: ['Flight', 'Stone form', 'Damage resistance'],
    description: 'Animated stone guardians that come to life to protect ancient places.',
    source: 'Bestiary',
    tags: ['construct', 'stone', 'guardian', 'flight']
  },
  {
    id: 'ghul',
    name: 'Ghul',
    category: 'Standard',
    nature: 'Preternatural',
    size: 'Medium',
    threatDice: { melee: '2d6', natural: '2d8' },
    threatMV: 24,
    hp: '32 (8/24)',
    dr: 'Undead Resilience (d6)',
    savingThrow: 'd8',
    battlePhase: 'd8',
    specialAbilities: ['Undead traits', 'Paralytic touch', 'Drain life'],
    description: 'Desert undead that feed on the life force of travelers.',
    source: 'Bestiary',
    tags: ['undead', 'desert', 'paralysis', 'life-drain']
  },
  {
    id: 'giant',
    name: 'Giant',
    category: 'Legendary',
    nature: 'Magical',
    size: 'Gargantuan',
    threatDice: { melee: '3d14', natural: '3d18' },
    threatMV: 54,
    hp: '135 (45/90)',
    dr: 'Thick Hide (d10)',
    savingThrow: 'd16',
    battlePhase: 'd12',
    specialAbilities: ['Rock throwing', 'Stomp attack', 'Massive reach'],
    description: 'Enormous humanoids of incredible strength and ancient lineage.',
    source: 'Bestiary',
    tags: ['giant', 'massive', 'ancient', 'strength']
  },
  {
    id: 'golem',
    name: 'Golem',
    category: 'Legendary',
    nature: 'Magical',
    size: 'Large',
    threatDice: { natural: '3d18', arcane: '3d14' },
    threatMV: 54,
    hp: '108 (27/81)',
    dr: 'Constructed Form (d12)',
    savingThrow: 'd16',
    battlePhase: 'd12',
    specialAbilities: ['Construct immunities', 'Magic resistance', 'Unstoppable'],
    description: 'Artificial beings created through powerful magic and ancient rituals.',
    source: 'Bestiary',
    tags: ['construct', 'artificial', 'magic', 'unstoppable']
  },
  {
    id: 'hag',
    name: 'Hag',
    category: 'Standard',
    nature: 'Preternatural',
    size: 'Medium',
    threatDice: { natural: '2d8', arcane: '2d12' },
    threatMV: 32,
    hp: '32 (8/24)',
    dr: 'Withered Hide (d6)',
    savingThrow: 'd10',
    battlePhase: 'd8',
    specialAbilities: ['Curse magic', 'Evil eye', 'Spell resistance'],
    description: 'Ancient crones with twisted magic and malevolent intentions.',
    source: 'Bestiary',
    tags: ['crone', 'curse', 'evil', 'magic']
  },
  {
    id: 'halfling',
    name: 'Halfling',
    category: 'Minor',
    nature: 'Mundane',
    size: 'Small',
    threatDice: { melee: 'd6', natural: 'd4', ranged: 'd6' },
    threatMV: 6,
    hp: '6 (3/3)',
    dr: 'By armor',
    savingThrow: 'd6',
    battlePhase: 'd6',
    specialAbilities: ['Lucky', 'Nimble', 'Small size advantage'],
    description: 'Small folk known for their luck, nimbleness, and love of comfort.',
    source: 'Bestiary',
    tags: ['halfling', 'small', 'lucky', 'nimble']
  },
  {
    id: 'harpy-bestiary',
    name: 'Harpy',
    category: 'Standard',
    nature: 'Preternatural',
    size: 'Medium',
    threatDice: { natural: '2d6' },
    threatMV: 24,
    hp: '24 (8/16)',
    dr: 'Feathered armor (+4 HP)',
    savingThrow: 'd8',
    battlePhase: 'd8',
    extraAttacks: 'Screech cone, Siren song',
    specialAbilities: ['Flight', 'Luring song', 'Sonic screech'],
    description: 'Winged creatures with beautiful voices that lure victims to their doom.',
    source: 'Bestiary',
    tags: ['harpy', 'flight', 'song', 'lure']
  },
  {
    id: 'troll',
    name: 'Troll',
    category: 'Standard',
    nature: 'Magical',
    size: 'Large',
    threatDice: { melee: '2d8', natural: '2d12', ranged: '2d8', arcane: '2d8' },
    threatMV: 40,
    hp: '60 (15/45)',
    dr: 'Tough Hide (d8)',
    savingThrow: 'd10',
    battlePhase: 'd8',
    specialAbilities: ['Regeneration', 'Multiple attacks', 'Rock throwing'],
    description: 'Large, brutish creatures with incredible regenerative powers.',
    source: 'Bestiary',
    tags: ['troll', 'regeneration', 'tough', 'multiple-attacks']
  },
  {
    id: 'vampire',
    name: 'Vampire',
    category: 'Standard',
    nature: 'Preternatural',
    size: 'Medium',
    threatDice: { melee: 'd10+d6', natural: 'd16+2', arcane: '2d12' },
    threatMV: 44,
    hp: '44 (11/33)',
    dr: 'Supernatural Hide (d8)',
    savingThrow: 'd12',
    battlePhase: 'd10',
    specialAbilities: ['Blood drain', 'Charm', 'Shapeshifting', 'Undead immunities'],
    description: 'Undead creatures that feed on the blood of the living.',
    source: 'Bestiary',
    tags: ['vampire', 'undead', 'blood', 'charm']
  },
  {
    id: 'werewolf',
    name: 'Werewolf',
    category: 'Exceptional',
    nature: 'Magical',
    size: 'Medium',
    threatDice: { melee: 'd10+8', natural: '3d8+8', ranged: 'd6' },
    threatMV: 48,
    hp: '72 (18/54)',
    dr: 'Lycanthrope Hide (d8)',
    savingThrow: 'd12',
    battlePhase: 'd10',
    specialAbilities: ['Shapeshifting', 'Damage resistance', 'Pack tactics', 'Infectious bite'],
    description: 'Cursed beings that transform between human and wolf form.',
    source: 'Bestiary',
    tags: ['lycanthrope', 'shapeshifter', 'curse', 'pack']
  },

  // Bestiary Entries
  {
    id: 'basilisk',
    name: 'Basilisk',
    category: 'Exceptional',
    nature: 'Magical',
    size: 'Large',
    threatDice: { natural: '3d8', arcane: '2d10' },
    threatMV: 24,
    hp: '72 (18/54)',
    dr: 'Armored Scales (d8)',
    savingThrow: 'd10',
    battlePhase: 'd10',
    extraAttacks: 'Petrifying Gaze (opposed roll)',
    specialAbilities: ['Petrifying Gaze', 'Poison Bite', 'Magic Resistance'],
    description: 'A serpentine creature whose gaze turns living beings to stone.',
    source: 'Bestiary',
    tags: ['serpent', 'petrification', 'poison', 'magical']
  },
  {
    id: 'dragon',
    name: 'Dragon',
    category: 'Legendary',
    nature: 'Magical',
    size: 'Gargantuan',
    threatDice: { melee: '3d12', natural: '3d12', arcane: '3d10' },
    threatMV: 36,
    hp: '180 (45/135)',
    dr: 'Dragon Scales (d12)',
    savingThrow: 'd20',
    battlePhase: 'd16',
    extraAttacks: 'Breath Weapon (varies), Wing Buffet (2d8), Tail Sweep (2d10)',
    specialAbilities: ['Breath Weapon', 'Flight', 'Spell Casting', 'Frightful Presence', 'Legendary Actions'],
    description: 'Ancient wyrms of immense power, intelligence, and magical might.',
    source: 'Bestiary',
    tags: ['dragon', 'ancient', 'magic', 'flight', 'breath-weapon']
  },
  {
    id: 'lich',
    name: 'Lich',
    category: 'Legendary',
    nature: 'Preternatural',
    size: 'Medium',
    threatDice: { arcane: '3d12', melee: '2d8' },
    threatMV: 36,
    hp: '108 (27/81)',
    dr: 'Undead Resilience (d10)',
    savingThrow: 'd16',
    battlePhase: 'd12',
    extraAttacks: 'Paralyzing Touch, Fear Aura, Spell Casting',
    specialAbilities: ['Undead Immunities', 'Spell Casting', 'Phylactery', 'Paralyzing Touch', 'Legendary Resistance'],
    description: 'Undead spellcasters of terrible power who have achieved immortality through dark magic.',
    source: 'Bestiary',
    tags: ['undead', 'spellcaster', 'lich', 'paralysis', 'immortal']
  },

  // Creature Tropes - Mundane
  {
    id: 'villager',
    name: 'Villager',
    category: 'Minor',
    nature: 'Mundane',
    size: 'Medium',
    threatDice: { melee: 'd4' },
    threatMV: 4,
    hp: '6 (3/3)',
    dr: 'None',
    savingThrow: 'd4',
    battlePhase: 'd4',
    description: 'Common folk with little combat training.',
    source: 'Trope',
    tags: ['humanoid', 'commoner', 'noncombatant']
  },
  {
    id: 'veteran-warrior',
    name: 'Veteran Warrior',
    category: 'Exceptional',
    nature: 'Mundane',
    size: 'Medium',
    threatDice: { melee: '3d8' },
    threatMV: 24,
    hp: '36 (18/18)',
    dr: 'Chain Mail (d8)',
    savingThrow: 'd8',
    battlePhase: 'd8',
    extraAttacks: 'Shield Bash (d6), Weapon Master techniques',
    specialAbilities: ['Combat Veteran', 'Weapon Mastery', 'Tactical Knowledge'],
    description: 'Seasoned fighters with years of battlefield experience.',
    source: 'Trope',
    tags: ['humanoid', 'warrior', 'veteran', 'tactical']
  },

  // Creature Tropes - Magical
  {
    id: 'pixie',
    name: 'Pixie',
    category: 'Minor',
    nature: 'Magical',
    size: 'Tiny',
    threatDice: { arcane: 'd6' },
    threatMV: 6,
    hp: '6 (3/3)',
    dr: 'Fey Magic Resistance (+2)',
    savingThrow: 'd6',
    battlePhase: 'd8',
    extraAttacks: 'Fairy Dust (sleep), Invisibility',
    specialAbilities: ['Flight', 'Invisibility', 'Fairy Magic', 'Sleep Dust'],
    description: 'Tiny fey creatures with mischievous nature and minor magical abilities.',
    source: 'Trope',
    tags: ['fey', 'tiny', 'magic', 'invisibility', 'flight']
  },
  {
    id: 'archmage',
    name: 'Archmage',
    category: 'Legendary',
    nature: 'Magical',
    size: 'Medium',
    threatDice: { arcane: '3d12' },
    threatMV: 36,
    hp: '72 (18/54)',
    dr: 'Magical Wards (d8)',
    savingThrow: 'd14',
    battlePhase: 'd10',
    extraAttacks: 'Spell Casting, Teleportation, Counterspell',
    specialAbilities: ['Master Spellcaster', 'Spell Resistance', 'Teleportation', 'Legendary Actions'],
    description: 'Masters of arcane magic with access to the most powerful spells.',
    source: 'Trope',
    tags: ['humanoid', 'spellcaster', 'arcane', 'legendary', 'teleport']
  },

  // Creature Tropes - Preternatural
  {
    id: 'zombie',
    name: 'Zombie',
    category: 'Minor',
    nature: 'Preternatural',
    size: 'Medium',
    threatDice: { natural: 'd6' },
    threatMV: 6,
    hp: '12 (3/9)',
    dr: 'Undead Resilience (+2)',
    savingThrow: 'd4',
    battlePhase: 'd4',
    specialAbilities: ['Undead Immunities', 'Slow Movement', 'Disease Bite'],
    description: 'Reanimated corpses driven by dark magic to consume the living.',
    source: 'Trope',
    tags: ['undead', 'slow', 'disease', 'mindless']
  },

  // Creature Tropes - Supernatural
  {
    id: 'angel',
    name: 'Angel',
    category: 'Legendary',
    nature: 'Supernatural',
    size: 'Large',
    threatDice: { melee: '3d10', arcane: '3d8' },
    threatMV: 30,
    hp: '120 (30/90)',
    dr: 'Divine Protection (d12)',
    savingThrow: 'd16',
    battlePhase: 'd12',
    extraAttacks: 'Divine Radiance, Healing Touch, Command',
    specialAbilities: ['Flight', 'Divine Magic', 'Healing', 'Radiant Damage', 'Fear Immunity'],
    description: 'Celestial beings of pure divine essence and unwavering righteousness.',
    source: 'Trope',
    tags: ['celestial', 'divine', 'flight', 'healing', 'radiant']
  },

  // ═══════════════════════════════════════════════════════════════
  // Additional Bestiary Entries from "Beings Diverse and Malign"
  // ═══════════════════════════════════════════════════════════════

  {
    id: 'accursed',
    name: 'Accursed, the',
    category: 'Minor',
    nature: 'Preternatural',
    size: 'Medium',
    threatDice: { natural: 'd6', melee: 'd4', ranged: 'd4' },
    threatMV: 6,
    hp: '10 (7/3)',
    dr: 'Natural Toughness (d4)',
    savingThrow: 'd4–d8',
    battlePhase: 'd3',
    extraAttacks: 'd8 rotting attack (once per round)',
    specialAbilities: ['Undead Immunities', 'Rotting Touch (d4 Passive DP/round until revitalized)', 'Immune to curses and mental afflictions'],
    description: 'Shambling, moaning zombies found in unhallowed graveyards and defiled temples, determined to eat the flesh of the living.',
    source: 'Bestiary',
    tags: ['undead', 'rot', 'graveyard', 'shambling']
  },
  {
    id: 'ambulant-thresher',
    name: 'Ambulant Thresher',
    category: 'Standard',
    nature: 'Magical',
    size: 'Large',
    threatDice: { natural: '2d10' },
    threatMV: 20,
    hp: '40 (30/10)',
    dr: 'Hide Armor equivalent; spiky trunk',
    savingThrow: 'd10',
    battlePhase: 'd6',
    extraAttacks: 'd10 suffering slumber attack',
    specialAbilities: ['Multiple tentacle strikes', 'Suffering Slumber (save vs Fortitude)', 'Root drain (kills incapacitated victims)', 'Spiky trunk (+1 harm in close melee)'],
    description: 'A bulbous black cactus crowned with purple tentacles that roves woodlands seeking sentient prey. Strikes induce lethargy and a suffering slumber.',
    source: 'Bestiary',
    tags: ['plant', 'tentacle', 'slumber', 'woodland']
  },
  {
    id: 'anthropophagi',
    name: 'Anthropophagi',
    category: 'Standard',
    nature: 'Magical',
    size: 'Medium',
    threatDice: { natural: '2d6', melee: 'd4' },
    threatMV: 12,
    hp: '18 (9/9)',
    dr: '–2 vs natural or bludgeoning',
    savingThrow: 'd4–d8',
    battlePhase: 'd6',
    specialAbilities: ['Immune to mental affliction', 'Blemmyes bite (save vs Fortitude → Willpower or crave flesh)', 'Revel of Flesh'],
    description: 'Cannibalistic man-like beings deformed by the spirit-energy of their victims. Among them are the blemmyes — headless torsos with a great face in the chest.',
    source: 'Bestiary',
    tags: ['humanoid', 'cannibal', 'undead-like', 'horror']
  },
  {
    id: 'arimaspians',
    name: 'Arimaspians',
    category: 'Standard',
    nature: 'Magical',
    size: 'Medium',
    threatDice: { natural: 'd6', arcane: '2d6', melee: 'd10', ranged: 'd8' },
    threatMV: 20,
    hp: '30 (15/15)',
    dr: 'By armor/shield',
    savingThrow: '2d10',
    battlePhase: 'd10',
    extraAttacks: 'Cutlass microburst (+1 threat per strike)',
    specialAbilities: ['Immune to Elementalism (Air) spells', 'Conjure mists and winds', 'Ice cloud prison (d10 Challenge; save vs Fortitude)', 'Alchemical pistol (d4 challenge; 12 bypasses armor)', 'Griffin mounts'],
    description: 'One-eyed cyclops-like sky pirates adorned in gold, mounted on enslaved griffins. They conjure mists and wield cutlasses and alchemical pistols.',
    source: 'Bestiary',
    tags: ['cyclops', 'pirate', 'air', 'gold', 'griffin']
  },
  {
    id: 'banshee',
    name: 'Banshee',
    category: 'Legendary',
    nature: 'Supernatural',
    size: 'Medium',
    threatDice: { arcane: '3d14', melee: '2d4', natural: 'd6+4', ranged: 'd4' },
    threatMV: 42,
    hp: '105 (53/52)',
    dr: '–2 against all potential harm',
    savingThrow: 'd12 (2d14 vs spiritual)',
    battlePhase: 'd10',
    specialAbilities: ['Keening Wail (curse; save vs Willpower)', 'Curse: +2 harm from traps/hazards, –1 rank/tier on saves', 'Shapeshifting (crone or fair maid)', 'Harbinger of death'],
    description: 'Fearsome spirit-women of Maedoen — harbingers of death. Their mournful keening wail curses warriors, and they may appear as crones or fair maidens.',
    source: 'Bestiary',
    tags: ['spirit', 'undead', 'curse', 'wail', 'fey']
  },
  {
    id: 'baphomet',
    name: 'Baphomet',
    category: 'Legendary',
    nature: 'Supernatural',
    size: 'Large',
    threatDice: { arcane: '3d12', melee: '3d12', ranged: '2d12', natural: '2d10' },
    threatMV: 56,
    hp: '108 (81/27)',
    dr: 'Plate Armor (d12)',
    savingThrow: '3d14',
    battlePhase: 'd14',
    specialAbilities: ['Avatar forms (Knight, Bard, Emissary)', 'Shapeshifting (any man, spirit, or god)', 'Complex cursed magic items', 'Reality manipulation'],
    description: 'A legendary avatar — half male, half female, human and goat — embodying occult power. Takes forms of knight, bard, or emissary, each with devastating abilities.',
    source: 'Bestiary',
    tags: ['avatar', 'demon', 'occult', 'shapeshifter', 'legendary']
  },
  {
    id: 'brownie',
    name: 'Brownie',
    category: 'Minor',
    nature: 'Magical',
    size: 'Tiny',
    threatDice: { melee: 'd4', natural: 'd4', ranged: 'd4', arcane: 'd4' },
    threatMV: 4,
    hp: '4–8 (2/2 to 4/4)',
    dr: '–1 if wearing brownie armor',
    savingThrow: 'd4–d8',
    battlePhase: 'd4–d8',
    specialAbilities: ['Household magic (fixing, hiding, luck)', 'Retaliatory curses (broken tools, cold hearths)', 'Shy and wary'],
    description: 'Tiny shee dwelling unseen in mortal homes, performing household chores. Easily offended if watched — their retaliatory curses cause endless domestic mishaps.',
    source: 'Bestiary',
    tags: ['fey', 'shee', 'tiny', 'household', 'helpful']
  },
  {
    id: 'capture-vine',
    name: 'Capture Vine',
    category: 'Minor',
    nature: 'Magical',
    size: 'Large',
    threatDice: { natural: 'd12' },
    threatMV: 12,
    hp: '18 (6/12)',
    dr: 'Tough stalks (d8); +3 natural toughness',
    savingThrow: 'd4–d8 vs physical',
    battlePhase: 'd10 (when in striking distance)',
    extraAttacks: 'Capture & Constrict (d12 vs Agility, then d12 constriction to Passive DP; armor adds to damage)',
    specialAbilities: ['Immobile (rooted)', 'Detects warm blood', 'Capture on surprise', 'Blood drain via hollow needles'],
    description: 'A sentient vine that detects warm blood, lashes out to capture victims, and drains them through thousands of hollow needles in its central stalk.',
    source: 'Bestiary',
    tags: ['plant', 'vine', 'immobile', 'blood-drain', 'constriction']
  },
  {
    id: 'dwarf',
    name: 'Dwarf',
    category: 'Minor',
    nature: 'Mundane',
    size: 'Medium',
    threatDice: { natural: 'd8', melee: 'd8', ranged: 'd4', arcane: 'd4' },
    threatMV: 8,
    hp: '12 (3/9)',
    dr: 'By armor and shield',
    savingThrow: 'd4–d8',
    battlePhase: 'd4–d6',
    specialAbilities: ['Skilled with axe, maul, crossbow', 'Earth Elementalism enchantments (some)', 'Master smiths and armorers', 'Nordwur: cursed weapon forging'],
    description: 'Short, powerfully built humanoids — master armorers, weapon-crafters, and smiths. The Nordwur dwarves of the Iron Dome forge powerful but cursed weapons.',
    source: 'Bestiary',
    tags: ['humanoid', 'dwarf', 'smith', 'warrior', 'tough']
  },
  {
    id: 'elemental',
    name: 'Elemental',
    category: 'Exceptional',
    nature: 'Supernatural',
    size: 'Huge',
    threatDice: { natural: '3d6', arcane: '3d6' },
    threatMV: 36,
    hp: '63–126',
    dr: 'Immune to own element; same as composition',
    savingThrow: 'd16 or 2d8',
    battlePhase: 'd12–d20',
    specialAbilities: ['Cast any elemental spell of own element (no Challenge Die)', 'Elemental bolts/area effects (3d6–3d12 harm, radius up to Ranged×2 ft)', 'Immune to one elemental sphere'],
    description: 'Creatures of pure Fire, Air, Earth, Water, or Energy — building blocks of creation. If freed by spell or mishap, they seek vengeance unless correctly bound.',
    source: 'Bestiary',
    tags: ['elemental', 'fire', 'water', 'air', 'earth', 'energy']
  },
  {
    id: 'elf',
    name: 'Elf',
    category: 'Minor',
    nature: 'Magical',
    size: 'Medium',
    threatDice: { melee: 'd8', ranged: 'd8', arcane: 'd6', natural: 'd4' },
    threatMV: 8,
    hp: '8 (4/4)',
    dr: 'By armor and shield',
    savingThrow: 'd10',
    battlePhase: 'd8–d12',
    specialAbilities: ['Bow and blade mastery', 'Forest tracking/woodcraft', 'Varies by type: High (deep magic), Forest (nature), Sea (storms/sailing), Dark (shadow magic), Seadeep (aquatic)'],
    description: 'Mysterious and beautiful rulers of the Forest of Meath — masters of bow, blade, and magic. Types include High, Forest, Sea, Seadeep, and Dark Elves.',
    source: 'Bestiary',
    tags: ['fey', 'elf', 'archer', 'magic', 'forest']
  },
  {
    id: 'extantar',
    name: 'Extantar',
    category: 'Exceptional',
    nature: 'Supernatural',
    size: 'Medium',
    threatDice: { natural: '2d4' },
    threatMV: 8,
    hp: '20–105',
    dr: 'Draumur armor (if any)',
    savingThrow: 'd8–d12',
    battlePhase: 'd4–d12',
    specialAbilities: ['Perception-reactive form (each observer sees differently)', 'Stats mirror any creature in bestiary', 'Cryptic guidance and insight', 'Mirror to the soul'],
    description: 'Enigmatic beings from the Meterea borders whose forms shift based on observer perception. No two people see the same Extantar.',
    source: 'Bestiary',
    tags: ['aberration', 'perception', 'meterea', 'shapeshifter', 'enigmatic']
  },
  {
    id: 'fox-folk',
    name: 'Fox Folk',
    category: 'Minor',
    nature: 'Magical',
    size: 'Medium',
    threatDice: { natural: 'd8', melee: 'd6', ranged: 'd6', arcane: 'd4' },
    threatMV: 8,
    hp: '12 (6/6)',
    dr: 'By armor/shield',
    savingThrow: 'd8',
    battlePhase: 'd10',
    specialAbilities: ['Shapeshifting (man-fox, fox, or human)', 'Sorcery spells (3d12 vs Challenge Die)', 'Illusion mastery', 'Love spells, invisibility, mental entrapment'],
    description: 'Mischievous shee tricksters who shift between fox, man-fox, and beautiful human forms. Masters of illusion, love spells, and theatrical display.',
    source: 'Bestiary',
    tags: ['fey', 'shee', 'shapeshifter', 'trickster', 'illusion']
  },

  // ═══════════════════════════════════════════════════════════════
  // Additional Creatures from Eldritch Bestiary CSV
  // ═══════════════════════════════════════════════════════════════

  {
    id: 'aniathraul',
    name: 'Aniathraul (Cythraul)',
    category: 'Exceptional',
    nature: 'Preternatural',
    size: 'Medium',
    threatDice: { melee: '2d8', natural: '2d6', ranged: '2d4', arcane: '3d12' },
    threatMV: 36,
    hp: '60 (15/45)',
    dr: 'Supernatural Hide (d8)',
    savingThrow: 'd12',
    battlePhase: 'd10',
    specialAbilities: ['Powerful arcane abilities', 'Cythraul heritage'],
    description: 'Extraordinary humanoid Cythraul with potent arcane powers and formidable combat skill.',
    source: 'Bestiary',
    tags: ['humanoid', 'cythraul', 'arcane', 'preternatural']
  },
  {
    id: 'credran',
    name: 'Credran (Elf)',
    category: 'Exceptional',
    nature: 'Magical',
    size: 'Medium',
    threatDice: { melee: 'd8', ranged: 'd6', arcane: 'd8' },
    threatMV: 8,
    hp: '24 (12/12)',
    dr: 'By armor/shield',
    savingThrow: 'd10',
    battlePhase: 'd10',
    specialAbilities: ['Elemental magic', 'Fay heritage', 'Woodland mastery'],
    description: 'Exceptional fay elves with elemental magical affinity and deep ties to the woodlands of Meath.',
    source: 'Bestiary',
    tags: ['fey', 'elf', 'elemental', 'magic', 'woodland']
  },
  {
    id: 'eborian-ape-men',
    name: 'Eborian Ape-Men (Losels)',
    category: 'Exceptional',
    nature: 'Preternatural',
    size: 'Large',
    threatDice: { melee: '2d8', natural: '2d6', ranged: '1d6' },
    threatMV: 22,
    hp: '54 (14/40)',
    dr: 'Thick hide (+4 HP)',
    savingThrow: 'd8',
    battlePhase: 'd8',
    specialAbilities: ['Brute strength', 'Climbing', 'Primal ferocity'],
    description: 'Savage ape-like humanoids known as Losels — powerful, brutish creatures with primal ferocity and exceptional climbing ability.',
    source: 'Bestiary',
    tags: ['beast', 'ape', 'primal', 'brute', 'climber']
  },
  {
    id: 'gethra',
    name: 'Gethra',
    category: 'Standard',
    nature: 'Magical',
    size: 'Medium',
    threatDice: { melee: '2d8', natural: '1d10', ranged: '2d10' },
    threatMV: 26,
    hp: '24 (12/12)',
    dr: 'By armor/shield',
    savingThrow: 'd8',
    battlePhase: 'd8',
    specialAbilities: ['Ranged combat specialist', 'Tactical coordination'],
    description: 'Skilled combatants excelling in ranged warfare and coordinated tactical strikes.',
    source: 'Bestiary',
    tags: ['humanoid', 'ranged', 'tactical', 'warrior']
  },
  {
    id: 'giant-ant',
    name: 'Giant Ant',
    category: 'Minor',
    nature: 'Mundane',
    size: 'Medium',
    threatDice: { natural: 'd4' },
    threatMV: 4,
    hp: '8 (2/6)',
    dr: 'Chitinous Shell (+2)',
    savingThrow: 'd4',
    battlePhase: 'd6',
    specialAbilities: ['Mandible bite', 'Swarm tactics', 'Hive communication'],
    description: 'Dog-sized to horse-sized ants that operate with terrifying hive coordination. Minor individually, but deadly in swarms.',
    source: 'Bestiary',
    tags: ['beast', 'insect', 'swarm', 'hive']
  },
  {
    id: 'giant-fowl',
    name: 'Giant Fowl (Roc, Eagles)',
    category: 'Exceptional',
    nature: 'Magical',
    size: 'Huge',
    threatDice: { natural: '3d8' },
    threatMV: 24,
    hp: '54 (14/40)',
    dr: 'Feathered hide (+3)',
    savingThrow: 'd10',
    battlePhase: 'd10',
    extraAttacks: 'Talon snatch (carry off prey)',
    specialAbilities: ['Flight', 'Keen sight', 'Dive attack', 'Talon snatch/carry'],
    description: 'Enormous birds of prey — rocs, giant eagles, and similar colossal avians that swoop down to snatch horses and riders alike.',
    source: 'Bestiary',
    tags: ['beast', 'bird', 'flight', 'huge', 'predator']
  },
  {
    id: 'giant-rat',
    name: 'Giant Rat',
    category: 'Minor',
    nature: 'Mundane',
    size: 'Small',
    threatDice: { natural: 'd4' },
    threatMV: 4,
    hp: '4 (2/2)',
    dr: 'None',
    savingThrow: 'd4',
    battlePhase: 'd6',
    specialAbilities: ['Disease bite', 'Pack tactics', 'Keen smell'],
    description: 'Oversized, disease-carrying vermin found in sewers, ruins, and dungeons. Dangerous in large numbers.',
    source: 'Bestiary',
    tags: ['beast', 'vermin', 'disease', 'pack', 'sewer']
  },
  {
    id: 'gnome',
    name: 'Gnome',
    category: 'Minor',
    nature: 'Magical',
    size: 'Small',
    threatDice: { melee: 'd4', ranged: 'd4', arcane: 'd6' },
    threatMV: 6,
    hp: '6 (3/3)',
    dr: 'By armor',
    savingThrow: 'd6',
    battlePhase: 'd6',
    specialAbilities: ['Illusion magic', 'Tinkering expertise', 'Small size advantage', 'Earth affinity'],
    description: 'Small, clever folk with a knack for illusion magic, tinkering, and exploration. Related to dwarves but more magically inclined.',
    source: 'Bestiary',
    tags: ['humanoid', 'gnome', 'small', 'magic', 'tinkerer']
  },
  {
    id: 'gweithraul',
    name: 'Gweithraul (Cythraul)',
    category: 'Standard',
    nature: 'Preternatural',
    size: 'Medium',
    threatDice: { melee: '2d8', natural: '2d8' },
    threatMV: 16,
    hp: '32 (8/24)',
    dr: 'Supernatural Hide (d6)',
    savingThrow: 'd8',
    battlePhase: 'd8',
    specialAbilities: ['Cythraul heritage', 'Dual melee/natural attacks', 'Dark resilience'],
    description: 'Standard humanoid Cythraul — dark, resilient warriors capable of fearsome melee and natural attacks.',
    source: 'Bestiary',
    tags: ['humanoid', 'cythraul', 'warrior', 'preternatural']
  },
  {
    id: 'peri',
    name: 'Peri (Rogue Angel)',
    category: 'Minor',
    nature: 'Magical',
    size: 'Medium',
    threatDice: { melee: 'd4', natural: 'd6', arcane: 'd4' },
    threatMV: 6,
    hp: '8 (4/4)',
    dr: 'Faint divine protection',
    savingThrow: 'd6',
    battlePhase: 'd6',
    specialAbilities: ['Minor divine magic', 'Flight', 'Fallen celestial heritage'],
    description: 'Rogue angels — minor celestial beings fallen from grace, retaining faint echoes of divine power.',
    source: 'Bestiary',
    tags: ['celestial', 'fallen', 'angel', 'minor', 'magic']
  },
  {
    id: 'sentinel',
    name: 'Sentinel',
    category: 'Standard',
    nature: 'Magical',
    size: 'Large',
    threatDice: { melee: '2d8', natural: '2d8' },
    threatMV: 16,
    hp: '40 (10/30)',
    dr: 'Constructed Form (d8)',
    savingThrow: 'd10',
    battlePhase: 'd8',
    specialAbilities: ['Guardian programming', 'Tireless watch', 'Damage resistance', 'Construct immunities'],
    description: 'Magical guardian constructs or beings tasked with protecting locations, objects, or persons. Tireless and unyielding.',
    source: 'Bestiary',
    tags: ['construct', 'guardian', 'tireless', 'magical']
  },
  {
    id: 'shee-minor',
    name: 'Shee (Minor Fay)',
    category: 'Minor',
    nature: 'Preternatural',
    size: 'Small',
    threatDice: { melee: 'd6', natural: 'd4', ranged: 'd8', arcane: 'd10' },
    threatMV: 10,
    hp: '8 (4/4)',
    dr: 'Fey Resilience',
    savingThrow: 'd8',
    battlePhase: 'd8',
    specialAbilities: ['Glamor magic (d10)', 'Preternatural agility', 'Fey nature', 'Trickery and misdirection'],
    description: 'Minor faerie beings of the preternatural realms — mischievous, elusive, and wielding glamor magic that confounds mortals.',
    source: 'Bestiary',
    tags: ['fey', 'shee', 'faerie', 'glamor', 'preternatural']
  },
  {
    id: 'shee-standard',
    name: 'Shee (Standard Fay)',
    category: 'Standard',
    nature: 'Preternatural',
    size: 'Medium',
    threatDice: { melee: 'd8', natural: 'd4', ranged: '2d4', arcane: '2d6' },
    threatMV: 12,
    hp: '18 (9/9)',
    dr: 'Fey Resilience',
    savingThrow: 'd10',
    battlePhase: 'd10',
    specialAbilities: ['Glamor magic (2d6)', 'Enchantment', 'Fey step', 'Nature communion'],
    description: 'Standard faerie beings with notable glamor powers. More dangerous and deliberate than their minor kin.',
    source: 'Bestiary',
    tags: ['fey', 'shee', 'faerie', 'glamor', 'enchantment']
  },
  {
    id: 'shee-lord',
    name: 'Shee Lord',
    category: 'Exceptional',
    nature: 'Preternatural',
    size: 'Medium',
    threatDice: { melee: '2d8', natural: '2d6', arcane: '3d12' },
    threatMV: 36,
    hp: '72 (18/54)',
    dr: 'Fey Noble Wards (d10)',
    savingThrow: 'd14',
    battlePhase: 'd12',
    specialAbilities: ['Powerful glamor (3d12)', 'Fey nobility', 'Command lesser fay', 'Reality shaping'],
    description: 'Fay nobility of exceptional power — lords and ladies of the faerie courts wielding reality-shaping glamor and commanding legions of lesser fay.',
    source: 'Bestiary',
    tags: ['fey', 'shee', 'noble', 'glamor', 'exceptional']
  },
  {
    id: 'source-of-evil',
    name: 'Source of Evil',
    category: 'Legendary',
    nature: 'Supernatural',
    size: 'Large',
    threatDice: { arcane: '3d14', melee: '3d12', natural: '3d12' },
    threatMV: 56,
    hp: '135 (34/101)',
    dr: 'Supernatural Resilience (d12)',
    savingThrow: '3d14',
    battlePhase: 'd14',
    specialAbilities: ['Avatar of darkness', 'Corruption aura', 'Reality distortion', 'Legendary resistance'],
    description: 'A legendary avatar of pure malevolence — the embodiment of evil itself, warping reality and corrupting all within its presence.',
    source: 'Bestiary',
    tags: ['avatar', 'evil', 'supernatural', 'corruption', 'legendary']
  },
  {
    id: 'swipes',
    name: 'Swipes (Astral Footpads)',
    category: 'Minor',
    nature: 'Preternatural',
    size: 'Small',
    threatDice: { melee: 'd4', natural: 'd4+2', ranged: 'd10' },
    threatMV: 10,
    hp: '6 (3/3)',
    dr: 'Ethereal Nature',
    savingThrow: 'd6',
    battlePhase: 'd8',
    specialAbilities: ['Extraplanar origin', 'Astral jaunt', 'Ranged speciality', 'Claw attacks (+2)'],
    description: 'Minor extraplanar footpads from the astral realm — small, quick, and surprisingly dangerous at range despite their diminutive size.',
    source: 'Bestiary',
    tags: ['extraplanar', 'astral', 'thief', 'ranged', 'minor']
  },
  {
    id: 'woodshades',
    name: 'Woodshades (Fallen Credran)',
    category: 'Exceptional',
    nature: 'Preternatural',
    size: 'Medium',
    threatDice: { melee: '3d8', ranged: '2d4', arcane: '2d6' },
    threatMV: 24,
    hp: '54 (14/40)',
    dr: 'Shadow Wards (d8)',
    savingThrow: 'd12',
    battlePhase: 'd10',
    specialAbilities: ['Fallen Credran heritage', 'Shadow magic', 'Woodland ambush', 'Dark enchantments'],
    description: 'Fallen Credran elves corrupted by shadow — exceptional woodland ambushers wielding dark enchantments and deadly blade work.',
    source: 'Bestiary',
    tags: ['fey', 'elf', 'fallen', 'shadow', 'ambush']
  }
];

// Encounter Difficulty Table
const ENCOUNTER_DIFFICULTY_TABLE = {
  1: {
    'Practitioner': { easy: 7, moderate: 10, difficult: 12, demanding: 14, formidable: 16, deadly: 18 },
    'Competent': { easy: 14, moderate: 20, difficult: 24, demanding: 28, formidable: 32, deadly: 36 },
    'Proficient': { easy: 21, moderate: 29, difficult: 36, demanding: 42, formidable: 48, deadly: 55 },
    'Advanced': { easy: 28, moderate: 39, difficult: 48, demanding: 56, formidable: 64, deadly: 73 },
    'Elite': { easy: 35, moderate: 49, difficult: 60, demanding: 70, formidable: 80, deadly: 110 }
  },
  2: {
    'Practitioner': { easy: 14, moderate: 20, difficult: 24, demanding: 28, formidable: 32, deadly: 36 },
    'Competent': { easy: 28, moderate: 39, difficult: 48, demanding: 56, formidable: 64, deadly: 73 },
    'Proficient': { easy: 42, moderate: 59, difficult: 72, demanding: 84, formidable: 96, deadly: 108 },
    'Advanced': { easy: 56, moderate: 77, difficult: 96, demanding: 112, formidable: 128, deadly: 144 },
    'Elite': { easy: 70, moderate: 95, difficult: 120, demanding: 140, formidable: 160, deadly: 190 }
  },
  3: {
    'Practitioner': { easy: 21, moderate: 30, difficult: 36, demanding: 42, formidable: 48, deadly: 54 },
    'Competent': { easy: 42, moderate: 59, difficult: 72, demanding: 84, formidable: 96, deadly: 108 },
    'Proficient': { easy: 63, moderate: 84, difficult: 108, demanding: 126, formidable: 144, deadly: 162 },
    'Advanced': { easy: 84, moderate: 111, difficult: 144, demanding: 168, formidable: 192, deadly: 216 },
    'Elite': { easy: 105, moderate: 140, difficult: 180, demanding: 210, formidable: 240, deadly: 270 }
  },
  4: {
    'Practitioner': { easy: 28, moderate: 42, difficult: 50, demanding: 56, formidable: 64, deadly: 72 },
    'Competent': { easy: 56, moderate: 77, difficult: 96, demanding: 112, formidable: 128, deadly: 144 },
    'Proficient': { easy: 84, moderate: 111, difficult: 144, demanding: 168, formidable: 192, deadly: 216 },
    'Advanced': { easy: 112, moderate: 147, difficult: 180, demanding: 224, formidable: 256, deadly: 288 },
    'Elite': { easy: 140, moderate: 185, difficult: 228, demanding: 280, formidable: 320, deadly: 360 }
  }
};

type DefenseLevel = 'Practitioner' | 'Competent' | 'Proficient' | 'Advanced' | 'Elite';
type Difficulty = 'easy' | 'moderate' | 'difficult' | 'demanding' | 'formidable' | 'deadly';

export default function Bestiary() {
  const searchParams = useSearchParams();
  const backTarget = resolveBackTargetFromParam(searchParams.get('from'), 'gm-tools');

  const [customCreatures, setCustomCreatures] = useState<BestiaryCreature[]>([]);
  const [rawMonsterData, setRawMonsterData] = useState<SavedCharacter[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CreatureCategory | 'All'>('All');
  const [selectedNature, setSelectedNature] = useState<CreatureNature | undefined>();
  const [selectedSource, setSelectedSource] = useState<string>('All');
  const [selectedCreature, setSelectedCreature] = useState<BestiaryCreature | null>(null);
  const [showEncounterBuilder, setShowEncounterBuilder] = useState(false);

  // Encounter Builder State
  const [partySize, setPartySize] = useState(4);
  const [defenseLevel, setDefenseLevel] = useState<DefenseLevel>('Competent');
  const [difficulty, setDifficulty] = useState<Difficulty>('moderate');
  const [encounterCreatures, setEncounterCreatures] = useState<BestiaryCreature[]>([]);

  // ── Vault sync: load on mount and listen for cross-tab / cross-component changes
  useEffect(() => {
    const syncFromVault = () => {
      const vaultItems = getVaultCreatures();
      // Map vault entries back to BestiaryCreature stubs for display
      const mapped: BestiaryCreature[] = vaultItems.map(v => ({
        id: v.id,
        name: v.name,
        category: v.category as CreatureCategory,
        nature: v.nature as CreatureNature,
        size: v.size as CreatureSize,
        threatDice: {},
        threatMV: v.threatMV,
        hp: String(v.hp),
        dr: String(v.dr),
        savingThrow: v.savingThrow,
        battlePhase: String(v.battlePhase),
        extraAttacks: v.extraAttacks > 0 ? String(v.extraAttacks) : undefined,
        specialAbilities: v.specialAbilities,
        description: '',
        source: v.source as BestiaryCreature['source'],
        tags: [],
      }));
      setEncounterCreatures(mapped);
    };
    syncFromVault();
    const unsub = onVaultChange(syncFromVault);
    return unsub;
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadCustomCreatures = () => {
      try {
        const storedMonsters = getCharactersByType('Monster');
        setRawMonsterData(storedMonsters); // Store raw data for export
        const mapped = storedMonsters.map(mapSavedMonsterToBestiaryCreature)
          .sort((a, b) => a.name.localeCompare(b.name));
        setCustomCreatures(mapped);
      } catch (error) {
        console.error('Failed to load custom monsters for bestiary:', error);
      }
    };

    loadCustomCreatures();

    const handleStorage = (event: StorageEvent) => {
      if (!event.key || event.key === 'eldritch_characters') {
        loadCustomCreatures();
      }
    };

    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const allCreatures = useMemo(
    () => [...customCreatures, ...BESTIARY_CREATURES],
    [customCreatures]
  );

  // Filtered creatures
  const filteredCreatures = useMemo(() => {
    return allCreatures.filter(creature => {
      const matchesSearch = creature.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           creature.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           creature.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory = selectedCategory === 'All' || creature.category === selectedCategory;
      const matchesNature = !selectedNature || creature.nature === selectedNature;
      const matchesSource = selectedSource === 'All' || creature.source === selectedSource;

      return matchesSearch && matchesCategory && matchesNature && matchesSource;
    });
  }, [allCreatures, searchTerm, selectedCategory, selectedNature, selectedSource]);

  // Calculate threat budget
  const threatBudget = useMemo(() => {
    const sizeData = ENCOUNTER_DIFFICULTY_TABLE[partySize as keyof typeof ENCOUNTER_DIFFICULTY_TABLE];
    if (!sizeData) return 0;
    const levelData = sizeData[defenseLevel];
    return levelData[difficulty];
  }, [partySize, defenseLevel, difficulty]);

  // Calculate current encounter threat
  const currentThreat = useMemo(() => {
    return encounterCreatures.reduce((total, creature) => total + creature.threatMV, 0);
  }, [encounterCreatures]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedNature(undefined);
    setSelectedSource('All');
  };

  const addToEncounter = useCallback((creature: BestiaryCreature) => {
    const projectedThreat = currentThreat + creature.threatMV;
    if (threatBudget > 0 && projectedThreat > threatBudget * 1.2) {
      return;
    }

    const firstDice =
      creature.threatDice.melee ??
      creature.threatDice.natural ??
      creature.threatDice.ranged ??
      creature.threatDice.arcane ??
      '—';

    const vaultEntry: VaultCreature = {
      id: creature.id,
      name: creature.name,
      category: creature.category,
      nature: creature.nature,
      size: creature.size,
      threatMV: creature.threatMV,
      threatDice: firstDice,
      hp: Number(creature.hp) || 0,
      dr: Number(creature.dr) || 0,
      savingThrow: creature.savingThrow,
      battlePhase: Number(creature.battlePhase) || 0,
      extraAttacks: Number(creature.extraAttacks) || 0,
      specialAbilities: creature.specialAbilities ?? [],
      source: creature.source,
      addedAt: new Date().toISOString(),
    };

    addToVault(vaultEntry);
    // State will sync via the vault onChange listener

    if (!showEncounterBuilder) {
      setShowEncounterBuilder(true);
    }
  }, [currentThreat, threatBudget, showEncounterBuilder]);

  const removeFromEncounter = useCallback((index: number) => {
    removeFromVaultByIndex(index);
    // State will sync via the vault onChange listener
  }, []);

  const handleClearEncounter = useCallback(() => {
    clearVault();
    // State will sync via the vault onChange listener
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-start">
        <Link
          href={backTarget.href}
          className="inline-flex items-center text-soft-amethyst hover:text-soft-amethyst font-medium"
        >
          {backTarget.label}
        </Link>
      </div>

      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-off-white mb-2">
          Beings Diverse and Malign
        </h1>
        <p className="text-off-white/60 mb-4">
          The Eldritch RPG Bestiary - A comprehensive guide to creatures, monsters, and adversaries
        </p>
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 text-sm text-red-400">
          <p className="font-semibold">🐉 Warning: Dangerous Knowledge</p>
          <p>This information is considered not safe to know and is normally kept locked and chained in the archives of the Octocirculi Academy.</p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white/5 rounded-lg shadow-lg p-6">
        <div className="flex flex-wrap gap-4 items-center justify-between mb-4">
          <div className="flex-1 min-w-64">
            <input
              type="text"
              placeholder="Search creatures, abilities, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-white/15 rounded-md px-3 py-2"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as CreatureCategory | 'All')}
              className="border border-white/15 rounded-md px-3 py-2"
            >
              <option value="All">All Categories</option>
              <option value="Minor">Minor</option>
              <option value="Standard">Standard</option>
              <option value="Exceptional">Exceptional</option>
              <option value="Legendary">Legendary</option>
            </select>

            <div className="relative">
              <select
                value={selectedNature ?? ''}
                onChange={(e) => {
                  const value = e.target.value as CreatureNature | '';
                  setSelectedNature(value === '' ? undefined : value);
                }}
                className="border border-white/15 rounded-md px-3 py-2 pr-8"
                aria-label="Nature filter"
              >
                <option value="" disabled hidden>
                  Select nature…
                </option>
                {NATURE_VALUES.map(nature => (
                  <option key={nature} value={nature}>
                    {nature}
                  </option>
                ))}
              </select>
              {selectedNature && (
                <button
                  type="button"
                  onClick={() => setSelectedNature(undefined)}
                  className="absolute inset-y-0 right-1 flex items-center px-1 text-off-white/50 hover:text-off-white/80"
                  aria-label="Clear nature filter"
                >
                  ×
                </button>
              )}
            </div>

            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="border border-white/15 rounded-md px-3 py-2"
            >
              <option value="All">All Sources</option>
              <option value="QSB">QSB Examples</option>
              <option value="Bestiary">Bestiary Entries</option>
              <option value="Trope">Creature Tropes</option>
              <option value="Summoned">Summoned</option>
              <option value="Custom">Custom Creations</option>
            </select>
          </div>

          <button
            onClick={() => setShowEncounterBuilder(!showEncounterBuilder)}
            className="bg-soft-amethyst hover:bg-soft-amethyst/80 text-white font-bold py-2 px-4 rounded"
          >
            {showEncounterBuilder ? 'Hide' : 'Show'} Encounter Builder
            {encounterCreatures.length > 0 && ` (${encounterCreatures.length})`}
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-off-white/60 mt-4">
          <span>
            Showing {filteredCreatures.length} of {allCreatures.length} creatures
            {searchTerm || selectedCategory !== 'All' || Boolean(selectedNature) || selectedSource !== 'All' ? ' (filtered)' : ''}
          </span>
          {filteredCreatures.length === 0 && (
            <button
              onClick={resetFilters}
              className="text-purple-600 hover:text-purple-800 font-medium"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Encounter Builder */}
        {showEncounterBuilder && (
          <div className="border-t pt-4 bg-purple-50 -m-6 mt-4 p-6 rounded-b-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Encounter Builder</h3>
              <div className="flex items-center gap-3">
                {encounterCreatures.length > 0 && (
                  <button
                    onClick={handleClearEncounter}
                    className="text-xs text-red-400 hover:text-red-300 border border-red-400/40 px-2 py-1 rounded"
                  >
                    Clear All
                  </button>
                )}
                <Link
                  href="/encounter-generator?from=bestiary"
                  className="inline-flex items-center gap-1 bg-soft-amethyst hover:bg-soft-amethyst/80 text-white text-sm font-semibold px-3 py-1.5 rounded"
                >
                  Open in Encounter Generator →
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-off-white/80 mb-2">Party Size:</label>
                <select
                  value={partySize}
                  onChange={(e) => setPartySize(Number(e.target.value))}
                  className="w-full border border-white/15 rounded-md px-3 py-2"
                >
                  <option value={1}>1 PC</option>
                  <option value={2}>2 PCs</option>
                  <option value={3}>3 PCs</option>
                  <option value={4}>4 PCs</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-off-white/80 mb-2">Defense Level:</label>
                <select
                  value={defenseLevel}
                  onChange={(e) => setDefenseLevel(e.target.value as DefenseLevel)}
                  className="w-full border border-white/15 rounded-md px-3 py-2"
                >
                  <option value="Practitioner">Practitioner</option>
                  <option value="Competent">Competent</option>
                  <option value="Proficient">Proficient</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Elite">Elite</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-off-white/80 mb-2">Difficulty:</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                  className="w-full border border-white/15 rounded-md px-3 py-2"
                >
                  <option value="easy">Easy</option>
                  <option value="moderate">Moderate</option>
                  <option value="difficult">Difficult</option>
                  <option value="demanding">Demanding</option>
                  <option value="formidable">Formidable</option>
                  <option value="deadly">Deadly</option>
                </select>
              </div>

              <div className="bg-white/5 p-3 rounded border">
                <p className="text-sm font-semibold text-off-white/80">Threat Budget: {threatBudget}</p>
                <p className="text-sm text-off-white/60">Current: {currentThreat}</p>
                <div className="w-full bg-white/15 rounded-full h-2 mt-1">
                  <div
                    className="bg-soft-amethyst h-2 rounded-full"
                    style={{ width: `${threatBudget ? Math.min(100, (currentThreat / threatBudget) * 100) : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Current Encounter */}
            {encounterCreatures.length > 0 && (
              <div className="bg-white/5 p-4 rounded border mb-4">
                <h4 className="font-semibold mb-2">Current Encounter:</h4>
                <div className="space-y-2">
                  {encounterCreatures.map((creature, index) => (
                    <div key={index} className="flex items-center justify-between bg-white/5 p-2 rounded">
                      <span className="text-sm">
                        {creature.name} ({creature.category}) - Threat MV: {creature.threatMV}
                      </span>
                      <button
                        onClick={() => removeFromEncounter(index)}
                        className="text-red-400 hover:text-red-400 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                {/* Export to Encounter+ */}
                <div className="mt-4 pt-4 border-t border-white/10">
                  <ExportToEncounterPlus
                    monsters={encounterCreatures.map(ec => {
                      // Find raw SavedCharacter data by matching name
                      const raw = rawMonsterData.find(m => m.name === ec.name);
                      if (raw) return raw;
                      // Fallback: create minimal SavedCharacter from BestiaryCreature
                      return {
                        id: ec.id,
                        user_id: 'local',
                        name: ec.name,
                        type: 'Monster' as const,
                        level: 1,
                        race: ec.nature,
                        class: ec.category,
                        abilities: { prowess_mv: 6, agility_mv: 0, melee_mv: 0, fortitude_mv: 0, endurance_mv: 0, strength_mv: 0, competence_mv: 0, willpower_mv: 0 },
                        computed: { active_dp: 0, passive_dp: 0, spirit_pts: 0 },
                        status: { current_hp_active: 0, current_hp_passive: 0, status_flags: [], gear: [], notes: ec.description },
                        tags: ec.tags,
                        full_data: {
                          battlePhase: ec.battlePhase,
                          category: ec.category,
                          nature: ec.nature,
                          size: ec.size,
                          hp: ec.hp,
                          dr: ec.dr,
                          threatDice: ec.threatDice,
                          threatMV: ec.threatMV
                        },
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                      };
                    })}
                    filename={`encounter-${encounterCreatures.length}-creatures`}
                    variant="primary"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {!showEncounterBuilder && encounterCreatures.length > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-sm text-purple-800">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>
              Encounter contains {encounterCreatures.length} creature{encounterCreatures.length === 1 ? '' : 's'}
              {threatBudget > 0 ? ` (Threat ${currentThreat}/${threatBudget})` : ` (Threat ${currentThreat})`}
            </span>
            <button
              onClick={() => setShowEncounterBuilder(true)}
              className="text-purple-700 hover:text-purple-900 font-semibold"
            >
              Open Encounter Builder
            </button>
          </div>
        </div>
      )}

      {/* Creature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCreatures.length === 0 && (
          <div className="col-span-full bg-white/5 rounded-lg border border-dashed border-white/15 p-8 text-center text-off-white/60">
            <p className="font-semibold text-off-white/80 mb-2">No creatures match your filters.</p>
            <p className="text-sm">Try adjusting your search or clearing all filters to see the full bestiary.</p>
            <button
              onClick={resetFilters}
              className="mt-4 inline-flex items-center justify-center rounded-md bg-soft-amethyst px-4 py-2 text-sm font-semibold text-white hover:bg-soft-amethyst/80"
            >
              Reset filters
            </button>
          </div>
        )}
        {filteredCreatures.map((creature) => (
          <div key={creature.id} className="bg-white/5 rounded-lg shadow-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-bold text-off-white">{creature.name}</h3>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                creature.category === 'Minor' ? 'bg-green-900/20 text-muted-eldritch-green' :
                creature.category === 'Standard' ? 'bg-blue-900/30 text-blue-300' :
                creature.category === 'Exceptional' ? 'bg-yellow-900/20 text-yellow-300' :
                'bg-red-900/20 text-red-400'
              }`}>
                {creature.category}
              </span>
            </div>

            <div className="space-y-2 text-sm text-off-white/60 mb-4">
              <p><strong>Nature:</strong> {creature.nature}</p>
              <p><strong>Size:</strong> {creature.size}</p>
              <p><strong>Threat MV:</strong> {creature.threatMV}</p>
              <p><strong>HP:</strong> {creature.hp}</p>
              <p><strong>Source:</strong> {creature.source}</p>
            </div>

            <p className="text-sm text-off-white/80 mb-4">{creature.description}</p>

            <div className="flex flex-wrap gap-1 mb-4">
              {creature.tags.map((tag) => (
                <span key={tag} className="px-2 py-1 bg-white/10 text-off-white/60 rounded text-xs">
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSelectedCreature(creature)}
                className="flex-1 bg-soft-amethyst hover:bg-soft-amethyst/80 text-white font-bold py-2 px-3 rounded text-sm"
              >
                View Details
              </button>
              <button
                onClick={() => addToEncounter(creature)}
                disabled={threatBudget > 0 && currentThreat + creature.threatMV > threatBudget * 1.2}
                className="bg-soft-amethyst hover:bg-soft-amethyst/80 disabled:bg-white/20 text-white font-bold py-2 px-3 rounded text-sm"
              >
                {showEncounterBuilder ? 'Add' : 'Add to Encounter'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Creature Detail Modal */}
      {selectedCreature && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white/5 rounded-lg p-6 max-w-2xl w-full max-h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-off-white">{selectedCreature.name}</h2>
              <button
                onClick={() => setSelectedCreature(null)}
                className="text-off-white/50 hover:text-off-white/80 text-xl"
              >
                ×
              </button>
            </div>

            {/* Full QSB Display */}
            <div className="bg-black text-green-400 p-4 rounded font-mono text-sm mb-4">
              {selectedCreature.name}<br/>
              TY: {selectedCreature.category} |
              TD: {Object.entries(selectedCreature.threatDice).map(([type, dice]) =>
                dice ? `${type.charAt(0).toUpperCase() + type.slice(1)} ${dice}` : null
              ).filter(Boolean).join(', ')} |
              {selectedCreature.extraAttacks && `EA: ${selectedCreature.extraAttacks} | `}
              HP: {selectedCreature.hp} [{selectedCreature.nature}, {selectedCreature.size}] |
              DR: {selectedCreature.dr} |
              ST: {selectedCreature.savingThrow} |
              BP: {selectedCreature.battlePhase}
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-off-white mb-2">Description</h3>
                <p className="text-off-white/80">{selectedCreature.description}</p>
              </div>

              {selectedCreature.specialAbilities && (
                <div>
                  <h3 className="font-semibold text-off-white mb-2">Special Abilities</h3>
                  <ul className="list-disc pl-5 text-off-white/80">
                    {selectedCreature.specialAbilities.map((ability, index) => (
                      <li key={index}>{ability}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <h3 className="font-semibold text-off-white mb-2">Combat Statistics</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Category:</strong> {selectedCreature.category}</p>
                    <p><strong>Nature:</strong> {selectedCreature.nature}</p>
                    <p><strong>Size:</strong> {selectedCreature.size}</p>
                    <p><strong>Threat MV:</strong> {selectedCreature.threatMV}</p>
                  </div>
                  <div>
                    <p><strong>Hit Points:</strong> {selectedCreature.hp}</p>
                    <p><strong>Damage Reduction:</strong> {selectedCreature.dr}</p>
                    <p><strong>Saving Throw:</strong> {selectedCreature.savingThrow}</p>
                    <p><strong>Battle Phase:</strong> {selectedCreature.battlePhase}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {selectedCreature.tags.map((tag) => (
                  <span key={tag} className="px-2 py-1 bg-white/10 text-off-white/60 rounded text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="bg-white/5 rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold mb-4">Bestiary Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-soft-amethyst">{allCreatures.length}</p>
            <p className="text-sm text-off-white/60">Total Creatures</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-muted-eldritch-green">
              {allCreatures.filter(c => c.source === 'Bestiary').length}
            </p>
            <p className="text-sm text-off-white/60">Bestiary Entries</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-yellow-600">
              {allCreatures.filter(c => c.category === 'Legendary').length}
            </p>
            <p className="text-sm text-off-white/60">Legendary Beings</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-400">
              {allCreatures.filter(c => c.nature === 'Supernatural').length}
            </p>
            <p className="text-sm text-off-white/60">Supernatural Entities</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-600">{customCreatures.length}</p>
            <p className="text-sm text-off-white/60">Custom Creations</p>
          </div>
        </div>
      </div>
    </div>
  );
}
