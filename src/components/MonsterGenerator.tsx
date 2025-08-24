import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Heart, Calculator, Sparkles, Eye, Sword, Shield, Zap } from "@phosphor-icons/react"
import { HIT_POINT_MODIFIERS, BATTLE_PHASES } from '@/data/gameData'

interface ThreatDice {
  melee?: string
  natural?: string
  ranged?: string
  arcane?: string
}

interface MonsterResult {
  // Basic info
  name: string
  type: string // Minor, Standard, Exceptional, Legendary
  size: string
  nature: string
  creatureVariant: string // Normal, Fast, Tough
  
  // Combat stats
  hitPoints: number
  activeDefense: number
  passiveDefense: number
  battlePhase: number
  savingThrow: string
  
  // Threat dice for different attack types
  threatDice: ThreatDice
  maxThreatMV: number
  
  // Defense and special abilities
  damageReduction?: string
  extraAttacks?: string[]
  specialAbilities?: string[]
  equipment?: string[]
  
  // Calculation details
  hpCalculation: string
  hpMultiplier: number
  
  // Notes
  notes?: string
}



// Threat dice combinations by category and tier
const threatDiceCombinations = {
  Minor: [
    { dice: '1d4', mv: 4 },
    { dice: '1d6', mv: 6 },
    { dice: '1d8', mv: 8 },
    { dice: '1d10', mv: 10 },
    { dice: '1d12', mv: 12 }
  ],
  Standard: [
    { dice: '2d4', mv: 8 },
    { dice: '2d6', mv: 12 },
    { dice: '2d8', mv: 16 },
    { dice: '2d10', mv: 20 },
    { dice: '2d12', mv: 24 }
  ],
  Exceptional: [
    { dice: '3d4', mv: 12 },
    { dice: '3d6', mv: 18 },
    { dice: '3d8', mv: 24 },
    { dice: '3d10', mv: 30 },
    { dice: '3d12', mv: 36 }
  ],
  Legendary: [
    { dice: '3d12', mv: 36 },
    { dice: '4d10', mv: 40 },
    { dice: '4d12', mv: 48 },
    { dice: '5d10', mv: 50 },
    { dice: '5d12', mv: 60 }
  ]
}

// Armor types for damage reduction - includes both natural and worn armor
const armorTypes = [
  { name: 'None', dr: 'None' },
  { name: 'Hide (Natural)', dr: '1d4' },
  { name: 'Leather Armor', dr: '1d6' },
  { name: 'Chainmail', dr: '1d8' },
  { name: 'Plate Armor', dr: '1d10' },
  { name: 'Magical Protection', dr: '1d12' },
  { name: 'Tough Scales (Natural)', dr: '1d6' },
  { name: 'Armored Plates (Natural)', dr: '1d8' },
  { name: 'Stone Skin (Natural)', dr: '1d10' },
  { name: 'Studded Leather', dr: '1d6+1' },
  { name: 'Brigandine', dr: '1d8+1' },
  { name: 'Full Plate', dr: '1d10+2' }
]



export default function MonsterGenerator() {
  // Basic creature info
  const [creatureName, setCreatureName] = useState('')
  const [monsterNature, setMonsterNature] = useState('')
  const [monsterSize, setMonsterSize] = useState('')
  const [creatureType, setCreatureType] = useState('')
  const [fastTough, setFastTough] = useState('normal')
  
  // Combat stats
  const [meleeAttack, setMeleeAttack] = useState('')
  const [naturalAttack, setNaturalAttack] = useState('')
  const [rangedAttack, setRangedAttack] = useState('')
  const [arcaneAttack, setArcaneAttack] = useState('')
  const [damageReduction, setDamageReduction] = useState('')
  const [extraAttacks, setExtraAttacks] = useState('')
  const [notes, setNotes] = useState('')
  
  const [result, setResult] = useState<MonsterResult | null>(null)

  // Get available threat dice options based on selected creature type
  const getAvailableThreatDice = (currentAttackType: string, selectedType: string) => {
    if (!selectedType) {
      // If no type selected, show all options
      return [
        { value: 'None', label: 'None' },
        { value: '1d4', label: '1d4 (Minor)', category: 'Minor' },
        { value: '1d6', label: '1d6 (Minor)', category: 'Minor' },
        { value: '1d8', label: '1d8 (Minor)', category: 'Minor' },
        { value: '1d10', label: '1d10 (Minor)', category: 'Minor' },
        { value: '1d12', label: '1d12 (Minor)', category: 'Minor' },
        { value: '2d4', label: '2d4 (Standard)', category: 'Standard' },
        { value: '2d6', label: '2d6 (Standard)', category: 'Standard' },
        { value: '2d8', label: '2d8 (Standard)', category: 'Standard' },
        { value: '2d10', label: '2d10 (Standard)', category: 'Standard' },
        { value: '2d12', label: '2d12 (Standard)', category: 'Standard' },
        { value: '3d4', label: '3d4 (Exceptional)', category: 'Exceptional' },
        { value: '3d6', label: '3d6 (Exceptional)', category: 'Exceptional' },
        { value: '3d8', label: '3d8 (Exceptional)', category: 'Exceptional' },
        { value: '3d10', label: '3d10 (Exceptional)', category: 'Exceptional' },
        { value: '3d12', label: '3d12 (Exceptional)', category: 'Exceptional' },
        { value: '4d10', label: '4d10 (Legendary)', category: 'Legendary' },
        { value: '4d12', label: '4d12 (Legendary)', category: 'Legendary' },
        { value: '5d10', label: '5d10 (Legendary)', category: 'Legendary' },
        { value: '5d12', label: '5d12 (Legendary)', category: 'Legendary' }
      ]
    }

    const baseOptions = [{ value: 'None', label: 'None' }]
    
    switch (selectedType) {
      case 'Minor':
        return [
          ...baseOptions,
          { value: '1d4', label: '1d4 (Minor)', category: 'Minor' },
          { value: '1d6', label: '1d6 (Minor)', category: 'Minor' },
          { value: '1d8', label: '1d8 (Minor)', category: 'Minor' },
          { value: '1d10', label: '1d10 (Minor)', category: 'Minor' },
          { value: '1d12', label: '1d12 (Minor)', category: 'Minor' }
        ]
      
      case 'Standard':
        return [
          ...baseOptions,
          { value: '1d4', label: '1d4 (Minor)', category: 'Minor' },
          { value: '1d6', label: '1d6 (Minor)', category: 'Minor' },
          { value: '1d8', label: '1d8 (Minor)', category: 'Minor' },
          { value: '1d10', label: '1d10 (Minor)', category: 'Minor' },
          { value: '1d12', label: '1d12 (Minor)', category: 'Minor' },
          { value: '2d4', label: '2d4 (Standard)', category: 'Standard' },
          { value: '2d6', label: '2d6 (Standard)', category: 'Standard' },
          { value: '2d8', label: '2d8 (Standard)', category: 'Standard' },
          { value: '2d10', label: '2d10 (Standard)', category: 'Standard' },
          { value: '2d12', label: '2d12 (Standard)', category: 'Standard' }
        ]
      
      case 'Exceptional':
        return [
          ...baseOptions,
          { value: '1d4', label: '1d4 (Minor)', category: 'Minor' },
          { value: '1d6', label: '1d6 (Minor)', category: 'Minor' },
          { value: '1d8', label: '1d8 (Minor)', category: 'Minor' },
          { value: '1d10', label: '1d10 (Minor)', category: 'Minor' },
          { value: '1d12', label: '1d12 (Minor)', category: 'Minor' },
          { value: '2d4', label: '2d4 (Standard)', category: 'Standard' },
          { value: '2d6', label: '2d6 (Standard)', category: 'Standard' },
          { value: '2d8', label: '2d8 (Standard)', category: 'Standard' },
          { value: '2d10', label: '2d10 (Standard)', category: 'Standard' },
          { value: '2d12', label: '2d12 (Standard)', category: 'Standard' },
          { value: '3d4', label: '3d4 (Exceptional)', category: 'Exceptional' },
          { value: '3d6', label: '3d6 (Exceptional)', category: 'Exceptional' },
          { value: '3d8', label: '3d8 (Exceptional)', category: 'Exceptional' },
          { value: '3d10', label: '3d10 (Exceptional)', category: 'Exceptional' },
          { value: '3d12', label: '3d12 (Exceptional)', category: 'Exceptional' }
        ]
      
      case 'Legendary':
        return [
          ...baseOptions,
          { value: '1d4', label: '1d4 (Minor)', category: 'Minor' },
          { value: '1d6', label: '1d6 (Minor)', category: 'Minor' },
          { value: '1d8', label: '1d8 (Minor)', category: 'Minor' },
          { value: '1d10', label: '1d10 (Minor)', category: 'Minor' },
          { value: '1d12', label: '1d12 (Minor)', category: 'Minor' },
          { value: '2d4', label: '2d4 (Standard)', category: 'Standard' },
          { value: '2d6', label: '2d6 (Standard)', category: 'Standard' },
          { value: '2d8', label: '2d8 (Standard)', category: 'Standard' },
          { value: '2d10', label: '2d10 (Standard)', category: 'Standard' },
          { value: '2d12', label: '2d12 (Standard)', category: 'Standard' },
          { value: '3d4', label: '3d4 (Exceptional)', category: 'Exceptional' },
          { value: '3d6', label: '3d6 (Exceptional)', category: 'Exceptional' },
          { value: '3d8', label: '3d8 (Exceptional)', category: 'Exceptional' },
          { value: '3d10', label: '3d10 (Exceptional)', category: 'Exceptional' },
          { value: '3d12', label: '3d12 (Exceptional)', category: 'Exceptional' },
          { value: '4d10', label: '4d10 (Legendary)', category: 'Legendary' },
          { value: '4d12', label: '4d12 (Legendary)', category: 'Legendary' },
          { value: '5d10', label: '5d10 (Legendary)', category: 'Legendary' },
          { value: '5d12', label: '5d12 (Legendary)', category: 'Legendary' }
        ]
      
      default:
        return baseOptions
    }
  }

  // Helper to determine if the current attack selection meets threat type requirements
  const validateThreatTypeRequirements = (selectedType: string) => {
    if (!selectedType) return true // No validation needed if no type selected
    
    const attacks = [meleeAttack, naturalAttack, rangedAttack, arcaneAttack]
      .filter(attack => attack && attack !== 'None')
      .map(attack => parseThreatDice(attack!))
    
    if (attacks.length === 0) return true // Will be handled by generateMonster
    
    const diceNumbers = attacks.map(a => {
      const match = a.dice.match(/(\d+)d/)
      return match ? parseInt(match[1]) : 1
    })
    
    const maxDice = Math.max(...diceNumbers)
    
    switch (selectedType) {
      case 'Minor':
        // All attacks must be 1 die
        return maxDice === 1
      case 'Standard':
        // At least one attack must be 2 dice, none can be more than 2 dice
        return maxDice === 2 && diceNumbers.includes(2)
      case 'Exceptional':
        // At least one attack must be 3 dice, none can be more than 3 dice
        // But other attacks can be lower (1d# or 2d#)
        return maxDice === 3 && diceNumbers.includes(3)
      case 'Legendary':
        // Must have at least 3 dice AND either 4+ dice OR high die values
        return maxDice >= 3 && (
          maxDice >= 4 || 
          attacks.some(a => {
            const match = a.dice.match(/(\d+)d(\d+)/)
            return match && parseInt(match[1]) >= 3 && parseInt(match[2]) >= 12
          })
        )
      default:
        return true
    }
  }

  const calculateBattlePhase = (prowessDie: number) => {
    const dieKey = `d${prowessDie}` as keyof typeof BATTLE_PHASES
    return BATTLE_PHASES[dieKey]?.phase || 5
  }

  const parseThreatDice = (diceString: string) => {
    if (!diceString || diceString === 'None') return { dice: '', mv: 0 }
    
    // Handle formats like "2d8", "3d10", etc.
    const match = diceString.match(/(\d+)d(\d+)/)
    if (match) {
      const numDice = parseInt(match[1])
      const dieSize = parseInt(match[2])
      return { dice: diceString, mv: numDice * dieSize }
    }
    
    return { dice: diceString, mv: 0 }
  }

  const determineThreatType = (threatDice: ThreatDice) => {
    const attacks = [threatDice.melee, threatDice.natural, threatDice.ranged, threatDice.arcane]
      .filter(Boolean)
      .map(attack => parseThreatDice(attack!))
    
    if (attacks.length === 0) return 'Minor'
    
    const maxDice = Math.max(...attacks.map(a => {
      const match = a.dice.match(/(\d+)d/)
      return match ? parseInt(match[1]) : 1
    }))
    
    if (maxDice >= 3) {
      // Check if it's legendary (high dice values or special combinations)
      const hasHighDice = attacks.some(a => {
        const match = a.dice.match(/\d+d(\d+)/)
        return match && parseInt(match[1]) >= 12
      }) && maxDice >= 4
      
      return hasHighDice ? 'Legendary' : 'Exceptional'
    } else if (maxDice === 2) {
      return 'Standard'
    } else {
      return 'Minor'
    }
  }

  const generateRandomThreatDice = (type: string) => {
    const combinations = threatDiceCombinations[type as keyof typeof threatDiceCombinations]
    if (!combinations) return { dice: '1d4', mv: 4 }
    
    const randomIndex = Math.floor(Math.random() * combinations.length)
    return combinations[randomIndex]
  }

  const generateMonster = () => {
    if (!monsterNature || !monsterSize) {
      alert("Please select monster nature and size at minimum.")
      return
    }

    // Parse threat dice
    const threatDice: ThreatDice = {}
    let maxThreatMV = 0
    let highestDie = 4

    if (meleeAttack && meleeAttack !== 'None') {
      const parsed = parseThreatDice(meleeAttack)
      threatDice.melee = parsed.dice
      maxThreatMV = Math.max(maxThreatMV, parsed.mv)
      const match = meleeAttack.match(/\d+d(\d+)/)
      if (match) highestDie = Math.max(highestDie, parseInt(match[1]))
    }
    
    if (naturalAttack && naturalAttack !== 'None') {
      const parsed = parseThreatDice(naturalAttack)
      threatDice.natural = parsed.dice
      maxThreatMV = Math.max(maxThreatMV, parsed.mv)
      const match = naturalAttack.match(/\d+d(\d+)/)
      if (match) highestDie = Math.max(highestDie, parseInt(match[1]))
    }
    
    if (rangedAttack && rangedAttack !== 'None') {
      const parsed = parseThreatDice(rangedAttack)
      threatDice.ranged = parsed.dice
      maxThreatMV = Math.max(maxThreatMV, parsed.mv)
      const match = rangedAttack.match(/\d+d(\d+)/)
      if (match) highestDie = Math.max(highestDie, parseInt(match[1]))
    }
    
    if (arcaneAttack && arcaneAttack !== 'None') {
      const parsed = parseThreatDice(arcaneAttack)
      threatDice.arcane = parsed.dice
      maxThreatMV = Math.max(maxThreatMV, parsed.mv)
      const match = arcaneAttack.match(/\d+d(\d+)/)
      if (match) highestDie = Math.max(highestDie, parseInt(match[1]))
    }

    // If no attacks specified, generate a random one based on creature type
    if (maxThreatMV === 0) {
      const defaultType = creatureType || 'Minor'
      const randomThreat = generateRandomThreatDice(defaultType)
      threatDice.melee = randomThreat.dice
      maxThreatMV = randomThreat.mv
      const match = randomThreat.dice.match(/\d+d(\d+)/)
      if (match) highestDie = parseInt(match[1])
    }

    // Determine threat type based on dice
    const determinedType = determineThreatType(threatDice)
    const finalType = creatureType || determinedType
    
    // Get multiplier from hit point modifiers table
    const multiplier = HIT_POINT_MODIFIERS[monsterSize as keyof typeof HIT_POINT_MODIFIERS]?.[monsterNature as keyof typeof HIT_POINT_MODIFIERS['Medium']] || 1
    
    // Calculate hit points
    const baseHP = maxThreatMV
    const finalHitPoints = Math.round(baseHP * multiplier)
    
    // Calculate defense pools based on Fast/Tough selection
    let activeDefense, passiveDefense
    let creatureVariant = 'Normal'
    
    if (fastTough === 'fast') {
      creatureVariant = 'Fast'
      activeDefense = Math.round(finalHitPoints * 0.75)
      passiveDefense = finalHitPoints - activeDefense
    } else if (fastTough === 'tough') {
      creatureVariant = 'Tough'
      passiveDefense = Math.round(finalHitPoints * 0.75)
      activeDefense = finalHitPoints - passiveDefense
    } else {
      activeDefense = Math.round(finalHitPoints / 2)
      passiveDefense = finalHitPoints - activeDefense
    }

    // Calculate battle phase based on highest threat die
    const battlePhase = calculateBattlePhase(highestDie)

    // Calculate saving throw based on threat type
    const typeIndex = ['Minor', 'Standard', 'Exceptional', 'Legendary'].indexOf(finalType)
    const savingThrow = `d${4 * (typeIndex + 1)}`

    // Parse extra attacks
    const extraAttacksList = extraAttacks ? 
      extraAttacks.split(',').map(attack => attack.trim()).filter(Boolean) : []

    // Create HP calculation breakdown
    const hpCalculation = `Base HP (Highest MV): ${baseHP}
Size/Nature Multiplier: ×${multiplier} (${monsterSize} ${monsterNature})
Final HP: ${baseHP} × ${multiplier} = ${finalHitPoints}

Defense Pool Distribution (${creatureVariant}):
Active Defense: ${activeDefense}
Passive Defense: ${passiveDefense}

Battle Phase: ${battlePhase} (based on highest d${highestDie})
Saving Throw: ${savingThrow} (${finalType} threat)`

    setResult({
      name: creatureName || 'Unnamed Creature',
      type: finalType,
      size: monsterSize,
      nature: monsterNature,
      creatureVariant,
      hitPoints: finalHitPoints,
      activeDefense,
      passiveDefense,
      battlePhase,
      savingThrow,
      threatDice,
      maxThreatMV,
      damageReduction: damageReduction || undefined,
      extraAttacks: extraAttacksList.length > 0 ? extraAttacksList : undefined,
      hpCalculation,
      hpMultiplier: multiplier,
      notes: notes || undefined
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
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="creature-name">Creature Name (Optional)</Label>
            <Input
              id="creature-name"
              value={creatureName}
              onChange={(e) => setCreatureName(e.target.value)}
              placeholder="Enter creature name"
            />
          </div>
          
          <div>
            <Label htmlFor="monster-nature">Monster Nature *</Label>
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
            <Label htmlFor="monster-size">Monster Size *</Label>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="creature-type">Threat Type (Optional)</Label>
            <Select value={creatureType} onValueChange={setCreatureType}>
              <SelectTrigger>
                <SelectValue placeholder="Auto-determine from attacks" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Minor">Minor (1 Threat Die)</SelectItem>
                <SelectItem value="Standard">Standard (2 Threat Dice)</SelectItem>
                <SelectItem value="Exceptional">Exceptional (3 Threat Dice)</SelectItem>
                <SelectItem value="Legendary">Legendary (3+ High Dice)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="fast-tough">Creature Variant</Label>
            <Select value={fastTough} onValueChange={setFastTough}>
              <SelectTrigger>
                <SelectValue placeholder="Select Variant" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal (50/50 defense split)</SelectItem>
                <SelectItem value="fast">Fast (75% Active Defense)</SelectItem>
                <SelectItem value="tough">Tough (75% Passive Defense)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Threat Dice (Combat Abilities) */}
        <Card className="bg-muted/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sword className="text-accent" />
              Threat Dice (TD) - Attack Forms
            </CardTitle>
            {creatureType && (
              <div className="text-sm text-muted-foreground">
                {creatureType === 'Minor' && 'Minor threats: All attacks use exactly 1 die (1d4 to 1d12)'}
                {creatureType === 'Standard' && 'Standard threats: At least one attack must be 2d#, others can be 1d# or 2d#'}
                {creatureType === 'Exceptional' && 'Exceptional threats: At least one attack must be 3d#, others can be lower (1d#, 2d#, or 3d#)'}
                {creatureType === 'Legendary' && 'Legendary threats: At least one attack must be 4d# or high 3d# (3d12+), can use d14-d20'}
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="melee-attack">Melee Attack</Label>
                <Select value={meleeAttack} onValueChange={setMeleeAttack}>
                  <SelectTrigger>
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableThreatDice('melee', creatureType).map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="natural-attack">Natural Attack</Label>
                <Select value={naturalAttack} onValueChange={setNaturalAttack}>
                  <SelectTrigger>
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableThreatDice('natural', creatureType).map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="ranged-attack">Ranged Attack</Label>
                <Select value={rangedAttack} onValueChange={setRangedAttack}>
                  <SelectTrigger>
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableThreatDice('ranged', creatureType).map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="arcane-attack">Arcane Attack</Label>
                <Select value={arcaneAttack} onValueChange={setArcaneAttack}>
                  <SelectTrigger>
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableThreatDice('arcane', creatureType).map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {creatureType && !validateThreatTypeRequirements(creatureType) && (
              <div className="bg-destructive/10 border border-destructive/20 rounded p-3">
                <p className="text-sm text-destructive font-medium">
                  ⚠️ Current attack selection doesn't meet {creatureType} threat requirements.
                </p>
                <p className="text-xs text-destructive/80 mt-1">
                  {creatureType === 'Minor' && 'All attacks must use exactly 1 die (1d4 to 1d12).'}
                  {creatureType === 'Standard' && 'At least one attack must use exactly 2 dice (2d4 to 2d12), others can be 1d# or 2d#.'}
                  {creatureType === 'Exceptional' && 'At least one attack must use exactly 3 dice (3d4 to 3d12), others can be lower (1d#, 2d#, or 3d#).'}
                  {creatureType === 'Legendary' && 'At least one attack must use 4+ dice (4d10+) or high 3-dice combinations (3d12+).'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Defense and Special Abilities */}
        <Card className="bg-muted/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="text-accent" />
              Defense & Special Abilities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="damage-reduction">Damage Reduction (DR)</Label>
              <Select value={damageReduction} onValueChange={setDamageReduction}>
                <SelectTrigger>
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  {armorTypes.map((armor) => (
                    <SelectItem key={armor.name} value={armor.dr}>
                      {armor.name} {armor.dr !== 'None' ? `(${armor.dr})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="extra-attacks">Extra Attacks (EA) - Comma separated</Label>
              <Input
                id="extra-attacks"
                value={extraAttacks}
                onChange={(e) => setExtraAttacks(e.target.value)}
                placeholder="e.g., Breath weapon 2d6, Tail slap 1d8"
              />
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <div>
          <Label htmlFor="notes">Notes (Special abilities, equipment, lore)</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter any special abilities, unique equipment, or lore notes..."
            rows={3}
          />
        </div>

        <Button onClick={generateMonster} className="w-full">
          <Calculator size={16} className="mr-2" />
          Generate Complete Monster Stat Block
        </Button>

        {result && (
          <Card className="bg-muted/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="text-accent" />
                Complete Monster Stat Block
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Creature Header */}
                <div className="text-center border-b pb-4">
                  <h3 className="text-2xl font-bold text-accent">
                    {result.name}
                  </h3>
                  <p className="text-lg text-muted-foreground">
                    {result.creatureVariant} {result.size} {result.nature} {result.type}
                  </p>
                </div>

                {/* Key Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="bg-background p-4 rounded border">
                    <div className="text-2xl font-bold text-accent">
                      {result.hitPoints}
                    </div>
                    <div className="text-xs text-muted-foreground">Hit Points</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      ({result.activeDefense}A/{result.passiveDefense}P)
                    </div>
                  </div>
                  <div className="bg-background p-4 rounded border">
                    <div className="text-2xl font-bold text-primary">
                      {result.battlePhase}
                    </div>
                    <div className="text-xs text-muted-foreground">Battle Phase</div>
                  </div>
                  <div className="bg-background p-4 rounded border">
                    <div className="text-2xl font-bold text-secondary">
                      {result.savingThrow}
                    </div>
                    <div className="text-xs text-muted-foreground">Saving Throw</div>
                  </div>
                  <div className="bg-background p-4 rounded border">
                    <div className="text-2xl font-bold text-muted">
                      {result.maxThreatMV}
                    </div>
                    <div className="text-xs text-muted-foreground">Max MV</div>
                  </div>
                </div>

                {/* Threat Dice */}
                <Card className="bg-background/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-md flex items-center gap-2">
                      <Sword className="text-accent" size={16} />
                      Threat Dice (TD)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {result.threatDice.melee && (
                        <div className="flex justify-between">
                          <span className="font-semibold">Melee:</span>
                          <span className="font-mono">{result.threatDice.melee}</span>
                        </div>
                      )}
                      {result.threatDice.natural && (
                        <div className="flex justify-between">
                          <span className="font-semibold">Natural:</span>
                          <span className="font-mono">{result.threatDice.natural}</span>
                        </div>
                      )}
                      {result.threatDice.ranged && (
                        <div className="flex justify-between">
                          <span className="font-semibold">Ranged:</span>
                          <span className="font-mono">{result.threatDice.ranged}</span>
                        </div>
                      )}
                      {result.threatDice.arcane && (
                        <div className="flex justify-between">
                          <span className="font-semibold">Arcane:</span>
                          <span className="font-mono">{result.threatDice.arcane}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Defense and Abilities */}
                {(result.damageReduction || result.extraAttacks) && (
                  <Card className="bg-background/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-md flex items-center gap-2">
                        <Shield className="text-accent" size={16} />
                        Defense & Special Abilities
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {result.damageReduction && result.damageReduction !== 'None' && (
                        <div className="flex justify-between">
                          <span className="font-semibold">Damage Reduction (DR):</span>
                          <span className="font-mono">{result.damageReduction}</span>
                        </div>
                      )}
                      {result.extraAttacks && result.extraAttacks.length > 0 && (
                        <div>
                          <div className="font-semibold mb-1">Extra Attacks (EA):</div>
                          <ul className="list-disc list-inside text-sm space-y-1">
                            {result.extraAttacks.map((attack, index) => (
                              <li key={index} className="font-mono">{attack}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Equipment */}
                {result.notes && (
                  <Card className="bg-background/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-md">Equipment & Special Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm">
                        <Label htmlFor="equipment-notes">Add equipment in Notes section</Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          Use the Notes field below to describe any equipment, weapons, or special items this creature carries.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Full Stat Block Format */}
                <Card className="bg-background/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-md">Quick Stat Block Format</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="font-mono text-sm whitespace-pre-line bg-muted/20 p-4 rounded border">
{`${result.name}
TY: ${result.type} ${result.size} ${result.nature} ${result.creatureVariant}
TD: ${Object.entries(result.threatDice).map(([type, dice]) => `${type.charAt(0).toUpperCase() + type.slice(1)} ${dice}`).join(', ')}
HP: ${result.hitPoints} (${result.activeDefense}A/${result.passiveDefense}P) [${result.size}, ${result.nature}; ×${result.hpMultiplier}]
ST: ${result.savingThrow} | BP: ${result.battlePhase}${result.damageReduction && result.damageReduction !== 'None' ? `
DR: ${result.damageReduction}` : ''}${result.extraAttacks && result.extraAttacks.length > 0 ? `
EA: ${result.extraAttacks.join(', ')}` : ''}${result.notes ? `
Notes: ${result.notes}` : ''}`}
                    </div>
                  </CardContent>
                </Card>

                {/* Calculation Breakdown */}
                <Card className="bg-muted/10">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-md">HP Calculation Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="font-mono text-sm whitespace-pre-line bg-background p-3 rounded border">
                      {result.hpCalculation}
                    </div>
                  </CardContent>
                </Card>

                {/* Notes */}
                {result.notes && (
                  <Card className="bg-background/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-md">Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm whitespace-pre-wrap">{result.notes}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Help Section */}
        <Card className="bg-muted/10">
          <CardHeader>
            <CardTitle className="text-lg">Creature Nature Guide</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-3">
            <div>
              <p><strong>Mundane:</strong> Ordinary denizens lacking innate arcane spark</p>
              <p className="text-xs text-muted-foreground ml-4">Examples: Village guards, bandits, wolves, bears</p>
            </div>
            <div>
              <p><strong>Magical:</strong> Beings who draw on ambient Meterea and primal forces</p>
              <p className="text-xs text-muted-foreground ml-4">Examples: Druids, elven mages, unicorns, griffins</p>
            </div>
            <div>
              <p><strong>Preternatural:</strong> Born of nightmare storms and raw dream-stuff</p>
              <p className="text-xs text-muted-foreground ml-4">Examples: Undead, vampires, doppelgangers, liches</p>
            </div>
            <div>
              <p><strong>Supernatural:</strong> Meterea's refined manifestations like gods, titans, and dragons</p>
              <p className="text-xs text-muted-foreground ml-4">Examples: Angels, demons, true dragons, deity avatars</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted/10">
          <CardHeader>
            <CardTitle className="text-lg">Threat Type Guide</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p><strong>Minor (1 Threat Die):</strong> 1d4 to 1d12 attacks</p>
            <p><strong>Standard (2 Threat Dice):</strong> 2d4 to 2d12 attacks</p>
            <p><strong>Exceptional (3 Threat Dice):</strong> 3d4 to 3d12 attacks</p>
            <p><strong>Legendary (3+ High Dice):</strong> 3d12+ or combinations like 4d10, 5d12</p>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}