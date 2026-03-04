import AdvancedNPCGenerator from '../../components/AdvancedNPCGenerator';
import Link from 'next/link';
import { resolveBackTargetFromSearchParams } from '../../utils/backNavigation';
import { PagePropsWithSearchParams, resolvePageSearchParams } from '../../types/page';

type PageProps = PagePropsWithSearchParams;

export default async function NPCGeneratorPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await resolvePageSearchParams(searchParams);
  const backTarget = resolveBackTargetFromSearchParams(resolvedSearchParams, 'gm-tools');

  return (
    <div className="min-h-screen bg-charcoal-violet text-off-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href={backTarget.href}
            className="inline-flex items-center text-soft-amethyst hover:text-soft-amethyst/80 transition-colors"
          >
            {backTarget.label}
          </Link>
        </div>

        <AdvancedNPCGenerator />
      </div>
    </div>
  );
}
