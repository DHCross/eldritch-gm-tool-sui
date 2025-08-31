import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

interface MonsterStats {
  name: string
  type: string
  size: string
  nature: string
  constitution: string
  primaryAttack: string
  secondaryAttack: string
  tertiaryAttack: string
  damageReduction: string
  baseHP: number
  totalHP: number
  activeDefense: number
  passiveDefense: number
  battlePhase: number
  savingThrow: string
  notes: string
}

// Size modifiers for HP calculation
const sizeModifiers = {
  'minuscule': 0,
  'tiny': 0,
  'small': 1,
  'medium': 1,
  'large': 2,
  'huge': 3,
  'gargantuan': 4
}

// Nature modifiers for HP calculation
const natureModifiers = {
  'mundane': 0,
  'magical': 1,
  'preternatural': 2,
  'supernatural': 3
}

// Constitution modifiers
const constitutionModifiers = {
  'frail': 0.5,
  'normal': 1.0,
  'robust': 1.5,
  'exceptional': 2.0
}

// HP multipliers by size and nature
const hpMultipliers = {
  'minuscule': { 'mundane': 0.5, 'magical': 1, 'preternatural': 1.5, 'supernatural': 2 },
  'tiny': { 'mundane': 0.5, 'magical': 1, 'preternatural': 1.5, 'supernatural': 2 },
  'small': { 'mundane': 1, 'magical': 1.5, 'preternatural': 2, 'supernatural': 2.5 },
  'medium': { 'mundane': 1, 'magical': 1.5, 'preternatural': 2, 'supernatural': 2.5 },
  'large': { 'mundane': 1.5, 'magical': 2, 'preternatural': 2.5, 'supernatural': 3 },
  'huge': { 'mundane': 2, 'magical': 2.5, 'preternatural': 3, 'supernatural': 3.5 },
  'gargantuan': { 'mundane': 2.5, 'magical': 3, 'preternatural': 3.5, 'supernatural': 4 }
}

// Attack forms by creature type
const getAttackFormsByType = (creatureType: string) => {
  const attackForms = {
    minor: ['1d4', '1d6', '1d8', '1d10', '1d12'],
    standard: ['2d4', '2d6', '2d8', '2d10', '2d12'],
    exceptional: ['3d4', '3d6', '3d8', '3d10', '3d12'],
    legendary: ['3d4', '3d6', '3d8', '3d10', '3d12', '3d14', '3d16', '3d18', '3d20']
  }
  
  return attackForms[creatureType as keyof typeof attackForms] || []
}

// Secondary/tertiary attack forms (lower than primary)
const getSecondaryAttackForms = (creatureType: string, primaryAttack: string) => {
  const allForms = {
    minor: ['1d4', '1d6', '1d8', '1d10', '1d12'],
    standard: ['1d4', '1d6', '1d8', '1d10', '1d12', '2d4', '2d6', '2d8', '2d10', '2d12'],
    exceptional: ['1d4', '1d6', '1d8', '1d10', '1d12', '2d4', '2d6', '2d8', '2d10', '2d12', '3d4', '3d6', '3d8', '3d10', '3d12'],
    legendary: ['1d4', '1d6', '1d8', '1d10', '1d12', '2d4', '2d6', '2d8', '2d10', '2d12', '3d4', '3d6', '3d8', '3d10', '3d12', '3d14', '3d16', '3d18', '3d20']
  }
  
  const forms = allForms[creatureType as keyof typeof allForms] || []
  const primaryMV = calculateMaxValue(primaryAttack)
  
  // Return forms with MV less than or equal to primary
  return forms.filter(form => calculateMaxValue(form) <= primaryMV)
}

// Calculate maximum value of dice expression
const calculateMaxValue = (diceExpression: string): number => {
  if (!diceExpression) return 0
  const match = diceExpression.match(/(\d+)d(\d+)/)
  if (match) {
    const count = parseInt(match[1])
    const sides = parseInt(match[2])
    return count * sides
  }
  return 0
}

// Calculate battle phase from prowess die
const calculateBattlePhase = (maxValue: number): number => {
  if (maxValue >= 12) return 1
  if (maxValue >= 10) return 2
  if (maxValue >= 8) return 3
  if (maxValue >= 6) return 4
  return 5
}

// Calculate saving throw
const calculateSavingThrow = (creatureType: string): string => {
  const savingThrows = {
    minor: 'd4',
    standard: 'd8',
    exceptional: 'd12',
    legendary: 'd12+'
  }
  return savingThrows[creatureType as keyof typeof savingThrows] || 'd4'
}

export default function MonsterGenerator() {
  const [monster, setMonster] = useState<MonsterStats>({
    name: '',
    type: 'standard',
    size: 'medium',
    nature: 'mundane',
    constitution: 'normal',
    primaryAttack: '',
    secondaryAttack: 'none',
    tertiaryAttack: 'none',
    damageReduction: '',
    baseHP: 0,
    totalHP: 0,
    activeDefense: 0,
    passiveDefense: 0,
    battlePhase: 5,
    savingThrow: 'd8',
    notes: ''
  })

  const availablePrimaryAttacks = getAttackFormsByType(monster.type)
  const availableSecondaryAttacks = getSecondaryAttackForms(monster.type, monster.primaryAttack)

  const updateMonster = (field: keyof MonsterStats, value: string | number) => {
    setMonster(prev => {
      const updated = { ...prev, [field]: value }
      
      // Recalculate HP when relevant fields change
      if (['size', 'nature', 'constitution', 'primaryAttack'].includes(field)) {
        const baseHP = calculateMaxValue(updated.primaryAttack)
        const multiplier = hpMultipliers[updated.size as keyof typeof hpMultipliers]?.[updated.nature as keyof typeof hpMultipliers['medium']] || 1
        const constitutionMod = constitutionModifiers[updated.constitution as keyof typeof constitutionModifiers] || 1
        const totalHP = Math.round(baseHP * multiplier * constitutionMod)
        
        updated.baseHP = baseHP
        updated.totalHP = totalHP
        updated.activeDefense = Math.round(totalHP / 2)
        updated.passiveDefense = totalHP - updated.activeDefense
        updated.battlePhase = calculateBattlePhase(baseHP)
        updated.savingThrow = calculateSavingThrow(updated.type)
      }
      
      // Reset secondary attacks if type or primary changes
      if (field === 'type' || field === 'primaryAttack') {
        updated.secondaryAttack = 'none'
        updated.tertiaryAttack = 'none'
      }
      
      return updated
    })
  }

  const generateMonster = () => {
    if (!monster.primaryAttack) return

    const statBlock = `
**${monster.name || 'Unnamed Creature'}**
Type: ${monster.type.charAt(0).toUpperCase() + monster.type.slice(1)} ${monster.size} ${monster.nature} creature
HP: ${monster.totalHP} (${monster.activeDefense}A/${monster.passiveDefense}P) [${monster.constitution}, ${monster.size}, ${monster.nature}; HP multiplier ×${(hpMultipliers[monster.size as keyof typeof hpMultipliers]?.[monster.nature as keyof typeof hpMultipliers['medium']] * constitutionModifiers[monster.constitution as keyof typeof constitutionModifiers]).toFixed(1)}]
TD: Primary ${monster.primaryAttack} (MV: ${monster.baseHP})${monster.secondaryAttack && monster.secondaryAttack !== 'none' ? `, Secondary ${monster.secondaryAttack} (MV: ${calculateMaxValue(monster.secondaryAttack)})` : ''}${monster.tertiaryAttack && monster.tertiaryAttack !== 'none' ? `, Tertiary ${monster.tertiaryAttack} (MV: ${calculateMaxValue(monster.tertiaryAttack)})` : ''}
${monster.damageReduction ? `DR: ${monster.damageReduction}` : 'DR: None'}
ST: ${monster.savingThrow} (${monster.type} threat)
BP: ${monster.battlePhase}
${monster.notes ? `\nNotes: ${monster.notes}` : ''}
    `.trim()

    navigator.clipboard.writeText(statBlock).then(() => {
      toast.success('Monster stat block copied to clipboard!')
    }).catch(() => {
      toast.error('Failed to copy to clipboard')
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monster Generator</CardTitle>
        <CardDescription>Create detailed creature stat blocks for Eldritch RPG</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="monster-name">Creature Name</Label>
            <Input
              id="monster-name"
              value={monster.name}
              onChange={(e) => updateMonster('name', e.target.value)}
              placeholder="Enter creature name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="creature-type">Creature Type</Label>
            <Select value={monster.type} onValueChange={(value) => updateMonster('type', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="minor">Minor (1 threat die)</SelectItem>
                <SelectItem value="standard">Standard (2 threat dice)</SelectItem>
                <SelectItem value="exceptional">Exceptional (3 threat dice)</SelectItem>
                <SelectItem value="legendary">Legendary (3+ threat dice, special)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Physical Characteristics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="size">Size</Label>
            <Select value={monster.size} onValueChange={(value) => updateMonster('size', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="minuscule">Minuscule</SelectItem>
                <SelectItem value="tiny">Tiny</SelectItem>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
                <SelectItem value="huge">Huge</SelectItem>
                <SelectItem value="gargantuan">Gargantuan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nature">Nature</Label>
            <Select value={monster.nature} onValueChange={(value) => updateMonster('nature', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mundane">Mundane</SelectItem>
                <SelectItem value="magical">Magical</SelectItem>
                <SelectItem value="preternatural">Preternatural</SelectItem>
                <SelectItem value="supernatural">Supernatural</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="constitution">Constitution</Label>
            <Select value={monster.constitution} onValueChange={(value) => updateMonster('constitution', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="frail">Frail (×0.5)</SelectItem>
                <SelectItem value="normal">Normal (×1.0)</SelectItem>
                <SelectItem value="robust">Robust (×1.5)</SelectItem>
                <SelectItem value="exceptional">Exceptional (×2.0)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Attack Forms */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="primary-attack">Primary Attack Form (Required)</Label>
            <Select 
              value={monster.primaryAttack} 
              onValueChange={(value) => updateMonster('primaryAttack', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select primary attack" />
              </SelectTrigger>
              <SelectContent>
                {availablePrimaryAttacks.map((form) => (
                  <SelectItem key={form} value={form}>
                    {form} (MV: {calculateMaxValue(form)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="secondary-attack">Secondary Attack (Optional)</Label>
              <Select 
                value={monster.secondaryAttack} 
                onValueChange={(value) => updateMonster('secondaryAttack', value === 'none' ? '' : value)}
                disabled={!monster.primaryAttack}
              >
                <SelectTrigger>
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {availableSecondaryAttacks.map((form) => (
                    <SelectItem key={form} value={form}>
                      {form} (MV: {calculateMaxValue(form)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tertiary-attack">Tertiary Attack (Optional)</Label>
              <Select 
                value={monster.tertiaryAttack} 
                onValueChange={(value) => updateMonster('tertiaryAttack', value === 'none' ? '' : value)}
                disabled={!monster.primaryAttack}
              >
                <SelectTrigger>
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {availableSecondaryAttacks.map((form) => (
                    <SelectItem key={form} value={form}>
                      {form} (MV: {calculateMaxValue(form)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Damage Reduction */}
        <div className="space-y-2">
          <Label htmlFor="damage-reduction">Damage Reduction (Optional)</Label>
          <Input
            id="damage-reduction"
            value={monster.damageReduction}
            onChange={(e) => updateMonster('damageReduction', e.target.value)}
            placeholder="e.g., 1d6 (leather armor), 1d8 (natural hide), 2 (magical protection)"
          />
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notes & Special Abilities</Label>
          <Textarea
            id="notes"
            value={monster.notes}
            onChange={(e) => updateMonster('notes', e.target.value)}
            placeholder="Describe special abilities, equipment, lore, or unique traits..."
            rows={3}
          />
        </div>

        <Separator />

        {/* Generated Stats Display */}
        {monster.primaryAttack && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Generated Statistics</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-card/50 rounded-lg border">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{monster.totalHP}</div>
                <div className="text-sm text-muted-foreground">Total HP</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">{monster.activeDefense}A</div>
                <div className="text-sm text-muted-foreground">Active DP</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">{monster.passiveDefense}P</div>
                <div className="text-sm text-muted-foreground">Passive DP</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary">{monster.battlePhase}</div>
                <div className="text-sm text-muted-foreground">Battle Phase</div>
              </div>
            </div>

            <div className="p-4 bg-muted/20 rounded-lg border font-mono text-sm whitespace-pre-line">
              <strong>{monster.name || 'Unnamed Creature'}</strong>{'\n'}
              Type: {monster.type.charAt(0).toUpperCase() + monster.type.slice(1)} {monster.size} {monster.nature} creature{'\n'}
              HP: {monster.totalHP} ({monster.activeDefense}A/{monster.passiveDefense}P) [{monster.constitution}, {monster.size}, {monster.nature}; HP multiplier ×{(hpMultipliers[monster.size as keyof typeof hpMultipliers]?.[monster.nature as keyof typeof hpMultipliers['medium']] * constitutionModifiers[monster.constitution as keyof typeof constitutionModifiers]).toFixed(1)}]{'\n'}
              TD: Primary {monster.primaryAttack} (MV: {monster.baseHP}){monster.secondaryAttack && monster.secondaryAttack !== 'none' ? `, Secondary ${monster.secondaryAttack} (MV: ${calculateMaxValue(monster.secondaryAttack)})` : ''}{monster.tertiaryAttack && monster.tertiaryAttack !== 'none' ? `, Tertiary ${monster.tertiaryAttack} (MV: ${calculateMaxValue(monster.tertiaryAttack)})` : ''}{'\n'}
              {monster.damageReduction ? `DR: ${monster.damageReduction}` : 'DR: None'}{'\n'}
              ST: {monster.savingThrow} ({monster.type} threat){'\n'}
              BP: {monster.battlePhase}{monster.notes ? `\n\nNotes: ${monster.notes}` : ''}
            </div>

            <Button onClick={generateMonster} className="w-full">
              Copy Stat Block to Clipboard
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}