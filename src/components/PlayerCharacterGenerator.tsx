import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Download, Copy } from "@phosphor-icons/react"
import { toast } from "sonner"

interface CharacterData {
  race: string
  class: string
  level: number
  abilities: Record<string, string>
  specialties: Record<string, Record<string, string>>
  focuses: Record<string, Record<string, string>>
  masteryDie: string
  advantages: string[]
  flaws: string[]
  classFeats: string[]
  equipment: string[]
  actions: Record<string, string>
  pools: { active: number; passive: number; spirit: number }
}

interface SpentTotals {
  abilities: number
  specialties: number
  focuses: number
  advantages: number
  total: number
}

// Game data constants
const dieRanks = ['d4', 'd6', 'd8', 'd10', 'd12']
const abilities = ['Competence', 'Prowess', 'Fortitude']
const specs = {
  Competence: ['Adroitness', 'Expertise', 'Perception'],
  Prowess: ['Agility', 'Melee', 'Precision'],
  Fortitude: ['Endurance', 'Strength', 'Willpower']
}
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
}

const races = ['Human', 'Elf', 'Dwarf', 'Gnome', 'Half-Elf', 'Half-Orc', 'Halfling', 'Drakkin']
const classes = ['Adept', 'Assassin', 'Barbarian', 'Mage', 'Mystic', 'Rogue', 'Theurgist', 'Warrior']
const levels = [1, 2, 3, 4, 5]
const casterClasses = ['Adept', 'Mage', 'Mystic', 'Theurgist']

const magicPathsByClass = {
  Adept: ['Thaumaturgy', 'Elementalism', 'Sorcery'],
  Mage: ['Thaumaturgy', 'Elementalism', 'Sorcery'],
  Mystic: ['Mysticism'],
  Theurgist: ['Druidry', 'Hieraticism']
}

const levelInfo = [
  { level: 1, masteryDie: 'd4' },
  { level: 2, masteryDie: 'd6' },
  { level: 3, masteryDie: 'd8' },
  { level: 4, masteryDie: 'd10' },
  { level: 5, masteryDie: 'd12' }
]

const raceMinima = {
  Drakkin: { Competence: 'd6', Prowess: 'd6', Fortitude: 'd6', Endurance: 'd6', Strength: 'd4' },
  Dwarf: { Fortitude: 'd8', Endurance: 'd4', Prowess: 'd6', Melee: 'd6' },
  Elf: { Competence: 'd6', Expertise: 'd6', Wizardry: '+1', Prowess: 'd4', Agility: 'd4', Reaction: '+1' },
  Gnome: { Competence: 'd4', Adroitness: 'd6', Expertise: 'd6', Perception: 'd4', Perspicacity: '+1' },
  'Half-Elf': { Competence: 'd6', Prowess: 'd6', Agility: 'd4', Fortitude: 'd4', Endurance: 'd4', Willpower: 'd4' },
  'Half-Orc': { Fortitude: 'd6', Strength: 'd8', Ferocity: '+1', Endurance: 'd6' },
  Halfling: { Competence: 'd6', Adroitness: 'd6', Cleverness: '+1', Fortitude: 'd6', Willpower: 'd4', Courage: '+1' },
  Human: { Competence: 'd6', Prowess: 'd6', Melee: 'd4', Threat: '+1', Fortitude: 'd4', Willpower: 'd6' }
}

const classMinima = {
  Adept: { Competence: 'd6', Adroitness: 'd4', Cleverness: '+1', Expertise: 'd6', Wizardry: '+1', Perception: 'd4', Perspicacity: '+1' },
  Assassin: { Competence: 'd4', Adroitness: 'd6', Perception: 'd4', Prowess: 'd4', Agility: 'd4', Endurance: 'd6', Melee: 'd4', Finesse: '+1' },
  Barbarian: { Prowess: 'd6', Melee: 'd8', Fortitude: 'd4', Strength: 'd4', Ferocity: '+1' },
  Mage: { Competence: 'd6', Expertise: 'd8', Wizardry: '+1', Fortitude: 'd4', Willpower: 'd6', Resistance: '+1' },
  Mystic: { Competence: 'd6', Expertise: 'd6', Wizardry: '+1', Prowess: 'd4', Melee: 'd4', Fortitude: 'd4', Endurance: 'd6', Resilience: '+1', Vitality: '+2' },
  Rogue: { Competence: 'd4', Adroitness: 'd4', Skulduggery: '+1', Perception: 'd4', Prowess: 'd6', Agility: 'd8' },
  Theurgist: { Competence: 'd8', Expertise: 'd4', Theurgy: '+1', Fortitude: 'd6', Willpower: 'd4' },
  Warrior: { Prowess: 'd8', Melee: 'd6', Threat: '+1', Fortitude: 'd6' }
}

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
}

const classFeats = {
  Adept: ['Guile', 'Lore', 'Ritual Magic', 'Quick-witted'],
  Assassin: ['Death Strike', 'Lethal Exploit', 'Ranged Ambush', 'Shadow Walk'],
  Barbarian: ['Berserk', 'Brawl', 'Feat of Strength', 'Grapple'],
  Mage: ['Arcane Finesse', 'Dweomers', 'Intangible Threat', 'Path Mastery'],
  Mystic: ['Iron Mind', 'Path Mastery', 'Premonition', 'Psychic Powers'],
  Rogue: ['Backstab', 'Evasion', 'Roguish Charm', 'Stealth'],
  Theurgist: ['Divine Healing', 'Path Mastery', 'Spiritual Smite', 'Supernatural Intervention'],
  Warrior: ['Battle Savvy', 'Maneuvers', 'Stunning Reversal', 'Sunder Foe']
}

const raceFlaws = {
  Gnome: ['Restriction: small weapons only'],
  Halfling: ['Restriction: small weapons only'],
  'Half-Orc': ['Ugliness']
}

const startingEquipment = {
  common: ['Set of ordinary clothes', 'Purse of 5 gold coins', 'Backpack', 'Small dagger', "Week's rations", 'Waterskin', 'Tinderbox', "50' rope", 'Iron spikes', 'Small hammer', "6' traveling staff or 10' pole", 'Hooded lantern and 2 oil flasks or d4+1 torches'],
  Adept: ['Book of knowledge (area of expertise)'],
  Assassin: ['Assassin hood, jacket, cape, robe, or tunic'],
  Barbarian: ['Garments of woven wool or linen', 'Tunic', 'Overcoat or cloak'],
  Mage: ['Spellbook', 'Staff or focus item'],
  Mystic: ['Robes or shawl', 'Cloak', 'Armor up to leather'],
  Rogue: ["Set of thieves' tools", 'Light armor (up to leather)', 'One weapon'],
  Theurgist: ['Prayer book', 'Holy relic or symbol', 'Focus item', 'Armor up to chain'],
  Warrior: ['One weapon of choice', 'Armor up to chain', 'Small to large shield', 'Steed']
}

const stepCost = { 'd4': 6, 'd6': 8, 'd8': 10, 'd10': 12, 'd12': Infinity }
const focusStepCost = 4

// Class upgrade order for spending CP
const classUpgradeOrder = {
  Warrior: ['Prowess', 'Melee', 'Strength', 'Fortitude', 'Precision', 'Endurance', 'Threat', 'Might', 'Ranged Threat'],
  Barbarian: ['Prowess', 'Melee', 'Strength', 'Fortitude', 'Endurance', 'Ferocity', 'Might', 'Vitality'],
  Rogue: ['Prowess', 'Agility', 'Competence', 'Adroitness', 'Perception', 'Skulduggery', 'Cleverness', 'Speed'],
  Assassin: ['Prowess', 'Agility', 'Melee', 'Competence', 'Adroitness', 'Finesse', 'Speed', 'Perception'],
  Mage: ['Competence', 'Expertise', 'Wizardry', 'Fortitude', 'Willpower', 'Resistance', 'Perception'],
  Mystic: ['Fortitude', 'Willpower', 'Competence', 'Expertise', 'Endurance', 'Prowess', 'Melee', 'Resilience', 'Vitality'],
  Adept: ['Competence', 'Expertise', 'Adroitness', 'Perception', 'Cleverness', 'Wizardry', 'Perspicacity'],
  Theurgist: ['Competence', 'Expertise', 'Theurgy', 'Fortitude', 'Willpower', 'Endurance', 'Courage']
}

// Helper functions
const idx = (r: string) => dieRanks.indexOf(r)
const mv = (r: string) => r && r.startsWith('d') ? parseInt(r.slice(1), 10) : 0
const fnum = (v: string) => v ? parseInt(String(v).replace('+', ''), 10) : 0

function PlayerCharacterGenerator() {
  const [race, setRace] = useState('')
  const [characterClass, setCharacterClass] = useState('')
  const [level, setLevel] = useState<number | null>(null)
  const [magicPath, setMagicPath] = useState('')
  const [iconicArcane, setIconicArcane] = useState(false)
  const [character, setCharacter] = useState<CharacterData | null>(null)
  const [spentTotals, setSpentTotals] = useState<SpentTotals | null>(null)
  const [baseCharacter, setBaseCharacter] = useState<CharacterData | null>(null)

  const showMagicPath = magicPathsByClass[characterClass as keyof typeof magicPathsByClass] && characterClass !== 'Adept' && characterClass !== 'Mystic'

  function getAdvantages(race: string, klass: string): string[] {
    const raceAdv = allAdvantages[race as keyof typeof allAdvantages] || []
    const classAdv = allAdvantages[klass as keyof typeof allAdvantages] || []
    return [...new Set([...raceAdv, ...classAdv])]
  }

  function getEquipment(klass: string): string[] {
    return [...startingEquipment.common, ...(startingEquipment[klass as keyof typeof startingEquipment] || [])]
  }

  function applyMinima(ch: CharacterData, minima: Record<string, any>) {
    for (const [k, v] of Object.entries(minima || {})) {
      if (abilities.includes(k)) {
        if (idx(v) > idx(ch.abilities[k])) ch.abilities[k] = v
      } else {
        const parentA = Object.keys(specs).find(a => specs[a as keyof typeof specs].includes(k))
        const parentS = Object.keys(foci).find(s => foci[s as keyof typeof foci].includes(k))
        if (parentA) {
          if (idx(v) > idx(ch.specialties[parentA][k])) ch.specialties[parentA][k] = v
        } else if (parentS) {
          const pa = Object.keys(specs).find(a => specs[a as keyof typeof specs].includes(parentS))
          if (pa && fnum(v) > fnum(ch.focuses[pa][k])) ch.focuses[pa][k] = `+${fnum(v)}`
        }
      }
    }
  }

  function spendCP(ch: CharacterData, cpBudget: { value: number }) {
    const upgradeOrder = classUpgradeOrder[ch.class as keyof typeof classUpgradeOrder] || []
    let safety = 0
    
    while (cpBudget.value > 0 && safety < 1000) {
      safety++
      let upgraded = false
      
      for (const key of upgradeOrder) {
        if (cpBudget.value <= 0) break
        
        // Try to upgrade die ranks first
        if (abilities.includes(key) || Object.values(specs).flat().includes(key)) {
          const isAbility = abilities.includes(key)
          const parentAbility = isAbility ? key : Object.keys(specs).find(a => specs[a as keyof typeof specs].includes(key))
          const currentRank = isAbility ? ch.abilities[key] : ch.specialties[parentAbility!][key]
          
          if (currentRank !== 'd12') {
            const cost = stepCost[currentRank as keyof typeof stepCost]
            if (cpBudget.value >= cost) {
              const newRank = dieRanks[idx(currentRank) + 1]
              if (isAbility) {
                ch.abilities[key] = newRank
              } else {
                ch.specialties[parentAbility!][key] = newRank
              }
              cpBudget.value -= cost
              upgraded = true
              break
            }
          }
        }
        // Then try to upgrade focuses
        else if (Object.values(foci).flat().includes(key)) {
          const parentSpecialty = Object.keys(foci).find(s => foci[s as keyof typeof foci].includes(key))
          const parentAbility = Object.keys(specs).find(a => specs[a as keyof typeof specs].includes(parentSpecialty!))
          const currentFocus = fnum(ch.focuses[parentAbility!][key])
          
          if (currentFocus < 5 && cpBudget.value >= focusStepCost) {
            ch.focuses[parentAbility!][key] = `+${currentFocus + 1}`
            cpBudget.value -= focusStepCost
            upgraded = true
            break
          }
        }
      }
      if (!upgraded) break
    }
  }

  function computePools(ch: CharacterData) {
    const AD = mv(ch.abilities.Prowess) + mv(ch.specialties.Prowess.Agility) + mv(ch.specialties.Prowess.Melee)
    const PD = mv(ch.abilities.Fortitude) + mv(ch.specialties.Fortitude.Endurance) + mv(ch.specialties.Fortitude.Strength)
    const SP = mv(ch.abilities.Competence) + mv(ch.specialties.Fortitude.Willpower)
    return { active: AD, passive: PD, spirit: SP }
  }

  function calculateCPSpent(finalChar: CharacterData, baseChar: CharacterData, iconic: boolean): SpentTotals {
    const spent = { abilities: 0, specialties: 0, focuses: 0, advantages: 0, total: 0 }
    spent.advantages = iconic ? 4 : 0

    for (const ab of abilities) {
      // Calculate cost for ability upgrades
      const baseRankIndex = idx(baseChar.abilities[ab])
      const finalRankIndex = idx(finalChar.abilities[ab])
      for (let i = baseRankIndex; i < finalRankIndex; i++) {
        spent.abilities += stepCost[dieRanks[i] as keyof typeof stepCost]
      }

      // Calculate cost for specialty upgrades
      for (const sp of specs[ab as keyof typeof specs]) {
        const baseSpecIndex = idx(baseChar.specialties[ab][sp])
        const finalSpecIndex = idx(finalChar.specialties[ab][sp])
        for (let i = baseSpecIndex; i < finalSpecIndex; i++) {
          spent.specialties += stepCost[dieRanks[i] as keyof typeof stepCost]
        }
      }

      // Calculate cost for focus upgrades
      for (const fx of Object.values(foci).flat()) {
        if (finalChar.focuses[ab] && finalChar.focuses[ab][fx] !== undefined) {
          const baseFocusValue = fnum(baseChar.focuses[ab][fx])
          const finalFocusValue = fnum(finalChar.focuses[ab][fx])
          spent.focuses += (finalFocusValue - baseFocusValue) * focusStepCost
        }
      }
    }

    spent.total = spent.abilities + spent.specialties + spent.focuses + spent.advantages
    return spent
  }

  function generateCharacter() {
    if (!race || !characterClass || !level) {
      toast.error('Please select a valid race, class, and level.')
      return
    }

    // Initialize character
    const ch: CharacterData = {
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
    }

    // Initialize all abilities, specialties, and focuses to d4/+0
    for (const a of abilities) {
      ch.abilities[a] = 'd4'
      ch.specialties[a] = {}
      ch.focuses[a] = {}
      for (const s of specs[a as keyof typeof specs]) {
        ch.specialties[a][s] = 'd4'
        for (const fx of foci[s as keyof typeof foci]) {
          ch.focuses[a][fx] = '+0'
        }
      }
    }

    // Create base character with only free minimums
    const baseChar = JSON.parse(JSON.stringify(ch))
    applyMinima(baseChar, raceMinima[race as keyof typeof raceMinima])
    applyMinima(baseChar, classMinima[characterClass as keyof typeof classMinima])
    
    // Copy base to final character to start spending
    Object.assign(ch, JSON.parse(JSON.stringify(baseChar)))

    const cpBudget = { value: 10 + (level - 1) * 100 }
    if (iconicArcane) {
      if (cpBudget.value >= 4) {
        cpBudget.value -= 4
      } else {
        toast.error('Not enough CP for Iconic Arcane Inheritance.')
        return
      }
    }

    spendCP(ch, cpBudget)

    ch.masteryDie = levelInfo[level - 1].masteryDie
    ch.advantages = getAdvantages(race, characterClass)
    ch.flaws = raceFlaws[race as keyof typeof raceFlaws] || []
    ch.classFeats = classFeats[characterClass as keyof typeof classFeats] || []
    ch.equipment = getEquipment(characterClass)

    // Setup actions
    const w = fnum(ch.focuses.Competence.Wizardry)
    const t = fnum(ch.focuses.Competence.Theurgy)
    
    ch.actions = {
      meleeAttack: `${ch.abilities.Prowess} + ${ch.specialties.Prowess.Melee}` + (fnum(ch.focuses.Prowess.Threat) ? ` + Threat +${fnum(ch.focuses.Prowess.Threat)}` : ''),
      rangedAttack: `${ch.abilities.Prowess} + ${ch.specialties.Prowess.Precision}` + (fnum(ch.focuses.Prowess['Ranged Threat']) ? ` + Ranged Threat +${fnum(ch.focuses.Prowess['Ranged Threat'])}` : ''),
      perceptionCheck: `${ch.abilities.Competence} + ${ch.specialties.Competence.Perception}` + (fnum(ch.focuses.Competence.Perspicacity) ? ` + Perspicacity +${fnum(ch.focuses.Competence.Perspicacity)}` : ''),
      magicAttack: casterClasses.includes(characterClass) ? `${ch.abilities.Competence} + ${ch.specialties.Competence.Expertise} + ${(w ? `Wizardry +${w}` : t ? `Theurgy +${t}` : '(path focus 0)')}` : '—'
    }

    ch.pools = computePools(ch)
    const spent = calculateCPSpent(ch, baseChar, iconicArcane)
    
    setCharacter(ch)
    setSpentTotals(spent)
    setBaseCharacter(baseChar)
    toast.success('Character generated successfully!')
  }

  function getFullMarkdown(): string {
    if (!character || !spentTotals) return ''

    let md = `# ${character.race} ${character.class} (Level ${character.level})\n\n`
    md += `### Core Stats\n`
    md += `- **SP:** ${character.pools.spirit} | **Active DP:** ${character.pools.active} | **Passive DP:** ${character.pools.passive}\n`
    md += `- **Mastery Die:** ${character.masteryDie}\n\n`
    md += `### Abilities\n`

    for (const a of abilities) {
      const sp = specs[a as keyof typeof specs].map(s => {
        const fl = foci[s as keyof typeof foci].map(fx => {
          const v = fnum(character.focuses[a][fx])
          return v ? `${fx} +${v}` : null
        }).filter(Boolean).join(', ')
        return `${s} **${character.specialties[a][s]}**${fl ? ` (${fl})` : ''}`
      }).join(', ')
      md += `**${a} ${character.abilities[a]}** → ${sp}.\n`
    }

    md += `\n### Actions\n`
    md += `- **Melee Attack:** ${character.actions.meleeAttack}\n`
    md += `- **Ranged Attack:** ${character.actions.rangedAttack}\n`
    md += `- **Perception Check:** ${character.actions.perceptionCheck}\n`
    if (casterClasses.includes(character.class)) {
      md += `- **Magic Attack:** ${character.actions.magicAttack}\n`
    }

    md += `\n### Advantages & Flaws\n`
    md += `**Advantages:**\n${character.advantages.map(a => `- ${a}`).join('\n')}\n\n`
    md += `**Flaws:**\n${character.flaws.length ? character.flaws.map(f => `- ${f}`).join('\n') : '- None'}\n\n`
    
    md += `### Class Feats\n${character.classFeats.map(f => `- ${f}`).join('\n')}\n\n`
    md += `### Equipment\n${character.equipment.map(e => `- ${e}`).join('\n')}\n\n`

    md += `### Character Points Spent\n`
    md += `- **Spent on Abilities:** ${spentTotals.abilities}\n`
    md += `- **Spent on Specialties:** ${spentTotals.specialties}\n`
    md += `- **Spent on Focuses:** ${spentTotals.focuses}\n`
    md += `- **Spent on Advantages:** ${spentTotals.advantages}\n`
    md += `- **Total CP Spent:** ${spentTotals.total}\n`
    md += `\n_Note: This shows CPs spent from the customization budget. Free racial/class minimums cost 0 CP._\n`

    md += `\n### Level Advancement (Earned CP)\n`
    md += `| To Reach Level | Total Earned CP Required |\n`
    md += `| :------------- | :----------------------- |\n`
    md += `| Level 2        | 100                      |\n`
    md += `| Level 3        | 200                      |\n`
    md += `| Level 4        | 300                      |\n`
    md += `| Level 5        | 500                      |\n`

    return md
  }

  function exportMarkdown() {
    const md = getFullMarkdown()
    if (!md) {
      toast.error('Generate a character first!')
      return
    }

    const blob = new Blob([md], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${character?.race}_${character?.class}_L${character?.level}.md`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    toast.success('Markdown file downloaded!')
  }

  async function copyMarkdown() {
    const md = getFullMarkdown()
    if (!md) {
      toast.error('Generate a character first!')
      return
    }

    try {
      await navigator.clipboard.writeText(md)
      toast.success('Markdown copied to clipboard!')
    } catch (err) {
      toast.error('Failed to copy markdown.')
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Player Character Generator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Race</label>
              <Select value={race} onValueChange={setRace}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Race" />
                </SelectTrigger>
                <SelectContent>
                  {races.map(r => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Class</label>
              <Select value={characterClass} onValueChange={setCharacterClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Level</label>
              <Select value={level?.toString() || ''} onValueChange={(value) => setLevel(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Level" />
                </SelectTrigger>
                <SelectContent>
                  {levels.map(l => (
                    <SelectItem key={l} value={l.toString()}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {showMagicPath && (
              <div>
                <label className="block text-sm font-medium mb-2">Magic Path</label>
                <Select value={magicPath} onValueChange={setMagicPath}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Path" />
                  </SelectTrigger>
                  <SelectContent>
                    {magicPathsByClass[characterClass as keyof typeof magicPathsByClass]?.map(p => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="iconic-arcane" 
                checked={iconicArcane} 
                onCheckedChange={setIconicArcane}
              />
              <label htmlFor="iconic-arcane" className="text-sm">
                Iconic Arcane Inheritance (Costs 4 CP)
              </label>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={generateCharacter}>
                Generate Character
              </Button>
              <Button variant="outline" onClick={exportMarkdown}>
                <Download className="w-4 h-4 mr-2" />
                Export Markdown
              </Button>
              <Button variant="outline" onClick={copyMarkdown}>
                <Copy className="w-4 h-4 mr-2" />
                Copy Markdown
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {character && spentTotals && (
        <Card>
          <CardHeader>
            <CardTitle>{character.race} {character.class} — Level {character.level}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-muted rounded-lg p-3 text-center">
                <div className="text-xs text-muted-foreground">Spirit Points</div>
                <div className="text-xl font-bold">{character.pools.spirit}</div>
              </div>
              <div className="bg-muted rounded-lg p-3 text-center">
                <div className="text-xs text-muted-foreground">Active DP</div>
                <div className="text-xl font-bold">{character.pools.active}</div>
              </div>
              <div className="bg-muted rounded-lg p-3 text-center">
                <div className="text-xs text-muted-foreground">Passive DP</div>
                <div className="text-xl font-bold">{character.pools.passive}</div>
              </div>
              <div className="bg-muted rounded-lg p-3 text-center">
                <div className="text-xs text-muted-foreground">Mastery Die</div>
                <div className="text-xl font-bold">{character.masteryDie}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Abilities</h3>
                <div className="text-sm space-y-1">
                  {abilities.map(ab => {
                    const specialtyList = specs[ab as keyof typeof specs].map(s => {
                      const focusList = foci[s as keyof typeof foci].map(fx => {
                        const v = fnum(character.focuses[ab][fx])
                        return v ? `${fx} +${v}` : null
                      }).filter(Boolean).join(', ')
                      return `${s} **${character.specialties[ab][s]}**${focusList ? ` (${focusList})` : ''}`
                    }).join(', ')
                    
                    return (
                      <div key={ab} className="mb-2">
                        <span className="font-semibold">{ab} <strong>{character.abilities[ab]}</strong></span> → {specialtyList}.
                      </div>
                    )
                  })}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Actions</h3>
                <ul className="text-sm space-y-1">
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
                <div className="text-sm">
                  <p className="font-medium">Advantages:</p>
                  <ul className="list-disc list-inside ml-4 mb-2">
                    {character.advantages.map((a, i) => <li key={i}>{a}</li>)}
                  </ul>
                  <p className="font-medium">Flaws:</p>
                  <ul className="list-disc list-inside ml-4">
                    {character.flaws.length ? character.flaws.map((f, i) => <li key={i}>{f}</li>) : <li>None</li>}
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Class Feats</h3>
                <ul className="text-sm list-disc list-inside">
                  {character.classFeats.map((f, i) => <li key={i}>{f}</li>)}
                </ul>
              </div>

              <div className="lg:col-span-2">
                <h3 className="font-semibold mb-2">Equipment</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                  {character.equipment.map((e, i) => (
                    <div key={i} className="text-sm">• {e}</div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Character Points Spent</h3>
                <ul className="text-sm space-y-1">
                  <li><strong>Spent on Abilities:</strong> {spentTotals.abilities}</li>
                  <li><strong>Spent on Specialties:</strong> {spentTotals.specialties}</li>
                  <li><strong>Spent on Focuses:</strong> {spentTotals.focuses}</li>
                  <li><strong>Spent on Advantages:</strong> {spentTotals.advantages}</li>
                  <li><strong>Total CP Spent:</strong> {spentTotals.total}</li>
                </ul>
                <Alert className="mt-2">
                  <AlertDescription className="text-xs">
                    This shows CPs spent from the customization budget. Free racial/class minimums cost 0 CP.
                  </AlertDescription>
                </Alert>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Level Advancement (Earned CP)</h3>
                <div className="text-sm border rounded-md">
                  <div className="bg-muted px-3 py-2 font-medium border-b">Required Earned CP</div>
                  <div className="divide-y">
                    <div className="px-3 py-1 flex justify-between"><span>Level 2</span><span>100</span></div>
                    <div className="px-3 py-1 flex justify-between"><span>Level 3</span><span>200</span></div>
                    <div className="px-3 py-1 flex justify-between"><span>Level 4</span><span>300</span></div>
                    <div className="px-3 py-1 flex justify-between"><span>Level 5</span><span>500</span></div>
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