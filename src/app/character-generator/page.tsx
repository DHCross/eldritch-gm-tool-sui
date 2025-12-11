import CharacterGenerator from '../../components/CharacterGenerator';
import Link from 'next/link';
import { resolveBackTargetFromSearchParams } from '../../utils/backNavigation';
import { PagePropsWithSearchParams, resolvePageSearchParams } from '../../types/page';
import ContentBox from '@/components/ContentBox';

type PageProps = PagePropsWithSearchParams;

export default async function CharacterGeneratorPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await resolvePageSearchParams(searchParams);
  const backTarget = resolveBackTargetFromSearchParams(resolvedSearchParams, 'player-tools');

  return (
    <div className="container mx-auto px-4 py-8">
      <ContentBox>
        <div className="mb-6">
          <Link
            href={backTarget.href}
            className="inline-flex items-center text-muted-eldritch-green hover:text-muted-eldritch-green/80 transition-colors"
          >
            {backTarget.label}
          </Link>
        </div>

        <CharacterGenerator />
      </ContentBox>
    </div>
  );
}
