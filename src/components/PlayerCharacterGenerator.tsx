import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { useKV } from '@github/spark/hooks'
import { toast } from "sonner"
import { Download, Copy, Sparkles, Users, Plus, UserCircle, Cube } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import type { Character } from '../App'

// Game data
const dieRanks = ["d4", "d6", "d8", "d10", "d12"]
const abilities = ["Competence", "Prowess", "Fortitude"]
const specialties = {
  Competence: ["Adroitness", "Expertise", "Perception"],
  Prowess: ["Agility", "Melee", "Precision"],
  Fortitude: ["Endurance", "Strength", "Willpower"]
}
const focuses = {
  Adroitness: ["Skulduggery", "Cleverness"],
  Expertise: ["Wizardry", "Theurgy"],
  Perception: ["Alertness", "Perspicacity"],
  Agility: ["Speed", "Reaction"],
  Melee: ["Threat", "Finesse"],
  Precision: ["Ranged Threat", "Ranged Finesse"],
  Endurance: ["Vitality", "Resilience"],
  Strength: ["Ferocity", "Might"],
  Willpower: ["Courage", "Resistance"]
}

const races = ["Human", "Elf", "Dwarf", "Gnome", "Half-Elf", "Half-Orc", "Halfling", "Drakkin"]
const classes = ["Adept", "Assassin", "Barbarian", "Mage", "Mystic", "Rogue", "Theurgist", "Warrior"]
const levels = [1, 2, 3, 4, 5]
const buildStyles = ["balanced", "hybrid", "specialist"]
const rookieProfiles = ["off", "pure", "balanced", "specialist"]

const casterClasses = ["Adept", "Mage", "Mystic", "Theurgist"]
const magicPathsByClass = {
  Adept: ["Thaumaturgy", "Elementalism", "Sorcery"],
  Mage: ["Thaumaturgy", "Elementalism", "Sorcery"],
  Mystic: ["Mysticism"],
  Theurgist: ["Druidry", "Hieraticism"]
}

const levelInfo = [
  { level: 1, masteryDie: "d4", cpBand: [10, 100] },
  { level: 2, masteryDie: "d6", cpBand: [101, 199] },
  { level: 3, masteryDie: "d8", cpBand: [200, 299] },
  { level: 4, masteryDie: "d10", cpBand: [300, 399] },
  { level: 5, masteryDie: "d12", cpBand: [400, 999] }
]

const raceMinima = {
  Drakkin: { Competence: "d6", Prowess: "d6", Fortitude: "d6", Endurance: "d6", Strength: "d4" },
  Dwarf: { Fortitude: "d8", Endurance: "d4", Prowess: "d6", Melee: "d6" },
  Elf: { Competence: "d6", Expertise: "d6", Wizardry: "+1", Prowess: "d4", Agility: "d4", Reaction: "+1" },
  Gnome: { Competence: "d4", Adroitness: "d6", Expertise: "d6", Perception: "d4", Perspicacity: "+1" },
  "Half-Elf": { Competence: "d6", Prowess: "d6", Agility: "d4", Fortitude: "d4", Endurance: "d4", Willpower: "d4" },
  "Half-Orc": { Fortitude: "d6", Strength: "d8", Ferocity: "+1", Endurance: "d6" },
  Halfling: { Competence: "d6", Adroitness: "d6", Cleverness: "+1", Fortitude: "d6", Willpower: "d4", Courage: "+1" },
  Human: { Competence: "d6", Prowess: "d6", Melee: "d4", Threat: "+1", Fortitude: "d4", Willpower: "d6" }
}

const classMinima = {
  Adept: { Competence: "d6", Adroitness: "d4", Cleverness: "+1", Expertise: "d6", Wizardry: "+1", Perception: "d4", Perspicacity: "+1" },
  Assassin: { Competence: "d4", Adroitness: "d6", Perception: "d4", Prowess: "d4", Agility: "d4", Endurance: "d6", Melee: "d4", Finesse: "+1" },
  Barbarian: { Prowess: "d6", Melee: "d8", Fortitude: "d4", Strength: "d4", Ferocity: "+1" },
  Mage: { Competence: "d6", Expertise: "d8", Wizardry: "+1", Fortitude: "d4", Willpower: "d6", Resistance: "+1" },
  Mystic: { Competence: "d6", Expertise: "d6", Wizardry: "+1", Prowess: "d4", Melee: "d4", Fortitude: "d4", Endurance: "d6", Resilience: "+1", Vitality: "+2" },
  Rogue: { Competence: "d4", Adroitness: "d4", Skulduggery: "+1", Perception: "d4", Prowess: "d6", Agility: "d8" },
  Theurgist: { Competence: "d8", Expertise: "d4", Theurgy: "+1", Fortitude: "d6", Willpower: "d4" },
  Warrior: { Prowess: "d8", Melee: "d6", Threat: "+1", Fortitude: "d6" }
}

const stepCost = { "d4": 6, "d6": 8, "d8": 10, "d10": 12, "d12": Infinity }
const cumulativeDieCost = { "d4": 4, "d6": 10, "d8": 18, "d10": 28, "d12": 40 }
const focusStepCost = 4

const classAxes = {
  Warrior: ["Prowess", "Melee", "Strength", "Fortitude", "Endurance", "Threat", "Agility", "Might"],
  Barbarian: ["Prowess", "Melee", "Strength", "Fortitude", "Endurance", "Ferocity", "Might", "Vitality"],
  Rogue: ["Prowess", "Agility", "Competence", "Adroitness", "Perception", "Skulduggery", "Cleverness", "Speed"],
  Assassin: ["Prowess", "Agility", "Melee", "Competence", "Adroitness", "Finesse", "Speed", "Perception"],
  Mage: ["Competence", "Expertise", "Wizardry", "Fortitude", "Willpower", "Resistance", "Perception"],
  Mystic: ["Fortitude", "Willpower", "Competence", "Expertise", "Endurance", "Prowess", "Melee", "Resilience", "Vitality"],
  Adept: ["Competence", "Expertise", "Adroitness", "Perception", "Cleverness", "Wizardry", "Perspicacity"],
  Theurgist: ["Competence", "Expertise", "Theurgy", "Fortitude", "Willpower", "Endurance", "Courage"]
}

const allAdvantages = {
  Human: ["Fortunate", "Survival"],
  Elf: ["Night Vision", "Gift of Magic", "Magic Resistance (+1)"],
  Dwarf: ["Night Vision", "Strong-willed", "Sense of Direction"],
  Gnome: ["Eidetic Memory", "Low-Light Vision", "Observant"],
  "Half-Elf": ["Heightened Senses", "Low-Light Vision", "Magic Resistance (+1)"],
  "Half-Orc": ["Low-light Vision", "Intimidation", "Menacing"],
  Halfling: ["Low Light Vision", "Read Emotions", "Resilient"],
  Drakkin: ["Natural Armor", "Breath Weapon", "Night Vision"],
  Adept: ["Arcanum", "Gift of Magic", "Literacy", "Scholar"],
  Assassin: ["Expeditious", "Heightened Senses (hearing)", "Observant", "Read Emotions"],
  Barbarian: ["Animal Affinity", "Brutishness", "Menacing", "Resilient"],
  Mage: ["Arcanum", "Gift of Magic", "Magic Defense", "Scholar"],
  Mystic: ["Empathic", "Gift of Magic", "Intuitive", "Magic Resistance (Lesser)", "Strong-Willed"],
  Rogue: ["Expeditious", "Fortunate", "Streetwise", "Underworld Contacts"],
  Theurgist: ["Gift of Magic", "Magic Defense", "Religion", "Strong-Willed"],
  Warrior: ["Commanding", "Intimidation", "Magic Resistance (+1)", "Tactician"]
}

const classFeats = {
  Adept: ["Guile", "Lore", "Ritual Magic", "Quick-witted"],
  Assassin: ["Death Strike", "Lethal Exploit", "Ranged Ambush", "Shadow Walk"],
  Barbarian: ["Berserk", "Brawl", "Feat of Strength", "Grapple"],
  Mage: ["Arcane Finesse", "Dweomers", "Intangible Threat", "Path Mastery"],
  Mystic: ["Iron Mind", "Path Mastery", "Premonition", "Psychic Powers"],
  Rogue: ["Backstab", "Evasion", "Roguish Charm", "Stealth"],
  Theurgist: ["Divine Healing", "Path Mastery", "Spiritual Smite", "Supernatural Intervention"],
  Warrior: ["Battle Savvy", "Maneuvers", "Stunning Reversal", "Sunder Foe"]
}

const startingEquipment = {
  common: ["Set of ordinary clothes", "Purse of 5 gold coins", "Backpack", "Small dagger", "Week's rations", "Waterskin", "Tinderbox", "50' rope", "Iron spikes", "Small hammer", "6' traveling staff or 10' pole", "Hooded lantern and 2 oil flasks or d4+1 torches"],
  Adept: ["Book of knowledge (area of expertise)"],
  Assassin: ["Assassin hood, jacket, cape, robe, or tunic"],
  Barbarian: ["Garments of woven wool or linen", "Tunic", "Overcoat or cloak"],
  Mage: ["Spellbook", "Staff or focus item"],
  Mystic: ["Robes or shawl", "Cloak", "Armor up to leather"],
  Rogue: ["Set of thieves' tools", "Light armor (up to leather)", "One weapon"],
  Theurgist: ["Prayer book", "Holy relic or symbol", "Focus item", "Armor up to chain"],
  Warrior: ["One weapon of choice", "Armor up to chain", "Small to large shield", "Steed"]
}

const raceFlaws = {
  Gnome: ["Restriction: small weapons only"],
  Halfling: ["Restriction: small weapons only"],
  "Half-Orc": ["Ugliness"]
}

// Helper functions
const idx = (r: string) => dieRanks.indexOf(r)
const mv = (r: string) => r && r.startsWith("d") ? parseInt(r.slice(1), 10) : 0
const fnum = (v: string) => v ? parseInt(String(v).replace("+", ""), 10) : 0

interface PlayerCharacterGeneratorProps {
  selectedCharacter: Character | null
  onCharacterSelect: (character: Character | null) => void
}

function PlayerCharacterGenerator({ selectedCharacter, onCharacterSelect }: PlayerCharacterGeneratorProps) {
  const [race, setRace] = useState<string>('')
  const [characterClass, setCharacterClass] = useState<string>('')
  const [level, setLevel] = useState<number>(1)
  const [magicPath, setMagicPath] = useState<string>('')
  const [buildStyle, setBuildStyle] = useState<string>('balanced')
  const [rookieProfile, setRookieProfile] = useState<string>('off')
  const [iconicArcane, setIconicArcane] = useState<boolean>(false)
  const [npcMode, setNpcMode] = useState<boolean>(false)
  const [enforceSoftcaps, setEnforceSoftcaps] = useState<boolean>(true)
  const [showWeakness, setShowWeakness] = useState<boolean>(true)
  const [character, setCharacter] = useState<Character | null>(null)
  const [characterName, setCharacterName] = useState<string>('')
  const [savedCharacters, setSavedCharacters] = useKV('saved-characters', {} as Record<string, Character>)
  const [selectedSpells, setSelectedSpells] = useKV('selected-spells', [] as any[])

  const showMagicPath = characterClass && magicPathsByClass[characterClass as keyof typeof magicPathsByClass] && characterClass !== 'Adept' && characterClass !== 'Mystic'
  const canUseRookieProfile = level === 1

  // Populate fields when a character is selected
  useEffect(() => {
    if (selectedCharacter) {
      setRace(selectedCharacter.race)
      setCharacterClass(selectedCharacter.class)
      setLevel(selectedCharacter.level)
      setCharacterName(selectedCharacter.name || `${selectedCharacter.race} ${selectedCharacter.class}`)
      setMagicPath(selectedCharacter.magicPath || '')
      setCharacter(selectedCharacter)
      
      // Load spells if character has them - check both spells and spellbook fields
      const characterSpells = selectedCharacter.spells || selectedCharacter.spellbook || []
      if (characterSpells.length > 0) {
        setSelectedSpells(characterSpells)
      }
      
      toast.success('Character loaded for editing')
    }
  }, [selectedCharacter])

  // Auto-disable rookie profile when not level 1
  useEffect(() => {
    if (!canUseRookieProfile) {
      setRookieProfile('off')
    }
  }, [level, canUseRookieProfile])

  // Auto-update character spellbook when selectedSpells changes
  useEffect(() => {
    if (character && character.id && casterClasses.includes(character.class)) {
      const updatedCharacter = {
        ...character,
        spellbook: [...selectedSpells],
        updatedAt: Date.now()
      }
      
      setSavedCharacters(current => ({
        ...current,
        [character.id!]: updatedCharacter
      }))
      
      setCharacter(updatedCharacter)
    }
  }, [selectedSpells, character?.id])

  // Auto-update character name when characterName changes
  useEffect(() => {
    if (character && character.id && characterName.trim()) {
      const updatedCharacter = {
        ...character,
        name: characterName.trim(),
        updatedAt: Date.now()
      }
      
      setSavedCharacters(current => ({
        ...current,
        [character.id!]: updatedCharacter
      }))
      
      setCharacter(updatedCharacter)
    }
  }, [characterName, character?.id])

  const applyMinima = (ch: Character, minima: Record<string, string>) => {
    for (const [k, v] of Object.entries(minima || {})) {
      if (abilities.includes(k)) {
        if (idx(v) > idx(ch.abilities[k])) ch.abilities[k] = v
      } else {
        const parentA = Object.keys(specialties).find(a => specialties[a as keyof typeof specialties].includes(k))
        const parentS = Object.keys(focuses).find(s => focuses[s as keyof typeof focuses].includes(k))
        if (parentA) {
          if (idx(v) > idx(ch.specialties[parentA][k])) ch.specialties[parentA][k] = v
        } else if (parentS) {
          const pa = Object.keys(specialties).find(a => specialties[a as keyof typeof specialties].includes(parentS))
          if (pa && fnum(v) > fnum(ch.focuses[pa][k])) ch.focuses[pa][k] = `+${fnum(v)}`
        }
      }
    }
  }

  const rookieCaps = (profile: string) => {
    if (profile === "pure") return { abilityMax: "d6", specMax: "d6", focusMax: 1 }
    if (profile === "balanced") return { abilityMax: "d8", specMax: "d8", focusMax: 2 }
    if (profile === "specialist") return { abilityMax: "d8", specMax: "d10", focusMax: 3 }
    return null
  }

  const softCaps = (level: number, style: string) => {
    const sc = { abilityMax: "d12", specMax: "d12", focusMax: 5 }
    if (style === "balanced") {
      if (level <= 3) {
        sc.abilityMax = "d10"
        sc.specMax = "d10"
        sc.focusMax = 3
      }
      if (level === 4) sc.focusMax = 4
    }
    if (style === "hybrid" && level <= 3) sc.focusMax = 4
    if (style === "specialist" && level <= 3) sc.focusMax = 5
    return sc
  }

  const buildWeights = (klass: string, style: string) => {
    const axis = classAxes[klass as keyof typeof classAxes] || []
    const w: Record<string, number> = {}
    axis.forEach((k, i) => {
      w[k] = style === 'specialist' ? 100 - i * 4 : style === 'balanced' ? 60 - i * 3 : 80 - i * 3
    })
    if (style === 'balanced') {
      w['Competence'] = (w['Competence'] || 30) + 20
      w['Fortitude'] = (w['Fortitude'] || 30) + 20;
      ['Endurance', 'Strength', 'Willpower', 'Agility'].forEach(k => {
        w[k] = (w[k] || 20) + 10
      })
    }
    return w
  }

  const canUpgrade = (ch: Character, key: string, kind: string, level: number, style: string) => {
    if (!enforceSoftcaps) return true
    const rp = rookieProfile
    const rc = rookieCaps(rp)
    const sc = (level === 1 && rp !== 'off') ? rc : softCaps(level, style)
    if (!sc) return true
    
    const maxDie = (kind === 'ability') ? sc.abilityMax : sc.specMax
    let cur = 'd4'
    if (kind === 'ability') {
      cur = ch.abilities[key]
    } else {
      const pa = Object.keys(specialties).find(a => specialties[a as keyof typeof specialties].includes(key))
      if (pa) cur = ch.specialties[pa][key]
    }
    
    const order = { "d4": 0, "d6": 1, "d8": 2, "d10": 3, "d12": 4 }
    return order[cur as keyof typeof order] < order[maxDie as keyof typeof order]
  }

  const spendCP = (ch: Character, cpBudget: { value: number }, style: string, level: number) => {
    const weights = buildWeights(ch.class, style)
    
    const tryUpgrade = (key: string): boolean => {
      if (abilities.includes(key)) {
        const cur = ch.abilities[key]
        if (cur === "d12") return false
        if (!canUpgrade(ch, key, "ability", level, style)) return false
        const cost = stepCost[cur as keyof typeof stepCost]
        if (cpBudget.value < cost) return false
        ch.abilities[key] = dieRanks[idx(cur) + 1]
        cpBudget.value -= cost
        return true
      }
      
      const pa = Object.keys(specialties).find(a => specialties[a as keyof typeof specialties].includes(key))
      if (pa) {
        const cur = ch.specialties[pa][key]
        if (cur === "d12") return false
        if (!canUpgrade(ch, key, "spec", level, style)) return false
        const cost = stepCost[cur as keyof typeof stepCost]
        if (cpBudget.value < cost) return false
        ch.specialties[pa][key] = dieRanks[idx(cur) + 1]
        cpBudget.value -= cost
        return true
      }
      
      const ps = Object.keys(focuses).find(s => focuses[s as keyof typeof focuses].includes(key))
      if (ps) {
        const pa2 = Object.keys(specialties).find(a => specialties[a as keyof typeof specialties].includes(ps))
        if (!pa2) return false
        const val = fnum(ch.focuses[pa2][key])
        const rp = rookieProfile
        const rc = rookieCaps(rp)
        const sc = (level === 1 && rp !== 'off') ? rc : softCaps(level, style)
        if (sc && val >= sc.focusMax) return false
        if (cpBudget.value < focusStepCost) return false
        ch.focuses[pa2][key] = `+${val + 1}`
        cpBudget.value -= focusStepCost
        return true
      }
      
      return false
    }

    const keys = [...new Set([...abilities, ...Object.values(specialties).flat(), ...Object.values(focuses).flat()])]
    let safety = 0
    while (cpBudget.value > 0 && safety < 5000) {
      safety++
      const sorted = keys.slice().sort((a, b) => (weights[b] || 10) - (weights[a] || 10))
      let upgraded = false
      for (const k of sorted) {
        if (tryUpgrade(k)) {
          upgraded = true
          break
        }
      }
      if (!upgraded) break
    }
  }

  const computePools = (ch: Character) => {
    const AD = mv(ch.abilities.Prowess) + mv(ch.specialties.Prowess.Agility) + mv(ch.specialties.Prowess.Melee)
    const PD = mv(ch.abilities.Fortitude) + mv(ch.specialties.Fortitude.Endurance) + mv(ch.specialties.Fortitude.Strength)
    const SP = mv(ch.abilities.Competence) + mv(ch.specialties.Fortitude.Willpower)
    return { active: AD, passive: PD, spirit: SP }
  }

  const weaknessReport = (ch: Character) => {
    const { active, passive, spirit } = computePools(ch)
    const flags = []
    if (spirit <= 12) flags.push('Low Spirit Points (mental/arcane pressure will hurt).')
    if (active < 24) flags.push("Low Active DP (poor agility/parry).")
    if (passive < 24) flags.push("Low Passive DP (fragile to heavy blows).")
    if (idx(ch.abilities.Competence) <= 1) flags.push("Low Competence (poor perception/social/planning).")
    if (idx(ch.specialties.Competence.Perception) <= 1) flags.push("Low Perception branch (traps/ambush risk).")
    if (idx(ch.specialties.Fortitude.Willpower) <= 1) flags.push("Low Willpower (charms/fear/illusions).")
    if (idx(ch.specialties.Prowess.Precision) <= 1) flags.push("Weak ranged capability.")
    return flags
  }

  const cpTally = (ch: Character, iconic: boolean) => {
    let a = 0, s = 0, f = 0
    for (const ab of abilities) {
      a += (cumulativeDieCost[ch.abilities[ab] as keyof typeof cumulativeDieCost] || 0)
      for (const sp of specialties[ab as keyof typeof specialties]) {
        s += (cumulativeDieCost[ch.specialties[ab][sp] as keyof typeof cumulativeDieCost] || 0)
      }
      for (const fx of Object.values(ch.focuses[ab])) {
        f += fnum(fx) * focusStepCost
      }
    }
    const base = 10
    const adv = iconic ? 4 : 0
    return { base, abilities: a, specialties: s, focuses: f, advantages: adv, total: base + a + s + f + adv }
  }

  const getAdvantages = (race: string, klass: string) => {
    const raceAdv = allAdvantages[race as keyof typeof allAdvantages] || []
    const classAdv = allAdvantages[klass as keyof typeof allAdvantages] || []
    return [...new Set([...raceAdv, ...classAdv])]
  }

  const getEquipment = (klass: string) => {
    return [...startingEquipment.common, ...(startingEquipment[klass as keyof typeof startingEquipment] || [])]
  }

  const generate = () => {
    if (!race || !characterClass || !level) {
      toast.error("Please select race, class, and level")
      return
    }

    const ch: Character = {
      id: '', // Will be set later
      race,
      class: characterClass,
      level,
      displayLevel: level,
      abilities: {},
      specialties: {},
      focuses: {},
      pools: { active: 0, passive: 0, spirit: 0 },
      masteryDie: "d4",
      actions: {},
      advantages: [],
      flaws: [],
      classFeats: [],
      equipment: []
    }

    // Initialize character structure
    for (const a of abilities) {
      ch.abilities[a] = "d4"
      ch.specialties[a] = {}
      ch.focuses[a] = {}
      for (const s of specialties[a as keyof typeof specialties]) {
        ch.specialties[a][s] = "d4"
        for (const fx of focuses[s as keyof typeof focuses]) {
          ch.focuses[a][fx] = "+0"
        }
      }
    }

    // Apply minimums
    applyMinima(ch, raceMinima[race as keyof typeof raceMinima] || {})
    applyMinima(ch, classMinima[characterClass as keyof typeof classMinima] || {})

    // Spend CP
    const cpBudget = { value: 10 + (level - 1) * 100 - (iconicArcane ? 4 : 0) }
    if (level === 1 && rookieProfile === 'pure') {
      // No CP spending beyond minima
    } else {
      spendCP(ch, cpBudget, buildStyle, level)
    }

    // Calculate final stats
    const totals = cpTally(ch, iconicArcane)
    let actualLevel = 1
    for (let i = levelInfo.length - 1; i >= 0; i--) {
      if (totals.total >= levelInfo[i].cpBand[0]) {
        actualLevel = levelInfo[i].level
        break
      }
    }
    ch.displayLevel = actualLevel
    ch.masteryDie = levelInfo[actualLevel - 1].masteryDie

    // Calculate pools
    ch.pools = computePools(ch)

    // Calculate actions
    const w = fnum(ch.focuses.Competence.Wizardry)
    const t = fnum(ch.focuses.Competence.Theurgy)
    ch.actions = {
      meleeAttack: `${ch.abilities.Prowess} + ${ch.specialties.Prowess.Melee}` + (fnum(ch.focuses.Prowess.Threat) ? ` + Threat +${fnum(ch.focuses.Prowess.Threat)}` : ''),
      rangedAttack: `${ch.abilities.Prowess} + ${ch.specialties.Prowess.Precision}` + (fnum(ch.focuses.Prowess['Ranged Threat']) ? ` + Ranged Threat +${fnum(ch.focuses.Prowess['Ranged Threat'])}` : ''),
      perceptionCheck: `${ch.abilities.Competence} + ${ch.specialties.Competence.Perception}` + (fnum(ch.focuses.Competence.Perspicacity) ? ` + Perspicacity +${fnum(ch.focuses.Competence.Perspicacity)}` : ''),
      magicAttack: casterClasses.includes(characterClass) ? `${ch.abilities.Competence} + ${ch.specialties.Competence.Expertise} + ${(w ? `Wizardry +${w}` : t ? `Theurgy +${t}` : '(path focus 0)')}` : '—'
    }

    // Get advantages, flaws, feats, and equipment
    ch.advantages = getAdvantages(race, characterClass)
    if (iconicArcane) ch.advantages.push('Iconic Arcane Inheritance')
    ch.flaws = raceFlaws[race as keyof typeof raceFlaws] || []
    ch.classFeats = [...(classFeats[characterClass as keyof typeof classFeats] || [])]
    ch.equipment = getEquipment(characterClass)

    // Handle Path Mastery feat for casters
    if (magicPath && (characterClass === 'Mage' || characterClass === 'Theurgist')) {
      const featIndex = ch.classFeats.indexOf('Path Mastery')
      if (featIndex !== -1) {
        ch.classFeats[featIndex] = `Path Mastery (${magicPath})`
      }
    }

    // Add magic path for casters
    if (magicPath) {
      ch.magicPath = magicPath
    } else if (characterClass === 'Adept') {
      ch.magicPath = 'Arcanum'
    } else if (characterClass === 'Mystic') {
      ch.magicPath = 'Mysticism'
    }

    // Add spell information for casters
    if (casterClasses.includes(characterClass)) {
      
      // Calculate spell count based on Competence and Expertise die ranks
      // Each die rank gives 2 spells per rank (d4=2, d6=4, d8=6, etc.)
      const competenceSpells = mv(ch.abilities.Competence) / 2
      const expertiseSpells = mv(ch.specialties.Competence.Expertise) / 2
      let baseSpellCount = competenceSpells + expertiseSpells
      
      // Adepts get half the spells
      if (characterClass === 'Adept') {
        baseSpellCount = Math.floor(baseSpellCount / 2)
      }
      
      // Minimum of 2 spells
      ch.recommendedSpellCount = Math.max(2, baseSpellCount)
    }

    // Auto-save the character to roster
    const characterId = `char_${Date.now()}`
    const timestamp = Date.now()
    
    const characterToSave: Character = {
      ...ch,
      id: characterId,
      name: `${ch.race} ${ch.class}`,
      spellbook: (casterClasses.includes(ch.class) && selectedSpells.length > 0) ? [...selectedSpells] : undefined,
      createdAt: timestamp,
      updatedAt: timestamp
    }

    setSavedCharacters(current => ({
      ...current,
      [characterId]: characterToSave
    }))

    setCharacter(characterToSave)
    setCharacterName(characterToSave.name)
    
    // Auto-select this character
    onCharacterSelect?.(characterToSave)
    
    toast.success('Character generated and automatically saved to roster!')
  }


  const exportMarkdown = () => {
    if (!character) {
      toast.error('Generate a character first!')
      return
    }

    const totals = cpTally(character, iconicArcane)
    const band = levelInfo[character.displayLevel - 1].cpBand
    const bandStr = `${band[0]} to ${band[1]}`
    
    let md = `# ${character.race} ${character.class} (Level ${character.displayLevel})\n\n`
    md += `### Core Stats\n`
    md += `- **SP:** ${character.pools.spirit} | **Active DP:** ${character.pools.active} | **Passive DP:** ${character.pools.passive}\n`
    md += `- **Mastery Die:** ${character.masteryDie}\n`
    md += `- **Total CP Value:** ${totals.total} (Expected Range for Level ${character.displayLevel}: ${bandStr})\n\n`
    
    md += `### Abilities\n`
    for (const a of abilities) {
      const sp = specialties[a as keyof typeof specialties].map(s => {
        const fl = focuses[s as keyof typeof focuses].map(fx => {
          const v = fnum(character.focuses[a][fx])
          return v ? `${fx} +${v}` : null
        }).filter(Boolean).join(', ')
        return `${s} **${character.specialties[a][s]}**${fl ? ` (${fl})` : ''}`
      }).join(', ')
      md += `**${a} ${character.abilities[a]}**: ${sp}.\n`
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
    
    // Add spellbook if character is a caster and has spells
    if (casterClasses.includes(character.class) && selectedSpells.length > 0) {
      md += `### Spellbook (${selectedSpells.length} spells)\n\n`
      
      // Group by path
      const spellsByPath = selectedSpells.reduce((acc: any, spell: any) => {
        if (!acc[spell.path]) acc[spell.path] = []
        acc[spell.path].push(spell)
        return acc
      }, {})
      
      Object.entries(spellsByPath).forEach(([path, spells]: [string, any]) => {
        md += `#### ${path} (${spells.length} spells)\n\n`
        spells.forEach((spell: any) => {
          md += `**${spell.name}** _(${spell.rarity}, ${spell.category})_\n`
          md += `- **Potency:** ${spell.potency} | **Challenge:** ${spell.challenge}\n`
          md += `- **Maintenance:** ${spell.maintenance} | **Failure:** ${spell.failure}\n`
          md += `- ${spell.description}\n\n`
        })
      })
    }
    
    md += `### Equipment\n${character.equipment.map(e => `- ${e}`).join('\n')}\n\n`
    
    md += `### Character Points Breakdown (Total Value)\n`
    md += `- **Base Customization:** ${totals.base}\n`
    md += `- **From Abilities:** ${totals.abilities}\n`
    md += `- **From Specialties:** ${totals.specialties}\n`
    md += `- **From Focuses:** ${totals.focuses}\n`
    md += `- **From Advantages:** ${totals.advantages}\n`
    md += `- **Total CP Value:** ${totals.total}\n\n`
    
    md += `_Note: Total CP Value reflects the character's build balance. Advancement in-game is tracked separately via Earned CP, starting from 0._\n`
    
    md += `\n### Level Advancement (Earned CP)\n`
    md += `| To Reach Level | Total Earned CP Required |\n`
    md += `| :------------- | :----------------------- |\n`
    md += `| Level 2        | 100                      |\n`
    md += `| Level 3        | 200                      |\n`
    md += `| Level 4        | 300                      |\n`
    md += `| Level 5        | 500                      |\n`

    const blob = new Blob([md], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${character.race}_${character.class}_L${character.displayLevel}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success('Character exported to markdown!')
  }

  const copyMarkdown = async () => {
    if (!character) {
      toast.error('Generate a character first!')
      return
    }

    const totals = cpTally(character, iconicArcane)
    const band = levelInfo[character.displayLevel - 1].cpBand
    const bandStr = `${band[0]} to ${band[1]}`
    
    let md = `# ${character.race} ${character.class} (Level ${character.displayLevel})\n\n`
    md += `- **Mastery Die:** ${character.masteryDie}\n`
    md += `- **Total CP Value:** ${totals.total} (Expected Range for Level ${character.displayLevel}: ${bandStr})\n\n`
    
    md += `### Abilities\n`
    for (const a of abilities) {
      const sp = specialties[a as keyof typeof specialties].map(s => {
        const fl = focuses[s as keyof typeof focuses].map(fx => {
          const v = fnum(character.focuses[a][fx])
          return v ? `${fx} +${v}` : null
        }).filter(Boolean).join(', ')
        return `${s} **${character.specialties[a][s]}**${fl ? ` (${fl})` : ''}`
      }).join(', ')
      md += `**${a} ${character.abilities[a]}**: ${sp}.\n`
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
    
    // Add spellbook if character is a caster and has spells
    if (casterClasses.includes(character.class) && selectedSpells.length > 0) {
      md += `### Spellbook (${selectedSpells.length} spells)\n\n`
      
      // Group by path
      const spellsByPath = selectedSpells.reduce((acc: any, spell: any) => {
        if (!acc[spell.path]) acc[spell.path] = []
        acc[spell.path].push(spell)
        return acc
      }, {})
      
      Object.entries(spellsByPath).forEach(([path, spells]: [string, any]) => {
        md += `#### ${path} (${spells.length} spells)\n\n`
        spells.forEach((spell: any) => {
          md += `**${spell.name}** _(${spell.rarity}, ${spell.category})_\n`
          md += `- **Potency:** ${spell.potency} | **Challenge:** ${spell.challenge}\n`
          md += `- **Maintenance:** ${spell.maintenance} | **Failure:** ${spell.failure}\n`
          md += `- ${spell.description}\n\n`
        })
      })
    }
    
    md += `### Equipment\n${character.equipment.map(e => `- ${e}`).join('\n')}\n\n`
    
    md += `### Character Points Breakdown (Total Value)\n`
    md += `- **Base Customization:** ${totals.base}\n`
    md += `- **From Abilities:** ${totals.abilities}\n`
    md += `- **From Specialties:** ${totals.specialties}\n`
    md += `- **From Focuses:** ${totals.focuses}\n`
    md += `- **From Advantages:** ${totals.advantages}\n`
    md += `- **Total CP Value:** ${totals.total}\n\n`
    
    md += `_Note: Total CP Value reflects the character's build balance. Advancement in-game is tracked separately via Earned CP, starting from 0._\n`
    
    md += `\n### Level Advancement (Earned CP)\n`
    md += `| To Reach Level | Total Earned CP Required |\n`
    md += `| :------------- | :----------------------- |\n`
    md += `| Level 2        | 100                      |\n`
    md += `| Level 3        | 200                      |\n`
    md += `| Level 4        | 300                      |\n`
    md += `| Level 5        | 500                      |\n`
    
    try {
      await navigator.clipboard.writeText(md)
      toast.success('Character copied to clipboard!')
    } catch (err) {
      toast.error('Failed to copy to clipboard')
    }
  }

  const clearForm = () => {
    setRace('')
    setCharacterClass('')
    setLevel(1)
    setMagicPath('')
    setBuildStyle('balanced')
    setRookieProfile('off')
    setIconicArcane(false)
    setNpcMode(false)
    setEnforceSoftcaps(true)
    setShowWeakness(true)
    setCharacter(null)
    setCharacterName('')
    onCharacterSelect(null)
    toast.success('Form cleared for new character')
  }

  // Build summary for live feedback
  const buildSummary = character ? {
    level: character.displayLevel,
    cp: (() => {
      const totals = cpTally(character, iconicArcane)
      return `${totals.total - totals.base}/${10 + (level - 1) * 100 - (iconicArcane ? 4 : 0)}`
    })(),
    activeDP: character.pools.active,
    passiveDP: character.pools.passive,
    masteryDie: character.masteryDie,
    rookieStatus: level === 1 && rookieProfile !== 'off' ? rookieProfile : null
  } : null

  return (
    <div className="space-y-6">
      {/* Live Build Summary - Sticky at top when character exists */}
      {buildSummary && (
        <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 p-4 rounded-xl border border-primary/20 sticky top-4 z-10 backdrop-blur-sm">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <Badge variant="default" className="flex items-center gap-1">
              Level {buildSummary.level}
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              CP: {buildSummary.cp}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              Active DP: {buildSummary.activeDP}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              Passive DP: {buildSummary.passiveDP}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              {buildSummary.masteryDie}
            </Badge>
            {buildSummary.rookieStatus && (
              <Badge variant="outline" className="flex items-center gap-1">
                Rookie: {buildSummary.rookieStatus}
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Character Creation Form */}
      <Card className="bg-gradient-to-br from-card via-card to-card/90 border-border/50 shadow-2xl backdrop-blur-sm">
        <CardHeader className="pb-6">
          <div className="space-y-3">
            <CardTitle className="text-4xl font-bold text-foreground tracking-wide text-center">
              Character Codex
            </CardTitle>
            <CardDescription className="text-muted-foreground text-center">
              Set identity, growth style, and training. Live summary above updates as you toggle.
            </CardDescription>
            {selectedCharacter && (
              <div className="text-center">
                <Badge variant="secondary" className="text-base px-4 py-2">
                  Editing: {selectedCharacter.name || `${selectedCharacter.race} ${selectedCharacter.class}`}
                </Badge>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {/* Essential Identity - Clean Two-Column Grid */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-primary flex items-center gap-3">
              <UserCircle className="w-6 h-6" />
              Essential Identity
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <Label htmlFor="race" className="text-base font-semibold">Race</Label>
                <Select value={race} onValueChange={setRace}>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Choose your heritage..." />
                  </SelectTrigger>
                  <SelectContent>
                    {races.map(r => (
                      <SelectItem key={r} value={r} className="text-base py-2">{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="class" className="text-base font-semibold">Class</Label>
                <Select value={characterClass} onValueChange={setCharacterClass}>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Select your calling..." />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map(c => (
                      <SelectItem key={c} value={c} className="text-base py-2">{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="level" className="text-base font-semibold">Experience Level</Label>
                <div className="flex gap-2">
                  {levels.map(l => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setLevel(l)}
                      className={cn(
                        "level-selector flex-1 h-12 rounded-lg border-2 font-medium transition-all",
                        level === l 
                          ? 'selected bg-primary text-primary-foreground border-primary shadow-md' 
                          : 'bg-card border-border hover:border-primary/50 hover:bg-primary/5'
                      )}
                    >
                      Level {l}
                    </button>
                  ))}
                </div>
              </div>

              {showMagicPath && (
                <div className="space-y-2">
                  <Label htmlFor="magic-path" className="text-base font-semibold">Magic Path</Label>
                  <Select value={magicPath} onValueChange={setMagicPath}>
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="Choose your path..." />
                    </SelectTrigger>
                    <SelectContent>
                      {magicPathsByClass[characterClass as keyof typeof magicPathsByClass]?.map(p => (
                        <SelectItem key={p} value={p} className="text-base py-2">{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Training & Development Style - Segmented Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Training Mode */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-secondary flex items-center gap-2">
                <Cube className="w-5 h-5" />
                Training Mode
              </h3>
              <div className="space-y-3">
                <div className="segmented-control">
                  <button
                    type="button"
                    onClick={() => setRookieProfile('off')}
                    disabled={!canUseRookieProfile}
                    className={cn(
                      'transition-all',
                      rookieProfile === 'off' && 'active',
                      !canUseRookieProfile && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    Standard
                  </button>
                  <button
                    type="button"
                    onClick={() => setRookieProfile('balanced')}
                    disabled={!canUseRookieProfile}
                    className={cn(
                      'transition-all',
                      rookieProfile === 'balanced' && 'active',
                      !canUseRookieProfile && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    Rookie
                  </button>
                </div>
                <p className="text-sm text-muted-foreground">
                  {canUseRookieProfile 
                    ? "Rookie training applies caps and uses only the 10 creation points"
                    : "Only available for Level 1 characters"
                  }
                </p>
              </div>
            </div>

            {/* Development Style */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-secondary flex items-center gap-2">
                <Cube className="w-5 h-5" />
                Development Style
              </h3>
              <div className="space-y-3">
                <div className="segmented-control">
                  {buildStyles.map(style => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => setBuildStyle(style)}
                      className={cn(
                        'transition-all',
                        buildStyle === style && 'active'
                      )}
                    >
                      {style === 'balanced' && 'Balanced'}
                      {style === 'specialist' && 'Specialist'}  
                      {style === 'hybrid' && 'Hybrid'}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  {buildStyle === 'balanced' && 'Spreads power evenly before spiking'}
                  {buildStyle === 'specialist' && 'Prioritizes class-focused abilities'}
                  {buildStyle === 'hybrid' && 'Blends balanced and specialist approaches'}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Advanced Configuration - Collapsible */}
          <details className="group">
            <summary className="cursor-pointer text-xl font-semibold text-accent flex items-center gap-2 mb-4 hover:text-accent/80 transition-colors">
              <span className="transform transition-transform group-open:rotate-90">▶</span>
              Advanced Configuration
            </summary>
            
            <div className="space-y-6 pl-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3">
                  <Checkbox 
                    id="iconic-arcane" 
                    checked={iconicArcane}
                    onCheckedChange={setIconicArcane}
                  />
                  <div className="space-y-1">
                    <Label htmlFor="iconic-arcane" className="font-medium cursor-pointer">
                      Iconic Arcane Inheritance
                    </Label>
                    <p className="text-xs text-muted-foreground">Costs 4 CP</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Checkbox 
                    id="enforce-softcaps" 
                    checked={enforceSoftcaps}
                    onCheckedChange={setEnforceSoftcaps}
                  />
                  <div className="space-y-1">
                    <Label htmlFor="enforce-softcaps" className="font-medium cursor-pointer">
                      Respect Level Caps
                    </Label>
                    <p className="text-xs text-muted-foreground">Soft limits; you can override later</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Checkbox 
                    id="npc-mode" 
                    checked={npcMode}
                    onCheckedChange={setNpcMode}
                  />
                  <div className="space-y-1">
                    <Label htmlFor="npc-mode" className="font-medium cursor-pointer">
                      NPC Generation Mode
                    </Label>
                    <p className="text-xs text-muted-foreground">Favors breadth over peaks</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Checkbox 
                    id="warn-weakness" 
                    checked={showWeakness}
                    onCheckedChange={setShowWeakness}
                  />
                  <div className="space-y-1">
                    <Label htmlFor="warn-weakness" className="font-medium cursor-pointer">
                      Show Build Weakness Analysis
                    </Label>
                    <p className="text-xs text-muted-foreground">Explains what's computed</p>
                  </div>
                </div>
              </div>
            </div>
          </details>

          <Separator />

          {/* Action Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
            <Button 
              onClick={generate} 
              size="lg"
              className="w-full sm:w-auto h-14 text-lg font-semibold bg-primary hover:bg-primary/90 shadow-lg px-8"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Forge Character
            </Button>
            
            <div className="flex gap-3">
              <Button 
                variant="ghost" 
                onClick={clearForm}
                className="flex items-center gap-2"
              >
                <Plus size={16} />
                New
              </Button>
              <Button 
                variant="ghost" 
                onClick={exportMarkdown}
                disabled={!character}
                className="flex items-center gap-2"
              >
                <Download size={16} />
                Export
              </Button>
              <Button 
                variant="ghost" 
                onClick={copyMarkdown}
                disabled={!character}
                className="flex items-center gap-2"
              >
                <Copy size={16} />
                Copy
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Character Name Editor - Only show when character exists */}
      {character && (
        <Card className="border-border/50 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="flex-1 space-y-2">
                <Label htmlFor="character-name" className="text-lg font-semibold">Character Name</Label>
                <Input
                  id="character-name"
                  placeholder={`${character.race} ${character.class}`}
                  value={characterName}
                  onChange={(e) => setCharacterName(e.target.value)}
                  className="h-12 text-lg"
                />
                <p className="text-sm text-muted-foreground">
                  Changes auto-save to your roster
                </p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Badge variant="default" className="flex items-center px-3 py-1">
                  <Users className="w-4 h-4 mr-2" />
                  Roster Saved
                </Badge>
                <p className="text-xs text-muted-foreground text-center">
                  {new Date(character.createdAt || Date.now()).toLocaleString()}
                </p>
              </div>
            </div>
            
            {/* Spell Integration for Casters */}
            {casterClasses.includes(character.class) && (
              <div className="mt-6 p-4 bg-accent/5 border border-accent/20 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-accent" />
                  <span className="font-semibold text-lg">Spell Integration</span>
                </div>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Recommended Spells:</strong> {character.recommendedSpellCount || 'Unknown'} 
                    {character.magicPath && <span> • <strong>Path:</strong> {character.magicPath}</span>}
                  </p>
                  <p>
                    Current: {selectedSpells.length} spell{selectedSpells.length !== 1 ? 's' : ''} selected
                    {character.recommendedSpellCount && selectedSpells.length !== character.recommendedSpellCount && (
                      <span className="ml-2 text-amber-600 font-medium">
                        ({selectedSpells.length > character.recommendedSpellCount ? 'over' : 'under'} by {Math.abs(selectedSpells.length - character.recommendedSpellCount)})
                      </span>
                    )}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toast.info('Visit the Spells tab to build this character\'s spellbook.')}
                    className="flex items-center gap-2 text-accent border-accent/40 hover:bg-accent/10"
                  >
                    <Sparkles className="w-4 h-4" />
                    Manage Spellbook
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

          {/* Character Display - Streamlined */}
          {character && (
            <Card className="border-border/50">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <CardTitle className="text-2xl">
                {character.race} {character.class} — Level {character.displayLevel}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge>{buildStyle}</Badge>
                {level === 1 && rookieProfile !== 'off' && (
                  <Badge variant="outline">Rookie: {rookieProfile}</Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Core Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="text-xs text-muted-foreground uppercase tracking-wide">Spirit Points</div>
                <div className="text-2xl font-bold">{character.pools.spirit}</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="text-xs text-muted-foreground uppercase tracking-wide">Active DP</div>
                <div className="text-2xl font-bold">{character.pools.active}</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="text-xs text-muted-foreground uppercase tracking-wide">Passive DP</div>
                <div className="text-2xl font-bold">{character.pools.passive}</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="text-xs text-muted-foreground uppercase tracking-wide">Mastery Die</div>
                <div className="text-2xl font-bold">{character.masteryDie}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Abilities */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold border-b border-border pb-2">Abilities</h3>
                <div className="space-y-3">
                  {abilities.map(ab => {
                    const sp = specialties[ab as keyof typeof specialties].map(s => {
                      const fxList = focuses[s as keyof typeof focuses].map(fx => {
                        const v = fnum(character.focuses[ab][fx])
                        return v ? `${fx} +${v}` : null
                      }).filter(Boolean).join(', ')
                      return `${s} <span class="font-semibold">${character.specialties[ab][s]}</span>${fxList ? ` (${fxList})` : ''}`
                    }).join(', ')
                    return (
                      <div key={ab} className="text-sm">
                        <span className="font-semibold">{ab} {character.abilities[ab]}</span>: {sp}.
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold border-b border-border pb-2">Actions</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>Melee Attack:</strong> {character.actions.meleeAttack}</div>
                  <div><strong>Ranged Attack:</strong> {character.actions.rangedAttack}</div>
                  <div><strong>Perception:</strong> {character.actions.perceptionCheck}</div>
                  {casterClasses.includes(character.class) && (
                    <div><strong>Magic Attack:</strong> {character.actions.magicAttack}</div>
                  )}
                </div>
              </div>

              {/* Build Analysis */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold border-b border-border pb-2">Build Analysis</h3>
                <div className="space-y-2 text-sm">
                  {(() => {
                    const totals = cpTally(character, iconicArcane)
                    const band = levelInfo[character.displayLevel - 1].cpBand
                    return (
                      <>
                        <div><strong>Total CP Value:</strong> {totals.total}</div>
                        <div><strong>Expected Range:</strong> {band[0]} to {band[1]}</div>
                        <div className="text-xs text-muted-foreground">
                          Base: {totals.base} | Abilities: {totals.abilities} | Specialties: {totals.specialties} | Focuses: {totals.focuses} | Advantages: {totals.advantages}
                        </div>
                      </>
                    )
                  })()}
                </div>
                
                {/* Weakness Report */}
                {showWeakness && (() => {
                  const warnings = weaknessReport(character)
                  return warnings.length > 0 && (
                    <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <div className="text-sm font-medium text-destructive mb-2">Build Weaknesses</div>
                      <ul className="text-xs text-destructive space-y-1">
                        {warnings.map((warning, idx) => (
                          <li key={idx}>• {warning}</li>
                        ))}
                      </ul>
                    </div>
                  )
                })()}
              </div>

              {/* Character Traits */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold border-b border-border pb-2">Character Traits</h3>
                
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="font-medium mb-1">Advantages</div>
                    <div className="flex flex-wrap gap-1">
                      {character.advantages.map((adv, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">{adv}</Badge>
                      ))}
                    </div>
                  </div>
                  
                  {character.flaws.length > 0 && (
                    <div>
                      <div className="font-medium mb-1">Flaws</div>
                      <div className="flex flex-wrap gap-1">
                        {character.flaws.map((flaw, idx) => (
                          <Badge key={idx} variant="destructive" className="text-xs">{flaw}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <div className="font-medium mb-1">Class Feats</div>
                    <div className="flex flex-wrap gap-1">
                      {character.classFeats.map((feat, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">{feat}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Spellbook for Casters */}
              {casterClasses.includes(character.class) && (
                <div className="lg:col-span-2 space-y-3">
                  <h3 className="text-lg font-semibold border-b border-border pb-2">
                    Spellbook ({selectedSpells.length} spells)
                    {character.magicPath && <span className="text-sm font-normal text-muted-foreground"> • {character.magicPath}</span>}
                  </h3>
                  {selectedSpells.length > 0 ? (
                    <div className="space-y-4">
                      {(() => {
                        const spellsByPath = selectedSpells.reduce((acc: any, spell: any) => {
                          if (!acc[spell.path]) acc[spell.path] = []
                          acc[spell.path].push(spell)
                          return acc
                        }, {})

                        return Object.entries(spellsByPath).map(([path, spells]: [string, any]) => (
                          <div key={path}>
                            <div className="text-sm font-medium text-muted-foreground mb-2">
                              {path} ({spells.length})
                            </div>
                            <div className="grid gap-2">
                              {spells.map((spell: any) => (
                                <div key={spell.id} className="flex items-center justify-between p-2 bg-muted/30 rounded text-sm">
                                  <div>
                                    <span className="font-medium">{spell.name}</span>
                                    <span className="text-muted-foreground ml-2">({spell.category})</span>
                                  </div>
                                  <div className="flex gap-1">
                                    <Badge className={
                                      spell.rarity === 'Common' ? 'bg-slate-200 text-slate-800' :
                                      spell.rarity === 'Uncommon' ? 'bg-blue-200 text-blue-800' :
                                      'bg-purple-200 text-purple-800'
                                    } border text-xs>
                                      {spell.rarity}
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))
                      })()}
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-muted/20 rounded-lg">
                      <Sparkles className="mx-auto mb-2 opacity-40" size={24} />
                      <p className="text-sm text-muted-foreground">No spells selected</p>
                      <p className="text-xs text-muted-foreground">Visit the Spells tab to build your spellbook</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
export default PlayerCharacterGenerator