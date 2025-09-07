# Product Requirements Document: Eldritch RPG Tool Suite

## Core Purpose & Success
- **Mission Statement**: A comprehensive digital tool suite for Game Masters and Players of the Eldritch RPG system, streamlining character creation, encounter management, and gameplay mechanics.
- **Success Indicators**: Reduced prep time for GMs, accurate rule implementation, and enhanced player experience through automated calculations and balanced character generation.
- **Experience Qualities**: Professional, mystical, intuitive

## Project Classification & Approach
- **Complexity Level**: Complex Application (multiple interconnected tools with advanced functionality)
- **Primary User Activity**: Creating (characters, encounters, monsters), Acting (battle management), and Interacting (reference tools)

## Core Features

### Game Master Tools
1. **Encounter Generator**: Creates balanced encounters based on party composition and difficulty
2. **NPC Generator**: Generates detailed NPCs with full statistics and background
3. **Battle Calculator**: Initiative tracking and combat management
4. **Monster Generator**: Creates custom creatures with proper stat calculations

### Player Tools
1. **Character Generator**: Comprehensive character creation with multiple build philosophies
2. **Spell Reference**: Browse and search spell database (placeholder for future expansion)

## Design Direction

### Visual Tone & Identity
- **Emotional Response**: Professional mysticism with dark, atmospheric tones
- **Design Personality**: Elegant, mysterious, cutting-edge
- **Visual Metaphors**: Eldritch magic, ancient tomes, mystical energy
- **Simplicity Spectrum**: Clean interface with rich functionality

### Color Strategy
- **Color Scheme Type**: Custom mystical palette
- **Primary Color**: Deep mystical green (oklch(0.35 0.15 150))
- **Secondary Colors**: Dark blues and teals for depth
- **Accent Color**: Bright mystical green (oklch(0.65 0.25 145))
- **Background**: Very dark blue-black (oklch(0.12 0.02 200))
- **Foreground**: Light mystical gray (oklch(0.92 0.02 180))

### Typography System
- **Font Pairing Strategy**: Serif headings (Crimson Text) with sans-serif body (Inter)
- **Monospace**: JetBrains Mono for stats and code-like content
- **Typographic Hierarchy**: Clear distinction between headers, body text, and UI elements

### Component Selection
- **shadcn/ui Components**: Tabs, Cards, Buttons, Select dropdowns, Checkboxes, Badges
- **Icons**: Phosphor Icons for consistent iconography
- **Layout**: Grid-based responsive design with proper spacing

## Technical Implementation
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with custom theme variables
- **State Management**: React hooks for local state
- **Data Persistence**: Browser localStorage for character data
- **Build Tool**: Vite for fast development and building

## Character Generator Features
1. **Build Philosophies**: Balanced, Hybrid, Specialist approaches
2. **Rookie Profiles**: Special level 1 character creation modes
3. **Rule Enforcement**: Soft caps and level-appropriate restrictions
4. **Comprehensive Output**: Full character sheets with weaknesses analysis
5. **Export Options**: Markdown export and clipboard copy

## Battle Management Features
1. **Initiative Tracking**: Automatic phase calculation based on prowess
2. **Combatant Management**: Support for PCs, NPCs, and QSB creatures
3. **Defense Pool Tracking**: Real-time HP management
4. **Turn Order**: Automatic sorting by battle phase

## Encounter Generation Features
1. **Party Configuration**: Variable party size and defense levels
2. **Difficulty Scaling**: Six difficulty tiers from Easy to Deadly
3. **Creature Variety**: Multiple threat types and natures
4. **Balance Analysis**: Automatic threat score calculations

## Future Enhancements
1. **Spell Database**: Complete spell reference with search and filtering
2. **Campaign Tools**: Session notes and world-building aids
3. **Character Vault**: Persistent character storage and management
4. **Rules Reference**: Quick access to game mechanics
5. **Digital Dice**: Integrated dice rolling with modifier support