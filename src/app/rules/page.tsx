import Link from 'next/link';
import { resolveBackTargetFromSearchParams } from '../../utils/backNavigation';
import { PagePropsWithSearchParams, resolvePageSearchParams } from '../../types/page';
import GmQuickGuide from '../../components/GmQuickGuide';

type PageProps = PagePropsWithSearchParams;

export default async function Rules({ searchParams }: PageProps) {
  const resolvedSearchParams = await resolvePageSearchParams(searchParams);
  const backTarget = resolveBackTargetFromSearchParams(resolvedSearchParams, 'player-tools');

  return (
    <div className="container mx-auto px-4 py-8 text-off-white">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-off-white mb-4">
          Eldritch RPG Rules Reference
        </h1>
        <p className="text-lg text-off-white/80">
          Quick reference for Eldritch RPG 2nd Edition rules and mechanics
        </p>
      </header>

      <GmQuickGuide />

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
