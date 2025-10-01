import PartyManagement from '../../components/PartyManagement';
import Link from 'next/link';
import { resolveBackTargetFromSearchParams } from '../../utils/backNavigation';

type PageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default function PartyManagementPage({ searchParams }: PageProps) {
  const backTarget = resolveBackTargetFromSearchParams(searchParams, 'player-tools');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <Link
            href={backTarget.href}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            {backTarget.label}
          </Link>
          <Link
            href="/roster?from=player-tools"
            className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            View PC Roster →
          </Link>
        </div>

        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Party Management System
          </h1>
          <p className="text-lg text-gray-600">
            Organize characters into party folders and manage your campaign groups
          </p>
        </header>

        <PartyManagement />
      </div>
    </div>
  );
}
