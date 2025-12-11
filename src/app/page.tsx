'use client';

import { useCallback, useRef, useState, type ChangeEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { exportCampaign, importCampaign } from '@/utils/campaignBackup';
import ContentBox from '@/components/ContentBox';

type HeroCard = {
  title: string;
  description: string;
  bullets: string[];
  cta: { href: string; label: string };
  secondaryCtas?: { href: string; label: string }[];
};

const HERO_CARDS: HeroCard[] = [
  {
    title: 'Player Tools',
    description:
      'Jump straight into character creation, spell references, and tools to keep your hero ready for every eldritch encounter.',
    bullets: [
      'Quick-start character, party, and NPC builders tailored for players.',
      'Spellbooks, equipment references, and lore summaries at the table.',
      'Track progress, quests, and campaign history with shared resources.'
    ],
    cta: {
      href: '/player-tools',
      label: 'Explore Player Tools'
    }
  },
  {
    title: 'GM Tools',
    description:
      'Orchestrate unforgettable sessions with encounter planning, monster management, and campaign organization at your fingertips.',
    bullets: [
      'Comprehensive encounter and monster generators.',
      'Battle calculators, rosters, and party management dashboards.',
      'Direct links to rules, documentation, and the full bestiary.'
    ],
    cta: {
      href: '/gm-tools',
      label: 'Explore GM Tools'
    },
    secondaryCtas: [
      {
        href: '/bestiary?from=home',
        label: 'Browse Bestiary Catalog'
      }
    ]
  }
];

export default function Home() {
  const [, setRefreshCounter] = useState(0);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSaveCampaign = useCallback(() => {
    try {
      const backup = exportCampaign();
      const blob = new Blob([JSON.stringify(backup, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `eldritch-campaign-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setFeedback({ type: 'success', message: 'Campaign backup saved to your device.' });
    } catch (error) {
      console.error('Error exporting campaign backup:', error);
      setFeedback({ type: 'error', message: 'Unable to save campaign backup.' });
    }
  }, []);

  const clearFileInput = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleLoadCampaign = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith('.json')) {
      setFeedback({ type: 'error', message: 'Please select a JSON backup file.' });
      clearFileInput();
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = reader.result;
        if (typeof text !== 'string') {
          throw new Error('Unable to read file contents.');
        }
        const parsed = JSON.parse(text);
        const result = importCampaign(parsed);

        if (!result.success) {
          setFeedback({
            type: 'error',
            message: result.error || 'Failed to import campaign backup.'
          });
        } else {
          setFeedback({
            type: 'success',
            message: 'Campaign backup imported successfully.'
          });
          setRefreshCounter(counter => counter + 1);
        }
      } catch (error) {
        console.error('Error processing campaign backup:', error);
        setFeedback({
          type: 'error',
          message: 'The selected file is not a valid campaign backup.'
        });
      } finally {
        clearFileInput();
      }
    };

    reader.onerror = () => {
      console.error('Error reading campaign backup file:', reader.error);
      setFeedback({ type: 'error', message: 'Unable to read the selected file.' });
      clearFileInput();
    };

    reader.readAsText(file);
  }, [clearFileInput]);

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-12">
        <ContentBox>
          <div className="flex flex-col items-center gap-4 text-center md:flex-row md:justify-center md:gap-8 md:text-left">
            <div className="flex items-center justify-center gap-3 rounded-2xl bg-charcoal-violet/80 px-4 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.35)] md:gap-5">
              <Image
                src="/eldritch-logo.png"
                alt="Eldritch RPG logo"
                width={600}
                height={600}
                sizes="(min-width: 768px) 220px, 160px"
                priority
                className="h-auto w-28 max-w-[220px] drop-shadow-[0_0_18px_rgba(184,132,243,0.45)] md:w-[220px]"
              />
              <div className="flex flex-col items-center justify-center gap-1">
                <Image
                  src="/hoskbrew-logo.png"
                  alt="Hoskbrew logo"
                  width={600}
                  height={600}
                  sizes="(min-width: 768px) 200px, 140px"
                  priority
                  className="h-auto w-24 max-w-[200px] drop-shadow-[0_0_16px_rgba(127,222,115,0.4)] md:w-[200px]"
                />
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-eldritch-green/90 md:text-sm">
                  Powered by Hoskbrew
                </p>
              </div>
            </div>
            <div className="max-w-xl space-y-2">
              <p className="text-sm uppercase tracking-[0.32em] text-muted-eldritch-green/80">Eldritch Suite</p>
              <h1 className="text-4xl font-bold text-off-white md:text-5xl">
                Eldritch RPG GM Tools Suite
              </h1>
              <p className="text-lg text-off-white/85 md:text-xl">
                Essential tools for Game Masters running Eldritch RPG campaigns
              </p>
            </div>
          </div>
        </ContentBox>
      </header>

      <main>
        <ContentBox className="mb-12">
          <h2 className="text-2xl font-bold text-soft-amethyst">Campaign Backups</h2>
          <p className="mt-2 text-sm text-off-white/80">
            Save a local JSON file with all PCs, NPCs, monsters, party folders, roster folders, and encounter templates, or
            restore a backup to sync your tools.
          </p>
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={handleSaveCampaign}
              className="inline-flex items-center justify-center rounded-md bg-btn-bg px-5 py-3 text-sm font-semibold text-off-white shadow hover:bg-btn-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-soft-amethyst"
            >
              Save Campaign
            </button>
            <label className="inline-flex cursor-pointer flex-col items-start gap-2 text-sm font-medium text-soft-amethyst sm:flex-row sm:items-center">
              <span className="rounded-md border border-dashed border-soft-amethyst/50 bg-charcoal-violet/50 px-5 py-3 text-center text-sm font-semibold text-soft-amethyst shadow-sm transition-colors hover:border-soft-amethyst hover:text-soft-amethyst/80">
                Load Campaign Backup
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json,.json"
                onChange={handleLoadCampaign}
                className="hidden"
              />
            </label>
          </div>
          {feedback && (
            <p
              className={`mt-4 text-sm font-semibold ${
                feedback.type === 'success' ? 'text-muted-eldritch-green' : 'text-red-500'
              }`}
            >
              {feedback.message}
            </p>
          )}
        </ContentBox>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {HERO_CARDS.map(card => (
            <ContentBox key={card.title}>
              <h2 className="text-3xl font-extrabold text-soft-amethyst mb-4">{card.title}</h2>
              <p className="text-lg text-off-white/80 mb-6">{card.description}</p>
              <ul className="space-y-3 text-off-white/80">
                {card.bullets.map(bullet => (
                  <li key={bullet}>• {bullet}</li>
                ))}
              </ul>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={card.cta.href}
                  className="inline-flex items-center justify-center rounded-md bg-btn-bg px-5 py-3 text-sm font-semibold text-off-white shadow hover:bg-btn-hover transition-colors"
                >
                  {card.cta.label}
                </Link>
                {card.secondaryCtas?.map(secondary => (
                  <Link
                    key={secondary.href}
                    href={secondary.href}
                    className="inline-flex items-center justify-center rounded-md border border-soft-amethyst/50 bg-charcoal-violet/50 px-5 py-3 text-sm font-semibold text-soft-amethyst shadow-sm transition-colors hover:border-soft-amethyst hover:text-soft-amethyst/80"
                  >
                    {secondary.label}
                  </Link>
                ))}
              </div>
            </ContentBox>
          ))}
        </div>
      </main>

      <footer className="text-center mt-12 pt-8 border-t border-muted-eldritch-green/40">
        <div className="text-off-white/80">
          <p>&copy; 2025 Hoskbrew</p>
          <p>Tools for the Eldritch RPG system</p>
          <div className="mt-4 space-x-4">
            <Link href="/rules" className="text-muted-eldritch-green hover:text-muted-eldritch-green/80">
              Game Rules
            </Link>
            <Link href="/documentation" className="text-muted-eldritch-green hover:text-muted-eldritch-green/80">
              Documentation
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
