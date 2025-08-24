# Eldritch GM Tool Suite - Product Requirements Document

A comprehensive digital toolkit for game masters running tabletop RPG sessions, specifically designed for the Eldritch RPG system.

**Experience Qualities**: 
1. **Intuitive** - Tools should feel natural to use during active gameplay sessions
2. **Efficient** - Quick generation and calculation without interrupting game flow  
3. **Immersive** - Dark, mystical aesthetic that matches the Eldritch fantasy setting

**Complexity Level**: Light Application (multiple features with basic state)
- Multiple interconnected tools that share common RPG mechanics and data structures, with persistent character and encounter data

## Essential Features

### Encounter Generator
- **Functionality**: Generates balanced encounters based on party composition and desired difficulty
- **Purpose**: Saves GMs time creating appropriate challenges for their players
- **Trigger**: GM selects party size, defense level, difficulty, and creature preferences
- **Progression**: Configure party parameters → Set encounter preferences → Generate → Review creature stats and tactics
- **Success criteria**: Produces mathematically balanced encounters with varied creature types and clear stat blocks

### Character Generator  
- **Functionality**: Creates complete NPCs or player characters with full stat blocks, equipment, and abilities
- **Purpose**: Rapidly generates characters for gameplay without manual calculation
- **Trigger**: Select race, class, level, and optional magical items
- **Progression**: Choose character basics → System generates optimized stats → Review/export character sheet
- **Success criteria**: Produces rules-compliant characters with balanced abilities and appropriate equipment

### Battle Calculator
- **Functionality**: Manages initiative order and tracks combatant status during fights
- **Purpose**: Streamlines combat management and reduces bookkeeping
- **Trigger**: Add combatants with their prowess dice and defense pools
- **Progression**: Add all combatants → System sorts by initiative → Track damage and status → Mark defeated
- **Success criteria**: Clear turn order display with easy stat tracking and status updates

### Monster HP Calculator
- **Functionality**: Calculates hit points for creatures based on threat level, size, and nature
- **Purpose**: Ensures consistent monster durability across encounters
- **Trigger**: Select monster attributes and threat tiers
- **Progression**: Choose size/nature → Set threat dice → Calculate → Apply to encounter
- **Success criteria**: Generates appropriate HP values with clear threat assessment

## Edge Case Handling
- **Empty Selections**: Validate all required fields before generation with helpful error messages
- **Invalid Combinations**: Prevent impossible character builds or encounter configurations
- **Large Numbers**: Handle high-level characters and massive encounters gracefully
- **Data Persistence**: Save generated content between sessions using local storage
- **Export Failures**: Provide fallback options for character sheet export

## Design Direction
The interface should evoke the mysterious, arcane atmosphere of fantasy RPGs - dark and atmospheric while remaining highly functional for active gameplay use. Minimal interface with focus on data clarity and quick access to tools.

## Color Selection
Analogous color scheme using deep teals, forest greens, and dark blues to create a mystical, arcane feeling that's easy on the eyes during long gaming sessions.

- **Primary Color**: Deep forest green (oklch(0.35 0.15 150)) - communicates nature magic and ancient knowledge
- **Secondary Colors**: Dark teal (oklch(0.25 0.12 180)) for supporting elements and muted sage (oklch(0.45 0.08 140)) for less prominent areas  
- **Accent Color**: Bright arcane green (oklch(0.65 0.25 145)) for CTAs and important interactive elements
- **Foreground/Background Pairings**: 
  - Background (Dark slate oklch(0.12 0.02 200)): Light text (oklch(0.92 0.02 180)) - Ratio 15.8:1 ✓
  - Card (Charcoal oklch(0.18 0.03 190)): Light text (oklch(0.92 0.02 180)) - Ratio 12.1:1 ✓  
  - Primary (Deep green oklch(0.35 0.15 150)): White text (oklch(1 0 0)) - Ratio 8.9:1 ✓
  - Accent (Bright green oklch(0.65 0.25 145)): Dark text (oklch(0.15 0.02 180)) - Ratio 11.2:1 ✓

## Font Selection
Typography should convey both mystical knowledge and technical precision - using a clean serif for headings to suggest ancient tomes, and a readable sans-serif for data display.

- **Typographic Hierarchy**: 
  - H1 (App Title): Crimson Text Bold/32px/tight spacing - evokes grimoire aesthetics
  - H2 (Tool Sections): Crimson Text Semibold/24px/normal spacing  
  - Body Text: Inter Regular/16px/relaxed spacing - optimal for data reading
  - Data Display: JetBrains Mono Regular/14px/monospace for stat blocks
  - UI Labels: Inter Medium/14px/normal spacing

## Animations
Subtle mystical touches that enhance functionality without distraction - gentle fades and soft transitions that feel like pages turning in an ancient tome.

- **Purposeful Meaning**: Soft fade-ins when generating content suggest magical manifestation, while smooth transitions between tools maintain immersion
- **Hierarchy of Movement**: Primary focus on generated content appearing, secondary on tool switching, minimal on form interactions

## Component Selection
- **Components**: Tabs for tool navigation, Cards for generated content display, Forms for input configuration, Dialogs for export options, Sliders for numerical ranges, Buttons with distinct primary/secondary styling
- **Customizations**: Custom slider components with arcane-styled thumbs, specialized stat block displays for character sheets, tabular layout for encounter lists
- **States**: Buttons show clear hover/active states with subtle glow effects, form inputs highlight focus with accent color, disabled states use muted colors
- **Icon Selection**: Phosphor icons - dice for randomization, sword for combat, book for knowledge, settings for configuration
- **Spacing**: Consistent 1rem base spacing using Tailwind scale, generous padding in cards for readability
- **Mobile**: Stack tool tabs vertically, collapse complex forms into progressive disclosure, ensure touch targets meet minimum 44px requirement