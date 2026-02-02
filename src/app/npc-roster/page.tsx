'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { SavedCharacter } from '../../types/party';
import { getCharactersByType, deleteCharacter } from '../../utils/partyStorage';
import { resolveBackTargetFromParam } from '../../utils/backNavigation';
import ContentBox from '@/components/ContentBox';

function NPCRosterContent() {
  const searchParams = useSearchParams();
  const backTarget = resolveBackTargetFromParam(searchParams.get('from'), 'gm-tools');
  const [npcs, setNpcs] = useState<SavedCharacter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNpcs();
  }, []);

  const loadNpcs = () => {
    try {
      const data = getCharactersByType('NPC');
      setNpcs(data);
    } catch (e) {
      console.error("Failed to load NPCs", e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this NPC?')) {
      deleteCharacter(id);
      loadNpcs();
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-off-white">
        Loading NPCs...
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ContentBox>
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
           <div>
              <Link
                href={backTarget.href}
                className="text-muted-eldritch-green hover:text-soft-amethyst mb-2 inline-flex items-center gap-1 text-sm font-medium transition-colors"
              >
                ← {backTarget.label}
              </Link>
              <h1 className="text-3xl font-bold text-soft-amethyst">NPC Roster</h1>
              <p className="text-off-white/80 mt-1">Manage your generated NPCs.</p>
           </div>
           <Link
             href="/npc-generator"
             className="inline-flex items-center justify-center rounded-md bg-btn-bg px-5 py-2 text-sm font-semibold text-off-white shadow-md transition-colors hover:bg-btn-hover"
           >
             Create New NPC
           </Link>
        </div>

        {npcs.length === 0 ? (
          <div className="bg-charcoal-violet/50 rounded-lg p-8 text-center border border-muted-eldritch-green/30">
            <h2 className="text-xl font-bold text-soft-amethyst mb-2">No NPCs Found</h2>
            <p className="text-off-white/60 mb-4">
              You haven&apos;t created any NPCs yet.
            </p>
            <Link
               href="/npc-generator"
               className="text-muted-eldritch-green hover:underline"
            >
              Go to NPC Generator
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {npcs.map((npc) => {
              return (
                <div key={npc.id} className="bg-charcoal-violet rounded-lg p-5 border border-muted-eldritch-green/20 shadow-md hover:border-muted-eldritch-green/50 transition-colors flex flex-col h-full">
                  <div className="flex justify-between items-start mb-3">
                    <div className="overflow-hidden">
                      <h3 className="text-xl font-bold text-off-white truncate pr-2" title={npc.name}>{npc.name}</h3>
                      <p className="text-xs text-off-white/50">{npc.race} {npc.class} - Level {npc.level}</p>
                    </div>
                    <button
                      onClick={() => handleDelete(npc.id)}
                      className="text-red-400 hover:text-red-300 text-xs uppercase font-bold tracking-wide shrink-0 ml-2"
                      title="Delete NPC"
                    >
                      Delete
                    </button>
                  </div>

                  <div className="space-y-2 text-sm text-off-white/80 flex-grow">
                     <div className="grid grid-cols-3 gap-2 text-center text-xs mt-2 mb-3 bg-black/20 p-2 rounded">
                        <div>
                          <div className="text-muted-eldritch-green">Active DP</div>
                          <div className="font-bold text-off-white">{npc.computed.active_dp}</div>
                        </div>
                        <div>
                          <div className="text-muted-eldritch-green">Passive DP</div>
                          <div className="font-bold text-off-white">{npc.computed.passive_dp}</div>
                        </div>
                        <div>
                          <div className="text-muted-eldritch-green">Spirit</div>
                          <div className="font-bold text-off-white">{npc.computed.spirit_pts}</div>
                        </div>
                     </div>

                     {npc.status.notes && (
                       <div className="mt-2 text-xs italic text-off-white/60 line-clamp-3">
                          {npc.status.notes}
                       </div>
                     )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ContentBox>
    </div>
  );
}

export default function NPCRosterPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8 text-center text-off-white">Loading roster...</div>}>
      <NPCRosterContent />
    </Suspense>
  );
}
