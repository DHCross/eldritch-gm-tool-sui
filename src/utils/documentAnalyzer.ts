// Document Analyzer for Eldritch RPG stat blocks and NPCs
// Analyzes text to identify legitimate stat blocks vs headers, narrative text, etc.

export interface AnalysisResult {
  id: string;
  text: string;
  lineStart: number;
  lineEnd: number;
  isStatBlock: boolean;
  confidence: number;
  type: 'stat_block' | 'spell' | 'magic_item' | 'header' | 'narrative' | 'equipment' | 'unknown';
  issues: ComplianceIssue[];
  compliance: number;
  contentCategory?: 'npc' | 'monster' | 'spell' | 'magic_item';
}

export interface ComplianceIssue {
  type: 'error' | 'warning' | 'info';
  category: string;
  message: string;
  suggestion?: string;
}

export interface DocumentAnalysis {
  totalEntries: number;
  averageCompliance: number;
  totalIssues: number;
  issuesByType: Record<string, number>;
  entries: AnalysisResult[];
  summary: {
    excellent: number;
    good: number;
    needsWork: number;
  };
}

// Patterns for identifying different text types
const STAT_BLOCK_PATTERNS = {
  // Core RPG stats
  hp: /\bHP?\s*:?\s*\d+/i,
  ac: /\bAC?\s*:?\s*\d+/i,
  hitDice: /\d+d\d+/,
  saves: /\bsaving?\s*throws?\s*:?\s*[+-]?\d+/i,
  battlePhase: /\bbattle?\s*phase\s*:?\s*d?\d+/i,
  threatDice: /\bthreat\s*dice\s*:?\s*\d+d\d+/i,

  // Character identifiers
  level: /\d+(?:st|nd|rd|th)?\s*level/i,
  raceClass: /(?:human|elf|dwarf|halfling|orc|goblin).*(?:fighter|wizard|cleric|rogue|ranger)/i,
  disposition: /\bdisposition\s*:?\s*(?:neutral|good|evil|chaotic|lawful)/i,

  // Military units
  militaryUnit: /(?:militia|men-at-arms|guards?|soldiers?|pikemen|spearmen|bowmen)\s*x?\d+/i,

  // Equipment patterns
  equipment: /(?:carries?|wields?|wears?)\s+(?:sword|bow|armor|shield|axe|spear)/i,
  magicalItems: /[+-]\d+\s*(?:sword|bow|armor|shield|ring|potion)/i
};

// Spell-specific patterns
const SPELL_PATTERNS = {
  // Basic spell structure
  spellName: /^[A-Z][a-z\s]+(?:of\s+[A-Z][a-z]+)?$/,
  italicName: /^\*[^*]+\*$|^_[^_]+_$/,

  // Spell components
  path: /(?:path|school)\s*:?\s*(?:universal|elementalism|sorcery|thaumaturgy|mysticism|hieraticism|druidry)/i,
  rankDie: /(?:rank|die)\s*:?\s*d\d+/i,
  tier: /(?:tier|level)\s*:?\s*(?:common|uncommon|rare|legendary)/i,
  rarity: /(?:rarity)\s*:?\s*(?:common|uncommon|rare|legendary)/i,

  // Spell effects
  effects: /(?:effect|duration|range|area)\s*:?\s*[a-zA-Z0-9\s,]+/i,
  components: /(?:components?|materials?)\s*:?\s*[a-zA-Z\s,]+/i,
  castingTime: /(?:casting\s*time|cast\s*time)\s*:?\s*[a-zA-Z0-9\s]+/i,

  // Magic paths
  allPaths: /all\s+paths/i,
  divineMagic: /divine\s+magic|hieraticism/i,
  elementalism: /elementalism|elemental/i,
  sorcery: /sorcery|arcane/i
};

// Magic item patterns
const MAGIC_ITEM_PATTERNS = {
  // Item types
  weapon: /(?:sword|blade|bow|staff|wand|dagger|axe|spear|mace|hammer)\s*[+-]\d+/i,
  armor: /(?:armor|mail|plate|leather|chain|shield)\s*[+-]\d+/i,
  accessory: /(?:ring|amulet|cloak|boots|gauntlets|helm|crown)\s*(?:of\s+[a-zA-Z\s]+)?/i,
  potion: /potion\s+of\s+[a-zA-Z\s]+/i,

  // Item properties
  enhancement: /[+-]\d+/,
  magicalProperty: /(?:of\s+[a-zA-Z\s]+|that\s+[a-zA-Z\s]+)/i,
  charges: /\d+\s*charges?/i,

  // Item formatting
  boldName: /^\*\*[^*]+\*\*$|^__[^_]+__$/,
  italicProperty: /\*[^*]+\*|_[^_]+_/
};

// Monster-specific patterns (beyond basic stat blocks)
const MONSTER_PATTERNS = {
  // Threat ratings
  threatMV: /threat\s*(?:mv|movement\s*value)\s*:?\s*\d+/i,
  threatDice: /threat\s*dice\s*:?\s*(?:melee|natural|ranged|arcane)\s*\d+d\d+/i,

  // Monster stats
  monsterHP: /hp\s*:?\s*\d+\s*\(\d+\/\d+\)/i,
  monsterAC: /ac\s*:?\s*\d+/i,
  damageReduction: /(?:dr|damage\s*reduction)\s*:?\s*[a-zA-Z\s\(\)\+\d]+/i,

  // Special abilities
  specialAbilities: /(?:special\s*abilities?|abilities?)\s*:?\s*[a-zA-Z\s,;]+/i,
  extraAttacks: /(?:extra\s*attacks?|additional\s*attacks?)\s*:?\s*[a-zA-Z\s\(\),\d]+/i,

  // Monster categories
  monsterType: /(?:type|creature\s*type)\s*:?\s*(?:beast|undead|construct|elemental|aberration|fey|dragon|ooze|demon|humanoid)/i,
  size: /(?:size)\s*:?\s*(?:minuscule|tiny|small|medium|large|huge|gargantuan)/i,
  nature: /(?:nature)\s*:?\s*(?:mundane|magical|preternatural|supernatural)/i
};

// Patterns for identifying NON-stat-block text
const EXCLUSION_PATTERNS = {
  // Section headers and titles
  sectionHeader: /^(?:the\s+)?(?:council|chapter|appendix|section|part)\s+(?:of|[ivx]+|\d+)/i,
  title: /^(?:the\s+)?(?:right\s+)?honorable|his\s+(?:supernal|majesty|grace)/i,

  // Narrative text
  narrative: /^(?:all\s+of\s+the\s+above|these\s+creatures?|in\s+battle|when\s+fighting)/i,
  description: /^(?:this|that|they|it)\s+(?:is|are|can|will|may)/i,

  // Equipment continuation
  equipmentContinuation: /^(?:with|carries?|and\s+carries?)\s+(?:arrows?|sword|bow|shield)/i,

  // Pure flavor text
  flavorText: /^(?:known\s+for|famous\s+for|rumored\s+to|said\s+to)/i
};

// Capitalization patterns
const CAPITALIZATION_PATTERNS = {
  sentenceStart: /^[a-z]/,
  afterPeriod: /\.\s+[a-z]/g,
  properNouns: /\b(?:yggsburgh|oldham|linnfield|stonewyck)\b/gi
};

class DocumentAnalyzer {

  /**
   * Analyzes a document text and returns detailed compliance report
   */
  analyzeDocument(text: string): DocumentAnalysis {
    const lines = text.split('\n').map((line, index) => ({ text: line.trim(), lineNumber: index + 1 }));
    const entries: AnalysisResult[] = [];

    let currentEntry = '';
    let startLine = 0;

    for (const { text, lineNumber } of lines) {
      if (text.length === 0) {
        if (currentEntry.trim()) {
          const analysis = this.analyzeEntry(currentEntry, startLine, lineNumber - 1);
          if (analysis.isStatBlock || analysis.confidence > 0.3) {
            entries.push(analysis);
          }
          currentEntry = '';
        }
        continue;
      }

      if (currentEntry === '') {
        startLine = lineNumber;
      }

      currentEntry += (currentEntry ? ' ' : '') + text;
    }

    // Handle final entry
    if (currentEntry.trim()) {
      const analysis = this.analyzeEntry(currentEntry, startLine, lines.length);
      if (analysis.isStatBlock || analysis.confidence > 0.3) {
        entries.push(analysis);
      }
    }

    return this.generateSummary(entries);
  }

  /**
   * Analyzes a single text entry to determine its type and compliance
   */
  private analyzeEntry(text: string, startLine: number, endLine: number): AnalysisResult {
    const issues: ComplianceIssue[] = [];

    // First, check if this is definitely NOT game content
    const exclusionScore = this.calculateExclusionScore(text);
    if (exclusionScore > 0.7) {
      return {
        id: `entry-${startLine}`,
        text,
        lineStart: startLine,
        lineEnd: endLine,
        isStatBlock: false,
        confidence: 0,
        type: this.determineNonStatBlockType(text),
        issues: [],
        compliance: 100 // Non-game-content doesn't need compliance
      };
    }

    // Check for different content types
    const spellConfidence = this.calculateSpellConfidence(text);
    const magicItemConfidence = this.calculateMagicItemConfidence(text);
    const statBlockConfidence = this.calculateStatBlockConfidence(text);

    // Determine the most likely content type
    const maxConfidence = Math.max(spellConfidence, magicItemConfidence, statBlockConfidence);
    let contentType: AnalysisResult['type'] = 'unknown';
    let contentCategory: AnalysisResult['contentCategory'] | undefined;
    let isStatBlock = false;

    if (maxConfidence > 0.5) {
      if (spellConfidence === maxConfidence) {
        contentType = 'spell';
        contentCategory = 'spell';
        isStatBlock = true; // Spells are considered "stat blocks" for our purposes
        this.checkSpellCompliance(text, issues);
      } else if (magicItemConfidence === maxConfidence) {
        contentType = 'magic_item';
        contentCategory = 'magic_item';
        isStatBlock = true; // Magic items are considered "stat blocks" for our purposes
        this.checkMagicItemCompliance(text, issues);
      } else {
        contentType = 'stat_block';
        contentCategory = this.determineStatBlockCategory(text);
        isStatBlock = true;
        this.checkStatBlockCompliance(text, issues, contentCategory);
      }

      // Common checks for all content types
      this.checkCapitalization(text, issues);
    }

    const compliance = isStatBlock ? this.calculateCompliance(issues) : 100;

    return {
      id: `entry-${startLine}`,
      text,
      lineStart: startLine,
      lineEnd: endLine,
      isStatBlock,
      confidence: maxConfidence,
      type: contentType,
      contentCategory,
      issues,
      compliance
    };
  }

  /**
   * Calculates how likely text is to be a stat block (0-1)
   */
  private calculateStatBlockConfidence(text: string): number {
    let score = 0;
    let maxScore = 0;

    // Check for core RPG stats (high weight)
    if (STAT_BLOCK_PATTERNS.hp.test(text)) { score += 0.3; }
    if (STAT_BLOCK_PATTERNS.ac.test(text)) { score += 0.3; }
    if (STAT_BLOCK_PATTERNS.hitDice.test(text)) { score += 0.2; }
    if (STAT_BLOCK_PATTERNS.saves.test(text)) { score += 0.2; }
    if (STAT_BLOCK_PATTERNS.battlePhase.test(text)) { score += 0.2; }
    if (STAT_BLOCK_PATTERNS.threatDice.test(text)) { score += 0.2; }
    maxScore += 1.4;

    // Check for character identifiers (medium weight)
    if (STAT_BLOCK_PATTERNS.level.test(text)) { score += 0.15; }
    if (STAT_BLOCK_PATTERNS.raceClass.test(text)) { score += 0.15; }
    if (STAT_BLOCK_PATTERNS.disposition.test(text)) { score += 0.1; }
    maxScore += 0.4;

    // Check for military units (medium weight)
    if (STAT_BLOCK_PATTERNS.militaryUnit.test(text)) { score += 0.2; }
    maxScore += 0.2;

    // Check for equipment (low weight)
    if (STAT_BLOCK_PATTERNS.equipment.test(text)) { score += 0.05; }
    if (STAT_BLOCK_PATTERNS.magicalItems.test(text)) { score += 0.05; }
    maxScore += 0.1;

    return Math.min(score / maxScore, 1);
  }

  /**
   * Calculates how likely text is to NOT be a stat block (0-1)
   */
  private calculateExclusionScore(text: string): number {
    let score = 0;

    if (EXCLUSION_PATTERNS.sectionHeader.test(text)) { score += 0.8; }
    if (EXCLUSION_PATTERNS.title.test(text)) { score += 0.7; }
    if (EXCLUSION_PATTERNS.narrative.test(text)) { score += 0.6; }
    if (EXCLUSION_PATTERNS.description.test(text)) { score += 0.5; }
    if (EXCLUSION_PATTERNS.equipmentContinuation.test(text)) { score += 0.9; }
    if (EXCLUSION_PATTERNS.flavorText.test(text)) { score += 0.6; }

    return Math.min(score, 1);
  }

  /**
   * Calculates how likely text is to be a spell (0-1)
   */
  private calculateSpellConfidence(text: string): number {
    let score = 0;
    let maxScore = 0;

    // Check for spell-specific patterns
    if (SPELL_PATTERNS.path.test(text)) { score += 0.3; }
    if (SPELL_PATTERNS.rankDie.test(text)) { score += 0.3; }
    if (SPELL_PATTERNS.tier.test(text) || SPELL_PATTERNS.rarity.test(text)) { score += 0.2; }
    if (SPELL_PATTERNS.effects.test(text)) { score += 0.2; }
    maxScore += 1.0;

    // Check for spell formatting
    if (SPELL_PATTERNS.spellName.test(text.split('\n')[0])) { score += 0.2; }
    if (SPELL_PATTERNS.italicName.test(text)) { score += 0.1; }
    maxScore += 0.3;

    // Check for magic path indicators
    if (SPELL_PATTERNS.allPaths.test(text)) { score += 0.1; }
    if (SPELL_PATTERNS.divineMagic.test(text)) { score += 0.1; }
    if (SPELL_PATTERNS.elementalism.test(text)) { score += 0.1; }
    if (SPELL_PATTERNS.sorcery.test(text)) { score += 0.1; }
    maxScore += 0.4;

    return Math.min(score / maxScore, 1);
  }

  /**
   * Calculates how likely text is to be a magic item (0-1)
   */
  private calculateMagicItemConfidence(text: string): number {
    let score = 0;
    let maxScore = 0;

    // Check for item types
    if (MAGIC_ITEM_PATTERNS.weapon.test(text)) { score += 0.4; }
    if (MAGIC_ITEM_PATTERNS.armor.test(text)) { score += 0.4; }
    if (MAGIC_ITEM_PATTERNS.accessory.test(text)) { score += 0.3; }
    if (MAGIC_ITEM_PATTERNS.potion.test(text)) { score += 0.3; }
    maxScore += 0.4;

    // Check for item properties
    if (MAGIC_ITEM_PATTERNS.enhancement.test(text)) { score += 0.2; }
    if (MAGIC_ITEM_PATTERNS.magicalProperty.test(text)) { score += 0.2; }
    if (MAGIC_ITEM_PATTERNS.charges.test(text)) { score += 0.1; }
    maxScore += 0.5;

    // Check for formatting
    if (MAGIC_ITEM_PATTERNS.boldName.test(text)) { score += 0.1; }
    maxScore += 0.1;

    return Math.min(score / maxScore, 1);
  }

  /**
   * Determines the category of a stat block (NPC vs Monster)
   */
  private determineStatBlockCategory(text: string): 'npc' | 'monster' {
    // Check for monster-specific patterns
    if (MONSTER_PATTERNS.threatMV.test(text) ||
        MONSTER_PATTERNS.threatDice.test(text) ||
        MONSTER_PATTERNS.monsterHP.test(text) ||
        MONSTER_PATTERNS.specialAbilities.test(text)) {
      return 'monster';
    }
    return 'npc';
  }

  /**
   * Determines the type of non-stat-block text
   */
  private determineNonStatBlockType(text: string): 'header' | 'narrative' | 'equipment' | 'unknown' {
    if (EXCLUSION_PATTERNS.sectionHeader.test(text) || EXCLUSION_PATTERNS.title.test(text)) {
      return 'header';
    }
    if (EXCLUSION_PATTERNS.equipmentContinuation.test(text)) {
      return 'equipment';
    }
    if (EXCLUSION_PATTERNS.narrative.test(text) || EXCLUSION_PATTERNS.description.test(text)) {
      return 'narrative';
    }
    return 'unknown';
  }

  /**
   * Check spell compliance
   */
  private checkSpellCompliance(text: string, issues: ComplianceIssue[]): void {
    // Check spell name formatting (should be italic or properly capitalized)
    const firstLine = text.split('\n')[0];
    if (!SPELL_PATTERNS.italicName.test(firstLine) && !SPELL_PATTERNS.spellName.test(firstLine)) {
      issues.push({
        type: 'warning',
        category: 'Spell Name Formatting',
        message: 'Spell names should be in italics (*spell name*) and properly capitalized',
        suggestion: 'Use *Spell Name* format'
      });
    }

    // Check for required spell components
    if (!SPELL_PATTERNS.path.test(text)) {
      issues.push({
        type: 'error',
        category: 'Spell Path',
        message: 'Missing spell path/school information',
        suggestion: 'Add path (e.g., "Path: Elementalism")'
      });
    }

    if (!SPELL_PATTERNS.rankDie.test(text)) {
      issues.push({
        type: 'error',
        category: 'Spell Rank',
        message: 'Missing rank die information',
        suggestion: 'Add rank die (e.g., "Rank: d4")'
      });
    }

    if (!SPELL_PATTERNS.tier.test(text) && !SPELL_PATTERNS.rarity.test(text)) {
      issues.push({
        type: 'info',
        category: 'Spell Tier',
        message: 'Missing tier/rarity information',
        suggestion: 'Add tier (e.g., "Tier: Common")'
      });
    }

    if (!SPELL_PATTERNS.effects.test(text)) {
      issues.push({
        type: 'error',
        category: 'Spell Effects',
        message: 'Missing spell effects description',
        suggestion: 'Add effects description'
      });
    }
  }

  /**
   * Check magic item compliance
   */
  private checkMagicItemCompliance(text: string, issues: ComplianceIssue[]): void {
    // Check item name formatting (should be bold)
    const firstLine = text.split('\n')[0];
    if (!MAGIC_ITEM_PATTERNS.boldName.test(firstLine)) {
      issues.push({
        type: 'warning',
        category: 'Item Name Formatting',
        message: 'Magic item names should be bold (**item name**)',
        suggestion: 'Use **Item Name** format'
      });
    }

    // Check for enhancement bonus formatting
    if (MAGIC_ITEM_PATTERNS.enhancement.test(text)) {
      const hasProperFormat = /[+-]\d+/.test(text);
      if (!hasProperFormat) {
        issues.push({
          type: 'warning',
          category: 'Enhancement Formatting',
          message: 'Enhancement bonuses should use +/- notation',
          suggestion: 'Use format like "+1 sword" or "armor +2"'
        });
      }
    }

    // Check for magical properties formatting
    if (MAGIC_ITEM_PATTERNS.magicalProperty.test(text)) {
      // Properties should be in italics or properly described
      if (!MAGIC_ITEM_PATTERNS.italicProperty.test(text)) {
        issues.push({
          type: 'info',
          category: 'Property Formatting',
          message: 'Consider using italics for magical properties',
          suggestion: 'Use *property* format for magical effects'
        });
      }
    }

    // Check for charges formatting
    if (MAGIC_ITEM_PATTERNS.charges.test(text)) {
      const chargesMatch = text.match(/(\d+)\s*charges?/i);
      if (chargesMatch) {
        const charges = parseInt(chargesMatch[1]);
        if (charges <= 0) {
          issues.push({
            type: 'warning',
            category: 'Charges',
            message: 'Charges should be a positive number',
            suggestion: 'Specify number of charges (e.g., "3 charges")'
          });
        }
      }
    }
  }

  /**
   * Check stat block compliance (NPCs/Monsters)
   */
  private checkStatBlockCompliance(text: string, issues: ComplianceIssue[], category?: 'npc' | 'monster'): void {
    // Name formatting
    this.checkNameFormatting(text, issues);

    // Required fields
    this.checkRequiredFields(text, issues);

    // Category-specific checks
    if (category === 'monster') {
      this.checkMonsterSpecificFields(text, issues);
    } else {
      this.checkRaceAndClass(text, issues);
      this.checkDisposition(text, issues);
    }

    this.checkPrimaryAttributes(text, issues);
    this.checkEquipment(text, issues);
  }

  /**
   * Check monster-specific fields
   */
  private checkMonsterSpecificFields(text: string, issues: ComplianceIssue[]): void {
    // Check for threat dice
    if (!MONSTER_PATTERNS.threatDice.test(text) && !STAT_BLOCK_PATTERNS.hitDice.test(text)) {
      issues.push({
        type: 'error',
        category: 'Threat Dice',
        message: 'Missing threat dice information',
        suggestion: 'Add threat dice (e.g., "Threat Dice: Melee 2d6")'
      });
    }

    // Check for threat MV
    if (!MONSTER_PATTERNS.threatMV.test(text)) {
      issues.push({
        type: 'info',
        category: 'Threat MV',
        message: 'Missing threat movement value',
        suggestion: 'Add threat MV value'
      });
    }

    // Check for monster HP format
    if (MONSTER_PATTERNS.monsterHP.test(text)) {
      // Good - has proper monster HP format
    } else if (STAT_BLOCK_PATTERNS.hp.test(text)) {
      issues.push({
        type: 'info',
        category: 'HP Format',
        message: 'Consider using monster HP format',
        suggestion: 'Use format like "HP: 24 (8/16)" for monsters'
      });
    }

    // Check for special abilities
    if (!MONSTER_PATTERNS.specialAbilities.test(text)) {
      issues.push({
        type: 'info',
        category: 'Special Abilities',
        message: 'Consider adding special abilities for monsters',
        suggestion: 'Add special abilities or note "None"'
      });
    }
  }

  /**
   * Check name formatting (should be bold with **)
   */
  private checkNameFormatting(text: string, issues: ComplianceIssue[]): void {
    // Look for names at the start of stat blocks
    const nameMatch = text.match(/^([^,.(]+)/);
    if (nameMatch) {
      const name = nameMatch[1].trim();
      if (!name.startsWith('**') || !name.endsWith('**')) {
        issues.push({
          type: 'warning',
          category: 'Name Formatting',
          message: 'Name should be bold using **double asterisks**',
          suggestion: `**${name.replace(/\*+/g, '')}**`
        });
      }
    }
  }

  /**
   * Check capitalization rules
   */
  private checkCapitalization(text: string, issues: ComplianceIssue[]): void {
    // Check sentence start
    if (CAPITALIZATION_PATTERNS.sentenceStart.test(text)) {
      issues.push({
        type: 'warning',
        category: 'Capitalization',
        message: 'First word should be capitalized',
        suggestion: text.charAt(0).toUpperCase() + text.slice(1)
      });
    }

    // Check after periods
    const afterPeriodMatches = text.match(CAPITALIZATION_PATTERNS.afterPeriod);
    if (afterPeriodMatches) {
      issues.push({
        type: 'warning',
        category: 'Capitalization',
        message: 'Words after periods should be capitalized',
        suggestion: 'Capitalize words following periods'
      });
    }
  }

  /**
   * Check for required fields in stat blocks
   */
  private checkRequiredFields(text: string, issues: ComplianceIssue[]): void {
    const requiredFields = [
      { pattern: STAT_BLOCK_PATTERNS.hp, name: 'HP' },
      { pattern: /\bAC\s*:?\s*\d+/i, name: 'AC' }
    ];

    for (const field of requiredFields) {
      if (!field.pattern.test(text)) {
        issues.push({
          type: 'info',
          category: 'Required Fields',
          message: `Missing ${field.name} field`,
          suggestion: `Add ${field.name} value`
        });
      }
    }
  }

  /**
   * Check race and class formatting
   */
  private checkRaceAndClass(text: string, issues: ComplianceIssue[]): void {
    if (!STAT_BLOCK_PATTERNS.raceClass.test(text) && !STAT_BLOCK_PATTERNS.militaryUnit.test(text)) {
      issues.push({
        type: 'error',
        category: 'Race & Class',
        message: 'Missing race and class information',
        suggestion: 'Specify race and class with level (e.g., "human, 5th level fighter")'
      });
    }
  }

  /**
   * Check disposition field
   */
  private checkDisposition(text: string, issues: ComplianceIssue[]): void {
    if (!STAT_BLOCK_PATTERNS.disposition.test(text)) {
      issues.push({
        type: 'error',
        category: 'Disposition',
        message: 'Missing disposition field',
        suggestion: 'Add disposition (neutral, good, evil, etc.)'
      });
    }
  }

  /**
   * Check primary attributes
   */
  private checkPrimaryAttributes(text: string, issues: ComplianceIssue[]): void {
    const paPattern = /\bPA\s+(?:physical|mental|social)/i;
    if (!paPattern.test(text)) {
      issues.push({
        type: 'info',
        category: 'Primary attributes',
        message: 'Missing or unclear primary attributes',
        suggestion: 'Specify primary attributes (PA physical, mental, or social)'
      });
    }
  }

  /**
   * Check equipment formatting
   */
  private checkEquipment(text: string, issues: ComplianceIssue[]): void {
    if (STAT_BLOCK_PATTERNS.equipment.test(text) || STAT_BLOCK_PATTERNS.magicalItems.test(text)) {
      // Equipment is present, check for proper formatting
      const hasDetail = /\d+\s*gp|gold|coin|silver/i.test(text);
      if (!hasDetail) {
        issues.push({
          type: 'info',
          category: 'Equipment',
          message: 'Equipment could include more detail',
          suggestion: 'Consider adding monetary values or item details'
        });
      }
    }
  }

  /**
   * Calculate overall compliance percentage
   */
  private calculateCompliance(issues: ComplianceIssue[]): number {
    const errorWeight = 20;
    const warningWeight = 10;
    const infoWeight = 5;

    let penalties = 0;
    for (const issue of issues) {
      switch (issue.type) {
        case 'error': penalties += errorWeight; break;
        case 'warning': penalties += warningWeight; break;
        case 'info': penalties += infoWeight; break;
      }
    }

    return Math.max(0, 100 - penalties);
  }

  /**
   * Generate summary statistics
   */
  private generateSummary(entries: AnalysisResult[]): DocumentAnalysis {
    const statBlocks = entries.filter(e => e.isStatBlock);
    const totalIssues = statBlocks.reduce((sum, entry) => sum + entry.issues.length, 0);
    const averageCompliance = statBlocks.length > 0
      ? statBlocks.reduce((sum, entry) => sum + entry.compliance, 0) / statBlocks.length
      : 100;

    const issuesByType: Record<string, number> = {};
    const issuesByCategory: Record<string, number> = {};

    for (const entry of statBlocks) {
      for (const issue of entry.issues) {
        issuesByType[issue.type] = (issuesByType[issue.type] || 0) + 1;
        issuesByCategory[issue.category] = (issuesByCategory[issue.category] || 0) + 1;
      }
    }

    const summary = {
      excellent: statBlocks.filter(e => e.compliance >= 90).length,
      good: statBlocks.filter(e => e.compliance >= 70 && e.compliance < 90).length,
      needsWork: statBlocks.filter(e => e.compliance < 70).length
    };

    return {
      totalEntries: statBlocks.length,
      averageCompliance: Math.round(averageCompliance),
      totalIssues,
      issuesByType: issuesByCategory, // Use category for the main report
      entries: statBlocks,
      summary
    };
  }
}

// Export singleton instance
export const documentAnalyzer = new DocumentAnalyzer();

// Helper function for quick analysis
export function analyzeStatBlockText(text: string): AnalysisResult {
  const analyzer = new DocumentAnalyzer();
  return analyzer['analyzeEntry'](text, 1, 1);
}

// Auto-correction suggestions
export function generateAutoCorrections(text: string): string {
  let corrected = text;

  // Fix capitalization after periods
  corrected = corrected.replace(/\.\s+([a-z])/g, (match, letter) =>
    match.replace(letter, letter.toUpperCase())
  );

  // Fix sentence start capitalization
  if (corrected.length > 0 && /[a-z]/.test(corrected[0])) {
    corrected = corrected[0].toUpperCase() + corrected.slice(1);
  }

  // Fix common abbreviations
  corrected = corrected.replace(/\bpa\b/gi, 'PA');
  corrected = corrected.replace(/\bhp\b/gi, 'HP');
  corrected = corrected.replace(/\bac\b/gi, 'AC');
  corrected = corrected.replace(/\bdr\b/gi, 'DR');
  corrected = corrected.replace(/\bmv\b/gi, 'MV');

  // Fix spell-specific formatting
  corrected = corrected.replace(/^([A-Z][a-z\s]+)(?=\s*:?\s*Path)/m, '*$1*'); // Italicize spell names
  corrected = corrected.replace(/\bpath\s*:\s*/gi, 'Path: ');
  corrected = corrected.replace(/\brank\s*:\s*/gi, 'Rank: ');
  corrected = corrected.replace(/\btier\s*:\s*/gi, 'Tier: ');
  corrected = corrected.replace(/\brarity\s*:\s*/gi, 'Rarity: ');

  // Fix magic item formatting
  corrected = corrected.replace(/^([A-Z][a-z\s]+(?:\s*\+\d+)?)(?=\s)/m, '**$1**'); // Bold item names
  corrected = corrected.replace(/\+(\d+)/g, '+$1'); // Ensure proper enhancement format
  corrected = corrected.replace(/-(\d+)/g, '-$1'); // Ensure proper penalty format

  // Fix monster-specific formatting
  corrected = corrected.replace(/\bthreat\s*dice\s*:\s*/gi, 'Threat Dice: ');
  corrected = corrected.replace(/\bthreat\s*mv\s*:\s*/gi, 'Threat MV: ');
  corrected = corrected.replace(/\bspecial\s*abilities\s*:\s*/gi, 'Special Abilities: ');

  // Fix common field names
  corrected = corrected.replace(/\bdisposition\s*:\s*/gi, 'Disposition: ');
  corrected = corrected.replace(/\bbattle\s*phase\s*:\s*/gi, 'Battle Phase: ');
  corrected = corrected.replace(/\bsaving\s*throw\s*:\s*/gi, 'Saving Throw: ');

  return corrected;
}