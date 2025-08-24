import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart, Calculator } from "@phosphor-icons/react"

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
    '1': 'Mundane',
    '2': 'Magical', 
    '3': 'Preternatural',
    '4': 'Supernatural'
  }

  const sizeValues = {
    '0': 'Minuscule or Tiny',
    '1': 'Small or Medium',
    '2': 'Large',
    '3': 'Huge',
    '4': 'Gargantuan'
  }

  const calculateMonsterHP = () => {
    if (!monsterNature || !monsterSize || !threatTier1) {
      alert("Please select monster nature, size, and at least the first threat tier.")
      return
    }

    const nature = parseFloat(monsterNature)
    const size = parseFloat(monsterSize)
    const tier1 = parseInt(threatTier1)
    const tier2 = parseInt(threatTier2)
    const tier3 = parseInt(threatTier3)

    // Calculate total modifier: (size + nature) / 2
    const totalModifier = (size + nature) / 2
    
    // Calculate total hit points from threat dice
    const totalHitPoints = tier1 + tier2 + tier3
    
    // Apply modifier and round up
    const finalHitPoints = Math.ceil(totalHitPoints * totalModifier)
    
    // Determine threat level
    let threatLevel = "a Minor"
    if (tier3 > 0) {
      threatLevel = "an Exceptional"
    } else if (tier2 > 0) {
      threatLevel = "a Standard"
    }

    // Create calculation breakdown
    const calculation = `Base HP: ${totalHitPoints} (${tier1}${tier2 > 0 ? ` + ${tier2}` : ''}${tier3 > 0 ? ` + ${tier3}` : ''})
Modifier: ${totalModifier} ((${size} size + ${nature} nature) ÷ 2)
Final HP: ${totalHitPoints} × ${totalModifier} = ${finalHitPoints}`

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
                  <SelectItem value="1">Mundane</SelectItem>
                  <SelectItem value="2">Magical</SelectItem>
                  <SelectItem value="3">Preternatural</SelectItem>
                  <SelectItem value="4">Supernatural</SelectItem>
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
                  <SelectItem value="0">Minuscule or Tiny</SelectItem>
                  <SelectItem value="1">Small or Medium</SelectItem>
                  <SelectItem value="2">Large</SelectItem>
                  <SelectItem value="3">Huge</SelectItem>
                  <SelectItem value="4">Gargantuan</SelectItem>
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
                      <span className="font-medium">Nature:</span> {natureValues[monsterNature as keyof typeof natureValues]}
                    </div>
                    <div>
                      <span className="font-medium">Size:</span> {sizeValues[monsterSize as keyof typeof sizeValues]}
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
            <p><strong>Size Modifier:</strong> 0 (Tiny) to 4 (Gargantuan)</p>
            <p><strong>Nature Modifier:</strong> 1 (Mundane) to 4 (Supernatural)</p>
            <p><strong>Final HP:</strong> MV × ((Size + Nature) ÷ 2), rounded up</p>
            <p><strong>Threat Level:</strong> Determined by highest tier with dice assigned</p>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}