import Link from 'next/link';
import { resolveBackTargetFromSearchParams } from '../../utils/backNavigation';
import { PagePropsWithSearchParams, resolvePageSearchParams } from '../../types/page';
import ContentBox from '@/components/ContentBox';

type PageProps = PagePropsWithSearchParams;

export default async function Documentation({ searchParams }: PageProps) {
  const resolvedSearchParams = await resolvePageSearchParams(searchParams);
  const backTarget = resolveBackTargetFromSearchParams(resolvedSearchParams, 'gm-tools');

  return (
    <div className="container mx-auto px-4 py-8">
      <ContentBox>
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-off-white mb-4">
            GM Tools Documentation
          </h1>
          <p className="text-lg text-off-white/80">
            Learn how to use the Eldritch RPG GM Tools Suite effectively
          </p>
        </header>

        <ContentBox className="bg-charcoal-violet/70">
          <h2 className="text-2xl font-bold mb-4 text-soft-amethyst">Coming Soon</h2>
          <p className="text-off-white/80 mb-4">
            The Documentation section is currently under development. This will provide
            comprehensive guides for using all GM tools effectively.
          </p>
          <p className="text-off-white/80">
            Documentation will include:
          </p>
          <ul className="list-disc list-inside text-off-white/80 mt-2">
            <li>Getting started guides</li>
            <li>Tool-specific tutorials</li>
            <li>Best practices for GMs</li>
            <li>Tips and tricks</li>
            <li>Troubleshooting guides</li>
          </ul>
        </ContentBox>

        <div className="text-center mt-8">
          <Link
            href={backTarget.href}
            className="bg-btn-bg hover:bg-btn-hover text-off-white font-bold py-2 px-4 rounded transition-colors"
          >
            {backTarget.label}
          </Link>
        </div>
      </ContentBox>
    </div>
  );
}
