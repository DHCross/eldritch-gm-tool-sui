'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { SavedCharacter, MonsterData } from '../../types/party';
import { getCharactersByType, deleteCharacter } from '../../utils/partyStorage';
import { resolveBackTargetFromParam } from '../../utils/backNavigation';
import ContentBox from '@/components/ContentBox';

function MonsterRosterContent() {
  const searchParams = useSearchParams();
  const backTarget = resolveBackTargetFromParam(searchParams.get('from'), 'gm-tools');
  const [monsters, setMonsters] = useState<SavedCharacter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Need to handle hydration mismatch if we read from localStorage immediately
    // so we wrap in useEffect
    loadMonsters();
  }, []);

  const loadMonsters = () => {
    try {
      const data = getCharactersByType('Monster');
      setMonsters(data);
    } catch (e) {
      console.error("Failed to load monsters", e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this monster?')) {
      deleteCharacter(id);
      loadMonsters();
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-off-white">
        Loading monsters...
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
              <h1 className="text-3xl font-bold text-soft-amethyst">Monster Roster</h1>
              <p className="text-off-white/80 mt-1">Manage your custom created monsters.</p>
           </div>
           <Link
             href="/monster-generator"
             className="inline-flex items-center justify-center rounded-md bg-btn-bg px-5 py-2 text-sm font-semibold text-off-white shadow-md transition-colors hover:bg-btn-hover"
           >
             Create New Monster
           </Link>
        </div>

        {monsters.length === 0 ? (
          <div className="bg-charcoal-violet/50 rounded-lg p-8 text-center border border-muted-eldritch-green/30">
            <h2 className="text-xl font-bold text-soft-amethyst mb-2">No Monsters Found</h2>
            <p className="text-off-white/60 mb-4">
              You haven&apos;t created any custom monsters yet.
            </p>
            <Link
               href="/monster-generator"
               className="text-muted-eldritch-green hover:underline"
            >
              Go to Monster Generator
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {monsters.map((monster) => {
              const monsterData = monster as MonsterData;
              const qsb = monster.full_data?.qsbString as string;

              return (
                <div key={monster.id} className="bg-charcoal-violet rounded-lg p-5 border border-muted-eldritch-green/20 shadow-md hover:border-muted-eldritch-green/50 transition-colors flex flex-col h-full">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-off-white truncate pr-2">{monster.name}</h3>
                    <button
                      onClick={() => handleDelete(monster.id)}
                      className="text-red-400 hover:text-red-300 text-xs uppercase font-bold tracking-wide"
                      title="Delete Monster"
                    >
                      Delete
                    </button>
                  </div>

                  <div className="space-y-2 text-sm text-off-white/80 flex-grow">
                    <p><span className="text-muted-eldritch-green font-semibold">Type:</span> {monster.race}</p>

                     {/* Display Threat MV if available */}
                     {(monster.full_data?.threatMV || monsterData.threat_mv) && (
                        <p>
                          <span className="text-muted-eldritch-green font-semibold">Threat MV:</span> {
                            (monster.full_data?.threatMV as number) || monsterData.threat_mv
                          }
                        </p>
                     )}

                     <p>
                       <span className="text-muted-eldritch-green font-semibold">HP:</span> {
                         (monster.full_data?.finalHP as number) || (monster.computed.active_dp + monster.computed.passive_dp)
                       }
                       <span className="text-off-white/50 text-xs ml-1">
                         ({monster.computed.active_dp}/{monster.computed.passive_dp})
                       </span>
                     </p>

                     {qsb && (
                       <div className="mt-4 p-3 bg-black/40 rounded border border-white/5 text-xs font-mono text-green-400/90 whitespace-pre-wrap overflow-hidden max-h-32 shadow-inner">
                          {qsb.split('\n').slice(0, 3).join('\n')}
                          {qsb.split('\n').length > 3 && '...'}
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

export default function MonsterRosterPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8 text-center text-off-white">Loading roster...</div>}>
      <MonsterRosterContent />
    </Suspense>
  );
}
