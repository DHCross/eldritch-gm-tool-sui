import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User } from "@phosphor-icons/react"
import { toast } from 'sonner'

interface NPCCharacter {
  gender: string
  race: string
  role: string
  level: number
  abilities: Record<string, string>
  specialties: Record<string, Record<string, string>>
  focuses: Record<string, Record<string, string>>
  defensePools: {
    activeDefense: number
    passiveDefense: number
  }
  spiritPoints: number
  masteryDie: string
  armor: string
  actions: Record<string, string>
  iconicItem: {
    type: string
    properties: string
    details?: string
    potency?: string
    rarity?: string
    energyPoints?: number
    activationCost?: number
  }
}

// Data Definitions
const genders = ["Male", "Female"]
const races = ["Human", "Elf", "Dwarf", "Gnome", "Half-Elf", "Half-Orc", "Halfling", "Drakkin"]
const roles = ["Warrior", "Rogue", "Assassin", "Adept", "Mage", "Mystic", "Theurgist", "Barbarian"]
const levels = [1, 2, 3, 4, 5]
const abilities = ["Competence", "Prowess", "Fortitude"]
const dieRanks = ["d4", "d6", "d8", "d10", "d12"]

const dieValues = {
  "d4": 4,
  "d6": 6,
  "d8": 8,
  "d10": 10,
  "d12": 12
}

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

const rarities = ["Common", "Uncommon", "Esoteric", "Occult", "Legendary"]
const potencyLevels = ["d4", "d6", "d8", "d10", "d12"]

// Energy Points based on Rarity
const energyPointsByRarity = {
  "Common": 8,
  "Uncommon": 12,
  "Esoteric": 16,
  "Occult": 20,
  "Legendary": 30
}

// Minimum Die-Ranks for Races
const raceMinimums = {
  "Human": {
    "Competence": "d6",
    "Prowess": "d6",
    "Fortitude": "d4",
    "Willpower": "d6"
  },
  "Elf": {
    "Competence": "d6",
    "Prowess": "d8",
    "Fortitude": "d4",
    "Willpower": "d6"
  },
  "Dwarf": {
    "Competence": "d6",
    "Prowess": "d6",
    "Fortitude": "d8",
    "Willpower": "d4"
  },
  "Gnome": {
    "Competence": "d6",
    "Prowess": "d4",
    "Fortitude": "d6",
    "Willpower": "d6"
  },
  "Half-Elf": {
    "Competence": "d6",
    "Prowess": "d6",
    "Fortitude": "d6",
    "Willpower": "d6"
  },
  "Half-Orc": {
    "Competence": "d6",
    "Prowess": "d8",
    "Fortitude": "d6",
    "Willpower": "d4"
  },
  "Halfling": {
    "Competence": "d6",
    "Prowess": "d4",
    "Fortitude": "d4",
    "Willpower": "d6"
  },
  "Drakkin": {
    "Competence": "d6",
    "Prowess": "d6",
    "Fortitude": "d6",
    "Willpower": "d6"
  }
}

// Minimum Die-Ranks for Roles (Classes)
const roleMinimums = {
  "Warrior": {
    "Prowess": "d8",
    "Melee": "d6",
    "Fortitude": "d6"
  },
  "Rogue": {
    "Prowess": "d6",
    "Agility": "d6",
    "Fortitude": "d4"
  },
  "Assassin": {
    "Prowess": "d6",
    "Agility": "d6",
    "Melee": "d4",
    "Fortitude": "d4"
  },
  "Adept": {
    "Competence": "d6",
    "Expertise": "d6",
    "Willpower": "d6"
  },
  "Mage": {
    "Competence": "d8",
    "Expertise": "d6",
    "Willpower": "d8"
  },
  "Mystic": {
    "Competence": "d6",
    "Expertise": "d6",
    "Willpower": "d8"
  },
  "Theurgist": {
    "Competence": "d8",
    "Expertise": "d6",
    "Willpower": "d8"
  },
  "Barbarian": {
    "Prowess": "d8",
    "Melee": "d6",
    "Fortitude": "d6"
  }
}

function NPCGenerator() {
  const [gender, setGender] = useState<string>('')
  const [race, setRace] = useState<string>('')
  const [role, setRole] = useState<string>('')
  const [level, setLevel] = useState<number | null>(null)
  const [includeMagic, setIncludeMagic] = useState<boolean>(false)
  const [character, setCharacter] = useState<NPCCharacter | null>(null)

  // Utility Functions
  function getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)]
  }

  function getDieValue(dieRank: string): number {
    return dieValues[dieRank as keyof typeof dieValues] || 4
  }

  function getHigherDieRank(die1: string, die2: string): string {
    return getDieValue(die1) >= getDieValue(die2) ? die1 : die2
  }

  function increaseDieRank(obj: Record<string, any>, key: string): void {
    const currentRank = obj[key]
    const currentIndex = dieRanks.indexOf(currentRank)
    if (currentIndex < dieRanks.length - 1) {
      obj[key] = dieRanks[currentIndex + 1]
    }
  }

  function assignAbilities(character: NPCCharacter): void {
    // Start with base minimums from race
    const raceMins = raceMinimums[character.race as keyof typeof raceMinimums] || {}
    
    abilities.forEach(ability => {
      const minDieRank = raceMins[ability] || "d4"
      character.abilities[ability] = minDieRank
      character.specialties[ability] = {}
      
      specialties[ability as keyof typeof specialties].forEach(specialty => {
        const roleMin = roleMinimums[character.role as keyof typeof roleMinimums][specialty] || "d4"
        character.specialties[ability][specialty] = getHigherDieRank(minDieRank, roleMin)
        character.focuses[specialty] = {}
        
        focuses[specialty as keyof typeof focuses].forEach(focus => {
          character.focuses[specialty][focus] = `+${Math.floor(character.level / 2) || 1}`
        })
      })
    })

    // Increase die ranks based on level
    for (let i = 1; i < character.level; i++) {
      if (character.role === "Warrior" || character.role === "Barbarian") {
        increaseDieRank(character.abilities, "Prowess")
        increaseDieRank(character.specialties.Prowess, "Melee")
      }
      if (["Mage", "Mystic", "Theurgist", "Adept"].includes(character.role)) {
        increaseDieRank(character.abilities, "Competence")
        increaseDieRank(character.specialties.Competence, "Expertise")
      }
      if (character.role === "Rogue" || character.role === "Assassin") {
        increaseDieRank(character.abilities, "Prowess")
        increaseDieRank(character.specialties.Prowess, "Agility")
      }
    }

    // Ensure specialties are at least as high as their parent ability
    abilities.forEach(ability => {
      specialties[ability as keyof typeof specialties].forEach(specialty => {
        if (getDieValue(character.specialties[ability][specialty]) < getDieValue(character.abilities[ability])) {
          character.specialties[ability][specialty] = character.abilities[ability]
        }
      })
    })
  }

  function calculateDefensePools(character: NPCCharacter) {
    const prowessDie = character.abilities.Prowess
    const agility = character.specialties.Prowess.Agility
    const melee = character.specialties.Prowess.Melee
    const fortitudeDie = character.abilities.Fortitude
    const endurance = character.specialties.Fortitude.Endurance
    const strength = character.specialties.Fortitude.Strength

    const activeDefense = getDieValue(prowessDie) + getDieValue(agility) + getDieValue(melee)
    const passiveDefense = getDieValue(fortitudeDie) + getDieValue(endurance) + getDieValue(strength)

    return { activeDefense, passiveDefense }
  }

  function calculateSpiritPoints(character: NPCCharacter): number {
    const competenceDie = character.abilities.Competence
    const willpower = character.specialties.Fortitude.Willpower
    return getDieValue(competenceDie) + getDieValue(willpower)
  }

  function getMasteryDie(level: number): string {
    const masteryDice = ["d4", "d6", "d8", "d10", "d12"]
    return masteryDice[Math.min(level - 1, masteryDice.length - 1)]
  }

  function getArmor(level: number): string {
    const armorGrades = ["d4", "d6", "d8", "d10", "d12"]
    return armorGrades[Math.min(Math.floor(level / 2), armorGrades.length - 1)]
  }

  function calculateActions(character: NPCCharacter) {
    return {
      meleeAttack: `${character.abilities.Prowess} + ${character.specialties.Prowess.Melee} + Focus Bonus`,
      rangedAttack: `${character.abilities.Prowess} + ${character.specialties.Prowess.Precision} + Focus Bonus`,
      magicAttack: `${character.abilities.Competence} + ${character.specialties.Competence.Expertise} + Focus Bonus`,
      perceptionCheck: `${character.abilities.Competence} + ${character.specialties.Competence.Perception} + Focus Bonus`
    }
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

  function generateIconicItem(character: NPCCharacter, includeMagic: boolean) {
    let item = { type: "", properties: "No special properties." } as NPCCharacter['iconicItem']

    // Determine the type of Iconic Item based on role
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
        item.potency = getRandomElement(potencyLevels)
        item.rarity = determineRarity(item.potency)
        item.energyPoints = energyPointsByRarity[item.rarity as keyof typeof energyPointsByRarity]
        item.activationCost = 1
      } else {
        item.details = "A personalized weapon of great significance to the character. Can trigger 'Master Twist' when used with a mastery die."
      }
    } else if (["Mage", "Mystic", "Theurgist", "Adept"].includes(character.role)) {
      item.type = "Iconic Magic Focus"
      if (includeMagic) {
        const magicEffects = [
          { effect: "Activate", description: "Allows casting of specific spells (e.g., teleportation)." },
          { effect: "Restore", description: "Augments healing spells, restoring more health." },
          { effect: "Protect", description: "Strengthens defensive spells, providing better protection." }
        ]
        const selectedEffect = getRandomElement(magicEffects)
        item.properties = `Magic Effect: ${selectedEffect.effect} - ${selectedEffect.description}`
        item.potency = getRandomElement(potencyLevels)
        item.rarity = determineRarity(item.potency)
        item.energyPoints = energyPointsByRarity[item.rarity as keyof typeof energyPointsByRarity]
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
        item.potency = getRandomElement(potencyLevels)
        item.rarity = determineRarity(item.potency)
        item.energyPoints = energyPointsByRarity[item.rarity as keyof typeof energyPointsByRarity]
        item.activationCost = 1
      } else {
        item.details = "An item of sentimental or historical value. Functions as Inspirational Aid, granting +1 bonus per character level to specific ability tests or feats."
      }
    }
    return item
  }

  function generateCharacter() {
    if (!race || !role || !level) {
      toast.error("Please select a race, role, and level before generating a character.")
      return
    }

    let finalGender: string
    if (gender === "Random" || !gender) {
      finalGender = getRandomElement(genders)
    } else {
      finalGender = gender
    }

    const character: NPCCharacter = {
      gender: finalGender,
      role: role,
      race: race,
      level: level,
      abilities: {},
      specialties: {},
      focuses: {},
      defensePools: { activeDefense: 0, passiveDefense: 0 },
      spiritPoints: 0,
      masteryDie: '',
      armor: '',
      actions: {},
      iconicItem: { type: '', properties: '' }
    }

    assignAbilities(character)
    character.defensePools = calculateDefensePools(character)
    character.spiritPoints = calculateSpiritPoints(character)
    character.masteryDie = getMasteryDie(character.level)
    character.armor = getArmor(character.level)
    character.actions = calculateActions(character)
    character.iconicItem = generateIconicItem(character, includeMagic)

    setCharacter(character)
    toast.success("NPC generated successfully!")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            NPC Generator
          </CardTitle>
          <Alert>
            <AlertDescription>
              Generate detailed Non-Player Characters for your Eldritch RPG campaigns. 
              NPCs are built with simplified rules focusing on role-appropriate abilities and iconic items.
            </AlertDescription>
          </Alert>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
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

            <div>
              <Label htmlFor="race">Race</Label>
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
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(r => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="level">Level</Label>
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
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="includeMagic" 
              checked={includeMagic} 
              onCheckedChange={setIncludeMagic}
            />
            <Label htmlFor="includeMagic">Include Magical Properties for Iconic Items</Label>
          </div>

          <Button onClick={generateCharacter} className="w-full">
            Generate NPC
          </Button>
        </CardContent>
      </Card>

      {character && (
        <Card>
          <CardHeader>
            <CardTitle>
              Level {character.level} {character.gender} {character.race} {character.role}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Core Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-muted rounded-lg p-3 text-center">
                  <div className="text-xs text-muted-foreground">Spirit Points</div>
                  <div className="text-xl font-bold">{character.spiritPoints}</div>
                </div>
                <div className="bg-muted rounded-lg p-3 text-center">
                  <div className="text-xs text-muted-foreground">Active DP</div>
                  <div className="text-xl font-bold">{character.defensePools.activeDefense}</div>
                </div>
                <div className="bg-muted rounded-lg p-3 text-center">
                  <div className="text-xs text-muted-foreground">Passive DP</div>
                  <div className="text-xl font-bold">{character.defensePools.passiveDefense}</div>
                </div>
                <div className="bg-muted rounded-lg p-3 text-center">
                  <div className="text-xs text-muted-foreground">Mastery Die</div>
                  <div className="text-xl font-bold">{character.masteryDie}</div>
                </div>
              </div>

              {/* Abilities */}
              <div>
                <h3 className="font-semibold mb-3">Abilities</h3>
                <div className="space-y-2 text-sm">
                  {abilities.map(ability => {
                    const specs = specialties[ability as keyof typeof specialties]
                    const specText = specs.map(spec => {
                      const focusNames = focuses[spec as keyof typeof focuses]
                      const focusValues = focusNames.map(focus => {
                        const value = character.focuses[spec]?.[focus] || '+0'
                        return value !== '+0' ? `${focus} ${value}` : null
                      }).filter(Boolean)
                      
                      return `${spec} **${character.specialties[ability][spec]}**${focusValues.length ? ` (${focusValues.join(', ')})` : ''}`
                    }).join(', ')
                    
                    return (
                      <div key={ability}>
                        <strong>{ability} {character.abilities[ability]}</strong> → {specText}.
                      </div>
                    )
                  })}
                </div>
                
                <div className="mt-4 text-sm">
                  <strong>Armor:</strong> {character.armor}
                </div>
              </div>

              {/* Actions */}
              <div>
                <h3 className="font-semibold mb-3">Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div><strong>Melee Attack:</strong> {character.actions.meleeAttack}</div>
                  <div><strong>Ranged Attack:</strong> {character.actions.rangedAttack}</div>
                  <div><strong>Magic Attack:</strong> {character.actions.magicAttack}</div>
                  <div><strong>Perception Check:</strong> {character.actions.perceptionCheck}</div>
                </div>
              </div>

              {/* Iconic Item */}
              {character.iconicItem && (
                <Card className="bg-accent/20 border-accent">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{character.iconicItem.type}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {character.iconicItem.details && (
                      <div><strong>Details:</strong> {character.iconicItem.details}</div>
                    )}
                    {character.iconicItem.properties !== "No special properties." && (
                      <>
                        <div><strong>{character.iconicItem.properties}</strong></div>
                        {character.iconicItem.potency && (
                          <>
                            <div><strong>Potency:</strong> {character.iconicItem.potency}, <strong>Rarity:</strong> {character.iconicItem.rarity}</div>
                            <div><strong>Energy Points:</strong> {character.iconicItem.energyPoints}, <strong>Activation Cost:</strong> {character.iconicItem.activationCost} energy point(s)</div>
                          </>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default NPCGenerator