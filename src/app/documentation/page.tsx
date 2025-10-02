import Link from 'next/link';
import { resolveBackTargetFromSearchParams } from '../../utils/backNavigation';
import { PagePropsWithSearchParams, resolvePageSearchParams } from '../../types/page';

type PageProps = PagePropsWithSearchParams;

export default async function Documentation({ searchParams }: PageProps) {
  const resolvedSearchParams = await resolvePageSearchParams(searchParams);
  const backTarget = resolveBackTargetFromSearchParams(resolvedSearchParams, 'gm-tools');

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          GM Tools Documentation
        </h1>
        <p className="text-lg text-gray-600">
          Learn how to use the Eldritch RPG GM Tools Suite effectively
        </p>
      </header>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">Coming Soon</h2>
        <p className="text-gray-600 mb-4">
          The Documentation section is currently under development. This will provide
          comprehensive guides for using all GM tools effectively.
        </p>
        <p className="text-gray-600">
          Documentation will include:
        </p>
        <ul className="list-disc list-inside text-gray-600 mt-2">
          <li>Getting started guides</li>
          <li>Tool-specific tutorials</li>
          <li>Best practices for GMs</li>
          <li>Tips and tricks</li>
          <li>Troubleshooting guides</li>
        </ul>
      </div>

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
