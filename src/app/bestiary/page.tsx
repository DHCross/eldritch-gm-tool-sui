import { Suspense } from 'react';
import Bestiary from '../../components/Bestiary';
import ContentBox from '@/components/ContentBox';

export default function BestiaryPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <ContentBox>
        <Suspense fallback={<div className="p-4 text-center">Loading bestiary...</div>}>
          <Bestiary />
        </Suspense>
      </ContentBox>
    </div>
  );
}
