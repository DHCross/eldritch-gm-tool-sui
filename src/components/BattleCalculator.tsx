import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Trash2, Plus } from "@phosphor-icons/react"
import { useKV } from '@github/spark/hooks'
import { BATTLE_PHASE_TABLE } from '@/data/gameData'

interface Combatant {
  id: string
  name: string
  type: 'pa' | 'npc' | 'qsb'
  prowessDie: string
  battlePhase: number
  adp: number
  pdp: number
  maxAdp: number
  maxPdp: number
  reactionFocus?: number
  spiritPoints?: number
  maxSpiritPoints?: number
  isDefeated: boolean
}

const BattleCalculator: React.FC = () => {
  const [combatants, setCombatants] = useKV<Combatant[]>('battle-combatants', [])
  const [newCombatant, setNewCombatant] = useState({
    name: '',
    type: 'pa' as 'pa' | 'npc' | 'qsb',
    prowessDie: 'd10',
    adp: 20,
    pdp: 18,
    reactionFocus: 0,
    spiritPoints: 10
  })

  const addCombatant = () => {
    if (!newCombatant.name.trim()) {
      alert('Please enter a combatant name.')
      return
    }

    const battlePhase = BATTLE_PHASE_TABLE[newCombatant.prowessDie as keyof typeof BATTLE_PHASE_TABLE] || 5

    const combatant: Combatant = {
      id: Date.now().toString(),
      name: newCombatant.name,
      type: newCombatant.type,
      prowessDie: newCombatant.prowessDie,
      battlePhase,
      adp: newCombatant.adp,
      pdp: newCombatant.pdp,
      maxAdp: newCombatant.adp,
      maxPdp: newCombatant.pdp,
      reactionFocus: newCombatant.type === 'pa' ? newCombatant.reactionFocus : undefined,
      spiritPoints: newCombatant.type === 'pa' ? newCombatant.spiritPoints : undefined,
      maxSpiritPoints: newCombatant.type === 'pa' ? newCombatant.spiritPoints : undefined,
      isDefeated: false
    }

    setCombatants(current => [...current, combatant].sort((a, b) => a.battlePhase - b.battlePhase))
    
    // Reset form
    setNewCombatant({
      name: '',
      type: 'pa',
      prowessDie: 'd10',
      adp: 20,
      pdp: 18,
      reactionFocus: 0,
      spiritPoints: 10
    })
  }

  const updateCombatant = (id: string, field: keyof Combatant, value: any) => {
    setCombatants(current =>
      current.map(combatant =>
        combatant.id === id ? { ...combatant, [field]: value } : combatant
      )
    )
  }

  const defeatCombatant = (id: string) => {
    setCombatants(current =>
      current.map(combatant =>
        combatant.id === id ? { ...combatant, isDefeated: true } : combatant
      )
    )
  }

  const reviveCombatant = (id: string) => {
    setCombatants(current =>
      current.map(combatant =>
        combatant.id === id ? { ...combatant, isDefeated: false } : combatant
      )
    )
  }

  const removeCombatant = (id: string) => {
    setCombatants(current => current.filter(combatant => combatant.id !== id))
  }

  const clearAll = () => {
    setCombatants([])
  }

  const activeCombatants = combatants.filter(c => !c.isDefeated)
  const defeatedCombatants = combatants.filter(c => c.isDefeated)

  const getInitiativeRange = (prowessDie: string) => {
    switch (prowessDie) {
      case 'd12': return '12+'
      case 'd10': return '9-11'
      case 'd8': return '7-8'
      case 'd6': return '5-6'
      case 'd4': return '1-4'
      default: return '?'
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Battle Phase Calculator</CardTitle>
          <CardDescription>
            Initiative tracker and combat management for Eldritch RPG
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add Combatant Form */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Add Combatant</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="type">Combatant Type</Label>
                <Select 
                  value={newCombatant.type} 
                  onValueChange={(value: 'pa' | 'npc' | 'qsb') => setNewCombatant({ ...newCombatant, type: value })}
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
                <Label htmlFor="prowess">Prowess Die</Label>
                <Select 
                  value={newCombatant.prowessDie} 
                  onValueChange={(value) => setNewCombatant({ ...newCombatant, prowessDie: value })}
                >
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
                  placeholder="e.g., 22"
                />
              </div>
              <div>
                <Label htmlFor="pdp">Passive Defense Pool (PDP)</Label>
                <Input
                  id="pdp"
                  type="number"
                  value={newCombatant.pdp}
                  onChange={(e) => setNewCombatant({ ...newCombatant, pdp: parseInt(e.target.value) || 0 })}
                  placeholder="e.g., 18"
                />
              </div>
            </div>

            {newCombatant.type === 'pa' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reactionFocus">Reaction Focus Bonus</Label>
                  <Input
                    id="reactionFocus"
                    type="number"
                    value={newCombatant.reactionFocus}
                    onChange={(e) => setNewCombatant({ ...newCombatant, reactionFocus: parseInt(e.target.value) || 0 })}
                    placeholder="e.g., 2"
                  />
                </div>
                <div>
                  <Label htmlFor="spiritPoints">Spirit Points (SP)</Label>
                  <Input
                    id="spiritPoints"
                    type="number"
                    value={newCombatant.spiritPoints}
                    onChange={(e) => setNewCombatant({ ...newCombatant, spiritPoints: parseInt(e.target.value) || 0 })}
                    placeholder="e.g., 10"
                  />
                </div>
              </div>
            )}

            <Button onClick={addCombatant} className="w-full">
              <Plus size={16} />
              Add Combatant
            </Button>
          </div>

          {combatants.length > 0 && (
            <div className="flex justify-end">
              <Button variant="destructive" onClick={clearAll} size="sm">
                <Trash2 size={16} />
                Clear All
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Combatants */}
      {activeCombatants.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Combatants</CardTitle>
            <CardDescription>
              Battle order by phase (lower phases act first)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeCombatants.map((combatant) => (
              <Card key={combatant.id} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold text-lg">{combatant.name}</h4>
                      <Badge variant="outline">
                        Phase {combatant.battlePhase}
                      </Badge>
                      <Badge variant="outline">
                        {combatant.prowessDie} (Init: {getInitiativeRange(combatant.prowessDie)})
                      </Badge>
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
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor={`adp-${combatant.id}`} className="text-sm">
                        ADP
                      </Label>
                      <Input
                        id={`adp-${combatant.id}`}
                        type="number"
                        value={combatant.adp}
                        onChange={(e) => updateCombatant(combatant.id, 'adp', parseInt(e.target.value) || 0)}
                        className="text-center"
                      />
                      <div className="text-xs text-muted-foreground text-center">
                        Max: {combatant.maxAdp}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor={`pdp-${combatant.id}`} className="text-sm">
                        PDP
                      </Label>
                      <Input
                        id={`pdp-${combatant.id}`}
                        type="number"
                        value={combatant.pdp}
                        onChange={(e) => updateCombatant(combatant.id, 'pdp', parseInt(e.target.value) || 0)}
                        className="text-center"
                      />
                      <div className="text-xs text-muted-foreground text-center">
                        Max: {combatant.maxPdp}
                      </div>
                    </div>

                    {combatant.spiritPoints !== undefined && (
                      <div>
                        <Label htmlFor={`sp-${combatant.id}`} className="text-sm">
                          SP
                        </Label>
                        <Input
                          id={`sp-${combatant.id}`}
                          type="number"
                          value={combatant.spiritPoints}
                          onChange={(e) => updateCombatant(combatant.id, 'spiritPoints', parseInt(e.target.value) || 0)}
                          className="text-center"
                        />
                        <div className="text-xs text-muted-foreground text-center">
                          Max: {combatant.maxSpiritPoints}
                        </div>
                      </div>
                    )}

                    {combatant.reactionFocus !== undefined && (
                      <div>
                        <Label className="text-sm">Reaction Focus</Label>
                        <div className="text-center p-2 bg-muted rounded-lg">
                          +{combatant.reactionFocus}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Defeated Combatants */}
      {defeatedCombatants.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Defeated</CardTitle>
            <CardDescription>
              Combatants that have been defeated
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {defeatedCombatants.map((combatant) => (
              <div
                key={combatant.id}
                className="flex items-center justify-between p-4 bg-muted rounded-lg opacity-75"
              >
                <div className="flex items-center gap-3">
                  <span className="font-medium line-through">{combatant.name}</span>
                  <Badge variant="outline">
                    {combatant.prowessDie}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => reviveCombatant(combatant.id)}
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
            ))}
          </CardContent>
        </Card>
      )}

      {/* Battle Phase Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Battle Phase Reference</CardTitle>
          <CardDescription>
            Initiative order and ranges for Eldritch RPG
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {Object.entries(BATTLE_PHASE_TABLE).map(([die, phase]) => (
              <div key={die} className="text-center p-3 bg-muted rounded-lg">
                <div className="font-bold text-primary">{die}</div>
                <div className="text-sm text-muted-foreground">Phase {phase}</div>
                <div className="text-xs text-muted-foreground">
                  Init: {getInitiativeRange(die)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default BattleCalculator