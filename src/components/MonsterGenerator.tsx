import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { 
  CREATURE_SIZES, 
  CREATURE_NATURES, 
  CREATURE_TYPES 
} from '@/data/gameData'
import { 
  calculateHitPoints, 
  calculateBattlePhase, 
  parseThreatDice 
} from '@/utils/gameUtils'

interface Monster {
  name: string
  type: string
  size: string
  nature: string
  meleeAttack: string
  naturalAttack: string
  rangedAttack: string
  arcaneAttack: string
  damageReduction: string
  savingThrow: string
  hitPoints: number
  activeDefense: number
  passiveDefense: number
  battlePhase: number
  notes: string
}

const MonsterGenerator: React.FC = () => {
  const [monster, setMonster] = useState<Monster>({
    name: '',
    type: 'Standard',
    size: 'Medium',
    nature: 'Mundane',
    meleeAttack: '2d6',
    naturalAttack: '',
    rangedAttack: '',
    arcaneAttack: '',
    damageReduction: 'd6',
    savingThrow: 'd8',
    hitPoints: 0,
    activeDefense: 0,
    passiveDefense: 0,
    battlePhase: 0,
    notes: ''
  })

  const [generatedOutput, setGeneratedOutput] = useState<string>('')

  // Get available threat dice options based on creature type
  const getThreatDiceOptions = (type: string, isPrimary: boolean = false) => {
    const options: string[] = []
    
    if (type === 'Minor') {
      options.push('1d4', '1d6', '1d8', '1d10', '1d12')
    } else if (type === 'Standard') {
      if (isPrimary) {
        options.push('2d4', '2d6', '2d8', '2d10', '2d12')
      } else {
        options.push('', '1d4', '1d6', '1d8', '1d10', '1d12', '2d4', '2d6', '2d8', '2d10', '2d12')
      }
    } else if (type === 'Exceptional') {
      if (isPrimary) {
        options.push('3d4', '3d6', '3d8', '3d10', '3d12')
      } else {
        options.push('', '1d4', '1d6', '1d8', '1d10', '1d12', '2d4', '2d6', '2d8', '2d10', '2d12', '3d4', '3d6', '3d8', '3d10', '3d12')
      }
    } else if (type === 'Legendary') {
      if (isPrimary) {
        options.push('3d12', '3d14', '3d16', '3d18', '3d20')
      } else {
        options.push('', '1d4', '1d6', '1d8', '1d10', '1d12', '2d4', '2d6', '2d8', '2d10', '2d12', '3d4', '3d6', '3d8', '3d10', '3d12', '3d12', '3d14', '3d16', '3d18', '3d20')
      }
    }
    
    return options
  }

  const calculateMonster = () => {
    const attacks = [monster.meleeAttack, monster.naturalAttack, monster.rangedAttack, monster.arcaneAttack]
      .filter(attack => attack && attack.trim() !== '')
    
    if (attacks.length === 0) {
      alert('Please specify at least one attack form.')
      return
    }

    // Find the highest MV attack for base HP calculation
    let highestMV = 0
    let primaryAttack = ''
    
    attacks.forEach(attack => {
      const { mv } = parseThreatDice(attack)
      if (mv > highestMV) {
        highestMV = mv
        primaryAttack = attack
      }
    })

    // Calculate hit points
    const { hitPoints } = calculateHitPoints(highestMV, monster.size, monster.nature)
    
    // Calculate defense pools (simplified - using HP/2 for each)
    const activeDefense = Math.round(hitPoints / 2)
    const passiveDefense = hitPoints - activeDefense
    
    // Calculate battle phase from primary attack
    const { die } = parseThreatDice(primaryAttack)
    const battlePhase = calculateBattlePhase(`d${die}`)

    const updatedMonster = {
      ...monster,
      hitPoints,
      activeDefense,
      passiveDefense,
      battlePhase
    }

    setMonster(updatedMonster)
    generateOutput(updatedMonster, highestMV)
  }

  const generateOutput = (monsterData: Monster, baseMV: number) => {
    const attacks = []
    if (monsterData.meleeAttack) attacks.push(`Melee: ${monsterData.meleeAttack}`)
    if (monsterData.naturalAttack) attacks.push(`Natural: ${monsterData.naturalAttack}`)
    if (monsterData.rangedAttack) attacks.push(`Ranged: ${monsterData.rangedAttack}`)
    if (monsterData.arcaneAttack) attacks.push(`Arcane: ${monsterData.arcaneAttack}`)

    const output = `${monsterData.name || 'Unnamed Creature'}
${monsterData.type} ${monsterData.size} ${monsterData.nature} Creature

Base HP (MV): ${baseMV}
TD: ${attacks.join(', ')}
HP: ${monsterData.hitPoints} (${monsterData.activeDefense}A/${monsterData.passiveDefense}P) [${monsterData.size.toLowerCase()}, ${monsterData.nature.toLowerCase()}; HP ×${calculateHitPoints(baseMV, monsterData.size, monsterData.nature).multiplier}]
ST: ${monsterData.savingThrow} (${monsterData.type} threat)
BP: ${monsterData.battlePhase}
DR: ${monsterData.damageReduction}

${monsterData.notes ? `Notes: ${monsterData.notes}` : ''}`

    setGeneratedOutput(output)
  }

  const getTypeDescription = (type: string) => {
    switch (type) {
      case 'Minor':
        return 'Single attack die (1d4 to 1d12)'
      case 'Standard':
        return 'Two attack dice as primary (2d4 to 2d12), others can be lower'
      case 'Exceptional':
        return 'Three attack dice as primary (3d4 to 3d12), others can be lower'
      case 'Legendary':
        return 'Three or more attack dice (3d12+), can use d14-d20'
      default:
        return ''
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Monster Generator</CardTitle>
          <CardDescription>
            Create detailed creature stat blocks for Eldritch RPG
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Creature Name</Label>
              <Input
                id="name"
                value={monster.name}
                onChange={(e) => setMonster({ ...monster, name: e.target.value })}
                placeholder="Enter creature name"
              />
            </div>
            <div>
              <Label htmlFor="type">Creature Type</Label>
              <Select value={monster.type} onValueChange={(value) => setMonster({ ...monster, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CREATURE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-1">
                {getTypeDescription(monster.type)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="size">Size</Label>
              <Select value={monster.size} onValueChange={(value) => setMonster({ ...monster, size: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CREATURE_SIZES.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="nature">Nature</Label>
              <Select value={monster.nature} onValueChange={(value) => setMonster({ ...monster, nature: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CREATURE_NATURES.map((nature) => (
                    <SelectItem key={nature} value={nature}>
                      {nature}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Attack Forms */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Attack Forms</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="melee">Melee Attack</Label>
                <Select 
                  value={monster.meleeAttack} 
                  onValueChange={(value) => setMonster({ ...monster, meleeAttack: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getThreatDiceOptions(monster.type, true).map((option) => (
                      <SelectItem key={option} value={option}>
                        {option || 'None'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="natural">Natural Attack</Label>
                <Select 
                  value={monster.naturalAttack} 
                  onValueChange={(value) => setMonster({ ...monster, naturalAttack: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getThreatDiceOptions(monster.type, false).map((option) => (
                      <SelectItem key={option} value={option}>
                        {option || 'None'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="ranged">Ranged Attack</Label>
                <Select 
                  value={monster.rangedAttack} 
                  onValueChange={(value) => setMonster({ ...monster, rangedAttack: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getThreatDiceOptions(monster.type, false).map((option) => (
                      <SelectItem key={option} value={option}>
                        {option || 'None'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="arcane">Arcane Attack</Label>
                <Select 
                  value={monster.arcaneAttack} 
                  onValueChange={(value) => setMonster({ ...monster, arcaneAttack: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getThreatDiceOptions(monster.type, false).map((option) => (
                      <SelectItem key={option} value={option}>
                        {option || 'None'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Defenses */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Defenses</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="damageReduction">Damage Reduction</Label>
                <Select 
                  value={monster.damageReduction} 
                  onValueChange={(value) => setMonster({ ...monster, damageReduction: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    <SelectItem value="d4">d4 (Hide/Natural)</SelectItem>
                    <SelectItem value="d6">d6 (Leather/Scales)</SelectItem>
                    <SelectItem value="d8">d8 (Chain/Plates)</SelectItem>
                    <SelectItem value="d10">d10 (Plate/Shell)</SelectItem>
                    <SelectItem value="d12">d12 (Magic)</SelectItem>
                    <SelectItem value="+1">+1 (Light Armor)</SelectItem>
                    <SelectItem value="+2">+2 (Medium Armor)</SelectItem>
                    <SelectItem value="+3">+3 (Heavy Armor)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="savingThrow">Saving Throw</Label>
                <Select 
                  value={monster.savingThrow} 
                  onValueChange={(value) => setMonster({ ...monster, savingThrow: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="d4">d4 (Minor threat)</SelectItem>
                    <SelectItem value="d8">d8 (Standard threat)</SelectItem>
                    <SelectItem value="d12">d12 (Exceptional threat)</SelectItem>
                    <SelectItem value="d16">d16 (Legendary threat)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={monster.notes}
              onChange={(e) => setMonster({ ...monster, notes: e.target.value })}
              placeholder="Special abilities, equipment, lore, etc."
              rows={3}
            />
          </div>

          <Button onClick={calculateMonster} className="w-full">
            Generate Monster
          </Button>
        </CardContent>
      </Card>

      {generatedOutput && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Monster Stat Block</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap font-mono text-sm bg-muted p-4 rounded-lg">
              {generatedOutput}
            </pre>
            <div className="mt-4 flex gap-2">
              <Badge variant="outline">
                HP: {monster.hitPoints}
              </Badge>
              <Badge variant="outline">
                BP: {monster.battlePhase}
              </Badge>
              <Badge variant="outline">
                {monster.activeDefense}A/{monster.passiveDefense}P
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default MonsterGenerator