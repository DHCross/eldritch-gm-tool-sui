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

export interface MonsterData extends SavedCharacter {
  type: 'Monster';
  monster_trope: string;
  threat_dice: string;
  threat_mv: number;
  preferred_encounter_roles: ('minion' | 'boss' | 'ambush' | 'elite' | 'brute' | 'caster')[];
  recommended_xp_value?: number;
  hp_calculation: {
    base_hp: number;
    size_modifier: number;
    nature_modifier: number;
    final_hp: number;
  };
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