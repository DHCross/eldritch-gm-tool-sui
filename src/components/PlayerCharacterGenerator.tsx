import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from 'sonner'
import { AlertTriangle, Download, Copy } from "@phosphor-icons/react"

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
  { level: 1, masteryDie: 'd4', cpBand: [10, 100] },
  { level: 2, masteryDie: 'd6', cpBand: [101, 199] },
  { level: 3, masteryDie: 'd8', cpBand: [200, 299] },
  { level: 4, masteryDie: 'd10', cpBand: [300, 399] },
  { level: 5, masteryDie: 'd12', cpBand: [400, 999] }
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

const stepCost = { 'd4': 6, 'd6': 8, 'd8': 10, 'd10': 12, 'd12': Infinity };
const cumulativeDieCost = { 'd4': 4, 'd6': 10, 'd8': 18, 'd10': 28, 'd12': 40 };
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

// ======= INTERFACES =======
interface Character {
  race: string
  class: string
  level: number
  displayLevel: number
  abilities: Record<string, string>
  specialties: Record<string, Record<string, string>>
  focuses: Record<string, Record<string, string>>
  pools: { active: number, passive: number, spirit: number }
  masteryDie: string
  actions: Record<string, string>
}

// ======= HELPERS =======
const idx = (r: string) => dieRanks.indexOf(r);
const mv = (r: string) => r && r.startsWith('d') ? parseInt(r.slice(1), 10) : 0;
const fnum = (v: string) => v ? parseInt(String(v).replace('+', ''), 10) : 0;

const PlayerCharacterGenerator: React.FC = () => {
  const [settings, setSettings] = useState({
    race: '',
    class: '',
    level: 1,
    magicPath: '',
    iconicArcane: false,
    buildStyle: 'balanced' as 'balanced' | 'hybrid' | 'specialist',
    rookieProfile: 'off' as 'off' | 'pure' | 'balanced' | 'specialist',
    npcMode: false,
    enforceSoftcaps: true,
    showWeakness: true
  });

  const [character, setCharacter] = useState<Character | null>(null);
  const [cpTotals, setCpTotals] = useState<any>(null);
  const [warnings, setWarnings] = useState<string[]>([]);

  useEffect(() => {
    // Enable/disable rookie profile based on level
    if (settings.level !== 1) {
      setSettings(prev => ({ ...prev, rookieProfile: 'off' }));
    }
  }, [settings.level]);

  const applyMinima = (ch: Character, minima: Record<string, string>) => {
    for (const [k, v] of Object.entries(minima || {})) {
      if (abilities.includes(k)) {
        if (idx(v) > idx(ch.abilities[k])) ch.abilities[k] = v;
      } else {
        const parentA = Object.keys(specs).find(a => (specs as any)[a].includes(k));
        const parentS = Object.keys(foci).find(s => (foci as any)[s].includes(k));
        if (parentA) {
          if (idx(v) > idx(ch.specialties[parentA][k])) ch.specialties[parentA][k] = v;
        } else if (parentS) {
          const pa = Object.keys(specs).find(a => (specs as any)[a].includes(parentS));
          if (pa && fnum(v) > fnum(ch.focuses[pa][k])) ch.focuses[pa][k] = `+${fnum(v)}`;
        }
      }
    }
  };

  const rookieCaps = (profile: string) => {
    if (profile === 'pure') return { abilityMax: 'd6', specMax: 'd6', focusMax: 1, rules: [(ch: Character) => true] };
    if (profile === 'balanced') return { abilityMax: 'd8', specMax: 'd8', focusMax: 2, rules: [(ch: Character) => breadthFloors(ch, 'd6')] };
    if (profile === 'specialist') return { abilityMax: 'd8', specMax: 'd10', focusMax: 3, rules: [(ch: Character) => floors(ch, 'd4')] };
    return null;
  };

  const softCaps = (level: number, style: string) => {
    const sc = { abilityMax: 'd12', specMax: 'd12', focusMax: 5, rules: [] as any[] };
    if (style === 'balanced') {
      if (level <= 3) { sc.abilityMax = 'd10'; sc.specMax = 'd10'; sc.focusMax = 3; }
      if (level === 4) { sc.focusMax = 4; }
      sc.rules.push((ch: Character) => breadthFloors(ch, 'd8'));
      sc.rules.push((ch: Character) => countSpecsAtOrAbove(ch, 'd12') <= 1);
    }
    if (style === 'hybrid' && level <= 3) sc.focusMax = 4;
    if (style === 'specialist') {
      if (level <= 3) sc.focusMax = 5;
      sc.rules.push((ch: Character) => floors(ch, 'd4'));
    }
    return sc;
  };

  const order = { 'd4': 0, 'd6': 1, 'd8': 2, 'd10': 3, 'd12': 4 };
  const breadthFloors = (ch: Character, rank: string) => Object.values(ch.abilities).every(r => (order as any)[r] >= (order as any)[rank]);
  const floors = (ch: Character, rank: string) => Object.values(ch.abilities).every(r => (order as any)[r] >= (order as any)[rank]);
  const countSpecsAtOrAbove = (ch: Character, rank: string) => {
    let n = 0;
    for (const a of abilities) {
      for (const s of (specs as any)[a])
        if ((order as any)[ch.specialties[a][s]] >= (order as any)[rank]) n++;
    }
    return n;
  };

  const buildWeights = (klass: string, style: string) => {
    const axis = (classAxes as any)[klass] || [];
    const w: Record<string, number> = {};
    axis.forEach((k: string, i: number) => w[k] = (style === 'specialist' ? 100 - i * 4 : style === 'balanced' ? 60 - i * 3 : 80 - i * 3));
    if (style === 'balanced') {
      w['Competence'] = (w['Competence'] || 30) + 20;
      w['Fortitude'] = (w['Fortitude'] || 30) + 20;
      ['Endurance', 'Strength', 'Willpower', 'Agility'].forEach(k => w[k] = (w[k] || 20) + 10);
    }
    return w;
  };

  const canUpgrade = (ch: Character, key: string, kind: 'ability' | 'spec', level: number, style: string) => {
    if (!settings.enforceSoftcaps) return true;
    const rp = settings.rookieProfile;
    const rc = rookieCaps(rp);
    const sc = (level === 1 && rp !== 'off') ? rc : softCaps(level, style);
    const maxDie = (kind === 'ability') ? sc!.abilityMax : sc!.specMax;
    let cur = 'd4';
    if (kind === 'ability') cur = ch.abilities[key];
    else {
      const pa = Object.keys(specs).find(a => (specs as any)[a].includes(key));
      if (pa) cur = ch.specialties[pa][key];
    }
    if ((order as any)[cur] >= (order as any)[maxDie]) return false;
    for (const rule of sc!.rules) { if (!rule(ch)) return false; }
    if (!rc && style === 'balanced' && kind === 'spec') {
      const pa = Object.keys(specs).find(a => (specs as any)[a].includes(key));
      if (pa) {
        const parent = ch.abilities[pa];
        if ((order as any)[cur] + 1 > (order as any)[parent] + 1) return false;
      }
    }
    return true;
  };

  const spendCP = (ch: Character, cpBudget: { value: number }, style: string, level: number) => {
    const weights = buildWeights(ch.class, style);
    const tryUpgrade = (key: string) => {
      if (abilities.includes(key)) {
        const cur = ch.abilities[key];
        if (cur === 'd12') return false;
        if (!canUpgrade(ch, key, 'ability', level, style)) return false;
        const cost = stepCost[cur as keyof typeof stepCost];
        if (cpBudget.value < cost) return false;
        ch.abilities[key] = dieRanks[idx(cur) + 1];
        cpBudget.value -= cost;
        return true;
      }
      const pa = Object.keys(specs).find(a => (specs as any)[a].includes(key));
      if (pa) {
        const cur = ch.specialties[pa][key];
        if (cur === 'd12') return false;
        if (!canUpgrade(ch, key, 'spec', level, style)) return false;
        const cost = stepCost[cur as keyof typeof stepCost];
        if (cpBudget.value < cost) return false;
        ch.specialties[pa][key] = dieRanks[idx(cur) + 1];
        cpBudget.value -= cost;
        return true;
      }
      const ps = Object.keys(foci).find(s => (foci as any)[s].includes(key));
      if (ps) {
        const pa2 = Object.keys(specs).find(a => (specs as any)[a].includes(ps));
        if (pa2) {
          const val = fnum(ch.focuses[pa2][key]);
          const rp = settings.rookieProfile;
          const rc = rookieCaps(rp);
          const sc = (level === 1 && rp !== 'off') ? rc : softCaps(level, style);
          if (val >= sc!.focusMax) return false;
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
      for (const k of sorted) { if (tryUpgrade(k)) { upgraded = true; break; } }
      if (!upgraded) break;
    }
  };

  const computePools = (ch: Character) => {
    const AD = mv(ch.abilities.Prowess) + mv(ch.specialties.Prowess.Agility) + mv(ch.specialties.Prowess.Melee);
    const PD = mv(ch.abilities.Fortitude) + mv(ch.specialties.Fortitude.Endurance) + mv(ch.specialties.Fortitude.Strength);
    const SP = mv(ch.abilities.Competence) + mv(ch.specialties.Fortitude.Willpower);
    return { active: AD, passive: PD, spirit: SP };
  };

  const weaknessReport = (ch: Character) => {
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
  };

  const cpTally = (ch: Character, iconic: boolean) => {
    let a = 0, s = 0, f = 0;
    for (const ab of abilities) {
      a += (cumulativeDieCost[ch.abilities[ab] as keyof typeof cumulativeDieCost] || 0);
      for (const sp of (specs as any)[ab])
        s += (cumulativeDieCost[ch.specialties[ab][sp] as keyof typeof cumulativeDieCost] || 0);
      for (const fx of Object.values(ch.focuses[ab]))
        f += fnum(fx) * focusStepCost;
    }
    const base = 10, adv = iconic ? 4 : 0;
    return { base, abilities: a, specialties: s, focuses: f, advantages: adv, total: base + a + s + f + adv };
  };

  const generateCharacter = () => {
    if (!settings.race || !settings.class) {
      toast.error('Please select a valid race and class');
      return;
    }

    const ch: Character = {
      race: settings.race,
      class: settings.class,
      level: settings.level,
      displayLevel: 1,
      abilities: {},
      specialties: {},
      focuses: {},
      pools: { active: 0, passive: 0, spirit: 0 },
      masteryDie: 'd4',
      actions: {}
    };

    for (const a of abilities) {
      ch.abilities[a] = 'd4';
      ch.specialties[a] = {};
      ch.focuses[a] = {};
      for (const s of (specs as any)[a]) {
        ch.specialties[a][s] = 'd4';
        for (const fx of (foci as any)[s]) ch.focuses[a][fx] = '+0';
      }
    }

    applyMinima(ch, (raceMinima as any)[settings.race]);
    applyMinima(ch, (classMinima as any)[settings.class]);

    const cpBudget = { value: 10 + (settings.level - 1) * 100 - (settings.iconicArcane ? 4 : 0) };
    if (settings.level === 1 && settings.rookieProfile === 'pure') {
      /* no CP spending beyond minima */
    } else {
      spendCP(ch, cpBudget, settings.buildStyle, settings.level);
    }

    const totals = cpTally(ch, settings.iconicArcane);
    let actualLevel = 1;
    for (let i = levelInfo.length - 1; i >= 0; i--) {
      if (totals.total >= levelInfo[i].cpBand[0]) {
        actualLevel = levelInfo[i].level;
        break;
      }
    }
    ch.displayLevel = actualLevel;
    ch.masteryDie = levelInfo[actualLevel - 1].masteryDie;

    const w = fnum(ch.focuses.Competence.Wizardry);
    const t = fnum(ch.focuses.Competence.Theurgy);
    ch.actions = {
      meleeAttack: `${ch.abilities.Prowess} + ${ch.specialties.Prowess.Melee}` + (fnum(ch.focuses.Prowess.Threat) ? ` + Threat +${fnum(ch.focuses.Prowess.Threat)}` : ''),
      rangedAttack: `${ch.abilities.Prowess} + ${ch.specialties.Prowess.Precision}` + (fnum(ch.focuses.Prowess['Ranged Threat']) ? ` + Ranged Threat +${fnum(ch.focuses.Prowess['Ranged Threat'])}` : ''),
      perceptionCheck: `${ch.abilities.Competence} + ${ch.specialties.Competence.Perception}` + (fnum(ch.focuses.Competence.Perspicacity) ? ` + Perspicacity +${fnum(ch.focuses.Competence.Perspicacity)}` : ''),
      magicAttack: casterClasses.includes(settings.class) ? `${ch.abilities.Competence} + ${ch.specialties.Competence.Expertise} + ${(w ? `Wizardry +${w}` : t ? `Theurgy +${t}` : '(path focus 0)')}` : '—'
    };

    ch.pools = computePools(ch);
    const warn = settings.showWeakness ? weaknessReport(ch) : [];

    setCharacter(ch);
    setCpTotals(totals);
    setWarnings(warn);
    toast.success('Character generated successfully!');
  };

  const getFullMarkdown = () => {
    if (!character) return '';
    const ch = character;
    const totals = cpTotals;
    const band = levelInfo[ch.displayLevel - 1].cpBand;
    const bandStr = `${band[0]} to ${band[1]}`;
    
    let md = `# ${ch.race} ${ch.class} (Level ${ch.displayLevel})\n\n` +
      `### Core Stats\n` +
      `- **SP:** ${ch.pools.spirit} | **Active DP:** ${ch.pools.active} | **Passive DP:** ${ch.pools.passive}\n` +
      `- **Mastery Die:** ${ch.masteryDie}\n` +
      `- **Total CP Value:** ${totals.total} (Expected Range for Level ${ch.displayLevel}: ${bandStr})\n\n` +
      `### Abilities\n`;
    
    for (const a of abilities) {
      const sp = (specs as any)[a].map((s: string) => {
        const fl = (foci as any)[s].map((fx: string) => {
          const v = fnum(ch.focuses[a][fx]);
          return v ? `${fx} +${v}` : null;
        }).filter(Boolean).join(', ');
        return `${s} **${ch.specialties[a][s]}**${fl ? ` (${fl})` : ''}`;
      }).join(', ');
      md += `**${a} ${ch.abilities[a]}** → ${sp}.\n`;
    }
    
    md += `\n### Actions\n- **Melee Attack:** ${ch.actions.meleeAttack}\n- **Ranged Attack:** ${ch.actions.rangedAttack}\n- **Perception Check:** ${ch.actions.perceptionCheck}\n` + (casterClasses.includes(ch.class) ? `- **Magic Attack:** ${ch.actions.magicAttack}\n\n` : '\n');
    md += `### Character Points Breakdown (Total Value)\n- **Base Customization:** ${totals.base}\n- **From Abilities:** ${totals.abilities}\n- **From Specialties:** ${totals.specialties}\n- **From Focuses:** ${totals.focuses}\n- **From Advantages:** ${totals.advantages}\n- **Total CP Value:** ${totals.total}\n`;
    md += `\n_Note: Total CP Value reflects the character's build balance. Advancement in-game is tracked separately via Earned CP, starting from 0._\n`;
    md += `\n### Level Advancement (Earned CP)\n`;
    md += `| To Reach Level | Total Earned CP Required |\n`;
    md += `| :------------- | :----------------------- |\n`;
    md += `| Level 2        | 100                      |\n`;
    md += `| Level 3        | 200                      |\n`;
    md += `| Level 4        | 300                      |\n`;
    md += `| Level 5        | 500                      |\n`;
    return md;
  };

  const exportMarkdown = () => {
    const md = getFullMarkdown();
    if (!md) {
      toast.error('Generate a character first!');
      return;
    }
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${character!.race}_${character!.class}_L${character!.displayLevel}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const copyMarkdown = async () => {
    const md = getFullMarkdown();
    if (!md) {
      toast.error('Generate a character first!');
      return;
    }
    try {
      await navigator.clipboard.writeText(md);
      toast.success('Markdown copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy markdown.');
    }
  };

  const showMagicPathSelector = casterClasses.includes(settings.class) &&
    settings.class !== 'Adept' &&
    settings.class !== 'Mystic';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Player Character Generator</CardTitle>
          <CardDescription>
            Create detailed player characters with <strong>Balanced · Specialist · Rookie</strong> build options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="race">Race</Label>
              <Select value={settings.race} onValueChange={(value) => setSettings({ ...settings, race: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Race" />
                </SelectTrigger>
                <SelectContent>
                  {races.map((race) => (
                    <SelectItem key={race} value={race}>
                      {race}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="class">Class</Label>
              <Select value={settings.class} onValueChange={(value) => setSettings({ ...settings, class: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls} value={cls}>
                      {cls}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="level">Level</Label>
              <Select value={settings.level.toString()} onValueChange={(value) => setSettings({ ...settings, level: parseInt(value) })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {levels.map((level) => (
                    <SelectItem key={level} value={level.toString()}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {showMagicPathSelector && (
              <div>
                <Label htmlFor="magicPath">Chosen Magic Path</Label>
                <Select value={settings.magicPath} onValueChange={(value) => setSettings({ ...settings, magicPath: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Path" />
                  </SelectTrigger>
                  <SelectContent>
                    {(magicPathsByClass as any)[settings.class]?.map((path: string) => (
                      <SelectItem key={path} value={path}>
                        {path}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

                onValueChange={(value) => setSettings({ ...settings, buildStyle: value as any })}
                className="flex flex-wrap gap-2"
              >
                <div className="flex items-center space-x-2 bg-background border rounded-full px-3 py-2">
                  <RadioGroupItem value="balanced" id="balanced" />
                  <Label htmlFor="balanced" className="text-sm font-medium">Balanced</Label>
                </div>
                <div className="flex items-center space-x-2 bg-background border rounded-full px-3 py-2">
              >em value="hybrid" id="hybrid" />
                  <Label htmlFor="hybrid" className="text-sm font-medium">Hybrid</Label>
                </div>
                <div className="flex items-center space-x-2 bg-background border rounded-full px-3 py-2">
                </div>t" />
                  <Label htmlFor="specialist" className="text-sm font-medium">Specialist</Label>
                </div>
              </RadioGroup>
              <div className="mt-3 flex items-center space-x-2">
                <Checkbox
                  id="enforceSoftcaps"
                  checked={settings.enforceSoftcaps}
                  onCheckedChange={(checked) => setSettings({ ...settings, enforceSoftcaps: checked as boolean })}
                />
                <Label htmlFor="enforceSoftcaps" className="text-sm">Enforce Soft Caps by Level</Label>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Balanced spreads CP before spiking; Specialist prioritizes class axis; Hybrid blends both.
              </p>
            </Card>

            {/* Rookie Profiles */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Rookie Profile (Level 1 Only)</h3>
              <Select
                value={settings.rookieProfile}
                onValueChange={(value) => setSettings({ ...settings, rookieProfile: value as any })}
                disabled={settings.level !== 1}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="off">Off</SelectItem>
                  <SelectItem value="pure">Pure Rookie (Minima only)</SelectItem>
                  <SelectItem value="balanced">Balanced Rookie (breadth-first)</SelectItem>
                  <SelectItem value="specialist">Specialist Rookie (focused)</SelectItem>
                </SelectContent>
              </Select>
              <p className="mt-2 text-xs text-muted-foreground">
                Generate a true starting character with only the 10 bonus CPs.
              </p>
            </Card>

            {/* Options & Actions */}
            <Card className="p-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="iconicArcane"
                    checked={settings.iconicArcane}
                    onCheckedChange={(checked) => setSettings({ ...settings, iconicArcane: checked as boolean })}
                  />
                  <Label htmlFor="iconicArcane" className="text-sm">
                    Iconic Arcane Inheritance <span className="text-xs text-muted-foreground">(Costs 4 CP)</span>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="npcMode"
                    checked={settings.npcMode}
                    onCheckedChange={(checked) => setSettings({ ...settings, npcMode: checked as boolean })}
                  />
                  <Label htmlFor="npcMode" className="text-sm">
                    NPC Mode <span className="text-xs text-muted-foreground">(favor breadth / avoid d12 at low level)</span>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="showWeakness"
                    checked={settings.showWeakness}
                    onCheckedChange={(checked) => setSettings({ ...settings, showWeakness: checked as boolean })}
                  />
                  <Label htmlFor="showWeakness" className="text-sm">Show Weakness Report</Label>
                </div>
                
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button onClick={generateCharacter} className="flex-1">
                    Generate
                  </Button>
                  {character && (
                    <>
                      <Button variant="outline" onClick={exportMarkdown} size="sm">
                        <Download size={16} className="mr-1" />
                        Export MD
                      </Button>
                      <Button variant="outline" onClick={copyMarkdown} size="sm">
                        <Copy size={16} className="mr-1" />
                        Copy MD
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </CardContent>
      </Card>

      {character && (
        <Card>
          </div>
        </CardContent>
      </Card>
lassName="text-2xl">{character.race} {character.class}</CardTitle>
      {character && (aracter.displayLevel}</CardDescription>
        <Card>
          <CardHeader>enter gap-2">
                <Badge variant="secondary">Style: {settings.buildStyle}</Badge>
                {(settings.level === 1 && settings.rookieProfile !== 'off') && (
                  <Badge variant="outline">Rookie: {settings.rookieProfile}</Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Core Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">{character.pools.spirit}</div>
          </CardHeader>assName="text-sm text-muted-foreground">Spirit Points</div>
          <CardContent className="space-y-6">
            {/* Core Stats */}bg-muted rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">{character.pools.spirit}</div>
                <div className="text-sm text-muted-foreground">Spirit Points</div>
              </div>-bold text-primary">{character.pools.passive}</div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">{character.pools.active}</div>
                <div className="text-sm text-muted-foreground">Active DP</div>
              </div>-bold text-primary">{character.masteryDie}</div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">{character.pools.passive}</div>
                <div className="text-sm text-muted-foreground">Passive DP</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">{character.masteryDie}</div>
                <div className="text-sm text-muted-foreground">Mastery Die</div>
              </div>
            </div>

            <Separator />
ies.map((ability) => {
                    const die = character.abilities[ability];
              {/* Abilities */}
                      const specDie = character.specialties[ability][specialty];
                      const focusEntries = (foci as any)[specialty].map((focus: string) => {
                        const value = fnum(character.focuses[ability][focus]);
                        return value > 0 ? `${focus} +${value}` : null;
                      }).filter(Boolean);
                      
                      return `${specialty} **${specDie}**${focusEntries.length > 0 ? ` (${focusEntries.join(', ')})` : ''}`;
                    });
                    
                    return (
                      <div key={ability} className="text-sm">
                        <span className="font-semibold text-primary">{ability} {die}</span>
                        <span className="ml-2">→ {specEntries.join(', ')}.</span>
                      </div>
                    );
                    return (
                      <div key={ability} className="text-sm">
                        <span className="font-semibold text-primary">{ability} {die}</span>
                        <span className="ml-2">→ {specEntries.join(', ')}.</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Actions</h3>
                        <span className="font-mono">{value}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Weakness Report */}
            {warnings.length > 0 && (
              <>
                <Separator />
                <Alert className="border-amber-200 bg-amber-50">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertDescription>
                    <h4 className="font-semibold text-amber-900 mb-2">Weakness Report</h4>
                    <ul className="text-sm text-amber-900 list-disc list-inside space-y-1">
                      {warnings.map((warning, index) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              </>
            )}

            {cpTotals && (
              <>
                <Separator />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* CP Breakdown */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Character Points (Total Value)</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Base Customization:</span>
                        <span className="font-bold">{cpTotals.base}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>From Abilities:</span>
                        <span className="font-bold">{cpTotals.abilities}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>From Specialties:</span>
                        <span className="font-bold">{cpTotals.specialties}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>From Focuses:</span>
                        <span className="font-bold">{cpTotals.focuses}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>From Advantages:</span>
                        <span className="font-bold">{cpTotals.advantages}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-bold">
                        <span>Total CP Value:</span>
                        <span className="text-primary">{cpTotals.total}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Total CP is a diagnostic for balance; in-play advancement uses Earned CP.
                    </p>
                  </div>

                  {/* Level Advancement Table */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Level Advancement (Earned CP)</h3>
                    <div className="overflow-hidden rounded-lg border">
                      <table className="w-full text-sm">
                        <thead className="bg-muted">
                          <tr>
                            <th className="px-4 py-2 text-left">To Reach Level</th>
                            <th className="px-4 py-2 text-left">Total Earned CP Required</th>
                          </tr>
                        </thead>
                        <tbody>
                            <td className="px-4 py-2">200</td>
                            <td className="px-4 py-2 font-medium">Level 2</td>
                            <td className="px-4 py-2">100</td>
                          </tr>
                          <tr className="border-b">
                            <td className="px-4 py-2 font-medium">Level 3</td>
                            <td className="px-4 py-2">200</td>
                          </tr>
                          <tr className="border-b">
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PlayerCharacterGenerator;
  );
};

export default PlayerCharacterGenerator;