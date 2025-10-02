export const dieRanks = ['d4', 'd6', 'd8', 'd10', 'd12'] as const;
export type DieRank = typeof dieRanks[number];

export const abilities = ['Competence', 'Prowess', 'Fortitude'] as const;
export type Ability = typeof abilities[number];

export const specs = {
  Competence: ['Adroitness', 'Expertise', 'Perception'],
  Prowess: ['Agility', 'Melee', 'Precision'],
  Fortitude: ['Endurance', 'Strength', 'Willpower']
} as const;
export type Specialty = (typeof specs)[keyof typeof specs][number];

export const foci = {
  Adroitness: ['Skulduggery', 'Cleverness'],
  Expertise: ['Wizardry', 'Theurgy'],
  Perception: ['Alertness', 'Perspicacity'],
  Agility: ['Speed', 'Reaction'],
  Melee: ['Threat', 'Finesse'],
  Precision: ['Ranged Threat', 'Ranged Finesse'],
  Endurance: ['Vitality', 'Resilience'],
  Strength: ['Ferocity', 'Might'],
  Willpower: ['Courage', 'Resistance']
} as const;
export type Focus = typeof foci[keyof typeof foci][number];

export const races = ['Human', 'Elf', 'Dwarf', 'Gnome', 'Half-Elf', 'Half-Orc', 'Halfling', 'Drakkin'] as const;
export const classes = ['Adept', 'Assassin', 'Barbarian', 'Mage', 'Mystic', 'Rogue', 'Theurgist', 'Warrior'] as const;
export const levels = [1, 2, 3, 4, 5] as const;

export const casterClasses = ['Adept', 'Mage', 'Mystic', 'Theurgist'] as const;

export const magicPathsByClass: Record<string, string[]> = {
  Adept: ['Thaumaturgy', 'Elementalism', 'Sorcery'],
  Mage: ['Thaumaturgy', 'Elementalism', 'Sorcery'],
  Mystic: ['Mysticism'],
  Theurgist: ['Druidry', 'Hieraticism']
};

export const levelInfo = [
  { level: 1, masteryDie: 'd4' },
  { level: 2, masteryDie: 'd6' },
  { level: 3, masteryDie: 'd8' },
  { level: 4, masteryDie: 'd10' },
  { level: 5, masteryDie: 'd12' }
];

export const raceMinima: Record<string, Record<string, string>> = {
  Drakkin: { Competence: 'd6', Prowess: 'd6', Fortitude: 'd6', Endurance: 'd6', Strength: 'd4' },
  Dwarf: { Fortitude: 'd8', Endurance: 'd4', Prowess: 'd6', Melee: 'd6' },
  Elf: { Competence: 'd6', Expertise: 'd6', Wizardry: '+1', Prowess: 'd4', Agility: 'd4', Reaction: '+1' },
  Gnome: { Competence: 'd4', Adroitness: 'd6', Expertise: 'd6', Perception: 'd4', Perspicacity: '+1' },
  'Half-Elf': { Competence: 'd6', Prowess: 'd6', Agility: 'd4', Fortitude: 'd4', Endurance: 'd4', Willpower: 'd4' },
  'Half-Orc': { Fortitude: 'd6', Strength: 'd8', Ferocity: '+1', Endurance: 'd6' },
  Halfling: { Competence: 'd6', Adroitness: 'd6', Cleverness: '+1', Fortitude: 'd6', Willpower: 'd4', Courage: '+1' },
  Human: { Competence: 'd6', Prowess: 'd6', Melee: 'd4', Threat: '+1', Fortitude: 'd4', Willpower: 'd6' }
};

export const classMinima: Record<string, Record<string, string>> = {
  Adept: { Competence: 'd6', Adroitness: 'd4', Cleverness: '+1', Expertise: 'd6', Wizardry: '+1', Perception: 'd4', Perspicacity: '+1' },
  Assassin: { Competence: 'd4', Adroitness: 'd6', Perception: 'd4', Prowess: 'd4', Agility: 'd4', Endurance: 'd6', Melee: 'd4', Finesse: '+1' },
  Barbarian: { Prowess: 'd6', Melee: 'd8', Fortitude: 'd4', Strength: 'd4', Ferocity: '+1' },
  Mage: { Competence: 'd6', Expertise: 'd8', Wizardry: '+1', Fortitude: 'd4', Willpower: 'd6', Resistance: '+1' },
  Mystic: { Competence: 'd6', Expertise: 'd6', Wizardry: '+1', Prowess: 'd4', Melee: 'd4', Fortitude: 'd4', Endurance: 'd6', Resilience: '+1', Vitality: '+2' },
  Rogue: { Competence: 'd4', Adroitness: 'd4', Skulduggery: '+1', Perception: 'd4', Prowess: 'd6', Agility: 'd8' },
  Theurgist: { Competence: 'd8', Expertise: 'd4', Theurgy: '+1', Fortitude: 'd6', Willpower: 'd4' },
  Warrior: { Prowess: 'd8', Melee: 'd6', Threat: '+1', Fortitude: 'd6' }
};

export const allAdvantages: Record<string, string[]> = {
  Human: ['Fortunate', 'Survival'],
  Elf: ['Night Vision', 'Gift of Magic', 'Magic Resistance (+1)'],
  Dwarf: ['Night Vision', 'Strong-willed', 'Sense of Direction'],
  Gnome: ['Eidetic Memory', 'Low-Light Vision', 'Observant'],
  'Half-Elf': ['Heightened Senses', 'Low-Light Vision', 'Magic Resistance (+1)'],
  'Half-Orc': ['Low-light Vision', 'Intimidation', 'Menacing'],
  Halfling: ['Low Light Vision', 'Read Emotions', 'Resilient'],
  Drakkin: ['Natural Armor', 'Breath Weapon', 'Night Vision'],
  Adept: ['Arcanum', 'Gift of Magic', 'Literacy', 'Scholar'],
  Assassin: ['Expeditious', 'Heightened Senses (hearing)', 'Observant', 'Read Emotions'],
  Barbarian: ['Animal Affinity', 'Brutishness', 'Menacing', 'Resilient'],
  Mage: ['Arcanum', 'Gift of Magic', 'Magic Defense', 'Scholar'],
  Mystic: ['Empathic', 'Gift of Magic', 'Intuitive', 'Magic Resistance (Lesser)', 'Strong-Willed'],
  Rogue: ['Expeditious', 'Fortunate', 'Streetwise', 'Underworld Contacts'],
  Theurgist: ['Gift of Magic', 'Magic Defense', 'Religion', 'Strong-Willed'],
  Warrior: ['Commanding', 'Intimidation', 'Magic Resistance (+1)', 'Tactician']
};

export const classFeats: Record<string, string[]> = {
  Adept: ['Guile', 'Lore', 'Ritual Magic', 'Quick-witted'],
  Assassin: ['Death Strike', 'Lethal Exploit', 'Ranged Ambush', 'Shadow Walk'],
  Barbarian: ['Berserk', 'Brawl', 'Feat of Strength', 'Grapple'],
  Mage: ['Arcane Finesse', 'Dweomers', 'Intangible Threat', 'Path Mastery'],
  Mystic: ['Iron Mind', 'Path Mastery', 'Premonition', 'Psychic Powers'],
  Rogue: ['Backstab', 'Evasion', 'Roguish Charm', 'Stealth'],
  Theurgist: ['Divine Healing', 'Path Mastery', 'Spiritual Smite', 'Supernatural Intervention'],
  Warrior: ['Battle Savvy', 'Maneuvers', 'Stunning Reversal', 'Sunder Foe']
};

export const raceFlaws: Record<string, string[]> = {
  Gnome: ['Restriction: small weapons only'],
  Halfling: ['Restriction: small weapons only'],
  'Half-Orc': ['Ugliness']
};

export const startingEquipment: Record<string, string[]> = {
  common: ['Set of ordinary clothes', 'Purse of 5 gold coins', 'Backpack', 'Small dagger', "Week's rations", 'Waterskin', 'Tinderbox', "50' rope", 'Iron spikes', 'Small hammer', "6' traveling staff or 10' pole", 'Hooded lantern and 2 oil flasks or d4+1 torches'],
  Adept: ['Book of knowledge (area of expertise)'],
  Assassin: ['Assassin hood, jacket, cape, robe, or tunic'],
  Barbarian: ['Garments of woven wool or linen', 'Tunic', 'Overcoat or cloak'],
  Mage: ['Spellbook', 'Staff or focus item'],
  Mystic: ['Robes or shawl', 'Cloak', 'Armor up to leather'],
  Rogue: ["Set of thieves' tools", 'Light armor (up to leather)', 'One weapon'],
  Theurgist: ['Prayer book', 'Holy relic or symbol', 'Focus item', 'Armor up to chain'],
  Warrior: ['One weapon of choice', 'Armor up to chain', 'Small to large shield', 'Steed']
};

export const stepCost: Record<DieRank, number> = { d4: 6, d6: 8, d8: 10, d10: 12, d12: Infinity } as const;
export const focusStepCost = 4;

export const classAxes: Record<string, string[]> = {
  Warrior: ['Prowess', 'Melee', 'Strength', 'Fortitude', 'Endurance', 'Threat', 'Agility', 'Might'],
  Barbarian: ['Prowess', 'Melee', 'Strength', 'Fortitude', 'Endurance', 'Ferocity', 'Might', 'Vitality'],
  Rogue: ['Prowess', 'Agility', 'Competence', 'Adroitness', 'Perception', 'Skulduggery', 'Cleverness', 'Speed'],
  Assassin: ['Prowess', 'Agility', 'Melee', 'Competence', 'Adroitness', 'Finesse', 'Speed', 'Perception'],
  Mage: ['Competence', 'Expertise', 'Wizardry', 'Fortitude', 'Willpower', 'Resistance', 'Perception'],
  Mystic: ['Fortitude', 'Willpower', 'Competence', 'Expertise', 'Endurance', 'Prowess', 'Melee', 'Resilience', 'Vitality'],
  Adept: ['Competence', 'Expertise', 'Adroitness', 'Perception', 'Cleverness', 'Wizardry', 'Perspicacity'],
  Theurgist: ['Competence', 'Expertise', 'Theurgy', 'Fortitude', 'Willpower', 'Endurance', 'Courage']
};

export interface Character {
  race: string;
  class: string;
  level: number;
  abilities: Record<string, string>;
  specialties: Record<string, Record<string, string>>;
  focuses: Record<string, Record<string, string>>;
  masteryDie: string;
  advantages: string[];
  flaws: string[];
  classFeats: string[];
  equipment: string[];
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

export function deepCloneCharacter<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
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
  const axis = classAxes[klass as keyof typeof classAxes] || [];
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
      const cost = stepCost[cur as DieRank];
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
      const cost = stepCost[cur as DieRank];
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
        if (cpBudget.value < focusStepCost) return false;
        ch.focuses[pa2][key] = `+${val + 1}`;
        cpBudget.value -= focusStepCost;
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
      spent.abilities += stepCost[dieRanks[i] as DieRank];
    }

    for (const sp of specs[abilityKey]) {
      const baseSpecIndex = idx(baseChar.specialties[ab][sp]);
      const finalSpecIndex = idx(finalChar.specialties[ab][sp]);
      for (let i = baseSpecIndex; i < finalSpecIndex; i++) {
        spent.specialties += stepCost[dieRanks[i] as DieRank];
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

  spent.total = 10 + spent.abilities + spent.specialties + spent.focuses + spent.advantages;
  return spent;
}

export function getAdvantages(race: string, klass: string) {
  const raceAdv = allAdvantages[race as keyof typeof allAdvantages] || [];
  const classAdv = allAdvantages[klass as keyof typeof allAdvantages] || [];
  return [...new Set([...raceAdv, ...classAdv])];
}

export function getEquipment(klass: string) {
  return [...startingEquipment.common, ...(startingEquipment[klass as keyof typeof startingEquipment] || [])];
}

export function createCharacterShell(race: string, klass: string, level: number) {
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
    actions: {},
    pools: { active: 0, passive: 0, spirit: 0 }
  };

  (abilities as readonly string[]).forEach(a => {
    const abilityKey = a as keyof typeof specs;
    ch.abilities[a] = 'd4';
    ch.specialties[a] = {};
    ch.focuses[a] = {};
    specs[abilityKey].forEach(s => {
      ch.specialties[a][s] = 'd4';
      foci[s as keyof typeof foci].forEach(fx => {
        ch.focuses[a][fx] = '+0';
      });
    });
  });

  const baseCharacter = deepCloneCharacter(ch);
  applyMinima(baseCharacter, raceMinima[race] || {});
  applyMinima(baseCharacter, classMinima[klass] || {});

  const workingCharacter = deepCloneCharacter(baseCharacter);
  workingCharacter.masteryDie = levelInfo[level - 1]?.masteryDie || 'd4';
  workingCharacter.pools = computePools(workingCharacter);
  workingCharacter.advantages = getAdvantages(race, klass);
  workingCharacter.flaws = raceFlaws[race as keyof typeof raceFlaws] || [];
  workingCharacter.classFeats = classFeats[klass as keyof typeof classFeats] || [];
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
  ch.flaws = raceFlaws[ch.race as keyof typeof raceFlaws] || [];
  ch.classFeats = classFeats[ch.class as keyof typeof classFeats] || [];
  ch.equipment = getEquipment(ch.class);
  updateActionSummaries(ch);
}
