import Link from 'next/link';
import { resolveBackTargetFromSearchParams } from '../../utils/backNavigation';
import { PagePropsWithSearchParams, resolvePageSearchParams } from '../../types/page';
import GmQuickGuide from '../../components/GmQuickGuide';

type PageProps = PagePropsWithSearchParams;

export default async function Rules({ searchParams }: PageProps) {
  const resolvedSearchParams = await resolvePageSearchParams(searchParams);
  const backTarget = resolveBackTargetFromSearchParams(resolvedSearchParams, 'player-tools');

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Eldritch RPG Rules Reference
        </h1>
        <p className="text-lg text-gray-600">
          Quick reference for Eldritch RPG 2nd Edition rules and mechanics
        </p>
      </header>

      <GmQuickGuide />

      <div className="text-center">
        <Link
          href={backTarget.href}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          {backTarget.label}
        </Link>
      </div>
    </div>
  );
}
