'use client';

import React, { useState } from 'react';
import { SavedCharacter } from '../types/party';
import { downloadEncounterPlusExport, generateImportJson } from '../utils/exporters/encounterPlusExporter';

interface ExportToEncounterPlusProps {
  /** Monsters/NPCs to export */
  monsters?: SavedCharacter[];
  /** Player Characters to export */
  characters?: SavedCharacter[];
  /** Custom filename (without extension) */
  filename?: string;
  /** Button variant styling */
  variant?: 'primary' | 'secondary' | 'ghost';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
  /** Callback after successful export */
  onExport?: () => void;
}

/**
 * Export button component for downloading content to Encounter+ VTT format.
 * 
 * Usage:
 * ```tsx
 * <ExportToEncounterPlus 
 *   monsters={selectedMonsters} 
 *   characters={selectedPCs}
 *   filename="my-campaign"
 * />
 * ```
 */
export default function ExportToEncounterPlus({
  monsters = [],
  characters = [],
  filename = 'eldritch-export',
  variant = 'secondary',
  size = 'md',
  className = '',
  onExport
}: ExportToEncounterPlusProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  const totalItems = monsters.length + characters.length;
  const isDisabled = totalItems === 0;
  
  const handleExport = () => {
    if (isDisabled) return;
    
    setIsExporting(true);
    try {
      downloadEncounterPlusExport(monsters, characters, `${filename}.json`);
      onExport?.();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };
  
  const handlePreview = () => {
    setShowPreview(!showPreview);
  };
  
  // Style mappings
  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  const variantClasses = {
    primary: 'bg-soft-amethyst hover:bg-soft-amethyst/80 text-white border-soft-amethyst',
    secondary: 'bg-white/10 hover:bg-white/15 text-off-white border-white/15',
    ghost: 'bg-transparent hover:bg-white/10 text-off-white/80 border-transparent'
  };
  
  const baseClasses = 'inline-flex items-center gap-2 rounded-md border font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-soft-amethyst/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  return (
    <div className={`inline-block ${className}`}>
      <div className="flex items-center gap-2">
        {/* Main Export Button */}
        <button
          onClick={handleExport}
          disabled={isDisabled || isExporting}
          className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]}`}
          title={isDisabled ? 'Select items to export' : `Export ${totalItems} item(s) to Encounter+`}
        >
          {/* Encounter+ Icon (simplified) */}
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="w-4 h-4"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          
          {isExporting ? (
            <span>Exporting...</span>
          ) : (
            <span>
              Export to Encounter+
              {totalItems > 0 && <span className="ml-1 opacity-70">({totalItems})</span>}
            </span>
          )}
        </button>
        
        {/* Preview Toggle Button */}
        {totalItems > 0 && (
          <button
            onClick={handlePreview}
            className={`${baseClasses} ${sizeClasses.sm} ${variantClasses.ghost}`}
            title="Preview export data"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="w-4 h-4"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        )}
      </div>
      
      {/* Preview Panel */}
      {showPreview && totalItems > 0 && (
        <div className="mt-3 p-4 bg-white/5 rounded-lg border border-white/10 max-h-96 overflow-auto">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold text-sm text-off-white/80">
              Export Preview
            </h4>
            <button 
              onClick={() => setShowPreview(false)}
              className="text-off-white/40 hover:text-off-white"
            >
              ✕
            </button>
          </div>
          
          {/* Summary */}
          <div className="mb-3 text-sm text-off-white/60">
            {monsters.length > 0 && <div>🐉 {monsters.length} Monster(s)</div>}
            {characters.length > 0 && <div>⚔️ {characters.length} Character(s)</div>}
          </div>
          
          {/* JSON Preview */}
          <pre className="text-xs bg-white/5 p-3 rounded overflow-auto max-h-60 font-mono text-off-white/80">
            {JSON.stringify(generateImportJson(monsters, characters, filename), null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

// Named exports for flexibility
export { ExportToEncounterPlus };
