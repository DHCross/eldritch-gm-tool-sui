import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useKV } from '@github/spark/hooks'
import { Swords, Plus, Trash } from "@phosphor-icons/react"
import { toast } from 'sonner'
import { BATTLE_PHASES } from '@/data/gameData'

interface Combatant {
  id: string
  name: string
  type: 'pa' | 'npc' | 'qsb'
  prowess: number
  battlePhase: number
  initiativeRange: string
  adp: number
  pdp: number
  maxAdp: number
  reactionFocus?: number
  spiritPoints?: number
  isDefeated?: boolean
}

export default function BattleCalculator() {
  const [combatants, setCombatants] = useKV<Combatant[]>('battle-combatants', [])
  const [defeatedCombatants, setDefeatedCombatants] = useKV<Combatant[]>('defeated-combatants', [])
  
  const [newCombatant, setNewCombatant] = useState({
    name: '',
    type: 'pa' as 'pa' | 'npc' | 'qsb',
    prowess: 12,
    adp: 0,
    pdp: 0,
    reactionFocus: 0,
    spiritPoints: 0
  })

  const calculateBattlePhase = (prowessDie: number) => {
    const dieKey = `d${prowessDie}` as keyof typeof BATTLE_PHASES
    return BATTLE_PHASES[dieKey] || { phase: 5, initiativeRange: '1-4' }
  }

  const addCombatant = () => {
    if (!newCombatant.name.trim()) {
      toast.error("Please enter a combatant name")
      return
    }

    const battlePhaseData = calculateBattlePhase(newCombatant.prowess)
    const combatant: Combatant = {
      id: `${Date.now()}-${Math.random()}`,
      name: newCombatant.name,
      type: newCombatant.type,
      prowess: newCombatant.prowess,
      battlePhase: battlePhaseData.phase,
      initiativeRange: battlePhaseData.initiativeRange,
      adp: newCombatant.adp,
      pdp: newCombatant.pdp,
      maxAdp: newCombatant.adp,
      reactionFocus: newCombatant.type === 'pa' ? newCombatant.reactionFocus : undefined,
      spiritPoints: newCombatant.type === 'pa' ? newCombatant.spiritPoints : undefined
    }

    setCombatants(currentCombatants => {
      const updated = [...currentCombatants, combatant]
      return updated.sort((a, b) => b.prowess - a.prowess)
    })

    // Reset form
    setNewCombatant({
      name: '',
      type: 'pa',
      prowess: 12,
      adp: 0,
      pdp: 0,
      reactionFocus: 0,
      spiritPoints: 0
    })

    toast.success(`${combatant.name} added to battle`)
  }

  const updateCombatantStat = (id: string, stat: keyof Combatant, value: any) => {
    setCombatants(currentCombatants => 
      currentCombatants.map(c => 
        c.id === id ? { ...c, [stat]: value } : c
      )
    )
  }

  const defeatCombatant = (id: string) => {
    const combatant = combatants.find(c => c.id === id)
    if (!combatant) return

    setCombatants(currentCombatants => currentCombatants.filter(c => c.id !== id))
    setDefeatedCombatants(currentDefeated => [...currentDefeated, { ...combatant, isDefeated: true }])
    
    toast.success(`${combatant.name} has been defeated`)
  }

  const reviveCombatant = (id: string) => {
    const combatant = defeatedCombatants.find(c => c.id === id)
    if (!combatant) return

    setDefeatedCombatants(currentDefeated => currentDefeated.filter(c => c.id !== id))
    setCombatants(currentCombatants => {
      const updated = [...currentCombatants, { ...combatant, isDefeated: false }]
      return updated.sort((a, b) => b.prowess - a.prowess)
    })
    
    toast.success(`${combatant.name} has been revived`)
  }

  const removeCombatant = (id: string, isDefeated = false) => {
    if (isDefeated) {
      const combatant = defeatedCombatants.find(c => c.id === id)
      setDefeatedCombatants(currentDefeated => currentDefeated.filter(c => c.id !== id))
      toast.success(`${combatant?.name} removed from battle`)
    } else {
      const combatant = combatants.find(c => c.id === id)
      setCombatants(currentCombatants => currentCombatants.filter(c => c.id !== id))
      toast.success(`${combatant?.name} removed from battle`)
    }
  }

  const clearAll = () => {
    setCombatants([])
    setDefeatedCombatants([])
    toast.success("Battle cleared")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Swords className="text-accent" />
          Battle Phase Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add Combatant Form */}
        <Card className="bg-muted/20">
          <CardHeader>
            <CardTitle className="text-lg">Add Combatant</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="combatant-type">Combatant Type</Label>
              <Select value={newCombatant.type} onValueChange={(value: 'pa' | 'npc' | 'qsb') => 
                setNewCombatant(prev => ({ ...prev, type: value }))}>
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
              <Label htmlFor="combatant-name">Name</Label>
              <Input
                id="combatant-name"
                value={newCombatant.name}
                onChange={(e) => setNewCombatant(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter combatant name"
              />
            </div>

            <div>
              <Label htmlFor="prowess">Prowess Die</Label>
              <Select value={newCombatant.prowess.toString()} onValueChange={(value) => 
                setNewCombatant(prev => ({ ...prev, prowess: parseInt(value) }))}>
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

            {newCombatant.type === 'pa' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reaction-focus">Reaction Focus Bonus</Label>
                  <Input
                    id="reaction-focus"
                    type="number"
                    value={newCombatant.reactionFocus}
                    onChange={(e) => setNewCombatant(prev => ({ ...prev, reactionFocus: parseInt(e.target.value) || 0 }))}
                    placeholder="e.g., 2"
                  />
                </div>
                <div>
                  <Label htmlFor="spirit-points">Spirit Points (SP)</Label>
                  <Input
                    id="spirit-points"
                    type="number"
                    value={newCombatant.spiritPoints}
                    onChange={(e) => setNewCombatant(prev => ({ ...prev, spiritPoints: parseInt(e.target.value) || 0 }))}
                    placeholder="e.g., 10"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="adp">Active Defense Pool (ADP)</Label>
                <Input
                  id="adp"
                  type="number"
                  value={newCombatant.adp}
                  onChange={(e) => setNewCombatant(prev => ({ ...prev, adp: parseInt(e.target.value) || 0 }))}
                  placeholder="e.g., 22"
                />
              </div>
              <div>
                <Label htmlFor="pdp">Passive Defense Pool (PDP)</Label>
                <Input
                  id="pdp"
                  type="number"
                  value={newCombatant.pdp}
                  onChange={(e) => setNewCombatant(prev => ({ ...prev, pdp: parseInt(e.target.value) || 0 }))}
                  placeholder="e.g., 18"
                />
              </div>
            </div>

            <Button onClick={addCombatant} className="w-full">
              <Plus size={16} className="mr-2" />
              Add Combatant
            </Button>
          </CardContent>
        </Card>

        {/* Active Combatants */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Active Combatants</h3>
            {(combatants.length > 0 || defeatedCombatants.length > 0) && (
              <Button variant="destructive" size="sm" onClick={clearAll}>
                Clear All
              </Button>
            )}
          </div>
          
          {combatants.length === 0 ? (
            <Card className="bg-muted/20">
              <CardContent className="pt-6 text-center text-muted-foreground">
                No active combatants. Add some above to start the battle!
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {combatants.map((combatant) => (
                <Card key={combatant.id} className="bg-card border-l-4 border-l-primary">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{combatant.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          d{combatant.prowess} (Phase {combatant.battlePhase}, Init: {combatant.initiativeRange})
                          {combatant.type === 'pa' && combatant.spiritPoints !== undefined && (
                            <span> | SP: {combatant.spiritPoints}</span>
                          )}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="destructive" size="sm" onClick={() => defeatCombatant(combatant.id)}>
                          Defeat
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => removeCombatant(combatant.id)}>
                          <Trash size={16} />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`adp-${combatant.id}`} className="text-xs">ADP</Label>
                        <Input
                          id={`adp-${combatant.id}`}
                          type="number"
                          value={combatant.adp}
                          onChange={(e) => updateCombatantStat(combatant.id, 'adp', parseInt(e.target.value) || 0)}
                          className="h-8"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`pdp-${combatant.id}`} className="text-xs">PDP</Label>
                        <Input
                          id={`pdp-${combatant.id}`}
                          type="number"
                          value={combatant.pdp}
                          onChange={(e) => updateCombatantStat(combatant.id, 'pdp', parseInt(e.target.value) || 0)}
                          className="h-8"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Defeated Combatants */}
        {defeatedCombatants.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Defeated</h3>
            <div className="space-y-3">
              {defeatedCombatants.map((combatant) => (
                <Card key={combatant.id} className="bg-destructive/10 border-l-4 border-l-destructive">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-muted-foreground">{combatant.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          d{combatant.prowess} (Phase {combatant.battlePhase}, Init: {combatant.initiativeRange})
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => reviveCombatant(combatant.id)}>
                          Revive
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => removeCombatant(combatant.id, true)}>
                          <Trash size={16} />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}