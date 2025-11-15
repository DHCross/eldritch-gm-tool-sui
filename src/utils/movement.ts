// Tactical Movement Utilities for Eldritch RPG 2nd Edition

export type DieRank = 'd4' | 'd6' | 'd8' | 'd10' | 'd12';

export const movementTypeValues: Record<string, number> = {
  walk: 1,
  run: 1.5,
  sprint: 2,
  climb: 0.5,
  swim: 0.75,
  fly: 2.5
};

export interface TacticalNotes {
  raw: number;
  rounded: number;
  sizeModifier: number;
  defenseSplitModifier: number;
  speedFocusModifier: number;
  total: number;
  movementType: string;
}

const parseDieRank = (rank: DieRank): number => parseInt(rank.substring(1), 10);

export const computePCMovement = (
  prowessDieRank: DieRank,
  agilityDieRank: DieRank,
  hasAgilitySpecialty: boolean = false
): number => {
  const prowess = parseDieRank(prowessDieRank);
  const agility = parseDieRank(agilityDieRank);
  const base = Math.round((prowess + agility) / 2);
  return hasAgilitySpecialty ? Math.round(base * 1.2) : base;
};

export const computeCreatureMovement = (
  bpDieRank: DieRank,
  size: string = 'medium',
  defenseSplit: string = 'balanced',
  especiallySpeedy: boolean = false
): number => {
  const bp = parseDieRank(bpDieRank);
  let baseMovement = 10;

  if (bp >= 10) baseMovement = 18;
  else if (bp >= 8) baseMovement = 15;
  else if (bp >= 6) baseMovement = 12;

  const sizeMod = costInSquaresForMovement(size);
  const defenseMod = defenseSplit.toLowerCase() === 'fast' ? 1.2 : 1;
  const speedMod = especiallySpeedy ? 1.25 : 1;

  return Math.round(baseMovement * sizeMod * defenseMod * speedMod);
};

export const costInSquaresForMovement = (size: string): number => {
  const lowerSize = size.toLowerCase();
  if (['gargantuan', 'huge', 'large'].includes(lowerSize)) return 1.5;
  if (['tiny', 'minuscule'].includes(lowerSize)) return 0.5;
  return 1;
};

export const formatMovementNotation = (squares: number, type: string = 'walk'): string => {
  const movementValue = Math.round(squares * (movementTypeValues[type] || 1));
  return `${movementValue} sq`;
};

export const generateTacticalNotes = (
  baseMovement: number,
  size: string,
  defenseSplit: string,
  especiallySpeedy: boolean,
  movementType: string = 'walk'
): TacticalNotes => {
  const raw = baseMovement;
  const rounded = Math.round(raw);

  const sizeModifier = costInSquaresForMovement(size) - 1;
  const defenseSplitModifier = defenseSplit.toLowerCase() === 'fast' ? 0.2 : 0;
  const speedFocusModifier = especiallySpeedy ? 0.25 : 0;

  const total = Math.round(
    rounded *
    (1 + sizeModifier) *
    (1 + defenseSplitModifier) *
    (1 + speedFocusModifier) *
    (movementTypeValues[movementType] || 1)
  );

  return {
    raw,
    rounded,
    sizeModifier,
    defenseSplitModifier,
    speedFocusModifier,
    total,
    movementType
  };
};