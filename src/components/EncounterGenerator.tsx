import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  DIFFICULTY_LEVELS, 
  DEFENSE_LEVELS, 
  ENCOUNTER_DIFFICULTY_TABLE,
  THREAT_DICE_BY_CATEGORY,
  CREATURE_SIZES,
  CREATURE_NATURES,
  HP_MULTIPLIERS
} from '@/data/gameData'
import { calculateHitPoints, calculateBattlePhase, parseThreatDice, getRandomElement } from '@/utils/gameUtils'

interface GeneratedCreature {
  id: string
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
}

const EncounterGenerator: React.FC = () => {
  const [settings, setSettings] = useState({
    partySize: 4,
    defenseLevel: 'Practitioner',
    difficulty: 'Moderate',
    nonMediumPercentage: 10,
    nonMundanePercentage: 20,
    specialTypePercentage: 30,
    selectedTypes: ['Minor', 'Standard', 'Exceptional'] as string[]
  })

  const [generatedEncounter, setGeneratedEncounter] = useState<{
    creatures: GeneratedCreature[]
    totalThreat: number
    targetThreat: number
  } | null>(null)

  const generateEncounter = () => {
    if (settings.selectedTypes.length === 0) {
      alert('Please select at least one creature type.')
      return
    }

    const defenseIndex = DEFENSE_LEVELS.indexOf(settings.defenseLevel as any)
    const difficultyIndex = DIFFICULTY_LEVELS.indexOf(settings.difficulty as any)
    
    const threatScore = ENCOUNTER_DIFFICULTY_TABLE[settings.partySize as keyof typeof ENCOUNTER_DIFFICULTY_TABLE]
      ?.[settings.defenseLevel as keyof typeof ENCOUNTER_DIFFICULTY_TABLE[4]]
      ?.[difficultyIndex] || 20

    let remainingThreat = threatScore
    const creatures: GeneratedCreature[] = []
    let safety = 0

    while (remainingThreat > 5 && creatures.length < 20 && safety < 100) {
      safety++
      
      const creature = generateCreatureForEncounter(
        remainingThreat,
        settings.selectedTypes,
        settings.nonMediumPercentage,
        settings.nonMundanePercentage,
        settings.specialTypePercentage
      )
      
      if (creature && creature.threatMV > 0 && creature.threatMV <= remainingThreat) {
        creatures.push(creature)
        remainingThreat -= creature.threatMV
      } else {
        break
      }
    }

    setGeneratedEncounter({
      creatures,
      totalThreat: threatScore - remainingThreat,
      targetThreat: threatScore
    })
  }

  const generateCreatureForEncounter = (
    maxThreat: number,
    selectedTypes: string[],
    nonMediumPercentage: number,
    nonMundanePercentage: number,
    specialTypePercentage: number
  ): GeneratedCreature | null => {
    const category = getRandomElement(selectedTypes)
    const availableDice = THREAT_DICE_BY_CATEGORY[category as keyof typeof THREAT_DICE_BY_CATEGORY]
    
    // Filter dice that fit within the remaining threat budget
    const validDice = availableDice.filter(dice => {
      const { mv } = parseThreatDice(dice)
      return mv <= maxThreat
    })

    if (validDice.length === 0) return null

    const threatDice = getRandomElement(validDice)
    const { mv: threatMV } = parseThreatDice(threatDice)

    // Determine size
    let size = 'Medium'
    if (Math.random() * 100 < nonMediumPercentage) {
      const sizes = CREATURE_SIZES.filter(s => s !== 'Medium')
      size = getRandomElement(sizes)
    }

    // Determine nature
    let nature = 'Mundane'
    if (Math.random() * 100 < nonMundanePercentage) {
      const natures = CREATURE_NATURES.filter(n => n !== 'Mundane')
      nature = getRandomElement(natures)
    }

    // Determine creature type (Fast/Tough/Normal)
    let creatureType = 'Normal'
    if (Math.random() * 100 < specialTypePercentage) {
      creatureType = Math.random() < 0.5 ? 'Fast' : 'Tough'
    }

    // Calculate hit points
    const { hitPoints } = calculateHitPoints(threatMV, size, nature)

    // Calculate defense pools
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

    // Calculate battle phase and saving throw
    const { die } = parseThreatDice(threatDice)
    const battlePhase = calculateBattlePhase(`d${die}`)
    const savingThrow = `d${4 * (['Minor', 'Standard', 'Exceptional', 'Legendary'].indexOf(category) + 1)}`

    return {
      id: Math.random().toString(36).substr(2, 9),
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
      battlePhase
    }
  }

  const handleTypeToggle = (type: string, checked: boolean) => {
    if (checked) {
      setSettings(prev => ({
        ...prev,
        selectedTypes: [...prev.selectedTypes, type]
      }))
    } else {
      setSettings(prev => ({
        ...prev,
        selectedTypes: prev.selectedTypes.filter(t => t !== type)
      }))
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Encounter Generator</CardTitle>
          <CardDescription>
            Generate balanced encounters for your Eldritch RPG sessions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Party Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Party Size: {settings.partySize}</Label>
              <Slider
                value={[settings.partySize]}
                onValueChange={(value) => setSettings({ ...settings, partySize: value[0] })}
                min={1}
                max={4}
                step={1}
                className="mt-2"
              />
            </div>
            
            <div>
              <Label htmlFor="defenseLevel">Defense Level</Label>
              <Select value={settings.defenseLevel} onValueChange={(value) => setSettings({ ...settings, defenseLevel: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEFENSE_LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select value={settings.difficulty} onValueChange={(value) => setSettings({ ...settings, difficulty: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTY_LEVELS.map((difficulty) => (
                    <SelectItem key={difficulty} value={difficulty}>
                      {difficulty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Creature Variation Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Creature Variation</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Non-Medium Size: {settings.nonMediumPercentage}%</Label>
                <Slider
                  value={[settings.nonMediumPercentage]}
                  onValueChange={(value) => setSettings({ ...settings, nonMediumPercentage: value[0] })}
                  min={0}
                  max={100}
                  step={5}
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label>Non-Mundane Nature: {settings.nonMundanePercentage}%</Label>
                <Slider
                  value={[settings.nonMundanePercentage]}
                  onValueChange={(value) => setSettings({ ...settings, nonMundanePercentage: value[0] })}
                  min={0}
                  max={100}
                  step={5}
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label>Fast/Tough Types: {settings.specialTypePercentage}%</Label>
                <Slider
                  value={[settings.specialTypePercentage]}
                  onValueChange={(value) => setSettings({ ...settings, specialTypePercentage: value[0] })}
                  min={0}
                  max={100}
                  step={5}
                  className="mt-2"
                />
              </div>
            </div>
          </div>

          {/* Creature Types */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Creature Types</h3>
            <div className="flex flex-wrap gap-4">
              {['Minor', 'Standard', 'Exceptional', 'Legendary'].map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={type}
                    checked={settings.selectedTypes.includes(type)}
                    onCheckedChange={(checked) => handleTypeToggle(type, checked as boolean)}
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

      {generatedEncounter && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Encounter</CardTitle>
            <CardDescription>
              Party Size: {settings.partySize} | Defense: {settings.defenseLevel} | Difficulty: {settings.difficulty}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2 mb-4">
                <Badge variant="outline">
                  Target Threat: {generatedEncounter.targetThreat}
                </Badge>
                <Badge variant="outline">
                  Actual Threat: {generatedEncounter.totalThreat}
                </Badge>
              </div>

              <div className="space-y-3">
                {generatedEncounter.creatures.map((creature, index) => (
                  <div key={creature.id} className="p-4 border rounded-lg bg-muted/20">
                    <h4 className="font-semibold mb-2">
                      Creature {index + 1}: {creature.category} {creature.size} {creature.nature} {creature.creatureType}
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      <div><strong>TD:</strong> {creature.threatDice} (MV: {creature.threatMV})</div>
                      <div><strong>HP:</strong> {creature.hitPoints} ({creature.activeDefense}A/{creature.passiveDefense}P)</div>
                      <div><strong>ST:</strong> {creature.savingThrow}</div>
                      <div><strong>BP:</strong> {creature.battlePhase}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default EncounterGenerator