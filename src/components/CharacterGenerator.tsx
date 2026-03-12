'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  calculateCPSpent,
  createCharacterShell,
  deepCloneCharacter,
  fnum,
  getCreationRuleSummary,
  getCrossDisciplineSpellcastingSummary,
  getCustomizationBudget,
  getMulticlassFeatCost,
  spendCP,
  updateDerivedCharacterData,
  buildProfileReport,
  mv,
  type Character,
  type FocusSwapSelection
} from '../utils/characterBuild';
import {
  abilities,
  casterClasses,
  classNames,
  foci,
  magicPathsByClass,
  raceNames,
  races as raceDefinitions,
  specs,
  levels,
  type ClassName,
  type RaceName
} from '../data/gameData';
import {
  saveCharacter,
  generateId,
  getCurrentUserId,
  getAllPartyFolders,
  savePartyMembership,
  getPartyMemberships
} from '../utils/partyStorage';
import exporter from '../utils/exporters/htmlExporter';
import {
  generateRandomName,
  getNameSuggestionsForCharacter,
  Gender,
  NameCulture,
  RACE_CULTURE_MAP
} from '../utils/nameGenerator';
import { SavedCharacter, PartyFolder, PartyMembership } from '../types/party';

function showAlert(message: string) {
  alert(message);
}

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

const isCasterClass = (
  klass: Character['class']
): klass is (typeof casterClasses)[number] =>
  (casterClasses as readonly string[]).includes(klass);

export default function CharacterGenerator() {
  const router = useRouter();
  const [race, setRace] = useState('');
  const [characterClass, setCharacterClass] = useState('');
  const [level, setLevel] = useState<number>(1);
  const [magicPath, setMagicPath] = useState('');
  const [focusSwapSource, setFocusSwapSource] = useState('');
  const [focusSwapTarget, setFocusSwapTarget] = useState('');
  const [buildStyle, setBuildStyle] = useState('balanced');
  const [rookieProfile, setRookieProfile] = useState('off');
  const [enforceSoftcaps, setEnforceSoftcaps] = useState(true);
  const [iconicArcane, setIconicArcane] = useState(false);
  const [showWeakness, setShowWeakness] = useState(true);
  const [character, setCharacter] = useState<Character | null>(null);
  const [customFlawInput, setCustomFlawInput] = useState('');
  const selectedRaceDetails = useMemo(() => parseRaceSelection(race), [race]);
  const selectedRaceName = selectedRaceDetails.race;
  const mythicCustomization = selectedRaceDetails.mythic;
  const creationRules = useMemo(
    () => (selectedRaceName && characterClass ? getCreationRuleSummary(selectedRaceName as RaceName, characterClass as ClassName) : null),
    [selectedRaceName, characterClass]
  );
  const activeFocusSwap = useMemo<FocusSwapSelection | undefined>(() => (
    focusSwapSource && focusSwapTarget ? { sourceFocus: focusSwapSource, targetFocus: focusSwapTarget } : undefined
  ), [focusSwapSource, focusSwapTarget]);

  // PC-specific fields
  const [pcName, setPcName] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [characterGender, setCharacterGender] = useState<Gender>('Male');
  const [nameCulture, setNameCulture] = useState<NameCulture>('English');
  const [suggestedNames, setSuggestedNames] = useState<Array<{firstName: string; familyName?: string; culture: NameCulture; suggestion: string}>>([]);

  // Party assignment state
  const [partyFolders, setPartyFolders] = useState<PartyFolder[]>([]);
  const [selectedParty, setSelectedParty] = useState<string>('');
  const [showPartyAssignment, setShowPartyAssignment] = useState(false);

  useEffect(() => {
    // Load PC party folders for character assignment
    const pcFolders = getAllPartyFolders().filter(folder => folder.folder_type === 'PC_party');
    setPartyFolders(pcFolders);
  }, []);

  // Update name culture when character race changes
  useEffect(() => {
    if (character?.race && RACE_CULTURE_MAP[character.race]) {
      setNameCulture(RACE_CULTURE_MAP[character.race]);
    }
  }, [character?.race]);

  // Generate name suggestions when race, class, or gender changes
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

    if (!focusSwapSource && creationRules.racialFocusBonuses.length === 1) {
      setFocusSwapSource(creationRules.racialFocusBonuses[0].focus);
    }
  }, [creationRules, focusSwapSource, focusSwapTarget]);

  const [lastCharacter, setLastCharacter] = useState<{
    ch: Character;
    base: Character;
    iconic: boolean;
    style: string;
    rp: string;
    mythic: boolean;
    focusSwap?: FocusSwapSelection;
    spent: { abilities: number; specialties: number; focuses: number; advantages: number; total: number };
  } | null>(null);

  // ======= MAIN GENERATE FUNCTION =======
  function generate() {
    if (!selectedRaceName || !characterClass || !level) {
      showAlert('Please select a valid race, class, and level.');
      return;
    }

    const { character: ch, baseCharacter } = createCharacterShell(
      selectedRaceName as RaceName,
      characterClass as ClassName,
      level,
      { focusSwap: activeFocusSwap }
    );

    const cpBudgetVal = getCustomizationBudget(level, mythicCustomization);
    const cpBudget = { value: cpBudgetVal };

    if (iconicArcane) {
      if (cpBudget.value >= 4) {
        cpBudget.value -= 4;
      } else {
        showAlert('Not enough CP for Iconic Arcane Inheritance.');
        setIconicArcane(false);
        return;
      }
    }

    if (!(level === 1 && rookieProfile === 'pure')) {
      spendCP(ch, cpBudget, buildStyle, level, false, enforceSoftcaps);
    }

    updateDerivedCharacterData(ch);

    const spentTotals = calculateCPSpent(ch, baseCharacter, iconicArcane);
    setCharacter(ch);
    setLastCharacter({
      ch,
      base: baseCharacter,
      iconic: iconicArcane,
      style: buildStyle,
      rp: rookieProfile,
      mythic: mythicCustomization,
      focusSwap: activeFocusSwap,
      spent: spentTotals
    });
  }

  function getFullMarkdown() {
    if (!lastCharacter) return '';
    const { ch, spent, mythic, focusSwap } = lastCharacter;
    const markdownCreationRules = getCreationRuleSummary(ch.race as RaceName, ch.class as ClassName);
    const markdownMulticlassCost = getMulticlassFeatCost(ch.level);
    const markdownCrossDiscipline = getCrossDisciplineSpellcastingSummary(ch);

    let md = `# ${ch.race} ${ch.class} (Level ${ch.level})\n\n` +
      `### Core Stats\n` +
      `- **SP:** ${ch.pools.spirit} | **Active DP:** ${ch.pools.active} | **Passive DP:** ${ch.pools.passive}\n` +
      `- **Mastery Die:** ${ch.masteryDie}\n\n` +
      `### Abilities\n`;
    for (const a of abilities) {
      const sp = specs[a as keyof typeof specs].map(s => {
        const fl = foci[s as keyof typeof foci].map(fx => {
          const v = fnum(ch.focuses[a][fx]);
          return v ? `${fx} +${v}` : null;
        }).filter(Boolean).join(', ');
        return `${s} **${ch.specialties[a][s]}**${fl ? ` (${fl})` : ''}`;
      }).join(', ');
      md += `**${a} ${ch.abilities[a]}** → ${sp}.\n`;
    }

    md += `\n### Actions\n- **Melee Attack:** ${ch.actions.meleeAttack}\n- **Ranged Attack:** ${ch.actions.rangedAttack}\n- **Perception Check:** ${ch.actions.perceptionCheck}\n` + (isCasterClass(ch.class) ? `- **Magic Attack:** ${ch.actions.magicAttack}\n\n` : '\n');


    md += `### Advantages & Flaws\n**Advantages:**\n${ch.advantages.map(a => `- ${a}`).join('\n')}\n\n**Flaws:**\n${ch.flaws.length ? ch.flaws.map(f => `- ${f}`).join('\n') : '- None'}\n\n`;
    md += `### Class Feats\n${ch.classFeats.map(f => `- ${f}`).join('\n')}\n\n`;
    md += `### Equipment\n${ch.equipment.map(e => `- ${e}`).join('\n')}\n\n`;

    md += `### Character Points Spent\n- **Spent on Abilities:** ${spent.abilities}\n- **Spent on Specialties:** ${spent.specialties}\n- **Spent on Focuses:** ${spent.focuses}\n- **Spent on Advantages:** ${spent.advantages}\n- **Total CP Spent from Budget:** ${spent.total}\n`;
    md += `\n_Note: This shows CPs spent from the customization budget (10 CP + Level Bonus). Free racial/class minimums cost 0 CP._\n`;
    if (markdownCreationRules) {
      md += `\n### Creation Rule Notes\n`;
      md += markdownCreationRules.duplicateBenefitAvailable
        ? `- Duplicate race/class overlap detected: apply one duplicate-trait benefit during creation by choosing exactly one option: free 2-point advantage, tier-up an existing advantage, or same-cost swap.\n`
        : `- No duplicate minima or advantages were detected for this pairing.\n`;
      if (markdownMulticlassCost) {
        md += `- Out-of-class feat purchase cost at level ${ch.level}: ${markdownMulticlassCost} CP.\n`;
      }
      if (markdownCrossDiscipline) {
        md += `- Secondary-discipline spell capacity: ${markdownCrossDiscipline.spellCapacity} ${markdownCrossDiscipline.secondaryFocus} spell${markdownCrossDiscipline.spellCapacity === 1 ? '' : 's'}.\n`;
      }
      if (focusSwap) {
        md += `- Focus swap applied: ${focusSwap.sourceFocus} -> ${focusSwap.targetFocus}.\n`;
      }
      if (mythic) {
        md += `- Mythic/custom campaign bonus applied: +10 customization CP.\n`;
      }
      md += '\n';
    }
    return md;
  }

  function exportMD() {
    const md = getFullMarkdown();
    if (!md) {
      showAlert('Generate a character first!');
      return;
    }
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${lastCharacter!.ch.race}_${lastCharacter!.ch.class}_L${lastCharacter!.ch.level}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function copyMD() {
    const md = getFullMarkdown();
    if (!md) {
      showAlert('Generate a character first!');
      return;
    }
    navigator.clipboard.writeText(md).then(() => {
      showAlert('Markdown copied to clipboard!');
    }).catch(() => {
      showAlert('Failed to copy markdown.');
    });
  }

  function saveCharacterToRoster() {
    if (!character) {
      showAlert('Generate a character first!');
      return;
    }
    setShowPartyAssignment(true);
  }

  function confirmSaveCharacter() {
    if (!character) return;

    // Use PC name if provided, otherwise prompt
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
      tags: [buildStyle, `Level ${character.level}`, characterGender],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      full_data: {
        ...character as unknown as Record<string, unknown>,
        player_name: playerName,
        character_gender: characterGender,
        name_culture: nameCulture
      }
    };

    saveCharacter(savedChar);

    // Add to selected party if one was chosen
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
      showAlert(`Character "${charName}" saved to roster and added to ${partyName}!`);
    } else {
      showAlert(`Character "${charName}" saved to roster!`);
    }

    setShowPartyAssignment(false);
    setSelectedParty('');
    router.push('/roster');
  }

  // Generate random name
  const generateRandomCharacterName = () => {
    if (!character?.race) return;

    const nameResult = generateRandomName(characterGender, nameCulture, true, character.race);
    setPcName(`${nameResult.firstName}${nameResult.familyName ? ` ${nameResult.familyName}` : ''}`);
  };

  // Use suggested name
  const applySuggestedName = (suggestion: typeof suggestedNames[0]) => {
    setPcName(`${suggestion.firstName}${suggestion.familyName ? ` ${suggestion.familyName}` : ''}`);
  };

  const warnings = character && showWeakness ? buildProfileReport(character) : [];
  const selectableDefaultAdvantages = useMemo(() => {
    if (!character) return [];
    return createCharacterShell(character.race as RaceName, character.class as ClassName, 1).character.advantages;
  }, [character]);
  const selectableDefaultFlaws = useMemo(() => {
    if (!character) return [];
    return [...(raceDefinitions[character.race as RaceName]?.flaws ?? [])];
  }, [character]);
  const multiclassFeatCost = useMemo(() => getMulticlassFeatCost(level), [level]);
  const crossDisciplineSpellcasting = useMemo(
    () => (character ? getCrossDisciplineSpellcastingSummary(character) : null),
    [character]
  );
  const selectedFocusSwap = creationRules?.racialFocusBonuses.find(entry => entry.focus === focusSwapSource) ?? null;
  const resultCreationRules = useMemo(
    () => (character ? getCreationRuleSummary(character.race as RaceName, character.class as ClassName) : null),
    [character]
  );
  const resultMulticlassFeatCost = useMemo(
    () => (character ? getMulticlassFeatCost(character.level) : multiclassFeatCost),
    [character, multiclassFeatCost]
  );

  const applyCharacterMutation = (updater: (draft: Character) => void) => {
    setCharacter(prev => {
      if (!prev) return prev;
      const next = deepCloneCharacter(prev);
      updater(next);
      updateDerivedCharacterData(next);
      setLastCharacter(last => (last ? { ...last, ch: deepCloneCharacter(next) } : last));
      return next;
    });
  };

  const toggleAdvantage = (advantage: string, enabled: boolean) => {
    applyCharacterMutation(draft => {
      if (enabled) {
        if (!draft.advantages.includes(advantage)) draft.advantages.push(advantage);
        return;
      }
      draft.advantages = draft.advantages.filter(existing => existing !== advantage);
    });
  };

  const toggleDefaultFlaw = (flaw: string, enabled: boolean) => {
    applyCharacterMutation(draft => {
      if (enabled) {
        if (!draft.flaws.includes(flaw)) draft.flaws.push(flaw);
        return;
      }
      draft.flaws = draft.flaws.filter(existing => existing !== flaw);
    });
  };

  const addCustomFlaw = () => {
    const value = customFlawInput.trim();
    if (!value) return;
    applyCharacterMutation(draft => {
      if (!draft.flaws.includes(value)) draft.flaws.push(value);
    });
    setCustomFlawInput('');
  };

  const removeFlaw = (flaw: string) => {
    applyCharacterMutation(draft => {
      draft.flaws = draft.flaws.filter(existing => existing !== flaw);
    });
  };

  return (
    <div className="text-off-white min-h-screen">
      <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
        <header className="mb-6 sm:mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Eldritch RPG 2nd Edition</h1>
          <p className="text-off-white/60">Character Generator — <span className="font-semibold">Balanced · Specialist · Rookie</span></p>
        </header>

        {/* Controls */}
        <section className="bg-white/5 rounded-2xl shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="race">Race</label>
              <select
                id="race"
                className="npc-native-select w-full rounded-lg border border-white/15 bg-white/5 p-2.5"
                value={race}
                onChange={(e) => setRace(e.target.value)}
              >
                <option value="">Select Race</option>
                <optgroup label="Standard races">
                  {raceNames.map(r => <option key={r} value={r}>{r}</option>)}
                </optgroup>
                <optgroup label="Mythic/custom campaign (+10 CP)">
                  {raceNames.map(r => (
                    <option key={`${r}-mythic`} value={buildRaceSelectionValue(r, true)}>
                      {r} (Mythic/custom)
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="class">Class</label>
              <select
                id="class"
                className="npc-native-select w-full rounded-lg border border-white/15 bg-white/5 p-2.5"
                value={characterClass}
                onChange={(e) => {
                  setCharacterClass(e.target.value);
                  const paths = magicPathsByClass[e.target.value as keyof typeof magicPathsByClass];
                  if (paths && e.target.value !== 'Adept' && e.target.value !== 'Mystic') {
                    setMagicPath(paths[0]);
                  } else {
                    setMagicPath('');
                  }
                }}
              >
                <option value="">Select Class</option>
                {classNames.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="level">Level</label>
              <select
                id="level"
                className="npc-native-select w-full rounded-lg border border-white/15 bg-white/5 p-2.5"
                value={level}
                onChange={(e) => setLevel(parseInt(e.target.value))}
              >
                {levels.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            {magicPathsByClass[characterClass as keyof typeof magicPathsByClass]?.length && characterClass !== 'Adept' && characterClass !== 'Mystic' ? (
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="magic-path">Chosen Magic Path</label>
                <select
                  id="magic-path"
                  className="npc-native-select w-full rounded-lg border border-white/15 bg-white/5 p-2.5"
                  value={magicPath}
                  onChange={(e) => setMagicPath(e.target.value)}
                >
                  {magicPathsByClass[characterClass as keyof typeof magicPathsByClass]?.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            ) : null}
          </div>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Build Philosophy */}
            <div className="bg-white/5 rounded-xl p-4">
              <h3 className="font-semibold mb-2">Build Philosophy</h3>
              <div className="flex flex-wrap gap-2">
                {['balanced', 'hybrid', 'specialist'].map(style => (
                  <label key={style} className="flex items-center gap-2 rounded-full px-3 py-2 bg-white/5 border cursor-pointer">
                    <input
                      type="radio"
                      name="style"
                      value={style}
                      checked={buildStyle === style}
                      onChange={(e) => setBuildStyle(e.target.value)}
                    />
                    <span className="text-sm font-medium capitalize">{style}</span>
                  </label>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-2 text-sm">
                <input
                  id="enforce-softcaps"
                  type="checkbox"
                  className="h-4 w-4 rounded"
                  checked={enforceSoftcaps}
                  onChange={(e) => setEnforceSoftcaps(e.target.checked)}
                />
                <label htmlFor="enforce-softcaps">Enforce Soft Caps by Level</label>
              </div>
              <p className="mt-2 text-xs text-off-white/50">Balanced spreads CP before spiking; Specialist prioritizes class axis; Hybrid blends both.</p>
            </div>

            {/* Rookie Profiles */}
            <div className="bg-white/5 rounded-xl p-4">
              <h3 className="font-semibold mb-2">Rookie Profile (Level 1 Only)</h3>
              <select
                id="rookie-profile"
                className="npc-native-select w-full rounded-lg border border-white/15 bg-white/5 p-2.5"
                disabled={level !== 1}
                value={rookieProfile}
                onChange={(e) => setRookieProfile(e.target.value)}
              >
                <option value="off">Off</option>
                <option value="pure">Pure Rookie (Minima only)</option>
                <option value="balanced">Balanced Rookie (breadth-first)</option>
                <option value="specialist">Specialist Rookie (focused)</option>
              </select>
              <p className="mt-2 text-xs text-off-white/50">Generate a true starting character with only the 10 bonus CPs.</p>
            </div>

            <div className="bg-white/5 rounded-xl p-4 space-y-3">
              <h3 className="font-semibold">Creation Rules</h3>
              <p className="text-xs text-off-white/50">
                These edge rules can apply to standard race/class builds too. Choose a Mythic/custom race option above to activate the +10 CP campaign bonus.
              </p>
              <div className="text-xs text-off-white/50">
                Race dropdown options ending in <span className="font-semibold text-off-white/80">(Mythic/custom)</span> include the campaign bonus.
              </div>
              {creationRules?.duplicateBenefitAvailable && (
                <div className="rounded-lg border border-amber-400/20 bg-amber-500/10 p-3 text-xs text-amber-100">
                  Duplicate race/class overlap detected. One duplicate can become a free 2-point advantage, a tier-up, or a same-cost swap.
                </div>
              )}
              {creationRules && creationRules.racialFocusBonuses.length > 0 && creationRules.focusSwapTargets.length > 0 && (
                <>
                  {creationRules.racialFocusBonuses.length > 1 ? (
                    <select
                      className="npc-native-select w-full rounded-lg border border-white/15 bg-white/5 p-2.5 text-sm"
                      value={focusSwapSource}
                      onChange={(e) => setFocusSwapSource(e.target.value)}
                    >
                      <option value="">Keep racial focus</option>
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
                  <select
                    className="npc-native-select w-full rounded-lg border border-white/15 bg-white/5 p-2.5 text-sm"
                    value={focusSwapTarget}
                    onChange={(e) => setFocusSwapTarget(e.target.value)}
                    disabled={!focusSwapSource}
                  >
                    <option value="">Choose class-linked focus (trained specialty only)</option>
                    {creationRules.focusSwapTargets.map(entry => (
                      <option key={entry.focus} value={entry.focus}>
                        {entry.specialty} → {entry.focus}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-off-white/50">
                    {selectedFocusSwap
                      ? `Swapping ${selectedFocusSwap.focus} +${selectedFocusSwap.value} updates the starting minima before generation.`
                      : 'Choose the racial focus you want to reassign, then pick the class-linked target focus.'}
                  </p>
                  <p className="text-xs text-off-white/45">
                    Focus targets only appear when their parent specialty starts trained (d4 or higher).
                  </p>
                </>
              )}
            </div>

            {/* Options & Actions */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <input
                  id="iconic-arcane"
                  type="checkbox"
                  className="h-4 w-4 rounded"
                  checked={iconicArcane}
                  onChange={(e) => setIconicArcane(e.target.checked)}
                />
                <label htmlFor="iconic-arcane" className="text-sm">Iconic Arcane Inheritance <span className="text-xs text-off-white/50">(Costs 4 CP)</span></label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="warn-weakness"
                  type="checkbox"
                  className="h-4 w-4 rounded"
                  checked={showWeakness}
                  onChange={(e) => setShowWeakness(e.target.checked)}
                />
                <label htmlFor="warn-weakness" className="text-sm">Show Weakness Report</label>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  onClick={generate}
                  className="rounded-full bg-soft-amethyst hover:bg-soft-amethyst/80 text-white font-bold py-2.5 px-4 shadow"
                >
                  Generate
                </button>
                {character && (
                  <button
                    onClick={saveCharacterToRoster}
                    className="rounded-full bg-muted-eldritch-green hover:bg-muted-eldritch-green/80 text-white font-semibold py-2.5 px-4 shadow"
                  >
                    Save to Roster
                  </button>
                )}
                <button
                  onClick={exportMD}
                  className="rounded-full bg-white/5 hover:bg-white/10 text-soft-amethyst font-semibold py-2.5 px-4 border border-soft-amethyst shadow"
                >
                  Export MD
                </button>
                        <button
                          onClick={() => {
                            const md = getFullMarkdown();
                            if (!md) return showAlert('Generate a character first!');
                            try {
                              const html = exporter.pcToHTML({ raw: md, name: `${character?.race} ${character?.class}` });
                              const wrapped = exporter.wrapForWord(html);
                              if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
                                const blob = new Blob([wrapped], { type: 'text/html' });
                                const item = new ClipboardItem({ 'text/html': blob, 'text/plain': new Blob([md], { type: 'text/plain' }) });
                                navigator.clipboard.write([item]);
                                showAlert('Character HTML copied to clipboard');
                              } else {
                                navigator.clipboard.writeText(md);
                                showAlert('HTML clipboard not supported — copied Markdown instead');
                              }
                            } catch (err) {
                              console.error(err);
                              showAlert('Failed to copy HTML');
                            }
                          }}
                          className="rounded-full bg-white/5 hover:bg-white/10 text-soft-amethyst font-semibold py-2.5 px-4 border border-soft-amethyst shadow"
                        >
                          Copy HTML
                        </button>
                <button
                  onClick={copyMD}
                  className="rounded-full bg-white/5 hover:bg-white/10 text-soft-amethyst font-semibold py-2.5 px-4 border border-soft-amethyst shadow"
                >
                  Copy MD
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Output */}
        {character && (
          <div className="bg-white/5 rounded-2xl shadow p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <h2 className="text-2xl font-bold">{character.race} {character.class} — Level {character.level}</h2>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-white/10 text-off-white/80 text-xs px-3 py-1">Style: {buildStyle}</span>
                {(level === 1 && rookieProfile !== 'off') && (
                  <span className="rounded-full bg-soft-amethyst/20 text-soft-amethyst text-xs px-3 py-1">Rookie: {rookieProfile}</span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center mb-4">
              <div className="bg-white/5 rounded-xl p-3">
                <div className="text-xs text-off-white/50">Spirit Points</div>
                <div className="text-xl font-bold">{character.pools.spirit}</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <div className="text-xs text-off-white/50">Active DP</div>
                <div className="text-xl font-bold">{character.pools.active}</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <div className="text-xs text-off-white/50">Passive DP</div>
                <div className="text-xl font-bold">{character.pools.passive}</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <div className="text-xs text-off-white/50">Mastery Die</div>
                <div className="text-xl font-bold">{character.masteryDie}</div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Abilities</h3>
                <div className="text-sm leading-relaxed">
                  {abilities.map(ab => {
                    const sp = specs[ab as keyof typeof specs].map(s => {
                      const fxList = foci[s as keyof typeof foci].map(fx => {
                        const v = fnum(character.focuses[ab][fx]);
                        return v ? `${fx} +${v}` : null;
                      }).filter(Boolean).join(', ');
                      return `${s} <strong>${character.specialties[ab][s]}</strong>${fxList ? ` (${fxList})` : ''}`;
                    }).join(', ');
                    return (
                      <div key={ab} className="mb-2">
                        <span className="font-semibold">{ab} <strong>{character.abilities[ab]}</strong></span> → <span dangerouslySetInnerHTML={{ __html: sp }} />.
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Actions</h3>
                <ul className="text-sm list-disc list-inside">
                  <li><strong>Melee Attack:</strong> {character.actions.meleeAttack}</li>
                  <li><strong>Ranged Attack:</strong> {character.actions.rangedAttack}</li>
                  <li><strong>Perception Check:</strong> {character.actions.perceptionCheck}</li>
                  {isCasterClass(character.class) && (
                    <li><strong>Magic Attack:</strong> {character.actions.magicAttack}</li>
                  )}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Advantages & Flaws</h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-off-white/50 mb-1">Default Advantages (Race/Class)</div>
                    <div className="grid gap-2">
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
                  </div>

                  <div>
                    <div className="text-xs uppercase tracking-wide text-off-white/50 mb-1">Default Flaws (Race)</div>
                    {selectableDefaultFlaws.length > 0 ? (
                      <div className="grid gap-2">
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
                      <div className="text-xs text-off-white/50">No default race flaws for this character.</div>
                    )}
                  </div>

                  <div>
                    <div className="text-xs uppercase tracking-wide text-off-white/50 mb-1">Add Custom Flaw</div>
                    <div className="flex items-center gap-2">
                      <input
                        value={customFlawInput}
                        onChange={(e) => setCustomFlawInput(e.target.value)}
                        placeholder="Enter a flaw"
                        className="min-w-[12rem] flex-1 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-off-white placeholder-off-white/30"
                      />
                      <button
                        onClick={addCustomFlaw}
                        className="rounded-full border border-white/20 px-3 py-1.5 text-xs text-off-white/80 hover:bg-white/10"
                      >
                        Add Flaw
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs uppercase tracking-wide text-off-white/50 mb-1">Selected Flaws</div>
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
              </div>
              <div>
                <h3 className="font-semibold mb-2">Class Feats</h3>
                <ul className="text-sm list-disc list-inside">
                  {character.classFeats.map(f => <li key={f}>{f}</li>)}
                </ul>
              </div>
              <div className="lg:col-span-2">
                <h3 className="font-semibold mb-2">Equipment</h3>
                <ul className="text-sm list-disc list-inside columns-2">
                  {character.equipment.map(e => <li key={e}>{e}</li>)}
                </ul>
              </div>
              {warnings.length > 0 && (
                <div className="lg:col-span-2">
                  <div className="bg-amber-50 border border-amber-500/30 rounded-xl p-4">
                    <h3 className="font-semibold text-amber-900 mb-2">Weakness Report</h3>
                    <ul className="text-sm text-amber-900 list-disc list-inside">
                      {warnings.map(w => <li key={w}>{w}</li>)}
                    </ul>
                  </div>
                </div>
              )}
              {resultCreationRules && (
                <div className="lg:col-span-2">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-off-white/70 space-y-2">
                    <h3 className="font-semibold text-off-white">Creation Rule Notes</h3>
                    {resultCreationRules.duplicateBenefitAvailable ? (
                      <>
                        <div>
                          This pairing grants one duplicate-trait benefit. Apply it once during character creation by choosing one option: free 2-point advantage, tier-up an existing advantage, or swap for an equal-cost trait.
                        </div>
                        {resultCreationRules.duplicateMinima.length > 0 && (
                          <div className="text-xs text-off-white/50">
                            Duplicate minima you can resolve with that one benefit: {resultCreationRules.duplicateMinima.map(match => `${match.key} ${match.value}`).join(', ')}.
                          </div>
                        )}
                        {resultCreationRules.duplicateAdvantages.length > 0 && (
                          <div className="text-xs text-off-white/50">
                            Duplicate advantages: {resultCreationRules.duplicateAdvantages.join(', ')}.
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-xs text-off-white/50">No duplicate minima or advantages detected for this build.</div>
                    )}
                    {lastCharacter?.focusSwap && (
                      <div className="text-xs text-off-white/50">
                        Focus swap applied: {lastCharacter.focusSwap.sourceFocus} → {lastCharacter.focusSwap.targetFocus}.
                      </div>
                    )}
                    {resultMulticlassFeatCost ? (
                      <div className="text-xs text-off-white/50">
                        At level {character.level}, purchasing an out-of-class feat costs {resultMulticlassFeatCost} CP if the character meets the other class minima and has narrative justification.
                      </div>
                    ) : (
                      <div className="text-xs text-off-white/50">
                        Out-of-class feat purchases start at level 3. Failed out-of-class attempts impose the next-turn -2 test penalty.
                      </div>
                    )}
                    {crossDisciplineSpellcasting && (
                      <div className="text-xs text-off-white/50">
                        Secondary-discipline spell capacity: {crossDisciplineSpellcasting.spellCapacity} {crossDisciplineSpellcasting.secondaryFocus} spell{crossDisciplineSpellcasting.spellCapacity === 1 ? '' : 's'}.
                      </div>
                    )}
                    {lastCharacter?.mythic && (
                      <div className="text-xs text-muted-eldritch-green">
                        Mythic/custom campaign bonus applied: +10 customization CP.
                      </div>
                    )}
                  </div>
                </div>
              )}
              {lastCharacter && (
                <div>
                  <h3 className="font-semibold mb-2">Character Points Spent</h3>
                  <ul className="text-sm list-disc list-inside">
                    <li><strong>Spent on Abilities:</strong> {lastCharacter.spent.abilities}</li>
                    <li><strong>Spent on Specialties:</strong> {lastCharacter.spent.specialties}</li>
                    <li><strong>Spent on Focuses:</strong> {lastCharacter.spent.focuses}</li>
                    <li><strong>Spent on Advantages:</strong> {lastCharacter.spent.advantages}</li>
                    <li><strong>Total CP Spent from Budget:</strong> {lastCharacter.spent.total}</li>
                  </ul>
                  <p className="text-xs text-off-white/50 mt-2 italic">
                    This shows CPs spent from the customization budget (10 CP + Level Bonus). Free racial/class minimums cost 0 CP.
                    Focus bonuses also draw from the CP budget unless granted by your starting race/class combination.
                  </p>
                </div>
              )}
              <div className="lg:col-span-2">
                <h3 className="text-lg font-semibold mb-2 text-off-white">Level Advancement (Earned CP)</h3>
                <div className="overflow-x-auto relative rounded-lg">
                  <table className="w-full text-sm text-left text-off-white/50">
                    <thead className="text-xs text-off-white/80 uppercase bg-white/5">
                      <tr>
                        <th scope="col" className="px-4 py-2">To Reach Level</th>
                        <th scope="col" className="px-4 py-2">Total Earned CP Required</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-white/5 border-b"><td className="px-4 py-2 font-medium">Level 2</td><td className="px-4 py-2">100</td></tr>
                      <tr className="bg-white/5 border-b"><td className="px-4 py-2 font-medium">Level 3</td><td className="px-4 py-2">200</td></tr>
                      <tr className="bg-white/5 border-b"><td className="px-4 py-2 font-medium">Level 4</td><td className="px-4 py-2">300</td></tr>
                      <tr className="bg-white/5"><td className="px-4 py-2 font-medium">Level 5</td><td className="px-4 py-2">500</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Party Assignment Modal */}
        {showPartyAssignment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white/5 rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-bold mb-4">Save Character to Roster</h3>

              {/* Character Details */}
              <div className="mb-6 p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold mb-3">Character Details</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Character Name</label>
                    <input
                      type="text"
                      value={pcName}
                      onChange={(e) => setPcName(e.target.value)}
                      placeholder="Enter character name"
                      className="w-full border border-white/15 rounded p-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Player Name</label>
                    <input
                      type="text"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder="Enter player name"
                      className="w-full border border-white/15 rounded p-2 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Gender</label>
                    <select
                      value={characterGender}
                      onChange={(e) => setCharacterGender(e.target.value as Gender)}
                      className="npc-native-select w-full border border-white/15 rounded p-2 text-sm"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Non-binary">Non-binary</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Name Culture</label>
                    <select
                      value={nameCulture}
                      onChange={(e) => setNameCulture(e.target.value as NameCulture)}
                      className="npc-native-select w-full border border-white/15 rounded p-2 text-sm"
                    >
                      <option value="English">English</option>
                      <option value="Scottish">Scottish</option>
                      <option value="Welsh">Welsh</option>
                      <option value="Irish">Irish</option>
                      <option value="Norse">Norse</option>
                      <option value="French">French</option>
                      <option value="Germanic">Germanic</option>
                      <option value="Fantasy">Fantasy</option>
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium">Name Suggestions</label>
                    <button
                      onClick={generateRandomCharacterName}
                      className="text-xs bg-soft-amethyst hover:bg-soft-amethyst text-white px-2 py-1 rounded"
                    >
                      Random Name
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-1">
                    {suggestedNames.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => applySuggestedName(suggestion)}
                        className="text-left text-xs p-2 bg-white/5 border border-white/10 rounded hover:bg-soft-amethyst/10 hover:border-soft-amethyst/30"
                      >
                        {suggestion.firstName} {suggestion.familyName}
                        <span className="text-off-white/50 ml-2">({suggestion.culture})</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Assign to Party (Optional)
                </label>
                <select
                  value={selectedParty}
                  onChange={(e) => setSelectedParty(e.target.value)}
                  className="npc-native-select w-full border border-white/15 rounded-lg p-2"
                >
                  <option value="">No party assignment</option>
                  {partyFolders.map(folder => (
                    <option key={folder.id} value={folder.id}>
                      {folder.name}
                    </option>
                  ))}
                </select>
                {partyFolders.length === 0 && (
                  <p className="text-sm text-off-white/50 mt-1">
                    No PC party folders available. Create one in the Party Management page.
                  </p>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={confirmSaveCharacter}
                  className="flex-1 bg-muted-eldritch-green hover:bg-muted-eldritch-green/80 text-white font-semibold py-2 px-4 rounded"
                >
                  Save Character
                </button>
                <button
                  onClick={() => {
                    setShowPartyAssignment(false);
                    setSelectedParty('');
                  }}
                  className="flex-1 bg-white/10 hover:bg-white/15 text-white font-semibold py-2 px-4 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
