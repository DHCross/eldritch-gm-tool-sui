import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  RACES, 
  CLASSES, 
  LEVELS, 
  DICE_RANKS,
  SPECIALTIES,
  FOCUSES,
  RACE_MINIMA,
  CLASS_MINIMA,
  CASTER_CLASSES,
  MAGIC_PATHS_BY_CLASS,
  LEVEL_INFO
} from '@/data/gameData'
import { 
  calculateDefensePools, 
  getDieValue, 
  getDieRankIndex, 
  upgradeDieRank, 
  getFocusValue,
  generateRandomName,
  getRandomElement
} from '@/utils/gameUtils'

interface NPCCharacter {
  gender: string
  name: string
  race: string
  class: string
  level: number
  abilities: Record<string, string>
  specialties: Record<string, Record<string, string>>
  focuses: Record<string, Record<string, string>>
  pools: { active: number, passive: number, spirit: number }
  masteryDie: string
  equipment: string[]
  notes: string
}

const NPCGenerator: React.FC = () => {
  const [settings, setSettings] = useState({
    gender: 'Random',
    race: '',
    class: '',
    level: 1,
    includeMagic: false
  })

  const [generatedNPC, setGeneratedNPC] = useState<NPCCharacter | null>(null)

  const generateNPC = () => {
    if (!settings.race || !settings.class) {
      alert('Please select a race and class before generating an NPC.')
      return
    }

    // Determine gender
    const gender = settings.gender === 'Random' 
      ? getRandomElement(['Male', 'Female'])
      : settings.gender

    // Generate name
    const name = generateRandomName(gender.toLowerCase() as 'male' | 'female')

    // Initialize character structure
    const character: NPCCharacter = {
      gender,
      name,
      race: settings.race,
      class: settings.class,
      level: settings.level,
      abilities: {},
      specialties: {},
      focuses: {},
      pools: { active: 0, passive: 0, spirit: 0 },
      masteryDie: LEVEL_INFO[settings.level - 1].masteryDie,
      equipment: [],
      notes: ''
    }

    // Initialize abilities, specialties, and focuses
    for (const ability of ['Competence', 'Prowess', 'Fortitude']) {
      character.abilities[ability] = 'd4'
      character.specialties[ability] = {}
      character.focuses[ability] = {}
      
      const specs = SPECIALTIES[ability as keyof typeof SPECIALTIES]
      for (const specialty of specs) {
        character.specialties[ability][specialty] = 'd4'
        
        const foci = FOCUSES[specialty as keyof typeof FOCUSES]
        for (const focus of foci) {
          character.focuses[ability][focus] = '+0'
        }
      }
    }

    // Apply racial minimums
    applyMinima(character, RACE_MINIMA[settings.race as keyof typeof RACE_MINIMA] || {})
    
    // Apply class minimums
    applyMinima(character, CLASS_MINIMA[settings.class as keyof typeof CLASS_MINIMA] || {})

    // Improve based on level
    improveForLevel(character, settings.level, settings.class)

    // Calculate defense pools
    character.pools = calculateDefensePools(character)

    // Generate equipment
    character.equipment = generateEquipment(settings.class, settings.level)

    // Add notes for magic users
    if (CASTER_CLASSES.includes(settings.class as any)) {
      const paths = MAGIC_PATHS_BY_CLASS[settings.class as keyof typeof MAGIC_PATHS_BY_CLASS]
      if (paths) {
        character.notes = `Magic Path(s): ${paths.join(', ')}`
      }
    }

    setGeneratedNPC(character)
  }

  const applyMinima = (character: NPCCharacter, minima: Record<string, string>) => {
    for (const [key, value] of Object.entries(minima)) {
      if (['Competence', 'Prowess', 'Fortitude'].includes(key)) {
        // Ability minimum
        const currentRank = getDieRankIndex(character.abilities[key])
        const minimumRank = getDieRankIndex(value)
        if (minimumRank > currentRank) {
          character.abilities[key] = value
        }
      } else {
        // Find parent ability for specialty
        let parentAbility = ''
        for (const [ability, specs] of Object.entries(SPECIALTIES)) {
          if (specs.includes(key as any)) {
            parentAbility = ability
            break
          }
        }

        if (parentAbility) {
          // Specialty minimum
          const currentRank = getDieRankIndex(character.specialties[parentAbility][key])
          const minimumRank = getDieRankIndex(value)
          if (minimumRank > currentRank) {
            character.specialties[parentAbility][key] = value
          }
        } else {
          // Focus minimum
          let parentSpecialty = ''
          let parentAbility = ''
          for (const [specialty, foci] of Object.entries(FOCUSES)) {
            if (foci.includes(key as any)) {
              parentSpecialty = specialty
              break
            }
          }
          
          if (parentSpecialty) {
            for (const [ability, specs] of Object.entries(SPECIALTIES)) {
              if (specs.includes(parentSpecialty as any)) {
                parentAbility = ability
                break
              }
            }
            
            if (parentAbility) {
              const currentValue = getFocusValue(character.focuses[parentAbility][key])
              const minimumValue = getFocusValue(value)
              if (minimumValue > currentValue) {
                character.focuses[parentAbility][key] = value
              }
            }
          }
        }
      }
    }
  }

  const improveForLevel = (character: NPCCharacter, level: number, charClass: string) => {
    // Apply improvements based on class and level
    const improvements = level - 1

    const classImprovementOrder = {
      Warrior: ['Prowess', 'Melee', 'Strength', 'Fortitude'],
      Barbarian: ['Prowess', 'Melee', 'Strength', 'Fortitude'],
      Rogue: ['Prowess', 'Agility', 'Adroitness', 'Competence'],
      Assassin: ['Prowess', 'Agility', 'Melee', 'Adroitness'],
      Mage: ['Competence', 'Expertise', 'Wizardry', 'Fortitude'],
      Mystic: ['Fortitude', 'Willpower', 'Competence', 'Expertise'],
      Adept: ['Competence', 'Expertise', 'Adroitness', 'Perception'],
      Theurgist: ['Competence', 'Expertise', 'Theurgy', 'Fortitude']
    }

    const order = classImprovementOrder[charClass as keyof typeof classImprovementOrder] || ['Competence', 'Prowess', 'Fortitude']

    for (let i = 0; i < improvements * 2; i++) {
      const target = order[i % order.length]
      
      if (['Competence', 'Prowess', 'Fortitude'].includes(target)) {
        // Upgrade ability
        const currentRank = character.abilities[target]
        if (currentRank !== 'd12') {
          character.abilities[target] = upgradeDieRank(currentRank)
        }
      } else {
        // Find and upgrade specialty or focus
        let found = false
        for (const [ability, specs] of Object.entries(character.specialties)) {
          if (specs[target]) {
            const currentRank = specs[target]
            if (currentRank !== 'd12') {
              character.specialties[ability][target] = upgradeDieRank(currentRank)
              found = true
              break
            }
          }
        }
        
        if (!found) {
          // Try to upgrade as focus
          for (const [ability, foci] of Object.entries(character.focuses)) {
            if (foci[target]) {
              const currentValue = getFocusValue(foci[target])
              if (currentValue < 5) {
                character.focuses[ability][target] = `+${currentValue + 1}`
                break
              }
            }
          }
        }
      }
    }
  }

  const generateEquipment = (charClass: string, level: number): string[] => {
    const baseEquipment = [
      'Set of ordinary clothes',
      'Purse of coins',
      'Backpack',
      'Small dagger',
      'Rations',
      'Waterskin'
    ]

    const classEquipment = {
      Warrior: ['Weapon of choice', 'Armor', 'Shield'],
      Barbarian: ['Tribal garments', 'Primitive weapons'],
      Rogue: ['Thieves\' tools', 'Light armor', 'Lockpicks'],
      Assassin: ['Dark clothing', 'Poison vials', 'Throwing knives'],
      Mage: ['Spellbook', 'Staff', 'Scroll case'],
      Mystic: ['Robes', 'Crystal focus', 'Meditation beads'],
      Adept: ['Book of knowledge', 'Crafting tools'],
      Theurgist: ['Prayer book', 'Holy symbol', 'Ceremonial vestments']
    }

    const equipment = [...baseEquipment]
    const classItems = classEquipment[charClass as keyof typeof classEquipment] || []
    equipment.push(...classItems)

    // Add level-appropriate gear
    if (level >= 3) {
      equipment.push('Quality equipment upgrade')
    }
    if (level >= 5) {
      equipment.push('Masterwork item')
    }

    return equipment
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>NPC Generator</CardTitle>
          <CardDescription>
            Generate detailed NPCs for your Eldritch RPG campaign
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="gender">Gender</Label>
              <Select value={settings.gender} onValueChange={(value) => setSettings({ ...settings, gender: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Random">Random</SelectItem>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="race">Race</Label>
              <Select value={settings.race} onValueChange={(value) => setSettings({ ...settings, race: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select race" />
                </SelectTrigger>
                <SelectContent>
                  {RACES.map((race) => (
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
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {CLASSES.map((charClass) => (
                    <SelectItem key={charClass} value={charClass}>
                      {charClass}
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
                  {LEVELS.map((level) => (
                    <SelectItem key={level} value={level.toString()}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeMagic"
              checked={settings.includeMagic}
              onCheckedChange={(checked) => setSettings({ ...settings, includeMagic: checked as boolean })}
            />
            <Label htmlFor="includeMagic">Include magical properties for iconic items</Label>
          </div>

          <Button onClick={generateNPC} className="w-full">
            Generate NPC
          </Button>
        </CardContent>
      </Card>

      {generatedNPC && (
        <Card>
          <CardHeader>
            <CardTitle>{generatedNPC.name}</CardTitle>
            <CardDescription>
              Level {generatedNPC.level} {generatedNPC.gender} {generatedNPC.race} {generatedNPC.class}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Core Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">{generatedNPC.pools.spirit}</div>
                <div className="text-sm text-muted-foreground">Spirit Points</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">{generatedNPC.pools.active}</div>
                <div className="text-sm text-muted-foreground">Active DP</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">{generatedNPC.pools.passive}</div>
                <div className="text-sm text-muted-foreground">Passive DP</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">{generatedNPC.masteryDie}</div>
                <div className="text-sm text-muted-foreground">Mastery Die</div>
              </div>
            </div>

            <Separator />

            {/* Abilities */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Abilities</h3>
              <div className="space-y-3">
                {Object.entries(generatedNPC.abilities).map(([ability, die]) => {
                  const specs = SPECIALTIES[ability as keyof typeof SPECIALTIES]
                  return (
                    <div key={ability} className="space-y-1">
                      <div className="font-medium">
                        <span className="text-primary">{ability} {die}</span>
                      </div>
                      <div className="pl-4 space-y-1 text-sm">
                        {specs.map((specialty) => {
                          const specDie = generatedNPC.specialties[ability][specialty]
                          const foci = FOCUSES[specialty as keyof typeof FOCUSES]
                          const focusValues = foci.map(focus => {
                            const value = generatedNPC.focuses[ability][focus]
                            return getFocusValue(value) > 0 ? `${focus} ${value}` : null
                          }).filter(Boolean)
                          
                          return (
                            <div key={specialty}>
                              <span className="font-medium">{specialty} {specDie}</span>
                              {focusValues.length > 0 && (
                                <span className="text-muted-foreground"> ({focusValues.join(', ')})</span>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <Separator />

            {/* Actions */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Melee Attack:</span> {generatedNPC.abilities.Prowess} + {generatedNPC.specialties.Prowess.Melee}
                </div>
                <div>
                  <span className="font-medium">Ranged Attack:</span> {generatedNPC.abilities.Prowess} + {generatedNPC.specialties.Prowess.Precision}
                </div>
                <div>
                  <span className="font-medium">Perception:</span> {generatedNPC.abilities.Competence} + {generatedNPC.specialties.Competence.Perception}
                </div>
                {CASTER_CLASSES.includes(generatedNPC.class as any) && (
                  <div>
                    <span className="font-medium">Magic Attack:</span> {generatedNPC.abilities.Competence} + {generatedNPC.specialties.Competence.Expertise}
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Equipment */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Equipment</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {generatedNPC.equipment.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {item}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {generatedNPC.notes && (
              <>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-2">Notes</h3>
                  <p className="text-sm text-muted-foreground">{generatedNPC.notes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default NPCGenerator