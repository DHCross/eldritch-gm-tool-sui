/**
 * Encounter Vault Storage
 *
 * Shared localStorage bridge between the Bestiary ("Add to Encounter")
 * and the Encounter Generator page ("Bestiary Roster" panel).
 *
 * Key difference from partyStorage: vault entries are temporary staging
 * objects that the GM assembles from the Bestiary and then refines in the
 * Encounter Generator. The vault is intentionally lightweight.
 */

export interface VaultCreature {
  /** Unique id — taken from BestiaryCreature.id */
  id: string;
  name: string;
  category: string;       // 'Minor' | 'Standard' | 'Exceptional' | 'Legendary'
  nature: string;         // 'Mundane' | 'Magical' | 'Preternatural' | 'Supernatural'
  size: string;
  threatMV: number;
  threatDice: string;     // first available die notation from BestiaryCreature.threatDice
  hp: number;
  dr: number;
  savingThrow: string;
  battlePhase: number;
  extraAttacks: number;
  specialAbilities: string[];
  source: string;
  /** ISO timestamp added to vault — used to preserve insertion order */
  addedAt: string;
}

const VAULT_KEY = 'eldritch_encounter_vault';
const VAULT_EVENT = 'eldritch_vault_change';

// ── Reads ─────────────────────────────────────────────────────────────────

export function getVaultCreatures(): VaultCreature[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(VAULT_KEY);
    return stored ? (JSON.parse(stored) as VaultCreature[]) : [];
  } catch {
    return [];
  }
}

// ── Writes ────────────────────────────────────────────────────────────────

function persist(creatures: VaultCreature[]): void {
  localStorage.setItem(VAULT_KEY, JSON.stringify(creatures));
  window.dispatchEvent(new Event(VAULT_EVENT));
}

export function addToVault(creature: VaultCreature): void {
  const current = getVaultCreatures();
  current.push({ ...creature, addedAt: new Date().toISOString() });
  persist(current);
}

export function removeFromVaultByIndex(index: number): void {
  const current = getVaultCreatures();
  current.splice(index, 1);
  persist(current);
}

export function clearVault(): void {
  localStorage.removeItem(VAULT_KEY);
  window.dispatchEvent(new Event(VAULT_EVENT));
}

// ── Helpers ───────────────────────────────────────────────────────────────

/** Subscribe to vault changes (add / remove / clear). Returns an unsubscribe fn. */
export function onVaultChange(cb: () => void): () => void {
  window.addEventListener(VAULT_EVENT, cb);
  return () => window.removeEventListener(VAULT_EVENT, cb);
}

export { VAULT_EVENT };
