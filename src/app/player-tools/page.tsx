import Link from 'next/link';
import ContentBox from '@/components/ContentBox';

const playerResources = [
  {
    title: 'Character Toolkit',
    description:
      'Build and maintain your Eldritch heroes with streamlined creation tools and shared rosters for your party.',
    links: [
      { href: '/character-generator?from=player-tools', label: 'Random PC Generator →' },
      { href: '/character-builder?from=player-tools', label: 'Standard Character Generator →' },
      { href: '/roster?from=player-tools', label: 'Character Roster →' }
    ]
  },
  {
    title: 'Spell & Lore Reference',
    description:
      'Keep your spellbooks, equipment options, rules clarifications, and world lore close at hand during every session.',
    links: [
      { href: '/grimoire?from=player-tools', label: 'Grimoire →' },
      { href: '/rules?from=player-tools', label: 'Rules Reference →' },
      { href: '/setting?from=player-tools', label: 'Setting of Ainerêve →' }
    ]
  },
  {
    title: 'Campaign Resources',
    description:
      'Coordinate with your group through shared documentation and manage party folders as your story unfolds.',
    links: [
      { href: '/party-management?from=player-tools', label: 'Party Management →' },
      { href: '/documentation?from=player-tools', label: 'Documentation →' }
    ]
  }
];

export default function PlayerToolsPage() {
  return (
    <div className="container mx-auto px-4 py-8 text-off-white">
      <header className="text-center mb-10">
        <h1 className="text-3xl font-bold text-off-white mb-3">Player Tools</h1>
        <p className="text-lg text-off-white/80">
          Stay prepared for every Eldritch RPG adventure with quick access to character utilities, spell references, and
          campaign coordination aids.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
        {playerResources.map(section => (
          <ContentBox key={section.title} className="flex flex-col h-full">
            <h2 className="text-xl font-bold text-off-white mb-3">{section.title}</h2>
            <p className="text-off-white/80 mb-4 flex-grow">{section.description}</p>
            <div className="space-y-2 mt-auto">
              {section.links.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-muted-eldritch-green hover:text-soft-amethyst font-medium transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </ContentBox>
        ))}
      </div>

      <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-md bg-btn-bg px-5 py-3 text-sm font-semibold text-off-white shadow-md transition-colors hover:bg-btn-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-soft-amethyst"
        >
          Back to Home
        </Link>
        <Link
          href="/gm-tools"
          className="inline-flex items-center justify-center rounded-md border border-muted-eldritch-green/50 bg-charcoal-violet/70 px-5 py-3 text-sm font-semibold text-muted-eldritch-green shadow-sm transition-colors hover:border-muted-eldritch-green hover:text-off-white focus:outline-none focus-visible:ring-2 focus-visible:ring-muted-eldritch-green"
        >
          Explore GM Tools
        </Link>
      </div>
    </div>
  );
}
