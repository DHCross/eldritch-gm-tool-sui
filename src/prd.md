# Eldritch RPG Tool Suite - Product Requirements Document

## Core Purpose & Success
- **Mission Statement**: A comprehensive digital toolkit for the Eldritch RPG system that empowers Game Masters and Players with efficient, accurate, and beautifully designed generators and calculators.
- **Success Indicators**: Reduced prep time for GMs, accurate rule implementation, intuitive user experience, and increased table engagement.
- **Experience Qualities**: Mystical, Professional, Efficient

## Project Classification & Approach
- **Complexity Level**: Light Application (multiple features with basic state)
- **Primary User Activity**: Creating and Acting (generating content for RPG sessions)

## Essential Features

### Game Master Tools
1. **Encounter Generator**: Creates balanced encounters with threat calculations, creature types, and environmental factors
2. **NPC Generator**: Generates detailed NPCs with abilities, equipment, and background elements
3. **Battle Calculator**: Manages initiative, hit points, and combat state tracking
4. **Monster Generator**: Creates detailed monster stat blocks with proper threat calculations

### Player Tools
1. **Player Character Generator**: Full character creation following Eldritch RPG rules with CP tracking
2. **Spell Reference**: Searchable spell database with filtering and detailed descriptions

## Design Direction

### Visual Tone & Identity
- **Emotional Response**: Users should feel immersed in a mystical, scholarly atmosphere while maintaining modern usability
- **Design Personality**: Elegant and mystical with clean, professional interface elements
- **Visual Metaphors**: Ancient tomes, arcane symbols, scholarly instruments
- **Simplicity Spectrum**: Clean interface with rich functionality hidden in progressive disclosure

### Color Strategy
- **Color Scheme Type**: Custom mystical palette
- **Primary Color**: Deep mystical green (oklch(0.35 0.15 150)) - represents arcane knowledge and nature
- **Secondary Colors**: Dark blue-grays for structure and reliability
- **Accent Color**: Bright mystical green (oklch(0.65 0.25 145)) for interactive elements
- **Color Psychology**: Dark backgrounds evoke mystery and focus, green accents suggest magic and growth
- **Foreground/Background Pairings**: 
  - Background (dark): White/light gray text (high contrast)
  - Card (medium dark): Light gray text
  - Primary (mystical green): White text
  - Accent (bright green): Dark text

### Typography System
- **Font Pairing Strategy**: Crimson Text for headings (classical, scholarly) with Inter for body text (modern, readable)
- **Typographic Hierarchy**: Clear distinction between titles, sections, and body content
- **Font Personality**: Scholarly yet approachable, mystical but not archaic
- **Which fonts**: Crimson Text for headings, Inter for body text, JetBrains Mono for code/stats

### UI Elements & Component Selection
- **Component Usage**: Shadcn components for consistency - Tabs for navigation, Cards for content sections, Forms for generators
- **Component Hierarchy**: Primary tabs for GM/Player separation, secondary tabs for specific tools
- **Spacing System**: Generous padding and margins using Tailwind's spacing scale
- **Mobile Adaptation**: Responsive grid layouts that stack vertically on smaller screens

### Accessibility & Readability
- **Contrast Goal**: WCAG AA compliance with high contrast ratios for all text elements

## Implementation Considerations
- **Scalability Needs**: Modular component structure allows for easy addition of new tools
- **State Management**: useKV for persistent data like saved characters, regular state for temporary UI state
- **Rule Accuracy**: All generators must accurately implement Eldritch RPG mechanics and tables