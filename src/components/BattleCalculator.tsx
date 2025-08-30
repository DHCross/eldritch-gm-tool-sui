import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Trash2, Plus } from "@phosphor-icons/react"
import { calculateBattlePhase, parseThreatDice } from '@/utils/gameUtils'
import { CREATURE_SIZES, CREATURE_NATURES, HP_MULTIPLIERS } from '@/data/gameData'

interface Combatant {
  id: string
  name: string
  type: 'pa' | 'npc' | 'qsb'
  prowess: string
  battlePhase: number
  adp: number
  pdp: number
  maxAdp: number
  spiritPoints?: number
  reactionFocus?: number
  isDefeated: boolean
  // QSB specific fields
  threatDice?: string
  size?: string
  nature?: string
  creatureType?: 'Normal' | 'Fast' | 'Tough'
}

const BattleCalculator: React.FC = () => {
  const [combatants, setCombatants] = useState<Combatant[]>([])
  const [newCombatant, setNewCombatant] = useState({
    name: '',
    type: 'pa' as 'pa' | 'npc' | 'qsb',
    prowess: 'd12',
    adp: 20,
    pdp: 18,
    spiritPoints: 10,
    reactionFocus: 0,
    // QSB specific fields
    threatDice: '2d6',
    size: 'Medium',
    nature: 'Mundane',
    creatureType: 'Normal' as 'Normal' | 'Fast' | 'Tough'
  })

  // Calculate QSB hit points when relevant fields change
  useEffect(() => {
    if (newCombatant.type === 'qsb') {
      const { mv } = parseThreatDice(newCombatant.threatDice)
      const sizeModifier = ['Minuscule', 'Tiny'].includes(newCombatant.size) ? 0 :
                          ['Small', 'Medium'].includes(newCombatant.size) ? 1 :
                          newCombatant.size === 'Large' ? 2 :
                          newCombatant.size === 'Huge' ? 3 :
                          newCombatant.size === 'Gargantuan' ? 4 : 1
      
      const natureModifier = newCombatant.nature === 'Mundane' ? 0 :
                            newCombatant.nature === 'Magical' ? 1 :
                            newCombatant.nature === 'Preternatural' ? 2 :
                            newCombatant.nature === 'Supernatural' ? 3 : 0
      
      const totalModifier = (sizeModifier + natureModifier) / 2
      const totalHP = Math.ceil(mv * totalModifier) || mv
      
      // Calculate defense split based on creature type
      let activeHP, passiveHP
      if (newCombatant.creatureType === 'Fast') {
        activeHP = Math.round(totalHP * 0.75)
        passiveHP = totalHP - activeHP
      } else if (newCombatant.creatureType === 'Tough') {
        passiveHP = Math.round(totalHP * 0.75)
        activeHP = totalHP - passiveHP
      } else { // Normal
        activeHP = Math.round(totalHP / 2)
        passiveHP = totalHP - activeHP
      }
      
      setNewCombatant(prev => ({
        ...prev,
        adp: activeHP,
        pdp: passiveHP
      }))
    } else if (newCombatant.type !== 'qsb' && (newCombatant.adp !== 20 || newCombatant.pdp !== 18)) {
      // Reset to default values for non-QSB types
      setNewCombatant(prev => ({
        ...prev,
        adp: 20,
        pdp: 18
      }))
    }
  }, [newCombatant.type, newCombatant.threatDice, newCombatant.size, newCombatant.nature, newCombatant.creatureType])

  const addCombatant = () => {
    if (!newCombatant.name.trim()) {
      alert('Please enter a combatant name.')
      return
    }

    const battlePhase = calculateBattlePhase(newCombatant.prowess)
    
    const combatant: Combatant = {
      id: Math.random().toString(36).substr(2, 9),
      name: newCombatant.name,
      type: newCombatant.type,
      prowess: newCombatant.prowess,
      battlePhase,
      adp: newCombatant.adp,
      pdp: newCombatant.pdp,
      maxAdp: newCombatant.adp,
      spiritPoints: newCombatant.type === 'pa' ? newCombatant.spiritPoints : undefined,
      reactionFocus: newCombatant.type === 'pa' ? newCombatant.reactionFocus : undefined,
      isDefeated: false
    }

    // Add QSB-specific data
    if (newCombatant.type === 'qsb') {
      combatant.threatDice = newCombatant.threatDice
      combatant.size = newCombatant.size
      combatant.nature = newCombatant.nature
      combatant.creatureType = newCombatant.creatureType
    }

    setCombatants(prev => [...prev, combatant].sort((a, b) => a.battlePhase - b.battlePhase))
    
    // Reset form
    setNewCombatant({
      name: '',
      type: 'pa',
      prowess: 'd12',
      adp: 20,
      pdp: 18,
      spiritPoints: 10,
      reactionFocus: 0,
      threatDice: '2d6',
      size: 'Medium',
      nature: 'Mundane',
      creatureType: 'Normal'
    })
  }

  const updateCombatant = (id: string, field: keyof Combatant, value: any) => {
    setCombatants(prev => prev.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    ))
  }

  const toggleDefeated = (id: string) => {
    setCombatants(prev => prev.map(c => 
      c.id === id ? { ...c, isDefeated: !c.isDefeated } : c
    ))
  }

  const removeCombatant = (id: string) => {
    setCombatants(prev => prev.filter(c => c.id !== id))
  }

  const getInitiativeRange = (prowess: string) => {
    switch (prowess) {
      case 'd12': return '12+'
      case 'd10': return '9-11'
      case 'd8': return '7-8'
      case 'd6': return '5-6'
      case 'd4': return '1-4'
      default: return '1-4'
    }
  }

  const getBattlePhaseColor = (phase: number) => {
    switch (phase) {
      case 1: return 'bg-red-100 text-red-800 border-red-200'
      case 2: return 'bg-orange-100 text-orange-800 border-orange-200'
      case 3: return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 4: return 'bg-green-100 text-green-800 border-green-200'
      case 5: return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const activeCombatants = combatants.filter(c => !c.isDefeated)
  const defeatedCombatants = combatants.filter(c => c.isDefeated)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Battle Calculator & Initiative Tracker</CardTitle>
          <CardDescription>
            Manage combat rounds and track initiative in Eldritch RPG
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add Combatant Form */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Add Combatant</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newCombatant.name}
                  onChange={(e) => setNewCombatant({ ...newCombatant, name: e.target.value })}
                  placeholder="Enter combatant name"
                />
              </div>
              
              <div>
                <Label htmlFor="type">Type</Label>
                <Select value={newCombatant.type} onValueChange={(value: 'pa' | 'npc' | 'qsb') => setNewCombatant({ ...newCombatant, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pa">Player Adventurer (PA)</SelectItem>
                    <SelectItem value="npc">Non-Player Character (NPC)</SelectItem>
                    <SelectItem value="qsb">Quick Stat Block (QSB)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="prowess">Prowess Die</Label>
                <Select value={newCombatant.prowess} onValueChange={(value) => setNewCombatant({ ...newCombatant, prowess: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="d12">d12 (Phase 1)</SelectItem>
                    <SelectItem value="d10">d10 (Phase 2)</SelectItem>
                    <SelectItem value="d8">d8 (Phase 3)</SelectItem>
                    <SelectItem value="d6">d6 (Phase 4)</SelectItem>
                    <SelectItem value="d4">d4 (Phase 5)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="adp">Active Defense Pool (ADP)</Label>
                <Input
                  id="adp"
                  type="number"
                  value={newCombatant.adp}
                  onChange={(e) => setNewCombatant({ ...newCombatant, adp: parseInt(e.target.value) || 0 })}
                />
              </div>
              
              <div>
                <Label htmlFor="pdp">Passive Defense Pool (PDP)</Label>
                <Input
                  id="pdp"
                  type="number"
                  value={newCombatant.pdp}
                  onChange={(e) => setNewCombatant({ ...newCombatant, pdp: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            {newCombatant.type === 'pa' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="spiritPoints">Spirit Points (SP)</Label>
                  <Input
                    id="spiritPoints"
                    type="number"
                    value={newCombatant.spiritPoints}
                    onChange={(e) => setNewCombatant({ ...newCombatant, spiritPoints: parseInt(e.target.value) || 0 })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="reactionFocus">Reaction Focus Bonus</Label>
                  <Input
                    id="reactionFocus"
                    type="number"
                    value={newCombatant.reactionFocus}
                    onChange={(e) => setNewCombatant({ ...newCombatant, reactionFocus: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
            )}

            {newCombatant.type === 'qsb' && (
              <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                <h4 className="font-semibold text-sm">QSB Creature Details</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="threatDice">Threat Dice</Label>
                    <Input
                      id="threatDice"
                      value={newCombatant.threatDice}
                      onChange={(e) => setNewCombatant({ ...newCombatant, threatDice: e.target.value })}
                      placeholder="e.g., 2d6, 3d8"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="creatureType">Creature Type</Label>
                    <Select value={newCombatant.creatureType} onValueChange={(value: 'Normal' | 'Fast' | 'Tough') => setNewCombatant({ ...newCombatant, creatureType: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Normal">Normal (50/50 split)</SelectItem>
                        <SelectItem value="Fast">Fast (75% Active / 25% Passive)</SelectItem>
                        <SelectItem value="Tough">Tough (25% Active / 75% Passive)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="size">Size</Label>
                    <Select value={newCombatant.size} onValueChange={(value) => setNewCombatant({ ...newCombatant, size: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CREATURE_SIZES.map(size => (
                          <SelectItem key={size} value={size}>{size}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="nature">Nature</Label>
                    <Select value={newCombatant.nature} onValueChange={(value) => setNewCombatant({ ...newCombatant, nature: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CREATURE_NATURES.map(nature => (
                          <SelectItem key={nature} value={nature}>{nature}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  HP calculated automatically based on Threat Dice MV, Size, and Nature modifiers.
                </div>
              </div>
            )}

            <Button onClick={addCombatant} className="w-full">
              <Plus size={16} className="mr-2" />
              Add Combatant
            </Button>
          </div>

          <Separator />

          {/* Active Combatants */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Active Combatants</h3>
            {activeCombatants.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No active combatants. Add some above to get started.</p>
            ) : (
              <div className="space-y-3">
                {activeCombatants.map((combatant) => (
                  <div key={combatant.id} className="p-4 border rounded-lg bg-card">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{combatant.name}</h4>
                        <Badge className={getBattlePhaseColor(combatant.battlePhase)}>
                          Phase {combatant.battlePhase}
                        </Badge>
                        <Badge variant="outline">
                          {combatant.prowess} ({getInitiativeRange(combatant.prowess)})
                        </Badge>
                        {combatant.type === 'qsb' && combatant.threatDice && (
                          <Badge variant="secondary">
                            TD: {combatant.threatDice}
                          </Badge>
                        )}
                        {combatant.type === 'qsb' && combatant.creatureType !== 'Normal' && (
                          <Badge variant="outline">
                            {combatant.creatureType}
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleDefeated(combatant.id)}
                        >
                          Defeat
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeCombatant(combatant.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                    
                    {combatant.type === 'qsb' && (combatant.size || combatant.nature) && (
                      <div className="text-xs text-muted-foreground mb-3">
                        {combatant.size} {combatant.nature} creature
                        {combatant.threatDice && (() => {
                          const { mv } = parseThreatDice(combatant.threatDice)
                          return ` (Base MV: ${mv})`
                        })()}
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <Label htmlFor={`adp-${combatant.id}`} className="text-sm">ADP</Label>
                        <Input
                          id={`adp-${combatant.id}`}
                          type="number"
                          value={combatant.adp}
                          onChange={(e) => updateCombatant(combatant.id, 'adp', parseInt(e.target.value) || 0)}
                          className="h-8"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor={`pdp-${combatant.id}`} className="text-sm">PDP</Label>
                        <Input
                          id={`pdp-${combatant.id}`}
                          type="number"
                          value={combatant.pdp}
                          onChange={(e) => updateCombatant(combatant.id, 'pdp', parseInt(e.target.value) || 0)}
                          className="h-8"
                        />
                      </div>
                      
                      {combatant.spiritPoints !== undefined && (
                        <div>
                          <Label htmlFor={`sp-${combatant.id}`} className="text-sm">SP</Label>
                          <Input
                            id={`sp-${combatant.id}`}
                            type="number"
                            value={combatant.spiritPoints}
                            onChange={(e) => updateCombatant(combatant.id, 'spiritPoints', parseInt(e.target.value) || 0)}
                            className="h-8"
                          />
                        </div>
                      )}
                      
                      {combatant.reactionFocus !== undefined && (
                        <div>
                          <Label htmlFor={`rf-${combatant.id}`} className="text-sm">RF</Label>
                          <Input
                            id={`rf-${combatant.id}`}
                            type="number"
                            value={combatant.reactionFocus}
                            onChange={(e) => updateCombatant(combatant.id, 'reactionFocus', parseInt(e.target.value) || 0)}
                            className="h-8"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Defeated Combatants */}
          {defeatedCombatants.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Defeated</h3>
              <div className="space-y-2">
                {defeatedCombatants.map((combatant) => (
                  <div key={combatant.id} className="p-3 border rounded-lg bg-muted/50 opacity-75">
                    <div className="flex items-center justify-between">
                      <span className="font-medium line-through">{combatant.name}</span>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleDefeated(combatant.id)}
                        >
                          Revive
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeCombatant(combatant.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default BattleCalculator