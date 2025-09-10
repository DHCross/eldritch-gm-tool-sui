import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Plus } from "@phosphor-icons/react"
import { useKV } from '@github/spark/hooks'

interface Combatant {
  id: string
  name: string
  type: 'pa' | 'npc' | 'qsb'
  prowess: number
  adp: number
  pdp: number
  maxAdp: number
  maxPdp: number
  battlePhase: number
  defeated: boolean
  reactionFocus?: number
  spiritPoints?: number
  // QSB-specific fields
  threatDice?: string
  monsterType?: string
  size?: string
  nature?: string
  creatureType?: string
}

export default function BattleCalculator() {
  const [combatants, setCombatants] = useKV<Combatant[]>("battle-combatants", [])
  const [formData, setFormData] = useState({
    name: '',
    type: 'pa' as 'pa' | 'npc' | 'qsb',
    prowess: 12,
    adp: 22,
    pdp: 18,
    reactionFocus: 0,
    spiritPoints: 10,
    // QSB fields
    threatDice: '',
    monsterType: '',
    size: 'Medium',
    nature: 'Mundane',
    creatureType: 'Standard'
  })

  const battlePhaseMap: Record<number, number> = {
    12: 1,
    10: 2,
    8: 3,
    6: 4,
    4: 5
  }

  const sizeModifiers: Record<string, number> = {
    'Minuscule': 0,
    'Tiny': 0,
    'Small': 1,
    'Medium': 1,
    'Large': 2,
    'Huge': 3,
    'Gargantuan': 4
  }

  const natureModifiers: Record<string, number> = {
    'Mundane': 0,
    'Magical': 1,
    'Preternatural': 2,
    'Supernatural': 3
  }

  // Get available threat dice based on monster type
  const getThreatDiceOptions = (monsterType: string) => {
    switch (monsterType) {
      case 'Minor':
        return ['1d4', '1d6', '1d8', '1d10', '1d12']
      case 'Standard':
        return ['2d4', '2d6', '2d8', '2d10', '2d12']
      case 'Exceptional':
        return ['3d4', '3d6', '3d8', '3d10', '3d12']
      case 'Legendary':
        return ['3d4', '3d6', '3d8', '3d10', '3d12', '3d14', '3d16', '3d18', '3d20', '4d12', '5d12']
      default:
        return []
    }
  }

  const calculateQSBHitPoints = (threatDice: string, size: string, nature: string, creatureType: string) => {
    if (!threatDice) return { total: 0, adp: 0, pdp: 0 }

    // Extract base HP from threat dice (Maximum Value)
    const match = threatDice.match(/(\d+)d(\d+)/)
    if (!match) return { total: 0, adp: 0, pdp: 0 }

    const [, numDice, dieSize] = match
    const baseHP = parseInt(numDice) * parseInt(dieSize)

    // Calculate modifiers
    const sizeModifier = sizeModifiers[size] || 1
    const natureModifier = natureModifiers[nature] || 0

    // HP Multiplier calculation: (Size Modifier + Nature Modifier) ÷ 2
    const multiplier = (sizeModifier + natureModifier) / 2
    
    // Total HP = ceil(Base HP × multiplier)
    const totalHP = Math.ceil(baseHP * multiplier)

    // Defense split based on creature type
    let adp: number, pdp: number
    switch (creatureType) {
      case 'Fast':
        adp = Math.round(totalHP * 0.75)
        pdp = totalHP - adp
        break
      case 'Tough':
        adp = Math.round(totalHP * 0.25)
        pdp = totalHP - adp
        break
      default: // Standard
        adp = Math.round(totalHP * 0.5)
        pdp = totalHP - adp
        break
    }

    return { total: totalHP, adp, pdp }
  }

  const addCombatant = () => {
    if (!formData.name.trim()) return

    const battlePhase = battlePhaseMap[formData.prowess] || 5
    
    // Calculate hit points for QSB creatures
    let adp = formData.adp
    let pdp = formData.pdp
    
    if (formData.type === 'qsb' && formData.threatDice) {
      const hitPoints = calculateQSBHitPoints(
        formData.threatDice, 
        formData.size, 
        formData.nature, 
        formData.creatureType
      )
      adp = hitPoints.adp
      pdp = hitPoints.pdp
    }

    const newCombatant: Combatant = {
      id: Date.now().toString(),
      name: formData.name,
      type: formData.type,
      prowess: formData.prowess,
      adp,
      pdp,
      maxAdp: adp,
      maxPdp: pdp,
      battlePhase,
      defeated: false,
      ...(formData.type === 'pa' && {
        reactionFocus: formData.reactionFocus,
        spiritPoints: formData.spiritPoints
      }),
      ...(formData.type === 'qsb' && {
        threatDice: formData.threatDice,
        monsterType: formData.monsterType,
        size: formData.size,
        nature: formData.nature,
        creatureType: formData.creatureType
      })
    }

    setCombatants(current => [...current, newCombatant])
    
    // Reset form but preserve type-specific values
    const resetFormData = {
      name: '',
      type: 'pa' as 'pa' | 'npc' | 'qsb',
      prowess: 12,
      adp: 22,
      pdp: 18,
      reactionFocus: 0,
      spiritPoints: 10,
      // QSB fields
      threatDice: '',
      monsterType: '',
      size: 'Medium',
      nature: 'Mundane',
      creatureType: 'Standard'
    }
    
    setFormData(resetFormData)
  }

  const updateCombatant = (id: string, field: keyof Combatant, value: number | boolean) => {
    setCombatants(current => 
      current.map(c => 
        c.id === id ? { ...c, [field]: value } : c
      )
    )
  }

  const defeatCombatant = (id: string) => {
    setCombatants(current => 
      current.map(c => 
        c.id === id ? { ...c, defeated: true } : c
      )
    )
  }

  const removeCombatant = (id: string) => {
    setCombatants(current => current.filter(c => c.id !== id))
  }

  const activeCombatants = combatants.filter(c => !c.defeated)
    .sort((a, b) => a.battlePhase - b.battlePhase || b.prowess - a.prowess)
  const defeatedCombatants = combatants.filter(c => c.defeated)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Battle Phase Calculator & Initiative Tracker</CardTitle>
        <CardDescription>
          Track battle phases, initiative order, and combatant health during encounters
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add Combatant Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Add Combatant</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="combatant-name">Name</Label>
                <Input
                  id="combatant-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter combatant name"
                />
              </div>
              <div>
                <Label htmlFor="combatant-type">Type</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value: 'pa' | 'npc' | 'qsb') => 
                    setFormData(prev => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pa">Player Adventurer (PA)</SelectItem>
                    <SelectItem value="npc">Non-Player Character (NPC)</SelectItem>
                    <SelectItem value="qsb">Quick Stat Block (QSB) Creature</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="prowess">Prowess Die</Label>
                <Select 
                  value={formData.prowess.toString()} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, prowess: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12">d12 (Phase 1)</SelectItem>
                    <SelectItem value="10">d10 (Phase 2)</SelectItem>
                    <SelectItem value="8">d8 (Phase 3)</SelectItem>
                    <SelectItem value="6">d6 (Phase 4)</SelectItem>
                    <SelectItem value="4">d4 (Phase 5)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.type !== 'qsb' && (
                <>
                  <div>
                    <Label htmlFor="adp">Active Defense Pool (ADP)</Label>
                    <Input
                      id="adp"
                      type="number"
                      value={formData.adp}
                      onChange={(e) => setFormData(prev => ({ ...prev, adp: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="pdp">Passive Defense Pool (PDP)</Label>
                    <Input
                      id="pdp"
                      type="number"
                      value={formData.pdp}
                      onChange={(e) => setFormData(prev => ({ ...prev, pdp: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                </>
              )}
            </div>

            {formData.type === 'qsb' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="monster-type">Monster Type</Label>
                    <Select 
                      value={formData.monsterType} 
                      onValueChange={(value) => setFormData(prev => ({ 
                        ...prev, 
                        monsterType: value,
                        threatDice: '' // Reset threat dice when type changes
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select monster type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Minor">Minor (1 die)</SelectItem>
                        <SelectItem value="Standard">Standard (2 dice)</SelectItem>
                        <SelectItem value="Exceptional">Exceptional (3 dice)</SelectItem>
                        <SelectItem value="Legendary">Legendary (3+ dice, higher ranks)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="threat-dice">Primary Attack Threat Dice</Label>
                    <Select 
                      value={formData.threatDice} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, threatDice: value }))}
                      disabled={!formData.monsterType}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={formData.monsterType ? "Select threat dice" : "Select monster type first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {getThreatDiceOptions(formData.monsterType).map((dice) => (
                          <SelectItem key={dice} value={dice}>
                            {dice}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="creature-type">Creature Type</Label>
                    <Select 
                      value={formData.creatureType} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, creatureType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Standard">Standard (50/50 split)</SelectItem>
                        <SelectItem value="Fast">Fast (75% ADP / 25% PDP)</SelectItem>
                        <SelectItem value="Tough">Tough (25% ADP / 75% PDP)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="size">Size</Label>
                    <Select 
                      value={formData.size} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, size: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Minuscule">Minuscule (+0)</SelectItem>
                        <SelectItem value="Tiny">Tiny (+0)</SelectItem>
                        <SelectItem value="Small">Small (+1)</SelectItem>
                        <SelectItem value="Medium">Medium (+1)</SelectItem>
                        <SelectItem value="Large">Large (+2)</SelectItem>
                        <SelectItem value="Huge">Huge (+3)</SelectItem>
                        <SelectItem value="Gargantuan">Gargantuan (+4)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nature">Nature</Label>
                    <Select 
                      value={formData.nature} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, nature: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mundane">Mundane (+0)</SelectItem>
                        <SelectItem value="Magical">Magical (+1)</SelectItem>
                        <SelectItem value="Preternatural">Preternatural (+2)</SelectItem>
                        <SelectItem value="Supernatural">Supernatural (+3)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {formData.threatDice && (
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-sm">
                      <strong>Calculated Hit Points:</strong> {(() => {
                        const hp = calculateQSBHitPoints(formData.threatDice, formData.size, formData.nature, formData.creatureType)
                        return `${hp.total} (${hp.adp} ADP / ${hp.pdp} PDP)`
                      })()}
                    </div>
                  </div>
                )}
              </div>
            )}

            {formData.type === 'pa' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reaction-focus">Reaction Focus Bonus</Label>
                  <Input
                    id="reaction-focus"
                    type="number"
                    value={formData.reactionFocus}
                    onChange={(e) => setFormData(prev => ({ ...prev, reactionFocus: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="spirit-points">Spirit Points (SP)</Label>
                  <Input
                    id="spirit-points"
                    type="number"
                    value={formData.spiritPoints}
                    onChange={(e) => setFormData(prev => ({ ...prev, spiritPoints: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>
            )}

            <Button onClick={addCombatant} className="w-full">
              <Plus size={16} className="mr-2" />
              Add Combatant
            </Button>
          </CardContent>
        </Card>

        {/* Active Combatants */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Active Combatants</CardTitle>
            <CardDescription>Sorted by battle phase and prowess</CardDescription>
          </CardHeader>
          <CardContent>
            {activeCombatants.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No active combatants</p>
            ) : (
              <div className="space-y-3">
                {activeCombatants.map((combatant) => (
                  <Card key={combatant.id} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{combatant.name}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-sm bg-accent text-accent-foreground px-2 py-1 rounded">
                          Phase {combatant.battlePhase}
                        </span>
                        <span className="text-sm bg-secondary text-secondary-foreground px-2 py-1 rounded">
                          d{combatant.prowess}
                        </span>
                        {combatant.type === 'qsb' && (
                          <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                            QSB
                          </span>
                        )}
                      </div>
                    </div>

                    {combatant.type === 'qsb' && combatant.threatDice && (
                      <div className="text-xs text-muted-foreground mb-2">
                        {combatant.monsterType} • {combatant.threatDice} • {combatant.size} {combatant.nature} {combatant.creatureType}
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                      <div>
                        <Label htmlFor={`adp-${combatant.id}`} className="text-xs">ADP</Label>
                        <Input
                          id={`adp-${combatant.id}`}
                          type="number"
                          value={combatant.adp}
                          onChange={(e) => updateCombatant(combatant.id, 'adp', parseInt(e.target.value) || 0)}
                          className="h-8"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`pdp-${combatant.id}`} className="text-xs">PDP</Label>
                        <Input
                          id={`pdp-${combatant.id}`}
                          type="number"
                          value={combatant.pdp}
                          onChange={(e) => updateCombatant(combatant.id, 'pdp', parseInt(e.target.value) || 0)}
                          className="h-8"
                        />
                      </div>
                      {combatant.reactionFocus !== undefined && (
                        <div>
                          <Label className="text-xs">Reaction Focus</Label>
                          <div className="text-sm bg-muted px-2 py-1 rounded h-8 flex items-center">
                            +{combatant.reactionFocus}
                          </div>
                        </div>
                      )}
                      {combatant.spiritPoints !== undefined && (
                        <div>
                          <Label className="text-xs">SP</Label>
                          <div className="text-sm bg-muted px-2 py-1 rounded h-8 flex items-center">
                            {combatant.spiritPoints}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => defeatCombatant(combatant.id)}
                      >
                        Defeat
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeCombatant(combatant.id)}
                      >
                        <Trash2 size={14} className="mr-1" />
                        Remove
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Defeated Combatants */}
        {defeatedCombatants.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Defeated</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {defeatedCombatants.map((combatant) => (
                  <div key={combatant.id} className="flex items-center justify-between p-3 bg-muted rounded-lg opacity-60">
                    <span>{combatant.name} (d{combatant.prowess})</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeCombatant(combatant.id)}
                    >
                      <Trash2 size={14} className="mr-1" />
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Battle Phase Reference */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Reference</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Initiative Phases</h4>
                <div className="space-y-1 text-sm">
                  <div>Phase 1: d12 Prowess (Initiative 12+)</div>
                  <div>Phase 2: d10 Prowess (Initiative 9-11)</div>
                  <div>Phase 3: d8 Prowess (Initiative 7-8)</div>
                  <div>Phase 4: d6 Prowess (Initiative 5-6)</div>
                  <div>Phase 5: d4 Prowess (Initiative 1-4)</div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Defense Pools</h4>
                <div className="space-y-1 text-sm">
                  <div><strong>ADP:</strong> Active Defense Pool (dodge/parry)</div>
                  <div><strong>PDP:</strong> Passive Defense Pool (toughness)</div>
                  <div><strong>SP:</strong> Spirit Points (mental/magical defense)</div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">QSB Hit Points</h4>
                <div className="space-y-1 text-sm">
                  <div><strong>Base HP:</strong> Max Value of Threat Dice</div>
                  <div><strong>Formula:</strong> ceil(Base × ((Size + Nature) ÷ 2))</div>
                  <div><strong>Standard:</strong> 50% ADP / 50% PDP</div>
                  <div><strong>Fast:</strong> 75% ADP / 25% PDP</div>
                  <div><strong>Tough:</strong> 25% ADP / 75% PDP</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}