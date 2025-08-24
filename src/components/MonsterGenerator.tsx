import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
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
  trope?: string
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

const creatureTropes = [
  { 
    name: 'Goblinoid', 
    description: 'Cunning and covetous creatures with bestial ferocity and reptilian traits',
    examples: 'Goblins, orcs, hobgoblins - societies built around treasure accumulation'
  },
  { 
    name: 'Alfar', 
    description: 'Magical humanoids with a spark of Meterea\'s dream-stuff',
    examples: 'Elves (arcane lore), dwarves (craftsmanship), gnomes (inventive trickery), halflings (nimble grace)'
  },
  { 
    name: 'Drakkin', 
    description: 'Humanoids with draconic power, warrior-scholars or guardians of draconic lore',
    examples: 'Dragon-blooded humans with scales, breath weapons, and ancient knowledge'
  },
  { 
    name: 'Beast', 
    description: 'Natural animals and creatures of the wild',
    examples: 'Wolves, bears, great cats, birds of prey, marine creatures'
  },
  { 
    name: 'Undead', 
    description: 'Preternatural beings born of nightmare storms and psychic echoes',
    examples: 'Skeletons, zombies, vampires, liches, specters, wraiths'
  },
  { 
    name: 'Fiend', 
    description: 'Supernatural manifestations of evil and chaos',
    examples: 'Demons, devils, bound spirits of malice and corruption'
  },
  { 
    name: 'Celestial', 
    description: 'Supernatural beings of divine or angelic nature',
    examples: 'Angels, archons, divine messengers and guardians'
  },
  { 
    name: 'Elemental', 
    description: 'Beings of pure elemental force and energy',
    examples: 'Fire elementals, water spirits, earth golems, air djinn'
  },
  { 
    name: 'Construct', 
    description: 'Artificial beings created through magic or technology',
    examples: 'Golems, animated armor, clockwork creatures, magical automatons'
  },
  { 
    name: 'Aberration', 
    description: 'Alien and unnatural creatures that defy understanding',
    examples: 'Mind flayers, beholders, creatures from beyond the veil of reality'
  }
]

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

// Armor types for damage reduction
const armorTypes = [
  { name: 'None', dr: 'None' },
  { name: 'Natural Hide', dr: '1d4' },
  { name: 'Tough Scales', dr: '1d6' },
  { name: 'Armored Plates', dr: '1d8' },
  { name: 'Stone Skin', dr: '1d10' },
  { name: 'Magical Protection', dr: '1d12' }
]

// Common equipment by creature type
const equipmentByTrope = {
  Goblinoid: ['Crude weapons', 'Leather armor', 'Stolen trinkets', 'Rusty shield'],
  Alfar: ['Fine weapons', 'Elegant armor', 'Magical focuses', 'Ancestral items'],
  Drakkin: ['Draconic weapons', 'Scale mail', 'Ancient relics', 'Breath weapon'],
  Beast: ['Natural weapons', 'Natural armor'],
  Undead: ['Burial shrouds', 'Ancient weapons', 'Spectral equipment'],
  Fiend: ['Infernal weapons', 'Hellish armor', 'Cursed items'],
  Celestial: ['Blessed weapons', 'Divine armor', 'Holy symbols'],
  Elemental: ['Elemental manifestations', 'Energy weapons'],
  Construct: ['Built-in weapons', 'Integrated armor', 'Mechanical components'],
  Aberration: ['Alien appendages', 'Psychic emanations', 'Unnatural abilities']
}

export default function MonsterGenerator() {
  // Basic creature info
  const [creatureName, setCreatureName] = useState('')
  const [monsterNature, setMonsterNature] = useState('')
  const [monsterSize, setMonsterSize] = useState('')
  const [creatureType, setCreatureType] = useState('')
  const [fastTough, setFastTough] = useState('normal')
  const [includeTrope, setIncludeTrope] = useState(false)
  const [selectedTrope, setSelectedTrope] = useState('')
  
  // Combat stats
  const [meleeAttack, setMeleeAttack] = useState('')
  const [naturalAttack, setNaturalAttack] = useState('')
  const [rangedAttack, setRangedAttack] = useState('')
  const [arcaneAttack, setArcaneAttack] = useState('')
  const [damageReduction, setDamageReduction] = useState('')
  const [extraAttacks, setExtraAttacks] = useState('')
  const [notes, setNotes] = useState('')
  
  const [result, setResult] = useState<MonsterResult | null>(null)

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

    // Get trope information
    const tropeInfo = includeTrope && selectedTrope ? 
      creatureTropes.find(t => t.name === selectedTrope) : undefined

    // Generate equipment if trope is selected
    const equipment = tropeInfo ? 
      equipmentByTrope[tropeInfo.name as keyof typeof equipmentByTrope] || [] : []

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
      trope: tropeInfo?.name,
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
      equipment: equipment.length > 0 ? equipment : undefined,
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

        {/* Creature Trope Selection */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="include-trope"
              checked={includeTrope}
              onCheckedChange={(checked) => setIncludeTrope(checked as boolean)}
            />
            <Label htmlFor="include-trope" className="text-sm">
              Include creature trope/category
            </Label>
          </div>

          {includeTrope && (
            <div>
              <Label htmlFor="creature-trope">Select Creature Trope</Label>
              <Select value={selectedTrope} onValueChange={setSelectedTrope}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a creature trope" />
                </SelectTrigger>
                <SelectContent>
                  {creatureTropes.map((trope) => (
                    <SelectItem key={trope.name} value={trope.name}>
                      {trope.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedTrope && (
                <div className="mt-2 p-3 bg-muted/20 rounded border">
                  <p className="text-sm font-medium">{selectedTrope}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {creatureTropes.find(t => t.name === selectedTrope)?.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    <strong>Examples:</strong> {creatureTropes.find(t => t.name === selectedTrope)?.examples}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Threat Dice (Combat Abilities) */}
        <Card className="bg-muted/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sword className="text-accent" />
              Threat Dice (TD) - Attack Forms
            </CardTitle>
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
                    <SelectItem value="None">None</SelectItem>
                    <SelectItem value="1d4">1d4 (Minor)</SelectItem>
                    <SelectItem value="1d6">1d6 (Minor)</SelectItem>
                    <SelectItem value="1d8">1d8 (Minor)</SelectItem>
                    <SelectItem value="1d10">1d10 (Minor)</SelectItem>
                    <SelectItem value="1d12">1d12 (Minor)</SelectItem>
                    <SelectItem value="2d4">2d4 (Standard)</SelectItem>
                    <SelectItem value="2d6">2d6 (Standard)</SelectItem>
                    <SelectItem value="2d8">2d8 (Standard)</SelectItem>
                    <SelectItem value="2d10">2d10 (Standard)</SelectItem>
                    <SelectItem value="2d12">2d12 (Standard)</SelectItem>
                    <SelectItem value="3d4">3d4 (Exceptional)</SelectItem>
                    <SelectItem value="3d6">3d6 (Exceptional)</SelectItem>
                    <SelectItem value="3d8">3d8 (Exceptional)</SelectItem>
                    <SelectItem value="3d10">3d10 (Exceptional)</SelectItem>
                    <SelectItem value="3d12">3d12 (Exceptional)</SelectItem>
                    <SelectItem value="4d10">4d10 (Legendary)</SelectItem>
                    <SelectItem value="4d12">4d12 (Legendary)</SelectItem>
                    <SelectItem value="5d10">5d10 (Legendary)</SelectItem>
                    <SelectItem value="5d12">5d12 (Legendary)</SelectItem>
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
                    <SelectItem value="None">None</SelectItem>
                    <SelectItem value="1d4">1d4 (Minor)</SelectItem>
                    <SelectItem value="1d6">1d6 (Minor)</SelectItem>
                    <SelectItem value="1d8">1d8 (Minor)</SelectItem>
                    <SelectItem value="1d10">1d10 (Minor)</SelectItem>
                    <SelectItem value="1d12">1d12 (Minor)</SelectItem>
                    <SelectItem value="2d4">2d4 (Standard)</SelectItem>
                    <SelectItem value="2d6">2d6 (Standard)</SelectItem>
                    <SelectItem value="2d8">2d8 (Standard)</SelectItem>
                    <SelectItem value="2d10">2d10 (Standard)</SelectItem>
                    <SelectItem value="2d12">2d12 (Standard)</SelectItem>
                    <SelectItem value="3d4">3d4 (Exceptional)</SelectItem>
                    <SelectItem value="3d6">3d6 (Exceptional)</SelectItem>
                    <SelectItem value="3d8">3d8 (Exceptional)</SelectItem>
                    <SelectItem value="3d10">3d10 (Exceptional)</SelectItem>
                    <SelectItem value="3d12">3d12 (Exceptional)</SelectItem>
                    <SelectItem value="4d10">4d10 (Legendary)</SelectItem>
                    <SelectItem value="4d12">4d12 (Legendary)</SelectItem>
                    <SelectItem value="5d10">5d10 (Legendary)</SelectItem>
                    <SelectItem value="5d12">5d12 (Legendary)</SelectItem>
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
                    <SelectItem value="None">None</SelectItem>
                    <SelectItem value="1d4">1d4 (Minor)</SelectItem>
                    <SelectItem value="1d6">1d6 (Minor)</SelectItem>
                    <SelectItem value="1d8">1d8 (Minor)</SelectItem>
                    <SelectItem value="1d10">1d10 (Minor)</SelectItem>
                    <SelectItem value="1d12">1d12 (Minor)</SelectItem>
                    <SelectItem value="2d4">2d4 (Standard)</SelectItem>
                    <SelectItem value="2d6">2d6 (Standard)</SelectItem>
                    <SelectItem value="2d8">2d8 (Standard)</SelectItem>
                    <SelectItem value="2d10">2d10 (Standard)</SelectItem>
                    <SelectItem value="2d12">2d12 (Standard)</SelectItem>
                    <SelectItem value="3d4">3d4 (Exceptional)</SelectItem>
                    <SelectItem value="3d6">3d6 (Exceptional)</SelectItem>
                    <SelectItem value="3d8">3d8 (Exceptional)</SelectItem>
                    <SelectItem value="3d10">3d10 (Exceptional)</SelectItem>
                    <SelectItem value="3d12">3d12 (Exceptional)</SelectItem>
                    <SelectItem value="4d10">4d10 (Legendary)</SelectItem>
                    <SelectItem value="4d12">4d12 (Legendary)</SelectItem>
                    <SelectItem value="5d10">5d10 (Legendary)</SelectItem>
                    <SelectItem value="5d12">5d12 (Legendary)</SelectItem>
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
                    <SelectItem value="None">None</SelectItem>
                    <SelectItem value="1d4">1d4 (Minor)</SelectItem>
                    <SelectItem value="1d6">1d6 (Minor)</SelectItem>
                    <SelectItem value="1d8">1d8 (Minor)</SelectItem>
                    <SelectItem value="1d10">1d10 (Minor)</SelectItem>
                    <SelectItem value="1d12">1d12 (Minor)</SelectItem>
                    <SelectItem value="2d4">2d4 (Standard)</SelectItem>
                    <SelectItem value="2d6">2d6 (Standard)</SelectItem>
                    <SelectItem value="2d8">2d8 (Standard)</SelectItem>
                    <SelectItem value="2d10">2d10 (Standard)</SelectItem>
                    <SelectItem value="2d12">2d12 (Standard)</SelectItem>
                    <SelectItem value="3d4">3d4 (Exceptional)</SelectItem>
                    <SelectItem value="3d6">3d6 (Exceptional)</SelectItem>
                    <SelectItem value="3d8">3d8 (Exceptional)</SelectItem>
                    <SelectItem value="3d10">3d10 (Exceptional)</SelectItem>
                    <SelectItem value="3d12">3d12 (Exceptional)</SelectItem>
                    <SelectItem value="4d10">4d10 (Legendary)</SelectItem>
                    <SelectItem value="4d12">4d12 (Legendary)</SelectItem>
                    <SelectItem value="5d10">5d10 (Legendary)</SelectItem>
                    <SelectItem value="5d12">5d12 (Legendary)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
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
                    {result.trope && ` (${result.trope})`}
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
                {result.equipment && result.equipment.length > 0 && (
                  <Card className="bg-background/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-md flex items-center gap-2">
                        <Zap className="text-accent" size={16} />
                        Equipment & Gear
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {result.equipment.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
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
TY: ${result.type} ${result.size} ${result.nature} ${result.creatureVariant}${result.trope ? ` (${result.trope})` : ''}
TD: ${Object.entries(result.threatDice).map(([type, dice]) => `${type.charAt(0).toUpperCase() + type.slice(1)} ${dice}`).join(', ')}
HP: ${result.hitPoints} (${result.activeDefense}A/${result.passiveDefense}P) [${result.size}, ${result.nature}; ×${result.hpMultiplier}]
ST: ${result.savingThrow} | BP: ${result.battlePhase}${result.damageReduction && result.damageReduction !== 'None' ? `
DR: ${result.damageReduction}` : ''}${result.extraAttacks && result.extraAttacks.length > 0 ? `
EA: ${result.extraAttacks.join(', ')}` : ''}${result.notes ? `
Notes: ${result.notes}` : ''}`}
                    </div>
                  </CardContent>
                </Card>

                {/* Trope Information */}
                {result.trope && (
                  <Card className="bg-accent/10 border-accent/20">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-md flex items-center gap-2">
                        <Sparkles className="text-accent" size={16} />
                        {result.trope} Lore
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <p>
                          <strong>Description:</strong> {creatureTropes.find(t => t.name === result.trope)?.description}
                        </p>
                        <p>
                          <strong>Examples:</strong> {creatureTropes.find(t => t.name === result.trope)?.examples}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

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