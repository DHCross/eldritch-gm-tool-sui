import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  ENCOUNTER_DIFFICULTY_TABLE, 
  DIFFICULTY_LEVELS, 
  DEFENSE_LEVELS,
  THREAT_DICE_BY_CATEGORY,
  CREATURE_SIZES,
  CREATURE_NATURES
} from '@/data/gameData'
import { 
  calculateHitPoints, 
  calculateBattlePhase, 
  parseThreatDice, 
  getRandomElement 
} from '@/utils/gameUtils'

interface EncounterSettings {
  partySize: number
  defenseLevel: number
  difficulty: number
  nonMediumPercentage: number
  nonMundanePercentage: number
  specialTypePercentage: number
  selectedTypes: string[]
}

interface Monster {
  name: string
  category: string
  threatDice: string
  threatMV: number
  size: string
  nature: string
  creatureType: string
  hitPoints: number
  activeDefense: number
  passiveDefense: number
  savingThrow: string
  battlePhase: number
  multiplier: number
}

const EncounterGenerator: React.FC = () => {
  const [settings, setSettings] = useState<EncounterSettings>({
    partySize: 4,
    defenseLevel: 0, // Practitioner
    difficulty: 1, // Moderate
    nonMediumPercentage: 10,
    nonMundanePercentage: 20,
    specialTypePercentage: 30,
    selectedTypes: ['Minor', 'Standard', 'Exceptional']
  })

  const [encounter, setEncounter] = useState<Monster[]>([])
  const [encounterInfo, setEncounterInfo] = useState<any>(null)

  const generateEncounter = () => {
    if (settings.selectedTypes.length === 0) {
      alert('Please select at least one creature type.')
      return
    }

    const threatScore = ENCOUNTER_DIFFICULTY_TABLE[settings.partySize as keyof typeof ENCOUNTER_DIFFICULTY_TABLE]
      [DEFENSE_LEVELS[settings.defenseLevel] as keyof typeof ENCOUNTER_DIFFICULTY_TABLE[1]]
      [settings.difficulty]

    let remainingThreat = threatScore
    const monsters: Monster[] = []
    let safety = 0

    while (remainingThreat > 5 && monsters.length < 20 && safety < 1000) {
      safety++
      const monster = generateMonsterForEncounter(remainingThreat, settings)
      if (monster.threatMV > 0) {
        monsters.push(monster)
        remainingThreat -= monster.threatMV
      } else {
        break
      }
    }

    setEncounter(monsters)
    setEncounterInfo({
      partySize: settings.partySize,
      defenseLevel: DEFENSE_LEVELS[settings.defenseLevel],
      difficulty: DIFFICULTY_LEVELS[settings.difficulty],
      totalThreatScore: threatScore,
      remainingThreat
    })
  }

  const generateMonsterForEncounter = (maxThreat: number, settings: EncounterSettings): Monster => {
    const category = getRandomElement(settings.selectedTypes)
    const threatDiceOptions = THREAT_DICE_BY_CATEGORY[category as keyof typeof THREAT_DICE_BY_CATEGORY]
      .filter(dice => {
        const { mv } = parseThreatDice(dice)
        return mv <= maxThreat
      })
    
    const threatDice = threatDiceOptions.length > 0 
      ? getRandomElement(threatDiceOptions)
      : THREAT_DICE_BY_CATEGORY[category as keyof typeof THREAT_DICE_BY_CATEGORY][0]
    
    const { mv: threatMV } = parseThreatDice(threatDice)

    // Determine size
    let size = 'Medium'
    if (Math.random() * 100 < settings.nonMediumPercentage) {
      const nonMediumSizes = CREATURE_SIZES.filter(s => s !== 'Medium')
      size = getRandomElement(nonMediumSizes)
    }

    // Determine nature
    let nature = 'Mundane'
    if (Math.random() * 100 < settings.nonMundanePercentage) {
      const nonMundaneNatures = CREATURE_NATURES.filter(n => n !== 'Mundane')
      nature = getRandomElement(nonMundaneNatures)
    }

    // Determine creature type (Fast/Tough/Normal)
    let creatureType = 'Normal'
    if (Math.random() * 100 < settings.specialTypePercentage) {
      creatureType = Math.random() < 0.5 ? 'Fast' : 'Tough'
    }

    const { hitPoints, multiplier } = calculateHitPoints(threatMV, size, nature)
    
    let activeDefense: number, passiveDefense: number
    if (creatureType === 'Fast') {
      activeDefense = Math.round(hitPoints * 0.75)
      passiveDefense = hitPoints - activeDefense
    } else if (creatureType === 'Tough') {
      passiveDefense = Math.round(hitPoints * 0.75)
      activeDefense = hitPoints - passiveDefense
    } else {
      activeDefense = Math.round(hitPoints / 2)
      passiveDefense = hitPoints - activeDefense
    }

    const { die } = parseThreatDice(threatDice)
    const battlePhase = calculateBattlePhase(`d${die}`)
    const savingThrow = `d${4 * (['Minor', 'Standard', 'Exceptional', 'Legendary'].indexOf(category) + 1)}`

    return {
      name: `${category} ${size} ${nature} ${creatureType !== 'Normal' ? creatureType + ' ' : ''}Creature`,
      category,
      threatDice,
      threatMV,
      size,
      nature,
      creatureType,
      hitPoints,
      activeDefense,
      passiveDefense,
      savingThrow,
      battlePhase,
      multiplier
    }
  }

  const toggleCreatureType = (type: string) => {
    const newTypes = settings.selectedTypes.includes(type)
      ? settings.selectedTypes.filter(t => t !== type)
      : [...settings.selectedTypes, type]
    setSettings({ ...settings, selectedTypes: newTypes })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Encounter Generator</CardTitle>
          <CardDescription>
            Generate balanced encounters for your party based on Eldritch RPG rules
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Party Configuration */}
          <div className="space-y-4">
            <div>
              <Label>Party Size: {settings.partySize}</Label>
              <Slider
                value={[settings.partySize]}
                onValueChange={(value) => setSettings({ ...settings, partySize: value[0] })}
                max={4}
                min={1}
                step={1}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Party Defense Level: {DEFENSE_LEVELS[settings.defenseLevel]}</Label>
              <Slider
                value={[settings.defenseLevel]}
                onValueChange={(value) => setSettings({ ...settings, defenseLevel: value[0] })}
                max={4}
                min={0}
                step={1}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Desired Difficulty: {DIFFICULTY_LEVELS[settings.difficulty]}</Label>
              <Slider
                value={[settings.difficulty]}
                onValueChange={(value) => setSettings({ ...settings, difficulty: value[0] })}
                max={5}
                min={0}
                step={1}
                className="mt-2"
              />
            </div>
          </div>

          <Separator />

          {/* Creature Variation */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Creature Variation</h3>
            
            <div>
              <Label>Non-Medium Size %: {settings.nonMediumPercentage}%</Label>
              <Slider
                value={[settings.nonMediumPercentage]}
                onValueChange={(value) => setSettings({ ...settings, nonMediumPercentage: value[0] })}
                max={100}
                min={0}
                step={5}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Non-Mundane Nature %: {settings.nonMundanePercentage}%</Label>
              <Slider
                value={[settings.nonMundanePercentage]}
                onValueChange={(value) => setSettings({ ...settings, nonMundanePercentage: value[0] })}
                max={100}
                min={0}
                step={5}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Fast/Tough Creature %: {settings.specialTypePercentage}%</Label>
              <Slider
                value={[settings.specialTypePercentage]}
                onValueChange={(value) => setSettings({ ...settings, specialTypePercentage: value[0] })}
                max={100}
                min={0}
                step={5}
                className="mt-2"
              />
            </div>
          </div>

          <Separator />

          {/* Creature Types */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Allowed Creature Types</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.keys(THREAT_DICE_BY_CATEGORY).map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={type}
                    checked={settings.selectedTypes.includes(type)}
                    onCheckedChange={() => toggleCreatureType(type)}
                  />
                  <Label htmlFor={type}>{type}</Label>
                </div>
              ))}
            </div>
          </div>

          <Button onClick={generateEncounter} className="w-full">
            Generate Encounter
          </Button>
        </CardContent>
      </Card>

      {encounterInfo && (
        <Card>
          <CardHeader>
            <CardTitle>Encounter Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{encounterInfo.partySize}</div>
                <div className="text-sm text-muted-foreground">Party Size</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{encounterInfo.defenseLevel}</div>
                <div className="text-sm text-muted-foreground">Defense Level</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{encounterInfo.difficulty}</div>
                <div className="text-sm text-muted-foreground">Difficulty</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{encounterInfo.totalThreatScore}</div>
                <div className="text-sm text-muted-foreground">Total Threat</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {encounter.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Creatures</CardTitle>
            <CardDescription>
              {encounter.length} creature{encounter.length !== 1 ? 's' : ''} generated
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {encounter.map((monster, index) => (
              <Card key={index} className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{monster.name}</h4>
                    <div className="flex gap-2">
                      <Badge variant="outline">{monster.category}</Badge>
                      <Badge variant="outline">MV: {monster.threatMV}</Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">TD:</span> {monster.threatDice}
                    </div>
                    <div>
                      <span className="font-medium">HP:</span> {monster.hitPoints} ({monster.activeDefense}A/{monster.passiveDefense}P)
                    </div>
                    <div>
                      <span className="font-medium">ST:</span> {monster.savingThrow}
                    </div>
                    <div>
                      <span className="font-medium">BP:</span> {monster.battlePhase}
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    {monster.size} {monster.nature} {monster.creatureType !== 'Normal' ? monster.creatureType + ' ' : ''}creature
                    {monster.multiplier !== 1 && ` (HP ×${monster.multiplier})`}
                  </div>
                </div>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default EncounterGenerator