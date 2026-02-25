import Link from 'next/link';

import ContentBox from '@/components/ContentBox';

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
        label: 'Random PC Generator →'
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
    description: 'Quick access to rules, spell references, and the setting of Ainerêve.',
    links: [
      {
        href: '/grimoire?from=gm-tools',
        label: 'Grimoire →'
      },
      {
        href: '/rules?from=gm-tools',
        label: 'Rules Reference →'
      },
      {
        href: '/setting?from=gm-tools',
        label: 'Setting of Ainerêve →'
      }
    ]
  },
  {
    title: '📤 Encounter+ Export',
    description: 'Export your characters and monsters for use in Encounter+ VTT.',
    primaryCta: {
      href: '/encounter-plus-export?from=gm-tools',
      label: 'Open Export Center'
    },
    links: [
      {
        href: '/party-management?from=gm-tools',
        label: 'Party Management →'
      }
    ]
  }
];

export default function GMTools() {
  return (
    <div className="container mx-auto px-4 py-10 text-off-white">
      <header className="text-center mb-10">
        <p className="text-sm uppercase tracking-[0.2em] text-muted-eldritch-green/85">Eldritch Suite</p>
        <h1 className="mt-2 text-4xl font-extrabold text-off-white">GM Tool Suite</h1>
        <p className="mt-3 text-lg text-off-white/80">
          All-in-one toolkit for Game Masters running Eldritch RPG campaigns
        </p>
      </header>

      <section className="relative mb-12 overflow-hidden rounded-2xl border border-muted-eldritch-green/30 bg-gradient-to-r from-charcoal-violet via-[#151026] to-[#0f0b18] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(127,222,115,0.12),transparent_38%)]"
        />
        <div className="flex flex-col gap-4 text-center md:flex-row md:items-center md:justify-between md:text-left">
          <div className="max-w-2xl space-y-2">
            <p className="text-sm uppercase tracking-wide text-muted-eldritch-green/80">Featured</p>
            <h2 className="text-2xl font-bold text-off-white">📖 Explore the Full Bestiary</h2>
            <p className="text-off-white/85">
              Dive into the complete catalog of eldritch creatures, filter by threat level, and pull stat blocks straight into
              your encounters.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/bestiary?from=gm-tools"
              className="inline-flex items-center justify-center rounded-md bg-btn-bg px-5 py-3 text-sm font-semibold text-off-white shadow-lg transition-colors hover:bg-btn-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-soft-amethyst"
            >
              Open Bestiary Catalog →
            </Link>
            <Link
              href="/monster-roster?from=gm-tools"
              className="inline-flex items-center justify-center rounded-md border border-muted-eldritch-green/60 bg-charcoal-violet/70 px-5 py-3 text-sm font-semibold text-muted-eldritch-green shadow-sm transition-colors hover:border-muted-eldritch-green hover:bg-charcoal-violet/90 hover:text-off-white focus:outline-none focus-visible:ring-2 focus-visible:ring-muted-eldritch-green"
            >
              Manage Custom Monsters
            </Link>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mb-10">
        {TOOL_SECTIONS.map(section => {
          const hasCtas = Boolean(section.primaryCta || section.secondaryCtas?.length);

          return (
            <ContentBox key={section.title} className="h-full">
              <div className="flex items-start gap-3">
                <span className="mt-1 h-2 w-8 rounded-full bg-muted-eldritch-green/80" aria-hidden="true" />
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-off-white mb-2">{section.title}</h3>
                  <p className="text-off-white/80 mb-4">{section.description}</p>

                  {hasCtas && (
                    <div className="flex flex-col gap-3 sm:flex-row">
                      {section.primaryCta && (
                        <Link
                          href={section.primaryCta.href}
                          className="inline-flex items-center justify-center rounded-md bg-btn-bg px-5 py-3 text-sm font-semibold text-off-white shadow-md transition-colors hover:bg-btn-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-soft-amethyst"
                        >
                          {section.primaryCta.label}
                        </Link>
                      )}
                      {section.secondaryCtas?.map(secondary => (
                        <Link
                          key={secondary.href}
                          href={secondary.href}
                          className="inline-flex items-center justify-center rounded-md border border-muted-eldritch-green/50 bg-charcoal-violet/60 px-5 py-3 text-sm font-semibold text-muted-eldritch-green shadow-sm transition-colors hover:border-muted-eldritch-green hover:bg-charcoal-violet/80 hover:text-off-white focus:outline-none focus-visible:ring-2 focus-visible:ring-muted-eldritch-green"
                        >
                          {secondary.label}
                        </Link>
                      ))}
                    </div>
                  )}

                  {section.links && (
                    <div className={`${hasCtas ? 'mt-4' : 'mt-6'} space-y-2`}>
                      {section.links.map(link => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="group inline-flex items-center gap-1 text-muted-eldritch-green transition-colors hover:text-soft-amethyst"
                        >
                          <span className="text-sm font-semibold">{link.label}</span>
                          <span className="text-xs opacity-70 transition-transform duration-200 group-hover:translate-x-0.5">→</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </ContentBox>
          );
        })}
      </div>

      <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-md border border-muted-eldritch-green/50 bg-charcoal-violet/70 px-5 py-3 text-sm font-semibold text-muted-eldritch-green shadow-sm transition-colors hover:border-muted-eldritch-green hover:text-off-white focus:outline-none focus-visible:ring-2 focus-visible:ring-muted-eldritch-green"
        >
          Back to Home
        </Link>
        <Link
          href="/player-tools"
          className="inline-flex items-center justify-center rounded-md bg-btn-bg px-5 py-3 text-sm font-semibold text-off-white shadow-md transition-colors hover:bg-btn-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-soft-amethyst"
        >
          Explore Player Tools
        </Link>
      </div>
    </div>
  );
}
