# Eldritch RPG Tool Suite - Product Requirements Document

## Core Purpose & Success

- **Mission Statement**: A comprehensive digital toolset for Game Masters and Players of Eldritch RPG, providing essential gameplay utilities in an elegant, mystical interface.
- **Success Indicators**: Streamlined encounter creation, efficient character generation, accurate battle tracking, and quick reference lookup - all improving game flow and reducing prep time.
- **Experience Qualities**: Mystical, Professional, Efficient

## Project Classification & Approach

- **Complexity Level**: Light Application (multiple features with organized state management)
- **Primary User Activity**: Acting and Creating (generating content, calculating values, managing game state)

## Thought Process for Feature Selection

- **Core Problem Analysis**: Game Masters and Players need quick, accurate tools for Eldritch RPG's unique mechanics and complex character creation system.
- **User Context**: Used during game preparation and active play sessions, requiring fast access and clear results.
- **Critical Path**: Select tool type → Configure parameters → Generate/Calculate → Use results in game
- **Key Moments**: 
  1. Generating balanced encounters that challenge without overwhelming
  2. Creating detailed characters that follow complex rule interactions
  3. Managing combat flow with accurate calculations

## Essential Features

### Game Master Tools
- **Encounter Generator**: Creates balanced encounters based on party composition and desired difficulty
- **NPC Generator**: Generates detailed non-player characters with full stat blocks
- **Battle Calculator**: Manages combat initiative, damage tracking, and status effects  
- **Monster HP Calculator**: Calculates hit points based on creature attributes

### Player Tools
- **Character Generator**: Creates detailed player characters following official creation rules
- **Spell Reference**: Quick lookup for spell mechanics, potency, and failure consequences

Each tool validates inputs, provides clear feedback, and generates professional output suitable for immediate game use.

## Design Direction

### Visual Tone & Identity
- **Emotional Response**: Mystical sophistication that evokes arcane knowledge and professional gaming tools
- **Design Personality**: Dark, mystical, yet clean and functional - like a well-organized wizard's grimoire
- **Visual Metaphors**: Ancient tome aesthetics with modern usability
- **Simplicity Spectrum**: Clean interface with rich functionality beneath

### Color Strategy
- **Color Scheme Type**: Analogous with mystical accent
- **Primary Color**: Deep mystical green (oklch(0.35 0.15 150)) - representing arcane energy
- **Secondary Colors**: Dark blues and teals for depth and mystery
- **Accent Color**: Bright mystical green (oklch(0.65 0.25 145)) for highlights and active states
- **Color Psychology**: Dark backgrounds reduce eye strain during long sessions, green accents suggest magical energy
- **Color Accessibility**: High contrast ratios maintained throughout, colorblind-friendly palette

### Typography System
- **Font Pairing Strategy**: Serif headings for classical feel, sans-serif body for readability
- **Primary Font**: Crimson Text for headers - elegant, readable serif suggesting scholarly texts
- **Body Font**: Inter for interface elements - clean, modern sans-serif optimizing legibility
- **Monospace Font**: JetBrains Mono for stat blocks and technical data
- **Typography Consistency**: Clear hierarchy with distinct weights and sizes for different content levels

### Visual Hierarchy & Layout
- **Attention Direction**: Tab-based navigation guides users to appropriate tool sections
- **White Space Philosophy**: Generous spacing prevents information overload during intense gaming sessions
- **Grid System**: Responsive grid adapts from desktop to mobile while maintaining functionality
- **Content Density**: Balanced information richness with visual clarity

### Animations
- **Purposeful Meaning**: Subtle transitions enhance navigation feedback without distraction
- **Hierarchy of Movement**: Tab switches and state changes receive priority animation attention
- **Contextual Appropriateness**: Minimal, professional animations that enhance rather than entertain

### UI Elements & Component Selection
- **Component Usage**: 
  - Cards for tool sections and results display
  - Tabs for primary navigation between GM/Player tools
  - Sliders for numeric input ranges (encounter difficulty, party size)
  - Checkboxes for feature toggles
  - Select dropdowns for categorical choices
- **Component Customization**: Shadcn components styled with mystical theme colors
- **Component States**: Clear hover, focus, and active states with mystical accent highlighting
- **Icon Selection**: Phosphor icons provide consistent, scalable symbols for tool categories
- **Spacing System**: Consistent padding using Tailwind's spacing scale
- **Mobile Adaptation**: Responsive layouts stack vertically on smaller screens with maintained functionality

### Visual Consistency Framework
- **Design System Approach**: Component-based design with consistent styling across all tools
- **Style Guide Elements**: Unified color palette, typography scale, spacing system, and icon usage
- **Visual Rhythm**: Consistent card layouts, button styles, and navigation patterns
- **Brand Alignment**: Mystical RPG aesthetic balanced with professional tool functionality

### Accessibility & Readability
- **Contrast Goal**: WCAG AA compliance maintained across all text and interactive elements
- **Keyboard Navigation**: Full functionality accessible via keyboard navigation
- **Screen Reader Support**: Proper semantic markup and ARIA labels for assistive technology

## Edge Cases & Problem Scenarios
- **Invalid Input Handling**: Clear validation messages guide users to correct inputs
- **Complex Character Builds**: Character generator handles intricate race/class combinations and minimum requirements
- **Large Encounters**: Encounter generator scales appropriately for parties of various sizes
- **Mobile Usage**: Responsive design maintains functionality on smaller screens

## Implementation Considerations
- **Scalability Needs**: Modular component structure allows easy addition of new tools
- **Data Management**: Game rules stored in centralized data files for easy updates
- **Performance**: Efficient calculations and minimal re-renders for smooth user experience

## Reflection
This tool suite uniquely serves the Eldritch RPG community by combining comprehensive rule implementation with an intuitive, mystical interface. The dual GM/Player structure addresses different user needs while maintaining design consistency. The focus on accurate calculations and clear presentation makes complex game mechanics accessible without sacrificing depth.