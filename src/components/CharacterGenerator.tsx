'use client';

import { useState } from 'react';

// ======= DATA =======
const dieRanks = ['d4', 'd6', 'd8', 'd10', 'd12'];
const abilities = ['Competence', 'Prowess', 'Fortitude'];
const specs = {
  Competence: ['Adroitness', 'Expertise', 'Perception'],
  Prowess: ['Agility', 'Melee', 'Precision'],
  Fortitude: ['Endurance', 'Strength', 'Willpower']
};
const foci = {
  Adroitness: ['Skulduggery', 'Cleverness'],
  Expertise: ['Wizardry', 'Theurgy'],
  Perception: ['Alertness', 'Perspicacity'],
  Agility: ['Speed', 'Reaction'],
  Melee: ['Threat', 'Finesse'],
  Precision: ['Ranged Threat', 'Ranged Finesse'],
  Endurance: ['Vitality', 'Resilience'],
  Strength: ['Ferocity', 'Might'],
  Willpower: ['Courage', 'Resistance']
};
const races = ['Human', 'Elf', 'Dwarf', 'Gnome', 'Half-Elf', 'Half-Orc', 'Halfling', 'Drakkin'];
const classes = ['Adept', 'Assassin', 'Barbarian', 'Mage', 'Mystic', 'Rogue', 'Theurgist', 'Warrior'];
const levels = [1, 2, 3, 4, 5];
const casterClasses = ['Adept', 'Mage', 'Mystic', 'Theurgist'];
const magicPathsByClass = {
  Adept: ['Thaumaturgy', 'Elementalism', 'Sorcery'],
  Mage: ['Thaumaturgy', 'Elementalism', 'Sorcery'],
  Mystic: ['Mysticism'],
  Theurgist: ['Druidry', 'Hieraticism']
};
const levelInfo = [
  { level: 1, masteryDie: 'd4' },
  { level: 2, masteryDie: 'd6' },
  { level: 3, masteryDie: 'd8' },
  { level: 4, masteryDie: 'd10' },
  { level: 5, masteryDie: 'd12' }
];

const raceMinima = {
  Drakkin: { Competence: 'd6', Prowess: 'd6', Fortitude: 'd6', Endurance: 'd6', Strength: 'd4' },
  Dwarf: { Fortitude: 'd8', Endurance: 'd4', Prowess: 'd6', Melee: 'd6' },
  Elf: { Competence: 'd6', Expertise: 'd6', Wizardry: '+1', Prowess: 'd4', Agility: 'd4', Reaction: '+1' },
  Gnome: { Competence: 'd4', Adroitness: 'd6', Expertise: 'd6', Perception: 'd4', Perspicacity: '+1' },
  'Half-Elf': { Competence: 'd6', Prowess: 'd6', Agility: 'd4', Fortitude: 'd4', Endurance: 'd4', Willpower: 'd4' },
  'Half-Orc': { Fortitude: 'd6', Strength: 'd8', Ferocity: '+1', Endurance: 'd6' },
  Halfling: { Competence: 'd6', Adroitness: 'd6', Cleverness: '+1', Fortitude: 'd6', Willpower: 'd4', Courage: '+1' },
  Human: { Competence: 'd6', Prowess: 'd6', Melee: 'd4', Threat: '+1', Fortitude: 'd4', Willpower: 'd6' }
};

const classMinima = {
  Adept: { Competence: 'd6', Adroitness: 'd4', Cleverness: '+1', Expertise: 'd6', Wizardry: '+1', Perception: 'd4', Perspicacity: '+1' },
  Assassin: { Competence: 'd4', Adroitness: 'd6', Perception: 'd4', Prowess: 'd4', Agility: 'd4', Endurance: 'd6', Melee: 'd4', Finesse: '+1' },
  Barbarian: { Prowess: 'd6', Melee: 'd8', Fortitude: 'd4', Strength: 'd4', Ferocity: '+1' },
  Mage: { Competence: 'd6', Expertise: 'd8', Wizardry: '+1', Fortitude: 'd4', Willpower: 'd6', Resistance: '+1' },
  Mystic: { Competence: 'd6', Expertise: 'd6', Wizardry: '+1', Prowess: 'd4', Melee: 'd4', Fortitude: 'd4', Endurance: 'd6', Resilience: '+1', Vitality: '+2' },
  Rogue: { Competence: 'd4', Adroitness: 'd4', Skulduggery: '+1', Perception: 'd4', Prowess: 'd6', Agility: 'd8' },
  Theurgist: { Competence: 'd8', Expertise: 'd4', Theurgy: '+1', Fortitude: 'd6', Willpower: 'd4' },
  Warrior: { Prowess: 'd8', Melee: 'd6', Threat: '+1', Fortitude: 'd6' }
};

const allAdvantages = {
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

const classFeats = {
  Adept: ['Guile', 'Lore', 'Ritual Magic', 'Quick-witted'],
  Assassin: ['Death Strike', 'Lethal Exploit', 'Ranged Ambush', 'Shadow Walk'],
  Barbarian: ['Berserk', 'Brawl', 'Feat of Strength', 'Grapple'],
  Mage: ['Arcane Finesse', 'Dweomers', 'Intangible Threat', 'Path Mastery'],
  Mystic: ['Iron Mind', 'Path Mastery', 'Premonition', 'Psychic Powers'],
  Rogue: ['Backstab', 'Evasion', 'Roguish Charm', 'Stealth'],
  Theurgist: ['Divine Healing', 'Path Mastery', 'Spiritual Smite', 'Supernatural Intervention'],
  Warrior: ['Battle Savvy', 'Maneuvers', 'Stunning Reversal', 'Sunder Foe']
};

const raceFlaws = {
  Gnome: ['Restriction: small weapons only'],
  Halfling: ['Restriction: small weapons only'],
  'Half-Orc': ['Ugliness']
};

const startingEquipment = {
  common: ['Set of ordinary clothes', 'Purse of 5 gold coins', 'Backpack', 'Small dagger', 'Week\'s rations', 'Waterskin', 'Tinderbox', '50\' rope', 'Iron spikes', 'Small hammer', '6\' traveling staff or 10\' pole', 'Hooded lantern and 2 oil flasks or d4+1 torches'],
  Adept: ['Book of knowledge (area of expertise)'],
  Assassin: ['Assassin hood, jacket, cape, robe, or tunic'],
  Barbarian: ['Garments of woven wool or linen', 'Tunic', 'Overcoat or cloak'],
  Mage: ['Spellbook', 'Staff or focus item'],
  Mystic: ['Robes or shawl', 'Cloak', 'Armor up to leather'],
  Rogue: ['Set of thieves\' tools', 'Light armor (up to leather)', 'One weapon'],
  Theurgist: ['Prayer book', 'Holy relic or symbol', 'Focus item', 'Armor up to chain'],
  Warrior: ['One weapon of choice', 'Armor up to chain', 'Small to large shield', 'Steed']
};

const stepCost = { 'd4': 6, 'd6': 8, 'd8': 10, 'd10': 12, 'd12': Infinity };
const focusStepCost = 4;

const classAxes = {
  Warrior: ['Prowess', 'Melee', 'Strength', 'Fortitude', 'Endurance', 'Threat', 'Agility', 'Might'],
  Barbarian: ['Prowess', 'Melee', 'Strength', 'Fortitude', 'Endurance', 'Ferocity', 'Might', 'Vitality'],
  Rogue: ['Prowess', 'Agility', 'Competence', 'Adroitness', 'Perception', 'Skulduggery', 'Cleverness', 'Speed'],
  Assassin: ['Prowess', 'Agility', 'Melee', 'Competence', 'Adroitness', 'Finesse', 'Speed', 'Perception'],
  Mage: ['Competence', 'Expertise', 'Wizardry', 'Fortitude', 'Willpower', 'Resistance', 'Perception'],
  Mystic: ['Fortitude', 'Willpower', 'Competence', 'Expertise', 'Endurance', 'Prowess', 'Melee', 'Resilience', 'Vitality'],
  Adept: ['Competence', 'Expertise', 'Adroitness', 'Perception', 'Cleverness', 'Wizardry', 'Perspicacity'],
  Theurgist: ['Competence', 'Expertise', 'Theurgy', 'Fortitude', 'Willpower', 'Endurance', 'Courage']
};

// ======= HELPERS =======
const idx = (r: string) => dieRanks.indexOf(r);
const mv = (r: string) => r && r.startsWith('d') ? parseInt(r.slice(1), 10) : 0;
const fnum = (v: string | number) => v ? parseInt(String(v).replace('+', ''), 10) : 0;

interface Character {
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
  actions: Record<string, string>;
  pools: {
    active: number;
    passive: number;
    spirit: number;
  };
}

function showAlert(message: string) {
  alert(message);
}

function getAdvantages(race: string, klass: string) {
  const raceAdv = allAdvantages[race as keyof typeof allAdvantages] || [];
  const classAdv = allAdvantages[klass as keyof typeof allAdvantages] || [];
  const combined = [...new Set([...raceAdv, ...classAdv])];
  return combined;
}

function getEquipment(klass: string) {
  return [...startingEquipment.common, ...(startingEquipment[klass as keyof typeof startingEquipment] || [])];
}

function applyMinima(ch: Character, minima: Record<string, string>) {
  for (const [k, v] of Object.entries(minima || {})) {
    if (abilities.includes(k)) {
      if (idx(v) > idx(ch.abilities[k])) ch.abilities[k] = v;
    } else {
      const parentA = Object.keys(specs).find(a => specs[a as keyof typeof specs].includes(k));
      const parentS = Object.keys(foci).find(s => foci[s as keyof typeof foci].includes(k));
      if (parentA) {
        if (idx(v) > idx(ch.specialties[parentA][k])) ch.specialties[parentA][k] = v;
      } else if (parentS) {
        const pa = Object.keys(specs).find(a => specs[a as keyof typeof specs].includes(parentS));
        if (pa && fnum(v) > fnum(ch.focuses[pa][k])) ch.focuses[pa][k] = `+${fnum(v)}`;
      }
    }
  }
}

// function rookieCaps(profile: string) {
//   if (profile === 'pure') return { abilityMax: 'd6', specMax: 'd6', focusMax: 1, rules: [(_ch: Character) => true] };
//   if (profile === 'balanced') return { abilityMax: 'd8', specMax: 'd8', focusMax: 2, rules: [(ch: Character) => breadthFloors(ch, 'd6')] };
//   if (profile === 'specialist') return { abilityMax: 'd8', specMax: 'd10', focusMax: 3, rules: [(ch: Character) => floors(ch, 'd4')] };
//   return null;
// }

// function softCaps(level: number, style: string) {
//   const sc = { abilityMax: 'd12', specMax: 'd12', focusMax: 5, rules: [] as ((ch: Character) => boolean)[] };
//   if (style === 'balanced') {
//     if (level <= 3) { sc.abilityMax = 'd10'; sc.specMax = 'd10'; sc.focusMax = 3; }
//     if (level === 4) { sc.focusMax = 4; }
//     sc.rules.push((ch: Character) => breadthFloors(ch, 'd8'));
//     sc.rules.push((ch: Character) => countSpecsAtOrAbove(ch, 'd12') <= 1);
//   }
//   if (style === 'hybrid' && level <= 3) sc.focusMax = 4;
//   if (style === 'specialist') {
//     if (level <= 3) sc.focusMax = 5;
//     sc.rules.push((ch: Character) => floors(ch, 'd4'));
//   }
//   return sc;
// }

const order = { 'd4': 0, 'd6': 1, 'd8': 2, 'd10': 3, 'd12': 4 };
function breadthFloors(ch: Character, rank: string) {
  return Object.values(ch.abilities).every(r => order[r as keyof typeof order] >= order[rank as keyof typeof order]);
}
function floors(ch: Character, rank: string) {
  return Object.values(ch.abilities).every(r => order[r as keyof typeof order] >= order[rank as keyof typeof order]);
}
function countSpecsAtOrAbove(ch: Character, rank: string) {
  let n = 0;
  for (const a of abilities) {
    for (const s of specs[a as keyof typeof specs]) {
      if (order[ch.specialties[a][s] as keyof typeof order] >= order[rank as keyof typeof order]) n++;
    }
  }
  return n;
}

function buildWeights(klass: string, style: string) {
  const axis = classAxes[klass as keyof typeof classAxes] || [];
  const w: Record<string, number> = {};
  axis.forEach((k, i) => w[k] = (style === 'specialist' ? 100 - i * 4 : style === 'balanced' ? 60 - i * 3 : 80 - i * 3));
  if (style === 'balanced') {
    w['Competence'] = (w['Competence'] || 30) + 20;
    w['Fortitude'] = (w['Fortitude'] || 30) + 20;
    ['Endurance', 'Strength', 'Willpower', 'Agility'].forEach(k => w[k] = (w[k] || 20) + 10);
  }
  return w;
}

function canUpgrade(ch: Character, key: string, kind: string, level: number, style: string, enforceSoftcaps: boolean) {
  if (!enforceSoftcaps) return true;
  // For now, simplified - could add full validation later
  return true;
}

function spendCP(ch: Character, cpBudget: { value: number }, style: string, level: number, npcMode: boolean, enforceSoftcaps: boolean) {
  const weights = buildWeights(ch.class, style);
  const tryUpgrade = (key: string) => {
    if (abilities.includes(key)) {
      const cur = ch.abilities[key];
      if (cur === 'd12') return false;
      if (!canUpgrade(ch, key, 'ability', level, style, enforceSoftcaps)) return false;
      const cost = stepCost[cur as keyof typeof stepCost];
      if (cpBudget.value < cost) return false;
      ch.abilities[key] = dieRanks[idx(cur) + 1];
      cpBudget.value -= cost;
      return true;
    }
    const pa = Object.keys(specs).find(a => specs[a as keyof typeof specs].includes(key));
    if (pa) {
      const cur = ch.specialties[pa][key];
      if (cur === 'd12') return false;
      if (!canUpgrade(ch, key, 'spec', level, style, enforceSoftcaps)) return false;
      const cost = stepCost[cur as keyof typeof stepCost];
      if (cpBudget.value < cost) return false;
      ch.specialties[pa][key] = dieRanks[idx(cur) + 1];
      cpBudget.value -= cost;
      return true;
    }
    const ps = Object.keys(foci).find(s => foci[s as keyof typeof foci].includes(key));
    if (ps) {
      const pa2 = Object.keys(specs).find(a => specs[a as keyof typeof specs].includes(ps));
      if (pa2) {
        const val = fnum(ch.focuses[pa2][key]);
        if (val >= 5) return false; // max focus
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

function computePools(ch: Character) {
  const AD = mv(ch.abilities.Prowess) + mv(ch.specialties.Prowess.Agility) + mv(ch.specialties.Prowess.Melee);
  const PD = mv(ch.abilities.Fortitude) + mv(ch.specialties.Fortitude.Endurance) + mv(ch.specialties.Fortitude.Strength);
  const SP = mv(ch.abilities.Competence) + mv(ch.specialties.Fortitude.Willpower);
  return { active: AD, passive: PD, spirit: SP };
}

function weaknessReport(ch: Character) {
  const { active, passive, spirit } = computePools(ch);
  const flags = [];
  if (spirit <= 12) flags.push('Low Spirit Points (mental/arcane pressure will hurt).');
  if (active < 24) flags.push('Low Active DP (poor agility/parry).');
  if (passive < 24) flags.push('Low Passive DP (fragile to heavy blows).');
  if (idx(ch.abilities.Competence) <= 1) flags.push('Low Competence (poor perception/social/planning).');
  if (idx(ch.specialties.Competence.Perception) <= 1) flags.push('Low Perception branch (traps/ambush risk).');
  if (idx(ch.specialties.Fortitude.Willpower) <= 1) flags.push('Low Willpower (charms/fear/illusions).');
  if (idx(ch.specialties.Prowess.Precision) <= 1) flags.push('Weak ranged capability.');
  return flags;
}

function calculateCPSpent(finalChar: Character, baseChar: Character, iconic: boolean) {
  const spent = { abilities: 0, specialties: 0, focuses: 0, advantages: 0, total: 0 };
  spent.advantages = iconic ? 4 : 0;

  for (const ab of abilities) {
    const baseRankIndex = idx(baseChar.abilities[ab]);
    const finalRankIndex = idx(finalChar.abilities[ab]);
    for (let i = baseRankIndex; i < finalRankIndex; i++) {
      spent.abilities += stepCost[dieRanks[i] as keyof typeof stepCost];
    }

    for (const sp of specs[ab as keyof typeof specs]) {
      const baseSpecIndex = idx(baseChar.specialties[ab][sp]);
      const finalSpecIndex = idx(finalChar.specialties[ab][sp]);
      for (let i = baseSpecIndex; i < finalSpecIndex; i++) {
        spent.specialties += stepCost[dieRanks[i] as keyof typeof stepCost];
      }
    }

    Object.keys(foci).forEach(specKey => {
      if (specs[ab as keyof typeof specs].includes(specKey)) {
        foci[specKey as keyof typeof foci].forEach(focusKey => {
          const baseFocusValue = fnum(baseChar.focuses[ab][focusKey]);
          const finalFocusValue = fnum(finalChar.focuses[ab][focusKey]);
          spent.focuses += (finalFocusValue - baseFocusValue) * focusStepCost;
        });
      }
    });
  }

  spent.total = 10 + spent.abilities + spent.specialties + spent.focuses + spent.advantages;
  return spent;
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
  const [npcMode, setNpcMode] = useState(false);
  const [showWeakness, setShowWeakness] = useState(true);
  const [character, setCharacter] = useState<Character | null>(null);
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

    const ch: Character = {
      race,
      class: characterClass,
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

    for (const a of abilities) {
      ch.abilities[a] = 'd4';
      ch.specialties[a] = {};
      ch.focuses[a] = {};
      for (const s of specs[a as keyof typeof specs]) {
        ch.specialties[a][s] = 'd4';
        for (const fx of foci[s as keyof typeof foci]) {
          ch.focuses[a][fx] = '+0';
        }
      }
    }

    const baseCharacter = JSON.parse(JSON.stringify(ch));
    applyMinima(baseCharacter, raceMinima[race as keyof typeof raceMinima]);
    applyMinima(baseCharacter, classMinima[characterClass as keyof typeof classMinima]);

    Object.assign(ch, JSON.parse(JSON.stringify(baseCharacter)));

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
      spendCP(ch, cpBudget, buildStyle, level, npcMode, enforceSoftcaps);
    }

    ch.masteryDie = levelInfo[level - 1].masteryDie;
    ch.advantages = getAdvantages(race, characterClass);
    ch.flaws = raceFlaws[race as keyof typeof raceFlaws] || [];
    ch.classFeats = classFeats[characterClass as keyof typeof classFeats] || [];
    ch.equipment = getEquipment(characterClass);

    const w = fnum(ch.focuses.Competence.Wizardry);
    const t = fnum(ch.focuses.Competence.Theurgy);
    ch.actions = {
      meleeAttack: `${ch.abilities.Prowess} + ${ch.specialties.Prowess.Melee}` + (fnum(ch.focuses.Prowess.Threat) ? ` + Threat +${fnum(ch.focuses.Prowess.Threat)}` : ''),
      rangedAttack: `${ch.abilities.Prowess} + ${ch.specialties.Prowess.Precision}` + (fnum(ch.focuses.Prowess['Ranged Threat']) ? ` + Ranged Threat +${fnum(ch.focuses.Prowess['Ranged Threat'])}` : ''),
      perceptionCheck: `${ch.abilities.Competence} + ${ch.specialties.Competence.Perception}` + (fnum(ch.focuses.Competence.Perspicacity) ? ` + Perspicacity +${fnum(ch.focuses.Competence.Perspicacity)}` : ''),
      magicAttack: casterClasses.includes(characterClass) ? `${ch.abilities.Competence} + ${ch.specialties.Competence.Expertise} + ${(w ? `Wizardry +${w}` : t ? `Theurgy +${t}` : '(path focus 0)')}` : '—'
    };

    ch.pools = computePools(ch);
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
    md += `\n### Actions\n- **Melee Attack:** ${ch.actions.meleeAttack}\n- **Ranged Attack:** ${ch.actions.rangedAttack}\n- **Perception Check:** ${ch.actions.perceptionCheck}\n` + (casterClasses.includes(ch.class) ? `- **Magic Attack:** ${ch.actions.magicAttack}\n\n` : '\n');

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
                {races.map(r => <option key={r} value={r}>{r}</option>)}
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
                {classes.map(c => <option key={c} value={c}>{c}</option>)}
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
                  id="npc-mode"
                  type="checkbox"
                  className="h-4 w-4 rounded"
                  checked={npcMode}
                  onChange={(e) => setNpcMode(e.target.checked)}
                />
                <label htmlFor="npc-mode" className="text-sm">NPC Mode <span className="text-xs text-gray-500">(favor breadth / avoid d12 at low level)</span></label>
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
      </div>
    </div>
  );
}