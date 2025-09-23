'use client';

import { useState, useMemo, useEffect } from 'react';
import { Spell, parseCSV } from '../utils/csvParser';

export default function GrimoireIndex() {
  const [spells, setSpells] = useState<Spell[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPath, setSelectedPath] = useState<string>('');
  const [selectedRarity, setSelectedRarity] = useState<string>('');
  const [selectedEffect, setSelectedEffect] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'path' | 'rarity' | 'rankDie'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    const loadSpells = async () => {
      try {
        const response = await fetch('/grimoire_index sheets - Grimoire.csv');
        const csvText = await response.text();
        const parsedSpells = parseCSV(csvText);
        setSpells(parsedSpells);
      } catch (error) {
        console.error('Error loading grimoire data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSpells();
  }, []);

  const filteredAndSortedSpells = useMemo(() => {
    const filtered = spells.filter(spell => {
      const matchesSearch = spell.spellName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           spell.effects.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           spell.notes.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesPath = !selectedPath || spell.path === selectedPath;
      const matchesRarity = !selectedRarity || spell.rarity === selectedRarity;
      const matchesEffect = !selectedEffect || spell.effects.toLowerCase().includes(selectedEffect.toLowerCase());

      return matchesSearch && matchesPath && matchesRarity && matchesEffect;
    });

    // Sort the filtered results
    filtered.sort((a, b) => {
      let aValue: string, bValue: string;

      switch (sortBy) {
        case 'name':
          aValue = a.spellName;
          bValue = b.spellName;
          break;
        case 'path':
          aValue = a.path;
          bValue = b.path;
          break;
        case 'rarity':
          const rarityOrder = ['Common', 'Uncommon', 'Esoteric', 'Occult', 'Legendary'];
          const aRarityIndex = rarityOrder.indexOf(a.rarity);
          const bRarityIndex = rarityOrder.indexOf(b.rarity);
          return sortOrder === 'asc' ? aRarityIndex - bRarityIndex : bRarityIndex - aRarityIndex;
        case 'rankDie':
          aValue = a.rankDie;
          bValue = b.rankDie;
          break;
        default:
          aValue = a.spellName;
          bValue = b.spellName;
      }

      if (sortOrder === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });

    return filtered;
  }, [spells, searchTerm, selectedPath, selectedRarity, selectedEffect, sortBy, sortOrder]);

  const uniquePaths = useMemo(() => {
    const paths = [...new Set(spells.map(spell => spell.path))].filter(Boolean).sort();
    return paths;
  }, [spells]);

  const uniqueRarities = useMemo(() => {
    const rarities = ['Common', 'Uncommon', 'Esoteric', 'Occult', 'Legendary'];
    return rarities.filter(rarity => spells.some(spell => spell.rarity === rarity));
  }, [spells]);

  const uniqueEffects = useMemo(() => {
    const effects = new Set<string>();
    spells.forEach(spell => {
      if (spell.effects) {
        spell.effects.split(',').forEach(effect => {
          effects.add(effect.trim());
        });
      }
    });
    return [...effects].filter(Boolean).sort();
  }, [spells]);

  const handleSort = (field: 'name' | 'path' | 'rarity' | 'rankDie') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedPath('');
    setSelectedRarity('');
    setSelectedEffect('');
  };

  const exportToMarkdown = () => {
    let markdown = `# Grimoire Index - Filtered Results\n\n`;
    markdown += `**Total Spells:** ${filteredAndSortedSpells.length}\n\n`;

    if (searchTerm || selectedPath || selectedRarity || selectedEffect) {
      markdown += `**Filters Applied:**\n`;
      if (searchTerm) markdown += `- Search: "${searchTerm}"\n`;
      if (selectedPath) markdown += `- Path: ${selectedPath}\n`;
      if (selectedRarity) markdown += `- Rarity: ${selectedRarity}\n`;
      if (selectedEffect) markdown += `- Effect: ${selectedEffect}\n`;
      markdown += '\n';
    }

    markdown += `| Spell Name | Path | Rarity | Rank/Die | Effects | Notes |\n`;
    markdown += `|------------|------|--------|----------|---------|-------|\n`;

    filteredAndSortedSpells.forEach(spell => {
      const path = spell.path || 'All Paths';
      const notes = spell.notes || '';
      markdown += `| ${spell.spellName} | ${path} | ${spell.rarity} | ${spell.rankDie} | ${spell.effects} | ${notes} |\n`;
    });

    markdown += `\n---\n*Generated with Eldritch GM Tools*`;

    navigator.clipboard.writeText(markdown);
    alert('Grimoire index exported to clipboard!');
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Grimoire Index...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Grimoire Index
        </h1>
        <p className="text-gray-600">
          Complete spell database for Eldritch RPG 2nd Edition
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-wrap gap-4 mb-4">
          <button
            onClick={exportToMarkdown}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            Export to Markdown
          </button>
          <button
            onClick={clearFilters}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            Clear Filters
          </button>
          <div className="ml-auto text-sm text-gray-600 flex items-center">
            Showing {filteredAndSortedSpells.length} of {spells.length} spells
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Spells
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search by name, effects, or notes..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Magic Path
            </label>
            <select
              value={selectedPath}
              onChange={(e) => setSelectedPath(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Paths</option>
              {uniquePaths.map(path => (
                <option key={path} value={path}>{path}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rarity
            </label>
            <select
              value={selectedRarity}
              onChange={(e) => setSelectedRarity(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Rarities</option>
              {uniqueRarities.map(rarity => (
                <option key={rarity} value={rarity}>{rarity}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Effect Type
            </label>
            <select
              value={selectedEffect}
              onChange={(e) => setSelectedEffect(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Effects</option>
              {uniqueEffects.map(effect => (
                <option key={effect} value={effect}>{effect}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Spell List */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-1">
                    Spell Name
                    {sortBy === 'name' && (
                      <span className="text-blue-600">
                        {sortOrder === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('path')}
                >
                  <div className="flex items-center gap-1">
                    Path
                    {sortBy === 'path' && (
                      <span className="text-blue-600">
                        {sortOrder === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('rarity')}
                >
                  <div className="flex items-center gap-1">
                    Rarity
                    {sortBy === 'rarity' && (
                      <span className="text-blue-600">
                        {sortOrder === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('rankDie')}
                >
                  <div className="flex items-center gap-1">
                    Rank/Die
                    {sortBy === 'rankDie' && (
                      <span className="text-blue-600">
                        {sortOrder === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Effects
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedSpells.map((spell, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {spell.spellName}
                    </div>
                    {spell.category && (
                      <div className="text-sm text-gray-500">
                        {spell.category}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {spell.path || 'All Paths'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      spell.rarity === 'Common' ? 'bg-green-100 text-green-800' :
                      spell.rarity === 'Uncommon' ? 'bg-blue-100 text-blue-800' :
                      spell.rarity === 'Esoteric' ? 'bg-purple-100 text-purple-800' :
                      spell.rarity === 'Occult' ? 'bg-red-100 text-red-800' :
                      spell.rarity === 'Legendary' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {spell.rarity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                    {spell.rankDie}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="flex flex-wrap gap-1">
                      {spell.effects.split(',').map((effect, idx) => (
                        <span
                          key={idx}
                          className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                        >
                          {effect.trim()}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {spell.notes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAndSortedSpells.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No spells found matching your criteria.</p>
            <button
              onClick={clearFilters}
              className="mt-4 text-blue-600 hover:text-blue-800"
            >
              Clear filters to see all spells
            </button>
          </div>
        )}
      </div>
    </div>
  );
}