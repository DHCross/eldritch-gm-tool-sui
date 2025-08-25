import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Search } from "@phosphor-icons/react"

// Sample spell data - this would typically come from a data file
const spellPaths = {
  'All Paths': {
    Common: ['Dispel Effect', 'Identify Magic', 'Eldritch Bolt', 'Eldritch Defense']
  },
  Elementalism: {
    Common: ['Air Bubble', 'Ball of Light', 'Boil Water', 'Breeze', 'Charge of the Elements', 'Cleanse Air', 'Crystal Vision', 'Drown', 'Energy Jump', 'Energy Pulse', 'Extinguish Flames', 'Fire Strike', 'Fire Trail', 'Flame Creature', 'Flame Fists', 'Flame Weapon', 'Forge From Stone', 'Freeze', 'Fresh Air', 'Fuel Flames', 'Halo of Energy', 'Heat', 'Illuminating Insight', 'Luminous Wave', 'Mineral Analysis', 'Kinetic Augmentation', 'Rain', 'Resist Elements', 'Rocky Terrain', 'Safe Descent', 'Sense Air Currents', 'Steal Breath', 'Tremor Sense', 'Water Breathing', 'Water Streaming', 'Water Vortex', 'Water Ward', 'Water Whip', 'Zephyr Mind'],
    Uncommon: ['Arcane Maelstrom', 'Crystal Enhancement', 'Crystalize Earth', 'Disorienting Gale', 'Energy Drain', 'Energy Leech', 'Energy Surge', 'Energy Transference', 'Fire Whip', 'Fissure', 'Healing Waters', 'Heatwave', 'Ice Blade', 'Ignite', 'Rend Walls', 'Stone Shape', 'Stone Shatter', 'Water Elemental', 'Water Illusion', 'Water Prison', 'Water Walk', 'Windwalk'],
    Esoteric: ['Air Pocket', 'Aquatic Summons', 'Crystal Analysis', 'Crystal Growth', 'Crystalize Object', 'Diamond Strike', 'Earth Kin', 'Energy Conversion', 'Energy Beacon', 'Energy Infusion', 'Energy Leech', 'Fire Armor', 'Fire Elemental', 'Flame Grasp', 'Ice Shield', 'Minor Earthquake', 'Propel', 'Purify Water', 'Quartz Shield', 'Sky Shelter', 'Skywalk', 'Stone Armor', 'Stone Skin', 'Water Breathing', 'Whirlpool', 'Whirlwind Prison'],
    Occult: ['Aeromancy', 'Choking Vacuum', 'Energy Surge', 'Ethereal Pulse', 'Flame Trap', 'Liquid Armor', 'Stone Golem', 'Stone Weapon', 'Whelm', 'Whirlwind', 'Wind Rush'],
    Legendary: ['Crystal Fortress', 'Earth Merge', 'Elemental Form', 'Energy Blade', 'Glacial Prison', 'Quicksand', 'Tidal Surge', 'Wind Riding']
  },
  Sorcery: {
    Common: ['Arcane Lock', 'Arcane Mark', 'Minor Illusion', 'Olfactory Illusion', 'Shadow Step', 'Teleport Object', 'Transmute Rock'],
    Uncommon: ['Audio Illusion', 'Chameleon', 'Dustify', 'Enfeeblement', 'Flux Portal', 'Illusory Disguise', 'Phantom Blade', 'Summon Monster'],
    Esoteric: ['Apport Object', 'Cone of Silence', 'Full Body Illusion', 'Illusory Quiescence', 'Minion Horde', 'Object Space', 'Phantasms', 'Transdimensional Shift'],
    Occult: ['Dimensional Travel', 'Havoc', 'Mirrored Opponent', 'Teleport Self', 'Waking Terror', 'Whisper of Woe'],
    Legendary: ['Apport Creature', 'Assume Inanimate Form', 'Dreamscape', 'Mass Invisibility']
  },
  Thaumaturgy: {
    Common: ['Banish', 'Claw Growth', 'Conjure Weapon', 'Echo', 'Fortify Object', 'Lighten', 'Magic Ride', 'Mend', 'Savorless', 'Sharpen Blade', 'Weaken Creature', 'Weaken Object'],
    Uncommon: ['Contingent Notification', 'Create Illusion', 'Dimensional Pocket', 'Forced Egress', 'Invisibility', 'Mana Burst', 'Phantom Steed', 'Quickened Reflexes', 'Strengthen Creature', 'Weapon Readiness'],
    Esoteric: ['Dance of Blades', 'Elemental Transmutation', 'Illusionary Clone', 'Levitation', 'Manipulate Object', 'Spatial Warp', 'Transmute Flesh'],
    Occult: ['Deafness', 'Discordance', 'Loop Time', 'Matter Fusion', 'Monster Form', 'Temporal Rift'],
    Legendary: ['Alter Age', 'Blindness', 'Demolish', 'Initiative Warp', 'Petrify', 'Stand Still', 'Time Halt']
  },
  Mysticism: {
    Common: ['Confusion', 'Detect Magic', 'Ethereal Sight', 'Levitation', 'Mindfulness', 'Phase Shift', 'Silence', 'Soothing Balm', 'Soothing Mists'],
    Uncommon: ['Discern Soul', 'Mind Shield', 'Object Read', 'Mind Blade', 'See Aura', 'See Invisible', 'Sense Power', 'Sixth Sense'],
    Esoteric: ['Cosmic Shift', 'Fathom', 'Mind Read', 'Mystic Lore', 'Premonition', 'Psychic Beacon', 'Reassemble', 'Shadow Walk'],
    Occult: ['Continuous Shadow', 'Dreamwalk', 'Ethereal Projection', 'Foreknowledge', 'Manipulate Shadow', 'Release Mind'],
    Legendary: ['Control Humanoid', 'Form of Night', 'Hypnotic Suggestion', 'Induce Sleep', 'Mind Control', 'Super Intuition']
  },
  Hieraticism: {
    Common: ['Aura of Restoration', 'Blessing of Renewal', 'Entreaty of Mercy', 'Heal', 'Repel Undead', 'Soothe Self', 'Word of Cleansing'],
    Uncommon: ['Consecrate Ground', 'Healing Aura', 'Banish Undead', 'Blessing of Health', 'Dispel Magic', 'Nullify Poison', 'Recovery of the Unready', 'Soothe Ally', 'Soul Transfer'],
    Esoteric: ['Doomsday Premonition', 'Mystical Regeneration', 'Rejuvenate', 'Remove Curse', 'Unbind Spirit'],
    Occult: ['Desolate Curse', 'Entreat Entity', 'Omniscient Eye', 'Soul Transmutation'],
    Legendary: ['Create Undead', 'Commune with the Dead', 'Regeneration', 'Summon Spirit']
  },
  Druidry: {
    Common: ['Blossom/Wither Plants', 'Branch to Staff', 'Commune with Plants', 'Ears of the Bat', 'Entangling Roots', 'Eyes of the Eagle', 'Nose of the Wolf', 'Plant Growth', 'Rose Whip', 'Summon Animal'],
    Uncommon: ['Animate Flora', 'Bramble Wall', 'Control Animal', 'Gust', 'Healing Grove', 'Seizing Plants', 'Shape Wood', 'Shapeshift', 'Wild Growth'],
    Esoteric: ['Plant Automaton', 'Plant Meld', 'Regrowth', 'Speak with Nature', 'Tangle Trap', 'Thorny Shield'],
    Occult: ['Animal Transformation', 'Might of the Oak', 'Nature\'s Blessing', 'Plant Armor', 'Plant Behemoth'],
    Legendary: ['Magical Transformation', 'Plant Mastery']
  }
};

const rarityColors = {
  Common: 'bg-gray-100 text-gray-800 border-gray-200',
  Uncommon: 'bg-green-100 text-green-800 border-green-200',
  Esoteric: 'bg-blue-100 text-blue-800 border-blue-200',
  Occult: 'bg-purple-100 text-purple-800 border-purple-200',
  Legendary: 'bg-yellow-100 text-yellow-800 border-yellow-200'
};

function SpellReference() {
  const [selectedPath, setSelectedPath] = useState('All Paths');
  const [selectedRarity, setSelectedRarity] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Get all available paths
  const paths = Object.keys(spellPaths);

  // Get all available rarities
  const rarities = ['All', 'Common', 'Uncommon', 'Esoteric', 'Occult', 'Legendary'];

  // Filter spells based on current filters
  const getFilteredSpells = () => {
    const results: Array<{ name: string, path: string, rarity: string }> = [];

    if (selectedPath === 'All Paths') {
      // Search all paths
      Object.entries(spellPaths).forEach(([pathName, pathSpells]) => {
        Object.entries(pathSpells).forEach(([rarity, spells]) => {
          spells.forEach(spell => {
            if (selectedRarity === 'All' || selectedRarity === rarity) {
              if (!searchTerm || spell.toLowerCase().includes(searchTerm.toLowerCase())) {
                results.push({ name: spell, path: pathName, rarity });
              }
            }
          });
        });
      });
    } else {
      // Search specific path
      const pathSpells = (spellPaths as any)[selectedPath];
      if (pathSpells) {
        Object.entries(pathSpells).forEach(([rarity, spells]: [string, string[]]) => {
          spells.forEach(spell => {
            if (selectedRarity === 'All' || selectedRarity === rarity) {
              if (!searchTerm || spell.toLowerCase().includes(searchTerm.toLowerCase())) {
                results.push({ name: spell, path: selectedPath, rarity });
              }
            }
          });
        });
      }
    }

    // Sort by rarity, then by name
    const rarityOrder = { Common: 0, Uncommon: 1, Esoteric: 2, Occult: 3, Legendary: 4 };
    return results.sort((a, b) => {
      const rarityDiff = (rarityOrder as any)[a.rarity] - (rarityOrder as any)[b.rarity];
      if (rarityDiff !== 0) return rarityDiff;
      return a.name.localeCompare(b.name);
    });
  };

  const filteredSpells = getFilteredSpells();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Sparkles className="text-accent" />
            Spell Reference
          </CardTitle>
          <CardDescription>
            Browse spells by magic path and rarity for Eldritch RPG
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="path">Magic Path</Label>
              <Select value={selectedPath} onValueChange={setSelectedPath}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Paths">All Paths</SelectItem>
                  {paths.filter(path => path !== 'All Paths').map((path) => (
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
                  {rarities.map((rarity) => (
                    <SelectItem key={rarity} value={rarity}>
                      {rarity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="search">Search Spells</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>

          {/* Results summary */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredSpells.length} spell{filteredSpells.length !== 1 ? 's' : ''}
              {selectedPath !== 'All Paths' && ` from ${selectedPath}`}
              {selectedRarity !== 'All' && ` (${selectedRarity} rarity)`}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Spell List */}
      {filteredSpells.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSpells.map((spell, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">{spell.name}</h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className={(rarityColors as any)[spell.rarity]}>
                      {spell.rarity}
                    </Badge>
                    {spell.path !== 'All Paths' && (
                      <Badge variant="outline" className="text-xs">
                        {spell.path}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No spells found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or clearing the search field.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Spell Information */}
      <Card className="bg-muted/20">
        <CardHeader>
          <CardTitle className="text-lg">Understanding Spell Rarities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div>
              <Badge className={rarityColors.Common}>Common</Badge>
              <p className="mt-1">Basic spells available to all casters. Challenge: d0-d4</p>
            </div>
            <div>
              <Badge className={rarityColors.Uncommon}>Uncommon</Badge>
              <p className="mt-1">Intermediate spells with moderate complexity. Challenge: d6</p>
            </div>
            <div>
              <Badge className={rarityColors.Esoteric}>Esoteric</Badge>
              <p className="mt-1">Advanced spells requiring skill and knowledge. Challenge: d8</p>
            </div>
            <div>
              <Badge className={rarityColors.Occult}>Occult</Badge>
              <p className="mt-1">Powerful spells with significant effects. Challenge: d10</p>
            </div>
            <div>
              <Badge className={rarityColors.Legendary}>Legendary</Badge>
              <p className="mt-1">The most powerful and dangerous spells. Challenge: d12</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default SpellReference