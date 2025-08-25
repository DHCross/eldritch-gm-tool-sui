# Eldritch RPG Tool Suite - Product Requirements Document

## Core Purpose & Success

**Mission Statement**: A comprehensive web-based tool suite that empowers Game Masters and Players with beautiful, functional character generators, encounter builders, and game mechanics calculators for the Eldritch RPG system.

**Success Indicators**: 
- GM tools generate balanced encounters and NPCs quickly
- Player character generation follows complex rule validation
- Battle tracking manages initiative and combatant states effectively
- All tools integrate seamlessly with Eldritch RPG mechanics

**Experience Qualities**: Professional, Mystical, Intuitive

## Project Classification & Approach

**Complexity Level**: Complex Application (advanced functionality, multiple interconnected tools)
**Primary User Activity**: Creating (characters, encounters, monsters) and Managing (battle states, character stats)

## Essential Features

### Game Master Tools
1. **Encounter Generator**: Creates balanced encounters based on party size, defense level, and difficulty
2. **NPC Generator**: Generates detailed NPCs with full character sheets and background
3. **Battle Calculator/Initiative Tracker**: Manages turn order, damage tracking, and combat state
4. **Monster Generator**: Creates individual monsters with threat dice, HP, and special abilities

### Player Tools
1. **Player Character Generator**: Advanced character creation with build styles, rookie profiles, and validation
2. **Spell Reference**: Searchable spell database with filtering and detailed descriptions

## Design Direction

### Visual Tone & Identity
**Emotional Response**: Mysterious yet approachable, professional with mystical undertones
**Design Personality**: Dark, elegant, cutting-edge with mystical themes
**Visual Metaphors**: Ancient tomes, arcane symbols, shadowy depths
**Simplicity Spectrum**: Rich interface that serves complex game mechanics

### Color Strategy
**Color Scheme Type**: Custom mystical palette
**Primary Color**: Deep mystical green (`oklch(0.35 0.15 150)`) - represents arcane energy
**Secondary Colors**: Dark blues and purples for depth
**Accent Color**: Bright mystical green (`oklch(0.65 0.25 145)`) for important actions
**Background**: Very dark (`oklch(0.12 0.02 200)`) to create mystical atmosphere

### Typography System
**Font Pairing Strategy**: 
- Headings: Crimson Text (serif) for elegance and readability
- Body: Inter (sans-serif) for clean functionality
- Monospace: JetBrains Mono for code/stats

## UI Components & Implementation

### Component Selection
- Shadcn v4 components for consistent, modern interface
- Radix UI primitives for accessibility
- Tailwind CSS for styling
- Tabs for organizing tool categories
- Cards for content sections
- Forms with proper validation

### Interactive Elements
- Two-tier tab navigation (GM/Player -> specific tools)
- Real-time form validation
- Toast notifications for user feedback
- Markdown export functionality
- Clipboard integration

## Technical Implementation

### Data Management
- useKV for persistent data (character builds, saved encounters)
- Regular React state for UI interactions
- Complex validation systems for character generation
- Encounter balancing algorithms

### Core Mechanics Integration
- Threat dice calculations
- Defense pool computations
- Character point validation
- Level advancement tracking
- Spell rarity and potency systems

## Accessibility & Usability

- WCAG AA contrast compliance
- Keyboard navigation support
- Screen reader compatibility
- Clear visual hierarchy
- Responsive design for all devices

## Success Metrics

- Tools generate mechanically valid content
- User interface remains intuitive despite complexity
- No mechanical errors in calculations
- Smooth workflow for both GMs and players