import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Download, Copy } from "@phosphor-icons/react"
import { toast } from "sonner"

// Data definitions
const dieRanks = ['d4', 'd6', 'd8', 'd10', 'd12']
const abilities = ['Competence', 'Prowess', 'Fortitude']
const specialties = {
  Competence: ['Adroitness', 'Expertise', 'Perception'],
  Prowess: ['Agility', 'Melee', 'Precision'],
  Fortitude: ['Endurance', 'Strength', 'Willpower']
}
const focuses = {
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

// Racial and class minimums
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
  common: [
    'Set of ordinary clothes',
    'Purse of 5 gold coins',
    'Backpack',
    'Small dagger',
    'Week\'s rations',
    'Waterskin',
    'Tinderbox',
    '50\' rope',
    'Iron spikes',
    'Small hammer',
    '6\' traveling staff or 10\' pole',
    'Hooded lantern and 2 oil flasks or d4+1 torches'
  ],
  Adept: ['Book of knowledge (area of expertise)'],
  Assassin: ['Assassin hood, jacket, cape, robe, or tunic'],
  Barbarian: ['Garments of woven wool or linen', 'Tunic', 'Overcoat or cloak'],
  Mage: ['Spellbook', 'Staff or focus item'],
  Mystic: ['Robes or shawl', 'Cloak', 'Armor up to leather'],
  Rogue: ['Set of thieves\' tools', 'Light armor (up to leather)', 'One weapon'],
  Theurgist: ['Prayer book', 'Holy relic or symbol', 'Focus item', 'Armor up to chain'],
  Warrior: ['One weapon of choice', 'Armor up to chain', 'Small to large shield', 'Steed']
}

// Spells by path
const spellsByPath = {
  Universal: {
    Common: ['Eldritch Bolt', 'Dispel Effect', 'Identify Magic', 'Eldritch Defense']
  },
  Elementalism: {
    Common: ['Ball of Light', 'Fire Strike', 'Water Breathing', 'Breeze', 'Heat', 'Freeze'],
    Uncommon: ['Arcane Maelstrom', 'Fire Whip', 'Stone Shape', 'Water Elemental', 'Windwalk']
  },
  Sorcery: {
    Common: ['Arcane Lock', 'Minor Illusion', 'Shadow Step', 'Teleport Object'],
    Uncommon: ['Enfeeblement', 'Illusory Disguise', 'Summon Monster', 'Phantom Blade']
  },
  Thaumaturgy: {
    Common: ['Banish', 'Claw Growth', 'Mend', 'Conjure Weapon', 'Lighten', 'Sharpen Blade'],
    Uncommon: ['Invisibility', 'Mana Burst', 'Create Illusion', 'Phantom Steed', 'Strengthen Creature']
  },
  Mysticism: {
    Common: ['Confusion', 'Detect Magic', 'Soothing Balm', 'Silence', 'Phase Shift'],
    Uncommon: ['Mind Shield', 'Mind Blade', 'See Aura', 'Object Read', 'Sixth Sense']
  },
  Druidry: {
    Common: ['Entangling Roots', 'Plant Growth', 'Summon Animal', 'Commune with Plants', 'Eyes of the Eagle'],
    Uncommon: ['Animate Flora', 'Bramble Wall', 'Control Animal', 'Shapeshift', 'Wild Growth']
  },
  Hieraticism: {
    Common: ['Heal', 'Aura of Restoration', 'Repel Undead', 'Blessing of Renewal', 'Word of Cleansing'],
    Uncommon: ['Blessing of Health', 'Dispel Magic', 'Consecrate Ground', 'Banish Undead', 'Soul Transfer']
  }
}

const stepCost = { 'd4': 6, 'd6': 8, 'd8': 10, 'd10': 12, 'd12': Infinity }
const focusStepCost = 4

// Helper functions
const idx = (r: string) => dieRanks.indexOf(r)
const mv = (r: string) => r && r.startsWith('d') ? parseInt(r.slice(1), 10) : 0
const fnum = (v: string) => v ? parseInt(String(v).replace('+', ''), 10) : 0

interface Character {
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
  pools: { active: number; passive: number; spirit: number }
  actions: Record<string, string>
  spells?: Array<{ name: string; rarity: string; path: string }>
  magicPath?: string
}

export default function PlayerCharacterGenerator() {
  const [race, setRace] = useState('')
  const [characterClass, setCharacterClass] = useState('')
  const [level, setLevel] = useState<number>(1)
  const [magicPath, setMagicPath] = useState('')
  const [iconicArcane, setIconicArcane] = useState(false)
  const [character, setCharacter] = useState<Character | null>(null)

  // Show magic path selector for applicable classes
  const showMagicPath = characterClass && magicPathsByClass[characterClass as keyof typeof magicPathsByClass] && 
                       characterClass !== 'Adept' && characterClass !== 'Mystic'

  function applyMinima(ch: Character, minima: Record<string, string>) {
    for (const [key, val] of Object.entries(minima || {})) {
      if (abilities.includes(key)) {
        if (idx(val) > idx(ch.abilities[key])) ch.abilities[key] = val
      } else {
        const parentA = Object.keys(specialties).find(a => (specialties as any)[a].includes(key))
        const parentS = Object.keys(focuses).find(s => (focuses as any)[s].includes(key))
        if (parentA) {
          if (idx(val) > idx(ch.specialties[parentA][key])) ch.specialties[parentA][key] = val
        } else if (parentS) {
          const pa = Object.keys(specialties).find(a => (specialties as any)[a].includes(parentS))
          if (pa && fnum(val) > fnum(ch.focuses[pa][key])) ch.focuses[pa][key] = `+${fnum(val)}`
        }
      }
    }
  }

  function spendCP(ch: Character, cpBudget: { value: number }) {
    // Simplified upgrade logic - prioritize class-relevant abilities
    const upgradeOrder: Record<string, string[]> = {
      Warrior: ['Prowess', 'Melee', 'Strength', 'Fortitude', 'Threat', 'Might'],
      Barbarian: ['Prowess', 'Melee', 'Strength', 'Fortitude', 'Ferocity', 'Might'],
      Rogue: ['Prowess', 'Agility', 'Competence', 'Adroitness', 'Skulduggery', 'Speed'],
      Assassin: ['Prowess', 'Agility', 'Melee', 'Adroitness', 'Finesse', 'Speed'],
      Mage: ['Competence', 'Expertise', 'Wizardry', 'Fortitude', 'Willpower', 'Resistance'],
      Mystic: ['Fortitude', 'Willpower', 'Competence', 'Expertise', 'Endurance', 'Resilience'],
      Adept: ['Competence', 'Expertise', 'Adroitness', 'Wizardry', 'Cleverness', 'Perspicacity'],
      Theurgist: ['Competence', 'Expertise', 'Theurgy', 'Fortitude', 'Willpower', 'Endurance']
    }

    const order = upgradeOrder[ch.class as keyof typeof upgradeOrder] || []
    let safety = 0

    while (cpBudget.value > 0 && safety < 1000) {
      safety++
      let upgraded = false

      for (const key of order) {
        if (cpBudget.value <= 0) break

        // Try upgrading abilities
        if (abilities.includes(key)) {
          const currentRank = ch.abilities[key]
          const cost = stepCost[currentRank as keyof typeof stepCost]
          if (currentRank !== 'd12' && cpBudget.value >= cost) {
            ch.abilities[key] = dieRanks[idx(currentRank) + 1]
            cpBudget.value -= cost
            upgraded = true
            break
          }
        }
        // Try upgrading specialties
        else if (Object.values(specialties).flat().includes(key)) {
          const parentAbility = Object.keys(specialties).find(a => (specialties as any)[a].includes(key))
          if (parentAbility) {
            const currentRank = ch.specialties[parentAbility][key]
            const cost = stepCost[currentRank as keyof typeof stepCost]
            if (currentRank !== 'd12' && cpBudget.value >= cost) {
              ch.specialties[parentAbility][key] = dieRanks[idx(currentRank) + 1]
              cpBudget.value -= cost
              upgraded = true
              break
            }
          }
        }
        // Try upgrading focuses
        else {
          const parentSpecialty = Object.keys(focuses).find(s => (focuses as any)[s].includes(key))
          if (parentSpecialty) {
            const parentAbility = Object.keys(specialties).find(a => (specialties as any)[a].includes(parentSpecialty))
            if (parentAbility) {
              const currentVal = fnum(ch.focuses[parentAbility][key])
              if (currentVal < 5 && cpBudget.value >= focusStepCost) {
                ch.focuses[parentAbility][key] = `+${currentVal + 1}`
                cpBudget.value -= focusStepCost
                upgraded = true
                break
              }
            }
          }
        }
      }
      if (!upgraded) break
    }
  }

  function generateSpells(ch: Character): Array<{ name: string; rarity: string; path: string }> {
    if (!casterClasses.includes(ch.class)) return []

    const compSteps = idx(ch.abilities.Competence)
    const expSteps = idx(ch.specialties.Competence.Expertise)
    let spellCount = 2 * (compSteps + expSteps)
    
    if (ch.class === 'Adept') {
      spellCount = Math.floor(spellCount / 2)
    }

    const spells: Array<{ name: string; rarity: string; path: string }> = []
    
    // Add universal spells first
    spellsByPath.Universal.Common.forEach(spell => {
      spells.push({ name: spell, rarity: 'Common', path: 'Universal' })
    })

    // Determine available paths
    let availablePaths: string[] = []
    if (ch.class === 'Adept') {
      availablePaths = ['Thaumaturgy', 'Elementalism', 'Sorcery']
    } else if (ch.class === 'Mystic') {
      availablePaths = ['Mysticism']
    } else if (ch.magicPath) {
      availablePaths = [ch.magicPath]
    }

    // Add path-specific spells
    const remainingSpells = Math.max(0, spellCount - spells.length)
    for (let i = 0; i < remainingSpells; i++) {
      const path = availablePaths[Math.floor(Math.random() * availablePaths.length)]
      const pathSpells = spellsByPath[path as keyof typeof spellsByPath]
      
      if (pathSpells) {
        const isCommon = Math.random() < 0.7
        const raritySpells = isCommon ? pathSpells.Common : pathSpells.Uncommon
        
        if (raritySpells && raritySpells.length > 0) {
          const spell = raritySpells[Math.floor(Math.random() * raritySpells.length)]
          spells.push({ 
            name: spell, 
            rarity: isCommon ? 'Common' : 'Uncommon', 
            path 
          })
        }
      }
    }

    return spells
  }

  function generateCharacter() {
    if (!race || !characterClass || !level) {
      toast.error('Please select race, class, and level')
      return
    }

    if (showMagicPath && !magicPath) {
      toast.error('Please select a magic path for this class')
      return
    }

    const ch: Character = {
      race,
      class: characterClass,
      level,
      abilities: {},
      specialties: {},
      focuses: {},
      masteryDie: levelInfo[level - 1].masteryDie,
      advantages: [],
      flaws: [],
      classFeats: [],
      equipment: [],
      pools: { active: 0, passive: 0, spirit: 0 },
      actions: {}
    }

    // Initialize abilities, specialties, and focuses
    for (const a of abilities) {
      ch.abilities[a] = 'd4'
      ch.specialties[a] = {}
      ch.focuses[a] = {}
      for (const s of (specialties as any)[a]) {
        ch.specialties[a][s] = 'd4'
        for (const fx of (focuses as any)[s]) {
          ch.focuses[a][fx] = '+0'
        }
      }
    }

    // Apply racial and class minimums
    applyMinima(ch, (raceMinima as any)[race] || {})
    applyMinima(ch, (classMinima as any)[characterClass] || {})

    // Spend CP budget
    const cpBudget = { value: 10 + (level - 1) * 100 }
    if (iconicArcane) {
      if (cpBudget.value >= 4) {
        cpBudget.value -= 4
      } else {
        toast.error('Not enough CP for Iconic Arcane Inheritance')
        return
      }
    }

    spendCP(ch, cpBudget)

    // Calculate pools
    ch.pools = {
      active: mv(ch.abilities.Prowess) + mv(ch.specialties.Prowess.Agility) + mv(ch.specialties.Prowess.Melee),
      passive: mv(ch.abilities.Fortitude) + mv(ch.specialties.Fortitude.Endurance) + mv(ch.specialties.Fortitude.Strength),
      spirit: mv(ch.abilities.Competence) + mv(ch.specialties.Fortitude.Willpower)
    }

    // Set up advantages, flaws, feats, equipment
    ch.advantages = [...((allAdvantages as any)[race] || []), ...((allAdvantages as any)[characterClass] || [])]
    if (iconicArcane) ch.advantages.push('Iconic Arcane Inheritance')
    ch.flaws = (raceFlaws as any)[race] || []
    ch.classFeats = (classFeats as any)[characterClass] || []
    ch.equipment = [...startingEquipment.common, ...((startingEquipment as any)[characterClass] || [])]

    // Calculate actions
    const wiz = fnum(ch.focuses.Competence.Wizardry)
    const theurgy = fnum(ch.focuses.Competence.Theurgy)
    
    ch.actions = {
      meleeAttack: `${ch.abilities.Prowess} + ${ch.specialties.Prowess.Melee}${fnum(ch.focuses.Prowess.Threat) ? ` + Threat +${fnum(ch.focuses.Prowess.Threat)}` : ''}`,
      rangedAttack: `${ch.abilities.Prowess} + ${ch.specialties.Prowess.Precision}${fnum(ch.focuses.Prowess['Ranged Threat']) ? ` + Ranged Threat +${fnum(ch.focuses.Prowess['Ranged Threat'])}` : ''}`,
      perceptionCheck: `${ch.abilities.Competence} + ${ch.specialties.Competence.Perception}${fnum(ch.focuses.Competence.Perspicacity) ? ` + Perspicacity +${fnum(ch.focuses.Competence.Perspicacity)}` : ''}`,
    }

    if (casterClasses.includes(characterClass)) {
      ch.actions.magicAttack = `${ch.abilities.Competence} + ${ch.specialties.Competence.Expertise}${wiz ? ` + Wizardry +${wiz}` : theurgy ? ` + Theurgy +${theurgy}` : ''}`
      ch.magicPath = magicPath || (characterClass === 'Mystic' ? 'Mysticism' : 'Arcanum')
      ch.spells = generateSpells(ch)
    }

    // Update Path Mastery feat for applicable classes
    if ((characterClass === 'Mage' || characterClass === 'Theurgist' || characterClass === 'Mystic') && magicPath) {
      const pathMasteryIndex = ch.classFeats.indexOf('Path Mastery')
      if (pathMasteryIndex !== -1) {
        ch.classFeats[pathMasteryIndex] = `Path Mastery (${magicPath})`
      }
    }

    setCharacter(ch)
    toast.success('Character generated successfully!')
  }

  function exportMarkdown() {
    if (!character) {
      toast.error('Generate a character first!')
      return
    }

    let md = `# ${character.race} ${character.class} (Level ${character.level})\n\n`
    md += `### Core Stats\n`
    md += `- **SP:** ${character.pools.spirit} | **Active DP:** ${character.pools.active} | **Passive DP:** ${character.pools.passive}\n`
    md += `- **Mastery Die:** ${character.masteryDie}\n\n`
    
    md += `### Abilities\n`
    for (const a of abilities) {
      const sp = (specialties as any)[a].map((s: string) => {
        const fl = (focuses as any)[s].map((fx: string) => {
          const v = fnum(character.focuses[a][fx])
          return v ? `${fx} +${v}` : null
        }).filter(Boolean).join(', ')
        return `${s} **${character.specialties[a][s]}**${fl ? ` (${fl})` : ''}`
      }).join(', ')
      md += `**${a} ${character.abilities[a]}** → ${sp}.\n`
    }
    
    md += `\n### Actions\n`
    Object.entries(character.actions).forEach(([name, value]) => {
      const displayName = name.replace(/([A-Z])/g, ' $1').trim()
      md += `- **${displayName.charAt(0).toUpperCase() + displayName.slice(1)}:** ${value}\n`
    })
    
    md += `\n### Advantages & Flaws\n`
    md += `**Advantages:**\n${character.advantages.map(a => `- ${a}`).join('\n')}\n\n`
    md += `**Flaws:**\n${character.flaws.length ? character.flaws.map(f => `- ${f}`).join('\n') : '- None'}\n\n`
    
    md += `### Class Feats\n${character.classFeats.map(f => `- ${f}`).join('\n')}\n\n`

    if (character.spells && character.spells.length > 0) {
      md += `### Spellcasting\n`
      md += `- **Magic Path:** ${character.magicPath}\n`
      md += `**Known Spells:**\n`
      character.spells.forEach(spell => {
        md += `- ${spell.name} (${spell.rarity}, ${spell.path})\n`
      })
      md += '\n'
    }

    md += `### Equipment\n${character.equipment.map(e => `- ${e}`).join('\n')}\n`

    // Download file
    const blob = new Blob([md], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${character.race}_${character.class}_L${character.level}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Character exported to markdown!')
  }

  function copyMarkdown() {
    if (!character) {
      toast.error('Generate a character first!')
      return
    }

    // Same markdown generation as above
    let md = `# ${character.race} ${character.class} (Level ${character.level})\n\n`
    md += `### Core Stats\n`
    md += `- **SP:** ${character.pools.spirit} | **Active DP:** ${character.pools.active} | **Passive DP:** ${character.pools.passive}\n`
    md += `- **Mastery Die:** ${character.masteryDie}\n\n`
    
    md += `### Abilities\n`
    for (const a of abilities) {
      const sp = (specialties as any)[a].map((s: string) => {
        const fl = (focuses as any)[s].map((fx: string) => {
          const v = fnum(character.focuses[a][fx])
          return v ? `${fx} +${v}` : null
        }).filter(Boolean).join(', ')
        return `${s} **${character.specialties[a][s]}**${fl ? ` (${fl})` : ''}`
      }).join(', ')
      md += `**${a} ${character.abilities[a]}** → ${sp}.\n`
    }
    
    md += `\n### Actions\n`
    Object.entries(character.actions).forEach(([name, value]) => {
      const displayName = name.replace(/([A-Z])/g, ' $1').trim()
      md += `- **${displayName.charAt(0).toUpperCase() + displayName.slice(1)}:** ${value}\n`
    })
    
    md += `\n### Advantages & Flaws\n`
    md += `**Advantages:**\n${character.advantages.map(a => `- ${a}`).join('\n')}\n\n`
    md += `**Flaws:**\n${character.flaws.length ? character.flaws.map(f => `- ${f}`).join('\n') : '- None'}\n\n`
    
    md += `### Class Feats\n${character.classFeats.map(f => `- ${f}`).join('\n')}\n\n`

    if (character.spells && character.spells.length > 0) {
      md += `### Spellcasting\n`
      md += `- **Magic Path:** ${character.magicPath}\n`
      md += `**Known Spells:**\n`
      character.spells.forEach(spell => {
        md += `- ${spell.name} (${spell.rarity}, ${spell.path})\n`
      })
      md += '\n'
    }

    md += `### Equipment\n${character.equipment.map(e => `- ${e}`).join('\n')}\n`

    navigator.clipboard.writeText(md).then(() => {
      toast.success('Character copied to clipboard!')
    }).catch(() => {
      toast.error('Failed to copy to clipboard')
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Player Character Generator</CardTitle>
        <CardDescription>
          Create detailed player characters with full spell selection for Eldritch RPG
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Generation Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="race">Race</Label>
            <Select value={race} onValueChange={setRace}>
              <SelectTrigger>
                <SelectValue placeholder="Select race" />
              </SelectTrigger>
              <SelectContent>
                {races.map(r => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="class">Class</Label>
            <Select value={characterClass} onValueChange={setCharacterClass}>
              <SelectTrigger>
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="level">Level</Label>
            <Select value={level.toString()} onValueChange={(val) => setLevel(parseInt(val))}>
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                {levels.map(l => (
                  <SelectItem key={l} value={l.toString()}>Level {l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {showMagicPath && (
            <div className="space-y-2">
              <Label htmlFor="magic-path">Magic Path</Label>
              <Select value={magicPath} onValueChange={setMagicPath}>
                <SelectTrigger>
                  <SelectValue placeholder="Select path" />
                </SelectTrigger>
                <SelectContent>
                  {(magicPathsByClass[characterClass as keyof typeof magicPathsByClass] || []).map(path => (
                    <SelectItem key={path} value={path}>{path}</SelectItem>
                  ))}
                </SelectContent>
              </SelectContent>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="iconic-arcane" 
            checked={iconicArcane}
            onCheckedChange={(checked) => setIconicArcane(checked as boolean)}
          />
          <Label htmlFor="iconic-arcane">Iconic Arcane Inheritance (Costs 4 CP)</Label>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={generateCharacter} className="flex-1 min-w-[150px]">
            Generate Character
          </Button>
          <Button variant="outline" onClick={exportMarkdown} disabled={!character}>
            <Download className="w-4 h-4 mr-2" />
            Export Markdown
          </Button>
          <Button variant="outline" onClick={copyMarkdown} disabled={!character}>
            <Copy className="w-4 h-4 mr-2" />
            Copy Markdown
          </Button>
        </div>

        {/* Character Display */}
        {character && (
          <div className="space-y-4 border-t pt-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold">
                {character.race} {character.class} — Level {character.level}
              </h3>
            </div>

            {/* Core Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-secondary/50 rounded-lg p-3">
                <div className="text-xs text-muted-foreground">Spirit Points</div>
                <div className="text-xl font-bold">{character.pools.spirit}</div>
              </div>
              <div className="bg-secondary/50 rounded-lg p-3">
                <div className="text-xs text-muted-foreground">Active DP</div>
                <div className="text-xl font-bold">{character.pools.active}</div>
              </div>
              <div className="bg-secondary/50 rounded-lg p-3">
                <div className="text-xs text-muted-foreground">Passive DP</div>
                <div className="text-xl font-bold">{character.pools.passive}</div>
              </div>
              <div className="bg-secondary/50 rounded-lg p-3">
                <div className="text-xs text-muted-foreground">Mastery Die</div>
                <div className="text-xl font-bold">{character.masteryDie}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Abilities */}
              <div>
                <h4 className="font-semibold mb-2">Abilities</h4>
                <div className="space-y-1 text-sm">
                  {abilities.map(a => {
                    const sp = (specialties as any)[a].map((s: string) => {
                      const fl = (focuses as any)[s].map((fx: string) => {
                        const v = fnum(character.focuses[a][fx])
                        return v ? `${fx} +${v}` : null
                      }).filter(Boolean).join(', ')
                      return `${s} ${character.specialties[a][s]}${fl ? ` (${fl})` : ''}`
                    }).join(', ')
                    return (
                      <div key={a}>
                        <strong>{a} {character.abilities[a]}</strong> → {sp}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Actions */}
              <div>
                <h4 className="font-semibold mb-2">Actions</h4>
                <ul className="space-y-1 text-sm">
                  {Object.entries(character.actions).map(([name, value]) => {
                    const displayName = name.replace(/([A-Z])/g, ' $1').trim()
                    return (
                      <li key={name}>
                        <strong>{displayName.charAt(0).toUpperCase() + displayName.slice(1)}:</strong> {value}
                      </li>
                    )
                  })}
                </ul>
              </div>

              {/* Advantages & Flaws */}
              <div>
                <h4 className="font-semibold mb-2">Advantages & Flaws</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>Advantages:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {character.advantages.map((adv, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">{adv}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <strong>Flaws:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {character.flaws.length > 0 ? character.flaws.map((flaw, idx) => (
                        <Badge key={idx} variant="destructive" className="text-xs">{flaw}</Badge>
                      )) : <span className="text-muted-foreground">None</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Class Feats */}
              <div>
                <h4 className="font-semibold mb-2">Class Feats</h4>
                <ul className="space-y-1 text-sm">
                  {character.classFeats.map((feat, idx) => (
                    <li key={idx}>• {feat}</li>
                  ))}
                </ul>
              </div>

              {/* Spells (if applicable) */}
              {character.spells && character.spells.length > 0 && (
                <div className="lg:col-span-2">
                  <h4 className="font-semibold mb-2">Spellcasting</h4>
                  <div className="space-y-2">
                    <p className="text-sm"><strong>Magic Path:</strong> {character.magicPath}</p>
                    <div>
                      <strong className="text-sm">Known Spells:</strong>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {character.spells.map((spell, idx) => (
                          <Badge 
                            key={idx} 
                            variant={spell.rarity === 'Common' ? 'outline' : 'default'} 
                            className="text-xs"
                          >
                            {spell.name} ({spell.rarity})
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Equipment */}
              <div className="lg:col-span-2">
                <h4 className="font-semibold mb-2">Equipment</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-sm">
                  {character.equipment.map((item, idx) => (
                    <div key={idx}>• {item}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}