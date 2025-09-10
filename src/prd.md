# Eldritch RPG Tool Suite - Rules Adherence Review

## Core Purpose & Success
- **Mission Statement**: Create a comprehensive digital tool suite for the Eldritch RPG 2nd Edition that accurately implements all game rules and mechanics for both players and game masters.
- **Success Indicators**: All character generation, spell selection, encounter creation, and battle calculations must match the official rules exactly.
- **Experience Qualities**: Accurate, intuitive, comprehensive

## Project Classification & Approach
- **Complexity Level**: Complex Application (advanced functionality, multiple interconnected systems)
- **Primary User Activity**: Creating characters, managing encounters, tracking combat, building spell lists

## Essential Features

### Character Generator
- **Functionality**: Generate balanced, hybrid, or specialist player characters following official rules
- **Purpose**: Ensure characters are built correctly according to race/class minimums and CP allocation
- **Success Criteria**: All generated characters match official rules for abilities, specialties, focuses, and spell selection

### Spell Reference System  
- **Functionality**: Browse, filter, and select spells by path, rarity, and character class
- **Purpose**: Help players build accurate spellbooks for their caster characters
- **Success Criteria**: All spells implemented correctly with proper mechanics and restrictions

### Encounter Generator
- **Functionality**: Create balanced encounters based on party composition and difficulty
- **Purpose**: Help GMs create appropriately challenging encounters
- **Success Criteria**: Threat calculations match official encounter building rules

### Battle Calculator
- **Functionality**: Track initiative, hit points, and combat state
- **Purpose**: Streamline combat management during gameplay
- **Success Criteria**: All combat calculations follow official battle phase rules

## Current Issues Identified

### Character Generator Issues
1. **Spell Integration**: Character generator mentions spell integration but doesn't properly implement starting spell selection for casters
2. **Mastery Path Logic**: Need to verify Adept and Mystic special rules are correctly implemented  
3. **CP Calculation**: Character Point calculations need verification against official rules
4. **Weakness Reporting**: The weakness detection logic may not align with actual game balance

### Spell System Issues
1. **Starting Spell Counts**: Need to verify the formula for initial spell selection matches official rules
2. **Path Restrictions**: Ensure class-specific path restrictions are correctly enforced
3. **Rarity Distribution**: Verify the 70%/30% Common/Uncommon split is official

### Battle System Issues
1. **Initiative Calculation**: Battle phase calculations need verification
2. **HP Calculations**: Monster HP formulas need checking against official rules
3. **Defense Pool Logic**: Active/Passive defense calculations need verification

## Recommendations for Rules Adherence

### Immediate Fixes Needed
1. **Add proper spell auto-selection** for newly generated caster characters
2. **Verify all race/class minimum requirements** match the official rules exactly
3. **Check CP cost calculations** for abilities, specialties, and focuses
4. **Validate encounter difficulty tables** against official encounter building rules
5. **Review battle phase/initiative mechanics** for accuracy

### Data Verification Required
1. All race minimums and bonuses
2. All class minimums and features  
3. Spell lists and mechanics for each path
4. Equipment lists by class
5. Advantage/flaw assignments
6. Level progression tables

### Integration Improvements
1. Better spell-to-character integration
2. Encounter-to-battle system connection
3. Character roster management
4. Import/export functionality

## Design Direction

The current implementation has good visual design and user experience, but needs thorough rules verification to ensure game accuracy. The mystical color scheme (dark backgrounds with green accents) fits the Eldritch theme well.

## Implementation Plan

1. **Phase 1**: Verify all core rules data (minimums, costs, formulas)
2. **Phase 2**: Fix character generation logic and spell integration  
3. **Phase 3**: Validate encounter and battle systems
4. **Phase 4**: Add any missing features from the official rules
5. **Phase 5**: Comprehensive testing against official character examples

## Notes

Without access to the official Eldritch Rules PDF, this review is based on the existing implementation patterns and typical RPG system conventions. A thorough rules verification would require comparing each system against the official rulebook.