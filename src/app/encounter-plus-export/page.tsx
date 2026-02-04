'use client';

import Link from 'next/link';
import { Suspense, useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { SavedCharacter } from '@/types/party';
import { getAllCharacters } from '@/utils/partyStorage';
import { resolveBackTargetFromParam } from '@/utils/backNavigation';
import ExportToEncounterPlus from '@/components/ExportToEncounterPlus';
import ContentBox from '@/components/ContentBox';

function EncounterPlusExportContent() {
  const searchParams = useSearchParams();
  const backTarget = resolveBackTargetFromParam(searchParams.get('from'), 'gm-tools');

  const [allCharacters, setAllCharacters] = useState<SavedCharacter[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filterType, setFilterType] = useState<'all' | 'PC' | 'NPC' | 'Monster'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const chars = getAllCharacters();
    setAllCharacters(chars);
  }, []);

  const filteredCharacters = useMemo(() => {
    return allCharacters.filter(char => {
      const matchesType = filterType === 'all' || char.type === filterType;
      const matchesSearch = searchTerm === '' || 
        char.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        char.race?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        char.class?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [allCharacters, filterType, searchTerm]);

  const selectedCharacters = useMemo(() => {
    return allCharacters.filter(char => selectedIds.has(char.id));
  }, [allCharacters, selectedIds]);

  const selectedPCs = selectedCharacters.filter(c => c.type === 'PC');
  const selectedMonsters = selectedCharacters.filter(c => c.type === 'Monster' || c.type === 'NPC');

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(filteredCharacters.map(c => c.id)));
  };

  const selectNone = () => {
    setSelectedIds(new Set());
  };

  const selectByType = (type: 'PC' | 'NPC' | 'Monster') => {
    const ids = allCharacters.filter(c => c.type === type).map(c => c.id);
    setSelectedIds(new Set(ids));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'PC': return '⚔️';
      case 'NPC': return '🧙';
      case 'Monster': return '👹';
      default: return '📄';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'PC': return 'text-blue-400';
      case 'NPC': return 'text-purple-400';
      case 'Monster': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 text-off-white">
      {/* Back Navigation */}
      <div className="mb-6">
        <Link
          href={backTarget.href}
          className="inline-flex items-center text-muted-eldritch-green hover:text-soft-amethyst font-medium transition-colors"
        >
          ← {backTarget.label}
        </Link>
      </div>

      {/* Header */}
      <header className="text-center mb-10">
        <p className="text-sm uppercase tracking-[0.2em] text-muted-eldritch-green/85">Eldritch Suite</p>
        <h1 className="mt-2 text-4xl font-extrabold text-off-white">📤 Encounter+ Export Center</h1>
        <p className="mt-3 text-lg text-off-white/80">
          Export your characters and monsters for use in Encounter+ VTT with the Plyphyny System
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Selection Panel */}
        <div className="lg:col-span-2">
          <ContentBox>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h2 className="text-xl font-bold text-off-white">Select Content to Export</h2>
              
              {/* Quick Select Buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={selectAll}
                  className="px-3 py-1 text-sm rounded bg-muted-eldritch-green/20 text-muted-eldritch-green hover:bg-muted-eldritch-green/30 transition-colors"
                >
                  Select All
                </button>
                <button
                  onClick={selectNone}
                  className="px-3 py-1 text-sm rounded bg-gray-600/30 text-gray-300 hover:bg-gray-600/50 transition-colors"
                >
                  Clear
                </button>
                <button
                  onClick={() => selectByType('PC')}
                  className="px-3 py-1 text-sm rounded bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 transition-colors"
                >
                  All PCs
                </button>
                <button
                  onClick={() => selectByType('Monster')}
                  className="px-3 py-1 text-sm rounded bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors"
                >
                  All Monsters
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <input
                type="text"
                placeholder="Search by name, race, or class..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-2 rounded-md bg-charcoal-violet border border-muted-eldritch-green/30 text-off-white placeholder-gray-500 focus:border-muted-eldritch-green focus:outline-none"
              />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as typeof filterType)}
                className="px-4 py-2 rounded-md bg-charcoal-violet border border-muted-eldritch-green/30 text-off-white focus:border-muted-eldritch-green focus:outline-none"
              >
                <option value="all">All Types</option>
                <option value="PC">PCs Only</option>
                <option value="NPC">NPCs Only</option>
                <option value="Monster">Monsters Only</option>
              </select>
            </div>

            {/* Character List */}
            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
              {filteredCharacters.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {allCharacters.length === 0 
                    ? 'No characters found. Create some in the Character or Monster generators!'
                    : 'No characters match your filters.'}
                </div>
              ) : (
                filteredCharacters.map(char => (
                  <div
                    key={char.id}
                    onClick={() => toggleSelection(char.id)}
                    className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedIds.has(char.id)
                        ? 'bg-muted-eldritch-green/20 border border-muted-eldritch-green/50'
                        : 'bg-charcoal-violet/50 border border-transparent hover:border-muted-eldritch-green/30'
                    }`}
                  >
                    {/* Checkbox */}
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      selectedIds.has(char.id)
                        ? 'bg-muted-eldritch-green border-muted-eldritch-green'
                        : 'border-gray-500'
                    }`}>
                      {selectedIds.has(char.id) && (
                        <svg className="w-3 h-3 text-charcoal-violet" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>

                    {/* Type Icon */}
                    <span className={`text-lg ${getTypeColor(char.type)}`}>
                      {getTypeIcon(char.type)}
                    </span>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-off-white truncate">{char.name}</div>
                      <div className="text-sm text-gray-400 truncate">
                        {char.race} {char.class} {char.level ? `• Level ${char.level}` : ''}
                      </div>
                    </div>

                    {/* Type Badge */}
                    <span className={`px-2 py-1 text-xs rounded ${
                      char.type === 'PC' ? 'bg-blue-600/30 text-blue-300' :
                      char.type === 'NPC' ? 'bg-purple-600/30 text-purple-300' :
                      'bg-red-600/30 text-red-300'
                    }`}>
                      {char.type}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Selection Count */}
            <div className="mt-4 pt-4 border-t border-muted-eldritch-green/20 text-sm text-gray-400">
              {selectedIds.size} of {allCharacters.length} selected
              {selectedIds.size > 0 && (
                <span className="ml-2">
                  ({selectedPCs.length} PCs, {selectedMonsters.length} Monsters/NPCs)
                </span>
              )}
            </div>
          </ContentBox>
        </div>

        {/* Export Panel */}
        <div className="lg:col-span-1">
          <ContentBox>
            <h2 className="text-xl font-bold text-off-white mb-4">Export Settings</h2>

            {/* Selection Summary */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between p-3 bg-blue-600/10 rounded-lg">
                <span className="text-blue-400">⚔️ Characters (PCs)</span>
                <span className="font-bold text-blue-300">{selectedPCs.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-600/10 rounded-lg">
                <span className="text-red-400">👹 Monsters/NPCs</span>
                <span className="font-bold text-red-300">{selectedMonsters.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted-eldritch-green/10 rounded-lg border border-muted-eldritch-green/30">
                <span className="text-muted-eldritch-green">📦 Total Items</span>
                <span className="font-bold text-muted-eldritch-green">{selectedIds.size}</span>
              </div>
            </div>

            {/* Export Button */}
            <div className="space-y-4">
              <ExportToEncounterPlus
                characters={selectedPCs}
                monsters={selectedMonsters}
                filename={`eldritch-export-${new Date().toISOString().split('T')[0]}`}
                variant="primary"
                size="lg"
                className="w-full"
              />

              {selectedIds.size === 0 && (
                <p className="text-sm text-yellow-500/80 text-center">
                  ⚠️ Select at least one character or monster to export
                </p>
              )}
            </div>

            {/* Info Box */}
            <div className="mt-6 p-4 bg-charcoal-violet/50 rounded-lg border border-muted-eldritch-green/20">
              <h3 className="font-semibold text-muted-eldritch-green mb-2">ℹ️ About Encounter+ Export</h3>
              <p className="text-sm text-gray-400 mb-3">
                Exports your content as a JSON file compatible with Encounter+ VTT (v5) using the Plyphyny System.
              </p>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Battle Phase auto-calculated</li>
                <li>• Defense pools (ADP/PDP/HP/SP)</li>
                <li>• Movement speeds included</li>
                <li>• Weapon reach for initiative</li>
              </ul>
            </div>
          </ContentBox>

          {/* Quick Links */}
          <ContentBox className="mt-6">
            <h3 className="font-semibold text-off-white mb-3">Need more content?</h3>
            <div className="space-y-2">
              <Link
                href="/character-generator?from=encounter-plus-export"
                className="block text-sm text-muted-eldritch-green hover:text-soft-amethyst transition-colors"
              >
                → Generate new characters
              </Link>
              <Link
                href="/monster-generator?from=encounter-plus-export"
                className="block text-sm text-muted-eldritch-green hover:text-soft-amethyst transition-colors"
              >
                → Create custom monsters
              </Link>
              <Link
                href="/bestiary?from=encounter-plus-export"
                className="block text-sm text-muted-eldritch-green hover:text-soft-amethyst transition-colors"
              >
                → Browse the Bestiary
              </Link>
            </div>
          </ContentBox>
        </div>
      </div>
    </div>
  );
}

export default function EncounterPlusExportPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-10 text-center text-off-white">Loading export…</div>}>
      <EncounterPlusExportContent />
    </Suspense>
  );
}
