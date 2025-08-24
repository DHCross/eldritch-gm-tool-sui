import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Sparkles } from "@phosphor-icons/react"

interface Monster {
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
}

const difficultyLevels = ['Easy', 'Moderate', 'Difficult', 'Demanding', 'Formidable', 'Deadly']
const defenseLevels = ['Practitioner', 'Competent', 'Proficient', 'Advanced', 'Elite']

const encounterDifficultyTable = {
  1: { Practitioner: [7,10,12,14,16,18], Competent: [14,20,24,28,32,36], Proficient: [21,29,36,42,48,55], Advanced: [28,39,48,56,64,73], Elite: [35,49,60,70,80,110] },
  2: { Practitioner: [14,20,24,28,32,36], Competent: [28,39,48,56,64,73], Proficient: [42,59,72,84,96,108], Advanced: [56,77,96,112,128,144], Elite: [70,95,120,140,160,190] },
  3: { Practitioner: [21,30,36,42,48,54], Competent: [42,59,72,84,96,108], Proficient: [63,84,108,126,144,162], Advanced: [84,111,144,168,192,216], Elite: [105,140,180,210,240,270] },
  4: { Practitioner: [28,42,50,56,64,72], Competent: [56,77,96,112,128,144], Proficient: [84,111,144,168,192,216], Advanced: [112,147,180,224,256,288], Elite: [140,185,228,280,320,360] }
}

const threatDiceByCategory = {
  Minor: ['1d4','1d6','1d8','1d10','1d12'],
  Standard: ['2d4','2d6','2d8','2d10','2d12'],
  Exceptional: ['3d4','3d6','3d8','3d10','3d12'],
  Legendary: ['3d12','3d14','3d16','3d18','3d20']
}

const hpMultipliers = {
  'Minuscule': {'Mundane': 0.5, 'Magical': 1, 'Preternatural': 1.5, 'Supernatural': 2},
  'Tiny': {'Mundane': 0.5, 'Magical': 1, 'Preternatural': 1.5, 'Supernatural': 2},
  'Small': {'Mundane': 1, 'Magical': 1.5, 'Preternatural': 2, 'Supernatural': 2.5},
  'Medium': {'Mundane': 1, 'Magical': 1.5, 'Preternatural': 2, 'Supernatural': 2.5},
  'Large': {'Mundane': 1.5, 'Magical': 2, 'Preternatural': 2.5, 'Supernatural': 3},
  'Huge': {'Mundane': 2, 'Magical': 2.5, 'Preternatural': 3, 'Supernatural': 3.5},
  'Gargantuan': {'Mundane': 2.5, 'Magical': 3, 'Preternatural': 3.5, 'Supernatural': 4}
}

export default function EncounterGenerator() {
  const [partySize, setPartySize] = useState([4])
  const [defenseLevel, setDefenseLevel] = useState([1])
  const [difficulty, setDifficulty] = useState([2])
  const [nonMediumPercentage, setNonMediumPercentage] = useState([10])
  const [nonMundanePercentage, setNonMundanePercentage] = useState([20])
  const [specialTypePercentage, setSpecialTypePercentage] = useState([30])
  const [selectedTypes, setSelectedTypes] = useState(['Minor', 'Standard', 'Exceptional'])
  const [monsters, setMonsters] = useState<Monster[]>([])
  const [encounterDetails, setEncounterDetails] = useState('')

  const calculateHitPoints = (baseHP: number, size: string, nature: string) => {
    const multiplier = hpMultipliers[size as keyof typeof hpMultipliers]?.[nature as keyof typeof hpMultipliers['Medium']] || 1
    return Math.round(baseHP * multiplier)
  }

  const calculateBattlePhase = (prowessDie: number) => {
    if (prowessDie >= 12) return 1
    if (prowessDie >= 10) return 2
    if (prowessDie >= 8) return 3
    if (prowessDie >= 6) return 4
    return 5
  }

  const generateMonsterForEncounter = (maxThreat: number) => {
    const category = selectedTypes[Math.floor(Math.random() * selectedTypes.length)]
    const threatDiceOptions = threatDiceByCategory[category as keyof typeof threatDiceByCategory].filter(dice => {
      const [count, die] = dice.split('d').map(Number)
      return count * die <= maxThreat
    })
    
    const threatDice = threatDiceOptions.length > 0 
      ? threatDiceOptions[Math.floor(Math.random() * threatDiceOptions.length)]
      : threatDiceByCategory[category as keyof typeof threatDiceByCategory][0]
    
    const [count, die] = threatDice.split('d').map(Number)
    const threatMV = count * die
    
    const sizes = ['Minuscule', 'Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan']
    let size = 'Medium'
    if (Math.random() * 100 < nonMediumPercentage[0]) {
      const nonMediumSizes = sizes.filter(s => s !== 'Medium')
      size = nonMediumSizes[Math.floor(Math.random() * nonMediumSizes.length)]
    }

    const natures = ['Mundane', 'Magical', 'Preternatural', 'Supernatural']
    let nature = 'Mundane'
    if (Math.random() * 100 < nonMundanePercentage[0]) {
      const nonMundaneNatures = natures.filter(n => n !== 'Mundane')
      nature = nonMundaneNatures[Math.floor(Math.random() * nonMundaneNatures.length)]
    }

    let creatureType = 'Normal'
    if (Math.random() * 100 < specialTypePercentage[0]) {
      creatureType = Math.random() < 0.5 ? 'Fast' : 'Tough'
    }
    
    const hitPoints = calculateHitPoints(threatMV, size, nature)
    
    let activeDefense, passiveDefense
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
      activeDefense,
      passiveDefense,
      savingThrow,
      battlePhase
    }
  }

  const generateEncounter = () => {
    if (selectedTypes.length === 0) {
      alert("Please select at least one creature type.")
      return
    }

    const defenseKey = defenseLevels[defenseLevel[0] - 1] as keyof typeof encounterDifficultyTable[1]
    const threatScore = encounterDifficultyTable[partySize[0] as keyof typeof encounterDifficultyTable]?.[defenseKey]?.[difficulty[0] - 1]
    
    if (!threatScore) return

    let remainingThreat = threatScore
    const newMonsters: Monster[] = []
    
    while (remainingThreat > 5 && newMonsters.length < 20) {
      const monster = generateMonsterForEncounter(remainingThreat)
      if (monster.threatMV > 0) {
        newMonsters.push(monster)
        remainingThreat -= monster.threatMV
      } else {
        break
      }
    }

    setMonsters(newMonsters)
    setEncounterDetails(`Party Size: ${partySize[0]} | Defense Level: ${defenseLevels[defenseLevel[0] - 1]}
Difficulty: ${difficultyLevels[difficulty[0] - 1]} | Total Threat Score: ${threatScore}`)
  }

  const handleTypeChange = (type: string, checked: boolean) => {
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
          <Sparkles className="text-accent" />
          Advanced Encounter Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label>Party Size: {partySize[0]}</Label>
              <Slider
                value={partySize}
                onValueChange={setPartySize}
                min={1}
                max={4}
                step={1}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Party Defense Level: {defenseLevels[defenseLevel[0] - 1]}</Label>
              <Slider
                value={defenseLevel}
                onValueChange={setDefenseLevel}
                min={1}
                max={5}
                step={1}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Desired Difficulty: {difficultyLevels[difficulty[0] - 1]}</Label>
              <Slider
                value={difficulty}
                onValueChange={setDifficulty}
                min={1}
                max={6}
                step={1}
                className="mt-2"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Non-Medium Size %: {nonMediumPercentage[0]}%</Label>
              <Slider
                value={nonMediumPercentage}
                onValueChange={setNonMediumPercentage}
                min={0}
                max={100}
                step={5}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Non-Mundane Nature %: {nonMundanePercentage[0]}%</Label>
              <Slider
                value={nonMundanePercentage}
                onValueChange={setNonMundanePercentage}
                min={0}
                max={100}
                step={5}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Fast/Tough Creature %: {specialTypePercentage[0]}%</Label>
              <Slider
                value={specialTypePercentage}
                onValueChange={setSpecialTypePercentage}
                min={0}
                max={100}
                step={5}
                className="mt-2"
              />
            </div>
          </div>
        </div>

        <div>
          <Label className="mb-3 block">Creature Types</Label>
          <div className="flex flex-wrap gap-4">
            {['Minor', 'Standard', 'Exceptional', 'Legendary'].map(type => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={type}
                  checked={selectedTypes.includes(type)}
                  onCheckedChange={(checked) => handleTypeChange(type, checked as boolean)}
                />
                <Label htmlFor={type}>{type}</Label>
              </div>
            ))}
          </div>
        </div>

        <Button onClick={generateEncounter} className="w-full">
          Generate Encounter
        </Button>

        {encounterDetails && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Encounter Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-mono text-sm whitespace-pre-line mb-4">
                {encounterDetails}
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Creatures</h3>
                {monsters.map((monster, index) => (
                  <Card key={monster.id} className="bg-muted/20">
                    <CardContent className="pt-4">
                      <div className="font-mono text-sm">
                        <div className="font-semibold mb-2">
                          Monster {index + 1}: {monster.creatureType} {monster.size} {monster.nature} {monster.category}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                          <div>TD: {monster.threatDice} (MV: {monster.threatMV})</div>
                          <div>HP: {monster.hitPoints} ({monster.activeDefense}A/{monster.passiveDefense}P)</div>
                          <div>ST: {monster.savingThrow}</div>
                          <div>BP: {monster.battlePhase}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  )
}