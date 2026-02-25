'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  abilities,
  calculateCPSpent,
  classes,
  createCharacterShell,
  deepCloneCharacter,
  dieRanks,
  fnum,
  foci,
  focusStepCost,
  magicPathsByClass,
  races,
  specs,
  stepCost,
  updateDerivedCharacterData,
  weaknessReport,
  levels,
  mv,
  type Character,
  type DieRank
} from '../utils/characterBuild';
import type { ClassName, RaceName } from '../data/gameData';
import {
  saveCharacter,
  generateId,
  getCurrentUserId,
  getAllPartyFolders,
  savePartyMembership,
  getPartyMemberships
} from '../utils/partyStorage';
import {
  generateRandomName,
  getNameSuggestionsForCharacter,
  Gender,
  NameCulture,
  RACE_CULTURE_MAP
} from '../utils/nameGenerator';
import { SavedCharacter, PartyFolder, PartyMembership } from '../types/party';

interface CPBreakdown {
  abilities: number;
  specialties: number;
  focuses: number;
  advantages: number;
  total: number;
}

const getBudgetForLevel = (level: number) => (level === 1 ? 10 : 10 + (level - 1) * 100);
const NAME_CULTURE_OPTIONS: NameCulture[] = ['English', 'Scottish', 'Welsh', 'Irish', 'Norse', 'French', 'Germanic', 'Fantasy'];

export default function ManualCharacterBuilder() {
  const [selectedRace, setSelectedRace] = useState('');
  const [selectedClass, setSelectedClass] = useState<ClassName | ''>('');
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [selectedMagicPath, setSelectedMagicPath] = useState('');

  const [character, setCharacter] = useState<Character | null>(null);
  const [baseCharacter, setBaseCharacter] = useState<Character | null>(null);
  const [cpSpent, setCpSpent] = useState<CPBreakdown | null>(null);

  const [pcName, setPcName] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [characterGender, setCharacterGender] = useState<Gender>('Male');
  const [nameCulture, setNameCulture] = useState<NameCulture>('English');
  const [suggestedNames, setSuggestedNames] = useState<Array<{ firstName: string; familyName?: string; culture: NameCulture; suggestion: string }>>([]);

  const selectedClassMagicPaths = selectedClass ? magicPathsByClass[selectedClass] : undefined;

  const [partyFolders, setPartyFolders] = useState<PartyFolder[]>([]);
  const [selectedParty, setSelectedParty] = useState('');
  const [showPartyAssignment, setShowPartyAssignment] = useState(false);
  const [interactionWarning, setInteractionWarning] = useState<string | null>(null);

  useEffect(() => {
    const pcFolders = getAllPartyFolders().filter(folder => folder.folder_type === 'PC_party');
    setPartyFolders(pcFolders);
  }, []);

  useEffect(() => {
    if (character?.race && RACE_CULTURE_MAP[character.race]) {
      setNameCulture(RACE_CULTURE_MAP[character.race]);
    }
  }, [character?.race]);

  useEffect(() => {
    if (character?.race && character?.class) {
      const suggestions = getNameSuggestionsForCharacter(
        character.race,
        character.class,
        characterGender,
        8,
        nameCulture
      );
      setSuggestedNames(suggestions);
    }
  }, [character?.race, character?.class, characterGender, nameCulture]);

  const cpBudget = useMemo(() => getBudgetForLevel(selectedLevel), [selectedLevel]);

  useEffect(() => {
    if (selectedRace && selectedClass) {
      const { character: workingCharacter, baseCharacter: minimaCharacter } = createCharacterShell(
        selectedRace as RaceName,
        selectedClass,
        selectedLevel
      );
      updateDerivedCharacterData(workingCharacter);
      setCharacter(workingCharacter);
      setBaseCharacter(minimaCharacter);
      setCpSpent(calculateCPSpent(workingCharacter, minimaCharacter, false));
    } else {
      setCharacter(null);
      setBaseCharacter(null);
      setCpSpent(null);
    }
  }, [selectedRace, selectedClass, selectedLevel]);

  useEffect(() => {
    setCharacter(prev => {
      if (!prev) return prev;
      const next = deepCloneCharacter(prev);
      next.magicPath = selectedMagicPath;
      return next;
    });
  }, [selectedMagicPath]);

  const applyCharacterUpdate = (updater: (draft: Character) => void) => {
    if (!character || !baseCharacter) return;
    const next = deepCloneCharacter(character);
    updater(next);
    updateDerivedCharacterData(next);
    setCharacter(next);
    setCpSpent(calculateCPSpent(next, baseCharacter, false));
    setInteractionWarning(null);
  };

  const adjustAbility = (ability: string, delta: number) => {
    if (!character || !baseCharacter) return;
    const currentIndex = dieRanks.indexOf(character.abilities[ability] as DieRank);
    const minIndex = dieRanks.indexOf(baseCharacter.abilities[ability] as DieRank);
    const nextIndex = currentIndex + delta;
    if (nextIndex < minIndex || nextIndex < 0 || nextIndex >= dieRanks.length) return;

    if (delta > 0) {
      const currentRank = character.abilities[ability] as DieRank;
      const cost = stepCost[currentRank];
      if (cost > cpRemaining) {
        setInteractionWarning('Not enough CP remaining to increase this ability.');
        return;
      }
    }

    applyCharacterUpdate(draft => {
      draft.abilities[ability] = dieRanks[nextIndex];
    });
  };

  const adjustSpecialty = (ability: string, specialty: string, delta: number) => {
    if (!character || !baseCharacter) return;
    const currentIndex = dieRanks.indexOf(character.specialties[ability][specialty] as DieRank);
    const minIndex = dieRanks.indexOf(baseCharacter.specialties[ability][specialty] as DieRank);
    const nextIndex = currentIndex + delta;
    if (nextIndex < minIndex || nextIndex < 0 || nextIndex >= dieRanks.length) return;

    if (delta > 0) {
      const currentRank = character.specialties[ability][specialty] as DieRank;
      const cost = stepCost[currentRank];
      if (cost > cpRemaining) {
        setInteractionWarning('Not enough CP remaining to increase this specialty.');
        return;
      }
    }

    applyCharacterUpdate(draft => {
      draft.specialties[ability][specialty] = dieRanks[nextIndex];
    });
  };

  const adjustFocus = (ability: string, specialty: string, focusKey: string, delta: number) => {
    if (!character || !baseCharacter) return;
    const currentValue = fnum(character.focuses[ability][focusKey]);
    const minValue = fnum(baseCharacter.focuses[ability][focusKey]);
    const nextValue = currentValue + delta;
    if (nextValue < minValue || nextValue < 0 || nextValue > 5) return;

    if (delta > 0 && focusStepCost > cpRemaining) {
      setInteractionWarning('Not enough CP remaining to increase this focus.');
      return;
    }

    applyCharacterUpdate(draft => {
      draft.focuses[ability][focusKey] = `+${nextValue}`;
    });
  };

  const cpSpentFromBudget = useMemo(() => (cpSpent ? cpSpent.total : 0), [cpSpent]);
  const cpRemaining = useMemo(() => cpBudget - cpSpentFromBudget, [cpBudget, cpSpentFromBudget]);

  const cpWarning = cpRemaining < 0 ? `You have overspent by ${Math.abs(cpRemaining)} CP.` : null;
  const weaknessWarnings = character ? weaknessReport(character) : [];
  const combinedWarnings = [interactionWarning, cpWarning, ...weaknessWarnings].filter(Boolean) as string[];
  const canFinalize = Boolean(character && baseCharacter && cpRemaining >= 0);

  const resetBuilder = () => {
    setSelectedRace('');
    setSelectedClass('');
    setSelectedMagicPath('');
    setCharacter(null);
    setBaseCharacter(null);
    setCpSpent(null);
    setInteractionWarning(null);
  };

  const saveCharacterToRoster = () => {
    if (!character) return;
    setShowPartyAssignment(true);
  };

  const confirmSaveCharacter = () => {
    if (!character) return;
    const charName = pcName.trim() || prompt('Enter character name:', `${character.race} ${character.class}`);
    if (!charName) return;

    const savedChar: SavedCharacter = {
      id: generateId(),
      user_id: getCurrentUserId(),
      name: charName.trim(),
      type: 'PC',
      level: character.level,
      race: character.race,
      class: character.class,
      abilities: {
        prowess_mv: mv(character.abilities.Prowess),
        agility_mv: mv(character.specialties.Prowess.Agility),
        melee_mv: mv(character.specialties.Prowess.Melee),
        fortitude_mv: mv(character.abilities.Fortitude),
        endurance_mv: mv(character.specialties.Fortitude.Endurance),
        strength_mv: mv(character.specialties.Fortitude.Strength),
        competence_mv: mv(character.abilities.Competence),
        willpower_mv: mv(character.specialties.Fortitude.Willpower),
        expertise_mv: mv(character.specialties.Competence.Expertise),
        perception_mv: mv(character.specialties.Competence.Perception),
        adroitness_mv: mv(character.specialties.Competence.Adroitness),
        precision_mv: mv(character.specialties.Prowess.Precision)
      },
      computed: {
        active_dp: character.pools.active,
        passive_dp: character.pools.passive,
        spirit_pts: character.pools.spirit
      },
      status: {
        current_hp_active: character.pools.active,
        current_hp_passive: character.pools.passive,
        status_flags: [],
        gear: character.equipment || [],
        notes: playerName ? `Player: ${playerName}` : ''
      },
      tags: ['Manual Build', `Level ${character.level}`, characterGender],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      full_data: {
        ...character as unknown as Record<string, unknown>,
        player_name: playerName,
        character_gender: characterGender,
        name_culture: nameCulture,
        magic_path: selectedMagicPath,
        build_method: 'manual'
      }
    };

    saveCharacter(savedChar);

    if (selectedParty) {
      const existingMemberships = getPartyMemberships(selectedParty);
      const membership: PartyMembership = {
        id: generateId(),
        party_id: selectedParty,
        character_id: savedChar.id,
        order_index: existingMemberships.length,
        active: true
      };
      savePartyMembership(membership);
      const partyName = partyFolders.find(f => f.id === selectedParty)?.name || 'party';
      alert(`${savedChar.name} added to ${partyName}!`);
    } else {
      alert(`${savedChar.name} saved to roster!`);
    }

    setShowPartyAssignment(false);
    setSelectedParty('');
  };

  const handleRandomName = () => {
    if (!character) return;
    const randomName = generateRandomName(characterGender, nameCulture, true, character.race);
    setPcName(`${randomName.firstName}${randomName.familyName ? ` ${randomName.familyName}` : ''}`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-off-white">Manual Character Builder</h1>
          <p className="text-sm text-off-white/60">Plan every CP by hand to create bespoke heroes. Choose race, class, and level, then allocate abilities, specialties, and focuses within your budget.</p>
        </div>
        <button
          onClick={resetBuilder}
          className="rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-off-white/70 hover:bg-white/10"
        >
          Reset
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <div className="bg-white/5 rounded-xl border border-white/10 p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-off-white/80" htmlFor="race">Race</label>
            <select
              id="race"
              className="w-full rounded-lg border border-white/15 bg-white/5 text-off-white p-2.5"
              value={selectedRace}
              onChange={(e) => setSelectedRace(e.target.value)}
            >
              <option value="">Select Race</option>
              {races.map(race => <option key={race} value={race}>{race}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-off-white/80" htmlFor="class">Class</label>
            <select
              id="class"
              className="w-full rounded-lg border border-white/15 bg-white/5 text-off-white p-2.5"
              value={selectedClass}
              onChange={(e) => {
                const nextClass = e.target.value as ClassName | '';
                setSelectedClass(nextClass);
                setSelectedMagicPath('');
              }}
            >
              <option value="">Select Class</option>
              {classes.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-off-white/80" htmlFor="level">Level</label>
            <select
              id="level"
              className="w-full rounded-lg border border-white/15 bg-white/5 text-off-white p-2.5"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(parseInt(e.target.value))}
            >
              {levels.map(level => <option key={level} value={level}>{level}</option>)}
            </select>
          </div>
          {selectedClassMagicPaths && selectedClass !== 'Adept' && selectedClass !== 'Mystic' && (
            <div>
              <label className="block text-sm font-medium mb-1 text-off-white/80" htmlFor="magic-path">Magic Path</label>
              <select
                id="magic-path"
                className="w-full rounded-lg border border-white/15 bg-white/5 text-off-white p-2.5"
                value={selectedMagicPath}
                onChange={(e) => setSelectedMagicPath(e.target.value)}
              >
                <option value="">Select Path</option>
                {selectedClassMagicPaths.map(path => <option key={path} value={path}>{path}</option>)}
              </select>
            </div>
          )}
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="text-sm text-off-white/50">CP Budget</div>
              <div className="text-2xl font-bold text-off-white">{cpBudget}</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="text-sm text-off-white/50">CP Spent</div>
              <div className="text-2xl font-bold text-off-white">{cpSpentFromBudget}</div>
            </div>
            <div className={`border rounded-xl p-4 ${cpRemaining < 0 ? 'border-red-500/30 bg-red-900/20' : 'border-white/10 bg-white/5'}`}>
              <div className="text-sm text-off-white/50">CP Remaining</div>
              <div className={`text-2xl font-bold ${cpRemaining < 0 ? 'text-red-400' : 'text-off-white'}`}>{cpRemaining}</div>
            </div>
          </div>

          {cpSpent && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-off-white/70">
              <h3 className="font-semibold text-base mb-2 text-off-white">CP Breakdown</h3>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <div>Abilities: <span className="font-semibold text-off-white">{cpSpent.abilities}</span></div>
                <div>Specialties: <span className="font-semibold text-off-white">{cpSpent.specialties}</span></div>
                <div>Focuses: <span className="font-semibold text-off-white">{cpSpent.focuses}</span></div>
                <div>Advantages: <span className="font-semibold text-off-white">{cpSpent.advantages}</span></div>
              </div>
              <p className="text-xs text-off-white/40 mt-2 italic">
                Focus bonuses also spend CP unless they are part of the starting race/class package.
              </p>
            </div>
          )}

          {combinedWarnings.length > 0 && (
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-4 text-sm text-yellow-300 space-y-1">
              {combinedWarnings.map((warning, index) => (
                <div key={`${warning}-${index}`}>{warning}</div>
              ))}
            </div>
          )}

          {character ? (
            <div className="space-y-4">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <h2 className="text-lg font-semibold mb-3 text-off-white">Abilities & Specialties</h2>
                <div className="space-y-4">
                  {abilities.map(ability => (
                    <div key={ability} className="border border-white/10 rounded-lg">
                      <div className="flex items-center justify-between px-3 py-2 bg-white/5 rounded-t-lg">
                        <div>
                          <div className="text-sm font-semibold text-muted-eldritch-green">{ability}</div>
                          <div className="text-xs text-off-white/40">Minimum: {baseCharacter?.abilities[ability]}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            className="w-8 h-8 rounded-full border border-white/20 bg-white/10 text-off-white"
                            onClick={() => adjustAbility(ability, -1)}
                          >
                            −
                          </button>
                          <span className="font-mono text-lg text-off-white">{character.abilities[ability]}</span>
                          <button
                            className="w-8 h-8 rounded-full border border-white/20 bg-white/10 text-off-white"
                            onClick={() => adjustAbility(ability, 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="px-4 py-3 space-y-3">
                        {specs[ability as keyof typeof specs].map(spec => (
                          <div key={spec} className="border border-white/10 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-sm font-medium text-off-white/90">{spec}</div>
                                <div className="text-xs text-off-white/40">Minimum: {baseCharacter?.specialties[ability][spec]}</div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  className="w-7 h-7 rounded-full border border-white/20 bg-white/10 text-off-white"
                                  onClick={() => adjustSpecialty(ability, spec, -1)}
                                >
                                  −
                                </button>
                                <span className="font-mono text-off-white">{character.specialties[ability][spec]}</span>
                                <button
                                  className="w-7 h-7 rounded-full border border-white/20 bg-white/10 text-off-white"
                                  onClick={() => adjustSpecialty(ability, spec, 1)}
                                >
                                  +
                                </button>
                              </div>
                            </div>
                            <div className="grid gap-2 mt-3 md:grid-cols-2">
                              {foci[spec as keyof typeof foci].map(focusKey => (
                                <div key={focusKey} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
                                  <div>
                                    <div className="text-sm font-medium text-off-white/80">{focusKey}</div>
                                    <div className="text-xs text-off-white/40">Minimum: +{fnum(baseCharacter?.focuses[ability][focusKey] ?? '+0')}</div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      className="w-6 h-6 rounded-full border border-white/20 bg-white/10 text-off-white"
                                      onClick={() => adjustFocus(ability, spec, focusKey, -1)}
                                    >
                                      −
                                    </button>
                                    <span className="font-mono text-off-white">{character.focuses[ability][focusKey]}</span>
                                    <button
                                      className="w-6 h-6 rounded-full border border-white/20 bg-white/10 text-off-white"
                                      onClick={() => adjustFocus(ability, spec, focusKey, 1)}
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="text-sm text-off-white/50">Mastery Die</div>
                  <div className="text-xl font-semibold text-off-white">{character.masteryDie}</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="text-sm text-off-white/50">Advantages</div>
                  <ul className="text-sm list-disc pl-5 mt-1 space-y-1 text-off-white/80">
                    {character.advantages.map(adv => <li key={adv}>{adv}</li>)}
                  </ul>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="text-sm text-off-white/50">Equipment</div>
                  <ul className="text-sm list-disc pl-5 mt-1 space-y-1 text-off-white/80">
                    {character.equipment.map(item => <li key={item}>{item}</li>)}
                  </ul>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <h3 className="font-semibold mb-3 text-off-white">Name & Player Info</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-off-white/80" htmlFor="pc-name">Character Name</label>
                    <input
                      id="pc-name"
                      value={pcName}
                      onChange={(e) => setPcName(e.target.value)}
                      className="w-full rounded-lg border border-white/15 bg-white/5 text-off-white p-2.5 placeholder-off-white/30"
                      placeholder="Enter name"
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={handleRandomName}
                        className="text-xs px-3 py-1.5 rounded-full border border-white/20 text-off-white/70 hover:bg-white/10"
                      >
                        Random Name
                      </button>
                      <select
                        value={nameCulture}
                        onChange={(e) => setNameCulture(e.target.value as NameCulture)}
                        className="text-xs rounded-full border border-white/20 bg-white/5 text-off-white px-3 py-1.5"
                      >
                        {NAME_CULTURE_OPTIONS.map(culture => (
                          <option key={culture} value={culture}>{culture}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-off-white/80" htmlFor="player-name">Player Name</label>
                    <input
                      id="player-name"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      className="w-full rounded-lg border border-white/15 bg-white/5 text-off-white p-2.5 placeholder-off-white/30"
                      placeholder="Optional"
                    />
                    <div className="flex gap-3 mt-3 text-sm text-off-white/70">
                      {(['Male', 'Female'] as Gender[]).map(g => (
                        <label key={g} className="flex items-center gap-1">
                          <input
                            type="radio"
                            value={g}
                            checked={characterGender === g}
                            onChange={(e) => setCharacterGender(e.target.value as Gender)}
                          />
                          {g}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                {suggestedNames.length > 0 && (
                  <div className="mt-3">
                    <div className="text-xs font-semibold text-off-white/50 uppercase">Suggestions</div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {suggestedNames.map(name => {
                        const fullName = `${name.firstName}${name.familyName ? ` ${name.familyName}` : ''}`;
                        return (
                          <button
                            key={name.suggestion}
                            onClick={() => setPcName(fullName)}
                            className="text-xs rounded-full border border-white/20 px-3 py-1 text-off-white/70 hover:bg-white/10"
                          >
                            {fullName}
                            <span className="text-off-white/40 ml-1">({name.culture})</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  className="rounded-full bg-muted-eldritch-green hover:bg-muted-eldritch-green/80 text-charcoal-violet font-semibold py-2.5 px-6 shadow disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={saveCharacterToRoster}
                  disabled={!canFinalize}
                >
                  Save to Roster
                </button>
                <button
                  className="rounded-full border border-white/20 px-6 py-2.5 text-sm font-medium text-off-white/70 hover:bg-white/10"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                  Back to Top
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white/5 border border-dashed border-white/20 rounded-xl p-6 text-center text-off-white/50">
              Choose a race, class, and level to start allocating CP.
            </div>
          )}
        </div>
      </div>

      {showPartyAssignment && character && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-charcoal-violet rounded-xl shadow-lg border border-white/10 p-6 w-full max-w-lg space-y-4">
            <h3 className="text-lg font-semibold text-off-white">Assign to Party</h3>
            <p className="text-sm text-off-white/60">Optionally choose a party folder for this character.</p>
            <select
              className="w-full rounded-lg border border-white/15 bg-white/5 text-off-white p-2.5"
              value={selectedParty}
              onChange={(e) => setSelectedParty(e.target.value)}
            >
              <option value="">No Party Assignment</option>
              {partyFolders.map(folder => (
                <option key={folder.id} value={folder.id}>{folder.name}</option>
              ))}
            </select>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 text-sm rounded-full border border-white/20 text-off-white/70 hover:bg-white/10"
                onClick={() => setShowPartyAssignment(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm rounded-full bg-soft-amethyst text-white font-medium hover:bg-soft-amethyst/80"
                onClick={confirmSaveCharacter}
                disabled={!canFinalize}
              >
                Confirm Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
