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
    spiritPoints: 10
  })

  const battlePhaseMap: Record<number, number> = {
    12: 1,
    10: 2,
    8: 3,
    6: 4,
    4: 5
  }

  const addCombatant = () => {
    if (!formData.name.trim()) return

    const battlePhase = battlePhaseMap[formData.prowess] || 5
    const newCombatant: Combatant = {
      id: Date.now().toString(),
      name: formData.name,
      type: formData.type,
      prowess: formData.prowess,
      adp: formData.adp,
      pdp: formData.pdp,
      maxAdp: formData.adp,
      maxPdp: formData.pdp,
      battlePhase,
      defeated: false,
      ...(formData.type === 'pa' && {
        reactionFocus: formData.reactionFocus,
        spiritPoints: formData.spiritPoints
      })
    }

    setCombatants(current => [...current, newCombatant])
    setFormData({
      name: '',
      type: 'pa',
      prowess: 12,
      adp: 22,
      pdp: 18,
      reactionFocus: 0,
      spiritPoints: 10
    })
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
            </div>

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
                      </div>
                    </div>
                    
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
            <CardTitle className="text-lg">Battle Phase Reference</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}