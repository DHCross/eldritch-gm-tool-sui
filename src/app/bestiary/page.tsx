import { Suspense } from 'react';
import Bestiary from '../../components/Bestiary';

export default function BestiaryPage() {
  return (
    <Suspense fallback={<div className="p-4 text-center">Loading bestiary...</div>}>
      <Bestiary />
    </Suspense>
  );
}
