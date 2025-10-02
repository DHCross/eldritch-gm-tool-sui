import Link from 'next/link';

type ToolLink = {
  href: string;
  label: string;
};

type ToolSection = {
  title: string;
  description: string;
  primaryCta?: ToolLink;
  secondaryCtas?: ToolLink[];
  links?: ToolLink[];
};

const TOOL_SECTIONS: ToolSection[] = [
  {
    title: '🐉 Bestiary & Monster Library',
    description:
      'Browse the full creature catalog, import stat blocks, and organize your custom monsters alongside official entries.',
    primaryCta: {
      href: '/bestiary?from=gm-tools',
      label: 'Open Bestiary Catalog'
    },
    secondaryCtas: [
      {
        href: '/monster-roster?from=gm-tools',
        label: 'Manage Custom Monsters'
      }
    ],
    links: [
      {
        href: '/monster-generator?from=gm-tools',
        label: 'Monster Generator →'
      }
    ]
  },
  {
    title: '⚔️ Encounter Generator',
    description: 'Create balanced encounters with detailed statistics.',
    links: [
      {
        href: '/encounter-generator?from=gm-tools',
        label: 'Generate Encounters →'
      }
    ]
  },
  {
    title: '👤 Character Tools',
    description: 'Generate and manage player characters.',
    links: [
      {
        href: '/character-generator?from=gm-tools',
        label: 'Character Generator →'
      },
      {
        href: '/roster?from=gm-tools',
        label: 'Character Roster →'
      }
    ]
  },
  {
    title: '🧙 NPC Tools',
    description: 'Create and organize non-player characters.',
    links: [
      {
        href: '/npc-generator?from=gm-tools',
        label: 'NPC Generator →'
      },
      {
        href: '/npc-roster?from=gm-tools',
        label: 'NPC Roster →'
      }
    ]
  },
  {
    title: '⚡ Battle Calculator',
    description: 'Track combat and manage battle phases.',
    links: [
      {
        href: '/battle-calculator?from=gm-tools',
        label: 'Battle Calculator →'
      }
    ]
  },
  {
    title: '📝 Game Content Parser',
    description: 'Analyze and validate stat blocks, spells, and magic items for compliance.',
    links: [
      {
        href: '/stat-block-parser?from=gm-tools',
        label: 'Parse Game Content →'
      }
    ]
  },
  {
    title: '📚 References',
    description: 'Quick access to rules and spell references.',
    links: [
      {
        href: '/grimoire?from=gm-tools',
        label: 'Grimoire →'
      },
      {
        href: '/rules?from=gm-tools',
        label: 'Rules Reference →'
      }
    ]
  }
];

export default function GMTools() {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          GM Tool Suite
        </h1>
        <p className="text-lg text-gray-600">
          All-in-one toolkit for Game Masters running Eldritch RPG campaigns
        </p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {TOOL_SECTIONS.map(section => {
          const hasCtas = Boolean(section.primaryCta || section.secondaryCtas?.length);

          return (
            <div key={section.title} className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold mb-3">{section.title}</h3>
              <p className="text-gray-600 mb-4">{section.description}</p>

              {hasCtas && (
                <div className="flex flex-col gap-3 sm:flex-row">
                  {section.primaryCta && (
                    <Link
                      href={section.primaryCta.href}
                      className="inline-flex items-center justify-center rounded-md bg-purple-600 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-purple-700 transition-colors"
                    >
                      {section.primaryCta.label}
                    </Link>
                  )}
                  {section.secondaryCtas?.map(secondary => (
                    <Link
                      key={secondary.href}
                      href={secondary.href}
                      className="inline-flex items-center justify-center rounded-md border border-purple-200 bg-white px-5 py-3 text-sm font-semibold text-purple-800 shadow-sm transition-colors hover:border-purple-300 hover:text-purple-900"
                    >
                      {secondary.label}
                    </Link>
                  ))}
                </div>
              )}

              {section.links && (
                <div className={`${hasCtas ? 'mt-4' : 'mt-6'} space-y-2`}>
                  {section.links.map(link => (
                    <Link key={link.href} href={link.href} className="block text-blue-600 hover:text-blue-800 font-medium">
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
        <Link
          href="/"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          Back to Home
        </Link>
        <Link
          href="/player-tools"
          className="bg-white border border-blue-200 text-blue-700 hover:text-blue-900 hover:border-blue-300 font-bold py-2 px-4 rounded transition-colors shadow-sm"
        >
          Explore Player Tools
        </Link>
      </div>
    </div>
  );
}
