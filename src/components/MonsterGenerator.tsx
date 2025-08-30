import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

// Primary attack form options based on creature type rules
const getAttackFormsByType = (creatureType: string) => {
  const attackForms = {
    minor: ['1d4', '1d6'],
    standard: ['1d6', '1d8', '1d10'],
    exceptional: ['1d8', '1d10', '1d12', '2d6'],
    legendary: ['1d10', '1d12', '2d6', '2d8', '2d10']
  }
  
  return attackForms[creatureType as keyof typeof attackForms] || []
}

export default function MonsterGenerator() {
  const [creatureType, setCreatureType] = useState<string>('')
  const [primaryAttackForm, setPrimaryAttackForm] = useState<string>('')

  const availableAttackForms = getAttackFormsByType(creatureType)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monster Generator</CardTitle>
        <CardDescription>Generate creatures and calculate their statistics</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="creature-type">Creature Type</Label>
            <Select value={creatureType} onValueChange={(value) => {
              setCreatureType(value)
              setPrimaryAttackForm('') // Reset attack form when type changes
            }}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select creature type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="minor">Minor</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="exceptional">Exceptional</SelectItem>
                <SelectItem value="legendary">Legendary</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="primary-attack">Primary Attack Form</Label>
            <Select 
              value={primaryAttackForm} 
              onValueChange={setPrimaryAttackForm}
              disabled={!creatureType}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={creatureType ? "Select attack form" : "Select creature type first"} />
              </SelectTrigger>
              <SelectContent>
                {availableAttackForms.map((form) => (
                  <SelectItem key={form} value={form}>
                    {form}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {creatureType && primaryAttackForm && (
          <div className="mt-6 p-4 bg-card/50 rounded-lg border">
            <h3 className="font-semibold mb-2">Selected Configuration</h3>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium capitalize">{creatureType}</span> creature with{' '}
              <span className="font-medium font-mono">{primaryAttackForm}</span> primary attack form
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}