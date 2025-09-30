import Link from 'next/link';

const playerResources = [
  {
    title: 'Character Toolkit',
    description:
      'Build and maintain your Eldritch heroes with streamlined creation tools and shared rosters for your party.',
    links: [
      { href: '/character-generator', label: 'Character Generator →' },
      { href: '/roster', label: 'Character Roster →' }
    ]
  },
  {
    title: 'Spell & Lore Reference',
    description:
      'Keep your spellbooks, equipment options, and rules clarifications close at hand during every session.',
    links: [
      { href: '/grimoire', label: 'Grimoire →' },
      { href: '/rules', label: 'Rules Reference →' }
    ]
  },
  {
    title: 'Campaign Resources',
    description:
      'Coordinate with your group through shared documentation and manage party folders as your story unfolds.',
    links: [
      { href: '/party-management', label: 'Party Management →' },
      { href: '/documentation', label: 'Documentation →' }
    ]
  }
];

export default function PlayerToolsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Player Tools</h1>
        <p className="text-lg text-gray-600">
          Stay prepared for every Eldritch RPG adventure with quick access to character utilities, spell references, and
          campaign coordination aids.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
        {playerResources.map(section => (
          <div key={section.title} className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3">{section.title}</h2>
            <p className="text-gray-600 mb-4">{section.description}</p>
            <div className="space-y-2">
              {section.links.map(link => (
                <Link key={link.href} href={link.href} className="block text-blue-600 hover:text-blue-800 font-medium">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
        <Link
          href="/"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          Back to Home
        </Link>
        <Link
          href="/gm-tools"
          className="bg-white border border-blue-200 text-blue-700 hover:text-blue-900 hover:border-blue-300 font-bold py-2 px-4 rounded transition-colors shadow-sm"
        >
          Explore GM Tools
        </Link>
      </div>
    </div>
  );
}
