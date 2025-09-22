// src/app/encounter-generator/encounterTemplates.ts

/**
 * Encounter Template Management
 * Save, load, and manage encounter templates for reuse and customization.
 */

import { EncounterMonster } from './knapsackPipeline';

export interface EncounterTemplate {
  id: string;
  name: string;
  description?: string;
  monsters: EncounterMonster[];
  created_at: string;
  updated_at: string;
}

const ENCOUNTER_TEMPLATE_KEY = 'encounter_templates';

export function saveEncounterTemplate(template: EncounterTemplate): void {
  const templates = loadEncounterTemplates();
  const idx = templates.findIndex(t => t.id === template.id);
  if (idx >= 0) {
    templates[idx] = template;
  } else {
    templates.push(template);
  }
  localStorage.setItem(ENCOUNTER_TEMPLATE_KEY, JSON.stringify(templates));
}

export function loadEncounterTemplates(): EncounterTemplate[] {
  const raw = localStorage.getItem(ENCOUNTER_TEMPLATE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function deleteEncounterTemplate(id: string): void {
  const templates = loadEncounterTemplates().filter(t => t.id !== id);
  localStorage.setItem(ENCOUNTER_TEMPLATE_KEY, JSON.stringify(templates));
}

export function getEncounterTemplate(id: string): EncounterTemplate | undefined {
  return loadEncounterTemplates().find(t => t.id === id);
}
