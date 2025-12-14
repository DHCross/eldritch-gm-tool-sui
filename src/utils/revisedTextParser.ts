/**
 * Parser for Revised Edition stat blocks in plain text format.
 * Converts natural language stat blocks to the RevisedEntity JSON structure
 * that can then be fed into the revisedConverter.
 */

import { RevisedEntity, RevisedAbility, DieRank } from '../types/revisedEntity';

export interface ParsedStatBlock {
  name: string;
  type: string; // e.g., "Minor Undead", "NPC", "Monster"
  threatDice: {
    natural?: DieRank;
    melee?: DieRank;
    ranged?: DieRank;
  };
  extraAttacks?: string[];
  hitPoints: {
    total: number;
    activeDefense: number;
    passiveDefense: number;
  };
  damageReduction?: string;
  savingThrow?: DieRank;
  battlePhase?: {
    die: DieRank;
    phase: number;
  };
  movement?: {
    type: string;
    squares: number;
    modifiers?: string;
  };
  abilities: string[];
  immunities?: string[];
  weaknesses?: string[];
  notes?: string;
  rawText: string;
}

/**
 * Parse a die notation string like "d6", "d8", etc.
 */
function parseDieRank(text: string): DieRank | null {
  const match = text.match(/d(4|6|8|10|12)/i);
  if (match) {
    return `d${match[1]}` as DieRank;
  }
  return null;
}

/**
 * Extract the name from the stat block.
 * Usually the first meaningful line or can be found in context.
 */
function extractName(text: string): string {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  // Look for a name pattern - could be a standalone line before "Type"
  for (const line of lines) {
    // Skip lines that start with known stat labels
    if (!/^(Type|Threat|Hit|Damage|Saving|Battle|Movement|MV|TD|HP|DR|ST|BP|TY|EA)\s*[(:]/i.test(line)) {
      // This could be the name - check if it's short and looks like a name
      if (line.length < 50 && !line.includes(':') && !line.match(/^\d+/)) {
        return line.replace(/\*+/g, '').trim();
      }
    }
    break; // Only check the first non-stat line
  }
  
  return 'Unknown Entity';
}

/**
 * Parse the Type field: "Type (TY): Minor Undead"
 */
function parseType(text: string): string {
  const match = text.match(/Type\s*\(?TY\)?\s*:\s*(.+?)(?:\n|$)/i);
  return match ? match[1].trim() : 'Unknown';
}

/**
 * Parse Threat Dice: "Threat Dice (TD): Natural d6 ~ Melee d4 ~ Ranged d4"
 */
function parseThreatDice(text: string): ParsedStatBlock['threatDice'] {
  const result: ParsedStatBlock['threatDice'] = {};
  
  const match = text.match(/Threat\s*Dice\s*\(?TD\)?\s*:\s*(.+?)(?:\n|$)/i);
  if (match) {
    const parts = match[1].split(/[~,]/);
    for (const part of parts) {
      const trimmed = part.trim().toLowerCase();
      const die = parseDieRank(part);
      if (die) {
        if (trimmed.includes('natural')) result.natural = die;
        else if (trimmed.includes('melee')) result.melee = die;
        else if (trimmed.includes('ranged')) result.ranged = die;
        else if (!result.natural) result.natural = die; // Default first die to natural
      }
    }
  }
  
  return result;
}

/**
 * Parse Extra Attacks: "Extra Attacks (EA): d8 rotting attack, once per round"
 */
function parseExtraAttacks(text: string): string[] {
  const match = text.match(/Extra\s*Attacks?\s*\(?EA\)?\s*:\s*(.+?)(?:\n|$)/i);
  if (match) {
    return [match[1].trim()];
  }
  return [];
}

/**
 * Parse Hit Points: "Hit Points (HP): Total 10 (Active Defense: 7 / Passive Defense: 3)"
 */
function parseHitPoints(text: string): ParsedStatBlock['hitPoints'] {
  const result = { total: 0, activeDefense: 0, passiveDefense: 0 };
  
  const match = text.match(/Hit\s*Points?\s*\(?HP\)?\s*:\s*(.+?)(?:\n|$)/i);
  if (match) {
    const line = match[1];
    
    // Try to extract total
    const totalMatch = line.match(/Total\s*(\d+)/i);
    if (totalMatch) result.total = parseInt(totalMatch[1], 10);
    
    // Try to extract Active Defense
    const adMatch = line.match(/Active\s*Defense\s*:?\s*(\d+)/i);
    if (adMatch) result.activeDefense = parseInt(adMatch[1], 10);
    
    // Try to extract Passive Defense
    const pdMatch = line.match(/Passive\s*Defense\s*:?\s*(\d+)/i);
    if (pdMatch) result.passiveDefense = parseInt(pdMatch[1], 10);
    
    // If only total was given, split it
    if (result.total > 0 && result.activeDefense === 0 && result.passiveDefense === 0) {
      result.activeDefense = Math.ceil(result.total * 0.7);
      result.passiveDefense = result.total - result.activeDefense;
    }
  }
  
  return result;
}

/**
 * Parse Damage Reduction: "Damage Reduction (DR): d4 (natural toughness...)"
 */
function parseDamageReduction(text: string): string | undefined {
  const match = text.match(/Damage\s*Reduction\s*\(?DR\)?\s*:\s*(.+?)(?:\n|$)/i);
  return match ? match[1].trim() : undefined;
}

/**
 * Parse Saving Throw: "Saving Throw (ST): d4 (undead base)"
 */
function parseSavingThrow(text: string): DieRank | undefined {
  const match = text.match(/Saving\s*Throw\s*\(?ST\)?\s*:\s*(.+?)(?:\n|$)/i);
  if (match) {
    return parseDieRank(match[1]) ?? undefined;
  }
  return undefined;
}

/**
 * Parse Battle Phase: "Battle Phase (BP): d6 (Phase 4)"
 */
function parseBattlePhase(text: string): ParsedStatBlock['battlePhase'] | undefined {
  const match = text.match(/Battle\s*Phase\s*\(?BP\)?\s*:\s*(.+?)(?:\n|$)/i);
  if (match) {
    const line = match[1];
    const die = parseDieRank(line);
    const phaseMatch = line.match(/Phase\s*(\d+)/i);
    if (die && phaseMatch) {
      return { die, phase: parseInt(phaseMatch[1], 10) };
    } else if (die) {
      // Map die to phase
      const dieToPhase: Record<string, number> = { d12: 1, d10: 2, d8: 3, d6: 4, d4: 5 };
      return { die, phase: dieToPhase[die] ?? 4 };
    }
  }
  return undefined;
}

/**
 * Parse Movement: "Movement (MV): Walk 3 sq/phase (Run ×2, Sprint ×4; see Tactical Grid Movement)"
 */
function parseMovement(text: string): ParsedStatBlock['movement'] | undefined {
  const match = text.match(/Movement\s*\(?MV\)?\s*:\s*(.+?)(?:\n|$)/i);
  if (match) {
    const line = match[1];
    const typeMatch = line.match(/(Walk|Fly|Swim|Burrow|Climb)/i);
    const sqMatch = line.match(/(\d+)\s*sq/i);
    
    return {
      type: typeMatch ? typeMatch[1] : 'Walk',
      squares: sqMatch ? parseInt(sqMatch[1], 10) : 3,
      modifiers: line.includes('Run') || line.includes('Sprint') ? line : undefined
    };
  }
  return undefined;
}

/**
 * Parse Abilities and Powers section
 */
function parseAbilitiesSection(text: string): string[] {
  const abilities: string[] = [];
  
  // Find the "Abilities and Powers:" section
  const sectionMatch = text.match(/Abilities\s*(?:and\s*)?Powers?\s*:?\s*([\s\S]*?)(?=Immunities:|Weaknesses?:|Undead\s*Limitations?:|Resilience:|$)/i);
  
  if (sectionMatch) {
    const section = sectionMatch[1];
    // Split by ability names (text followed by colon)
    const regex = /([A-Z][^:]+):\s*([^]*?)(?=(?:[A-Z][^:]+:|$))/gi;
    let match;
    
    while ((match = regex.exec(section)) !== null) {
      abilities.push(`${match[1].trim()}: ${match[2].trim()}`);
    }
  }
  
  return abilities;
}

/**
 * Parse Immunities
 */
function parseImmunities(text: string): string[] {
  const match = text.match(/Immunit(?:ies|y)\s*:?\s*(.+?)(?:\n|$)/i);
  if (match) {
    return match[1].split(/[,;]/).map(s => s.trim()).filter(s => s.length > 0);
  }
  return [];
}

/**
 * Convert a parsed stat block to RevisedEntity format for the converter
 */
export function statBlockToRevisedEntity(parsed: ParsedStatBlock): RevisedEntity {
  const abilities: RevisedAbility[] = [];
  
  // Map threat dice to abilities
  if (parsed.threatDice.melee) {
    abilities.push({
      name: 'Melee Weapons',
      tier: 'basic',
      die_rank: parsed.threatDice.melee
    });
  }
  
  if (parsed.threatDice.ranged) {
    abilities.push({
      name: 'Ranged Weapons',
      tier: 'basic',
      die_rank: parsed.threatDice.ranged
    });
  }
  
  // Use natural die for Agility/base combat
  if (parsed.threatDice.natural) {
    abilities.push({
      name: 'Agility',
      tier: 'basic',
      die_rank: parsed.threatDice.natural
    });
  }
  
  // Use saving throw for Willpower/Fortitude
  if (parsed.savingThrow) {
    abilities.push({
      name: 'Willpower',
      tier: 'basic',
      die_rank: parsed.savingThrow
    });
    abilities.push({
      name: 'Fortitude',
      tier: 'basic',
      die_rank: parsed.savingThrow
    });
  }
  
  // Use battle phase die for Speed
  if (parsed.battlePhase) {
    abilities.push({
      name: 'Speed',
      tier: 'mastery',
      die_rank: parsed.battlePhase.die
    });
  }
  
  // Build notes from abilities, immunities, etc.
  const notesParts: string[] = [];
  
  if (parsed.extraAttacks && parsed.extraAttacks.length > 0) {
    notesParts.push(`Extra Attacks: ${parsed.extraAttacks.join('; ')}`);
  }
  
  if (parsed.damageReduction) {
    notesParts.push(`Damage Reduction: ${parsed.damageReduction}`);
  }
  
  if (parsed.abilities.length > 0) {
    notesParts.push(...parsed.abilities);
  }
  
  if (parsed.immunities && parsed.immunities.length > 0) {
    notesParts.push(`Immunities: ${parsed.immunities.join(', ')}`);
  }
  
  return {
    name: parsed.name,
    kind: parsed.type,
    abilities,
    notes: notesParts.length > 0 ? notesParts.join('\n\n') : undefined
  };
}

/**
 * Main parser function: takes raw text and returns a parsed stat block
 */
export function parseRevisedStatBlock(text: string): ParsedStatBlock {
  const name = extractName(text);
  
  return {
    name,
    type: parseType(text),
    threatDice: parseThreatDice(text),
    extraAttacks: parseExtraAttacks(text),
    hitPoints: parseHitPoints(text),
    damageReduction: parseDamageReduction(text),
    savingThrow: parseSavingThrow(text),
    battlePhase: parseBattlePhase(text),
    movement: parseMovement(text),
    abilities: parseAbilitiesSection(text),
    immunities: parseImmunities(text),
    rawText: text
  };
}

/**
 * Detect if text looks like a Revised Edition stat block (not JSON)
 */
export function isRevisedStatBlockText(text: string): boolean {
  const trimmed = text.trim();
  
  // If it looks like JSON, it's not plain text
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    return false;
  }
  
  // Check for common Revised Edition stat block patterns
  const patterns = [
    /Type\s*\(?TY\)?\s*:/i,
    /Threat\s*Dice\s*\(?TD\)?\s*:/i,
    /Hit\s*Points?\s*\(?HP\)?\s*:/i,
    /Battle\s*Phase\s*\(?BP\)?\s*:/i,
    /Saving\s*Throw\s*\(?ST\)?\s*:/i,
    /Movement\s*\(?MV\)?\s*:/i,
    /Damage\s*Reduction\s*\(?DR\)?\s*:/i,
    /Active\s*Defense/i,
    /Passive\s*Defense/i,
  ];
  
  // Need at least 2 matching patterns to be confident
  let matches = 0;
  for (const pattern of patterns) {
    if (pattern.test(trimmed)) {
      matches++;
    }
  }
  
  return matches >= 2;
}

/**
 * Full conversion: text → parsed → RevisedEntity
 */
export function parseTextToRevisedEntity(text: string): RevisedEntity {
  const parsed = parseRevisedStatBlock(text);
  return statBlockToRevisedEntity(parsed);
}

export default parseRevisedStatBlock;
