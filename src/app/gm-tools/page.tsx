import Link from 'next/link';
import { FeatureCard } from '@/components/FeatureCard';

const gmFeatures = [
  {
    icon: '⚔️',
    title: 'Encounter Generator',
    description: 'Create balanced encounters with detailed statistics.',
    links: [{ href: '/encounter-generator', label: 'Generate Encounters →' }],
  },
  {
    icon: '👤',
    title: 'Character Tools',
    description: 'Generate and manage player characters.',
    links: [
      { href: '/character-generator', label: 'Character Generator →' },
      { href: '/roster', label: 'Character Roster →' },
    ],
  },
  {
    icon: '🧙',
    title: 'NPC Tools',
    description: 'Create and organize non-player characters.',
    links: [
      { href: '/npc-generator', label: 'NPC Generator →' },
      { href: '/npc-roster', label: 'NPC Roster →' },
    ],
  },
  {
    icon: '👹',
    title: 'Monster Tools',
    description: 'Generate creatures and manage bestiary.',
    links: [
      { href: '/monster-generator', label: 'Monster Generator →' },
      { href: '/monster-roster', label: 'Monster Roster →' },
    ],
  },
  {
    icon: '⚡',
    title: 'Battle Calculator',
    description: 'Track combat and manage battle phases.',
    links: [{ href: '/battle-calculator', label: 'Battle Calculator →' }],
  },
  {
    icon: '📝',
    title: 'Game Content Parser',
    description:
      'Analyze and validate stat blocks, spells, and magic items for compliance.',
    links: [{ href: '/stat-block-parser', label: 'Parse Game Content →' }],
  },
  {
    icon: '📚',
    title: 'References',
    description: 'Quick access to rules and spell references.',
    links: [
      { href: '/grimoire', label: 'Grimoire →' },
      { href: '/rules', label: 'Rules Reference →' },
    ],
  },
];

export default function GMTools() {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">GM Tool Suite</h1>
        <p className="text-lg text-gray-600">
          All-in-one toolkit for Game Masters running Eldritch RPG campaigns
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {gmFeatures.map((feature) => (
          <FeatureCard key={feature.title} {...feature} />
        ))}
      </div>

      <div className="text-center">
        <Link
          href="/"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
