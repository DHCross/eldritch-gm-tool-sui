/**
 * Encounter+ v5 Exporter for Eldritch GM Tool
 * 
 * Transforms SUI characters and monsters into Encounter+ import format.
 * Based on Plyphyny System schema for config.json.
 */

import { SavedCharacter, CreatureCategory, CreatureSize } from '../../types/party';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface EncounterPlusEntity {
  name: string;
  slug?: string;
  descr?: string;
  data: Record<string, unknown>;
}

export interface EncounterPlusImport {
  version: string;
  name: string;
  id?: string;
  monster?: EncounterPlusEntity[];
  character?: EncounterPlusEntity[];
  spell?: EncounterPlusEntity[];
  item?: EncounterPlusEntity[];
}

// ============================================================================
// CONVERSION UTILITIES
// ============================================================================

/**
 * Extracts the numeric max value from a dice string (e.g., "d8" -> 8)
 */
export function parseDiceValue(diceStr: string | undefined): number {
  if (!diceStr) return 0;
  const match = diceStr.match(/d(\d+)/i);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Calculates average value of a dice formula (e.g., "2d10+4" -> 15)
 */
export function calculateDiceAverage(formula: string | undefined): number {
  if (!formula) return 0;
  
  // Handle simple number
  if (/^\d+$/.test(formula.trim())) {
    return parseInt(formula.trim(), 10);
  }
  
  // Parse XdY+Z format
  const match = formula.match(/(\d+)?d(\d+)([+-]\d+)?/i);
  if (!match) return 0;
  
  const numDice = parseInt(match[1] || '1', 10);
  const dieSize = parseInt(match[2], 10);
  const modifier = parseInt(match[3] || '0', 10);
  
  // Average of a die is (1 + max) / 2
  const avgRoll = (1 + dieSize) / 2;
  return Math.floor(numDice * avgRoll + modifier);
}

/**
 * Maps Battle Phase die to Phase number (1-5)
 * Based on Eldritch Rules 2025: d12->1, d10->2, d8->3, d6->4, d4->5
 */
export function calculateBattlePhase(prowessMV: number, reactionFocus: number = 0, finesseFocus: number = 0): number {
  const initScore = prowessMV + reactionFocus + finesseFocus;
  
  if (initScore >= 14) return 0;  // Pre-Phase 1 (Legendary)
  if (initScore >= 12) return 1;
  if (initScore >= 9) return 2;
  if (initScore >= 7) return 3;
  if (initScore >= 5) return 4;
  return 5;
}

/**
 * Maps Category to Classification Priority
 */
function mapCategoryToClassification(category: CreatureCategory | undefined): string {
  switch (category) {
    case 'Legendary': return 'Legendary';
    case 'Exceptional': return 'Exceptional';
    case 'Standard': return 'Standard';
    case 'Minor': return 'Minor';
    default: return 'Standard';
  }
}

/**
 * Maps Size to movement modifier
 */
function getSizeMovementModifier(size: CreatureSize | undefined): number {
  switch (size) {
    case 'Minuscule':
    case 'Tiny':
    case 'Small': return -1;
    case 'Medium': return 0;
    case 'Large': return 1;
    case 'Huge': return 2;
    case 'Gargantuan': return 3;
    default: return 0;
  }
}

/**
 * Calculates movement squares per phase
 */
export function calculateMovement(prowessMV: number, agilityMV: number = 0, hasAgilitySpec: boolean = false, size: CreatureSize = 'Medium'): number {
  const rawScore = (12 + prowessMV + agilityMV) / 5;
  const baseSquares = hasAgilitySpec ? Math.ceil(rawScore) : Math.floor(rawScore);
  
  // Derived bonus (automatic for creatures)
  let tierBonus = 1;
  if (prowessMV >= 12) tierBonus = 3;
  else if (prowessMV >= 8) tierBonus = 2;
  
  // Size modifier
  const sizeMod = getSizeMovementModifier(size);
  
  return baseSquares + tierBonus + sizeMod;
}

/**
 * Creates a slug from a name (lowercase, hyphenated)
 */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Converts trait/ability arrays to HTML description
 */
function traitsToHTML(traits: string[] | undefined, abilities: string[] | undefined): string {
  const parts: string[] = [];
  
  if (traits && traits.length > 0) {
    parts.push('<p><strong>Traits:</strong></p>');
    parts.push('<ul>' + traits.map(t => `<li>${escapeHtml(t)}</li>`).join('') + '</ul>');
  }
  
  if (abilities && abilities.length > 0) {
    parts.push('<p><strong>Abilities:</strong></p>');
    parts.push('<ul>' + abilities.map(a => `<li>${escapeHtml(a)}</li>`).join('') + '</ul>');
  }
  
  return parts.join('\n');
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ============================================================================
// MAIN CONVERSION FUNCTIONS
// ============================================================================

/**
 * Converts a SUI Monster/NPC to Encounter+ Monster entity
 */
export function convertMonster(monster: SavedCharacter): EncounterPlusEntity {
  const details = (monster.full_data || {}) as Record<string, unknown>;
  
  // Extract prowess/BP die
  const battlePhaseDie = (details.battlePhase as string) || 'd6';
  const prowessMV = parseDiceValue(battlePhaseDie);
  
  // Calculate Battle Phase
  const reactionFocus = (details.reactionFocus as number) || 0;
  const finesseFocus = (details.finesseFocus as number) || 0;
  // Note: Encounter+ schema expects the battle phase die string; we export `battlePhaseDie` below.
  
  // HP calculation - try multiple sources
  let hp = 0;
  if (details.finalHP && typeof details.finalHP === 'number') {
    hp = details.finalHP;
  } else if (details.hp && typeof details.hp === 'string') {
    hp = calculateDiceAverage(details.hp);
  } else if (monster.computed) {
    hp = (monster.computed.active_dp || 0) + (monster.computed.passive_dp || 0);
  }
  
  // Defense pools
  const activeDP = details.finalActiveHP as number || monster.computed?.active_dp || 0;
  const passiveDP = details.finalPassiveHP as number || monster.computed?.passive_dp || 0;
  const spiritPoints = monster.computed?.spirit_pts || 0;
  
  // Size and Category
  const size = (details.size as CreatureSize) || 'Medium';
  const category = (details.category as CreatureCategory) || 'Standard';
  
  // Movement calculation
  const agilityMV = (details.agilityMV as number) || 0;
  const hasAgilitySpec = !!(details.hasAgilitySpecialty || details.agilityMV);
  const movementSquares = calculateMovement(prowessMV, agilityMV, hasAgilitySpec, size);
  
  // Threat Dice
  const threatDice = details.threatDice as Record<string, string> || {};
  
  // Weapon Reach mapping
  let weaponReach = 'Medium Reach';
  if (threatDice.ranged || threatDice.arcane) weaponReach = 'Long Range';
  else if (details.weaponReach) weaponReach = details.weaponReach as string;
  
  // Build description HTML
  const traits = (details.traits as string[]) || monster.tags || [];
  const abilities = (details.extraAttacksList as string[]) || (details.specialAbilities as string[]) || [];
  const baseDescription = (details.description as string) || (details.notes as string) || '';
  
  let description = '';
  if (baseDescription) {
    description += `<p>${escapeHtml(baseDescription)}</p>\n`;
  }
  description += traitsToHTML(traits, abilities);
  description += `<p><strong>Speed:</strong> ${movementSquares} squares (Run ${movementSquares * 2}, Sprint ${movementSquares * 4})</p>`;
  
  return {
    name: monster.name,
    slug: slugify(monster.name),
    descr: baseDescription,
    data: {
      // Core Combat Stats
      battlephase: battlePhaseDie, // Plyphyny uses 'battlephase' for the die string (e.g., "d6")
      prowessMV: prowessMV,
      
      // Defense Pools (Plyphyny 4-layer system)
      hp: hp,
      hpMax: hp,
      hpActive: activeDP,
      hpPassive: passiveDP,
      sp_current: spiritPoints,
      sp_max: spiritPoints,
      
      // Initiative Sorting
      reactionFocus: reactionFocus,
      finesseFocus: finesseFocus,
      weaponReach: weaponReach,
      classification: mapCategoryToClassification(category),
      followThroughActive: false,
      
      // Movement
      speed_calculated: movementSquares,
      speed_run: movementSquares * 2,
      speed_sprint: movementSquares * 4,
      
      // Creature Properties
      Opponent_type: category,
      size: size,
      
      // Threat Dice (Plyphyny specific)
      threatdicemelee: threatDice.melee || '',
      threatdicenatural: threatDice.natural || '',
      threatdiceranged: threatDice.ranged || '',
      threatdicearcane: threatDice.arcane || '',
      
      // Armor & Defense
      armor: (details.armor as string) || '',
      shieldValue: (details.shield as number) || 0,
      dr_static: (details.dr as string) || '',
      savingthrow: (details.savingThrow as string) || '',
      
      // Meta
      ea: abilities.join(', '),
      features_text: traits.join('; '),
      description: description
    }
  };
}

/**
 * Converts a SUI PC to Encounter+ Character entity
 */
export function convertCharacter(character: SavedCharacter): EncounterPlusEntity {
  const details = (character.full_data || {}) as Record<string, unknown>;
  
  // Ability scores
  const prowessMV = character.abilities?.prowess_mv || (details.prowessMV as number) || 6;
  const agilityMV = character.abilities?.agility_mv || (details.agilityMV as number) || 0;
  
  // Focus bonuses
  const reactionFocus = (details.reactionFocus as number) || 0;
  const finesseFocus = (details.finesseFocus as number) || 0;
  const speedFocus = (details.speedFocus as number) || 0;
  
  // Calculate Battle Phase
  const battlePhase = calculateBattlePhase(prowessMV, reactionFocus, finesseFocus);
  
  // Defense Pools
  const activeDP = character.computed?.active_dp || 0;
  const passiveDP = character.computed?.passive_dp || 0;
  const spiritPoints = character.computed?.spirit_pts || 0;
  
  // HP (for characters, often same as active + passive)
  const hp = activeDP + passiveDP;
  
  // Movement (Player rules - Speed Focus is conditional)
  const hasAgilitySpec = agilityMV > 0;
  const baseMovement = hasAgilitySpec ? Math.ceil((12 + prowessMV + agilityMV) / 5) : Math.floor((12 + prowessMV) / 5);
  
  // Speed Focus bonus (conditional for players)
  let speedBonus = 0;
  if (speedFocus >= 12) speedBonus = 3;
  else if (speedFocus >= 8) speedBonus = 2;
  else if (speedFocus >= 4) speedBonus = 1;
  
  const movementSquares = baseMovement + speedBonus;
  
  return {
    name: character.name,
    slug: slugify(character.name),
    descr: character.status?.notes || '',
    data: {
      // Identity
      race: character.race || '',
      class: character.class || '',
      level: character.level || 1,
      
      // Ability Scores (Plyphyny uses lowercase 'die' suffix for stats)
      prowessdie: prowessMV, 
      agilitydie: agilityMV,
      
      // Focus Bonuses
      reactionFocus: reactionFocus,
      finesseFocus: finesseFocus,
      speedFocus: speedFocus,
      
      // Battle Phase
      battlephase: battlePhase, // This might need to be the die string? But for players it's calculated.
      // SUI 'battlephase' calculates the phase number (1-5).
      // If the system expects the die string (e.g. "d6"), we should provide it.
      // However, PCs usually have their Phase derived from stats in the VTT.
      // Providing the die string is safer for 'battlephase' key based on Adversary pattern.
      // But let's leave the calculated number as a separate key if needed or trust the VTT to recalc.
      // Given 'adversaries.json' has "battlephase": "d6", I should probably send the die string if I can.
      // But here `battlePhase` variable is the number.
      // Let's stick to sending stats that let the VTT calculate it.
      
      weaponReach: (details.weaponReach as string) || 'Medium Reach',
      followThroughActive: false,
      
      // Defense Pools
      hp: hp,
      hpMax: hp,
      hpActive: activeDP,
      hpPassive: passiveDP,
      sp_current: spiritPoints,
      sp_max: spiritPoints,
      
      // Revitalize
      revitalizeAvailable: true,
      
      // Movement
      speed_calculated: movementSquares,
      speed_run: movementSquares * 2,
      speed_sprint: movementSquares * 4,
      
      // Equipment
      armor: (details.armor as string) || '',
      shieldValue: (details.shieldValue as number) || 0,
      
      // Notes
      notes: character.status?.notes || ''
    }
  };
}

// ============================================================================
// EXPORT GENERATION
// ============================================================================

/**
 * Generates the complete Encounter+ import JSON
 */
export function generateImportJson(
  monsters: SavedCharacter[] = [],
  characters: SavedCharacter[] = [],
  exportName: string = 'Eldritch Tool Export'
): EncounterPlusImport {
  const result: EncounterPlusImport = {
    version: '5.0',
    name: exportName,
    id: `eldritch-export-${Date.now()}`
  };
  
  if (monsters.length > 0) {
    result.monster = monsters.map(m => convertMonster(m));
  }
  
  if (characters.length > 0) {
    result.character = characters.map(c => convertCharacter(c));
  }
  
  return result;
}

/**
 * Creates a downloadable Blob from the import data
 */
export function createDownloadBlob(importData: EncounterPlusImport): Blob {
  const jsonString = JSON.stringify(importData, null, 2);
  return new Blob([jsonString], { type: 'application/json' });
}

/**
 * Triggers a browser download of the export file
 */
export function downloadEncounterPlusExport(
  monsters: SavedCharacter[] = [],
  characters: SavedCharacter[] = [],
  filename: string = 'eldritch-export.json'
): void {
  const importData = generateImportJson(monsters, characters);
  const blob = createDownloadBlob(importData);
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Default export
const encounterPlusExporter = {
  convertMonster,
  convertCharacter,
  generateImportJson,
  createDownloadBlob,
  downloadEncounterPlusExport,
  // Utility exports
  parseDiceValue,
  calculateDiceAverage,
  calculateBattlePhase,
  calculateMovement
};

export default encounterPlusExporter;
