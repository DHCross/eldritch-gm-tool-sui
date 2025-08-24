# Planning Guide

## Core Purpose & Success
- **Mission Statement**: Provide comprehensive digital tools for Game Masters and Players to enhance their Eldritch RPG gaming experience.
- **Success Indicators**: GMs can quickly generate encounters, NPCs, and manage battle calculations while Players can create detailed characters with proper spell selection.
- **Experience Qualities**: Professional, Efficient, Mystical

## Project Classification & Approach
- **Complexity Level**: Complex Application (advanced functionality, multiple tools with sophisticated calculations)
- **Primary User Activity**: Creating, Acting, Interacting

## Thought Process for Feature Selection
- **Core Problem Analysis**: Eldritch RPG requires complex calculations for character generation, encounter balance, and battle management that are time-consuming to do manually.
- **User Context**: Used during game preparation and active gameplay sessions where speed and accuracy are crucial.
- **Critical Path**: Navigate to tool → Configure parameters → Generate/Calculate results → Export/Use results
- **Key Moments**: Tool selection, parameter configuration, result generation

## Essential Features

### Game Master Tools
- **Encounter Generator**: Generates balanced encounters with detailed monster stats, threat calculations, and creature tropes
- **NPC Generator**: Creates complete NPCs with abilities, equipment, and optional magical items
- **Battle Calculator**: Manages combat initiative, tracks combatant status, and calculates battle phases
- **Monster Generator**: Calculates monster hit points, defense pools, and provides stat blocks

### Player Tools  
- **Character Generator**: Creates complete player characters with proper ability distribution, spell selection, and equipment
- **Spell Reference**: Browse and search spells by path, rarity, and effect type

## Design Direction

### Visual Tone & Identity
- **Emotional Response**: Professional confidence with mystical atmosphere
- **Design Personality**: Modern, clean interface with subtle mystical/eldritch theming
- **Visual Metaphors**: Dark mystical themes with green accent colors suggesting arcane energy
- **Simplicity Spectrum**: Clean interface that organizes complex information clearly

### Color Strategy
- **Color Scheme Type**: Dark theme with mystical accents
- **Primary Color**: Deep mystical green (oklch(0.35 0.15 150)) representing arcane energy
- **Secondary Colors**: Dark blues and grays for backgrounds and cards
- **Accent Color**: Bright mystical green (oklch(0.65 0.25 145)) for active states and highlights
- **Color Psychology**: Dark colors create immersion while green suggests magical energy and growth
- **Color Accessibility**: High contrast maintained throughout with WCAG AA compliance
- **Foreground/Background Pairings**: 
  - Light gray text on dark backgrounds
  - White text on primary color backgrounds
  - Dark text on accent color backgrounds

### Typography System
- **Font Pairing Strategy**: Crimson Text for headings (serif, authoritative) with Inter for body text (clean, readable)
- **Typographic Hierarchy**: Clear distinction between tool titles, section headers, and content text
- **Font Personality**: Professional yet approachable with subtle elegance
- **Readability Focus**: Generous line spacing and appropriate sizing for game table use
- **Typography Consistency**: Consistent heading styles and text treatments throughout
- **Which fonts**: Crimson Text for headings, Inter for body text, JetBrains Mono for code/stats
- **Legibility Check**: All fonts tested for readability in low-light gaming environments

### Visual Hierarchy & Layout
- **Attention Direction**: Tab structure guides users to appropriate tools, then form-to-results flow
- **White Space Philosophy**: Generous spacing between sections for clarity and reduced cognitive load
- **Grid System**: Responsive grid layouts that adapt from desktop to tablet use
- **Responsive Approach**: Mobile-friendly but optimized for desktop gaming sessions
- **Content Density**: Balanced information density with clear visual groupings

### Animations
- **Purposeful Meaning**: Subtle transitions reinforce tool selection and state changes
- **Hierarchy of Movement**: Tab transitions and content reveals guide attention
- **Contextual Appropriateness**: Minimal, professional animations that don't distract from gaming

### UI Elements & Component Selection
- **Component Usage**: Shadcn components for consistency (Cards, Tabs, Buttons, Select, Sliders)
- **Component Customization**: Custom dark theme with mystical green accents
- **Component States**: Clear hover, active, and focus states for all interactive elements
- **Icon Selection**: Phosphor icons for clear, modern iconography
- **Component Hierarchy**: Primary tools clearly distinguished from secondary options
- **Spacing System**: Consistent Tailwind spacing scale throughout
- **Mobile Adaptation**: Responsive layouts that stack appropriately on smaller screens

### Visual Consistency Framework
- **Design System Approach**: Component-based design with consistent theming
- **Style Guide Elements**: Color system, typography scale, spacing system documented
- **Visual Rhythm**: Consistent card layouts and spacing create predictable patterns
- **Brand Alignment**: Professional tools appearance with subtle mystical theming

### Accessibility & Readability
- **Contrast Goal**: WCAG AA compliance maintained throughout application
- All text maintains appropriate contrast ratios
- Interactive elements have proper focus states
- Clear visual hierarchy for screen readers

## Edge Cases & Problem Scenarios
- **Potential Obstacles**: Complex rule calculations, large data sets, mobile device limitations
- **Edge Case Handling**: Input validation, graceful error handling, responsive design breakpoints
- **Technical Constraints**: Browser compatibility, performance with large encounter generations

## Implementation Considerations
- **Scalability Needs**: Modular component structure allows for additional tools
- **Testing Focus**: Calculation accuracy, user workflow efficiency, responsive behavior
- **Critical Questions**: Are calculations matching game rules? Is information clearly presented?

## Reflection
- This tool suite addresses the specific computational complexity of Eldritch RPG
- The dual GM/Player structure reflects different use cases and needs
- The emphasis on accuracy and speed supports active gameplay scenarios
- Professional appearance builds trust in the calculations and generated content