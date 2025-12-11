# Stat Block Parser & Exporter

This module provides a small tool for pasting/freeform stat-block text, analyzing it for Quick Stat Block (QSB) or Detailed NPC/PC data, auto-correcting basic issues, and copying the result to Markdown or HTML (Word-friendly) using clipboard MIME when supported.

Features:
- `parseStatBlockText(text)` — Heuristic parser that returns `{ type, data, diagnostics }`.
- `npcToHTML(obj)` / `pcToHTML(obj)` — HTML exporters with minimal inline styles; `wrapForWord(html)` to produce a Word-friendly wrapper.
- UI component: `src/components/StatBlockParser.tsx` — accessible at `/stat-block-parser` via the GM Tools page.

Usage:
- Paste your stat block into the UI and click `Analyze` — the parser will attempt to classify it as `quick`, `detailed`, or `unknown` and extract fields like name, ADP/PDP, BP, and special abilities.
- Click `Copy HTML` to copy rich HTML to the clipboard (preferred for pasting into Word or other rich editors). If the browser clipboard API doesn't support HTML MIME, the tool will fall back to copying Markdown/plain text.
- Click `Copy for Word` to get an HTML wrapper optimized for Word paste (inline styles and minimal CSS).

Integration points:
- `src/utils/statBlockParser.ts` — public `parseStatBlockText` function.
- `src/utils/exporters/htmlExporter.ts` — `npcToHTML`, `pcToHTML`, and `wrapForWord`.
- `src/components/StatBlockParser.tsx` — the UI component that exposes the parser + copy/export actions.
- `src/app/stat-block-parser/page.tsx` — the page in the app that uses `StatBlockParser` component.

Notes & future work:
- The parser is heuristic and tolerant — it uses `documentAnalyzer` heuristics and regex-based field extraction. For complex or legacy inputs (Revised Edition or RTF/Word content), improvements may include conversion rules using the `Purity and Parity Suite` converter as inspiration.
- The Purity and Parity Suite includes a Python-based converter (`/Purity and Parity Suite/src/eldritch_converter`) that maps Revised Edition entities into 2nd Edition. We can integrate the conversion logic into a JS module in the future if desired.

If you'd like, I can:
- Add conversion support for Revised Edition (using the Python code as a reference or by porting incrementally), or
- Expand the parser to detect and correct more edge cases (multi-line fields, pasted RTF/HTML content), or
- Add additional exports (e.g., Word .docx creation) and more robust HTML templates.
