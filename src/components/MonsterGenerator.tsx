import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Heart, Calculator, Sparkles, Eye } from "@phosphor-icons/react"
import { HIT_POINT_MODIFIERS, BATTLE_PHASES } from '@/data/gameData'

interface MonsterResult {
  finalHitPoints: number
  threatLevel: string
  totalMV: number
  calculation: string
  activeDefense: number
  passiveDefense: number
  battlePhase: number
  savingThrow: string
  creatureType: string
  trope?: string
}

const creatureTropes = [
  { name: 'Goblinoid', description: 'Cunning and covetous creatures with bestial ferocity and reptilian traits' },
  { name: 'Alfar', description: 'Magical humanoids including elves, dwarves, gnomes, and halflings' },
  { name: 'Drakkin', description: 'Humanoids with draconic power, warrior-scholars or guardians' },
  { name: 'Beast', description: 'Natural animals and creatures of the wild' },
  { name: 'Undead', description: 'Preternatural beings born of nightmare storms and psychic echoes' },
  { name: 'Fiend', description: 'Supernatural manifestations of evil and chaos' },
  { name: 'Celestial', description: 'Supernatural beings of divine or angelic nature' },
  { name: 'Elemental', description: 'Beings of pure elemental force and energy' },
  { name: 'Construct', description: 'Artificial beings created through magic or technology' },
  { name: 'Aberration', description: 'Alien and unnatural creatures that defy understanding' }
]

export default function MonsterGenerator() {
  const [monsterNature, setMonsterNature] = useState('')
  const [monsterSize, setMonsterSize] = useState('')
  const [threatTier1, setThreatTier1] = useState('')
  const [threatTier2, setThreatTier2] = useState('0')
  const [threatTier3, setThreatTier3] = useState('0')
  const [fastTough, setFastTough] = useState('')
  const [includeTrope, setIncludeTrope] = useState(false)
  const [result, setResult] = useState<MonsterResult | null>(null)

  const calculateBattlePhase = (prowessDie: number) => {
    const dieKey = `d${prowessDie}` as keyof typeof BATTLE_PHASES
    return BATTLE_PHASES[dieKey]?.phase || 5
  }

  const generateMonster = () => {
    if (!monsterNature || !monsterSize || !threatTier1) {
      alert("Please select monster nature, size, and at least the first threat tier.")
      return
    }

    const tier1 = parseInt(threatTier1)
    const tier2 = parseInt(threatTier2)
    const tier3 = parseInt(threatTier3)
    
    // Calculate total hit points from threat dice (MV)
    const totalHitPoints = tier1 + tier2 + tier3
    
    // Get multiplier from hit point modifiers table
    const multiplier = HIT_POINT_MODIFIERS[monsterSize as keyof typeof HIT_POINT_MODIFIERS]?.[monsterNature as keyof typeof HIT_POINT_MODIFIERS['Medium']] || 1
    
    // Apply modifier and round
    const finalHitPoints = Math.round(totalHitPoints * multiplier)
    
    // Determine threat level
    let threatLevel = "Minor"
    let categoryIndex = 0
    if (tier3 > 0) {
      threatLevel = "Exceptional"
      categoryIndex = 2
    } else if (tier2 > 0) {
      threatLevel = "Standard"
      categoryIndex = 1
    }

    // Calculate defense pools based on Fast/Tough selection
    let activeDefense, passiveDefense
    let creatureType = 'Normal'
    
    if (fastTough === 'fast') {
      creatureType = 'Fast'
      activeDefense = Math.round(finalHitPoints * 0.75)
      passiveDefense = finalHitPoints - activeDefense
    } else if (fastTough === 'tough') {
      creatureType = 'Tough'
      passiveDefense = Math.round(finalHitPoints * 0.75)
      activeDefense = finalHitPoints - passiveDefense
    } else {
      activeDefense = Math.round(finalHitPoints / 2)
      passiveDefense = finalHitPoints - activeDefense
    }

    // Calculate battle phase based on highest threat die
    const highestDie = Math.max(tier1, tier2, tier3)
    const battlePhase = calculateBattlePhase(highestDie)

    // Calculate saving throw based on threat category
    const savingThrow = `d${4 * (categoryIndex + 1)}`

    // Randomly select a trope if requested
    const trope = includeTrope ? creatureTropes[Math.floor(Math.random() * creatureTropes.length)] : undefined

    // Create calculation breakdown
    const calculation = `Base HP (MV): ${totalHitPoints} (${tier1}${tier2 > 0 ? ` + ${tier2}` : ''}${tier3 > 0 ? ` + ${tier3}` : ''})
Size/Nature Multiplier: ×${multiplier} (${monsterSize} ${monsterNature})
Final HP: ${totalHitPoints} × ${multiplier} = ${finalHitPoints}

Defense Pool Distribution (${creatureType}):
Active Defense: ${activeDefense}
Passive Defense: ${passiveDefense}

Battle Phase: ${battlePhase} (based on d${highestDie})
Saving Throw: ${savingThrow} (${threatLevel} threat)`

    setResult({
      finalHitPoints,
      threatLevel,
      totalMV: totalHitPoints,
      calculation,
      activeDefense,
      passiveDefense,
      battlePhase,
      savingThrow,
      creatureType,
      trope
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="text-accent" />
          Monster Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="monster-nature">Monster Nature</Label>
              <Select value={monsterNature} onValueChange={setMonsterNature}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Nature" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mundane">Mundane</SelectItem>
                  <SelectItem value="Magical">Magical</SelectItem>
                  <SelectItem value="Preternatural">Preternatural</SelectItem>
                  <SelectItem value="Supernatural">Supernatural</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="monster-size">Monster Size</Label>
              <Select value={monsterSize} onValueChange={setMonsterSize}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Minuscule">Minuscule</SelectItem>
                  <SelectItem value="Tiny">Tiny</SelectItem>
                  <SelectItem value="Small">Small</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Large">Large</SelectItem>
                  <SelectItem value="Huge">Huge</SelectItem>
                  <SelectItem value="Gargantuan">Gargantuan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="fast-tough">Creature Type</Label>
              <Select value={fastTough} onValueChange={setFastTough}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Normal (50/50 split)</SelectItem>
                  <SelectItem value="fast">Fast (75% Active Defense)</SelectItem>
                  <SelectItem value="tough">Tough (75% Passive Defense)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="threat-tier-1">Threat Tier 1 (MV) *</Label>
              <Select value={threatTier1} onValueChange={setThreatTier1}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Threat Tier 1" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4">d4</SelectItem>
                  <SelectItem value="6">d6</SelectItem>
                  <SelectItem value="8">d8</SelectItem>
                  <SelectItem value="10">d10</SelectItem>
                  <SelectItem value="12">d12</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="threat-tier-2">Threat Tier 2 (MV)</Label>
              <Select value={threatTier2} onValueChange={setThreatTier2}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Threat Tier 2" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">None</SelectItem>
                  <SelectItem value="4">d4</SelectItem>
                  <SelectItem value="6">d6</SelectItem>
                  <SelectItem value="8">d8</SelectItem>
                  <SelectItem value="10">d10</SelectItem>
                  <SelectItem value="12">d12</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="threat-tier-3">Threat Tier 3 (MV)</Label>
              <Select value={threatTier3} onValueChange={setThreatTier3}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Threat Tier 3" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">None</SelectItem>
                  <SelectItem value="4">d4</SelectItem>
                  <SelectItem value="6">d6</SelectItem>
                  <SelectItem value="8">d8</SelectItem>
                  <SelectItem value="10">d10</SelectItem>
                  <SelectItem value="12">d12</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="include-trope"
            checked={includeTrope}
            onCheckedChange={(checked) => setIncludeTrope(checked as boolean)}
          />
          <Label htmlFor="include-trope" className="text-sm">
            Include random creature trope/category
          </Label>
        </div>

        <Button onClick={generateMonster} className="w-full">
          <Calculator size={16} className="mr-2" />
          Generate Monster
        </Button>

        {result && (
          <Card className="bg-muted/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="text-accent" />
                Monster Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {result.trope && (
                  <div className="border-b pb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="text-accent" size={16} />
                      <h4 className="font-semibold">{result.trope.name}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground italic">
                      {result.trope.description}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="bg-background p-3 rounded border">
                    <div className="text-2xl font-bold text-accent">
                      {result.finalHitPoints}
                    </div>
                    <div className="text-xs text-muted-foreground">Hit Points</div>
                  </div>
                  <div className="bg-background p-3 rounded border">
                    <div className="text-2xl font-bold text-primary">
                      {result.activeDefense}A/{result.passiveDefense}P
                    </div>
                    <div className="text-xs text-muted-foreground">Defense Pools</div>
                  </div>
                  <div className="bg-background p-3 rounded border">
                    <div className="text-2xl font-bold text-secondary">
                      {result.battlePhase}
                    </div>
                    <div className="text-xs text-muted-foreground">Battle Phase</div>
                  </div>
                  <div className="bg-background p-3 rounded border">
                    <div className="text-2xl font-bold text-muted">
                      {result.savingThrow}
                    </div>
                    <div className="text-xs text-muted-foreground">Saving Throw</div>
                  </div>
                </div>
                
                <div className="text-center text-lg text-muted-foreground">
                  {result.creatureType} {monsterSize} {monsterNature} {result.threatLevel} threat (MV {result.totalMV})
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Calculation Breakdown:</h4>
                  <div className="font-mono text-sm whitespace-pre-line bg-background p-3 rounded border">
                    {result.calculation}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="bg-muted/10">
          <CardHeader>
            <CardTitle className="text-lg">Creature Natures</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p><strong>Mundane:</strong> Ordinary denizens lacking innate arcane spark</p>
            <p><strong>Magical:</strong> Beings who draw on ambient Meterea and primal forces</p>
            <p><strong>Preternatural:</strong> Born of nightmare storms and raw dream-stuff</p>
            <p><strong>Supernatural:</strong> Meterea's refined manifestations like gods, titans, and dragons</p>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}