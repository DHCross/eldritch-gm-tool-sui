'use client';

import { useCallback, useRef, useState, type ChangeEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { exportCampaign, importCampaign } from '@/utils/campaignBackup';
import ContentBox from '@/components/ContentBox';
import InteractiveButton from '@/components/InteractiveButton';

type HeroCard = {
  title: string;
  description: string;
  bullets: string[];
  cta: { href: string; label: string };
  secondaryCtas?: { href: string; label: string }[];
};

const HERO_CARDS: HeroCard[] = [
  {
    title: 'The Hero’s Covenant',
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
    title: 'The Master’s Will',
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
        label: 'The Archive of Mythic Threats'
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
      setFeedback({ type: 'success', message: 'The Eternal Record has been inscribed.' });
    } catch (error) {
      console.error('Error exporting campaign backup:', error);
      setFeedback({ type: 'error', message: 'Unable to inscribe The Eternal Record.' });
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
      setFeedback({ type: 'error', message: 'Please select a valid JSON scroll.' });
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
            message: result.error || 'Failed to consult The Eternal Record.'
          });
        } else {
          setFeedback({
            type: 'success',
            message: 'The Eternal Record has been restored.'
          });
          setRefreshCounter(counter => counter + 1);
        }
      } catch (error) {
        console.error('Error processing campaign backup:', error);
        setFeedback({
          type: 'error',
          message: 'The selected scroll is not a valid record.'
        });
      } finally {
        clearFileInput();
      }
    };

    reader.onerror = () => {
      console.error('Error reading campaign backup file:', reader.error);
      setFeedback({ type: 'error', message: 'Unable to decipher the scroll.' });
      clearFileInput();
    };

    reader.readAsText(file);
  }, [clearFileInput]);

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-12">
        <ContentBox>
          <div className="flex flex-col items-center gap-4 text-center md:flex-row md:justify-center md:gap-8 md:text-left">
            <div className="flex items-center justify-center gap-3 rounded-2xl bg-charcoal-violet/80 px-4 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.35)] md:gap-5 border border-royal-amethyst/30">
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
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-green/90 md:text-sm font-display">
                  Powered by Hoskbrew
                </p>
              </div>
            </div>
            <div className="max-w-xl space-y-2">
              <p className="text-sm uppercase tracking-[0.32em] text-emerald-green/80 font-display font-semibold">Eldritch Suite</p>
              <h1 className="text-4xl font-bold md:text-5xl font-display text-transparent bg-clip-text bg-gradient-to-r from-royal-amethyst via-soft-amethyst to-emerald-green">
                Eldritch RPG GM Tools Suite
              </h1>
              <p className="text-lg text-sharp-silver/85 md:text-xl font-serif">
                Essential tools for Game Masters running Eldritch RPG campaigns
              </p>
            </div>
          </div>
        </ContentBox>
      </header>

      <main>
        <ContentBox className="mb-12">
          <h2 className="text-2xl font-bold text-royal-amethyst font-display">The Eternal Record</h2>
          <p className="mt-2 text-sm text-sharp-silver/80">
            &quot;What is written cannot be unmade.&quot; Save a local scroll with all PCs, NPCs, monsters, and records, or restore a backup to sync your tools.
          </p>
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
            <InteractiveButton
              onClick={handleSaveCampaign}
              className="px-6 py-3"
            >
              Inscribe Record
            </InteractiveButton>

            <label className="inline-flex cursor-pointer flex-col items-start gap-2 text-sm font-medium text-soft-amethyst sm:flex-row sm:items-center group">
              <span className="
                relative overflow-hidden inline-flex items-center justify-center
                rounded-md px-5 py-3 text-sm font-display font-semibold transition-all duration-300
                bg-charcoal-violet/50 text-royal-amethyst
                border border-royal-amethyst/50
                group-hover:border-royal-amethyst group-hover:text-royal-amethyst/80
                group-hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]
                backdrop-blur-sm
              ">
                Consult The Eternal Record
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
                feedback.type === 'success' ? 'text-emerald-green' : 'text-red-500'
              }`}
            >
              {feedback.message}
            </p>
          )}
        </ContentBox>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {HERO_CARDS.map(card => (
            <ContentBox key={card.title}>
              <h2 className="text-3xl font-extrabold text-royal-amethyst mb-4 font-display">{card.title}</h2>
              <p className="text-lg text-sharp-silver/80 mb-6 font-serif">{card.description}</p>
              <ul className="space-y-3 text-sharp-silver/80 font-serif">
                {card.bullets.map(bullet => (
                  <li key={bullet} className="flex items-start">
                    <span className="mr-2 text-emerald-green/70">✦</span>
                    {bullet}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <InteractiveButton href={card.cta.href}>
                  {card.cta.label}
                </InteractiveButton>
                {card.secondaryCtas?.map(secondary => (
                  <InteractiveButton
                    key={secondary.href}
                    href={secondary.href}
                    variant="secondary"
                  >
                    {secondary.label}
                  </InteractiveButton>
                ))}
              </div>
            </ContentBox>
          ))}
        </div>
      </main>

      <footer className="text-center mt-12 pt-8 border-t border-emerald-green/20">
        <div className="text-sharp-silver/60 text-sm font-serif">
          <p>&copy; 2025 Hoskbrew</p>
          <p>Tools for the Eldritch RPG system</p>
          <div className="mt-4 space-x-4 font-display">
            <Link href="/rules" className="text-emerald-green hover:text-emerald-green/80 transition-colors">
              Game Rules
            </Link>
            <Link href="/documentation" className="text-emerald-green hover:text-emerald-green/80 transition-colors">
              Documentation
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
