import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart, Calculator } from "@phosphor-icons/react"
import { HIT_POINT_MODIFIERS } from '@/data/gameData'

interface MonsterHPResult {
  finalHitPoints: number
  threatLevel: string
  totalMV: number
  calculation: string
}

export default function MonsterHPCalculator() {
  const [monsterNature, setMonsterNature] = useState('')
  const [monsterSize, setMonsterSize] = useState('')
  const [threatTier1, setThreatTier1] = useState('')
  const [threatTier2, setThreatTier2] = useState('0')
  const [threatTier3, setThreatTier3] = useState('0')
  const [result, setResult] = useState<MonsterHPResult | null>(null)

  const natureValues = {
    'Mundane': 'Mundane',
    'Magical': 'Magical', 
    'Preternatural': 'Preternatural',
    'Supernatural': 'Supernatural'
  }

  const sizeValues = {
    'Minuscule': 'Minuscule',
    'Tiny': 'Tiny',
    'Small': 'Small',
    'Medium': 'Medium',
    'Large': 'Large',
    'Huge': 'Huge',
    'Gargantuan': 'Gargantuan'
  }

  const calculateMonsterHP = () => {
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
    let threatLevel = "a Minor"
    if (tier3 > 0) {
      threatLevel = "an Exceptional"
    } else if (tier2 > 0) {
      threatLevel = "a Standard"
    }

    // Create calculation breakdown
    const calculation = `Base HP (MV): ${totalHitPoints} (${tier1}${tier2 > 0 ? ` + ${tier2}` : ''}${tier3 > 0 ? ` + ${tier3}` : ''})
Size/Nature Multiplier: ×${multiplier} (${monsterSize} ${monsterNature})
Final HP: ${totalHitPoints} × ${multiplier} = ${finalHitPoints}`

    setResult({
      finalHitPoints,
      threatLevel,
      totalMV: totalHitPoints,
      calculation
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="text-accent" />
          Monster HP Calculator
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

        <Button onClick={calculateMonsterHP} className="w-full">
          <Calculator size={16} className="mr-2" />
          Calculate Hit Points
        </Button>

        {result && (
          <Card className="bg-muted/20">
            <CardHeader>
              <CardTitle className="text-lg">Calculation Result</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent mb-2">
                    {result.finalHitPoints} HP
                  </div>
                  <div className="text-lg text-muted-foreground">
                    This creature is {result.threatLevel} threat (MV {result.totalMV})
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Calculation Breakdown:</h4>
                  <div className="font-mono text-sm whitespace-pre-line bg-background p-3 rounded border">
                    {result.calculation}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Monster Details:</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Nature:</span> {monsterNature}
                    </div>
                    <div>
                      <span className="font-medium">Size:</span> {monsterSize}
                    </div>
                    <div>
                      <span className="font-medium">Threat Dice:</span> 
                      {threatTier1 && ` d${threatTier1}`}
                      {threatTier2 !== '0' && ` + d${threatTier2}`}
                      {threatTier3 !== '0' && ` + d${threatTier3}`}
                    </div>
                    <div>
                      <span className="font-medium">Total MV:</span> {result.totalMV}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="bg-muted/10">
          <CardHeader>
            <CardTitle className="text-lg">How It Works</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p><strong>Monster Value (MV):</strong> Sum of all threat dice maximum values</p>
            <p><strong>Size & Nature:</strong> Each combination has specific multipliers from official table</p>
            <p><strong>Final HP:</strong> MV × Size/Nature Multiplier (see Hit Point Modifiers table)</p>
            <p><strong>Threat Level:</strong> Determined by highest tier with dice assigned</p>
            <p><strong>Examples:</strong> Medium Mundane (×1), Large Magical (×2), Huge Supernatural (×3.5)</p>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}