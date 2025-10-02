'use client';

import { useState, useEffect } from 'react';
import {
  calculateCPSpent,
  createCharacterShell,
  fnum,
  spendCP,
  updateDerivedCharacterData,
  weaknessReport,
  mv,
  type Character
} from '../utils/characterBuild';
import {
  abilities,
  casterClasses,
  classNames,
  foci,
  magicPathsByClass,
  raceNames,
  specs,
  levels
} from '../data/gameData';
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

function showAlert(message: string) {
  alert(message);
}

export default function CharacterGenerator() {
  const [race, setRace] = useState('');
  const [characterClass, setCharacterClass] = useState('');
  const [level, setLevel] = useState<number>(1);
  const [magicPath, setMagicPath] = useState('');
  const [buildStyle, setBuildStyle] = useState('balanced');
  const [rookieProfile, setRookieProfile] = useState('off');
  const [enforceSoftcaps, setEnforceSoftcaps] = useState(true);
  const [iconicArcane, setIconicArcane] = useState(false);
  const [showWeakness, setShowWeakness] = useState(true);
  const [character, setCharacter] = useState<Character | null>(null);

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
        5
      );
      setSuggestedNames(suggestions);
    }
  }, [character?.race, character?.class, characterGender]);

  const [lastCharacter, setLastCharacter] = useState<{
    ch: Character;
    base: Character;
    iconic: boolean;
    style: string;
    rp: string;
    spent: { abilities: number; specialties: number; focuses: number; advantages: number; total: number };
  } | null>(null);

  // ======= MAIN GENERATE FUNCTION =======
  function generate() {
    if (!race || !characterClass || !level) {
      showAlert('Please select a valid race, class, and level.');
      return;
    }

    const { character: ch, baseCharacter } = createCharacterShell(race, characterClass, level);

    const cpBudgetVal = (level === 1 && rookieProfile !== 'off') ? 10 : 10 + (level - 1) * 100;
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
    setLastCharacter({ ch, base: baseCharacter, iconic: iconicArcane, style: buildStyle, rp: rookieProfile, spent: spentTotals });
  }

  function getFullMarkdown() {
    if (!lastCharacter) return '';
    const { ch, spent } = lastCharacter;

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
    md += `\n### Actions\n- **Melee Attack:** ${ch.actions.meleeAttack}\n- **Ranged Attack:** ${ch.actions.rangedAttack}\n- **Perception Check:** ${ch.actions.perceptionCheck}\n` + ((casterClasses as readonly string[]).includes(ch.class) ? `- **Magic Attack:** ${ch.actions.magicAttack}\n\n` : '\n');

    md += `### Advantages & Flaws\n**Advantages:**\n${ch.advantages.map(a => `- ${a}`).join('\n')}\n\n**Flaws:**\n${ch.flaws.length ? ch.flaws.map(f => `- ${f}`).join('\n') : '- None'}\n\n`;
    md += `### Class Feats\n${ch.classFeats.map(f => `- ${f}`).join('\n')}\n\n`;
    md += `### Equipment\n${ch.equipment.map(e => `- ${e}`).join('\n')}\n\n`;

    md += `### Character Points Spent\n- **Spent on Abilities:** ${spent.abilities}\n- **Spent on Specialties:** ${spent.specialties}\n- **Spent on Focuses:** ${spent.focuses}\n- **Spent on Advantages:** ${spent.advantages}\n- **Total CP Spent from Budget:** ${spent.total}\n`;
    md += `\n_Note: This shows CPs spent from the customization budget (10 CP + Level Bonus). Free racial/class minimums cost 0 CP._\n`;
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

  const warnings = character && showWeakness ? weaknessReport(character) : [];

  return (
    <div className="bg-gray-100 text-gray-800 min-h-screen">
      <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
        <header className="mb-6 sm:mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Eldritch RPG 2nd Edition</h1>
          <p className="text-gray-600">Character Generator — <span className="font-semibold">Balanced · Specialist · Rookie</span></p>
        </header>

        {/* Controls */}
        <section className="bg-white rounded-2xl shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="race">Race</label>
              <select
                id="race"
                className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5"
                value={race}
                onChange={(e) => setRace(e.target.value)}
              >
                <option value="">Select Race</option>
                {raceNames.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="class">Class</label>
              <select
                id="class"
                className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5"
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
                className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5"
                value={level}
                onChange={(e) => setLevel(parseInt(e.target.value))}
              >
                {levels.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            {magicPathsByClass[characterClass as keyof typeof magicPathsByClass] && characterClass !== 'Adept' && characterClass !== 'Mystic' && (
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="magic-path">Chosen Magic Path</label>
                <select
                  id="magic-path"
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5"
                  value={magicPath}
                  onChange={(e) => setMagicPath(e.target.value)}
                >
                  {magicPathsByClass[characterClass as keyof typeof magicPathsByClass]?.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            )}
          </div>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Build Philosophy */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold mb-2">Build Philosophy</h3>
              <div className="flex flex-wrap gap-2">
                {['balanced', 'hybrid', 'specialist'].map(style => (
                  <label key={style} className="flex items-center gap-2 rounded-full px-3 py-2 bg-white border cursor-pointer">
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
              <p className="mt-2 text-xs text-gray-500">Balanced spreads CP before spiking; Specialist prioritizes class axis; Hybrid blends both.</p>
            </div>

            {/* Rookie Profiles */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold mb-2">Rookie Profile (Level 1 Only)</h3>
              <select
                id="rookie-profile"
                className="w-full rounded-lg border border-gray-300 bg-white p-2.5"
                disabled={level !== 1}
                value={rookieProfile}
                onChange={(e) => setRookieProfile(e.target.value)}
              >
                <option value="off">Off</option>
                <option value="pure">Pure Rookie (Minima only)</option>
                <option value="balanced">Balanced Rookie (breadth-first)</option>
                <option value="specialist">Specialist Rookie (focused)</option>
              </select>
              <p className="mt-2 text-xs text-gray-500">Generate a true starting character with only the 10 bonus CPs.</p>
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
                <label htmlFor="iconic-arcane" className="text-sm">Iconic Arcane Inheritance <span className="text-xs text-gray-500">(Costs 4 CP)</span></label>
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
                  className="rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 shadow"
                >
                  Generate
                </button>
                {character && (
                  <button
                    onClick={saveCharacterToRoster}
                    className="rounded-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-4 shadow"
                  >
                    Save to Roster
                  </button>
                )}
                <button
                  onClick={exportMD}
                  className="rounded-full bg-white hover:bg-gray-100 text-blue-600 font-semibold py-2.5 px-4 border border-blue-600 shadow"
                >
                  Export MD
                </button>
                <button
                  onClick={copyMD}
                  className="rounded-full bg-white hover:bg-gray-100 text-blue-600 font-semibold py-2.5 px-4 border border-blue-600 shadow"
                >
                  Copy MD
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Output */}
        {character && (
          <div className="bg-white rounded-2xl shadow p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <h2 className="text-2xl font-bold">{character.race} {character.class} — Level {character.level}</h2>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-gray-100 text-gray-700 text-xs px-3 py-1">Style: {buildStyle}</span>
                {(level === 1 && rookieProfile !== 'off') && (
                  <span className="rounded-full bg-indigo-100 text-indigo-700 text-xs px-3 py-1">Rookie: {rookieProfile}</span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center mb-4">
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="text-xs text-gray-500">Spirit Points</div>
                <div className="text-xl font-bold">{character.pools.spirit}</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="text-xs text-gray-500">Active DP</div>
                <div className="text-xl font-bold">{character.pools.active}</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="text-xs text-gray-500">Passive DP</div>
                <div className="text-xl font-bold">{character.pools.passive}</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="text-xs text-gray-500">Mastery Die</div>
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
                  {casterClasses.includes(character.class) && (
                    <li><strong>Magic Attack:</strong> {character.actions.magicAttack}</li>
                  )}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Advantages & Flaws</h3>
                <p className="text-sm font-medium">Advantages:</p>
                <ul className="text-sm list-disc list-inside ml-4 mb-2">
                  {character.advantages.map(a => <li key={a}>{a}</li>)}
                </ul>
                <p className="text-sm font-medium">Flaws:</p>
                <ul className="text-sm list-disc list-inside ml-4">
                  {character.flaws.length ? character.flaws.map(f => <li key={f}>{f}</li>) : <li>None</li>}
                </ul>
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
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <h3 className="font-semibold text-amber-900 mb-2">Weakness Report</h3>
                    <ul className="text-sm text-amber-900 list-disc list-inside">
                      {warnings.map(w => <li key={w}>{w}</li>)}
                    </ul>
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
                  <p className="text-xs text-gray-500 mt-2 italic">This shows CPs spent from the customization budget (10 CP + Level Bonus). Free racial/class minimums cost 0 CP.</p>
                </div>
              )}
              <div className="lg:col-span-2">
                <h3 className="text-lg font-semibold mb-2 text-gray-800">Level Advancement (Earned CP)</h3>
                <div className="overflow-x-auto relative rounded-lg">
                  <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                      <tr>
                        <th scope="col" className="px-4 py-2">To Reach Level</th>
                        <th scope="col" className="px-4 py-2">Total Earned CP Required</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-white border-b"><td className="px-4 py-2 font-medium">Level 2</td><td className="px-4 py-2">100</td></tr>
                      <tr className="bg-gray-50 border-b"><td className="px-4 py-2 font-medium">Level 3</td><td className="px-4 py-2">200</td></tr>
                      <tr className="bg-white border-b"><td className="px-4 py-2 font-medium">Level 4</td><td className="px-4 py-2">300</td></tr>
                      <tr className="bg-gray-50"><td className="px-4 py-2 font-medium">Level 5</td><td className="px-4 py-2">500</td></tr>
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
            <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-bold mb-4">Save Character to Roster</h3>

              {/* Character Details */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-3">Character Details</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Character Name</label>
                    <input
                      type="text"
                      value={pcName}
                      onChange={(e) => setPcName(e.target.value)}
                      placeholder="Enter character name"
                      className="w-full border border-gray-300 rounded p-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Player Name</label>
                    <input
                      type="text"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder="Enter player name"
                      className="w-full border border-gray-300 rounded p-2 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Gender</label>
                    <select
                      value={characterGender}
                      onChange={(e) => setCharacterGender(e.target.value as Gender)}
                      className="w-full border border-gray-300 rounded p-2 text-sm"
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
                      className="w-full border border-gray-300 rounded p-2 text-sm"
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
                      className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
                    >
                      Random Name
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-1">
                    {suggestedNames.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => applySuggestedName(suggestion)}
                        className="text-left text-xs p-2 bg-white border border-gray-200 rounded hover:bg-blue-50 hover:border-blue-300"
                      >
                        {suggestion.firstName} {suggestion.familyName}
                        <span className="text-gray-500 ml-2">({suggestion.culture})</span>
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
                  className="w-full border border-gray-300 rounded-lg p-2"
                >
                  <option value="">No party assignment</option>
                  {partyFolders.map(folder => (
                    <option key={folder.id} value={folder.id}>
                      {folder.name}
                    </option>
                  ))}
                </select>
                {partyFolders.length === 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    No PC party folders available. Create one in the Party Management page.
                  </p>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={confirmSaveCharacter}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded"
                >
                  Save Character
                </button>
                <button
                  onClick={() => {
                    setShowPartyAssignment(false);
                    setSelectedParty('');
                  }}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded"
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