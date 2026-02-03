# Encounter+ Content Bridge Specification

This document outlines the technical design for the **Eldritch GM Tool (SUI) -> Encounter+ (v5)** export feature. This bridge allows users to create characters, monsters, and spells in the SUI web tool and export them as a valid `.json` import file for the Encounter+ VTT.

---

## 1. Feature Overview

**Goal:** Provide a "Download for Encounter+" button in the SUI interface.
**Output:** A `.json` file conforming to the Encounter+ Import Schema 2.0.
**Scope:**
*   Characters (PCs)
*   Adversaries (Monsters/NPCs)
*   Spells (Grimoire)

---

## 2. Data Transformation (The Rosetta Stone)

The core challenge is mapping SUI's internal data model (based on Eldritch Rules 2025) to the rigid `data.*` attribute structure defined in the Plyphyny System's `config.json`.

### A. Adversary Mapping (Monsters)

| SUI Field (Internal) | Encounter+ Field | Transformation Logic |
| :--- | :--- | :--- |
| `name` | `name` | Direct copy. |
| `prowess_die` (e.g., "d8") | `data.prowessDie` | Direct copy. |
| `prowess_die` (e.g., "d8") | `data.prowessMV` | Dice Value Extraction (d8 -> 8). |
| `agility_focus` (int) | `data.reactionFocus` | Direct copy. |
| `melee_focus` (int) | `data.finesseFocus` | Direct copy. |
| `hp_formula` (e.g., "2d10+4") | `data.hp` | **Avg Calc:** Use average value of dice string. |
| `adp_stat` (int) | `data.ad_max` | Direct copy. |
| `adp_stat` (int) | `data.ad_current` | Copy Max to Current. |
| `pdp_stat` (int) | `data.pd_max` | Direct copy. |
| `pdp_stat` (int) | `data.pd_current` | Copy Max to Current. |
| `armor_type` | `data.armor` | Direct copy. |
| `weapon_reach` | `data.weaponReach` | Enum Map: "Long" -> "Long Reach". |
| `traits` (List) | `data.description` | Convert List -> HTML `<ul>` block. |
| `actions` (List) | `data.actions` | Convert List -> HTML `<dl>` block. |

### B. Character Mapping (PCs)

| SUI Field (Internal) | Encounter+ Field | Transformation Logic |
| :--- | :--- | :--- |
| `character_name` | `name` | Direct copy. |
| `class` | `data.class` | Direct copy. |
| `level` | `data.level` | Direct copy. |
| `prowess_die` | `data.prowessDie` | Direct copy. |
| `speed_focus` | `data.speedFocus` | Direct copy. |
| `spirit_points` | `data.sp_max` | Direct copy. |

### C. Import Schema Structure

The output file must follow this exact JSON structure to be recognized by Encounter+:

```json
{
  "version": "5.0",
  "name": "Eldritch Tool Export",
  "monster": [
    // Array of Monster Objects
    {
      "name": "Goblin Grunt",
      "data": {
        "prowessDie": "d4",
        "hp": 7,
        "ad_max": 0
      }
    }
  ],
  "character": [
    // Array of Character Objects
    {
      "name": "Sir Eldric",
      "data": {
        "class": "Warrior",
        "level": 3
      }
    }
  ]
}
```

---

## 3. Implementation Plan (eldritch-gm-tool-sui)

### Phase 1: Utility Library (`src/utils/encounterPlusExporter.ts`)

Create a class `EncounterPlusExporter` with methods:
*   `convertMonster(suiMonster: any): EncounterEntity`
*   `convertCharacter(suiChar: any): EncounterEntity`
*   `generateImportJson(entities: any[]): Blob`

**Key Algorithms:**
1.  **Dice Parser:** Helper function to convert "2d10+5" into an integer (Average: 16) for HP fields, as Encounter+ expects numbers for HP bars.
2.  **Phase Calculator:** Recalculate the `data.battlephase` (1-5) based on the current Phase logic (12+ -> 1, 1-4 -> 5) during export, ensuring the value is static and correct upon import.

### Phase 2: UI Integration

1.  **Monster List View:** Add button "Export to Encounter+".
    *   *Action:* Gathers selected monsters -> Calls `generateImportJson` -> Triggers browser download.
2.  **Character Sheet:** Add button "Export JSON".

### Phase 3: Validation

*   **Round-Trip Test:** Created -> Exported -> Imported into Encounter+ Beta.
*   **Check:** Do the resource bars (Red/Blue/Orange) appear correctly?
*   **Check:** Is the Initiative Phase sorting correctly in the tracker?

---

## 4. Plyphyny-Specific Edge Cases

### Auto-Calculating Movement
Since Encounter+ Forms often use `readonly` fields for complex math, the Bridge should **pre-calculate** the Movement Speed (Squares) and write it into a specific data field (e.g., `data.speed_calculated`) if the destination System supports it, or append it to the `data.description` HTML so the GM has a reference.

**Recommendation:** Append to Description.
`"data.description": "<p><strong>Speed:</strong> 6 Squares (Run 12)</p>..."`

### Threat Dice
Plyphyny uses "Threat Pools" (e.g., 2d6). Encounter+ creates buttons for these.
*   **Mapping:** Map SUI actions to `data.attacks`.
*   **Format:** ` [{ "name": "Longsword", "range": "Melee", "attack": "2d6", "type": "Physical" }] `

---

## 5. Future Scope (Compendium Packing)

Ideally, we export a `.compendium` file (Zip) that includes images. This requires:
1.  JSZip library integration.
2.  Mapping SUI image blobs to `slug.jpg` inside the zip.
3.  Updating the JSON to reference these local image paths.

*For V1, we will stick to JSON text-only export.*
