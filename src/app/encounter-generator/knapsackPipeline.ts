// src/app/encounter-generator/knapsackPipeline.ts

/**
 * Deterministic Encounter Pipeline with Knapsack Optimization
 * Selects a set of monsters for an encounter such that total threat matches party budget.
 * Uses 0/1 knapsack algorithm for optimal selection.
 */

export interface EncounterMonster {
  id: string;
  name: string;
  threat: number; // threat value for balancing
  xp: number;
  category: string;
  size: string;
  nature: string;
}

export interface EncounterPipelineOptions {
  threatBudget: number;
  monsters: EncounterMonster[];
  maxMonsters?: number;
}

export interface EncounterPipelineResult {
  selected: EncounterMonster[];
  totalThreat: number;
  totalXP: number;
}

/**
 * Knapsack optimization for encounter selection
 */
export function selectEncounterKnapsack({ threatBudget, monsters, maxMonsters = 6 }: EncounterPipelineOptions): EncounterPipelineResult {
  const n = monsters.length;
  // DP table: dp[i][w] = max XP for first i monsters and threat budget w
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(threatBudget + 1).fill(0));
  const keep: boolean[][][] = Array.from({ length: n + 1 }, () => Array.from({ length: threatBudget + 1 }, () => Array(maxMonsters + 1).fill(false)));

  for (let i = 1; i <= n; i++) {
    const m = monsters[i - 1];
    for (let w = 0; w <= threatBudget; w++) {
      for (let k = 1; k <= maxMonsters; k++) {
        if (m.threat <= w) {
          const xpWith = dp[i - 1][w - m.threat] + m.xp;
          if (xpWith > dp[i - 1][w]) {
            dp[i][w] = xpWith;
            keep[i][w][k] = true;
          } else {
            dp[i][w] = dp[i - 1][w];
          }
        } else {
          dp[i][w] = dp[i - 1][w];
        }
      }
    }
  }

  // Backtrack to find selected monsters
  let w = threatBudget;
  let k = maxMonsters;
  const selected: EncounterMonster[] = [];
  for (let i = n; i > 0 && k > 0; i--) {
    if (keep[i][w][k]) {
      selected.push(monsters[i - 1]);
      w -= monsters[i - 1].threat;
      k--;
    }
  }

  const totalThreat = selected.reduce((sum, m) => sum + m.threat, 0);
  const totalXP = selected.reduce((sum, m) => sum + m.xp, 0);

  return {
    selected: selected.reverse(),
    totalThreat,
    totalXP,
  };
}
