# Eldritch GM Tool SUI — Changelog

## September 2025

### Added

- **Name Generation System**
  - Created `src/utils/nameGenerator.ts` with a comprehensive name generation system for Eldritch RPG, based on the "Extraordinary Book of Names".
  - Supports multiple cultures (English, Scottish, Welsh, Irish, Norse, French, Germanic, Fantasy) and gender options.
  - Includes functions for random name generation, suggestions, race-to-culture mapping, validation, and name endings.

### Updated

- **Character Generator Component**
  - Updated `src/components/CharacterGenerator.tsx` to integrate the new name generation system.
  - Added fields for character name, player name, gender, and name culture.
  - Added UI for name suggestions and random name generation in the party assignment modal.
  - Character saving now includes player name, gender, and name culture in the saved data.
  - Improved party assignment modal with new character details and name suggestion features.

---

If you need a more detailed changelog or want to include other files, let me know!
