import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { useKV } from '@github/spark/hooks'
import { MagnifyingGlass, Sparkles, Lightning, Shield, Heart, Plus, Minus, BookOpen, Star, Sword, Check, X, Download } from "@phosphor-icons/react"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

// Comprehensive spell database
const spellDatabase = {
  // Universal spells available to all Gift of Magic wielders
  Universal: {
    Common: [
      {
        name: "Dispel Effect",
        category: "Activate",
        description: "Used to remove magical barriers or effects. Can break enchantments, dispel illusions, or neutralize active magical phenomena.",
        potency: "d4",
        challenge: "d4",
        maintenance: "None",
        failure: "Next round spell fizzles"
      },
      {
        name: "Identify Magic",
        category: "Activate", 
        description: "Detects and identifies magic emanations. Reveals the nature, power level, and source of magical effects within range.",
        potency: "d4",
        challenge: "d4",
        maintenance: "None",
        failure: "Next round spell fizzles"
      },
      {
        name: "Eldritch Bolt",
        category: "Harm",
        description: "A basic magic attack that projects raw arcane energy at a target. The fundamental offensive spell known to all wielders of magic.",
        potency: "d4",
        challenge: "d4", 
        maintenance: "None",
        failure: "Next round spell fizzles"
      },
      {
        name: "Eldritch Defense",
        category: "Protect",
        description: "Creates a protective barrier of magical energy. Can deflect physical attacks or provide resistance to magical effects.",
        potency: "d4",
        challenge: "d4",
        maintenance: "None", 
        failure: "Next round spell fizzles"
      }
    ]
  },

  // Elementalism - Controls raw matter and natural forces
  Elementalism: {
    Common: [
      {
        name: "Air Bubble",
        category: "Activate",
        description: "Creates a pocket of breathable air around the target, allowing survival underwater or in toxic atmospheres.",
        potency: "d4",
        challenge: "d4",
        maintenance: "None",
        failure: "Next round spell fizzles"
      },
      {
        name: "Ball of Light", 
        category: "Activate",
        description: "Conjures a glowing orb that illuminates the surrounding area. Can be moved at will and provides bright light.",
        potency: "d4",
        challenge: "d4",
        maintenance: "None",
        failure: "Next round spell fizzles"
      },
      {
        name: "Fire Strike",
        category: "Harm",
        description: "Manipulates existing flames to attack a target. Requires a source of fire within range to function.",
        potency: "d4",
        challenge: "d4",
        maintenance: "None",
        failure: "Next round spell fizzles"
      },
      {
        name: "Water Breathing",
        category: "Protect", 
        description: "Grants the ability to extract oxygen from water, allowing underwater breathing for the duration.",
        potency: "d4",
        challenge: "d4",
        maintenance: "None",
        failure: "Next round spell fizzles"
      }
    ],
    Uncommon: [
      {
        name: "Fire Whip",
        category: "Harm",
        description: "Shapes flames into a long, flexible whip of fire that can strike at medium range with burning damage.",
        potency: "d6",
        challenge: "d6", 
        maintenance: "-2",
        failure: "2 rounds, -1 spirit point"
      },
      {
        name: "Stone Shape",
        category: "Modify",
        description: "Allows manipulation and reshaping of stone materials. Can create simple tools, seal passages, or alter terrain.",
        potency: "d6",
        challenge: "d6",
        maintenance: "-2", 
        failure: "2 rounds, -1 spirit point"
      },
      {
        name: "Water Walk",
        category: "Activate",
        description: "Enables walking on the surface of water as if it were solid ground. Affects one target per casting.",
        potency: "d6",
        challenge: "d6",
        maintenance: "-2",
        failure: "2 rounds, -1 spirit point"
      }
    ]
  },

  // Sorcery - Harnesses chaos, illusion, and extra-dimensional realms
  Sorcery: {
    Common: [
      {
        name: "Arcane Lock",
        category: "Protect",
        description: "Imbues an object with magical resistance, making it significantly harder to open, break, or manipulate.",
        potency: "d4",
        challenge: "d4",
        maintenance: "None",
        failure: "Next round spell fizzles"
      },
      {
        name: "Minor Illusion",
        category: "Activate",
        description: "Creates a simple visual illusion no larger than a few feet. Can mimic objects, textures, or simple movements.",
        potency: "d4",
        challenge: "d4",
        maintenance: "None",
        failure: "Next round spell fizzles"
      },
      {
        name: "Shadow Step",
        category: "Activate",
        description: "Allows rapid movement between shadows over short distances. Requires existing shadows at both origin and destination.",
        potency: "d4",
        challenge: "d4",
        maintenance: "None",
        failure: "Next round spell fizzles"
      }
    ],
    Uncommon: [
      {
        name: "Enfeeblement",
        category: "Modify",
        description: "Weakens a target's physical capabilities, reducing their strength, speed, and overall physical performance.",
        potency: "d6",
        challenge: "d6",
        maintenance: "-2",
        failure: "2 rounds, -1 spirit point"
      },
      {
        name: "Illusory Disguise",
        category: "Modify",
        description: "Changes the appearance of the target to look like someone or something else. Affects visual perception only.",
        potency: "d6",
        challenge: "d6",
        maintenance: "-2",
        failure: "2 rounds, -1 spirit point"
      }
    ]
  },

  // Thaumaturgy - Bends reality, manipulates matter and time
  Thaumaturgy: {
    Common: [
      {
        name: "Banish",
        category: "Afflict",
        description: "Forces a creature to retreat or sends an unwilling target away from the caster's presence.",
        potency: "d4",
        challenge: "d4",
        maintenance: "None",
        failure: "Next round spell fizzles"
      },
      {
        name: "Mend",
        category: "Restore",
        description: "Repairs damaged objects by reversing entropy and restoring them to their original condition.",
        potency: "d4",
        challenge: "d4",
        maintenance: "None",
        failure: "Next round spell fizzles"
      }
    ],
    Uncommon: [
      {
        name: "Invisibility",
        category: "Protect",
        description: "Renders the target completely invisible to visual detection. Does not affect other senses or magical sight.",
        potency: "d6",
        challenge: "d6",
        maintenance: "-2",
        failure: "2 rounds, -1 spirit point"
      }
    ]
  },

  // Mysticism - Manipulates mental and spiritual energies
  Mysticism: {
    Common: [
      {
        name: "Confusion",
        category: "Afflict",
        description: "Clouds the target's mind, making them uncertain of their actions and unable to think clearly.",
        potency: "d4",
        challenge: "d4",
        maintenance: "None",
        failure: "Next round spell fizzles"
      },
      {
        name: "Detect Magic",
        category: "Activate",
        description: "Reveals the presence of magical auras and energies within the area, highlighting their general location.",
        potency: "d4",
        challenge: "d4",
        maintenance: "None",
        failure: "Next round spell fizzles"
      }
    ],
    Uncommon: [
      {
        name: "Mind Shield",
        category: "Protect",
        description: "Creates a barrier around the mind that blocks attempts at mental intrusion, telepathy, and mind reading.",
        potency: "d6",
        challenge: "d6",
        maintenance: "-2",
        failure: "2 rounds, -1 spirit point"
      }
    ]
  },

  // Hieraticism - Draws power from devotion to gods
  Hieraticism: {
    Common: [
      {
        name: "Heal",
        category: "Restore",
        description: "Channels divine energy to mend wounds and restore physical health to the target through sacred power.",
        potency: "d4",
        challenge: "d4",
        maintenance: "None",
        failure: "Next round spell fizzles"
      },
      {
        name: "Repel Undead",
        category: "Protect",
        description: "Creates a divine barrier that forces undead creatures to flee or prevents them from approaching.",
        potency: "d4",
        challenge: "d4",
        maintenance: "None",
        failure: "Next round spell fizzles"
      }
    ]
  },

  // Druidry - Channels divine energy from the living world
  Druidry: {
    Common: [
      {
        name: "Entangling Roots",
        category: "Afflict",
        description: "Causes roots and vines to burst from the ground and wrap around targets, immobilizing them in place.",
        potency: "d4",
        challenge: "d4",
        maintenance: "None",
        failure: "Next round spell fizzles"
      },
      {
        name: "Plant Growth",
        category: "Activate",
        description: "Accelerates the growth of plants, causing them to increase in size and vitality rapidly.",
        potency: "d4",
        challenge: "d4",
        maintenance: "None",
        failure: "Next round spell fizzles"
      }
    ],
    Uncommon: [
      {
        name: "Shapeshift",
        category: "Modify",
        description: "Transforms the caster into a natural animal, gaining all the creature's physical abilities and characteristics.",
        potency: "d6",
        challenge: "d6",
        maintenance: "-2",
        failure: "2 rounds, -1 spirit point"
      }
    ]
  }
}

const rarityColors = {
  Common: "bg-gray-100 text-gray-800 border-gray-300",
  Uncommon: "bg-blue-100 text-blue-800 border-blue-300", 
  Esoteric: "bg-purple-100 text-purple-800 border-purple-300",
  Occult: "bg-red-100 text-red-800 border-red-300",
  Legendary: "bg-amber-100 text-amber-800 border-amber-300"
}

const categoryIcons = {
  Activate: <Lightning className="w-4 h-4" />,
  Harm: <Sword className="w-4 h-4" />,
  Protect: <Shield className="w-4 h-4" />,
  Restore: <Heart className="w-4 h-4" />,
  Modify: <Sparkles className="w-4 h-4" />,
  Afflict: <Lightning className="w-4 h-4" />
}

// Character classes and their magic paths
const characterClasses = ['Adept', 'Mage', 'Mystic', 'Theurgist']
const magicPathsByClass = {
  Adept: ['Thaumaturgy', 'Elementalism', 'Sorcery'],
  Mage: ['Thaumaturgy', 'Elementalism', 'Sorcery'], 
  Mystic: ['Mysticism'],
  Theurgist: ['Druidry', 'Hieraticism']
}

// Helper function to calculate spell count based on competence and expertise
const calculateSpellCount = (competence: string, expertise: string, characterClass: string) => {
  const competenceSteps = Math.max(0, ['d4', 'd6', 'd8', 'd10', 'd12'].indexOf(competence))
  const expertiseSteps = Math.max(0, ['d4', 'd6', 'd8', 'd10', 'd12'].indexOf(expertise))
  
  let spellCount = 2 * (competenceSteps + expertiseSteps)
  
  // Adepts get half the spells
  if (characterClass === 'Adept') {
    spellCount = Math.floor(spellCount / 2)
  }
  
  return Math.max(2, spellCount) // Minimum 2 spells
}

// Helper function to get available paths for a character class
const getAvailablePathsForClass = (characterClass: string) => {
  if (characterClass === 'Adept') {
    return ['Universal', 'Thaumaturgy', 'Elementalism', 'Sorcery']
  } else if (characterClass === 'Mage') {
    return ['Universal', 'Thaumaturgy', 'Elementalism', 'Sorcery'] 
  } else if (characterClass === 'Mystic') {
    return ['Universal', 'Mysticism']
  } else if (characterClass === 'Theurgist') {
    return ['Universal', 'Druidry', 'Hieraticism']
  }
  return ['Universal']
}

export default function SpellReference() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPath, setSelectedPath] = useState('all')
  const [selectedRarity, setSelectedRarity] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedSpells, setSelectedSpells] = useKV('selected-spells', [] as any[])
  const [spellListName, setSpellListName] = useState('')
  const [savedSpellLists, setSavedSpellLists] = useKV('saved-spell-lists', {} as Record<string, any[]>)
  const [selectedCharacterClass, setSelectedCharacterClass] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('')

  const allSpells = useMemo(() => {
    const spells: any[] = []
    
    Object.entries(spellDatabase).forEach(([pathName, rarities]) => {
      Object.entries(rarities).forEach(([rarity, spellList]) => {
        spellList.forEach((spell: any) => {
          spells.push({
            ...spell,
            path: pathName,
            rarity,
            id: `${pathName}-${spell.name}-${rarity}`
          })
        })
      })
    })
    
    return spells
  }, [])

  const filteredSpells = useMemo(() => {
    return allSpells.filter(spell => {
      const matchesSearch = spell.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           spell.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesPath = selectedPath === 'all' || spell.path === selectedPath
      const matchesRarity = selectedRarity === 'all' || spell.rarity === selectedRarity
      const matchesCategory = selectedCategory === 'all' || spell.category === selectedCategory
      
      return matchesSearch && matchesPath && matchesRarity && matchesCategory
    })
  }, [allSpells, searchTerm, selectedPath, selectedRarity, selectedCategory])

  const paths = ['all', ...Object.keys(spellDatabase)]
  const rarities = ['all', 'Common', 'Uncommon', 'Esoteric', 'Occult', 'Legendary']
  const categories = ['all', 'Activate', 'Harm', 'Protect', 'Restore', 'Modify', 'Afflict']

  const addSpellToSelection = (spell: any) => {
    setSelectedSpells(current => {
      if (current.find(s => s.id === spell.id)) return current
      return [...current, spell]
    })
  }

  const removeSpellFromSelection = (spellId: string) => {
    setSelectedSpells(current => current.filter(s => s.id !== spellId))
  }

  const clearSelection = () => {
    setSelectedSpells([])
  }

  const saveSpellList = () => {
    if (!spellListName.trim() || selectedSpells.length === 0) return
    
    setSavedSpellLists(current => ({
      ...current,
      [spellListName]: [...selectedSpells]
    }))
    
    setSpellListName('')
    clearSelection()
    toast.success('Spell list saved!')
  }

  const loadSpellList = (listName: string) => {
    const list = savedSpellLists[listName]
    if (list) {
      setSelectedSpells([...list])
      toast.success(`Loaded spell list: ${listName}`)
    }
  }

  const deleteSpellList = (listName: string) => {
    setSavedSpellLists(current => {
      const updated = { ...current }
      delete updated[listName]
      return updated
    })
    toast.success(`Deleted spell list: ${listName}`)
  }

  const getSpellsByPath = (pathName: string) => {
    return selectedSpells.filter(spell => spell.path === pathName)
  }

  const getSpellCountsByRarity = (pathSpells: any[]) => {
    const counts = { Common: 0, Uncommon: 0, Esoteric: 0, Occult: 0, Legendary: 0 }
    pathSpells.forEach(spell => {
      counts[spell.rarity as keyof typeof counts]++
    })
    return counts
  }

  const exportSpellListAsMarkdown = () => {
    if (selectedSpells.length === 0) {
      toast.error('No spells selected to export')
      return
    }

    let markdown = `# Spell List\n\n`
    if (spellListName.trim()) {
      markdown = `# ${spellListName}\n\n`
    }

    markdown += `**Total Spells:** ${selectedSpells.length}\n\n`

    // Group by path
    Object.keys(spellDatabase).forEach(pathName => {
      const pathSpells = getSpellsByPath(pathName)
      if (pathSpells.length === 0) return

      markdown += `## ${pathName} (${pathSpells.length} spells)\n\n`
      
      // Group by rarity within each path
      const rarities = ['Common', 'Uncommon', 'Esoteric', 'Occult', 'Legendary']
      rarities.forEach(rarity => {
        const raritySpells = pathSpells.filter(s => s.rarity === rarity)
        if (raritySpells.length === 0) return

        markdown += `### ${rarity} Spells\n\n`
        raritySpells.forEach(spell => {
          markdown += `**${spell.name}** _(${spell.category})_\n`
          markdown += `- **Potency:** ${spell.potency} | **Challenge:** ${spell.challenge}\n`
          markdown += `- **Maintenance:** ${spell.maintenance} | **Failure:** ${spell.failure}\n`
          markdown += `- ${spell.description}\n\n`
        })
      })
    })

    // Copy to clipboard
    navigator.clipboard.writeText(markdown).then(() => {
      toast.success('Spell list exported to clipboard as Markdown')
    }).catch(() => {
      toast.error('Failed to copy to clipboard')
    })
  }

  const generateCharacterSuggestions = () => {
    if (!selectedCharacterClass) return []

    const availablePaths = getAvailablePathsForClass(selectedCharacterClass)
    const level = parseInt(selectedLevel) || 1
    const suggestions = []

    // Calculate recommended spell counts based on level
    const competence = level <= 2 ? 'd6' : level <= 4 ? 'd8' : 'd10'
    const expertise = level <= 1 ? 'd6' : level <= 3 ? 'd8' : 'd10'
    const recommendedCount = calculateSpellCount(competence, expertise, selectedCharacterClass)

    suggestions.push(`**Recommended Total Spells:** ${recommendedCount}`)
    suggestions.push(`**Available Paths:** ${availablePaths.join(', ')}`)
    
    if (selectedCharacterClass === 'Adept') {
      suggestions.push('**Note:** Adepts receive half the normal spell count but excel at ritual magic and crafting.')
    }

    // Suggest spell distribution
    suggestions.push(`**Suggested Distribution:** 70% Common, 30% Uncommon spells for starting characters`)
    
    if (level >= 3) {
      suggestions.push('**Higher Level Note:** Characters level 3+ may access Esoteric spells with appropriate focus')
    }

    return suggestions
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            Spell Reference & Selection
          </CardTitle>
          <CardDescription>
            Browse and search the complete Eldritch RPG spell library. Contains {allSpells.length} spells across all magical paths. Build spell lists for your characters.
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="browse" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="browse" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Browse Spells
          </TabsTrigger>
          <TabsTrigger value="character" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Character Builder
          </TabsTrigger>
          <TabsTrigger value="selection" className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            Current Selection ({selectedSpells.length})
          </TabsTrigger>
          <TabsTrigger value="saved" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Saved Lists ({Object.keys(savedSpellLists).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="character" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Character Spell Builder</CardTitle>
              <CardDescription>
                Build spell lists for specific character classes and levels. Get recommendations for spell counts and distribution.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Character Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="char-class">Character Class</Label>
                  <Select value={selectedCharacterClass} onValueChange={setSelectedCharacterClass}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Class" />
                    </SelectTrigger>
                    <SelectContent>
                      {characterClasses.map(cls => (
                        <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="char-level">Character Level</Label>
                  <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Level" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map(level => (
                        <SelectItem key={level} value={level.toString()}>{level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="char-path">Filter by Available Paths</Label>
                  <Select value={selectedPath} onValueChange={setSelectedPath}>
                    <SelectTrigger>
                      <SelectValue placeholder="All available paths" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Available Paths</SelectItem>
                      {selectedCharacterClass && getAvailablePathsForClass(selectedCharacterClass).map(path => (
                        <SelectItem key={path} value={path}>{path}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Character Suggestions */}
              {selectedCharacterClass && (
                <Card className="bg-muted/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Suggestions for {selectedCharacterClass} Level {selectedLevel || '1'}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {generateCharacterSuggestions().map((suggestion, index) => (
                        <div key={index} className="text-sm">{suggestion}</div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Filters for Character Building */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedRarity('Common')
                    setSelectedCategory('all')
                  }}
                >
                  Show Common Spells
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedRarity('Uncommon')
                    setSelectedCategory('all')
                  }}
                >
                  Show Uncommon Spells
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedRarity('all')
                    setSelectedCategory('Harm')
                  }}
                >
                  Show Combat Spells
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedRarity('all')
                    setSelectedCategory('Restore')
                  }}
                >
                  Show Healing Spells
                </Button>
              </div>

              {/* Current Selection Summary for Character */}
              {selectedSpells.length > 0 && (
                <Card className="bg-muted/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Current Selection Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Total Spells:</span>
                        <div className="text-lg font-bold">{selectedSpells.length}</div>
                      </div>
                      <div>
                        <span className="font-medium">Common:</span>
                        <div className="text-lg font-bold">{selectedSpells.filter(s => s.rarity === 'Common').length}</div>
                      </div>
                      <div>
                        <span className="font-medium">Uncommon:</span>
                        <div className="text-lg font-bold">{selectedSpells.filter(s => s.rarity === 'Uncommon').length}</div>
                      </div>
                      <div>
                        <span className="font-medium">Other:</span>
                        <div className="text-lg font-bold">{selectedSpells.filter(s => !['Common', 'Uncommon'].includes(s.rarity)).length}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="browse" className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              {/* Search and Filter Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative">
                  <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search spells..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={selectedPath} onValueChange={setSelectedPath}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Paths" />
                  </SelectTrigger>
                  <SelectContent>
                    {paths.map(path => (
                      <SelectItem key={path} value={path}>
                        {path === 'all' ? 'All Paths' : path}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedRarity} onValueChange={setSelectedRarity}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Rarities" />
                  </SelectTrigger>
                  <SelectContent>
                    {rarities.map(rarity => (
                      <SelectItem key={rarity} value={rarity}>
                        {rarity === 'all' ? 'All Rarities' : rarity}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Filters */}
              {(searchTerm || selectedPath !== 'all' || selectedRarity !== 'all' || selectedCategory !== 'all') && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Active filters:</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchTerm('')
                      setSelectedPath('all')
                      setSelectedRarity('all')
                      setSelectedCategory('all')
                    }}
                  >
                    Clear all
                  </Button>
                </div>
              )}

              {/* Results Count */}
              <div className="text-sm text-muted-foreground">
                Showing {filteredSpells.length} of {allSpells.length} spells
              </div>
            </CardContent>
          </Card>

          {/* Spell List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSpells.map((spell, index) => {
              const isSelected = selectedSpells.find(s => s.id === spell.id)
              
              return (
                <Card key={`${spell.path}-${spell.name}-${index}`} className={`hover:shadow-md transition-shadow ${isSelected ? 'ring-2 ring-accent' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg leading-tight">{spell.name}</CardTitle>
                      <div className="flex flex-col gap-1">
                        <Badge className={`${rarityColors[spell.rarity]} border text-xs`}>
                          {spell.rarity}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {spell.path}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {categoryIcons[spell.category]}
                      <span>{spell.category}</span>
                      <span>•</span>
                      <span>Potency: {spell.potency}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm leading-relaxed">{spell.description}</p>
                    
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="font-medium text-muted-foreground">Challenge:</span>
                        <div className="text-foreground">{spell.challenge}</div>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">Maintenance:</span>
                        <div className="text-foreground">{spell.maintenance}</div>
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium text-muted-foreground">Failure:</span>
                        <div className="text-foreground">{spell.failure}</div>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex justify-end">
                      {isSelected ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeSpellFromSelection(spell.id)}
                          className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <Minus className="w-4 h-4 mr-1" />
                          Remove
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addSpellToSelection(spell)}
                          className="text-accent-foreground border-accent hover:bg-accent"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add to Selection
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {filteredSpells.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No spells found matching your criteria.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="selection" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Spell Selection</CardTitle>
              <CardDescription>
                {selectedSpells.length} spells selected. Organize your selection by Mastery Path and save as a spell list.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {selectedSpells.length > 0 && (
                <div className="flex items-center gap-4 flex-wrap">
                  <Input
                    placeholder="Name your spell list..."
                    value={spellListName}
                    onChange={(e) => setSpellListName(e.target.value)}
                    className="flex-1 min-w-64"
                  />
                  <Button
                    onClick={saveSpellList}
                    disabled={!spellListName.trim()}
                    className="whitespace-nowrap"
                  >
                    Save List
                  </Button>
                  <Button
                    variant="outline"
                    onClick={exportSpellListAsMarkdown}
                    className="whitespace-nowrap"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export MD
                  </Button>
                  <Button
                    variant="outline"
                    onClick={clearSelection}
                    className="whitespace-nowrap"
                  >
                    Clear All
                  </Button>
                </div>
              )}

              {selectedSpells.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No spells selected. Browse spells to build your selection.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Group spells by path */}
                  {Object.keys(spellDatabase).map(pathName => {
                    const pathSpells = getSpellsByPath(pathName)
                    if (pathSpells.length === 0) return null

                    const rarityCounts = getSpellCountsByRarity(pathSpells)

                    return (
                      <Card key={pathName}>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg">{pathName}</CardTitle>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(rarityCounts).map(([rarity, count]) => {
                              if (count === 0) return null
                              return (
                                <Badge key={rarity} className={`${rarityColors[rarity]} text-xs`}>
                                  {count} {rarity}
                                </Badge>
                              )
                            })}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid gap-3">
                            {pathSpells.map(spell => (
                              <div key={spell.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium">{spell.name}</span>
                                    <Badge className={`${rarityColors[spell.rarity]} text-xs`}>
                                      {spell.rarity}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      {spell.category}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground line-clamp-2">{spell.description}</p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeSpellFromSelection(spell.id)}
                                  className="text-destructive hover:bg-destructive hover:text-destructive-foreground ml-2"
                                >
                                  <Minus className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="saved" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Saved Spell Lists</CardTitle>
              <CardDescription>
                Your saved spell lists. Load them to view or edit, export to Markdown, or prepare them for character integration.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(savedSpellLists).length === 0 ? (
                <div className="text-center py-8">
                  <Sparkles className="mx-auto mb-4 opacity-50" size={48} />
                  <p className="text-muted-foreground mb-2">No saved spell lists yet.</p>
                  <p className="text-sm text-muted-foreground">Create one from your current selection or use the Character Builder.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {Object.entries(savedSpellLists).map(([listName, spells]) => {
                    const pathCounts = Object.keys(spellDatabase).reduce((acc, path) => {
                      acc[path] = spells.filter(s => s.path === path).length
                      return acc
                    }, {} as Record<string, number>)

                    const rarityCounts = ['Common', 'Uncommon', 'Esoteric', 'Occult', 'Legendary'].reduce((acc, rarity) => {
                      acc[rarity] = spells.filter(s => s.rarity === rarity).length
                      return acc
                    }, {} as Record<string, number>)

                    return (
                      <Card key={listName} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">{listName}</CardTitle>
                              <CardDescription>{spells.length} spells total</CardDescription>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => loadSpellList(listName)}
                              >
                                Load
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  // Export this specific list
                                  const tempSelection = selectedSpells
                                  const tempName = spellListName
                                  setSelectedSpells([...spells])
                                  setSpellListName(listName)
                                  setTimeout(() => {
                                    exportSpellListAsMarkdown()
                                    setSelectedSpells(tempSelection)
                                    setSpellListName(tempName)
                                  }, 100)
                                }}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteSpellList(listName)}
                                className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {/* Path breakdown */}
                          <div>
                            <span className="text-sm font-medium text-muted-foreground">By Path:</span>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {Object.entries(pathCounts).map(([path, count]) => {
                                if (count === 0) return null
                                return (
                                  <Badge key={path} variant="outline" className="text-xs">
                                    {path}: {count}
                                  </Badge>
                                )
                              })}
                            </div>
                          </div>
                          
                          {/* Rarity breakdown */}
                          <div>
                            <span className="text-sm font-medium text-muted-foreground">By Rarity:</span>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {Object.entries(rarityCounts).map(([rarity, count]) => {
                                if (count === 0) return null
                                return (
                                  <Badge key={rarity} className={`${rarityColors[rarity]} text-xs`}>
                                    {count} {rarity}
                                  </Badge>
                                )
                              })}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}