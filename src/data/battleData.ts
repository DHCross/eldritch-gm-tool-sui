// Battle Phase Calculator data for Eldritch RPG 2nd Edition

export type CombatantCategory = 'pa' | 'npc' | 'qsb';
export type CombatantRole = 'Ally' | 'Hostile' | 'Friendly' | 'Companion';
export type WeaponReach = 'short' | 'medium' | 'long';
export type NPCLevel = '1' | '2' | '3' | '4' | '5';
export type QSBClassification = 'Minor' | 'Standard' | 'Exceptional' | 'Legendary';
export type RevitalizeOption = 'invigorate' | 'deepRecovery' | 'steadyRenewal';

export interface Combatant {
  id: number;
  category: CombatantCategory;
  name: string;
  prowessDie: number;
  weaponReach: WeaponReach;
  adp: number;
  pdp: number;
  maxAdp: number;
  armor: string;
  shield: number;
  battlePhase: number;
  reactionFocus: number;
  spiritPoints: number;
  role: CombatantRole;
  classification: string;
  npcDetail?: string;
}

export interface BattleState {
  combatants: Combatant[];
  defeatedCombatants: Combatant[];
  autoRollEnabled: boolean;
  round: number;
}

export const npcDefaults: Record<NPCLevel, { adp: number; pdp: number }> = {
  '1': { adp: 10, pdp: 5 },
  '2': { adp: 15, pdp: 7 },
  '3': { adp: 20, pdp: 10 },
  '4': { adp: 30, pdp: 15 },
  '5': { adp: 40, pdp: 20 }
};

export const qsbDefaults: Record<QSBClassification, { adp: number; pdp: number }> = {
  Minor: { adp: 5, pdp: 3 },
  Standard: { adp: 15, pdp: 10 },
  Exceptional: { adp: 25, pdp: 15 },
  Legendary: { adp: 60, pdp: 60 }
};

export const prowessDieOptions = [4, 6, 8, 10, 12];
export const weaponReachOptions: WeaponReach[] = ['short', 'medium', 'long'];
export const combatantRoles: CombatantRole[] = ['Ally', 'Hostile', 'Friendly', 'Companion'];

export const armorTypes = [
  '0', 'Natural Armor +2', 'Natural Armor +4', 'Natural Armor +6', 'Natural Armor +8',
  '1d4', '1d6', '1d8', '1d10', '1d12', '2d4', '2d6', '2d8', '3d4'
];

export const revitalizeOptions: Record<RevitalizeOption, { label: string; description: string }> = {
  invigorate: {
    label: 'Invigorate',
    description: 'Roll Prowess die + Reaction Focus to restore ADP'
  },
  deepRecovery: {
    label: 'Deep Recovery',
    description: 'Spend 1 SP to gain max Prowess die + Reaction Focus ADP'
  },
  steadyRenewal: {
    label: 'Steady Renewal',
    description: 'Gain 25% of max ADP + 10% per SP spent'
  }
};