import Link from 'next/link';
import { FeatureCard } from '@/components/FeatureCard';

const playerFeatures = [
  {
    icon: '🛠️',
    title: 'Character Creation',
    description: 'Build new heroes and keep their sheets updated in one place.',
    links: [
      { href: '/character-generator', label: 'Character Generator →' },
      { href: '/roster', label: 'Character Roster →' },
    ],
  },
  {
    icon: '🤝',
    title: 'Party Dashboard',
    description: 'Coordinate tactics, track resources, and share discoveries with your team.',
    links: [{ href: '/party-management', label: 'Open Party Management →' }],
  },
  {
    icon: '📖',
    title: 'Spell & Ritual Library',
    description: 'Browse every spell, ritual, and magical effect your character can learn.',
    links: [{ href: '/grimoire', label: 'Explore the Grimoire →' }],
  },
  {
    icon: '⚖️',
    title: 'Rules Reference',
    description: 'Quick rulings, condition summaries, and core mechanics at your fingertips.',
    links: [{ href: '/rules', label: 'Consult the Rules →' }],
  },
  {
    icon: '🐾',
    title: 'Field Guide',
    description: 'Study known creatures, weaknesses, and lore before the next expedition.',
    links: [{ href: '/bestiary', label: 'Review the Bestiary →' }],
  },
  {
    icon: '🧭',
    title: 'Player Documentation',
    description: 'Access campaign notes, house rules, and onboarding guides.',
    links: [{ href: '/documentation', label: 'Read the Documentation →' }],
  },
];

export default function PlayerTools() {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Player Tool Suite</h1>
        <p className="text-lg text-gray-600">
          Essential resources to prepare, play, and excel in Eldritch RPG adventures
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {playerFeatures.map((feature) => (
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
