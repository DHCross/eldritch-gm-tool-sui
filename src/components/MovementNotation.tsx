'use client';

import { useState } from 'react';
import {
  DieRank,
  computePCMovement,
  computeCreatureMovement,
  formatMovementNotation,
  generateTacticalNotes
} from '../utils/movement';

interface MovementNotationProps {
  isCreature: boolean;
  prowessDieRank?: DieRank;
  agilityDieRank?: DieRank;
  hasAgilitySpecialty?: boolean;
  bpDieRank?: DieRank;
  size?: string;
  defenseSplit?: string;
  especiallySpeedy?: boolean;
}

export default function MovementNotation({
  isCreature,
  prowessDieRank,
  agilityDieRank,
  hasAgilitySpecialty,
  bpDieRank,
  size = 'medium',
  defenseSplit = 'balanced',
  especiallySpeedy = false
}: MovementNotationProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const baseMovement = isCreature
    ? computeCreatureMovement(bpDieRank || 'd6', size, defenseSplit, especiallySpeedy)
    : computePCMovement(prowessDieRank || 'd6', agilityDieRank || 'd6', hasAgilitySpecialty);

  const tacticalNotes = generateTacticalNotes(
    baseMovement,
    size,
    defenseSplit,
    especiallySpeedy
  );

  const notation = formatMovementNotation(tacticalNotes.total);

  const renderTooltip = () => (
    <div className="absolute z-10 w-48 p-2 -mt-1 text-sm text-white bg-gray-800 rounded-lg shadow-lg">
      <p>Base: {tacticalNotes.raw.toFixed(1)} sq</p>
      <p>Rounded: {tacticalNotes.rounded} sq</p>
      {tacticalNotes.sizeModifier !== 0 && (
        <p>Size Mod: {tacticalNotes.sizeModifier > 0 ? '+' : ''}{(tacticalNotes.sizeModifier * 100).toFixed(0)}%</p>
      )}
      {tacticalNotes.defenseSplitModifier !== 0 && (
        <p>Defense Mod: +{(tacticalNotes.defenseSplitModifier * 100).toFixed(0)}%</p>
      )}
      {tacticalNotes.speedFocusModifier !== 0 && (
        <p>Speed Mod: +{(tacticalNotes.speedFocusModifier * 100).toFixed(0)}%</p>
      )}
      <p className="pt-1 mt-1 border-t border-gray-600">
        Total: {tacticalNotes.total} sq
      </p>
    </div>
  );

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <span className="text-sm font-semibold text-gray-700 cursor-pointer">
        {notation}
      </span>
      {showTooltip && renderTooltip()}
    </div>
  );
}