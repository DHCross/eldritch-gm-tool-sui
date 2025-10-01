import BattleCalculator from '../../components/BattleCalculator';
import Link from 'next/link';
import { resolveBackTargetFromSearchParams } from '../../utils/backNavigation';
import { PagePropsWithSearchParams, resolvePageSearchParams } from '../../types/page';

type PageProps = PagePropsWithSearchParams;

export default async function BattleCalculatorPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await resolvePageSearchParams(searchParams);
  const backTarget = resolveBackTargetFromSearchParams(resolvedSearchParams, 'gm-tools');

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

        <BattleCalculator />
      </div>
    </div>
  );
}
