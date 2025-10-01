import GrimoireIndex from '../../components/GrimoireIndex';
import Link from 'next/link';
import { resolveBackTargetFromSearchParams } from '../../utils/backNavigation';

type PageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default function GrimoirePage({ searchParams }: PageProps) {
  const backTarget = resolveBackTargetFromSearchParams(searchParams, 'player-tools');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href={backTarget.href}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            {backTarget.label}
          </Link>
        </div>

        <GrimoireIndex />
      </div>
    </div>
  );
}
