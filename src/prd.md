# Eldritch RPG GM Tool Suite - Product Requirements Document

## Core Purpose & Success
- **Mission Statement**: A comprehensive digital toolkit for Game Masters running Eldritch RPG 2nd Edition campaigns
- **Success Indicators**: GMs can quickly generate encounters, characters, and manage battles without manual calculations
- **Experience Qualities**: Professional, mystical, efficient

## Project Classification & Approach
- **Complexity Level**: Light Application (multiple features with basic state)
- **Primary User Activity**: Acting (generating game content and managing sessions)

## Essential Features

### Core Tools
1. **Encounter Generator** - Creates balanced encounters based on party composition and difficulty
2. **NPC Generator** - Simplified character creation for non-player characters with iconic items
3. **Player Character Generator** - Full rules implementation for player character creation
4. **Battle Calculator** - Initiative tracking and combat management
5. **Monster HP Calculator** - Quick HP calculation for various monster types
6. **Spell Reference** - Quick lookup for spell information

### NPC Generator Specifics
- Gender selection (including random option)
- Race and role-based ability generation
- Level-appropriate scaling
- Iconic item generation with optional magical properties
- Simplified rules focused on GM usability

## Design Direction

### Visual Tone & Identity
- **Emotional Response**: Professional confidence with mystical atmosphere
- **Design Personality**: Elegant, serious, cutting-edge
- **Visual Metaphors**: Dark mystical themes with green accents
- **Simplicity Spectrum**: Minimal interface with rich content

### Color Strategy
- **Color Scheme Type**: Custom mystical palette
- **Primary Color**: Deep mystical green (oklch(0.35 0.15 150))
- **Secondary Colors**: Dark blues and grays for depth
- **Accent Color**: Bright green for highlights and actions
- **Background**: Very dark blue-black for mystical feel
- **Foreground**: Light gray-white for excellent readability

### Typography System
- **Heading Font**: Crimson Text (serif) for character and mystique
- **Body Font**: Inter (sans-serif) for excellent readability
- **Monospace Font**: JetBrains Mono for code-like elements
- **Hierarchy**: Clear distinction between headings and body text

### UI Elements & Component Selection
- **Component Usage**: Shadcn components for consistency and modern feel
- **Cards**: Primary content containers with subtle shadows
- **Tabs**: Clean navigation between tools
- **Form Controls**: Modern selects, inputs, and checkboxes
- **Buttons**: Clear primary/secondary distinction
- **Icon Integration**: Phosphor icons for visual clarity

## Implementation Considerations
- **Scalability**: Each tool is self-contained for easy maintenance
- **State Management**: Local state with persistent data where needed
- **Performance**: Lightweight calculations suitable for browser execution
- **Cross-platform**: Web-based for universal access

## Technical Architecture
- React with TypeScript for type safety
- Tailwind CSS for styling consistency
- Shadcn components for UI elements
- Local state management for tool isolation
- Toast notifications for user feedback

## Key Differentiators
- **Comprehensive**: Six specialized tools in one application
- **Game-Specific**: Tailored specifically for Eldritch RPG 2nd Edition
- **GM-Focused**: Designed for table-side use during sessions
- **Professional**: Clean, distraction-free interface