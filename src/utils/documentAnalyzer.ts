// Document Analyzer for Eldritch RPG stat blocks and NPCs
// Analyzes text to identify legitimate stat blocks vs headers, narrative text, etc.

export interface AnalysisResult {
  id: string;
  text: string;
  lineStart: number;
  lineEnd: number;
  isStatBlock: boolean;
  confidence: number;
  type: 'stat_block' | 'header' | 'narrative' | 'equipment' | 'unknown';
  issues: ComplianceIssue[];
  compliance: number;
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
   * Analyzes a single text entry to determine if it's a stat block
   */
  private analyzeEntry(text: string, startLine: number, endLine: number): AnalysisResult {
    const issues: ComplianceIssue[] = [];

    // First, check if this is definitely NOT a stat block
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
        compliance: 100 // Non-stat-blocks don't need compliance
      };
    }

    // Calculate stat block confidence
    const confidence = this.calculateStatBlockConfidence(text);
    const isStatBlock = confidence > 0.5;

    if (isStatBlock) {
      // Check compliance for actual stat blocks
      this.checkNameFormatting(text, issues);
      this.checkCapitalization(text, issues);
      this.checkRequiredFields(text, issues);
      this.checkRaceAndClass(text, issues);
      this.checkDisposition(text, issues);
      this.checkPrimaryAttributes(text, issues);
      this.checkEquipment(text, issues);
    }

    const compliance = isStatBlock ? this.calculateCompliance(issues) : 100;

    return {
      id: `entry-${startLine}`,
      text,
      lineStart: startLine,
      lineEnd: endLine,
      isStatBlock,
      confidence,
      type: isStatBlock ? 'stat_block' : this.determineNonStatBlockType(text),
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

  return corrected;
}