import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Dice6, RefreshCw, TrendUp, Warning, CheckCircle, Info } from "@phosphor-icons/react"

// Encounter difficulty table based on party size and defense level
const encounterDifficultyTable = {
  1: { 
    Practitioner: [7, 10, 12, 14, 16, 18], 
    Competent: [14, 20, 24, 28, 32, 36], 
    Proficient: [21, 29, 36, 42, 48, 55], 
    Advanced: [28, 39, 48, 56, 64, 73], 
    Elite: [35, 49, 60, 70, 80, 110] 
  },
  2: { 
    Practitioner: [14, 20, 24, 28, 32, 36], 
    Competent: [28, 39, 48, 56, 64, 73], 
    Proficient: [42, 59, 72, 84, 96, 108], 
    Advanced: [56, 77, 96, 112, 128, 144], 
    Elite: [70, 95, 120, 140, 160, 190] 
  },
  3: { 
    Practitioner: [21, 30, 36, 42, 48, 54], 
    Competent: [42, 59, 72, 84, 96, 108], 
    Proficient: [63, 84, 108, 126, 144, 162], 
    Advanced: [84, 111, 144, 168, 192, 216], 
    Elite: [105, 140, 180, 210, 240, 270] 
  },
  4: { 
    Practitioner: [28, 42, 50, 56, 64, 72], 
    Competent: [56, 77, 96, 112, 128, 144], 
    Proficient: [84, 111, 144, 168, 192, 216], 
    Advanced: [112, 147, 180, 224, 256, 288], 
    Elite: [140, 185, 228, 280, 320, 360] 
  }
}

const difficultyLevels = ['Easy', 'Moderate', 'Difficult', 'Demanding', 'Formidable', 'Deadly']
const defenseLevels = ['Practitioner', 'Competent', 'Proficient', 'Advanced', 'Elite']

// Threat dice by category
const threatDiceByCategory = {
  Minor: ['1d4', '1d6', '1d8', '1d10', '1d12'],
  Standard: ['2d4', '2d6', '2d8', '2d10', '2d12'],
  Exceptional: ['3d4', '3d6', '3d8', '3d10', '3d12'],
  Legendary: ['3d12', '3d14', '3d16', '3d18', '3d20']
}

// HP multipliers based on size and nature
const hpMultipliers = {
  'Minuscule': { 'Mundane': 0.5, 'Magical': 1, 'Preternatural': 1.5, 'Supernatural': 2 },
  'Tiny': { 'Mundane': 0.5, 'Magical': 1, 'Preternatural': 1.5, 'Supernatural': 2 },
  'Small': { 'Mundane': 1, 'Magical': 1.5, 'Preternatural': 2, 'Supernatural': 2.5 },
  'Medium': { 'Mundane': 1, 'Magical': 1.5, 'Preternatural': 2, 'Supernatural': 2.5 },
  'Large': { 'Mundane': 1.5, 'Magical': 2, 'Preternatural': 2.5, 'Supernatural': 3 },
  'Huge': { 'Mundane': 2, 'Magical': 2.5, 'Preternatural': 3, 'Supernatural': 3.5 },
  'Gargantuan': { 'Mundane': 2.5, 'Magical': 3, 'Preternatural': 3.5, 'Supernatural': 4 }
}

const sizes = ['Minuscule', 'Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan']
const natures = ['Mundane', 'Magical', 'Preternatural', 'Supernatural']
const creatureTypes = ['Normal', 'Fast', 'Tough']

interface Creature {
  id: number
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

interface EncounterAnalysis {
  threatDistribution: { [key: string]: number }
  avgBattlePhase: number
  totalHP: number
  avgHP: number
  balanceScore: number
  recommendations: string[]
  warnings: string[]
  difficultyActual: string
  efficiencyRating: 'Poor' | 'Fair' | 'Good' | 'Excellent'
}

export default function EncounterGenerator() {
  const [partySize, setPartySize] = useState([4])
  const [defenseLevel, setDefenseLevel] = useState([1])
  const [difficulty, setDifficulty] = useState([2])
  const [nonMediumPercentage, setNonMediumPercentage] = useState([10])
  const [nonMundanePercentage, setNonMundanePercentage] = useState([20])
  const [specialTypePercentage, setSpecialTypePercentage] = useState([30])
  const [selectedTypes, setSelectedTypes] = useState(['Minor', 'Standard', 'Exceptional'])
  const [creatures, setCreatures] = useState<Creature[]>([])
  const [encounterStats, setEncounterStats] = useState<any>(null)
  const [encounterAnalysis, setEncounterAnalysis] = useState<EncounterAnalysis | null>(null)

  const getRandomElement = <T,>(array: T[]): T => {
    return array[Math.floor(Math.random() * array.length)]
  }

  const calculateHitPoints = (baseHP: number, size: string, nature: string) => {
    const multiplier = hpMultipliers[size][nature]
    return {
      hitPoints: Math.round(baseHP * multiplier),
      multiplier: multiplier
    }
  }

  const calculateBattlePhase = (prowessDie: number): number => {
    if (prowessDie >= 12) return 1
    if (prowessDie >= 10) return 2
    if (prowessDie >= 8) return 3
    if (prowessDie >= 6) return 4
    return 5
  }

  const analyzeEncounter = (creatures: Creature[], encounterStats: any): EncounterAnalysis => {
    if (creatures.length === 0) {
      return {
        threatDistribution: {},
        avgBattlePhase: 0,
        totalHP: 0,
        avgHP: 0,
        balanceScore: 0,
        recommendations: [],
        warnings: [],
        difficultyActual: 'None',
        efficiencyRating: 'Poor'
      }
    }

    // Calculate threat distribution
    const threatDistribution = creatures.reduce((acc, creature) => {
      acc[creature.category] = (acc[creature.category] || 0) + 1
      return acc
    }, {} as { [key: string]: number })

    // Calculate average battle phase (weighted by threat)
    const totalThreatWeight = creatures.reduce((sum, c) => sum + c.threatMV, 0)
    const avgBattlePhase = creatures.reduce((sum, c) => sum + (c.battlePhase * c.threatMV), 0) / totalThreatWeight

    // Calculate HP statistics
    const totalHP = creatures.reduce((sum, c) => sum + c.hitPoints, 0)
    const avgHP = totalHP / creatures.length

    // Calculate balance score (0-100)
    const targetThreat = encounterStats.totalThreatScore
    const actualThreat = encounterStats.actualThreatUsed
    const threatEfficiency = Math.min(actualThreat / targetThreat, 1) * 100

    // Diversity score (better with mixed creature types)
    const diversityScore = Math.min(Object.keys(threatDistribution).length * 25, 100)
    
    // Phase distribution score (avoid all creatures in same phase)
    const phaseDistribution = creatures.reduce((acc, c) => {
      acc[c.battlePhase] = (acc[c.battlePhase] || 0) + 1
      return acc
    }, {} as { [key: number]: number })
    const phaseSpread = Object.keys(phaseDistribution).length
    const phaseScore = Math.min(phaseSpread * 20, 100)

    const balanceScore = Math.round((threatEfficiency * 0.4 + diversityScore * 0.3 + phaseScore * 0.3))

    // Generate recommendations
    const recommendations: string[] = []
    const warnings: string[] = []

    if (threatEfficiency < 85) {
      recommendations.push(`Consider adding smaller creatures to use remaining threat (${encounterStats.remainingThreat} unused)`)
    }

    if (Object.keys(threatDistribution).length === 1) {
      recommendations.push('Mix different creature categories for more dynamic combat')
    }

    if (phaseSpread === 1) {
      warnings.push('All creatures act in the same battle phase - consider varying prowess levels')
    }

    if (avgBattlePhase <= 2) {
      warnings.push('Most creatures act early - party may be overwhelmed in opening rounds')
    }

    if (creatures.length === 1 && creatures[0].category === 'Legendary') {
      recommendations.push('Single powerful foe encounters work best with environmental hazards or minions')
    }

    if (creatures.length > 8) {
      warnings.push('Large creature counts can slow combat - consider consolidating some into groups')
    }

    // Determine actual difficulty based on analysis
    let difficultyActual = encounterStats.difficulty
    if (balanceScore >= 85) difficultyActual += ' (Well-Balanced)'
    else if (balanceScore >= 70) difficultyActual += ' (Adequate)'
    else if (balanceScore >= 55) difficultyActual += ' (Uneven)'
    else difficultyActual += ' (Problematic)'

    // Efficiency rating
    let efficiencyRating: 'Poor' | 'Fair' | 'Good' | 'Excellent'
    if (threatEfficiency >= 95) efficiencyRating = 'Excellent'
    else if (threatEfficiency >= 85) efficiencyRating = 'Good'
    else if (threatEfficiency >= 70) efficiencyRating = 'Fair'
    else efficiencyRating = 'Poor'

    // Additional strategic recommendations
    if (creatures.some(c => c.nature !== 'Mundane')) {
      recommendations.push('Magical/supernatural creatures may require special tactics or equipment')
    }

    if (creatures.some(c => c.creatureType === 'Fast')) {
      recommendations.push('Fast creatures excel at harassing spellcasters and ranged combatants')
    }

    if (creatures.some(c => c.creatureType === 'Tough')) {
      recommendations.push('Tough creatures work well as damage sponges protecting weaker allies')
    }

    return {
      threatDistribution,
      avgBattlePhase: Math.round(avgBattlePhase * 10) / 10,
      totalHP,
      avgHP: Math.round(avgHP),
      balanceScore,
      recommendations,
      warnings,
      difficultyActual,
      efficiencyRating
    }
  }

  const generateMonsterForEncounter = (maxThreat: number, selectedTypes: string[], nonMediumPercentage: number, nonMundanePercentage: number, specialTypePercentage: number): Creature | null => {
    if (selectedTypes.length === 0) return null

    const category = getRandomElement(selectedTypes)
    const threatDiceOptions = threatDiceByCategory[category].filter(dice => {
      const [count, die] = dice.split('d').map(Number)
      return count * die <= maxThreat
    })
    
    if (threatDiceOptions.length === 0) return null
    
    const threatDice = getRandomElement(threatDiceOptions)
    const [count, die] = threatDice.split('d').map(Number)
    const threatMV = count * die
    
    // Determine size
    let size = 'Medium'
    if (Math.random() * 100 < nonMediumPercentage) {
      const nonMediumSizes = sizes.filter(s => s !== 'Medium')
      size = getRandomElement(nonMediumSizes)
    }

    // Determine nature
    let nature = 'Mundane'
    if (Math.random() * 100 < nonMundanePercentage) {
      const nonMundaneNatures = natures.filter(n => n !== 'Mundane')
      nature = getRandomElement(nonMundaneNatures)
    }

    // Determine creature type
    let creatureType = 'Normal'
    if (Math.random() * 100 < specialTypePercentage) {
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

    const battlePhase = calculateBattlePhase(die)
    const savingThrow = `d${4 * (['Minor', 'Standard', 'Exceptional', 'Legendary'].indexOf(category) + 1)}`
    
    return {
      id: Date.now() + Math.random(),
      category,
      threatDice,
      threatMV,
      size,
      nature,
      creatureType,
      hitPoints,
      multiplier,
      activeDefense,
      passiveDefense,
      savingThrow,
      battlePhase
    }
  }

  const generateEncounter = () => {
    if (selectedTypes.length === 0) {
      return
    }

    const partyCount = partySize[0]
    const defLevel = defenseLevels[defenseLevel[0] - 1]
    const diffLevel = difficulty[0]
    const nonMediumPct = nonMediumPercentage[0]
    const nonMundanePct = nonMundanePercentage[0]
    const specialTypePct = specialTypePercentage[0]

    const threatScore = encounterDifficultyTable[partyCount][defLevel][diffLevel - 1]
    
    const newCreatures: Creature[] = []
    let remainingThreat = threatScore
    let attempts = 0
    const maxAttempts = 50

    while (remainingThreat > 5 && newCreatures.length < 20 && attempts < maxAttempts) {
      attempts++
      const creature = generateMonsterForEncounter(remainingThreat, selectedTypes, nonMediumPct, nonMundanePct, specialTypePct)
      
      if (creature && creature.threatMV > 0) {
        newCreatures.push(creature)
        remainingThreat -= creature.threatMV
      } else {
        break
      }
    }

    setCreatures(newCreatures)
    
    const stats = {
      partySize: partyCount,
      defenseLevel: defLevel,
      difficulty: difficultyLevels[diffLevel - 1],
      totalThreatScore: threatScore,
      remainingThreat: remainingThreat,
      actualThreatUsed: threatScore - remainingThreat
    }
    
    setEncounterStats(stats)
    setEncounterAnalysis(analyzeEncounter(newCreatures, stats))
  }

  const handleTypeToggle = (type: string, checked: boolean) => {
    if (checked) {
      setSelectedTypes([...selectedTypes, type])
    } else {
      setSelectedTypes(selectedTypes.filter(t => t !== type))
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Dice6 size={24} />
          Advanced Encounter Generator
        </CardTitle>
        <CardDescription>
          Generate balanced encounters using the Eldritch RPG difficulty tables
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Party Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">
                Party Size: {partySize[0]}
              </Label>
              <Slider
                value={partySize}
                onValueChange={setPartySize}
                max={4}
                min={1}
                step={1}
                className="mt-2"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">
                Party Defense Level: {defenseLevels[defenseLevel[0] - 1]}
              </Label>
              <Slider
                value={defenseLevel}
                onValueChange={setDefenseLevel}
                max={5}
                min={1}
                step={1}
                className="mt-2"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">
                Desired Difficulty: {difficultyLevels[difficulty[0] - 1]}
              </Label>
              <Slider
                value={difficulty}
                onValueChange={setDifficulty}
                max={6}
                min={1}
                step={1}
                className="mt-2"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">
                Non-Medium Size %: {nonMediumPercentage[0]}%
              </Label>
              <Slider
                value={nonMediumPercentage}
                onValueChange={setNonMediumPercentage}
                max={100}
                min={0}
                step={5}
                className="mt-2"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">
                Non-Mundane Nature %: {nonMundanePercentage[0]}%
              </Label>
              <Slider
                value={nonMundanePercentage}
                onValueChange={setNonMundanePercentage}
                max={100}
                min={0}
                step={5}
                className="mt-2"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">
                Fast/Tough Creature %: {specialTypePercentage[0]}%
              </Label>
              <Slider
                value={specialTypePercentage}
                onValueChange={setSpecialTypePercentage}
                max={100}
                min={0}
                step={5}
                className="mt-2"
              />
            </div>
          </div>
        </div>

        {/* Creature Types */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Creature Types</Label>
          <div className="flex flex-wrap gap-3">
            {Object.keys(threatDiceByCategory).map(type => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={type}
                  checked={selectedTypes.includes(type)}
                  onCheckedChange={(checked) => handleTypeToggle(type, checked as boolean)}
                />
                <Label htmlFor={type} className="text-sm">{type}</Label>
              </div>
            ))}
          </div>
        </div>

        <Button 
          onClick={generateEncounter} 
          className="w-full" 
          size="lg"
          disabled={selectedTypes.length === 0}
        >
          <RefreshCw size={20} className="mr-2" />
          Generate Encounter
        </Button>

        {/* Encounter Results */}
        {encounterStats && (
          <div className="space-y-4">
            <Separator />
            
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">Encounter Details</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Party Size:</span>
                  <div className="font-medium">{encounterStats.partySize}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Defense Level:</span>
                  <div className="font-medium">{encounterStats.defenseLevel}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Difficulty:</span>
                  <div className="font-medium">{encounterStats.difficulty}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Threat:</span>
                  <div className="font-medium">{encounterStats.totalThreatScore}</div>
                </div>
              </div>
              
              {encounterStats.remainingThreat > 0 && (
                <div className="mt-2 text-sm text-muted-foreground">
                  Remaining threat: {encounterStats.remainingThreat} 
                  (Used: {encounterStats.actualThreatUsed})
                </div>
              )}
            </div>

            {/* Encounter Analysis */}
            {encounterAnalysis && (
              <div className="bg-card border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendUp size={20} />
                  Encounter Analysis
                </h3>
                
                {/* Balance Score */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Balance Score</span>
                    <span className="text-sm font-mono">{encounterAnalysis.balanceScore}/100</span>
                  </div>
                  <Progress value={encounterAnalysis.balanceScore} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Poor</span>
                    <span>Fair</span>
                    <span>Good</span>
                    <span>Excellent</span>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Actual Difficulty:</span>
                    <div className="font-medium">{encounterAnalysis.difficultyActual}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Threat Efficiency:</span>
                    <div className="font-medium">{encounterAnalysis.efficiencyRating}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Avg Battle Phase:</span>
                    <div className="font-medium">{encounterAnalysis.avgBattlePhase}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total HP:</span>
                    <div className="font-medium">{encounterAnalysis.totalHP}</div>
                  </div>
                </div>

                {/* Threat Distribution */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2">Threat Distribution</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(encounterAnalysis.threatDistribution).map(([category, count]) => (
                      <Badge key={category} variant="outline">
                        {category}: {count}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Warnings */}
                {encounterAnalysis.warnings.length > 0 && (
                  <Alert className="mb-4">
                    <Warning size={16} />
                    <AlertTitle>Balance Warnings</AlertTitle>
                    <AlertDescription>
                      <ul className="list-disc list-inside space-y-1 mt-2">
                        {encounterAnalysis.warnings.map((warning, index) => (
                          <li key={index} className="text-sm">{warning}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Recommendations */}
                {encounterAnalysis.recommendations.length > 0 && (
                  <Alert>
                    <Info size={16} />
                    <AlertTitle>Strategic Recommendations</AlertTitle>
                    <AlertDescription>
                      <ul className="list-disc list-inside space-y-1 mt-2">
                        {encounterAnalysis.recommendations.map((rec, index) => (
                          <li key={index} className="text-sm">{rec}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {creatures.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Creatures ({creatures.length})</h3>
                <div className="space-y-3">
                  {creatures.map((creature, index) => (
                    <div key={creature.id} className="border rounded-lg p-4 bg-card">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium">
                          Creature {index + 1}
                        </h4>
                        <div className="flex gap-1">
                          <Badge variant="outline">{creature.category}</Badge>
                          <Badge variant="secondary">{creature.creatureType}</Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1">
                          <div><span className="text-muted-foreground">Type:</span> {creature.size} {creature.nature}</div>
                          <div><span className="text-muted-foreground">Threat Dice:</span> {creature.threatDice} (MV: {creature.threatMV})</div>
                          <div><span className="text-muted-foreground">Hit Points:</span> {creature.hitPoints} ({creature.activeDefense}A/{creature.passiveDefense}P)</div>
                        </div>
                        <div className="space-y-1">
                          <div><span className="text-muted-foreground">Saving Throw:</span> {creature.savingThrow}</div>
                          <div><span className="text-muted-foreground">Battle Phase:</span> {creature.battlePhase}</div>
                          <div><span className="text-muted-foreground">HP Multiplier:</span> ×{creature.multiplier}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}