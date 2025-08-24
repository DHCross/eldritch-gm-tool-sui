# Eldritch GM Tool Suite - Product Requirements Document

## Core Purpose & Success
- **Mission Statement**: Provide Game Masters and players with comprehensive digital tools for running and playing the Eldritch RPG 2nd Edition.
- **Success Indicators**: GMs can efficiently generate encounters, manage combat, and reference game rules. Players can create and manage characters seamlessly.
- **Experience Qualities**: Professional, mystical, efficient

## Project Classification & Approach
- **Complexity Level**: Light Application (multiple features with basic state)
- **Primary User Activity**: Creating and managing game content (encounters, characters, reference materials)

## Thought Process for Feature Selection
- **Core Problem Analysis**: GMs need quick access to generators and calculators for running Eldritch RPG games effectively
- **User Context**: Used during game preparation and live gameplay sessions
- **Critical Path**: Quick access to tools → Generate/calculate content → Export/copy results
- **Key Moments**: Character generation, encounter creation, combat management

## Essential Features

### Encounter Generator
- **What it does**: Generates balanced encounters based on party composition and difficulty
- **Why it matters**: Saves GMs significant preparation time and ensures balanced gameplay
- **Success criteria**: Produces mathematically sound encounters with appropriate threat values

### Character Generators
- **What it does**: Two-tier character generation (quick NPC generation and full player character creation)
- **Why it matters**: Supports both quick NPC creation and detailed player character building
- **Success criteria**: Characters follow game rules precisely and can be exported for use

### Player Character Generator
- **What it does**: Full featured character creation following player creation rules with CP tracking
- **Why it matters**: Allows players to create characters that follow the exact character point spending rules
- **Success criteria**: Accurate CP calculations, proper minimums application, and comprehensive character sheets

### Battle Calculator
- **What it does**: Manages initiative order and tracks combat statistics
- **Why it matters**: Streamlines combat management during play
- **Success criteria**: Accurate initiative tracking and easy stat management

### Monster HP Calculator
- **What it does**: Calculates monster hit points based on size, nature, and threat dice
- **Why it matters**: Ensures monsters have appropriate durability for encounters
- **Success criteria**: Accurate HP calculations following game formulas

### Spell Reference
- **What it does**: Displays spell mechanics tables and reference information
- **Why it matters**: Quick access to spell rules during gameplay
- **Success criteria**: Complete and accurate spell system information

## Design Direction

### Visual Tone & Identity
- **Emotional Response**: Professional confidence with mystical atmosphere
- **Design Personality**: Clean, modern interface with subtle dark/mystical theming
- **Visual Metaphors**: Arcane grimoire, mystical knowledge
- **Simplicity Spectrum**: Clean and functional with atmospheric touches

### Color Strategy
- **Color Scheme Type**: Monochromatic with mystical accents
- **Primary Color**: Deep mystical green (oklch(0.35 0.15 150)) - represents arcane knowledge
- **Secondary Colors**: Dark blues and purples for depth
- **Accent Color**: Bright mystical green (oklch(0.65 0.25 145)) for highlights and important actions
- **Color Psychology**: Dark colors create focus and mystical atmosphere, bright accents guide attention

### Typography System
- **Font Pairing Strategy**: Crimson Text for headings (scholarly, readable serif) with Inter for body text (clean, modern sans-serif)
- **Typographic Hierarchy**: Clear distinction between headings, subheadings, and body text
- **Font Personality**: Professional and scholarly with excellent readability
- **Which fonts**: Crimson Text for headings, Inter for body text, JetBrains Mono for code/stats

### UI Elements & Component Selection
- **Component Usage**: Cards for tool sections, tabs for navigation, buttons for actions
- **Component States**: Clear hover and active states on all interactive elements
- **Icon Selection**: Phosphor icons for consistent, clean iconography
- **Spacing System**: Consistent padding using Tailwind's spacing scale

### Accessibility & Readability
- **Contrast Goal**: WCAG AA compliance with high contrast ratios
- **Foreground/Background Pairings**: Light text on dark backgrounds with sufficient contrast

## Implementation Considerations
- **Scalability Needs**: Modular component structure allows for easy addition of new tools
- **Testing Focus**: Accurate mathematical calculations and data export functionality
- **Critical Questions**: How to balance feature richness with performance and usability

## Reflection
This tool suite serves the specific needs of the Eldritch RPG community by providing purpose-built digital tools that complement the tabletop experience. The dark, mystical theme reinforces the game's atmosphere while maintaining professional functionality.