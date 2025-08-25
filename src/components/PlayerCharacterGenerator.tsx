import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
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

interface GeneratorSettings {
  race: string
  class: string
  level: number
  magicPath: string
  buildStyle: 'balanced' | 'hybrid' | 'specialist'
  rookieProfile: 'off' | 'pure' | 'balanced' | 'specialist'
  enforceSoftcaps: boolean
  iconicArcane: boolean
  npcMode: boolean
  showWeakness: boolean
}

// ======= HELPERS =======
const idx = (r: string) => dieRanks.indexOf(r);
const mv = (r: string) => r && r.startsWith('d') ? parseInt(r.slice(1), 10) : 0;
const fnum = (v: string) => v ? parseInt(String(v).replace('+', ''), 10) : 0;

function PlayerCharacterGenerator() {
  const [settings, setSettings] = useState<GeneratorSettings>({
    race: '',
    class: '',
    level: 1,
    magicPath: '',
    buildStyle: 'balanced',
    rookieProfile: 'off',
    enforceSoftcaps: true,
    iconicArcane: false,
    npcMode: false,
    showWeakness: true
  });

  const [character, setCharacter] = useState<Character | null>(null);
  const [lastGeneratedData, setLastGeneratedData] = useState<any>(null);

  // ======= CORE LOGIC =======
  function applyMinima(ch: any, minima: any) {
    for (const [k, v] of Object.entries(minima || {})) {
      if (abilities.includes(k)) {
        if (idx(v as string) > idx(ch.abilities[k])) ch.abilities[k] = v;
      } else {
        const parentA = Object.keys(specs).find(a => (specs as any)[a].includes(k));
        const parentS = Object.keys(foci).find(s => (foci as any)[s].includes(k));
        if (parentA) {
          if (idx(v as string) > idx(ch.specialties[parentA][k])) ch.specialties[parentA][k] = v;
        } else if (parentS) {
          const pa = Object.keys(specs).find(a => (specs as any)[a].includes(parentS));
          if (pa && fnum(v as string) > fnum(ch.focuses[pa][k])) ch.focuses[pa][k] = `+${fnum(v as string)}`;
        }
      }
    }
  }

  function buildWeights(klass: string, style: string) {
    const axis = (classAxes as any)[klass] || [];
    const w: any = {};
    axis.forEach((k: string, i: number) => {
      w[k] = style === 'specialist' ? 100 - i * 4 : style === 'balanced' ? 60 - i * 3 : 80 - i * 3;
    });
    if (style === 'balanced') {
      w['Competence'] = (w['Competence'] || 30) + 20;
      w['Fortitude'] = (w['Fortitude'] || 30) + 20;
      ['Endurance', 'Strength', 'Willpower', 'Agility'].forEach(k => w[k] = (w[k] || 20) + 10);
    }
    return w;
  }

  function spendCP(ch: any, cpBudget: { value: number }, style: string, level: number) {
    const weights = buildWeights(ch.class, style);
    const keys = [...new Set([...abilities, ...Object.values(specs).flat(), ...Object.values(foci).flat()])];
    let safety = 0;
    
    while (cpBudget.value > 0 && safety < 5000) {
      safety++;
      const sorted = keys.slice().sort((a, b) => (weights[b] || 10) - (weights[a] || 10));
      let upgraded = false;
      
      for (const k of sorted) {
        if (abilities.includes(k)) {
          const cur = ch.abilities[k];
          if (cur === 'd12') continue;
          const cost = stepCost[cur as keyof typeof stepCost];
          if (cpBudget.value < cost) continue;
          ch.abilities[k] = dieRanks[idx(cur) + 1];
          cpBudget.value -= cost;
          upgraded = true;
          break;
        }
        
        const pa = Object.keys(specs).find(a => (specs as any)[a].includes(k));
        if (pa) {
          const cur = ch.specialties[pa][k];
          if (cur === 'd12') continue;
          const cost = stepCost[cur as keyof typeof stepCost];
          if (cpBudget.value < cost) continue;
          ch.specialties[pa][k] = dieRanks[idx(cur) + 1];
          cpBudget.value -= cost;
          upgraded = true;
          break;
        }
        
        const ps = Object.keys(foci).find(s => (foci as any)[s].includes(k));
        if (ps) {
          const pa2 = Object.keys(specs).find(a => (specs as any)[a].includes(ps));
          if (pa2) {
            const val = fnum(ch.focuses[pa2][k]);
            if (val >= 5) continue;
            if (cpBudget.value < focusStepCost) continue;
            ch.focuses[pa2][k] = `+${val + 1}`;
            cpBudget.value -= focusStepCost;
            upgraded = true;
            break;
          }
        }
      }
      
      if (!upgraded) break;
    }
  }

  function computePools(ch: any) {
    const AD = mv(ch.abilities.Prowess) + mv(ch.specialties.Prowess.Agility) + mv(ch.specialties.Prowess.Melee);
    const PD = mv(ch.abilities.Fortitude) + mv(ch.specialties.Fortitude.Endurance) + mv(ch.specialties.Fortitude.Strength);
    const SP = mv(ch.abilities.Competence) + mv(ch.specialties.Fortitude.Willpower);
    return { active: AD, passive: PD, spirit: SP };
  }

  function cpTally(ch: any, iconic: boolean) {
    let a = 0, s = 0, f = 0;
    for (const ab of abilities) {
      a += (cumulativeDieCost as any)[ch.abilities[ab]] || 0;
      for (const sp of (specs as any)[ab]) {
        s += (cumulativeDieCost as any)[ch.specialties[ab][sp]] || 0;
      }
      for (const fx of Object.values(ch.focuses[ab])) {
        f += fnum(fx as string) * focusStepCost;
      }
    }
    const base = 10, adv = iconic ? 4 : 0;
    return { base, abilities: a, specialties: s, focuses: f, advantages: adv, total: base + a + s + f + adv };
  }

  function weaknessReport(ch: any) {
    const pools = computePools(ch);
    const flags = [];
    if (pools.spirit <= 12) flags.push('Low Spirit Points (mental/arcane pressure will hurt).');
    if (pools.active < 24) flags.push('Low Active DP (poor agility/parry).');
    if (pools.passive < 24) flags.push('Low Passive DP (fragile to heavy blows).');
    if (idx(ch.abilities.Competence) <= 1) flags.push('Low Competence (poor perception/social/planning).');
    if (idx(ch.specialties.Competence.Perception) <= 1) flags.push('Low Perception branch (traps/ambush risk).');
    if (idx(ch.specialties.Fortitude.Willpower) <= 1) flags.push('Low Willpower (charms/fear/illusions).');
    if (idx(ch.specialties.Prowess.Precision) <= 1) flags.push('Weak ranged capability.');
    return flags;
  }

  // ======= MAIN GENERATE FUNCTION =======
  function generate() {
    if (!settings.race || !settings.class || !settings.level) {
      toast.error('Please select a valid race, class, and level.');
      return;
    }

    const ch: any = {
      race: settings.race,
      class: settings.class,
      level: settings.level,
      abilities: {},
      specialties: {},
      focuses: {}
    };

    // Initialize all abilities and structures
    for (const a of abilities) {
      ch.abilities[a] = 'd4';
      ch.specialties[a] = {};
      ch.focuses[a] = {};
      for (const s of (specs as any)[a]) {
        ch.specialties[a][s] = 'd4';
        for (const fx of (foci as any)[s]) {
          ch.focuses[a][fx] = '+0';
        }
      }
    }

    // Apply race and class minima
    applyMinima(ch, (raceMinima as any)[settings.race]);
    applyMinima(ch, (classMinima as any)[settings.class]);

    // Spend CP budget
    const cpBudget = { value: 10 + (settings.level - 1) * 100 - (settings.iconicArcane ? 4 : 0) };
    if (!(settings.level === 1 && settings.rookieProfile === 'pure')) {
      spendCP(ch, cpBudget, settings.buildStyle, settings.level);
    }

    // Calculate final stats
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

    // Calculate actions
    const w = fnum(ch.focuses.Competence.Wizardry);
    const t = fnum(ch.focuses.Competence.Theurgy);
    ch.actions = {
      meleeAttack: `${ch.abilities.Prowess} + ${ch.specialties.Prowess.Melee}` + 
        (fnum(ch.focuses.Prowess.Threat) ? ` + Threat +${fnum(ch.focuses.Prowess.Threat)}` : ''),
      rangedAttack: `${ch.abilities.Prowess} + ${ch.specialties.Prowess.Precision}` + 
        (fnum(ch.focuses.Prowess['Ranged Threat']) ? ` + Ranged Threat +${fnum(ch.focuses.Prowess['Ranged Threat'])}` : ''),
      perceptionCheck: `${ch.abilities.Competence} + ${ch.specialties.Competence.Perception}` + 
        (fnum(ch.focuses.Competence.Perspicacity) ? ` + Perspicacity +${fnum(ch.focuses.Competence.Perspicacity)}` : ''),
      magicAttack: casterClasses.includes(settings.class) ?
        `${ch.abilities.Competence} + ${ch.specialties.Competence.Expertise} + ${(w ? `Wizardry +${w}` : t ? `Theurgy +${t}` : '(path focus 0)')}` : '—'
    };

    ch.pools = computePools(ch);
    setCharacter(ch);
    setLastGeneratedData({ character: ch, totals, settings: { ...settings } });
    
    toast.success('Character generated successfully!');
  }

  // Export functions
  function exportMarkdown() {
    if (!lastGeneratedData) {
      toast.error('Generate a character first!');
      return;
    }

    const { character: ch, totals } = lastGeneratedData;
    const band = levelInfo[ch.displayLevel - 1].cpBand;
    const bandStr = `${band[0]} to ${band[1]}`;
    
    let md = `# ${ch.race} ${ch.class} (Level ${ch.displayLevel})\n\n`;
    md += `### Core Stats\n`;
    md += `- **SP:** ${ch.pools.spirit} | **Active DP:** ${ch.pools.active} | **Passive DP:** ${ch.pools.passive}\n`;
    md += `- **Mastery Die:** ${ch.masteryDie}\n`;
    md += `- **Total CP Value:** ${totals.total} (Expected Range for Level ${ch.displayLevel}: ${bandStr})\n\n`;
    
    md += `### Abilities\n`;
    for (const a of abilities) {
      const sp = (specs as any)[a].map((s: string) => {
        const fl = (foci as any)[s].map((fx: string) => {
          const v = fnum(ch.focuses[a]?.[fx]);
          return v ? `${fx} +${v}` : null;
        }).filter(Boolean).join(', ');
        return `${s} **${ch.specialties[a][s]}**${fl ? ` (${fl})` : ''}`;
      }).join(', ');
      md += `**${a} ${ch.abilities[a]}** → ${sp}.\n`;
    }
    
    md += `\n### Actions\n`;
    md += `- **Melee Attack:** ${ch.actions.meleeAttack}\n`;
    md += `- **Ranged Attack:** ${ch.actions.rangedAttack}\n`;
    md += `- **Perception Check:** ${ch.actions.perceptionCheck}\n`;
    if (casterClasses.includes(ch.class)) {
      md += `- **Magic Attack:** ${ch.actions.magicAttack}\n`;
    }
    
    md += `\n### Character Points Breakdown (Total Value)\n`;
    md += `- **Base Customization:** ${totals.base}\n`;
    md += `- **From Abilities:** ${totals.abilities}\n`;
    md += `- **From Specialties:** ${totals.specialties}\n`;
    md += `- **From Focuses:** ${totals.focuses}\n`;
    md += `- **From Advantages:** ${totals.advantages}\n`;
    md += `- **Total CP Value:** ${totals.total}\n`;
    
    md += `\n_Note: Total CP Value reflects the character's build balance. Advancement in-game is tracked separately via Earned CP, starting from 0._\n`;
    
    md += `\n### Level Advancement (Earned CP)\n`;
    md += `| To Reach Level | Total Earned CP Required |\n`;
    md += `| :------------- | :----------------------- |\n`;
    md += `| Level 2        | 100                      |\n`;
    md += `| Level 3        | 200                      |\n`;
    md += `| Level 4        | 300                      |\n`;
    md += `| Level 5        | 500                      |\n`;

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${ch.race}_${ch.class}_L${ch.displayLevel}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function copyMarkdown() {
    if (!lastGeneratedData) {
      toast.error('Generate a character first!');
      return;
    }

    const { character: ch, totals } = lastGeneratedData;
    const band = levelInfo[ch.displayLevel - 1].cpBand;
    const bandStr = `${band[0]} to ${band[1]}`;
    
    let md = `# ${ch.race} ${ch.class} (Level ${ch.displayLevel})\n\n`;
    md += `### Core Stats\n`;
    md += `- **SP:** ${ch.pools.spirit} | **Active DP:** ${ch.pools.active} | **Passive DP:** ${ch.pools.passive}\n`;
    md += `- **Mastery Die:** ${ch.masteryDie}\n`;
    md += `- **Total CP Value:** ${totals.total} (Expected Range for Level ${ch.displayLevel}: ${bandStr})\n\n`;
    
    md += `### Abilities\n`;
    for (const a of abilities) {
      const sp = (specs as any)[a].map((s: string) => {
        const fl = (foci as any)[s].map((fx: string) => {
          const v = fnum(ch.focuses[a]?.[fx]);
          return v ? `${fx} +${v}` : null;
        }).filter(Boolean).join(', ');
        return `${s} **${ch.specialties[a][s]}**${fl ? ` (${fl})` : ''}`;
      }).join(', ');
      md += `**${a} ${ch.abilities[a]}** → ${sp}.\n`;
    }
    
    md += `\n### Actions\n`;
    md += `- **Melee Attack:** ${ch.actions.meleeAttack}\n`;
    md += `- **Ranged Attack:** ${ch.actions.rangedAttack}\n`;
    md += `- **Perception Check:** ${ch.actions.perceptionCheck}\n`;
    if (casterClasses.includes(ch.class)) {
      md += `- **Magic Attack:** ${ch.actions.magicAttack}\n`;
    }

    navigator.clipboard.writeText(md).then(() => {
      toast.success('Markdown copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy markdown.');
    });
  }

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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Build Philosophy */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Build Philosophy</h3>
              <RadioGroup
                value={settings.buildStyle}
                onValueChange={(value) => setSettings({ ...settings, buildStyle: value as any })}
                className="flex flex-wrap gap-2"
              >
                <div className="flex items-center space-x-2 bg-background border rounded-full px-3 py-2">
                  <RadioGroupItem value="balanced" id="balanced" />
                  <Label htmlFor="balanced" className="text-sm font-medium">Balanced</Label>
                </div>
                <div className="flex items-center space-x-2 bg-background border rounded-full px-3 py-2">
                  <RadioGroupItem value="hybrid" id="hybrid" />
                  <Label htmlFor="hybrid" className="text-sm font-medium">Hybrid</Label>
                </div>
                <div className="flex items-center space-x-2 bg-background border rounded-full px-3 py-2">
                  <RadioGroupItem value="specialist" id="specialist" />
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
                  <Button onClick={generate} className="rounded-full">Generate</Button>
                  <Button onClick={exportMarkdown} variant="outline" className="rounded-full">
                    <Download className="w-4 h-4 mr-2" />
                    Export MD
                  </Button>
                  <Button onClick={copyMarkdown} variant="outline" className="rounded-full">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy MD
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Character Output */}
      {character && lastGeneratedData && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-2xl font-bold">{character.race} {character.class} — Level {character.displayLevel}</h2>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Style: {lastGeneratedData.settings.buildStyle}</Badge>
                  {lastGeneratedData.settings.level === 1 && lastGeneratedData.settings.rookieProfile !== 'off' && (
                    <Badge variant="outline">Rookie: {lastGeneratedData.settings.rookieProfile}</Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                <div className="bg-muted rounded-xl p-3">
                  <div className="text-xs text-muted-foreground">Spirit Points</div>
                  <div className="text-xl font-bold">{character.pools.spirit}</div>
                </div>
                <div className="bg-muted rounded-xl p-3">
                  <div className="text-xs text-muted-foreground">Active DP</div>
                  <div className="text-xl font-bold">{character.pools.active}</div>
                </div>
                <div className="bg-muted rounded-xl p-3">
                  <div className="text-xs text-muted-foreground">Passive DP</div>
                  <div className="text-xl font-bold">{character.pools.passive}</div>
                </div>
                <div className="bg-muted rounded-xl p-3">
                  <div className="text-xs text-muted-foreground">Mastery Die</div>
                  <div className="text-xl font-bold">{character.masteryDie}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Abilities</h3>
                  <div className="text-sm leading-relaxed space-y-2">
                    {abilities.map(ab => {
                      const sp = (specs as any)[ab].map((s: string) => {
                        const fxList = (foci as any)[s].map((fx: string) => {
                          const v = fnum(character.focuses[ab][fx]);
                          return v ? `${fx} +${v}` : null;
                        }).filter(Boolean).join(', ');
                        return `${s} <strong>${character.specialties[ab][s]}</strong>${fxList ? ` (${fxList})` : ''}`;
                      }).join(', ');
                      return (
                        <div key={ab} className="mb-2">
                          <span className="font-semibold">{ab} <strong>{character.abilities[ab]}</strong></span> → {sp}.
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Actions</h3>
                  <ul className="text-sm list-disc list-inside space-y-1">
                    <li><strong>Melee Attack:</strong> {character.actions.meleeAttack}</li>
                    <li><strong>Ranged Attack:</strong> {character.actions.rangedAttack}</li>
                    <li><strong>Perception Check:</strong> {character.actions.perceptionCheck}</li>
                    {casterClasses.includes(character.class) && (
                      <li><strong>Magic Attack:</strong> {character.actions.magicAttack}</li>
                    )}
                  </ul>
                </div>

                {settings.showWeakness && (
                  <div className="lg:col-span-2">
                    {(() => {
                      const warnings = weaknessReport(character);
                      return warnings.length > 0 ? (
                        <Alert className="border-destructive/50 text-destructive dark:border-destructive">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Weakness Report:</strong>
                            <ul className="mt-1 list-disc list-inside text-sm">
                              {warnings.map((warning, i) => (
                                <li key={i}>{warning}</li>
                              ))}
                            </ul>
                          </AlertDescription>
                        </Alert>
                      ) : null;
                    })()}
                  </div>
                )}

                <div>
                  <h3 className="font-semibold mb-2">Character Points (Total Value)</h3>
                  <ul className="text-sm list-disc list-inside space-y-1">
                    <li><strong>Base Customization:</strong> {lastGeneratedData.totals.base}</li>
                    <li><strong>From Abilities:</strong> {lastGeneratedData.totals.abilities}</li>
                    <li><strong>From Specialties:</strong> {lastGeneratedData.totals.specialties}</li>
                    <li><strong>From Focuses:</strong> {lastGeneratedData.totals.focuses}</li>
                    <li><strong>From Advantages:</strong> {lastGeneratedData.totals.advantages}</li>
                    <li><strong>Total CP Value:</strong> {lastGeneratedData.totals.total} 
                      <span className="text-muted-foreground text-xs ml-1">
                        (Lvl {character.displayLevel} Range: {levelInfo[character.displayLevel - 1].cpBand[0]} to {levelInfo[character.displayLevel - 1].cpBand[1]})
                      </span>
                    </li>
                  </ul>
                  <p className="text-xs text-muted-foreground mt-2 italic">
                    Total CP is a diagnostic for balance; in-play advancement uses Earned CP.
                  </p>
                </div>

                <div className="lg:col-span-2">
                  <h3 className="text-lg font-semibold mb-2">Level Advancement (Earned CP)</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="px-4 py-2 text-left">To Reach Level</th>
                          <th className="px-4 py-2 text-left">Total Earned CP Required</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="px-4 py-2 font-medium">Level 2</td>
                          <td className="px-4 py-2">100</td>
                        </tr>
                        <tr className="border-b">
                          <td className="px-4 py-2 font-medium">Level 3</td>
                          <td className="px-4 py-2">200</td>
                        </tr>
                        <tr className="border-b">
                          <td className="px-4 py-2 font-medium">Level 4</td>
                          <td className="px-4 py-2">300</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 font-medium">Level 5</td>
                          <td className="px-4 py-2">500</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default PlayerCharacterGenerator