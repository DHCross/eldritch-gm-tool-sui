'use client';

import { useState, useCallback } from 'react';
import { documentAnalyzer, generateAutoCorrections, AnalysisResult, DocumentAnalysis, ComplianceIssue } from '../utils/documentAnalyzer';
import convertRevisedTo2E, { ConvertedEntity } from '../utils/revisedConverter';
import { RevisedEntity } from '../types/revisedEntity';
import exporter from '../utils/exporters/htmlExporter';
import { isRevisedStatBlockText, parseTextToRevisedEntity, parseRevisedStatBlock, ParsedStatBlock } from '../utils/revisedTextParser';
import { convertToQSB, formatQSBMarkdown, QSBStatBlock } from '../utils/qsbConverter';

type ParseMode = 'single' | 'batch' | 'revised';

interface CorrectionSuggestion {
  original: string;
  corrected: string;
  entryId: string;
}

export default function StatBlockParser() {
  const [mode, setMode] = useState<ParseMode>('single');
  const [inputText, setInputText] = useState('');
  const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<AnalysisResult | null>(null);
  const [autoCorrections, setAutoCorrections] = useState<CorrectionSuggestion[]>([]);
  const [showCorrections, setShowCorrections] = useState(false);
  const [revisedConversion, setRevisedConversion] = useState<ConvertedEntity | null>(null);
  const [parsedStatBlock, setParsedStatBlock] = useState<ParsedStatBlock | null>(null);
  const [customName, setCustomName] = useState('');
  const [qsbResult, setQsbResult] = useState<QSBStatBlock | null>(null);
  const [qsbMarkdown, setQsbMarkdown] = useState<string>('');

  const analyzeText = useCallback(async () => {
    if (!inputText.trim()) return;

    setIsAnalyzing(true);
    setRevisedConversion(null);
    setParsedStatBlock(null);
    setQsbResult(null);
    setQsbMarkdown('');
    try {
      const trimmed = inputText.trim();
      const looksLikeJSON = trimmed.startsWith('{') && trimmed.endsWith('}');
      
      // Check if we're in revised mode
      if (mode === 'revised') {
        // First, always try plain text stat block format (most common use case)
        if (isRevisedStatBlockText(trimmed)) {
          // Parse plain text stat block
          const parsed = parseRevisedStatBlock(trimmed);
          
          // Apply custom name if provided
          if (customName.trim()) {
            parsed.name = customName.trim();
          } else if (parsed.name === 'Unknown Entity') {
            parsed.name = parsed.type;
          }
          
          setParsedStatBlock(parsed);
          
          // Convert to QSB format
          const qsb = convertToQSB(parsed);
          setQsbResult(qsb);
          setQsbMarkdown(formatQSBMarkdown(qsb));
          
          // Also do legacy conversion for compatibility
          const revisedEntity = parseTextToRevisedEntity(trimmed);
          const converted = convertRevisedTo2E(revisedEntity);
          converted.name = parsed.name;
          
          // Use QSB-calculated values
          converted.active_defense_pool = qsb.hp.active;
          converted.passive_defense_pool = qsb.hp.passive;
          converted.movement_per_phase = qsb.movement.base;
          converted.initiative_phase = qsb.battlePhase.phase;
          
          // Add notes from parsed abilities
          if (parsed.abilities.length > 0 || parsed.immunities?.length || parsed.damageReduction) {
            const notesParts: string[] = [];
            if (parsed.damageReduction) {
              notesParts.push(`Damage Reduction: ${parsed.damageReduction}`);
            }
            if (parsed.extraAttacks && parsed.extraAttacks.length > 0) {
              notesParts.push(`Extra Attacks: ${parsed.extraAttacks.join('; ')}`);
            }
            parsed.abilities.forEach(a => notesParts.push(a));
            if (parsed.immunities && parsed.immunities.length > 0) {
              notesParts.push(`Immunities: ${parsed.immunities.join(', ')}`);
            }
            converted.notes = notesParts.join('\n\n');
          }
          
          setRevisedConversion(converted);
          setAnalysis(null);
          setAutoCorrections([]);
          setIsAnalyzing(false);
          return;
        }
        
        // If it looks like JSON, try JSON parsing
        if (looksLikeJSON) {
          try {
            const parsed = JSON.parse(trimmed) as RevisedEntity;
            if (parsed.name && parsed.kind && Array.isArray(parsed.abilities)) {
              const converted = convertRevisedTo2E(parsed);
              // Use custom name if provided
              if (customName.trim()) {
                converted.name = customName.trim();
              }
              setRevisedConversion(converted);
              setAnalysis(null);
              setAutoCorrections([]);
              setIsAnalyzing(false);
              return;
            } else {
              alert('Invalid Revised Edition JSON. Expected: { name, kind, abilities[] }');
              setIsAnalyzing(false);
              return;
            }
          } catch {
            alert('Invalid JSON syntax. If you meant to paste a plain text stat block, make sure it includes fields like "Type (TY):", "Threat Dice (TD):", "Hit Points (HP):", etc.');
            setIsAnalyzing(false);
            return;
          }
        }
        
        // Neither valid text format nor JSON
        alert('Could not parse input. Please provide a Revised Edition stat block with fields like:\n\nType (TY): ...\nThreat Dice (TD): ...\nHit Points (HP): ...\n\nOr valid JSON format.');
        setIsAnalyzing(false);
        return;
      }

      // Simulate async processing for large documents
      await new Promise(resolve => setTimeout(resolve, 100));

      const result = documentAnalyzer.analyzeDocument(inputText);
      setAnalysis(result);

      // Generate auto-corrections for all entries
      const corrections: CorrectionSuggestion[] = [];
      for (const entry of result.entries) {
        const corrected = generateAutoCorrections(entry.text);
        if (corrected !== entry.text) {
          corrections.push({
            original: entry.text,
            corrected,
            entryId: entry.id
          });
        }
      }
      setAutoCorrections(corrections);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [inputText, mode, customName]);

  const applyAutoCorrection = (correction: CorrectionSuggestion) => {
    const newText = inputText.replace(correction.original, correction.corrected);
    setInputText(newText);
    setAutoCorrections(prev => prev.filter(c => c.entryId !== correction.entryId));
  };

  const applyAllCorrections = () => {
    let newText = inputText;
    for (const correction of autoCorrections) {
      newText = newText.replace(correction.original, correction.corrected);
    }
    setInputText(newText);
    setAutoCorrections([]);
    // Re-analyze after corrections
    setTimeout(analyzeText, 100);
  };

  const getComplianceColor = (compliance: number) => {
    if (compliance >= 90) return 'text-green-600';
    if (compliance >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getComplianceLabel = (compliance: number) => {
    if (compliance >= 90) return 'Excellent';
    if (compliance >= 70) return 'Good';
    return 'Needs Work';
  };

  const getIssueIcon = (type: ComplianceIssue['type']) => {
    switch (type) {
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '•';
    }
  };

  const exportResults = () => {
    if (!analysis) return;

    const report = {
      summary: {
        totalEntries: analysis.totalEntries,
        averageCompliance: analysis.averageCompliance,
        totalIssues: analysis.totalIssues,
        timestamp: new Date().toISOString()
      },
      entries: analysis.entries.map(entry => ({
        id: entry.id,
        text: entry.text,
        compliance: entry.compliance,
        issues: entry.issues,
        type: entry.type,
        confidence: entry.confidence
      }))
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stat-block-analysis-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Game Content Parser & Analyzer
        </h1>
        <p className="text-gray-600 mb-4">
          Analyze and validate Eldritch RPG stat blocks, spells, and magic items for compliance and formatting
        </p>
      </div>

      {/* Mode Selection */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Parsing Mode</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setMode('single')}
              className={`px-4 py-2 rounded ${
                mode === 'single'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Single Entry
            </button>
            <button
              onClick={() => setMode('batch')}
              className={`px-4 py-2 rounded ${
                mode === 'batch'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Batch Processing
            </button>
            <button
              onClick={() => setMode('revised')}
              className={`px-4 py-2 rounded ${
                mode === 'revised'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Convert from Revised
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {mode === 'single' ? 'Enter game content:' : mode === 'batch' ? 'Enter document text (multiple entries):' : 'Paste Revised Edition stat block (text or JSON):'}
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                mode === 'single'
                  ? 'Paste game content here...\n\nExamples:\n• **Goblin Warrior** AC 15, HP 12, disposition neutral...\n• *Fireball* Path: Elementalism, Rank: d6, Tier: Common...\n• **Sword +1** A magical blade with enhanced sharpness...'
                  : mode === 'batch'
                  ? 'Paste document text with multiple entries here...\n\nThe parser will automatically identify and analyze:\n• Stat blocks (NPCs & monsters)\n• Spells with paths and effects\n• Magic items with properties\n\nWhile filtering out headers, narrative text, and equipment lists.'
                  : `Paste a Revised Edition stat block in EITHER format:\n\n--- PLAIN TEXT FORMAT ---\nType (TY): Minor Undead\nThreat Dice (TD): Natural d6 ~ Melee d4 ~ Ranged d4\nHit Points (HP): Total 10 (Active Defense: 7 / Passive Defense: 3)\nSaving Throw (ST): d4\nBattle Phase (BP): d6 (Phase 4)\nMovement (MV): Walk 3 sq/phase\nAbilities and Powers:\nSome Ability: Description here...\n\n--- OR JSON FORMAT ---\n{\n  "name": "Cultist Acolyte",\n  "kind": "NPC",\n  "abilities": [\n    { "name": "Melee Weapons", "tier": "basic", "die_rank": "d6" }\n  ]\n}`
              }
              className="w-full h-64 border border-gray-300 rounded-md px-3 py-2 font-mono text-sm bg-white text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Custom name field for revised mode */}
          {mode === 'revised' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Entity Name (optional - will use name from text if not provided):
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g., The Accursed, Skeletal Warrior, etc."
                className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={analyzeText}
              disabled={!inputText.trim() || isAnalyzing}
              className={`${mode === 'revised' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-blue-600 hover:bg-blue-700'} disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded`}
            >
              {isAnalyzing ? 'Processing...' : mode === 'revised' ? 'Convert to 2nd Edition' : 'Analyze Text'}
            </button>

            {autoCorrections.length > 0 && mode !== 'revised' && (
              <button
                onClick={() => setShowCorrections(!showCorrections)}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              >
                Auto-Corrections ({autoCorrections.length})
              </button>
            )}

            {analysis && mode !== 'revised' && (
              <button
                onClick={exportResults}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
              >
                Export Results
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Revised Edition Conversion Result */}
      {revisedConversion && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-indigo-800">
              Revised → 2nd Edition Conversion: {revisedConversion.name}
            </h3>
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  const html = exporter.npcToHTML(revisedConversion);
                  const wrapped = exporter.wrapForWord(html);
                  try {
                    if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
                      const blob = new Blob([wrapped], { type: 'text/html' });
                      const item = new ClipboardItem({ 'text/html': blob });
                      await navigator.clipboard.write([item]);
                      alert('HTML copied to clipboard');
                    } else {
                      await navigator.clipboard.writeText(JSON.stringify(revisedConversion, null, 2));
                      alert('Copied as JSON (HTML clipboard not available)');
                    }
                  } catch (err) {
                    console.error(err);
                    alert('Failed to copy');
                  }
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded text-sm"
              >
                Copy HTML
              </button>
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(JSON.stringify(revisedConversion, null, 2));
                  alert('JSON copied to clipboard');
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded text-sm"
              >
                Copy JSON
              </button>
            </div>
          </div>
          
          {/* Show parsed stat block info if from text */}
          {parsedStatBlock && (
            <div className="mb-4 p-3 bg-white rounded border border-indigo-200">
              <h4 className="font-semibold text-indigo-700 mb-2">Parsed from Text: {parsedStatBlock.name}</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <div><span className="text-gray-600">Type:</span> {parsedStatBlock.type}</div>
                <div><span className="text-gray-600">HP Total:</span> {parsedStatBlock.hitPoints.total}</div>
                {parsedStatBlock.battlePhase && (
                  <div><span className="text-gray-600">Phase:</span> {parsedStatBlock.battlePhase.phase}</div>
                )}
                {parsedStatBlock.movement && (
                  <div><span className="text-gray-600">Move:</span> {parsedStatBlock.movement.squares} sq</div>
                )}
              </div>
              {parsedStatBlock.threatDice && Object.keys(parsedStatBlock.threatDice).length > 0 && (
                <div className="mt-2 text-sm">
                  <span className="text-gray-600">Threat Dice:</span>{' '}
                  {parsedStatBlock.threatDice.natural && `Natural ${parsedStatBlock.threatDice.natural}`}
                  {parsedStatBlock.threatDice.melee && ` / Melee ${parsedStatBlock.threatDice.melee}`}
                  {parsedStatBlock.threatDice.ranged && ` / Ranged ${parsedStatBlock.threatDice.ranged}`}
                </div>
              )}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{qsbResult ? qsbResult.hp.active : revisedConversion.active_defense_pool}</div>
              <div className="text-sm text-gray-600">Active Defense</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{qsbResult ? qsbResult.hp.passive : revisedConversion.passive_defense_pool}</div>
              <div className="text-sm text-gray-600">Passive Defense</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{qsbResult ? qsbResult.hp.total : (revisedConversion.active_defense_pool + revisedConversion.passive_defense_pool)}</div>
              <div className="text-sm text-gray-600">Total HP</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{qsbResult ? qsbResult.battlePhase.phase : revisedConversion.initiative_phase}</div>
              <div className="text-sm text-gray-600">Phase</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{qsbResult ? qsbResult.movement.base : revisedConversion.movement_per_phase}</div>
              <div className="text-sm text-gray-600">Movement (sq)</div>
            </div>
          </div>
          
          {/* Show notes/abilities if present */}
          {revisedConversion.notes && (
            <div className="mb-4 p-4 bg-white rounded border border-indigo-200">
              <h4 className="font-semibold text-indigo-700 mb-2">Abilities & Special Powers</h4>
              <div className="text-sm whitespace-pre-wrap text-gray-800">{revisedConversion.notes}</div>
            </div>
          )}
          
          {/* QSB Markdown Output */}
          {qsbMarkdown && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-indigo-700">QSB-Compliant Markdown</h4>
                <button
                  onClick={async () => {
                    await navigator.clipboard.writeText(qsbMarkdown);
                    alert('QSB Markdown copied to clipboard!');
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-sm"
                >
                  Copy Markdown
                </button>
              </div>
              <pre className="whitespace-pre-wrap text-xs bg-white p-4 rounded border border-indigo-200 overflow-auto max-h-96 text-gray-800">{qsbMarkdown}</pre>
            </div>
          )}
          
          {/* Compliance Notes */}
          {qsbResult && qsbResult.complianceNotes.length > 0 && (
            <details className="mb-4">
              <summary className="cursor-pointer font-medium text-indigo-700">Compliance Notes (Rules-Facing)</summary>
              <div className="mt-2 p-3 bg-yellow-50 rounded border border-yellow-200 text-sm">
                {qsbResult.complianceNotes.map((note, i) => (
                  <div key={i} className="mb-2 last:mb-0">• {note}</div>
                ))}
              </div>
            </details>
          )}
          
          <details>
            <summary className="cursor-pointer font-medium">Full Converted Data (JSON)</summary>
            <pre className="whitespace-pre-wrap mt-2 text-xs bg-white p-3 rounded border">{JSON.stringify(qsbResult || revisedConversion, null, 2)}</pre>
          </details>
        </div>
      )}

      {/* Auto-Corrections Panel */}
      {showCorrections && autoCorrections.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-green-800">Auto-Corrections Available</h3>
            <button
              onClick={applyAllCorrections}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-sm"
            >
              Apply All
            </button>
          </div>
          <div className="space-y-3">
            {autoCorrections.map((correction, index) => (
              <div key={index} className="bg-white border border-green-200 rounded p-3">
                <div className="text-sm text-gray-600 mb-2">Original:</div>
                <div className="font-mono text-sm bg-red-50 p-2 rounded mb-2">{correction.original}</div>
                <div className="text-sm text-gray-600 mb-2">Corrected:</div>
                <div className="font-mono text-sm bg-green-50 p-2 rounded mb-3">{correction.corrected}</div>
                <button
                  onClick={() => applyAutoCorrection(correction)}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-sm"
                >
                  Apply This Correction
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-6">
          {/* Summary Statistics */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4">Analysis Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{analysis.totalEntries}</div>
                <div className="text-sm text-gray-600">Game Entries Found</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getComplianceColor(analysis.averageCompliance)}`}>
                  {analysis.averageCompliance}%
                </div>
                <div className="text-sm text-gray-600">Average Compliance</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{analysis.totalIssues}</div>
                <div className="text-sm text-gray-600">Total Issues</div>
              </div>
              <div className="text-center">
                <div className="space-y-1">
                  <div className="text-xs text-gray-600">
                    <span className="text-green-600 font-bold">{analysis.summary.excellent}</span> Excellent |{' '}
                    <span className="text-yellow-600 font-bold">{analysis.summary.good}</span> Good |{' '}
                    <span className="text-red-600 font-bold">{analysis.summary.needsWork}</span> Needs Work
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Common Issues */}
          {Object.keys(analysis.issuesByType).length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4">Most Common Issues</h3>
              <div className="space-y-2">
                {Object.entries(analysis.issuesByType)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 5)
                  .map(([category, count]) => (
                    <div key={category} className="flex justify-between items-center">
                      <span className="font-medium">{category}</span>
                      <span className="text-gray-600">{count} occurrences</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Detailed Results */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4">Detailed Analysis Results</h3>
            <div className="space-y-4">
              {analysis.entries.map((entry) => (
                <div
                  key={entry.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedEntry(selectedEntry?.id === entry.id ? null : entry)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">Lines {entry.lineStart}-{entry.lineEnd}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        entry.type === 'stat_block' ? 'bg-blue-100 text-blue-800' :
                        entry.type === 'spell' ? 'bg-purple-100 text-purple-800' :
                        entry.type === 'magic_item' ? 'bg-orange-100 text-orange-800' :
                        entry.type === 'header' ? 'bg-gray-100 text-gray-800' :
                        entry.type === 'narrative' ? 'bg-green-100 text-green-800' :
                        entry.type === 'equipment' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {entry.type.replace('_', ' ')}
                      </span>
                      {(entry.type === 'stat_block' || entry.type === 'spell' || entry.type === 'magic_item') && (
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          entry.compliance >= 90 ? 'bg-green-100 text-green-800' :
                          entry.compliance >= 70 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {getComplianceLabel(entry.compliance)} ({entry.compliance}%)
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      {entry.issues.length} issue{entry.issues.length !== 1 ? 's' : ''}
                    </div>
                  </div>

                  <div className="font-mono text-sm bg-gray-50 p-3 rounded mb-3 truncate">
                    {entry.text}
                  </div>

                  {selectedEntry?.id === entry.id && (
                    <div className="border-t pt-3 space-y-3">
                      <div className="font-mono text-sm bg-gray-50 p-3 rounded whitespace-pre-wrap">
                        {entry.text}
                      </div>

                      {entry.issues.length > 0 && (
                        <div>
                          <h5 className="font-semibold mb-2">Issues Found:</h5>
                          <div className="space-y-2">
                            {entry.issues.map((issue, index) => (
                              <div key={index} className="flex items-start gap-2 text-sm">
                                <span className="text-lg">{getIssueIcon(issue.type)}</span>
                                <div className="flex-1">
                                  <div className="font-medium">{issue.category}: {issue.message}</div>
                                  {issue.suggestion && (
                                    <div className="text-gray-600 italic mt-1">
                                      Suggestion: {issue.suggestion}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {(entry.type === 'stat_block' || entry.type === 'spell' || entry.type === 'magic_item') && (
                        <div className="text-sm text-gray-600">
                          <strong>Confidence:</strong> {Math.round(entry.confidence * 100)}% |{' '}
                          <strong>Type:</strong> {entry.type.replace('_', ' ')} |{' '}
                          <strong>Compliance:</strong> {entry.compliance}%
                          {entry.contentCategory && (
                            <>
                              {' | '}
                              <strong>Category:</strong> {entry.contentCategory}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-blue-800 mb-3">How to Use</h3>
        <div className="text-sm text-blue-700 space-y-2">
          <p><strong>Single Entry Mode:</strong> Paste a single game entry (stat block, spell, or magic item) to analyze its compliance and get specific suggestions.</p>
          <p><strong>Batch Processing Mode:</strong> Paste an entire document. The analyzer will automatically identify game content while filtering out headers, narrative text, and equipment lists.</p>
          <p><strong>Convert from Revised:</strong> Paste a Revised Edition stat block in <em>either</em> plain text format (with Type, Threat Dice, Hit Points, etc.) or JSON format. The parser will convert it to 2nd Edition stats.</p>
          <p><strong>Plain Text Format:</strong> Use the standard stat block format with fields like &quot;Type (TY):&quot;, &quot;Threat Dice (TD):&quot;, &quot;Hit Points (HP):&quot;, &quot;Battle Phase (BP):&quot;, etc.</p>
          <p><strong>Auto-Corrections:</strong> The tool can automatically fix capitalization issues, formatting problems, and standardize field names.</p>
          <p><strong>Export:</strong> Save detailed analysis results as JSON for further processing or record keeping.</p>
        </div>
      </div>
    </div>
  );
}