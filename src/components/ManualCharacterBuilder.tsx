'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
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
  getCreationRuleSummary,
  getCrossDisciplineSpellcastingSummary,
  getCustomizationBudget,
  getFocusSwapCPCost,
  getMulticlassFeatCost,
  magicPathsByClass,
  races,
  specs,
  spendCP,
  stepCost,
  updateDerivedCharacterData,
  weaknessReport,
  levels,
  mv,
  type Character,
  type DieRank,
  type FocusSwapSelection
} from '../utils/characterBuild';
import { type ClassName, type RaceName, races as raceDefinitions } from '../data/gameData';
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

const NAME_CULTURE_OPTIONS: NameCulture[] = ['English', 'Scottish', 'Welsh', 'Irish', 'Norse', 'French', 'Germanic', 'Fantasy'];
const MYTHIC_RACE_SUFFIX = '__mythic';

const parseRaceSelection = (value: string): { race: string; mythic: boolean } => {
  if (!value) {
    return { race: '', mythic: false };
  }

  if (value.endsWith(MYTHIC_RACE_SUFFIX)) {
    return {
      race: value.slice(0, -MYTHIC_RACE_SUFFIX.length),
      mythic: true
    };
  }

  return { race: value, mythic: false };
};

const buildRaceSelectionValue = (race: string, mythic: boolean) => (
  mythic ? `${race}${MYTHIC_RACE_SUFFIX}` : race
);

const ADVANTAGE_DESCRIPTIONS: Record<string, string> = {
  Menacing: 'You are unsettling in close social pressure and intimidation scenes.',
  Brutishness: 'Raw force and momentum dominate your close-quarters approach.',
  ArcaneInheritance: 'Latent magical heritage improves access to arcane pressure moments.',
  IronWill: 'Mental pressure and coercion are harder to force through you.',
  KeenSenses: 'Subtle clues and hidden details are easier to catch under stress.'
};

const toGuidanceWarning = (warning: string) => {
  if (warning.includes('Low Spirit Points')) {
    return 'Low Spirit Points - magical pressure will be dangerous. Consider improving Willpower or related focuses.';
  }
  if (warning.includes('Low Active DP')) {
    return 'Low Active DP - dodging and parrying will be difficult. Consider raising Agility, Reaction, or defensive specialties.';
  }
  if (warning.includes('Low Passive DP')) {
    return 'Low Passive DP - sustained punishment may overwhelm this build. Fortitude and Endurance can stabilize survivability.';
  }
  if (warning.toLowerCase().includes('ranged')) {
    return 'Weak ranged capability - consider improving Precision or ranged-aligned focuses.';
  }
  return warning;
};

export default function ManualCharacterBuilder() {
  const [selectedRace, setSelectedRace] = useState('');
  const [selectedClass, setSelectedClass] = useState<ClassName | ''>('');
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [selectedMagicPath, setSelectedMagicPath] = useState('');
  const [focusSwapSource, setFocusSwapSource] = useState('');
  const [focusSwapTarget, setFocusSwapTarget] = useState('');
  const [focusSwapMode, setFocusSwapMode] = useState<'standard' | 'single_specialty_broad' | 'single_specialty_upgrade'>('standard');
  const [customFlawInput, setCustomFlawInput] = useState('');

  const [character, setCharacter] = useState<Character | null>(null);
  const [baseCharacter, setBaseCharacter] = useState<Character | null>(null);
  const [cpSpent, setCpSpent] = useState<CPBreakdown | null>(null);

  const [pcName, setPcName] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [characterGender, setCharacterGender] = useState<Gender>('Male');
  const [nameCulture, setNameCulture] = useState<NameCulture>('English');
  const [suggestedNames, setSuggestedNames] = useState<Array<{ firstName: string; familyName?: string; culture: NameCulture; suggestion: string }>>([]);

  const selectedClassMagicPaths = selectedClass ? magicPathsByClass[selectedClass] : undefined;
  const selectedRaceDetails = useMemo(() => parseRaceSelection(selectedRace), [selectedRace]);
  const selectedRaceName = selectedRaceDetails.race;
  const mythicCustomization = selectedRaceDetails.mythic;
  const creationRules = useMemo(
    () => (selectedRaceName && selectedClass ? getCreationRuleSummary(selectedRaceName as RaceName, selectedClass) : null),
    [selectedRaceName, selectedClass]
  );
  const dupAbilitySet = useMemo(
    () => new Set(creationRules?.duplicateMinima.filter(m => m.kind === 'ability').map(m => m.key) ?? []),
    [creationRules]
  );
  const dupSpecialtyMap = useMemo(
    () => new Map(creationRules?.duplicateMinima.filter(m => m.kind === 'specialty').map(m => [m.key, m.value]) ?? []),
    [creationRules]
  );
  const dupFocusMap = useMemo(
    () => new Map(creationRules?.duplicateMinima.filter(m => m.kind === 'focus').map(m => [m.key, m.value]) ?? []),
    [creationRules]
  );
  const packageFocusMap = useMemo(() => {
    const m = new Map<string, { kind: 'racial' | 'class'; value: number }>();
    for (const b of creationRules?.racialFocusBonuses ?? []) m.set(b.focus, { kind: 'racial', value: b.value });
    for (const b of creationRules?.classGrantedFocuses ?? []) m.set(b.focus, { kind: 'class', value: b.value });
    return m;
  }, [creationRules]);
  const activeFocusSwap = useMemo<FocusSwapSelection | undefined>(() => (
    focusSwapSource && focusSwapTarget
      ? {
          sourceFocus: focusSwapSource,
          targetFocus: focusSwapTarget,
          mode: creationRules?.singleSpecialtyFocusSwap ? focusSwapMode : 'standard'
        }
      : undefined
  ), [creationRules?.singleSpecialtyFocusSwap, focusSwapMode, focusSwapSource, focusSwapTarget]);

  const [partyFolders, setPartyFolders] = useState<PartyFolder[]>([]);
  const [selectedParty, setSelectedParty] = useState('');
  const [showPartyAssignment, setShowPartyAssignment] = useState(false);
  const [interactionWarning, setInteractionWarning] = useState<string | null>(null);
  const [expandedAbilities, setExpandedAbilities] = useState<Record<string, boolean>>(() => (
    abilities.reduce((acc, ability, index) => {
      acc[ability] = index === 0;
      return acc;
    }, {} as Record<string, boolean>)
  ));
  const [cpDelta, setCpDelta] = useState<number | null>(null);
  const previousCpSpent = useRef(0);

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

  useEffect(() => {
    if (!creationRules) {
      setFocusSwapSource('');
      setFocusSwapTarget('');
      setFocusSwapMode('standard');
      return;
    }

    const validSources = new Set(creationRules.racialFocusBonuses.map(entry => entry.focus));
    if (focusSwapSource && !validSources.has(focusSwapSource)) {
      setFocusSwapSource('');
    }

    const validTargets = new Set(creationRules.focusSwapTargets.map(entry => entry.focus));
    if (focusSwapTarget && !validTargets.has(focusSwapTarget)) {
      setFocusSwapTarget('');
    }

    if (focusSwapTarget && focusSwapTarget === focusSwapSource) {
      setFocusSwapTarget('');
    }

    if (!focusSwapSource && creationRules.racialFocusBonuses.length === 1) {
      setFocusSwapSource(creationRules.racialFocusBonuses[0].focus);
    }

    if (creationRules.singleSpecialtyFocusSwap && focusSwapMode === 'standard') {
      setFocusSwapMode('single_specialty_broad');
    }

    if (!creationRules.singleSpecialtyFocusSwap && focusSwapMode !== 'standard') {
      setFocusSwapMode('standard');
    }
  }, [creationRules, focusSwapMode, focusSwapSource, focusSwapTarget]);

  const cpBudget = useMemo(
    () => getCustomizationBudget(selectedLevel, mythicCustomization),
    [selectedLevel, mythicCustomization]
  );
  const selectableDefaultAdvantages = useMemo(() => (baseCharacter?.advantages ?? []), [baseCharacter]);
  const selectableDefaultFlaws = useMemo(
    () => (selectedRaceName ? [...(raceDefinitions[selectedRaceName as RaceName]?.flaws ?? [])] : []),
    [selectedRaceName]
  );
  const focusSwapCpCost = useMemo(() => getFocusSwapCPCost(activeFocusSwap), [activeFocusSwap]);

  useEffect(() => {
    if (selectedRaceName && selectedClass) {
      const { character: workingCharacter, baseCharacter: minimaCharacter } = createCharacterShell(
        selectedRaceName as RaceName,
        selectedClass,
        selectedLevel,
        { focusSwap: activeFocusSwap }
      );
      updateDerivedCharacterData(workingCharacter);
      setCharacter(workingCharacter);
      setBaseCharacter(minimaCharacter);
      setCpSpent(calculateCPSpent(workingCharacter, minimaCharacter, false, focusSwapCpCost));
    } else {
      setCharacter(null);
      setBaseCharacter(null);
      setCpSpent(null);
    }
  }, [selectedRaceName, selectedClass, selectedLevel, activeFocusSwap, focusSwapCpCost]);

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
    setCpSpent(calculateCPSpent(next, baseCharacter, false, focusSwapCpCost));
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
    if (delta > 0 && character.specialties[ability][specialty] === 'd0') {
      setInteractionWarning(`Train ${specialty} to at least d4 before increasing ${focusKey}.`);
      return;
    }

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

  // calculateCPSpent already measures only the delta above the race/class baseline,
  // so cpSpent.total IS the correct number of customization CPs spent.
  const cpSpentFromBudget = useMemo(() => (cpSpent ? cpSpent.total : 0), [cpSpent]);
  const cpRemaining = useMemo(() => cpBudget - cpSpentFromBudget, [cpBudget, cpSpentFromBudget]);

  const cpWarning = cpRemaining < 0 ? `You have overspent by ${Math.abs(cpRemaining)} CP.` : null;
  const weaknessWarnings = character ? weaknessReport(character) : [];
  const combinedWarnings = [interactionWarning, cpWarning, ...weaknessWarnings]
    .filter(Boolean)
    .map(warning => toGuidanceWarning(warning as string)) as string[];
  const canFinalize = Boolean(character && baseCharacter && cpRemaining >= 0);
  const multiclassFeatCost = useMemo(() => getMulticlassFeatCost(selectedLevel), [selectedLevel]);
  const crossDisciplineSpellcasting = useMemo(
    () => (character ? getCrossDisciplineSpellcastingSummary(character) : null),
    [character]
  );
  const selectedFocusSwapSource = creationRules?.racialFocusBonuses.find(entry => entry.focus === focusSwapSource) ?? null;

  const addCustomFocus = (ability: keyof typeof specs, specialty: string) => {
    if (!character || character.specialties[ability][specialty] === 'd0') {
      setInteractionWarning(`Train ${specialty} to at least d4 before adding a custom focus.`);
      return;
    }

    applyCharacterUpdate(draft => {
      draft.customFocuses.push({
        id: `custom-focus-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        ability,
        specialty: specialty as (typeof specs)[keyof typeof specs][number],
        name: '',
        value: '+0'
      });
    });
  };

  const updateCustomFocusName = (focusId: string, name: string) => {
    applyCharacterUpdate(draft => {
      const customFocus = draft.customFocuses.find(entry => entry.id === focusId);
      if (customFocus) {
        customFocus.name = name;
      }
    });
  };

  const adjustCustomFocus = (focusId: string, delta: number) => {
    if (!character) return;
    const customFocus = character.customFocuses.find(entry => entry.id === focusId);
    if (!customFocus) return;
    if (delta > 0 && character.specialties[customFocus.ability][customFocus.specialty] === 'd0') {
      setInteractionWarning(`Train ${customFocus.specialty} to at least d4 before increasing this custom focus.`);
      return;
    }

    const currentValue = fnum(customFocus.value);
    const nextValue = currentValue + delta;
    if (nextValue < 0 || nextValue > 5) return;

    if (delta > 0 && focusStepCost > cpRemaining) {
      setInteractionWarning('Not enough CP remaining to increase this custom focus.');
      return;
    }

    applyCharacterUpdate(draft => {
      const draftFocus = draft.customFocuses.find(entry => entry.id === focusId);
      if (draftFocus) {
        draftFocus.value = `+${nextValue}`;
      }
    });
  };

  const removeCustomFocus = (focusId: string) => {
    applyCharacterUpdate(draft => {
      draft.customFocuses = draft.customFocuses.filter(entry => entry.id !== focusId);
    });
  };

  const toggleAdvantage = (advantage: string, enabled: boolean) => {
    applyCharacterUpdate(draft => {
      if (enabled) {
        if (!draft.advantages.includes(advantage)) {
          draft.advantages.push(advantage);
        }
        return;
      }

      draft.advantages = draft.advantages.filter(existing => existing !== advantage);
    });
  };

  const toggleDefaultFlaw = (flaw: string, enabled: boolean) => {
    applyCharacterUpdate(draft => {
      if (enabled) {
        if (!draft.flaws.includes(flaw)) {
          draft.flaws.push(flaw);
        }
        return;
      }

      draft.flaws = draft.flaws.filter(existing => existing !== flaw);
    });
  };

  const addCustomFlaw = () => {
    const nextFlaw = customFlawInput.trim();
    if (!nextFlaw) return;

    applyCharacterUpdate(draft => {
      if (!draft.flaws.includes(nextFlaw)) {
        draft.flaws.push(nextFlaw);
      }
    });

    setCustomFlawInput('');
  };

  const removeFlaw = (flaw: string) => {
    applyCharacterUpdate(draft => {
      draft.flaws = draft.flaws.filter(existing => existing !== flaw);
    });
  };

  useEffect(() => {
    const previous = previousCpSpent.current;
    const diff = cpSpentFromBudget - previous;
    previousCpSpent.current = cpSpentFromBudget;
    if (diff === 0) return;

    setCpDelta(diff);
    const timeout = window.setTimeout(() => setCpDelta(null), 900);
    return () => window.clearTimeout(timeout);
  }, [cpSpentFromBudget]);

  const toggleAbilityBranch = (ability: string) => {
    setExpandedAbilities(prev => ({ ...prev, [ability]: !prev[ability] }));
  };

  const setAllBranchesExpanded = (expanded: boolean) => {
    setExpandedAbilities(
      abilities.reduce((acc, ability) => {
        acc[ability] = expanded;
        return acc;
      }, {} as Record<string, boolean>)
    );
  };

  const applyRecommendedBuild = () => {
    if (!character || !baseCharacter || !selectedClass) return;

    const recommended = deepCloneCharacter(baseCharacter);
    recommended.level = selectedLevel;
    recommended.magicPath = selectedMagicPath;

    const budget = { value: cpBudget - focusSwapCpCost };
    spendCP(recommended, budget, 'balanced', selectedLevel, false, true);
    updateDerivedCharacterData(recommended);

    setCharacter(recommended);
    setCpSpent(calculateCPSpent(recommended, baseCharacter, false, focusSwapCpCost));
    setInteractionWarning(`Applied recommended ${selectedClass} baseline. You can now fine-tune manually.`);
  };

  const resetBuilder = () => {
    setSelectedRace('');
    setSelectedClass('');
    setSelectedMagicPath('');
    setFocusSwapSource('');
    setFocusSwapTarget('');
    setFocusSwapMode('standard');
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
        build_method: 'manual',
        creation_options: {
          mythic_customization: mythicCustomization,
          focus_swap: activeFocusSwap ?? null
        }
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
        <div className="flex items-center gap-3">
          <Link
            href="/player-tools"
            className="flex items-center justify-center w-9 h-9 rounded-full border border-white/20 text-off-white/60 hover:bg-white/10 hover:text-off-white transition-colors"
            aria-label="Back to Player Tools"
          >
            ←
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-off-white">Manual Character Builder</h1>
            <p className="text-sm text-off-white/60">Plan every CP by hand to create bespoke heroes. Choose race, class, and level, then allocate abilities, specialties, and focuses within your budget.</p>
          </div>
        </div>
        <button
          onClick={resetBuilder}
          className="rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-off-white/70 hover:bg-white/10"
        >
          Reset
        </button>
      </div>

      {character && (
        <div className="sticky top-2 z-40 mb-6 rounded-xl border border-white/15 bg-charcoal-violet/85 backdrop-blur px-4 py-3 shadow-lg">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <span className="text-off-white/70">Budget: <span className="font-semibold text-off-white">{cpBudget}</span></span>
            <span className="text-off-white/70">Spent: <span className="font-semibold text-off-white">{cpSpentFromBudget}</span></span>
            <span className="text-off-white/70">Remaining: <span className={`font-semibold ${cpRemaining < 0 ? 'text-red-400' : cpRemaining < 4 ? 'text-yellow-300' : 'text-muted-eldritch-green'}`}>{cpRemaining}</span></span>
            <span className="text-off-white/50">A {cpSpent?.abilities ?? 0} | S {cpSpent?.specialties ?? 0} | F {cpSpent?.focuses ?? 0} | Adv {cpSpent?.advantages ?? 0}</span>
            {cpDelta !== null && (
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold animate-pulse ${cpDelta > 0 ? 'bg-red-900/40 text-red-300 border border-red-500/40' : 'bg-green-900/40 text-green-300 border border-green-500/40'}`}>
                {cpDelta > 0 ? `Spent +${cpDelta} CP` : `Refund ${Math.abs(cpDelta)} CP`}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-4">
        <div className="bg-white/5 rounded-xl border border-white/10 p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-off-white/80" htmlFor="race">Race</label>
            <select
              id="race"
              className="npc-native-select w-full rounded-lg border border-white/15 bg-white/5 text-off-white p-2.5"
              value={selectedRace}
              onChange={(e) => setSelectedRace(e.target.value)}
            >
              <option value="">Select Race</option>
              <optgroup label="Standard races">
                {races.map(race => (
                  <option key={race} value={race}>{race}</option>
                ))}
              </optgroup>
              <optgroup label="Mythic/custom campaign (+10 CP)">
                {races.map(race => (
                  <option key={`${race}-mythic`} value={buildRaceSelectionValue(race, true)}>
                    {race} (Mythic/custom)
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-off-white/80" htmlFor="class">Class</label>
            <select
              id="class"
              className="npc-native-select w-full rounded-lg border border-white/15 bg-white/5 text-off-white p-2.5"
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
              className="npc-native-select w-full rounded-lg border border-white/15 bg-white/5 text-off-white p-2.5"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(parseInt(e.target.value))}
            >
              {levels.map(level => <option key={level} value={level}>{level}</option>)}
            </select>
          </div>
          {selectedClassMagicPaths?.length && selectedClass !== 'Adept' && selectedClass !== 'Mystic' ? (
            <div>
              <label className="block text-sm font-medium mb-1 text-off-white/80" htmlFor="magic-path">Magic Path</label>
              <select
                id="magic-path"
                className="npc-native-select w-full rounded-lg border border-white/15 bg-white/5 text-off-white p-2.5"
                value={selectedMagicPath}
                onChange={(e) => setSelectedMagicPath(e.target.value)}
              >
                <option value="">Select Path</option>
                {selectedClassMagicPaths.map(path => <option key={path} value={path}>{path}</option>)}
              </select>
            </div>
          ) : null}
          <div className="rounded-xl border border-white/10 bg-white/5 p-3 space-y-3">
            <div>
              <div className="text-sm font-medium text-off-white/80">Character Creation Rules</div>
              <p className="mt-1 text-xs text-off-white/50">
                These Eldritch edge rules can apply to normal race/class builds too. Choose a Mythic/custom race option above to activate the +10 CP campaign bonus.
              </p>
            </div>
            <div className="text-xs text-off-white/45">
              Race dropdown options ending in <span className="font-semibold text-off-white/70">(Mythic/custom)</span> include the campaign bonus.
            </div>

            {creationRules?.duplicateBenefitAvailable && (
              <div className="rounded-lg border border-amber-400/20 bg-amber-500/10 p-3 text-xs text-amber-100">
                <div className="font-semibold">Duplicate benefit available</div>
                <div className="mt-1 text-amber-100/80">
                  One duplicate overlap can become a free 2-point advantage, an advantage tier-up, or a same-cost swap with any lower-value loss discarded.
                </div>
              </div>
            )}

            {creationRules && creationRules.racialFocusBonuses.length > 0 && creationRules.focusSwapTargets.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wide text-off-white/50">Focus Swap</div>
                {creationRules.racialFocusBonuses.length > 1 ? (
                  <select
                    className="npc-native-select w-full rounded-lg border border-white/15 bg-white/5 p-2 text-sm text-off-white"
                    value={focusSwapSource}
                    onChange={(e) => setFocusSwapSource(e.target.value)}
                  >
                    <option value="">Keep racial focus as-is</option>
                    {creationRules.racialFocusBonuses.map(entry => (
                      <option key={entry.focus} value={entry.focus}>
                        Swap {entry.focus} +{entry.value}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-off-white/80">
                    Source focus: {creationRules.racialFocusBonuses[0].focus} +{creationRules.racialFocusBonuses[0].value}
                  </div>
                )}
                {creationRules.singleSpecialtyFocusSwap && (
                  <div className="grid gap-2 sm:grid-cols-2">
                    <label className="flex items-start gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-off-white/75">
                      <input
                        type="radio"
                        name="focus-swap-mode"
                        value="single_specialty_broad"
                        checked={focusSwapMode === 'single_specialty_broad'}
                        onChange={() => setFocusSwapMode('single_specialty_broad')}
                      />
                      <span>
                        Reassign as +1
                        <span className="block text-xs text-off-white/45">Choose any focus not already granted by the class.</span>
                      </span>
                    </label>
                    <label className="flex items-start gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-off-white/75">
                      <input
                        type="radio"
                        name="focus-swap-mode"
                        value="single_specialty_upgrade"
                        checked={focusSwapMode === 'single_specialty_upgrade'}
                        onChange={() => setFocusSwapMode('single_specialty_upgrade')}
                      />
                      <span>
                        Upgrade to +2
                        <span className="block text-xs text-off-white/45">Uses the swap as a 4 CP discount and spends 4 CP from your budget.</span>
                      </span>
                    </label>
                  </div>
                )}
                <select
                  className="npc-native-select w-full rounded-lg border border-white/15 bg-white/5 p-2 text-sm text-off-white"
                  value={focusSwapTarget}
                  onChange={(e) => setFocusSwapTarget(e.target.value)}
                  disabled={!focusSwapSource}
                >
                  <option value="">
                    {creationRules.singleSpecialtyFocusSwap ? 'Choose target focus (trained specialty only)' : 'Choose class-linked focus'}
                  </option>
                  {creationRules.focusSwapTargets.filter(entry => entry.focus !== focusSwapSource).map(entry => (
                    <option key={entry.focus} value={entry.focus}>
                      {creationRules.singleSpecialtyFocusSwap ? `${entry.focus} (${entry.specialty})` : `${entry.specialty} → ${entry.focus}`}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-off-white/45">
                  {selectedFocusSwapSource
                    ? creationRules.singleSpecialtyFocusSwap
                      ? focusSwapMode === 'single_specialty_upgrade'
                        ? `Swaps ${selectedFocusSwapSource.focus} +${selectedFocusSwapSource.value} into a different focus at +2 and reserves 4 CP from your customization budget.`
                        : `Swaps ${selectedFocusSwapSource.focus} +${selectedFocusSwapSource.value} into any focus not already granted by ${selectedClass}.`
                      : `Swaps ${selectedFocusSwapSource.focus} +${selectedFocusSwapSource.value} into an ungranted focus tied to one of ${selectedClass}'s base specialties.`
                    : 'Choose the racial focus you want to reassign, then pick the target focus.'}
                </p>
                <p className="text-xs text-off-white/40">
                  Focus targets only appear when their parent specialty starts trained (d4 or higher).
                </p>
              </div>
            )}

            <div className="space-y-1 text-xs text-off-white/55">
              <div>Custom focuses cost 4 CP per +1 and should be GM-approved.</div>
              <div>Starting flaws should not exceed 4 CP total.</div>
            </div>
          </div>
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
                Standard and custom focus bonuses both spend CP unless they are part of the starting race/class package.
              </p>
              <div className="mt-4 border-t border-white/10 pt-3">
                <div className="text-xs uppercase tracking-wide text-off-white/50 mb-2">Quick Start Presets</div>
                <div className="flex flex-wrap gap-2">
                  <button
                    className="rounded-full border border-white/20 px-3 py-1.5 text-xs font-medium text-off-white/80 hover:bg-white/10"
                    onClick={applyRecommendedBuild}
                    disabled={!selectedClass}
                  >
                    Apply Recommended {selectedClass || 'Class'} Baseline
                  </button>
                </div>
              </div>
            </div>
          )}

          {character && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-4">
              <h3 className="font-semibold text-base text-off-white">Advantages & Flaws</h3>

              <div className="space-y-2">
                <div className="text-xs uppercase tracking-wide text-off-white/50">Default Advantages (Race/Class)</div>
                {selectableDefaultAdvantages.length > 0 ? (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {selectableDefaultAdvantages.map(advantage => (
                      <label key={advantage} className="flex items-start gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-off-white/80">
                        <input
                          type="checkbox"
                          className="mt-0.5"
                          checked={character.advantages.includes(advantage)}
                          onChange={(e) => toggleAdvantage(advantage, e.target.checked)}
                        />
                        <span>{advantage}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-off-white/50">Select race and class to load default advantages.</div>
                )}
              </div>

              <div className="space-y-2">
                <div className="text-xs uppercase tracking-wide text-off-white/50">Default Flaws (Race)</div>
                {selectableDefaultFlaws.length > 0 ? (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {selectableDefaultFlaws.map(flaw => (
                      <label key={flaw} className="flex items-start gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-off-white/80">
                        <input
                          type="checkbox"
                          className="mt-0.5"
                          checked={character.flaws.includes(flaw)}
                          onChange={(e) => toggleDefaultFlaw(flaw, e.target.checked)}
                        />
                        <span>{flaw}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-off-white/50">No default race flaws for this selection.</div>
                )}
              </div>

              <div className="space-y-2">
                <div className="text-xs uppercase tracking-wide text-off-white/50">Add Custom Flaw</div>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    value={customFlawInput}
                    onChange={(e) => setCustomFlawInput(e.target.value)}
                    placeholder="Enter a flaw"
                    className="min-w-[14rem] flex-1 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-off-white placeholder-off-white/30"
                  />
                  <button
                    className="rounded-full border border-white/20 px-3 py-1.5 text-xs text-off-white/75 hover:bg-white/10"
                    onClick={addCustomFlaw}
                  >
                    Add Flaw
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs uppercase tracking-wide text-off-white/50">Selected Flaws</div>
                {character.flaws.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {character.flaws.map(flaw => (
                      <span key={flaw} className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs text-off-white/80">
                        <span>{flaw}</span>
                        <button
                          className="text-off-white/60 hover:text-off-white"
                          onClick={() => removeFlaw(flaw)}
                          aria-label={`Remove flaw ${flaw}`}
                        >
                          x
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-off-white/50">No flaws selected.</div>
                )}
              </div>
            </div>
          )}

          {combinedWarnings.length > 0 && (
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-4 text-sm text-yellow-300 space-y-1">
              {combinedWarnings.map((warning, index) => (
                <div key={`${warning}-${index}`}>{warning}</div>
              ))}
            </div>
          )}

          {creationRules && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-off-white/70 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold text-base text-off-white">Creation Rule Notes</h3>
                {mythicCustomization && (
                  <span className="rounded-full border border-muted-eldritch-green/30 bg-muted-eldritch-green/10 px-3 py-1 text-xs text-muted-eldritch-green">
                    Mythic +10 CP active
                  </span>
                )}
              </div>
              {creationRules.duplicateBenefitAvailable ? (
                <div className="space-y-1">
                  <div className="text-off-white">
                    This race/class pair grants one duplicate-trait benefit. Apply it once during character creation by choosing one option: free 2-point advantage, tier-up an existing advantage, or swap for an equal-cost trait.
                  </div>
                  {creationRules.duplicateMinima.length > 0 && (
                    <div className="text-xs text-off-white/55">
                      Duplicate minima you can resolve with that one benefit: {creationRules.duplicateMinima.map(match => `${match.key} ${match.value}`).join(', ')}.
                    </div>
                  )}
                  {creationRules.duplicateAdvantages.length > 0 && (
                    <div className="text-xs text-off-white/55">
                      Duplicate advantages: {creationRules.duplicateAdvantages.join(', ')}.
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-xs text-off-white/55">No duplicate minima or advantages detected for this race/class pairing.</div>
              )}
              {multiclassFeatCost ? (
                <div className="text-xs text-off-white/55">
                  Out-of-class feat purchase is available at level {selectedLevel} for {multiclassFeatCost} CP if the narrative and minima requirements are met.
                </div>
              ) : (
                <div className="text-xs text-off-white/55">
                  Out-of-class feat purchases unlock at level 3. Failed out-of-class attempts still impose the next-turn -2 penalty.
                </div>
              )}
              {crossDisciplineSpellcasting && (
                <div className="text-xs text-off-white/55">
                  Secondary-discipline spell capacity: {crossDisciplineSpellcasting.spellCapacity} {crossDisciplineSpellcasting.secondaryFocus} spell{crossDisciplineSpellcasting.spellCapacity === 1 ? '' : 's'}.
                </div>
              )}
              {activeFocusSwap?.mode === 'single_specialty_upgrade' && focusSwapTarget && (
                <div className="text-xs text-off-white/55">
                  Single-specialty upgrade path active: {focusSwapTarget} starts at +2 and counts as 4 CP spent.
                </div>
              )}
              <div className="text-xs text-off-white/45">
                Custom archetype builds and full 80 CP complete customization still require GM adjudication outside this standard race/class workflow.
              </div>
            </div>
          )}

          {character ? (
            <div className="space-y-4">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <h2 className="text-lg font-semibold mb-3 text-off-white">Abilities & Specialties</h2>
                <div className="mb-3 flex flex-wrap gap-2">
                  <button
                    className="rounded-full border border-white/20 px-3 py-1 text-xs text-off-white/70 hover:bg-white/10"
                    onClick={() => setAllBranchesExpanded(true)}
                  >
                    Expand All Branches
                  </button>
                  <button
                    className="rounded-full border border-white/20 px-3 py-1 text-xs text-off-white/70 hover:bg-white/10"
                    onClick={() => setAllBranchesExpanded(false)}
                  >
                    Collapse All Branches
                  </button>
                </div>
                <div className="space-y-4">
                  {abilities.map(ability => (
                    <div key={ability} className="border border-white/10 rounded-lg">
                      <div className="flex items-center justify-between px-3 py-2 bg-white/5 rounded-t-lg">
                        <div>
                          <div className="text-sm font-semibold text-muted-eldritch-green">{ability}</div>
                          <div className="text-xs text-off-white/40">Minimum: {baseCharacter?.abilities[ability]}</div>
                          {dupAbilitySet.has(ability) && (
                            <div className="text-xs text-amber-400/85 mt-0.5">★ Duplicate — apply your one-time benefit here</div>
                          )}
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
                          <button
                            className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-off-white/80"
                            onClick={() => toggleAbilityBranch(ability)}
                          >
                            {expandedAbilities[ability] ? 'Hide Branch' : 'Show Branch'}
                          </button>
                        </div>
                      </div>
                      {expandedAbilities[ability] && (
                        <div className="px-4 py-3 space-y-3">
                          {specs[ability as keyof typeof specs].map(spec => (
                            <div key={spec} className="border border-white/10 rounded-lg p-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="text-sm font-medium text-off-white/90">{spec}</div>
                                  <div className="text-xs text-off-white/40">Minimum: {baseCharacter?.specialties[ability][spec]}</div>
                                  {dupSpecialtyMap.has(spec) && (
                                    <div className="text-xs text-amber-400/85 mt-0.5">★ Duplicate ({dupSpecialtyMap.get(spec)}) — apply your one-time benefit here</div>
                                  )}
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
                                      {dupFocusMap.has(focusKey) && (
                                        <div className="text-xs text-amber-400/85 mt-0.5">★ Duplicate ({dupFocusMap.get(focusKey)}) — free advantage, tier-up, or equal-cost swap</div>
                                      )}
                                      {!dupFocusMap.has(focusKey) && packageFocusMap.has(focusKey) && (
                                        <div className="text-xs text-muted-eldritch-green/70 mt-0.5">
                                          {packageFocusMap.get(focusKey)!.kind === 'racial' ? 'Racial' : 'Class'} package: +{packageFocusMap.get(focusKey)!.value} included
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <button
                                        className="w-6 h-6 rounded-full border border-white/20 bg-white/10 text-off-white disabled:opacity-30 disabled:cursor-not-allowed"
                                        onClick={() => adjustFocus(ability, spec, focusKey, -1)}
                                      >
                                        −
                                      </button>
                                      <span className="font-mono text-off-white">{character.focuses[ability][focusKey]}</span>
                                      <button
                                        disabled={character.specialties[ability][spec] === 'd0'}
                                        title={character.specialties[ability][spec] === 'd0' ? `Train ${spec} first` : undefined}
                                        className="w-6 h-6 rounded-full border border-white/20 bg-white/10 text-off-white disabled:opacity-30 disabled:cursor-not-allowed"
                                        onClick={() => adjustFocus(ability, spec, focusKey, 1)}
                                      >
                                        +
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className="mt-3 rounded-lg border border-dashed border-white/10 p-3">
                                <div className="flex items-center justify-between gap-3">
                                  <div>
                                    <div className="text-xs font-semibold uppercase tracking-wide text-off-white/50">Custom Focuses</div>
                                    <div className="text-xs text-off-white/40">
                                      Add GM-approved focus areas under {spec}. Cost: 4 CP per +1.
                                    </div>
                                  </div>
                                  <button
                                    disabled={character.specialties[ability][spec] === 'd0'}
                                    title={character.specialties[ability][spec] === 'd0' ? `Train ${spec} first` : undefined}
                                    className="rounded-full border border-white/20 px-3 py-1 text-xs text-off-white/75 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                                    onClick={() => addCustomFocus(ability as keyof typeof specs, spec)}
                                  >
                                    Add Custom Focus
                                  </button>
                                </div>
                                {character.customFocuses.filter(entry => entry.ability === ability && entry.specialty === spec).length > 0 && (
                                  <div className="mt-3 space-y-2">
                                    {character.customFocuses
                                      .filter(entry => entry.ability === ability && entry.specialty === spec)
                                      .map(customFocus => (
                                        <div key={customFocus.id} className="flex flex-wrap items-center gap-2 rounded-lg bg-white/5 px-3 py-2">
                                          <input
                                            value={customFocus.name}
                                            onChange={(e) => updateCustomFocusName(customFocus.id, e.target.value)}
                                            placeholder="e.g. Diplomacy, Rune Lore, Astronomy"
                                            className="min-w-[14rem] flex-1 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-off-white placeholder-off-white/30"
                                          />
                                          <div className="flex items-center gap-2">
                                            <button
                                              className="w-6 h-6 rounded-full border border-white/20 bg-white/10 text-off-white"
                                              onClick={() => adjustCustomFocus(customFocus.id, -1)}
                                            >
                                              −
                                            </button>
                                            <span className="font-mono text-sm text-off-white">{customFocus.value}</span>
                                            <button
                                              disabled={character.specialties[customFocus.ability][customFocus.specialty] === 'd0'}
                                              title={character.specialties[customFocus.ability][customFocus.specialty] === 'd0' ? `Train ${customFocus.specialty} first` : undefined}
                                              className="w-6 h-6 rounded-full border border-white/20 bg-white/10 text-off-white disabled:opacity-30 disabled:cursor-not-allowed"
                                              onClick={() => adjustCustomFocus(customFocus.id, 1)}
                                            >
                                              +
                                            </button>
                                            <button
                                              className="rounded-full border border-white/20 px-2 py-1 text-xs text-off-white/65 hover:bg-white/10"
                                              onClick={() => removeCustomFocus(customFocus.id)}
                                            >
                                              Remove
                                            </button>
                                          </div>
                                        </div>
                                      ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
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
                    {character.advantages.map(adv => (
                      <li key={adv} title={ADVANTAGE_DESCRIPTIONS[adv] ?? undefined}>
                        <span>{adv}</span>
                        {ADVANTAGE_DESCRIPTIONS[adv] && (
                          <span className="ml-1 text-xs text-off-white/50">- {ADVANTAGE_DESCRIPTIONS[adv]}</span>
                        )}
                      </li>
                    ))}
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
                        className="npc-native-select text-xs rounded-full border border-white/20 bg-white/5 text-off-white px-3 py-1.5"
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
              className="npc-native-select w-full rounded-lg border border-white/15 bg-white/5 text-off-white p-2.5"
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
