# Planning Guide: Eldritch RPG GM Tool Suite

## Core Purpose & Success
- **Mission Statement**: Provide a comprehensive digital toolset for Game Masters running Eldritch RPG sessions, enabling quick character generation, encounter balancing, and campaign management.
- **Success Indicators**: Users can generate balanced encounters, create NPCs and player characters efficiently, manage battle phases, and reference spells seamlessly during gameplay.
- **Experience Qualities**: Professional, Intuitive, Mystical

## Project Classification & Approach
- **Complexity Level**: Light Application (multiple features with basic state)
- **Primary User Activity**: Creating and Managing game content

## Thought Process for Feature Selection
- **Core Problem Analysis**: Game Masters need quick access to character generation, encounter balancing, and reference tools during live gameplay sessions
- **User Context**: Used during active RPG sessions where speed and accuracy are critical
- **Critical Path**: Tool selection → Input parameters → Generate content → Export/use results
- **Key Moments**: Character generation, encounter balancing, spell reference lookup

## Essential Features
- **Encounter Generator**: Creates balanced encounters based on party composition and difficulty
- **NPC Generator**: Generates detailed NPCs with stats, abilities, and equipment
- **Player Character Generator**: Complete character creation following official rules
- **Battle Calculator**: Manages initiative order and combat phases
- **Monster HP Calculator**: Calculates hit points based on creature parameters
- **Spell Reference**: Searchable database of spells with filtering

## Design Direction

### Visual Tone & Identity
- **Emotional Response**: Professional confidence with mystical atmosphere
- **Design Personality**: Elegant and arcane, combining modern UI with fantasy aesthetics
- **Visual Metaphors**: Ancient grimoires, mystical energy, scholarly precision
- **Simplicity Spectrum**: Clean interface with rich functionality

### Color Strategy
- **Color Scheme Type**: Monochromatic with mystical accents
- **Primary Color**: Deep mystical green (oklch(0.35 0.15 150)) - represents arcane knowledge
- **Secondary Colors**: Dark blues and purples for depth and mystery
- **Accent Color**: Bright mystical green (oklch(0.65 0.25 145)) for highlights and actions
- **Color Psychology**: Green conveys wisdom and magic, dark tones suggest depth and mystery
- **Color Accessibility**: High contrast ratios maintained for readability

### Typography System
- **Font Pairing Strategy**: Serif headings (Crimson Text) with clean sans-serif body (Inter)
- **Typographic Hierarchy**: Clear distinction between headers, body text, and data
- **Font Personality**: Scholarly yet approachable, combining tradition with modernity
- **Readability Focus**: Optimized line spacing and font sizes for quick scanning
- **Typography Consistency**: Consistent font weights and sizes across all components

### Visual Hierarchy & Layout
- **Attention Direction**: Tab-based navigation directs users to specific tools
- **White Space Philosophy**: Generous spacing creates calm, focused experience
- **Grid System**: Responsive grid adapts from mobile to desktop
- **Responsive Approach**: Mobile-first design with progressive enhancement
- **Content Density**: Balanced information density for quick reference

### Animations
- **Purposeful Meaning**: Subtle transitions enhance usability without distraction
- **Hierarchy of Movement**: Focus on state changes and feedback
- **Contextual Appropriateness**: Minimal animations to maintain professional feel

### UI Elements & Component Selection
- **Component Usage**: Shadcn/ui components for consistency and accessibility
- **Component Customization**: Custom theming for mystical aesthetic
- **Component States**: Clear hover, active, and disabled states
- **Icon Selection**: Phosphor icons for clean, modern iconography
- **Component Hierarchy**: Primary buttons for generation, secondary for export/copy
- **Spacing System**: Consistent padding and margins using Tailwind spacing
- **Mobile Adaptation**: Responsive breakpoints for optimal mobile experience

### Visual Consistency Framework
- **Design System Approach**: Component-based design with consistent theming
- **Style Guide Elements**: Color palette, typography scale, spacing system
- **Visual Rhythm**: Consistent card layouts and component spacing
- **Brand Alignment**: Mystical theme reinforces RPG context

### Accessibility & Readability
- **Contrast Goal**: WCAG AA compliance for all text and interactive elements

## Edge Cases & Problem Scenarios
- **Potential Obstacles**: Complex character generation rules, spell database size
- **Edge Case Handling**: Validation for all inputs, graceful error handling
- **Technical Constraints**: Browser compatibility, mobile performance

## Implementation Considerations
- **Scalability Needs**: Expandable for additional RPG systems or rule sets
- **Testing Focus**: Character generation accuracy, encounter balance validation
- **Critical Questions**: Rule interpretation accuracy, user workflow efficiency

## Reflection
This approach uniquely combines the depth of tabletop RPG rules with modern web application convenience, making complex game mastering tasks accessible and efficient during live gameplay sessions.