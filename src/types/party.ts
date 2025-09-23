// Core data types for party management system

export interface CharacterAbilities {
  prowess_mv: number;
  agility_mv: number;
  melee_mv: number;
  fortitude_mv: number;
  endurance_mv: number;
  strength_mv: number;
  competence_mv: number;
  willpower_mv: number;
  // Additional abilities as needed
  expertise_mv?: number;
  perception_mv?: number;
  adroitness_mv?: number;
  precision_mv?: number;
}

export interface ComputedStats {
  active_dp: number;    // prowess_mv + agility_mv + melee_mv
  passive_dp: number;   // fortitude_mv + endurance_mv + strength_mv
  spirit_pts: number;   // competence_mv + willpower_mv
}

export interface CharacterStatus {
  current_hp_active: number;
  current_hp_passive: number;
  status_flags: string[];
  gear: string[];
  notes: string;
}

export interface SavedCharacter {
  id: string;
  user_id: string;
  name: string;
  type: 'PC' | 'NPC' | 'Monster';
  level: number;
  race: string;
  class: string;
  abilities: CharacterAbilities;
  computed: ComputedStats;
  status: CharacterStatus;
  tags: string[];
  created_at: string;
  updated_at: string;
  // Store full character data from generators
  full_data?: Record<string, unknown>;
}

export type CreatureCategory = 'Minor' | 'Standard' | 'Exceptional' | 'Legendary';
export type CreatureNature = 'Mundane' | 'Magical' | 'Preternatural' | 'Supernatural';
export type CreatureSize = 'Minuscule' | 'Tiny' | 'Small' | 'Medium' | 'Large' | 'Huge' | 'Gargantuan';
export type DefenseSplit = 'Regular' | 'Tough' | 'Fast';
export type ThreatType = 'Melee' | 'Natural' | 'Ranged' | 'Arcane';

export interface ThreatDice {
  melee: string;
  natural: string;
  ranged: string;
  arcane: string;
}

export interface MovementCalculation {
  base_movement_per_phase: number;
  battle_phase_mv: number;
  agility_mv?: number;
  size_modifier: number;
  speed_modifiers: string[];
  final_movement_per_phase: number;
}

export interface MonsterData extends SavedCharacter {
  type: 'Monster';
  // Official Eldritch Classifications
  creature_category: CreatureCategory;
  creature_nature: CreatureNature;
  creature_size: CreatureSize;
  defense_split: DefenseSplit;

  // Threat System
  threat_dice: ThreatDice;
  primary_threat_type: ThreatType;
  threat_mv: number; // MV of highest threat dice

  // QSB Components
  extra_attacks: string[];
  damage_reduction: string;
  saving_throw: string;
  battle_phase: string;

  // Movement
  movement_calculation: MovementCalculation;

  // Legacy/Additional
  monster_trope: string;
  preferred_encounter_roles: ('minion' | 'boss' | 'ambush' | 'elite' | 'brute' | 'caster')[];
  hp_calculation: {
    base_hp: number;
    size_modifier: number;
    nature_modifier: number;
    hp_multiplier: number;
    final_hp: number;
    active_hp: number;
    passive_hp: number;
  };

  // Quick reference for encounter building
  notes: string;
  weapons_armor_treasure: string[];
}

export type FolderType = 'PC_party' | 'NPC_roster' | 'Monster_trope';

export interface PartyFolder {
  id: string;
  user_id: string;
  name: string;
  folder_type: FolderType;
  description: string;
  visibility: 'private' | 'shared';
  created_at: string;
  updated_at: string;
}

export interface PartyMembership {
  id: string;
  party_id: string;
  character_id: string;
  role_tag?: 'tank' | 'healer' | 'dps' | 'support' | 'scout';
  order_index: number;
  active: boolean;
}

export interface PartyDefenseProfile {
  total_active_dp: number;
  total_passive_dp: number;
  total_spirit_pts: number;
  character_count: number;
  character_breakdown: {
    id: string;
    name: string;
    active_dp: number;
    passive_dp: number;
    spirit_pts: number;
  }[];
  defense_tier: 'Practitioner' | 'Competent' | 'Proficient' | 'Advanced' | 'Elite';
}

export interface EncounterTemplate {
  id: string;
  name: string;
  selected_party_ids: string[];
  selected_character_ids: string[];
  suggested_monsters: {
    character_id: string;
    count: number;
    role: string;
  }[];
  notes: string;
  created_at: string;
}

export interface SplitPartySelection {
  party_id?: string;
  character_ids: string[];
  reason: string; // e.g., "Stealth mission", "Guard duty", etc.
}