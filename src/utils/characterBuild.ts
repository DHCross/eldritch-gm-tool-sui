import {
  abilities,
  casterClasses,
  classNames,
  classes as classDefinitions,
  costToRankUpDie,
  costToRankUpFocus,
  dieRanks,
  foci,
  levelInfo,
  magicPathsByClass,
  raceNames,
  races as raceDefinitions,
  specs,
  levels,
  type Ability,
  type ClassName,
  type DieRank,
  type Focus,
  type RaceName,
  type Specialty
} from '../data/gameData';

export { abilities, dieRanks, specs, foci, casterClasses, magicPathsByClass, levelInfo, levels };
export type { Ability, DieRank, Specialty, Focus };

export const races = raceNames;
export const classes = classNames;

export const stepCost = costToRankUpDie;
export const focusStepCost = costToRankUpFocus;
export const getCustomizationBudget = (level: number, mythicBonus = false) =>
  (level === 1 ? 10 : 10 + (level - 1) * 100) + (mythicBonus ? 10 : 0);

export interface CustomFocus {
  id: string;
  ability: Ability;
  specialty: Specialty;
  name: string;
  value: string;
}

export interface DuplicateMinimaMatch {
  key: string;
  value: string;
  kind: 'ability' | 'specialty' | 'focus';
}

export interface CreationFocusBonus {
  ability: Ability;
  specialty: Specialty;
  focus: string;
  value: number;
}

export interface FocusSwapSelection {
  sourceFocus: string;
  targetFocus: string;
}

export interface CrossDisciplineSpellcastingSummary {
  available: boolean;
  primaryFocus: 'Wizardry' | 'Theurgy';
  secondaryFocus: 'Wizardry' | 'Theurgy';
  spellCapacity: number;
}

export interface CreationRuleSummary {
  duplicateMinima: DuplicateMinimaMatch[];
  duplicateAdvantages: string[];
  duplicateBenefitAvailable: boolean;
  racialFocusBonuses: CreationFocusBonus[];
  classBaseSpecialties: Array<{ ability: Ability; specialty: Specialty }>;
  focusSwapTargets: CreationFocusBonus[];
}

export interface Character {
  race: RaceName;
  class: ClassName;
  level: number;
  abilities: Record<string, string>;
  specialties: Record<string, Record<string, string>>;
  focuses: Record<string, Record<string, string>>;
  masteryDie: string;
  advantages: string[];
  flaws: string[];
  classFeats: string[];
  equipment: string[];
  customFocuses: CustomFocus[];
  magicPath?: string;
  actions: Record<string, string>;
  pools: {
    active: number;
    passive: number;
    spirit: number;
  };
}

export const idx = (r: string) => dieRanks.indexOf(r as DieRank);
export const mv = (r: string) => (r && r.startsWith('d') ? parseInt(r.slice(1), 10) : 0);
export const fnum = (v: string | number) => (v ? parseInt(String(v).replace('+', ''), 10) : 0);

const normalizeAdvantageName = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '');
const isAbilityKey = (value: string): value is Ability =>
  (abilities as readonly string[]).includes(value);
const findAbilityForSpecialty = (value: string): Ability | undefined =>
  abilities.find(ability => (specs[ability] as readonly string[]).includes(value)) as Ability | undefined;
const isSpecialtyKey = (value: string): value is Specialty =>
  Boolean(findAbilityForSpecialty(value));
const findSpecialtyForFocus = (value: string): Specialty | undefined => {
  const specialty = Object.keys(foci).find(candidate =>
    (foci[candidate as keyof typeof foci] as readonly string[]).includes(value)
  );
  return specialty as Specialty | undefined;
};
const isFocusKey = (value: string): value is Focus | string =>
  Boolean(findSpecialtyForFocus(value));

const getKeyKind = (key: string): DuplicateMinimaMatch['kind'] => {
  if (isAbilityKey(key)) return 'ability';
  if (isSpecialtyKey(key)) return 'specialty';
  return 'focus';
};

const getFocusValueFromMinima = (minima: Record<string, string>, focus: string) => {
  const rawValue = minima[focus];
  return rawValue ? fnum(rawValue) : 0;
};

export function getDuplicateMinima(race: RaceName, klass: ClassName): DuplicateMinimaMatch[] {
  const raceMinima = raceDefinitions[race]?.minima ?? {};
  const classMinima = classDefinitions[klass]?.minima ?? {};

  return Object.keys(raceMinima)
    .filter(key => classMinima[key] && raceMinima[key] === classMinima[key])
    .map(key => ({
      key,
      value: raceMinima[key],
      kind: getKeyKind(key)
    }));
}

export function getDuplicateAdvantages(race: RaceName, klass: ClassName): string[] {
  const raceAdvantages = raceDefinitions[race]?.advantages ?? [];
  const classAdvantages = classDefinitions[klass]?.advantages ?? [];
  const raceByNormalizedName = new Map<string, string>();

  raceAdvantages.forEach(advantage => {
    raceByNormalizedName.set(normalizeAdvantageName(advantage), advantage);
  });

  return classAdvantages.reduce<string[]>((matches, advantage) => {
    const normalized = normalizeAdvantageName(advantage);
    const raceAdvantage = raceByNormalizedName.get(normalized);
    if (raceAdvantage && !matches.some(existing => normalizeAdvantageName(existing) === normalized)) {
      matches.push(raceAdvantage);
    }
    return matches;
  }, []);
}

export function getRacialFocusBonuses(race: RaceName): CreationFocusBonus[] {
  const minima = raceDefinitions[race]?.minima ?? {};

  return Object.entries(minima)
    .filter(([key, value]) => isFocusKey(key) && value.startsWith('+') && fnum(value) > 0)
    .map(([focus, value]) => {
      const specialty = findSpecialtyForFocus(focus)!;
      return {
        ability: findAbilityForSpecialty(specialty)!,
        specialty,
        focus,
        value: fnum(value)
      };
    });
}

export function getClassBaseSpecialties(klass: ClassName): Array<{ ability: Ability; specialty: Specialty }> {
  const minima = classDefinitions[klass]?.minima ?? {};

  return Object.keys(minima)
    .filter(isSpecialtyKey)
    .map(specialty => ({
      ability: findAbilityForSpecialty(specialty)!,
      specialty
    }))
    .filter((entry, index, all) =>
      all.findIndex(candidate => candidate.specialty === entry.specialty) === index
    );
}

export function getAvailableFocusSwapTargets(race: RaceName, klass: ClassName): CreationFocusBonus[] {
  const raceFocusBonuses = getRacialFocusBonuses(race);
  if (!raceFocusBonuses.length) return [];

  const minimaCharacter = createCharacterShell(race, klass, 1).baseCharacter;
  const classSpecialties = getClassBaseSpecialties(klass);

  return classSpecialties.flatMap(({ ability, specialty }) =>
    foci[specialty].reduce<CreationFocusBonus[]>((targets, focus) => {
      if (fnum(minimaCharacter.focuses[ability][focus]) > 0) {
        return targets;
      }

      targets.push({
        ability,
        specialty,
        focus,
        value: raceFocusBonuses[0]?.value ?? 1
      });
      return targets;
    }, [])
  );
}

export function getCreationRuleSummary(race: RaceName, klass: ClassName): CreationRuleSummary {
  const duplicateMinima = getDuplicateMinima(race, klass);
  const duplicateAdvantages = getDuplicateAdvantages(race, klass);
  const racialFocusBonuses = getRacialFocusBonuses(race);

  return {
    duplicateMinima,
    duplicateAdvantages,
    duplicateBenefitAvailable: duplicateMinima.length > 0 || duplicateAdvantages.length > 0,
    racialFocusBonuses,
    classBaseSpecialties: getClassBaseSpecialties(klass),
    focusSwapTargets: getAvailableFocusSwapTargets(race, klass)
  };
}

export function getMulticlassFeatCost(level: number) {
  if (level === 3) return 8;
  if (level === 4) return 6;
  if (level >= 5) return 4;
  return null;
}

export function getCrossDisciplineSpellcastingSummary(ch: Character): CrossDisciplineSpellcastingSummary | null {
  const hasGiftOfMagic = ch.advantages.some(advantage => normalizeAdvantageName(advantage) === 'giftofmagic');
  if (!hasGiftOfMagic) return null;

  const wizardry = fnum(ch.focuses.Competence.Wizardry);
  const theurgy = fnum(ch.focuses.Competence.Theurgy);
  const primaryFocus = ch.class === 'Theurgist' ? 'Theurgy' : 'Wizardry';
  const secondaryFocus = primaryFocus === 'Wizardry' ? 'Theurgy' : 'Wizardry';
  const spellCapacity = secondaryFocus === 'Wizardry' ? wizardry : theurgy;

  return {
    available: spellCapacity > 0,
    primaryFocus,
    secondaryFocus,
    spellCapacity
  };
}

export function deepCloneCharacter<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function applyFocusSwap(ch: Character, race: RaceName, klass: ClassName, selection?: FocusSwapSelection) {
  if (!selection) return;

  const source = getRacialFocusBonuses(race).find(entry => entry.focus === selection.sourceFocus);
  const target = getAvailableFocusSwapTargets(race, klass).find(entry => entry.focus === selection.targetFocus);
  if (!source || !target) return;

  const classSourceValue = getFocusValueFromMinima(classDefinitions[klass]?.minima ?? {}, source.focus);
  ch.focuses[source.ability][source.focus] = `+${classSourceValue}`;
  ch.focuses[target.ability][target.focus] = `+${Math.max(fnum(ch.focuses[target.ability][target.focus]), source.value)}`;
}

export function applyMinima(ch: Character, minima: Record<string, string>) {
  for (const [k, v] of Object.entries(minima || {})) {
    if ((abilities as readonly string[]).includes(k)) {
      if (idx(v) > idx(ch.abilities[k])) ch.abilities[k] = v;
    } else {
      const parentA = Object.keys(specs).find(a => (specs as Record<string, readonly string[]>)[a].includes(k));
      const parentS = Object.keys(foci).find(s => (foci as Record<string, readonly string[]>)[s].includes(k));
      if (parentA) {
        if (idx(v) > idx(ch.specialties[parentA][k])) ch.specialties[parentA][k] = v;
      } else if (parentS) {
        const pa = Object.keys(specs).find(a => (specs as Record<string, readonly string[]>)[a].includes(parentS));
        if (pa && fnum(v) > fnum(ch.focuses[pa][k])) ch.focuses[pa][k] = `+${fnum(v)}`;
      }
    }
  }
}

const buildWeights = (klass: string, style: string) => {
  const axis = classDefinitions[klass as ClassName]?.axes ?? [];
  const w: Record<string, number> = {};
  axis.forEach((k, i) => (w[k] = style === 'specialist' ? 100 - i * 4 : style === 'balanced' ? 60 - i * 3 : 80 - i * 3));
  if (style === 'balanced') {
    w['Competence'] = (w['Competence'] || 30) + 20;
    w['Fortitude'] = (w['Fortitude'] || 30) + 20;
    ['Endurance', 'Strength', 'Willpower', 'Agility'].forEach(k => (w[k] = (w[k] || 20) + 10));
  }
  return w;
};

const canUpgrade = (_ch: Character, _key: string, _kind: string, _level: number, _style: string, enforceSoftcaps: boolean) => {
  if (!enforceSoftcaps) return true;
  return true;
};

export function spendCP(
  ch: Character,
  cpBudget: { value: number },
  style: string,
  level: number,
  npcMode: boolean,
  enforceSoftcaps: boolean
) {
  const weights = buildWeights(ch.class, style);
  const tryUpgrade = (key: string) => {
    if ((abilities as readonly string[]).includes(key)) {
      const cur = ch.abilities[key];
      if (cur === 'd12') return false;
      if (!canUpgrade(ch, key, 'ability', level, style, enforceSoftcaps)) return false;
      const cost = costToRankUpDie[cur as DieRank];
      if (cpBudget.value < cost) return false;
      ch.abilities[key] = dieRanks[idx(cur) + 1] as DieRank;
      cpBudget.value -= cost;
      return true;
    }
    const pa = Object.keys(specs).find(a => (specs as Record<string, readonly string[]>)[a].includes(key));
    if (pa) {
      const cur = ch.specialties[pa][key];
      if (cur === 'd12') return false;
      if (!canUpgrade(ch, key, 'spec', level, style, enforceSoftcaps)) return false;
      const cost = costToRankUpDie[cur as DieRank];
      if (cpBudget.value < cost) return false;
      ch.specialties[pa][key] = dieRanks[idx(cur) + 1] as DieRank;
      cpBudget.value -= cost;
      return true;
    }
    const ps = Object.keys(foci).find(s => (foci as Record<string, readonly string[]>)[s].includes(key));
    if (ps) {
      const pa2 = Object.keys(specs).find(a => (specs as Record<string, readonly string[]>)[a].includes(ps));
      if (pa2) {
        const val = fnum(ch.focuses[pa2][key]);
        if (val >= 5) return false;
        if (cpBudget.value < costToRankUpFocus) return false;
        ch.focuses[pa2][key] = `+${val + 1}`;
        cpBudget.value -= costToRankUpFocus;
        return true;
      }
    }
    return false;
  };
  const keys = [...new Set([...abilities, ...Object.values(specs).flat(), ...Object.values(foci).flat()])];
  let safety = 0;
  while (cpBudget.value > 0 && safety < 5000) {
    safety++;
    const sorted = keys.slice().sort((a, b) => (weights[b] || 10) - (weights[a] || 10));
    let upgraded = false;
    for (const k of sorted) {
      if (tryUpgrade(k)) {
        upgraded = true;
        break;
      }
    }
    if (!upgraded) break;
  }
}

export function computePools(ch: Character) {
  const AD = mv(ch.abilities.Prowess) + mv(ch.specialties.Prowess.Agility) + mv(ch.specialties.Prowess.Melee);
  const PD = mv(ch.abilities.Fortitude) + mv(ch.specialties.Fortitude.Endurance) + mv(ch.specialties.Fortitude.Strength);
  const SP = mv(ch.abilities.Competence) + mv(ch.specialties.Fortitude.Willpower);
  return { active: AD, passive: PD, spirit: SP };
}

export function weaknessReport(ch: Character) {
  const { active, passive, spirit } = computePools(ch);
  const flags: string[] = [];
  if (spirit <= 12) flags.push('Low Spirit Points (mental/arcane pressure will hurt).');
  if (active < 24) flags.push('Low Active DP (poor agility/parry).');
  if (passive < 24) flags.push('Low Passive DP (fragile to heavy blows).');
  if (idx(ch.abilities.Competence) <= 1) flags.push('Low Competence (poor perception/social/planning).');
  if (idx(ch.specialties.Competence.Perception) <= 1) flags.push('Low Perception branch (traps/ambush risk).');
  if (idx(ch.specialties.Fortitude.Willpower) <= 1) flags.push('Low Willpower (charms/fear/illusions).');
  if (idx(ch.specialties.Prowess.Precision) <= 1) flags.push('Weak ranged capability.');
  return flags;
}

export function calculateCPSpent(finalChar: Character, baseChar: Character, iconic: boolean) {
  const spent = { abilities: 0, specialties: 0, focuses: 0, advantages: 0, total: 0 };
  spent.advantages = iconic ? 4 : 0;

  for (const ab of abilities) {
    const abilityKey = ab as keyof typeof specs;
    const baseRankIndex = idx(baseChar.abilities[ab]);
    const finalRankIndex = idx(finalChar.abilities[ab]);
    for (let i = baseRankIndex; i < finalRankIndex; i++) {
      spent.abilities += costToRankUpDie[dieRanks[i] as DieRank];
    }

    for (const sp of specs[abilityKey]) {
      const baseSpecIndex = idx(baseChar.specialties[ab][sp]);
      const finalSpecIndex = idx(finalChar.specialties[ab][sp]);
      for (let i = baseSpecIndex; i < finalSpecIndex; i++) {
        spent.specialties += costToRankUpDie[dieRanks[i] as DieRank];
      }
    }


    for (const specKey of specs[abilityKey]) {
      const focusKeys = foci[specKey as keyof typeof foci];
      focusKeys.forEach(focusKey => {
        const baseFocusValue = fnum(baseChar.focuses[ab][focusKey]);
        const finalFocusValue = fnum(finalChar.focuses[ab][focusKey]);
        spent.focuses += (finalFocusValue - baseFocusValue) * focusStepCost;
      });
    }

  }

  const baseCustomFocuses = new Map(baseChar.customFocuses.map(focus => [focus.id, focus]));
  finalChar.customFocuses.forEach(focus => {
    const baseFocus = baseCustomFocuses.get(focus.id);
    spent.focuses += (fnum(focus.value) - fnum(baseFocus?.value ?? '+0')) * focusStepCost;
  });

  spent.total = spent.abilities + spent.specialties + spent.focuses + spent.advantages;
  return spent;
}

export function getAdvantages(race: string, klass: string) {
  const raceAdv = raceDefinitions[race as RaceName]?.advantages ?? [];
  const classAdv = classDefinitions[klass as ClassName]?.advantages ?? [];
  const combined = [...raceAdv, ...classAdv];
  const uniqueAdvantages = combined.reduce<string[]>((acc, advantage) => {
    if (!acc.some(existing => normalizeAdvantageName(existing) === normalizeAdvantageName(advantage))) {
      acc.push(advantage);
    }
    return acc;
  }, []);
  const hasGiftOfMagicDuplicate = getDuplicateAdvantages(race as RaceName, klass as ClassName)
    .some(advantage => normalizeAdvantageName(advantage) === 'giftofmagic');
  const hasMagicDefense = uniqueAdvantages.some(advantage => normalizeAdvantageName(advantage) === 'magicdefense');

  if (hasGiftOfMagicDuplicate && !hasMagicDefense) {
    uniqueAdvantages.push('Magic Defense');
  }

  return uniqueAdvantages;
}

export function getEquipment(klass: string) {
  const equipment = classDefinitions[klass as ClassName]?.equipment ?? [];
  return [...equipment];
}

export function createCharacterShell(
  race: RaceName,
  klass: ClassName,
  level: number,
  options?: {
    focusSwap?: FocusSwapSelection;
  }
) {
  const ch: Character = {
    race,
    class: klass,
    level,
    abilities: {},
    specialties: {},
    focuses: {},
    masteryDie: '',
    advantages: [],
    flaws: [],
    classFeats: [],
    equipment: [],
    customFocuses: [],
    actions: {},
    pools: { active: 0, passive: 0, spirit: 0 }
  };

  (abilities as readonly string[]).forEach(a => {
    const abilityKey = a as keyof typeof specs;
    ch.abilities[a] = 'd4'; // basic abilities are always free at d4
    ch.specialties[a] = {};
    ch.focuses[a] = {};
    specs[abilityKey].forEach(s => {
      ch.specialties[a][s] = 'd0'; // specialties are untrained (d0) until granted by race/class or purchased
      foci[s as keyof typeof foci].forEach(fx => {
        ch.focuses[a][fx] = '+0';
      });
    });
  });

  const baseCharacter = deepCloneCharacter(ch);
  applyMinima(baseCharacter, raceDefinitions[race as RaceName]?.minima || {});
  applyMinima(baseCharacter, classDefinitions[klass as ClassName]?.minima || {});
  applyFocusSwap(baseCharacter, race, klass, options?.focusSwap);

  const workingCharacter = deepCloneCharacter(baseCharacter);
  workingCharacter.masteryDie = levelInfo[level - 1]?.masteryDie || 'd4';
  workingCharacter.pools = computePools(workingCharacter);
  workingCharacter.advantages = getAdvantages(race, klass);
  workingCharacter.flaws = [...(raceDefinitions[race as RaceName]?.flaws ?? [])];
  workingCharacter.classFeats = [...(classDefinitions[klass as ClassName]?.feats ?? [])];
  workingCharacter.equipment = getEquipment(klass);
  updateActionSummaries(workingCharacter);

  return { character: workingCharacter, baseCharacter };
}

export function updateActionSummaries(ch: Character) {
  const wizardry = ch.focuses?.Competence ? fnum(ch.focuses.Competence.Wizardry) : 0;
  const theurgy = ch.focuses?.Competence ? fnum(ch.focuses.Competence.Theurgy) : 0;
  ch.actions = {
    meleeAttack:
      `${ch.abilities.Prowess} + ${ch.specialties.Prowess.Melee}` +
      (fnum(ch.focuses.Prowess.Threat) ? ` + Threat +${fnum(ch.focuses.Prowess.Threat)}` : ''),
    rangedAttack:
      `${ch.abilities.Prowess} + ${ch.specialties.Prowess.Precision}` +
      (fnum(ch.focuses.Prowess['Ranged Threat']) ? ` + Ranged Threat +${fnum(ch.focuses.Prowess['Ranged Threat'])}` : ''),
    perceptionCheck:
      `${ch.abilities.Competence} + ${ch.specialties.Competence.Perception}` +
      (fnum(ch.focuses.Competence.Perspicacity) ? ` + Perspicacity +${fnum(ch.focuses.Competence.Perspicacity)}` : ''),
    magicAttack: casterClasses.includes(ch.class as (typeof casterClasses)[number])
      ? `${ch.abilities.Competence} + ${ch.specialties.Competence.Expertise} + ${
          wizardry ? `Wizardry +${wizardry}` : theurgy ? `Theurgy +${theurgy}` : '(path focus 0)'
        }`
      : '—'
  };
  ch.pools = computePools(ch);
}

export function updateDerivedCharacterData(ch: Character) {
  ch.masteryDie = levelInfo[ch.level - 1]?.masteryDie || 'd4';
  ch.advantages = getAdvantages(ch.race, ch.class);
  ch.flaws = [...(raceDefinitions[ch.race as RaceName]?.flaws ?? [])];
  ch.classFeats = [...(classDefinitions[ch.class as ClassName]?.feats ?? [])];
  ch.equipment = getEquipment(ch.class);
  updateActionSummaries(ch);
}
