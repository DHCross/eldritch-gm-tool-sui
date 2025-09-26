'use client';

import { useState, useCallback } from 'react';
import { documentAnalyzer, generateAutoCorrections, AnalysisResult, DocumentAnalysis, ComplianceIssue } from '../utils/documentAnalyzer';

type ParseMode = 'single' | 'batch';

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

  const analyzeText = useCallback(async () => {
    if (!inputText.trim()) return;

    setIsAnalyzing(true);
    try {
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
  }, [inputText]);

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
          Stat Block Parser & Analyzer
        </h1>
        <p className="text-gray-600 mb-4">
          Analyze and validate Eldritch RPG stat blocks for compliance and formatting
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
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {mode === 'single' ? 'Enter stat block text:' : 'Enter document text (multiple stat blocks):'}
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                mode === 'single'
                  ? 'Paste a single stat block here...\n\nExample:\n**Goblin Warrior** AC 15, HP 12 (6/6), disposition neutral, 2nd level goblin fighter...'
                  : 'Paste document text with multiple stat blocks here...\n\nThe parser will automatically identify and analyze each stat block while filtering out headers, narrative text, and equipment lists.'
              }
              className="w-full h-64 border border-gray-300 rounded-md px-3 py-2 font-mono text-sm"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={analyzeText}
              disabled={!inputText.trim() || isAnalyzing}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze Text'}
            </button>

            {autoCorrections.length > 0 && (
              <button
                onClick={() => setShowCorrections(!showCorrections)}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              >
                Auto-Corrections ({autoCorrections.length})
              </button>
            )}

            {analysis && (
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
                <div className="text-sm text-gray-600">Stat Blocks Found</div>
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
                        entry.type === 'header' ? 'bg-purple-100 text-purple-800' :
                        entry.type === 'narrative' ? 'bg-green-100 text-green-800' :
                        entry.type === 'equipment' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {entry.type.replace('_', ' ')}
                      </span>
                      {entry.type === 'stat_block' && (
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

                      {entry.type === 'stat_block' && (
                        <div className="text-sm text-gray-600">
                          <strong>Confidence:</strong> {Math.round(entry.confidence * 100)}% |{' '}
                          <strong>Type:</strong> {entry.type} |{' '}
                          <strong>Compliance:</strong> {entry.compliance}%
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
          <p><strong>Single Entry Mode:</strong> Paste a single stat block to analyze its compliance and get specific suggestions.</p>
          <p><strong>Batch Processing Mode:</strong> Paste an entire document. The analyzer will automatically identify stat blocks while filtering out headers, narrative text, and equipment lists.</p>
          <p><strong>Auto-Corrections:</strong> The tool can automatically fix capitalization issues and common formatting problems.</p>
          <p><strong>Export:</strong> Save detailed analysis results as JSON for further processing or record keeping.</p>
        </div>
      </div>
    </div>
  );
}