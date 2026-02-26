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

export interface VaultThreatDice {
  melee?: string;
  natural?: string;
  ranged?: string;
  arcane?: string;
}

export interface VaultCreature {
  /** Unique id — taken from BestiaryCreature.id */
  id: string;
  name: string;
  category: string;       // 'Minor' | 'Standard' | 'Exceptional' | 'Legendary'
  nature: string;         // 'Mundane' | 'Magical' | 'Preternatural' | 'Supernatural'
  size: string;
  threatMV: number;
  threatDice: VaultThreatDice;
  hp: string;
  dr: string;
  savingThrow: string;
  battlePhase: string;
  extraAttacks?: string;
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
    if (!stored) return [];
    const parsed = JSON.parse(stored) as unknown;
    if (!Array.isArray(parsed)) return [];

    // Backward-compatible migration for legacy vault payloads.
    return parsed.flatMap((raw): VaultCreature[] => {
      if (!raw || typeof raw !== 'object') return [];
      const candidate = raw as Record<string, unknown>;
      if (typeof candidate.id !== 'string' || typeof candidate.name !== 'string') return [];

      const rawThreatDice = candidate.threatDice;
      const threatDice = typeof rawThreatDice === 'string'
        ? { melee: rawThreatDice }
        : rawThreatDice && typeof rawThreatDice === 'object'
          ? {
              melee: typeof (rawThreatDice as Record<string, unknown>).melee === 'string' ? (rawThreatDice as Record<string, unknown>).melee as string : undefined,
              natural: typeof (rawThreatDice as Record<string, unknown>).natural === 'string' ? (rawThreatDice as Record<string, unknown>).natural as string : undefined,
              ranged: typeof (rawThreatDice as Record<string, unknown>).ranged === 'string' ? (rawThreatDice as Record<string, unknown>).ranged as string : undefined,
              arcane: typeof (rawThreatDice as Record<string, unknown>).arcane === 'string' ? (rawThreatDice as Record<string, unknown>).arcane as string : undefined,
            }
          : {};

      const rawExtraAttacks = candidate.extraAttacks;
      const extraAttacks =
        typeof rawExtraAttacks === 'string'
          ? rawExtraAttacks
          : typeof rawExtraAttacks === 'number' && rawExtraAttacks > 0
            ? String(rawExtraAttacks)
            : undefined;

      const specialAbilities = Array.isArray(candidate.specialAbilities)
        ? candidate.specialAbilities.filter((entry): entry is string => typeof entry === 'string')
        : [];

      const threatMV = typeof candidate.threatMV === 'number'
        ? candidate.threatMV
        : Number(candidate.threatMV) || 0;

      const hp = typeof candidate.hp === 'string' ? candidate.hp : String(candidate.hp ?? 'Unknown');
      const dr = typeof candidate.dr === 'string' ? candidate.dr : String(candidate.dr ?? 'None');
      const battlePhase = typeof candidate.battlePhase === 'string'
        ? candidate.battlePhase
        : String(candidate.battlePhase ?? 'Unknown');

      return [{
        id: candidate.id,
        name: candidate.name,
        category: typeof candidate.category === 'string' ? candidate.category : 'Standard',
        nature: typeof candidate.nature === 'string' ? candidate.nature : 'Mundane',
        size: typeof candidate.size === 'string' ? candidate.size : 'Medium',
        threatMV,
        threatDice,
        hp,
        dr,
        savingThrow: typeof candidate.savingThrow === 'string' ? candidate.savingThrow : 'Unknown',
        battlePhase,
        extraAttacks,
        specialAbilities,
        source: typeof candidate.source === 'string' ? candidate.source : 'Bestiary',
        addedAt: typeof candidate.addedAt === 'string' ? candidate.addedAt : new Date().toISOString(),
      }];
    });
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
  if (typeof window === 'undefined') return () => {};
  const onStorage = (event: StorageEvent) => {
    if (!event.key || event.key === VAULT_KEY) {
      cb();
    }
  };
  window.addEventListener(VAULT_EVENT, cb);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(VAULT_EVENT, cb);
    window.removeEventListener('storage', onStorage);
  };
}

export { VAULT_EVENT };
