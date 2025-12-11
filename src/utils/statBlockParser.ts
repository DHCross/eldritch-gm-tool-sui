import { defaultDiagnostics, StatBlockParseResult, StatBlockType, QuickStatBlock, DetailedStatBlock } from '../types/statBlock';
import { documentAnalyzer } from './documentAnalyzer';

function normalizeText(text: string) {
  return text.replace(/\r\n/g, '\n').replace(/\t/g, ' ').trim();
}

function extractFirstLine(text: string) {
  const ln = normalizeText(text).split('\n').find(l => l.trim().length > 0);
  return ln || '';
}

export function parseStatBlockText(text: string): StatBlockParseResult {
  const diagnostics = defaultDiagnostics();
  const t = normalizeText(text);

  // Use documentAnalyzer heuristics if available for detection
  let guess: StatBlockType = 'unknown';
  try {
    const da = documentAnalyzer.analyzeDocument(t);
    if (da && da.entries && da.entries.length) {
      // If many combat-like entries, probably a stat block
      const entry = da.entries[0];
      if (entry.type === 'stat_block' || /npc|character|player/i.test(t)) {
        guess = 'detailed';
      } else if (/active defense|spirit points|battle phase|passive defense/i.test(t)) {
        guess = 'quick';
      }
    }
  } catch {
    // ignore analyzer errors
  }

  // Heuristic fallbacks
  if (guess === 'unknown') {
    if (/Level\s*\d+/i.test(t) || /Class|Mastery Die|Actions|Advantages/i.test(t)) {
      guess = 'detailed';
    } else if (/Active Defense|Passive Defense|Spirit Points|Battle Phase/i.test(t)) {
      guess = 'quick';
    }
  }

  if (guess === 'quick') {
    const first = extractFirstLine(t);
    const q: QuickStatBlock = { raw: t };
    // name
    if (first) q.name = first.replace(/^#*\s*/, '');
    // AD
    const adm = t.match(/Active Defense(?: Pool)?[:\s]*([^\n\r]+)/i);
    if (adm) q.activeDefense = adm[1].trim();
    const pdm = t.match(/Passive Defense(?: Pool)?[:\s]*([^\n\r]+)/i);
    if (pdm) q.passiveDefense = pdm[1].trim();
    const spm = t.match(/Spirit Points[:\s]*([^\n\r]+)/i);
    if (spm) q.spiritPoints = parseInt(spm[1], 10) || undefined;
    const bpm = t.match(/Battle Phase[:\s]*([^\n\r]+)/i);
    if (bpm) q.battlePhase = bpm[1].trim();

    if (!q.name) diagnostics.issues.push('Could not detect a name line');
    return { type: 'quick', data: q, diagnostics };
  }

  if (guess === 'detailed') {
    const first = extractFirstLine(t);
    const d: DetailedStatBlock = { raw: t };
    if (first) d.name = first.replace(/^#*\s*/, '');

    // Try to extract some fields
    const levelMatch = t.match(/Level[:\s]*(\d+)/i);
    if (levelMatch) d.level = parseInt(levelMatch[1], 10);
    const raceMatch = t.match(/Race[:\s]*([A-Za-z\-\s]+)/i);
    if (raceMatch) d.race = raceMatch[1].trim();
    const roleMatch = t.match(/Role[:\s]*([A-Za-z\-\s]+)/i);
    if (roleMatch) d.role = roleMatch[1].trim();

    // Use documentAnalyzer to collect issues
    try {
      const da = documentAnalyzer.analyzeDocument(t);
      if (da && da.entries && da.entries.length) {
        diagnostics.score = Math.round(da.averageCompliance * 100);
        // Collect issues from all entries
        for (const entry of da.entries) {
          if (entry.issues && entry.issues.length) {
            diagnostics.issues.push(...entry.issues.map((issue) => issue.message));
          }
        }
      }
    } catch {
      // ignore
    }

    if (!d.name) diagnostics.issues.push('Could not detect a name line');
    return { type: 'detailed', data: d, diagnostics };
  }

  // Unknown -> return raw
  diagnostics.issues.push('Unable to classify stat block');
  return { type: 'unknown', data: { raw: t }, diagnostics };
}

export default parseStatBlockText;
