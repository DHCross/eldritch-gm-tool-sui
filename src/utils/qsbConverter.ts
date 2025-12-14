/**
 * QSB (Quick Stat Block) Converter for Eldritch 2nd Edition
 * Implements the Full Parity Formula and QSB-compliant stat derivation.
 */

import { DieRank } from '../types/revisedEntity';
import { ParsedStatBlock } from './revisedTextParser';

// =============================================================================
// Types
// =============================================================================

export type CreatureSize = 'tiny' | 'small' | 'medium' | 'large' | 'huge' | 'gargantuan';

export type CreatureTrait = 'fast' | 'especially-speedy' | 'agility' | 'magical' | 'undead' | 'construct' | 'elemental';

export interface QSBStatBlock {
  name: string;
  type: string;  // e.g., "Minor Undead"
  
  // Threat Dice
  threatDice: {
    natural?: DieRank;
    melee?: DieRank;
    ranged?: DieRank;
  };
  
  // Extra Attacks
  extraAttacks?: string;
  
  // Hit Points (derived)
  hp: {
    total: number;
    active: number;
    passive: number;
    derivation: string;  // Explanation of how HP was calculated
  };
  
  // Damage Reduction (converted to static HP)
  dr?: {
    bonus: number;
    source: string;
  };
  
  // Saving Throw
  savingThrow?: DieRank;
  savingThrowNote?: string;
  
  // Battle Phase
  battlePhase: {
    die: DieRank;
    phase: number;
  };
  
  // Movement
  movement: {
    base: number;  // squares per phase
    modifiers: string[];
    runSpeed: number;
    sprintSpeed: number;
  };
  
  // Abilities and special powers
  abilities: string[];
  
  // Immunities
  immunities?: string[];
  
  // Creature properties for calculation
  size: CreatureSize;
  traits: CreatureTrait[];
  speedFocus?: DieRank;
  
  // Notes for GMs
  complianceNotes: string[];
}

// =============================================================================
// Constants
// =============================================================================

/** Die rank to max value */
export function dieMax(die: DieRank): number {
  return parseInt(die.replace('d', ''), 10);
}

/** Battle Phase die to Phase number (lower is faster) */
export const BP_DIE_TO_PHASE: Record<string, number> = {
  'd12': 1,
  'd10': 2,
  'd8': 3,
  'd6': 4,
  'd4': 5,
  'd3': 5,  // d3 is treated as Phase 5
};

/** Size modifiers for movement */
export const SIZE_MOVEMENT_MODIFIER: Record<CreatureSize, number> = {
  'tiny': -1,
  'small': -1,
  'medium': 0,
  'large': 1,
  'huge': 2,
  'gargantuan': 3,
};

/** Size modifiers for HP multiplier */
export const SIZE_HP_MODIFIER: Record<CreatureSize, number> = {
  'tiny': -2,
  'small': -1,
  'medium': 1,
  'large': 2,
  'huge': 3,
  'gargantuan': 4,
};

/** Speed Focus die to movement bonus */
export function speedFocusBonus(die: DieRank): number {
  const max = dieMax(die);
  if (max >= 12) return 3;
  if (max >= 8) return 2;
  return 1;  // d4-d6
}

/** DR die to static HP bonus (average of die) */
export function drToStaticHP(die: DieRank): number {
  const max = dieMax(die);
  return Math.round(max / 2);  // Average of 1 to max, rounded
}

// =============================================================================
// Movement Calculation (Full Parity Formula)
// =============================================================================

export interface MovementCalculation {
  base: number;
  modifiers: { name: string; value: number }[];
  total: number;
  formula: string;
}

/**
 * Calculate movement using the Full Parity Formula.
 * Formula: (12 + BP Die Max) ÷ 5, rounded normally (up if Agility specialty)
 */
export function calculateMovement(
  bpDie: DieRank,
  options: {
    size?: CreatureSize;
    speedFocus?: DieRank;
    hasFast?: boolean;
    hasEspeciallySpeedy?: boolean;
    hasAgility?: boolean;
  } = {}
): MovementCalculation {
  const bpMax = dieMax(bpDie);
  const rawBase = (12 + bpMax) / 5;
  
  // Round normally, or up if Agility specialty
  const base = options.hasAgility ? Math.ceil(rawBase) : Math.round(rawBase);
  
  const modifiers: { name: string; value: number }[] = [];
  let total = base;
  
  // Trait modifiers (Especially Speedy replaces Fast)
  if (options.hasEspeciallySpeedy) {
    modifiers.push({ name: 'Especially Speedy', value: 4 });
    total += 4;
  } else if (options.hasFast) {
    modifiers.push({ name: 'Fast', value: 1 });
    total += 1;
  }
  
  // Speed Focus
  if (options.speedFocus) {
    const bonus = speedFocusBonus(options.speedFocus);
    modifiers.push({ name: `Speed Focus (${options.speedFocus})`, value: bonus });
    total += bonus;
  }
  
  // Size modifier
  if (options.size && options.size !== 'medium') {
    const sizeMod = SIZE_MOVEMENT_MODIFIER[options.size];
    modifiers.push({ name: `Size (${options.size})`, value: sizeMod });
    total += sizeMod;
  }
  
  // Minimum 1 square
  total = Math.max(1, total);
  
  const formula = `(12 + ${bpMax}) ÷ 5 = ${rawBase.toFixed(1)} → ${base}`;
  
  return { base, modifiers, total, formula };
}

// =============================================================================
// HP Calculation
// =============================================================================

export interface HPCalculation {
  baseValue: number;
  multiplier: number;
  drBonus: number;
  total: number;
  active: number;
  passive: number;
  derivation: string;
}

/**
 * Calculate HP using QSB formula.
 * Base HP = Highest Threat Die max × multiplier
 * Multiplier from: Size + Magical/Special traits
 * DR converts to static HP added to PDP
 */
export function calculateHP(
  threatDice: { natural?: DieRank; melee?: DieRank; ranged?: DieRank },
  options: {
    size?: CreatureSize;
    isMagical?: boolean;
    isUndead?: boolean;
    drDie?: DieRank;
    pdpBias?: boolean;  // If true, favor PDP over ADP (e.g., undead)
  } = {}
): HPCalculation {
  // Find highest threat die
  const dice = [threatDice.natural, threatDice.melee, threatDice.ranged].filter(Boolean) as DieRank[];
  const highestDie = dice.reduce((best, cur) => 
    dieMax(cur) > dieMax(best) ? cur : best, 
    dice[0] || 'd4'
  );
  const baseValue = dieMax(highestDie);
  
  // Calculate multiplier
  const sizeMod = options.size ? SIZE_HP_MODIFIER[options.size] : 1;
  const magicalMod = options.isMagical ? 2 : 0;
  
  // Multiplier is (sizeMod + magicalMod) / 2, minimum 0.5
  const rawMultiplier = (sizeMod + magicalMod);
  const multiplier = Math.max(0.5, rawMultiplier > 0 ? rawMultiplier * 0.5 : 0.5);
  
  // Base HP before DR
  const baseHP = Math.round(baseValue * multiplier);
  
  // DR bonus
  const drBonus = options.drDie ? drToStaticHP(options.drDie) : 0;
  
  const total = baseHP + drBonus;
  
  // Split between Active and Passive
  // Undead/constructs favor PDP, others split more evenly
  let active: number;
  let passive: number;
  
  if (options.pdpBias || options.isUndead) {
    // Favor PDP (roughly 45/55 or similar)
    passive = Math.ceil(total * 0.55);
    active = total - passive;
  } else {
    // Standard split (roughly 50/50 or slight ADP favor)
    active = Math.ceil(total * 0.5);
    passive = total - active;
  }
  
  const derivation = [
    `Highest TD: ${highestDie} → Max ${baseValue}`,
    `Modifiers: ${options.size || 'Medium'} (${sizeMod >= 0 ? '+' : ''}${sizeMod})${options.isMagical ? ', Magical (+2)' : ''} → ×${multiplier}`,
    `Base HP: ${baseValue} × ${multiplier} = ${baseHP}`,
    drBonus > 0 ? `+${drBonus} HP from DR → ${total} Total HP` : `Total: ${total} HP`,
    `Split: ${active} Active / ${passive} Passive${options.pdpBias || options.isUndead ? ' (PDP bias)' : ''}`,
  ].join('\n');
  
  return { baseValue, multiplier, drBonus, total, active, passive, derivation };
}

// =============================================================================
// Detect traits from text
// =============================================================================

export function detectSize(text: string): CreatureSize {
  const lower = text.toLowerCase();
  if (lower.includes('gargantuan')) return 'gargantuan';
  if (lower.includes('huge')) return 'huge';
  if (lower.includes('large')) return 'large';
  if (lower.includes('small')) return 'small';
  if (lower.includes('tiny')) return 'tiny';
  return 'medium';
}

export function detectTraits(text: string): CreatureTrait[] {
  const traits: CreatureTrait[] = [];
  const lower = text.toLowerCase();
  
  if (lower.includes('undead')) traits.push('undead');
  if (lower.includes('magical') || lower.includes('magic')) traits.push('magical');
  if (lower.includes('construct')) traits.push('construct');
  if (lower.includes('elemental')) traits.push('elemental');
  if (lower.includes('especially speedy')) traits.push('especially-speedy');
  else if (lower.includes('fast')) traits.push('fast');
  if (lower.includes('agility')) traits.push('agility');
  
  return traits;
}

// =============================================================================
// Main Conversion Function
// =============================================================================

/**
 * Convert a parsed Revised Edition stat block to QSB-compliant 2E format.
 */
export function convertToQSB(parsed: ParsedStatBlock): QSBStatBlock {
  const complianceNotes: string[] = [];
  
  // Detect size and traits from type and abilities
  const fullText = `${parsed.type} ${parsed.abilities.join(' ')} ${parsed.rawText}`;
  const size = detectSize(fullText);
  const traits = detectTraits(fullText);
  
  const isMagical = traits.includes('magical');
  const isUndead = traits.includes('undead');
  
  // Determine Battle Phase die
  // If original has BP, use it; otherwise derive from threat dice
  let bpDie: DieRank = 'd4';
  let bpPhase = 5;
  
  if (parsed.battlePhase) {
    bpDie = parsed.battlePhase.die;
    bpPhase = parsed.battlePhase.phase;
  } else if (parsed.threatDice.natural) {
    // Derive from natural threat die
    bpDie = parsed.threatDice.natural;
    bpPhase = BP_DIE_TO_PHASE[bpDie] || 5;
  }
  
  // Calculate movement using Full Parity Formula
  const movementCalc = calculateMovement(bpDie, {
    size,
    hasFast: traits.includes('fast'),
    hasEspeciallySpeedy: traits.includes('especially-speedy'),
    hasAgility: traits.includes('agility'),
  });
  
  complianceNotes.push(
    `**Battle Phase & Movement:** BP ${bpDie} → Phase ${bpPhase}. ` +
    `Movement: ${movementCalc.formula}${movementCalc.modifiers.length > 0 ? 
      ` + ${movementCalc.modifiers.map(m => `${m.name} (${m.value >= 0 ? '+' : ''}${m.value})`).join(', ')}` : 
      ''} = **${movementCalc.total} sq/phase**.`
  );
  
  // Parse DR die if present
  let drDie: DieRank | undefined;
  if (parsed.damageReduction) {
    const drMatch = parsed.damageReduction.match(/d(4|6|8|10|12)/i);
    if (drMatch) {
      drDie = `d${drMatch[1]}` as DieRank;
    }
  }
  
  // Calculate HP
  const hpCalc = calculateHP(parsed.threatDice, {
    size,
    isMagical,
    isUndead,
    drDie,
    pdpBias: isUndead,
  });
  
  if (drDie) {
    complianceNotes.push(
      `**Damage Reduction Conversion:** Rolled DR (${drDie}) → static **+${hpCalc.drBonus} HP** added to Passive Defense Pool per QSB streamlining.`
    );
  }
  
  complianceNotes.push(
    `**HP Derivation:**\n${hpCalc.derivation}`
  );
  
  // Build the QSB stat block
  return {
    name: parsed.name,
    type: parsed.type,
    
    threatDice: parsed.threatDice,
    
    extraAttacks: parsed.extraAttacks?.join('; '),
    
    hp: {
      total: hpCalc.total,
      active: hpCalc.active,
      passive: hpCalc.passive,
      derivation: hpCalc.derivation,
    },
    
    dr: drDie ? {
      bonus: hpCalc.drBonus,
      source: parsed.damageReduction || 'Natural Toughness',
    } : undefined,
    
    savingThrow: parsed.savingThrow,
    savingThrowNote: isUndead ? 'Undead base' : undefined,
    
    battlePhase: {
      die: bpDie,
      phase: bpPhase,
    },
    
    movement: {
      base: movementCalc.total,
      modifiers: movementCalc.modifiers.map(m => `${m.name}: ${m.value >= 0 ? '+' : ''}${m.value}`),
      runSpeed: movementCalc.total * 2,
      sprintSpeed: movementCalc.total * 4,
    },
    
    abilities: parsed.abilities,
    immunities: parsed.immunities,
    
    size,
    traits,
    
    complianceNotes,
  };
}

// =============================================================================
// QSB Markdown Formatter
// =============================================================================

/**
 * Format a QSB stat block as markdown for publication.
 */
export function formatQSBMarkdown(qsb: QSBStatBlock): string {
  const lines: string[] = [];
  
  // Header
  lines.push(`## ${qsb.name} (${qsb.type}) — QSB Compliant`);
  lines.push('');
  
  // Type
  lines.push(`**TY:** ${qsb.type}`);
  
  // Threat Dice
  const tdParts: string[] = [];
  if (qsb.threatDice.natural) tdParts.push(`Natural ${qsb.threatDice.natural}`);
  if (qsb.threatDice.melee) tdParts.push(`Melee ${qsb.threatDice.melee}`);
  if (qsb.threatDice.ranged) tdParts.push(`Ranged ${qsb.threatDice.ranged}`);
  lines.push(`**TD:** ${tdParts.join(' · ')}`);
  
  // Extra Attacks
  if (qsb.extraAttacks) {
    lines.push(`**EA:** ${qsb.extraAttacks}`);
  }
  
  lines.push('');
  
  // HP
  const sizeLabel = qsb.size.charAt(0).toUpperCase() + qsb.size.slice(1);
  const hpModifiers = [sizeLabel];
  if (qsb.traits.includes('magical')) hpModifiers.push('Magical');
  lines.push(`**HP:** **${qsb.hp.total}** (**${qsb.hp.active} Active / ${qsb.hp.passive} Passive**) *[${hpModifiers.join(', ')}]*`);
  
  // DR (as HP bonus)
  if (qsb.dr) {
    lines.push(`**DR:** **+${qsb.dr.bonus} HP** *(${qsb.dr.source}; applied to PDP)*`);
  }
  
  lines.push('');
  
  // Saving Throw
  if (qsb.savingThrow) {
    lines.push(`**ST:** ${qsb.savingThrow}${qsb.savingThrowNote ? ` *(${qsb.savingThrowNote})*` : ''}`);
  }
  
  // Battle Phase
  lines.push(`**BP:** **${qsb.battlePhase.die}** *(Phase ${qsb.battlePhase.phase})*`);
  
  // Movement
  lines.push(`**MV:** **${qsb.movement.base} squares/phase**`);
  
  lines.push('');
  lines.push('---');
  lines.push('');
  
  // Abilities
  if (qsb.abilities.length > 0) {
    lines.push('### Abilities and Powers');
    lines.push('');
    for (const ability of qsb.abilities) {
      lines.push(`* ${ability}`);
    }
    lines.push('');
  }
  
  // Immunities
  if (qsb.immunities && qsb.immunities.length > 0) {
    lines.push('### Immunities');
    lines.push('');
    lines.push(`* ${qsb.immunities.join(', ')}`);
    lines.push('');
  }
  
  // Compliance Notes
  if (qsb.complianceNotes.length > 0) {
    lines.push('---');
    lines.push('');
    lines.push('### Compliance Notes (Rules-Facing, Not Player-Facing)');
    lines.push('');
    for (const note of qsb.complianceNotes) {
      lines.push(`* ${note}`);
      lines.push('');
    }
  }
  
  return lines.join('\n');
}

export default convertToQSB;
