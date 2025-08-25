import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from 'sonner'
import { Heart, Calculator, Dice6 } from "@phosphor-icons/react"

// Hit Point Modifiers Table
const HIT_POINT_MODIFIERS = {
  'Minuscule': { 'Mundane': 0.5, 'Magical': 1, 'Preternatural': 1.5, 'Supernatural': 2 },
  'Tiny': { 'Mundane': 0.5, 'Magical': 1, 'Preternatural': 1.5, 'Supernatural': 2 },
  'Small': { 'Mundane': 1, 'Magical': 1.5, 'Preternatural': 2, 'Supernatural': 2.5 },
  'Medium': { 'Mundane': 1, 'Magical': 1.5, 'Preternatural': 2, 'Supernatural': 2.5 },
  'Large': { 'Mundane': 1.5, 'Magical': 2, 'Preternatural': 2.5, 'Supernatural': 3 },
  'Huge': { 'Mundane': 2, 'Magical': 2.5, 'Preternatural': 3, 'Supernatural': 3.5 },
  'Gargantuan': { 'Mundane': 2.5, 'Magical': 3, 'Preternatural': 3.5, 'Supernatural': 4 }
};

interface MonsterData {
  name: string
  type: string
  size: string
  nature: string
  meleeAttack: { dice: number, die: number }
  naturalAttack: { dice: number, die: number }
  rangedAttack: { dice: number, die: number }
  arcaneAttack: { dice: number, die: number }
  hitPoints: number
  activeDefense: number
  passiveDefense: number
  damageReduction: string
  savingThrow: string
  battlePhase: number
  notes: string
}

interface ThreatValidation {
  isValid: boolean
  message: string
}

function MonsterGenerator() {
  const [monsterData, setMonsterData] = useState<MonsterData>({
    name: '',
    type: 'Standard',
    size: 'Medium',
    nature: 'Mundane',
    meleeAttack: { dice: 2, die: 6 },
    naturalAttack: { dice: 0, die: 4 },
    rangedAttack: { dice: 0, die: 4 },
    arcaneAttack: { dice: 0, die: 4 },
    hitPoints: 0,
    activeDefense: 0,
    passiveDefense: 0,
    damageReduction: '',
    savingThrow: '',
    battlePhase: 1,
    notes: ''
  });

  const [generatedMonster, setGeneratedMonster] = useState<MonsterData | null>(null);

  // Available dice sizes
  const diceOptions = [4, 6, 8, 10, 12, 14, 16, 18, 20];
  const standardDice = [4, 6, 8, 10, 12];

  // Validate threat dice based on creature type
  function validateThreatDice(type: string, attacks: any[]): ThreatValidation {
    const nonZeroAttacks = attacks.filter(attack => attack.dice > 0);
    
    if (nonZeroAttacks.length === 0) {
      return { isValid: false, message: "At least one attack must have dice assigned." };
    }

    const maxDiceCount = Math.max(...nonZeroAttacks.map(attack => attack.dice));
    
    switch (type) {
      case 'Minor':
        if (maxDiceCount > 1) {
          return { isValid: false, message: "Minor threats can only have 1 die in any attack." };
        }
        break;
      case 'Standard':
        if (maxDiceCount !== 2) {
          return { isValid: false, message: "Standard threats must have exactly 2 dice in their primary attack." };
        }
        if (nonZeroAttacks.some(attack => attack.dice > 2)) {
          return { isValid: false, message: "Standard threats cannot have more than 2 dice in any attack." };
        }
        break;
      case 'Exceptional':
        if (maxDiceCount < 3) {
          return { isValid: false, message: "Exceptional threats must have at least 3 dice in their primary attack." };
        }
        break;
      case 'Legendary':
        if (maxDiceCount < 3) {
          return { isValid: false, message: "Legendary threats must have at least 3 dice in their primary attack." };
        }
        // Legendary can use larger dice (d14, d16, d18, d20)
        break;
    }

    return { isValid: true, message: "" };
  }

  // Get available dice sizes based on creature type
  function getAvailableDice(type: string): number[] {
    return type === 'Legendary' ? diceOptions : standardDice;
  }

  // Get available dice count options based on creature type
  function getAvailableDiceCount(type: string, isPrimary: boolean = false): number[] {
    switch (type) {
      case 'Minor':
        return [0, 1];
      case 'Standard':
        if (isPrimary) return [2];
        return [0, 1, 2];
      case 'Exceptional':
        if (isPrimary) return [3, 4, 5];
        return [0, 1, 2, 3];
      case 'Legendary':
        if (isPrimary) return [3, 4, 5, 6];
        return [0, 1, 2, 3, 4, 5];
      default:
        return [0, 1, 2, 3];
    }
  }

  // Calculate battle phase based on highest die
  function calculateBattlePhase(attacks: any[]): number {
    const nonZeroAttacks = attacks.filter(attack => attack.dice > 0);
    if (nonZeroAttacks.length === 0) return 5;
    
    const highestDie = Math.max(...nonZeroAttacks.map(attack => attack.die));
    
    if (highestDie >= 12) return 1;
    if (highestDie >= 10) return 2;
    if (highestDie >= 8) return 3;
    if (highestDie >= 6) return 4;
    return 5;
  }

  // Calculate saving throw based on type
  function calculateSavingThrow(type: string): string {
    switch (type) {
      case 'Minor': return 'd4';
      case 'Standard': return 'd8';
      case 'Exceptional': return 'd12';
      case 'Legendary': return 'd16';
      default: return 'd4';
    }
  }

  // Calculate hit points
  function calculateHitPoints(attacks: any[], size: string, nature: string): number {
    const maxMV = Math.max(...attacks.map(attack => 
      attack.dice > 0 ? attack.dice * attack.die : 0
    ));
    
    const multiplier = (HIT_POINT_MODIFIERS as any)[size]?.[nature] || 1;
    return Math.round(maxMV * multiplier);
  }

  function generateMonster() {
    if (!monsterData.name.trim()) {
      toast.error("Please enter a monster name.");
      return;
    }

    const attacks = [
      monsterData.meleeAttack,
      monsterData.naturalAttack,
      monsterData.rangedAttack,
      monsterData.arcaneAttack
    ];

    const validation = validateThreatDice(monsterData.type, attacks);
    if (!validation.isValid) {
      toast.error(validation.message);
      return;
    }

    const hitPoints = calculateHitPoints(attacks, monsterData.size, monsterData.nature);
    const battlePhase = calculateBattlePhase(attacks);
    const savingThrow = calculateSavingThrow(monsterData.type);

    // Calculate defense pools (simplified for NPCs)
    const activeDefense = Math.round(hitPoints * 0.4);
    const passiveDefense = hitPoints - activeDefense;

    const generated: MonsterData = {
      ...monsterData,
      hitPoints,
      activeDefense,
      passiveDefense,
      battlePhase,
      savingThrow
    };

    setGeneratedMonster(generated);
    toast.success('Monster generated successfully!');
  }

  function formatThreatDice(attack: { dice: number, die: number }): string {
    if (attack.dice === 0) return "—";
    return `${attack.dice}d${attack.die}`;
  }

  function getThreatMV(attack: { dice: number, die: number }): number {
    return attack.dice * attack.die;
  }

  function getTypeDescription(type: string): string {
    switch (type) {
      case 'Minor': return "1 threat die maximum";
      case 'Standard': return "Exactly 2 dice in primary attack, max 2 dice in others";
      case 'Exceptional': return "At least 3 dice in primary attack";
      case 'Legendary': return "At least 3 dice, can use d14-d20";
      default: return "";
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Heart className="text-accent" />
            Monster Generator
          </CardTitle>
          <CardDescription>
            Create complete stat blocks for creatures in the Eldritch Realms
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="name">Creature Name</Label>
              <Input
                id="name"
                value={monsterData.name}
                onChange={(e) => setMonsterData({ ...monsterData, name: e.target.value })}
                placeholder="Enter creature name"
              />
            </div>

            <div>
              <Label htmlFor="type">Creature Type</Label>
              <Select 
                value={monsterData.type} 
                onValueChange={(value) => setMonsterData({ ...monsterData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Minor">Minor</SelectItem>
                  <SelectItem value="Standard">Standard</SelectItem>
                  <SelectItem value="Exceptional">Exceptional</SelectItem>
                  <SelectItem value="Legendary">Legendary</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                {getTypeDescription(monsterData.type)}
              </p>
            </div>

            <div>
              <Label htmlFor="size">Size</Label>
              <Select 
                value={monsterData.size} 
                onValueChange={(value) => setMonsterData({ ...monsterData, size: value })}
              >
                <SelectTrigger>
                  <SelectValue />
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

            <div>
              <Label htmlFor="nature">Nature</Label>
              <Select 
                value={monsterData.nature} 
                onValueChange={(value) => setMonsterData({ ...monsterData, nature: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mundane">Mundane</SelectItem>
                  <SelectItem value="Magical">Magical</SelectItem>
                  <SelectItem value="Preternatural">Preternatural</SelectItem>
                  <SelectItem value="Supernatural">Supernatural</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Attack Types */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Threat Dice (TD)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Melee Attack */}
              <div className="space-y-2">
                <Label>Melee Attack</Label>
                <div className="flex gap-2">
                  <Select 
                    value={monsterData.meleeAttack.dice.toString()} 
                    onValueChange={(value) => setMonsterData({ 
                      ...monsterData, 
                      meleeAttack: { ...monsterData.meleeAttack, dice: parseInt(value) }
                    })}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableDiceCount(monsterData.type).map(num => (
                        <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="self-center">d</span>
                  <Select 
                    value={monsterData.meleeAttack.die.toString()} 
                    onValueChange={(value) => setMonsterData({ 
                      ...monsterData, 
                      meleeAttack: { ...monsterData.meleeAttack, die: parseInt(value) }
                    })}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableDice(monsterData.type).map(die => (
                        <SelectItem key={die} value={die.toString()}>{die}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="self-center text-sm text-muted-foreground">
                    (MV: {getThreatMV(monsterData.meleeAttack)})
                  </span>
                </div>
              </div>

              {/* Natural Attack */}
              <div className="space-y-2">
                <Label>Natural Attack</Label>
                <div className="flex gap-2">
                  <Select 
                    value={monsterData.naturalAttack.dice.toString()} 
                    onValueChange={(value) => setMonsterData({ 
                      ...monsterData, 
                      naturalAttack: { ...monsterData.naturalAttack, dice: parseInt(value) }
                    })}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableDiceCount(monsterData.type).map(num => (
                        <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="self-center">d</span>
                  <Select 
                    value={monsterData.naturalAttack.die.toString()} 
                    onValueChange={(value) => setMonsterData({ 
                      ...monsterData, 
                      naturalAttack: { ...monsterData.naturalAttack, die: parseInt(value) }
                    })}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableDice(monsterData.type).map(die => (
                        <SelectItem key={die} value={die.toString()}>{die}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="self-center text-sm text-muted-foreground">
                    (MV: {getThreatMV(monsterData.naturalAttack)})
                  </span>
                </div>
              </div>

              {/* Ranged Attack */}
              <div className="space-y-2">
                <Label>Ranged Attack</Label>
                <div className="flex gap-2">
                  <Select 
                    value={monsterData.rangedAttack.dice.toString()} 
                    onValueChange={(value) => setMonsterData({ 
                      ...monsterData, 
                      rangedAttack: { ...monsterData.rangedAttack, dice: parseInt(value) }
                    })}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableDiceCount(monsterData.type).map(num => (
                        <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="self-center">d</span>
                  <Select 
                    value={monsterData.rangedAttack.die.toString()} 
                    onValueChange={(value) => setMonsterData({ 
                      ...monsterData, 
                      rangedAttack: { ...monsterData.rangedAttack, die: parseInt(value) }
                    })}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableDice(monsterData.type).map(die => (
                        <SelectItem key={die} value={die.toString()}>{die}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="self-center text-sm text-muted-foreground">
                    (MV: {getThreatMV(monsterData.rangedAttack)})
                  </span>
                </div>
              </div>

              {/* Arcane Attack */}
              <div className="space-y-2">
                <Label>Arcane Attack</Label>
                <div className="flex gap-2">
                  <Select 
                    value={monsterData.arcaneAttack.dice.toString()} 
                    onValueChange={(value) => setMonsterData({ 
                      ...monsterData, 
                      arcaneAttack: { ...monsterData.arcaneAttack, dice: parseInt(value) }
                    })}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableDiceCount(monsterData.type).map(num => (
                        <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="self-center">d</span>
                  <Select 
                    value={monsterData.arcaneAttack.die.toString()} 
                    onValueChange={(value) => setMonsterData({ 
                      ...monsterData, 
                      arcaneAttack: { ...monsterData.arcaneAttack, die: parseInt(value) }
                    })}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableDice(monsterData.type).map(die => (
                        <SelectItem key={die} value={die.toString()}>{die}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="self-center text-sm text-muted-foreground">
                    (MV: {getThreatMV(monsterData.arcaneAttack)})
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Additional Details */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="damageReduction">Damage Reduction (DR)</Label>
              <Input
                id="damageReduction"
                value={monsterData.damageReduction}
                onChange={(e) => setMonsterData({ ...monsterData, damageReduction: e.target.value })}
                placeholder="e.g., 1d6 (armor), 1d4 (tough hide)"
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes & Special Abilities</Label>
              <Textarea
                id="notes"
                value={monsterData.notes}
                onChange={(e) => setMonsterData({ ...monsterData, notes: e.target.value })}
                placeholder="Describe special abilities, equipment, lore, or other unique traits..."
                rows={3}
              />
            </div>
          </div>

          <Button onClick={generateMonster} className="w-full">
            <Calculator size={16} className="mr-2" />
            Generate Monster
          </Button>
        </CardContent>
      </Card>

      {/* Generated Monster Display */}
      {generatedMonster && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Dice6 className="text-accent" />
              {generatedMonster.name}
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{generatedMonster.type} Threat</Badge>
              <Badge variant="outline">{generatedMonster.size}</Badge>
              <Badge variant="outline">{generatedMonster.nature}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-muted rounded-lg p-3">
                <div className="text-xs text-muted-foreground">HP</div>
                <div className="text-lg font-bold">{generatedMonster.hitPoints}</div>
                <div className="text-xs text-muted-foreground">
                  ({generatedMonster.activeDefense}A/{generatedMonster.passiveDefense}P)
                </div>
              </div>
              <div className="bg-muted rounded-lg p-3">
                <div className="text-xs text-muted-foreground">ST</div>
                <div className="text-lg font-bold">{generatedMonster.savingThrow}</div>
              </div>
              <div className="bg-muted rounded-lg p-3">
                <div className="text-xs text-muted-foreground">BP</div>
                <div className="text-lg font-bold">{generatedMonster.battlePhase}</div>
              </div>
              <div className="bg-muted rounded-lg p-3">
                <div className="text-xs text-muted-foreground">Type</div>
                <div className="text-lg font-bold">{generatedMonster.type}</div>
              </div>
            </div>

            {/* Threat Dice */}
            <div>
              <h4 className="font-semibold mb-3">Threat Dice (TD)</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm font-medium">Melee</div>
                  <div className="text-lg">{formatThreatDice(generatedMonster.meleeAttack)}</div>
                  <div className="text-xs text-muted-foreground">MV: {getThreatMV(generatedMonster.meleeAttack)}</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Natural</div>
                  <div className="text-lg">{formatThreatDice(generatedMonster.naturalAttack)}</div>
                  <div className="text-xs text-muted-foreground">MV: {getThreatMV(generatedMonster.naturalAttack)}</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Ranged</div>
                  <div className="text-lg">{formatThreatDice(generatedMonster.rangedAttack)}</div>
                  <div className="text-xs text-muted-foreground">MV: {getThreatMV(generatedMonster.rangedAttack)}</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Arcane</div>
                  <div className="text-lg">{formatThreatDice(generatedMonster.arcaneAttack)}</div>
                  <div className="text-xs text-muted-foreground">MV: {getThreatMV(generatedMonster.arcaneAttack)}</div>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            {(generatedMonster.damageReduction || generatedMonster.notes) && (
              <div className="space-y-3">
                {generatedMonster.damageReduction && (
                  <div>
                    <h4 className="font-semibold mb-1">Damage Reduction (DR)</h4>
                    <p className="text-sm">{generatedMonster.damageReduction}</p>
                  </div>
                )}
                
                {generatedMonster.notes && (
                  <div>
                    <h4 className="font-semibold mb-1">Notes</h4>
                    <p className="text-sm whitespace-pre-wrap">{generatedMonster.notes}</p>
                  </div>
                )}
              </div>
            )}

            {/* Full Stat Block */}
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-2">Complete Stat Block</h4>
              <div className="bg-muted p-4 rounded font-mono text-sm">
                <div><strong>{generatedMonster.name}</strong> ({generatedMonster.type} {generatedMonster.size} {generatedMonster.nature})</div>
                <div>TD: Melee {formatThreatDice(generatedMonster.meleeAttack)}, Natural {formatThreatDice(generatedMonster.naturalAttack)}, Ranged {formatThreatDice(generatedMonster.rangedAttack)}, Arcane {formatThreatDice(generatedMonster.arcaneAttack)}</div>
                <div>HP: {generatedMonster.hitPoints} ({generatedMonster.activeDefense}A/{generatedMonster.passiveDefense}P)</div>
                {generatedMonster.damageReduction && <div>DR: {generatedMonster.damageReduction}</div>}
                <div>ST: {generatedMonster.savingThrow} | BP: {generatedMonster.battlePhase}</div>
                {generatedMonster.notes && <div>Notes: {generatedMonster.notes}</div>}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default MonsterGenerator