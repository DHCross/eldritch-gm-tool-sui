import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Search } from "@phosphor-icons/react"

interface Spell {
  name: string
  path: string
  rarity: string
  effect: string
  description: string
}

const SPELL_DATABASE: Spell[] = [
  // Universal Spells
  { name: 'Dispel Effect', path: 'Universal', rarity: 'Common', effect: 'Activate', description: 'Used to remove magical barriers or effects.' },
  { name: 'Identify Magic', path: 'Universal', rarity: 'Common', effect: 'Activate', description: 'Used to detect and identify magic emanations.' },
  { name: 'Eldritch Bolt', path: 'Universal', rarity: 'Common', effect: 'Harm', description: 'A basic magic attack.' },
  { name: 'Eldritch Defense', path: 'Universal', rarity: 'Common', effect: 'Protect', description: 'Creates a protective barrier.' },

  // Elementalism
  { name: 'Air Bubble', path: 'Elementalism', rarity: 'Common', effect: 'Protect', description: 'Creates a bubble of breathable air.' },
  { name: 'Ball of Light', path: 'Elementalism', rarity: 'Common', effect: 'Activate', description: 'Illuminates an area.' },
  { name: 'Boil Water', path: 'Elementalism', rarity: 'Common', effect: 'Modify', description: 'Rapidly heats water to boiling.' },
  { name: 'Breeze', path: 'Elementalism', rarity: 'Common', effect: 'Activate', description: 'Creates a gentle wind.' },
  { name: 'Fire Strike', path: 'Elementalism', rarity: 'Common', effect: 'Harm', description: 'Manipulates existing fire to attack.' },
  { name: 'Water Breathing', path: 'Elementalism', rarity: 'Common', effect: 'Protect', description: 'Grants the ability to breathe underwater.' },
  { name: 'Arcane Maelstrom', path: 'Elementalism', rarity: 'Uncommon', effect: 'Harm', description: 'Creates a swirling vortex of arcane energy.' },
  { name: 'Fire Whip', path: 'Elementalism', rarity: 'Uncommon', effect: 'Harm', description: 'Shapes flames into a long, flexible whip attack.' },
  { name: 'Stone Shape', path: 'Elementalism', rarity: 'Uncommon', effect: 'Modify', description: 'Manipulates stone into desired forms.' },

  // Sorcery
  { name: 'Arcane Lock', path: 'Sorcery', rarity: 'Common', effect: 'Protect', description: 'Imbues an object to make it harder to open.' },
  { name: 'Minor Illusion', path: 'Sorcery', rarity: 'Common', effect: 'Activate', description: 'Creates a simple visual illusion.' },
  { name: 'Shadow Step', path: 'Sorcery', rarity: 'Common', effect: 'Activate', description: 'Moves rapidly between shadows over short distances.' },
  { name: 'Transmute Rock', path: 'Sorcery', rarity: 'Common', effect: 'Modify', description: 'Changes the composition of stone.' },
  { name: 'Enfeeblement', path: 'Sorcery', rarity: 'Uncommon', effect: 'Afflict', description: 'Weakens a target\'s physical abilities.' },
  { name: 'Illusory Disguise', path: 'Sorcery', rarity: 'Uncommon', effect: 'Modify', description: 'Changes the appearance of a recipient.' },
  { name: 'Summon Monster', path: 'Sorcery', rarity: 'Uncommon', effect: 'Activate', description: 'Summons a humanoid monster to beset foes.' },

  // Thaumaturgy
  { name: 'Banish', path: 'Thaumaturgy', rarity: 'Common', effect: 'Afflict', description: 'Sends a creature away.' },
  { name: 'Claw Growth', path: 'Thaumaturgy', rarity: 'Common', effect: 'Modify', description: 'Imbues unarmed strikes with arcane potency.' },
  { name: 'Conjure Weapon', path: 'Thaumaturgy', rarity: 'Common', effect: 'Activate', description: 'Creates a temporary magical weapon.' },
  { name: 'Mend', path: 'Thaumaturgy', rarity: 'Common', effect: 'Restore', description: 'Repairs damaged objects.' },
  { name: 'Sharpen Blade', path: 'Thaumaturgy', rarity: 'Common', effect: 'Modify', description: 'Enhances a weapon\'s cutting edge.' },
  { name: 'Invisibility', path: 'Thaumaturgy', rarity: 'Uncommon', effect: 'Protect', description: 'Cloaks a target creature in a veil of invisibility.' },
  { name: 'Mana Burst', path: 'Thaumaturgy', rarity: 'Uncommon', effect: 'Harm', description: 'Releases a burst of magical energy.' },
  { name: 'Create Illusion', path: 'Thaumaturgy', rarity: 'Uncommon', effect: 'Modify', description: 'Creates a more complex visual illusion.' },

  // Mysticism
  { name: 'Confusion', path: 'Mysticism', rarity: 'Common', effect: 'Afflict', description: 'Confuses a target, making them uncertain of actions.' },
  { name: 'Detect Magic', path: 'Mysticism', rarity: 'Common', effect: 'Activate', description: 'Detects magical auras.' },
  { name: 'Ethereal Sight', path: 'Mysticism', rarity: 'Common', effect: 'Activate', description: 'See into the ethereal plane.' },
  { name: 'Levitation', path: 'Mysticism', rarity: 'Common', effect: 'Activate', description: 'Causes an object or creature to float.' },
  { name: 'Soothing Balm', path: 'Mysticism', rarity: 'Common', effect: 'Restore', description: 'Restores health and grants temporary fear immunity.' },
  { name: 'Mind Shield', path: 'Mysticism', rarity: 'Uncommon', effect: 'Protect', description: 'Blocks attempts to read the mystic\'s mind.' },
  { name: 'Mind Blade', path: 'Mysticism', rarity: 'Uncommon', effect: 'Harm', description: 'Channels mental energy into a shimmering blade.' },
  { name: 'See Aura', path: 'Mysticism', rarity: 'Uncommon', effect: 'Activate', description: 'Reveals a creature or object\'s psychic aura.' },

  // Hieraticism
  { name: 'Aura of Restoration', path: 'Hieraticism', rarity: 'Common', effect: 'Restore', description: 'Creates an aura that restores passive defense points.' },
  { name: 'Blessing of Renewal', path: 'Hieraticism', rarity: 'Common', effect: 'Restore', description: 'Renews strength and vitality.' },
  { name: 'Heal', path: 'Hieraticism', rarity: 'Common', effect: 'Restore', description: 'Restores passive defense points.' },
  { name: 'Repel Undead', path: 'Hieraticism', rarity: 'Common', effect: 'Protect', description: 'Creates an effect to deter undead.' },
  { name: 'Word of Cleansing', path: 'Hieraticism', rarity: 'Common', effect: 'Restore', description: 'Purifies corruption and disease.' },
  { name: 'Blessing of Health', path: 'Hieraticism', rarity: 'Uncommon', effect: 'Restore', description: 'Restores health and can cure diseases or poisons.' },
  { name: 'Dispel Magic', path: 'Hieraticism', rarity: 'Uncommon', effect: 'Modify', description: 'Dispels active magical effects.' },
  { name: 'Consecrate Ground', path: 'Hieraticism', rarity: 'Uncommon', effect: 'Protect', description: 'Imbues an area with holy energy, harming undead.' },

  // Druidry
  { name: 'Blossom/Wither Plants', path: 'Druidry', rarity: 'Common', effect: 'Modify', description: 'Causes plants to bloom or wither.' },
  { name: 'Branch to Staff', path: 'Druidry', rarity: 'Common', effect: 'Modify', description: 'Transforms a branch into a sturdy staff.' },
  { name: 'Commune with Plants', path: 'Druidry', rarity: 'Common', effect: 'Activate', description: 'Communicate with plant life.' },
  { name: 'Entangling Roots', path: 'Druidry', rarity: 'Common', effect: 'Afflict', description: 'Ensnare and immobilize creatures.' },
  { name: 'Plant Growth', path: 'Druidry', rarity: 'Common', effect: 'Activate', description: 'Increases the size of a target plant.' },
  { name: 'Summon Animal', path: 'Druidry', rarity: 'Common', effect: 'Activate', description: 'Summons a normal animal under the druid\'s control.' },
  { name: 'Animate Flora', path: 'Druidry', rarity: 'Uncommon', effect: 'Activate', description: 'Plants move in accord with the caster\'s will.' },
  { name: 'Bramble Wall', path: 'Druidry', rarity: 'Uncommon', effect: 'Activate', description: 'Creates a wall of thorny plants.' },
  { name: 'Control Animal', path: 'Druidry', rarity: 'Uncommon', effect: 'Afflict', description: 'Exerts control over an animal.' }
]

const SPELL_PATHS = ['All', 'Universal', 'Elementalism', 'Sorcery', 'Thaumaturgy', 'Mysticism', 'Hieraticism', 'Druidry']
const SPELL_RARITIES = ['All', 'Common', 'Uncommon', 'Esoteric', 'Occult', 'Legendary']
const SPELL_EFFECTS = ['All', 'Activate', 'Harm', 'Protect', 'Restore', 'Modify', 'Afflict']

const SpellReference: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPath, setSelectedPath] = useState('All')
  const [selectedRarity, setSelectedRarity] = useState('All')
  const [selectedEffect, setSelectedEffect] = useState('All')

  const filteredSpells = SPELL_DATABASE.filter(spell => {
    const matchesSearch = spell.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         spell.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPath = selectedPath === 'All' || spell.path === selectedPath
    const matchesRarity = selectedRarity === 'All' || spell.rarity === selectedRarity
    const matchesEffect = selectedEffect === 'All' || spell.effect === selectedEffect

    return matchesSearch && matchesPath && matchesRarity && matchesEffect
  })

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Common':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'Uncommon':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Esoteric':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'Occult':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'Legendary':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getEffectColor = (effect: string) => {
    switch (effect) {
      case 'Harm':
        return 'bg-red-50 text-red-700 border-red-200'
      case 'Protect':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'Restore':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'Modify':
        return 'bg-purple-50 text-purple-700 border-purple-200'
      case 'Activate':
        return 'bg-orange-50 text-orange-700 border-orange-200'
      case 'Afflict':
        return 'bg-gray-50 text-gray-700 border-gray-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Spell Reference</CardTitle>
          <CardDescription>
            Search and browse spells from the Eldritch RPG magic system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search spells by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="path">Magic Path</Label>
                <Select value={selectedPath} onValueChange={setSelectedPath}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SPELL_PATHS.map((path) => (
                      <SelectItem key={path} value={path}>
                        {path}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="rarity">Rarity</Label>
                <Select value={selectedRarity} onValueChange={setSelectedRarity}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SPELL_RARITIES.map((rarity) => (
                      <SelectItem key={rarity} value={rarity}>
                        {rarity}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="effect">Effect Type</Label>
                <Select value={selectedEffect} onValueChange={setSelectedEffect}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SPELL_EFFECTS.map((effect) => (
                      <SelectItem key={effect} value={effect}>
                        {effect}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Results */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Spells Found: {filteredSpells.length}
              </h3>
              {(searchTerm || selectedPath !== 'All' || selectedRarity !== 'All' || selectedEffect !== 'All') && (
                <div className="flex gap-2">
                  {searchTerm && (
                    <Badge variant="outline">Search: {searchTerm}</Badge>
                  )}
                  {selectedPath !== 'All' && (
                    <Badge variant="outline">Path: {selectedPath}</Badge>
                  )}
                  {selectedRarity !== 'All' && (
                    <Badge variant="outline">Rarity: {selectedRarity}</Badge>
                  )}
                  {selectedEffect !== 'All' && (
                    <Badge variant="outline">Effect: {selectedEffect}</Badge>
                  )}
                </div>
              )}
            </div>

            <div className="grid gap-4">
              {filteredSpells.map((spell, index) => (
                <Card key={index} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-primary">
                          {spell.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {spell.path} Magic
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge 
                          variant="outline"
                          className={getRarityColor(spell.rarity)}
                        >
                          {spell.rarity}
                        </Badge>
                        <Badge 
                          variant="outline"
                          className={getEffectColor(spell.effect)}
                        >
                          {spell.effect}
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-sm leading-relaxed">
                      {spell.description}
                    </p>
                  </div>
                </Card>
              ))}
            </div>

            {filteredSpells.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No spells found matching your criteria.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Spell System Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Spell System Reference</CardTitle>
          <CardDescription>
            Quick reference for the Eldritch RPG magic system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Rarity Table */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Spell Rarity & Challenge</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Rarity</th>
                    <th className="text-left p-2">Challenge</th>
                    <th className="text-left p-2">Maintenance Penalty</th>
                    <th className="text-left p-2">Failure Consequence</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-2">
                      <Badge className={getRarityColor('Common')}>Common</Badge>
                    </td>
                    <td className="p-2">d4</td>
                    <td className="p-2">-1</td>
                    <td className="p-2">Next round spell fizzles</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2">
                      <Badge className={getRarityColor('Uncommon')}>Uncommon</Badge>
                    </td>
                    <td className="p-2">d6</td>
                    <td className="p-2">-2</td>
                    <td className="p-2">2 rounds, -1 spirit point</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2">
                      <Badge className={getRarityColor('Esoteric')}>Esoteric</Badge>
                    </td>
                    <td className="p-2">d8</td>
                    <td className="p-2">-3</td>
                    <td className="p-2">3 rounds, -3 spirit points</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2">
                      <Badge className={getRarityColor('Occult')}>Occult</Badge>
                    </td>
                    <td className="p-2">d10</td>
                    <td className="p-2">-4</td>
                    <td className="p-2">4 rounds, -4 spirit points</td>
                  </tr>
                  <tr>
                    <td className="p-2">
                      <Badge className={getRarityColor('Legendary')}>Legendary</Badge>
                    </td>
                    <td className="p-2">d12</td>
                    <td className="p-2">-5</td>
                    <td className="p-2">5 rounds, -5 spirit points</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <Separator />

          {/* Effect Types */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Effect Types</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {SPELL_EFFECTS.slice(1).map((effect) => (
                <div key={effect} className="flex items-center gap-2">
                  <Badge className={getEffectColor(effect)}>
                    {effect}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {effect === 'Harm' && 'Deals damage'}
                    {effect === 'Protect' && 'Provides defense'}
                    {effect === 'Restore' && 'Heals or repairs'}
                    {effect === 'Modify' && 'Changes properties'}
                    {effect === 'Activate' && 'Triggers effects'}
                    {effect === 'Afflict' && 'Causes conditions'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SpellReference