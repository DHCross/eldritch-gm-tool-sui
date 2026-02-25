import Image from 'next/image';
import Link from 'next/link';
import { resolveBackTargetFromSearchParams } from '../../utils/backNavigation';
import { PagePropsWithSearchParams, resolvePageSearchParams } from '../../types/page';
import ContentBox from '../../components/ContentBox';

type PageProps = PagePropsWithSearchParams;

/* ─────────────────── Ontological Table Data ─────────────────── */

type ManifestationType = {
  name: string;
  alias?: string;
  source: string;
  stability: string;
  stabilityIcon: string;
  fn: string;
  notes: string;
};

const MANIFESTATION_TYPES: ManifestationType[] = [
  {
    name: 'Inkling',
    alias: 'Whisperkin, Shades',
    source:
      'Ambient narrative imbalance; subconscious psychic pressure; fleeting thought or emotion',
    stability: 'Ephemeral',
    stabilityIcon: '✧',
    fn: 'Subtle influence; emotional echo; predatory drift',
    notes:
      'Flickering, shadow-like manifestations. Reflect local emotional tone. Often serve higher entities as subconscious scouts or enforcers. The rawest form of dream-spirit.'
  },
  {
    name: 'Extantar',
    source: 'Observer perception and sustained attention',
    stability: 'Mutable',
    stabilityIcon: '⚖︎',
    fn: 'Adaptive mirrors; transformation catalysts',
    notes:
      'Forms shift between observers. Stable enough for interaction but incoherent across viewpoints. May seed future myths.'
  },
  {
    name: 'Tulpa',
    source: 'Collective belief and sustained narrative',
    stability: 'Variable',
    stabilityIcon: '✶',
    fn: 'Manifest icons of faith and symbol',
    notes:
      'Embodiments of saints, spirits, archetypal icons. Power scales with worship, fear, or ritual reinforcement. Often indistinguishable from minor gods.'
  },
  {
    name: 'Aethelborn',
    source: 'Externalized will (divine command, oath-binding, relic-anchor)',
    stability: 'Semi-Stable',
    stabilityIcon: '☑',
    fn: 'Guardians, anchors, executors of singular purpose',
    notes:
      'Fixed in form and function. Often born from Extantars but stabilized through imposed intent. Examples include Radiants and Oath-Forged entities.'
  },
  {
    name: 'Reifiant',
    source: 'Mythic reification from the Meterea',
    stability: 'Persistent (while believed)',
    stabilityIcon: '✅',
    fn: 'Domain-shapers; cosmological architects',
    notes:
      'Fully realized archetypes — gods, titans, dragons. Sustain realms and alter metaphysical law. Anchored in collective myth.'
  }
];

/* ──────────────────────── Stability Spectrum ──────────────────────── */

const STABILITY_FACTORS = [
  { factor: 'Emotion', effect: 'Produces instability' },
  { factor: 'Perception', effect: 'Produces conditional form' },
  { factor: 'Will', effect: 'Produces directed persistence' },
  { factor: 'Belief', effect: 'Produces mythic permanence' }
];

/* ──────────────────────── Play Implications ──────────────────────── */

const PLAY_IMPLICATIONS = [
  'Regions of weakened narrative cohesion will see increased Inkling and Extantar activity.',
  'Oath-breaking may destabilize Aethelborn entities.',
  'Cultural collapse can diminish or transform Tulpas.',
  'Erasure of myth weakens Reifiants.'
];

const CANONICAL_NOTES = [
  { term: 'Meterea', note: 'The sole primordial substrate from which all beings in Ainerêve arise.' },
  { term: 'Chaosance', note: 'Deprecated. No longer used in 2E cosmology.' },
  { term: 'Reifiants', note: 'Not "created" by mortals, but condensed through accumulated mythic pressure.' },
  { term: 'Aethelborn', note: 'Do not require worship — only sustained purpose.' },
  { term: 'Tulpas', note: 'May operate regionally within specific cultic or ritual domains.' }
];

/* ══════════════════════════ Page Component ══════════════════════════ */

export default async function SettingPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await resolvePageSearchParams(searchParams);
  const backTarget = resolveBackTargetFromSearchParams(resolvedSearchParams, 'gm-tools');

  return (
    <div className="container mx-auto px-4 py-8 text-off-white max-w-5xl">
      {/* ── Header ── */}
      <header className="text-center mb-10">
        <p className="text-sm uppercase tracking-[0.25em] text-muted-eldritch-green/80 font-display mb-2">
          The Eldritch Realms
        </p>
        <h1 className="text-4xl font-extrabold text-off-white font-display">
          The Setting of Ainerêve
        </h1>
        <p className="mt-3 text-lg text-off-white/80 font-serif max-w-2xl mx-auto">
          All beings in Ainerêve arise from the <strong className="text-royal-amethyst">Meterea</strong> — the primordial
          medium of thought, emotion, belief, and imagination.
        </p>
      </header>

      {/* ── Map of the Eldritch Realms ── */}
      <ContentBox className="mb-8">
        <h2 className="text-2xl font-bold text-royal-amethyst font-display mb-2">
          Map of the Eldritch Realms
        </h2>
        <p className="text-off-white/70 font-serif text-sm mb-5">
          The principal regions of Ainerêve — from the Northern Reaches through Meath Forest to
          the Gulf of Azure. Crossroads sits at the nexus, where the gates connect to worlds far and near.
        </p>
        <div className="relative w-full rounded-lg overflow-hidden border border-royal-amethyst/30 shadow-[0_0_30px_rgba(107,33,168,0.2)]">
          <Image
            src="/eldritch-realms-map.png"
            alt="Map of the Eldritch Realms — showing Northern Reaches, Dalmavand, Maedoen, Meath Forest, Crossroads, Psarmorum, Avinoble, Aigypt, and surrounding seas"
            width={5400}
            height={7200}
            sizes="(min-width: 1024px) 960px, (min-width: 768px) 720px, 100vw"
            quality={85}
            className="w-full h-auto"
            priority
          />
        </div>
        <p className="mt-3 text-xs text-off-white/50 font-serif italic text-center">
          Major regions: Northern Reaches · Dalmavand · Maedoen · Meath Forest · Crossroads ·
          Psarmorum · Avinoble · Aigypt · Elden Heights
        </p>
      </ContentBox>

      {/* ── Introduction ── */}
      <ContentBox className="mb-8">
        <h2 className="text-2xl font-bold text-royal-amethyst font-display mb-4">
          Ontology of Dream-Born Entities
        </h2>
        <p className="text-off-white/85 font-serif italic mb-3">
          Metereic Manifestation in the Eldritch Realms
        </p>
        <p className="text-off-white/80 font-serif leading-relaxed">
          What differentiates entities is not substance, but the stabilizing vector that shapes them.
          The following taxonomy classifies dream-born entities by origin, stability, and
          cosmological function.
        </p>
      </ContentBox>

      {/* ── Ontological Table ── */}
      <ContentBox className="mb-8">
        <h2 className="text-2xl font-bold text-royal-amethyst font-display mb-6">
          Ontological Table of Manifestation
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-royal-amethyst/40">
                <th className="text-left py-3 px-3 text-muted-eldritch-green font-display font-semibold">Type</th>
                <th className="text-left py-3 px-3 text-muted-eldritch-green font-display font-semibold">Source of Form</th>
                <th className="text-left py-3 px-3 text-muted-eldritch-green font-display font-semibold">Stability</th>
                <th className="text-left py-3 px-3 text-muted-eldritch-green font-display font-semibold">Function</th>
              </tr>
            </thead>
            <tbody>
              {MANIFESTATION_TYPES.map(type => (
                <tr
                  key={type.name}
                  className="border-b border-white/10 hover:bg-white/5 transition-colors"
                >
                  <td className="py-4 px-3 align-top">
                    <span className="font-bold text-off-white">{type.name}</span>
                    {type.alias && (
                      <span className="block text-xs text-off-white/50 italic mt-0.5">
                        {type.alias}
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-3 align-top text-off-white/75 font-serif">{type.source}</td>
                  <td className="py-4 px-3 align-top whitespace-nowrap">
                    <span className="mr-1.5">{type.stabilityIcon}</span>
                    <span className="text-soft-amethyst font-medium">{type.stability}</span>
                  </td>
                  <td className="py-4 px-3 align-top text-off-white/75 font-serif">{type.fn}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Row-specific notes accordion ── */}
        <div className="mt-6 space-y-3">
          {MANIFESTATION_TYPES.map(type => (
            <details key={type.name} className="group">
              <summary className="cursor-pointer list-none flex items-center gap-2 text-sm font-display font-semibold text-muted-eldritch-green hover:text-soft-amethyst transition-colors">
                <span className="transition-transform group-open:rotate-90">▸</span>
                {type.name} — Notes
              </summary>
              <p className="mt-2 ml-5 text-sm text-off-white/70 font-serif leading-relaxed">
                {type.notes}
              </p>
            </details>
          ))}
        </div>
      </ContentBox>

      {/* ── Hierarchical Escalation ── */}
      <ContentBox className="mb-8">
        <h2 className="text-2xl font-bold text-royal-amethyst font-display mb-4">
          Hierarchical Clarification
        </h2>
        <p className="text-off-white/80 font-serif mb-6 leading-relaxed">
          This table is not merely classificatory — it represents <em>ontological escalation</em>.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2 text-sm font-display mb-6">
          {['Inkling', 'Extantar', 'Aethelborn', 'Reifiant'].map((stage, i, arr) => (
            <span key={stage} className="flex items-center gap-2">
              <span className="rounded-md bg-royal-amethyst/20 border border-royal-amethyst/40 px-3 py-1.5 text-off-white font-semibold">
                {stage}
              </span>
              {i < arr.length - 1 && (
                <span className="text-muted-eldritch-green text-lg">→</span>
              )}
            </span>
          ))}
        </div>

        <ul className="space-y-2 text-off-white/80 font-serif">
          <li className="flex gap-2"><span className="text-muted-eldritch-green">✦</span><span><strong className="text-off-white">Inklings</strong> are unformed emotional tremors.</span></li>
          <li className="flex gap-2"><span className="text-muted-eldritch-green">✦</span><span><strong className="text-off-white">Extantars</strong> gain shape through perception.</span></li>
          <li className="flex gap-2"><span className="text-muted-eldritch-green">✦</span><span><strong className="text-off-white">Aethelborn</strong> gain permanence through imposed will.</span></li>
          <li className="flex gap-2"><span className="text-muted-eldritch-green">✦</span><span><strong className="text-off-white">Reifiants</strong> gain sovereignty through enduring collective belief.</span></li>
        </ul>

        <div className="mt-6 rounded-lg bg-white/5 border border-soft-amethyst/30 p-4">
          <p className="text-sm text-off-white/80 font-serif leading-relaxed">
            <strong className="text-soft-amethyst">Tulpas</strong> occupy a lateral category: they may
            evolve upward into Reifiants if belief consolidates sufficiently, or dissipate if
            narrative weakens.
          </p>
        </div>
      </ContentBox>

      {/* ── Metereic Stability Spectrum ── */}
      <ContentBox className="mb-8">
        <h2 className="text-2xl font-bold text-royal-amethyst font-display mb-4">
          Metereic Stability Spectrum
        </h2>
        <p className="text-off-white/80 font-serif mb-6">
          The determining factor in stability is <em>reinforcement</em>:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {STABILITY_FACTORS.map(({ factor, effect }) => (
            <div
              key={factor}
              className="rounded-lg bg-white/5 border border-royal-amethyst/20 p-4 flex items-start gap-3"
            >
              <span className="text-muted-eldritch-green font-bold text-lg mt-0.5">◈</span>
              <div>
                <span className="font-display font-bold text-off-white">{factor}</span>
                <p className="text-sm text-off-white/70 font-serif mt-0.5">{effect}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-5 text-off-white/70 font-serif text-sm italic">
          The stronger and more consistent the narrative reinforcement, the more persistent the
          entity.
        </p>
      </ContentBox>

      {/* ── Canonical Notes ── */}
      <ContentBox className="mb-8">
        <h2 className="text-2xl font-bold text-royal-amethyst font-display mb-4">
          Canonical Notes for Eldritch 2E
        </h2>
        <dl className="space-y-4">
          {CANONICAL_NOTES.map(({ term, note }) => (
            <div key={term} className="flex gap-3">
              <dt className="shrink-0 rounded bg-royal-amethyst/20 border border-royal-amethyst/30 px-2.5 py-1 text-xs font-display font-bold text-royal-amethyst uppercase tracking-wider self-start mt-0.5">
                {term}
              </dt>
              <dd className="text-off-white/80 font-serif text-sm leading-relaxed">{note}</dd>
            </div>
          ))}
        </dl>
      </ContentBox>

      {/* ── Cosmological Implications for Play ── */}
      <ContentBox className="mb-10">
        <h2 className="text-2xl font-bold text-royal-amethyst font-display mb-4">
          Cosmological Implications for Play
        </h2>
        <p className="text-off-white/80 font-serif mb-4 text-sm">
          This structure allows GMs to scale encounters metaphysically without introducing
          arbitrary monster hierarchies. Ontology replaces CR as narrative weight.
        </p>
        <ul className="space-y-2">
          {PLAY_IMPLICATIONS.map(implication => (
            <li key={implication} className="flex items-start gap-2 text-off-white/80 font-serif text-sm">
              <span className="text-muted-eldritch-green mt-0.5">⚡</span>
              {implication}
            </li>
          ))}
        </ul>
      </ContentBox>

      {/* ── Back Nav ── */}
      <div className="text-center">
        <Link
          href={backTarget.href}
          className="inline-flex items-center justify-center rounded-md bg-btn-bg px-5 py-3 text-sm font-semibold text-off-white shadow-md transition-colors hover:bg-btn-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-soft-amethyst"
        >
          {backTarget.label}
        </Link>
      </div>
    </div>
  );
}
