import Link from 'next/link';
import { resolveBackTargetFromSearchParams } from '../../utils/backNavigation';

type PageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default function MonsterRoster({ searchParams }: PageProps) {
  const backTarget = resolveBackTargetFromSearchParams(searchParams, 'gm-tools');

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Monster Roster
        </h1>
        <p className="text-lg text-gray-600">
          Manage your created monsters and creatures
        </p>
      </header>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">No Monsters Created Yet</h2>
        <p className="text-gray-600 mb-4">
          You haven&apos;t created any monsters yet. Use the Monster Generator to create creatures
          that will appear in this roster.
        </p>
        <div className="bg-gray-50 p-4 rounded">
          <p className="text-sm text-gray-600">
            Your monster roster will display:
          </p>
          <ul className="list-disc list-inside text-sm text-gray-600 mt-2">
            <li>Monster names and challenge ratings</li>
            <li>Quick access to full stat blocks</li>
            <li>Organization by type or campaign</li>
            <li>Encounter building integration</li>
          </ul>
        </div>
      </div>

      <div className="text-center space-x-4">
        <Link
          href="/monster-generator"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          Create First Monster
        </Link>
        <Link
          href={backTarget.href}
          className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          {backTarget.label}
        </Link>
      </div>
    </div>
  );
}
