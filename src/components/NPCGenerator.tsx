import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

const genders = ["Male", "Female"]
const races = ["Human", "Elf", "Dwarf", "Gnome", "Half-Elf", "Half-Orc", "Halfling", "Drakkin"]
const roles = ["Warrior", "Rogue", "Adept", "Mage", "Mystic", "Theurgist", "Barbarian", "Assassin"]
const levels = [1, 2, 3, 4, 5]
const abilities = ["Competence", "Prowess", "Fortitude"]
const dieRanks = ["d4", "d6", "d8", "d10", "d12"]

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

// Minimum requirements for races
const raceMinimums = {
  Human: { Competence: "d6", Prowess: "d6", Fortitude: "d4", Willpower: "d6" },
  Elf: { Competence: "d6", Prowess: "d8", Fortitude: "d4", Willpower: "d6" },
  Dwarf: { Competence: "d6", Prowess: "d6", Fortitude: "d8", Willpower: "d4" },
  Gnome: { Competence: "d6", Prowess: "d4", Fortitude: "d6", Willpower: "d6" },
  "Half-Elf": { Competence: "d6", Prowess: "d6", Fortitude: "d6", Willpower: "d6" },
  "Half-Orc": { Competence: "d6", Prowess: "d8", Fortitude: "d6", Willpower: "d4" },
  Halfling: { Competence: "d6", Prowess: "d4", Fortitude: "d4", Willpower: "d6" },
  Drakkin: { Competence: "d6", Prowess: "d6", Fortitude: "d6", Willpower: "d6" }
}

// Minimum requirements for roles
const roleMinimums = {
  Warrior: { Prowess: "d8", Melee: "d6", Fortitude: "d6" },
  Rogue: { Prowess: "d6", Agility: "d6", Fortitude: "d4" },
  Adept: { Competence: "d6", Expertise: "d6", Willpower: "d6" },
  Mage: { Competence: "d8", Expertise: "d6", Willpower: "d8" },
  Mystic: { Competence: "d6", Expertise: "d6", Willpower: "d8" },
  Theurgist: { Competence: "d8", Expertise: "d6", Willpower: "d8" },
  Barbarian: { Prowess: "d8", Melee: "d6", Fortitude: "d6" },
  Assassin: { Prowess: "d6", Agility: "d8", Adroitness: "d6" }
}

const magicRoles = ["Adept", "Mage", "Mystic", "Theurgist"]

interface NPCCharacter {
  gender: string
  race: string
  role: string
  level: number
  abilities: Record<string, string>
  specialties: Record<string, Record<string, string>>
  focuses: Record<string, Record<string, string>>
  defensePools: { active: number; passive: number }
  spiritPoints: number
  masteryDie: string
  armor: string
  actions: Record<string, string>
  iconicItem?: {
    type: string
    properties: string
    details?: string
    potency?: string
    rarity?: string
    energyPoints?: number
    activationCost?: number
  }
}

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

function getDieValue(dieRank: string): number {
  const match = dieRank.match(/d(\d+)/)
  return match ? parseInt(match[1], 10) : 4
}

function getHigherDieRank(die1: string, die2: string): string {
  return getDieValue(die1) >= getDieValue(die2) ? die1 : die2
}

function increaseDieRank(obj: Record<string, string>, key: string): void {
  const currentRank = obj[key]
  const currentIndex = dieRanks.indexOf(currentRank)
  if (currentIndex < dieRanks.length - 1) {
    obj[key] = dieRanks[currentIndex + 1]
  }
}

export default function NPCGenerator() {
  const [gender, setGender] = useState('')
  const [race, setRace] = useState('')
  const [role, setRole] = useState('')
  const [level, setLevel] = useState<number>(1)
  const [includeMagic, setIncludeMagic] = useState(false)
  const [character, setCharacter] = useState<NPCCharacter | null>(null)

  function generateIconicItem(character: NPCCharacter, includeMagic: boolean) {
    const item: any = { type: "", properties: "No special properties." }

    // Determine item type based on role
    if (["Warrior", "Barbarian", "Rogue", "Assassin"].includes(character.role)) {
      item.type = "Iconic Weapon"
      if (includeMagic) {
        const magicEffects = [
          { effect: "Harm", description: "Inflicts additional elemental damage (e.g., fire, ice)." },
          { effect: "Afflict", description: "Has a chance to inflict status ailments (e.g., paralysis)." },
          { effect: "Modify", description: "Enhances weapon's sharpness, increasing damage output." }
        ]
        const selectedEffect = getRandomElement(magicEffects)
        item.properties = `Magic Effect: ${selectedEffect.effect} - ${selectedEffect.description}`
        item.potency = getRandomElement(["d4", "d6", "d8", "d10", "d12"])
        item.rarity = determineRarity(item.potency)
        item.energyPoints = getEnergyPoints(item.rarity)
        item.activationCost = 1
      } else {
        item.details = "A personalized weapon of great significance to the character. Can trigger 'Master Twist' when used with a mastery die."
      }
    } else if (magicRoles.includes(character.role)) {
      item.type = "Iconic Magic Focus"
      if (includeMagic) {
        const magicEffects = [
          { effect: "Activate", description: "Allows casting of specific spells (e.g., teleportation)." },
          { effect: "Restore", description: "Augments healing spells, restoring more health." },
          { effect: "Protect", description: "Strengthens defensive spells, providing better protection." }
        ]
        const selectedEffect = getRandomElement(magicEffects)
        item.properties = `Magic Effect: ${selectedEffect.effect} - ${selectedEffect.description}`
        item.potency = getRandomElement(["d4", "d6", "d8", "d10", "d12"])
        item.rarity = determineRarity(item.potency)
        item.energyPoints = getEnergyPoints(item.rarity)
        item.activationCost = 1
      } else {
        item.details = "A personalized grimoire or focus significant to the character. Can trigger 'Master Twist' when used with a mastery die."
      }
    } else {
      item.type = "Iconic Inspirational Item"
      if (includeMagic) {
        const magicEffects = [
          { effect: "Modify", description: "Enhances attributes (e.g., increased agility)." },
          { effect: "Afflict", description: "Can impose disadvantages on opponents in social encounters." },
          { effect: "Activate", description: "Triggers specific events (e.g., unlocking hidden doors)." }
        ]
        const selectedEffect = getRandomElement(magicEffects)
        item.properties = `Magic Effect: ${selectedEffect.effect} - ${selectedEffect.description}`
        item.potency = getRandomElement(["d4", "d6", "d8", "d10", "d12"])
        item.rarity = determineRarity(item.potency)
        item.energyPoints = getEnergyPoints(item.rarity)
        item.activationCost = 1
      } else {
        item.details = "An item of sentimental or historical value. Functions as Inspirational Aid, granting +1 bonus per character level to specific ability tests or feats."
      }
    }
    
    return item
  }

  function determineRarity(potency: string): string {
    switch (potency) {
      case "d4": return "Common"
      case "d6": return "Uncommon"
      case "d8": return "Esoteric"
      case "d10": return "Occult"
      case "d12": return "Legendary"
      default: return "Common"
    }
  }

  function getEnergyPoints(rarity: string): number {
    const energyPointsByRarity = {
      "Common": 8,
      "Uncommon": 12,
      "Esoteric": 16,
      "Occult": 20,
      "Legendary": 30
    }
    return energyPointsByRarity[rarity as keyof typeof energyPointsByRarity] || 8
  }

  function generateCharacter() {
    if (!race || !role || !level) {
      toast.error("Please select race, role, and level before generating")
      return
    }

    const selectedGender = gender === "Random" || !gender ? getRandomElement(genders) : gender

    const character: NPCCharacter = {
      gender: selectedGender,
      race,
      role,
      level,
      abilities: {},
      specialties: {},
      focuses: {},
      defensePools: { active: 0, passive: 0 },
      spiritPoints: 0,
      masteryDie: dieRanks[Math.min(level - 1, dieRanks.length - 1)],
      armor: dieRanks[Math.min(Math.floor(level / 2), dieRanks.length - 1)],
      actions: {}
    }

    // Initialize abilities and specialties
    for (const ability of abilities) {
      const raceMin = (raceMinimums as any)[race]?.[ability] || "d4"
      character.abilities[ability] = raceMin
      character.specialties[ability] = {}
      character.focuses[ability] = {}

      for (const specialty of (specialties as any)[ability]) {
        const roleMin = (roleMinimums as any)[role]?.[specialty] || "d4"
        character.specialties[ability][specialty] = getHigherDieRank(raceMin, roleMin)

        character.focuses[ability][specialty] = {}
        for (const focus of (focuses as any)[specialty]) {
          character.focuses[ability][specialty][focus] = `+${Math.max(1, Math.floor(level / 2))}`
        }
      }
    }

    // Improve abilities based on level and role
    for (let i = 1; i < level; i++) {
      if (["Warrior", "Barbarian"].includes(role)) {
        increaseDieRank(character.abilities, "Prowess")
        increaseDieRank(character.specialties.Prowess, "Melee")
      } else if (magicRoles.includes(role)) {
        increaseDieRank(character.abilities, "Competence")
        increaseDieRank(character.specialties.Competence, "Expertise")
      } else if (["Rogue", "Assassin"].includes(role)) {
        increaseDieRank(character.abilities, "Prowess")
        increaseDieRank(character.specialties.Prowess, "Agility")
      }
    }

    // Ensure specialties are at least as high as their parent ability
    for (const ability of abilities) {
      for (const specialty of (specialties as any)[ability]) {
        if (getDieValue(character.specialties[ability][specialty]) < getDieValue(character.abilities[ability])) {
          character.specialties[ability][specialty] = character.abilities[ability]
        }
      }
    }

    // Calculate defense pools and spirit points
    character.defensePools = {
      active: getDieValue(character.abilities.Prowess) + 
              getDieValue(character.specialties.Prowess.Agility) + 
              getDieValue(character.specialties.Prowess.Melee),
      passive: getDieValue(character.abilities.Fortitude) + 
               getDieValue(character.specialties.Fortitude.Endurance) + 
               getDieValue(character.specialties.Fortitude.Strength)
    }

    character.spiritPoints = getDieValue(character.abilities.Competence) + 
                            getDieValue(character.specialties.Fortitude.Willpower)

    // Calculate actions
    character.actions = {
      meleeAttack: `${character.abilities.Prowess} + ${character.specialties.Prowess.Melee} + Focus Bonus`,
      rangedAttack: `${character.abilities.Prowess} + ${character.specialties.Prowess.Precision} + Focus Bonus`,
      perceptionCheck: `${character.abilities.Competence} + ${character.specialties.Competence.Perception} + Focus Bonus`
    }

    if (magicRoles.includes(role)) {
      character.actions.magicAttack = `${character.abilities.Competence} + ${character.specialties.Competence.Expertise} + Focus Bonus`
    }

    // Generate iconic item
    character.iconicItem = generateIconicItem(character, includeMagic)

    setCharacter(character)
    toast.success("NPC generated successfully!")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>NPC Generator</CardTitle>
        <CardDescription>
          Quickly generate NPCs for your Eldritch RPG campaigns
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Generation Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger>
                <SelectValue placeholder="Random" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Random">Random</SelectItem>
                {genders.map(g => (
                  <SelectItem key={g} value={g}>{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map(r => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
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
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="include-magic" 
            checked={includeMagic}
            onCheckedChange={(checked) => setIncludeMagic(checked as boolean)}
          />
          <Label htmlFor="include-magic">Include Magical Properties for Iconic Items</Label>
        </div>

        <Button onClick={generateCharacter} className="w-full">
          Generate NPC
        </Button>

        {/* Character Display */}
        {character && (
          <div className="space-y-4 border-t pt-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold">
                Level {character.level} {character.gender} {character.race} {character.role}
              </h3>
            </div>

            {/* Core Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-secondary/50 rounded-lg p-3">
                <div className="text-xs text-muted-foreground">Spirit Points</div>
                <div className="text-xl font-bold">{character.spiritPoints}</div>
              </div>
              <div className="bg-secondary/50 rounded-lg p-3">
                <div className="text-xs text-muted-foreground">Active DP</div>
                <div className="text-xl font-bold">{character.defensePools.active}</div>
              </div>
              <div className="bg-secondary/50 rounded-lg p-3">
                <div className="text-xs text-muted-foreground">Passive DP</div>
                <div className="text-xl font-bold">{character.defensePools.passive}</div>
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
                <div className="space-y-2 text-sm">
                  {abilities.map(ability => {
                    const specs = (specialties as any)[ability].map((spec: string) => {
                      const focusEntries = Object.entries(character.focuses[ability][spec] || {})
                      const focusString = focusEntries.length > 0 ? ` (${focusEntries.map(([focus, value]) => `${focus} ${value}`).join(', ')})` : ''
                      return `${spec} ${character.specialties[ability][spec]}${focusString}`
                    }).join(', ')
                    
                    return (
                      <div key={ability}>
                        <strong>{ability} {character.abilities[ability]}</strong> → {specs}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Actions */}
              <div>
                <h4 className="font-semibold mb-2">Actions</h4>
                <ul className="space-y-1 text-sm">
                  {Object.entries(character.actions).map(([name, value]) => (
                    <li key={name}>
                      <strong>{name.replace(/([A-Z])/g, ' $1').trim()}:</strong> {value}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Iconic Item */}
              {character.iconicItem && (
                <div className="lg:col-span-2">
                  <h4 className="font-semibold mb-2">{character.iconicItem.type}</h4>
                  <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 space-y-2">
                    {character.iconicItem.details && (
                      <p className="text-sm"><strong>Details:</strong> {character.iconicItem.details}</p>
                    )}
                    {character.iconicItem.properties !== "No special properties." && (
                      <>
                        <p className="text-sm"><strong>{character.iconicItem.properties}</strong></p>
                        {character.iconicItem.potency && (
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline">Potency: {character.iconicItem.potency}</Badge>
                            <Badge variant="outline">Rarity: {character.iconicItem.rarity}</Badge>
                            <Badge variant="outline">Energy Points: {character.iconicItem.energyPoints}</Badge>
                            <Badge variant="outline">Activation Cost: {character.iconicItem.activationCost}</Badge>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}