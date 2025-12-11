/**
 * HTML exporter for NPC/PC stat blocks.
 * Uses 'any' types intentionally to accept multiple NPC/PC shapes.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

function esc(s: unknown) {
  if (s === undefined || s === null) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function npcToHTML(npc: any) {
  // Accept QuickStatBlock or DetailedStatBlock or QuickNPC/DetailedNPC shapes
  const name = esc(npc.name || npc?.ch?.name || 'Unknown');
  const race = esc(npc.race || npc?.ch?.race || '');
  const role = esc(npc.role || npc?.ch?.role || '');
  const level = esc(npc.level ?? npc?.ch?.level ?? '');

  const header = `<div style="font-family: -apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,\"Helvetica Neue\",Arial;line-height:1.2"><h1 style="margin:0 0 6px;font-size:20px">${name}</h1><div style="color:#555;margin-bottom:8px">${race} ${role} ${level ? `• Level ${level}` : ''}</div></div>`;

  const sections: string[] = [];

  // Combat stats
  const combat = [] as string[];
  if (npc.activeDefense !== undefined) combat.push(`<div><strong>Active Defense:</strong> ${esc(npc.activeDefense)}</div>`);
  if (npc.passiveDefense !== undefined) combat.push(`<div><strong>Passive Defense:</strong> ${esc(npc.passiveDefense)}</div>`);
  if (npc.spiritPoints !== undefined) combat.push(`<div><strong>Spirit Points:</strong> ${esc(npc.spiritPoints)}</div>`);
  if (npc.battlePhase !== undefined) combat.push(`<div><strong>Battle Phase:</strong> ${esc(npc.battlePhase)}</div>`);
  if (combat.length) sections.push(`<div style="background:#f8fafc;padding:8px;border-radius:6px">${combat.join('')}</div>`);

  // Abilities / notes
  if (npc.primaryAbility || npc.keySpecialty || npc.iconicItem) {
    const a = [] as string[];
    if (npc.primaryAbility) a.push(`<div><strong>Primary:</strong> ${esc(npc.primaryAbility)}</div>`);
    if (npc.keySpecialty) a.push(`<div><strong>Key Specialty:</strong> ${esc(npc.keySpecialty)}</div>`);
    if (npc.iconicItem) a.push(`<div><strong>Iconic Item:</strong> ${esc(npc.iconicItem)}</div>`);
    sections.push(`<div style="background:#f1fdf7;padding:8px;border-radius:6px">${a.join('')}</div>`);
  }

  // Fallback: include raw if present
  if (!sections.length && npc.raw) {
    sections.push(`<pre style="white-space:pre-wrap">${esc(npc.raw)}</pre>`);
  }

  const html = `${header}<div style="margin-top:8px">${sections.join('<div style="height:8px"></div>')}</div>`;
  return html;
}

export function pcToHTML(pc: any) {
  // Reuse npcToHTML layout but with PC-specific fields
  return npcToHTML(pc);
}

export function wrapForWord(html: string) {
  // Minimal wrapper with inline styles to improve paste fidelity into Word
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"/></head><body style="font-family: -apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,\"Helvetica Neue\",Arial; color:#111;">${html}</body></html>`;
}

const exporterModule = { npcToHTML, pcToHTML, wrapForWord };
export default exporterModule;
