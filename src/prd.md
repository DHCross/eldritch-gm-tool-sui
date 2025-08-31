# Eldritch RPG Tool Suite - Product Requirements Document

## Core Purpose & Success
- **Mission Statement**: Provide a comprehensive digital toolset for Game Masters and Players of the Eldritch RPG 2nd Edition system
- **Success Indicators**: Tools generate balanced encounters, accurate character builds, and streamline gameplay
- **Experience Qualities**: Professional, mystical, efficient

## Project Classification & Approach
- **Complexity Level**: Light Application (multiple features with persistent state)
- **Primary User Activity**: Creating and Interacting (encounter generation, character creation, battle tracking)

## Thought Process for Feature Selection
- **Core Problem Analysis**: RPG game preparation and session management requires complex calculations and reference materials
- **User Context**: Used during game preparation and live sessions by GMs and players
- **Critical Path**: GM prepares encounters → Players create characters → Battle tracking during play
- **Key Moments**: Encounter generation, character creation, initiative tracking

## Essential Features

### Game Master Tools
- **Encounter Generator**: Balanced encounter creation using official difficulty tables
- **NPC Generator**: Quick NPC creation with varied builds and personalities  
- **Battle Calculator**: Initiative tracking and combat management
- **Monster Generator**: Individual creature stat block creation

### Player Tools
- **Character Generator**: Full player character creation with CP tracking
- **Spell Reference**: Searchable spell database by path and rarity

## Design Direction

### Visual Tone & Identity
- **Emotional Response**: Professional mysticism, arcane knowledge, organized power
- **Design Personality**: Elegant, mysterious, scholarly with subtle magical elements
- **Visual Metaphors**: Ancient tomes, mystical energies, crystalline structures
- **Simplicity Spectrum**: Clean interface with rich functionality beneath

### Color Strategy
- **Color Scheme Type**: Analogous (dark blues, teals, greens with mystical accents)
- **Primary Color**: Deep mystical teal (oklch(0.35 0.15 150)) - represents arcane knowledge
- **Secondary Colors**: Dark slate blue for supporting elements
- **Accent Color**: Bright mystical green (oklch(0.65 0.25 145)) for interactive elements
- **Color Psychology**: Dark, mysterious base with bright accent suggests hidden knowledge made accessible
- **Foreground/Background Pairings**: 
  - Light text (oklch(0.92 0.02 180)) on dark background (oklch(0.12 0.02 200))
  - Dark text (oklch(0.15 0.02 180)) on bright accent (oklch(0.65 0.25 145))
  - All pairings exceed WCAG AA contrast ratios

### Typography System
- **Font Pairing Strategy**: Serif headings (Crimson Text) for gravitas, sans-serif body (Inter) for clarity
- **Typographic Hierarchy**: Clear distinction between tool titles, section headers, and data
- **Font Personality**: Scholarly authority with modern accessibility
- **Which fonts**: Crimson Text for headings, Inter for body text, JetBrains Mono for code/stats
- **Legibility Check**: All fonts tested for clarity at various sizes

### Visual Hierarchy & Layout
- **Attention Direction**: Top-level tool selection → configuration options → generated results
- **White Space Philosophy**: Generous spacing to prevent information overload
- **Grid System**: Responsive grid adapting from single column to multi-column layouts
- **Component Hierarchy**: Cards for major sections, badges for status, tables for data

### Animations
- **Purposeful Meaning**: Subtle fade-ins for generated content, smooth transitions between tools
- **Hierarchy of Movement**: Primary focus on content generation feedback
- **Contextual Appropriateness**: Minimal, professional animations that don't distract from complex data

### UI Elements & Component Selection
- **Component Usage**: Shadcn components for consistency (Cards, Buttons, Sliders, Tables)
- **Component States**: Clear hover, active, and disabled states for all interactive elements
- **Icon Selection**: Phosphor icons for their clarity and mystical aesthetic options
- **Spacing System**: Consistent 4px grid system using Tailwind's spacing scale

### Accessibility & Readability
- **Contrast Goal**: WCAG AA compliance achieved with current color scheme
- **Keyboard Navigation**: Full keyboard accessibility for all interactive elements
- **Screen Reader Support**: Proper semantic HTML and ARIA labels

## Implementation Considerations
- **Scalability Needs**: Modular component structure allows easy addition of new tools
- **State Management**: React state with potential for localStorage persistence
- **Performance**: Efficient algorithms for encounter generation and character building

## Technical Architecture
- **Framework**: React with TypeScript for type safety
- **Styling**: Tailwind CSS with custom theme variables
- **Components**: Shadcn/ui component library for consistency
- **Build Tool**: Vite for fast development and building

## Current Implementation Status

### ✅ Completed Features
- **Encounter Generator**: Full implementation with party settings, difficulty calculation, and creature generation
- **Base UI Structure**: Two-tier navigation (GM/Player → specific tools)
- **Theme System**: Custom Eldritch color scheme with proper contrast
- **Component Foundation**: Reusable UI components with consistent styling

### 🚧 In Progress Features
- Battle Calculator (initiative tracking)
- Character Generator (player creation)
- Monster Generator (individual creatures)
- NPC Generator (quick NPCs)
- Spell Reference (searchable database)

### 📋 Planned Enhancements
- Data persistence between sessions
- Export functionality for generated content
- Advanced filtering and search capabilities
- Custom creature/character templates