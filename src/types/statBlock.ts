import { QuickNPC, DetailedNPC } from '../data/npcData';

export type StatBlockType = 'quick' | 'detailed' | 'monster' | 'unknown';

export interface StatBlockDiagnostics {
  issues: string[];
  score?: number;
}

export interface QuickStatBlock {
  name?: string;
  race?: string;
  role?: string;
  level?: number;
  activeDefense?: string | number;
  passiveDefense?: string | number;
  spiritPoints?: number;
  battlePhase?: string | number;
  raw?: string;
}

export interface DetailedStatBlock extends Partial<DetailedNPC> {
  raw?: string;
}

export interface StatBlockParseResult<T = unknown> {
  type: StatBlockType;
  data: T | null;
  diagnostics: StatBlockDiagnostics;
}

export interface MonsterStatBlock {
  name?: string;
  size?: string;
  hitDice?: string;
  attacks?: string;
  specialAbilities?: string[];
  raw?: string;
}

export const defaultDiagnostics = (): StatBlockDiagnostics => ({ issues: [], score: 0 });

export type { QuickNPC, DetailedNPC };
