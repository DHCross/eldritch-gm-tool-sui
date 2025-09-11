import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useKV } from '@github/spark/hooks'
import { Users, Eye, Trash2, Sparkles, Edit, Plus, Download } from "@phosphor-icons/react"
import { toast } from "sonner"
import { Separator } from "@/components/ui/separator"

interface Spell {
  id: string
  name: string
  path: string
  rarity: string
  category: string
  potency: string
  challenge: string
  maintenance: string
  failure: string
  description: string
}

interface Character {
  id: string
  name: string
  race: string
  class: string
  level: number
  displayLevel: number
  abilities: Record<string, string>
  specialties: Record<string, Record<string, string>>
  focuses: Record<string, Record<string, string>>
  pools: { active: number, passive: number, spirit: number }
  masteryDie: string
  actions: Record<string, string>
  advantages: string[]
  flaws: string[]
  classFeats: string[]
  equipment: string[]
  spellbook?: Spell[]
  magicPath?: string
  createdAt: string
  updatedAt: string
}

const rarityColors = {
  Common: "bg-gray-100 text-gray-800 border-gray-300",
  Uncommon: "bg-blue-100 text-blue-800 border-blue-300", 
  Esoteric: "bg-purple-100 text-purple-800 border-purple-300",
  Occult: "bg-red-100 text-red-800 border-red-300",
  Legendary: "bg-amber-100 text-amber-800 border-amber-300"
}

interface CharacterRosterProps {
  selectedCharacter: Character | null
  onCharacterSelect: (character: Character | null) => void
  onEditCharacter?: (character: Character) => void
  onUseSpellsForCharacter?: (characterId: string, spells: Spell[]) => void
}

export default function CharacterRoster({ 
  selectedCharacter, 
  onCharacterSelect, 
  onEditCharacter, 
  onUseSpellsForCharacter 
}: CharacterRosterProps) {
  const [savedCharacters, setSavedCharacters] = useKV('saved-characters', {} as Record<string, Character>)
  const [showDetails, setShowDetails] = useState(false)

  const characters = Object.values(savedCharacters)

  const deleteCharacter = (characterId: string) => {
    setSavedCharacters(current => {
      const updated = { ...current }
      delete updated[characterId]
      return updated
    })
    if (selectedCharacter?.id === characterId) {
      onCharacterSelect(null)
      setShowDetails(false)
    }
    toast.success('Character deleted')
  }

  const exportCharacterToMarkdown = (character: Character) => {
    let md = `# ${character.name}\n`
    md += `*${character.race} ${character.class} (Level ${character.displayLevel})*\n\n`
    
    md += `## Core Stats\n`
    md += `- **SP:** ${character.pools.spirit} | **Active DP:** ${character.pools.active} | **Passive DP:** ${character.pools.passive}\n`
    md += `- **Mastery Die:** ${character.masteryDie}\n\n`
    
    md += `## Abilities\n`
    Object.entries(character.abilities).forEach(([ability, die]) => {
      md += `**${ability} ${die}**\n`
    })
    md += '\n'
    
    md += `## Actions\n`
    Object.entries(character.actions).forEach(([action, formula]) => {
      md += `- **${action}:** ${formula}\n`
    })
    md += '\n'
    
    if (character.spellbook && character.spellbook.length > 0) {
      md += `## Spellbook (${character.spellbook.length} spells)\n\n`
      
      // Group by path
      const spellsByPath = character.spellbook.reduce((acc, spell) => {
        if (!acc[spell.path]) acc[spell.path] = []
        acc[spell.path].push(spell)
        return acc
      }, {} as Record<string, Spell[]>)
      
      Object.entries(spellsByPath).forEach(([path, spells]) => {
        md += `### ${path} (${spells.length} spells)\n\n`
        spells.forEach(spell => {
          md += `**${spell.name}** _(${spell.rarity}, ${spell.category})_\n`
          md += `- **Potency:** ${spell.potency} | **Challenge:** ${spell.challenge}\n`
          md += `- **Maintenance:** ${spell.maintenance} | **Failure:** ${spell.failure}\n`
          md += `- ${spell.description}\n\n`
        })
      })
    }
    
    md += `## Advantages\n`
    character.advantages.forEach(adv => md += `- ${adv}\n`)
    md += '\n'
    
    if (character.flaws.length > 0) {
      md += `## Flaws\n`
      character.flaws.forEach(flaw => md += `- ${flaw}\n`)
      md += '\n'
    }
    
    md += `## Class Feats\n`
    character.classFeats.forEach(feat => md += `- ${feat}\n`)
    md += '\n'
    
    md += `## Equipment\n`
    character.equipment.forEach(item => md += `- ${item}\n`)
    
    // Copy to clipboard
    navigator.clipboard.writeText(md).then(() => {
      toast.success(`${character.name} exported to clipboard as Markdown`)
    }).catch(() => {
      toast.error('Failed to copy to clipboard')
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            Character Roster
            {selectedCharacter && (
              <Badge variant="secondary" className="ml-auto">
                Active: {selectedCharacter.name || `${selectedCharacter.race} ${selectedCharacter.class}`}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Manage your saved characters and their spell lists. {characters.length} characters saved.
            {selectedCharacter && (
              <span className="block mt-1 text-primary font-medium">
                Selected character will be used in the Spells tab.
              </span>
            )}
          </CardDescription>
        </CardHeader>
      </Card>

      {characters.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="mx-auto mb-4 opacity-50" size={64} />
            <h3 className="text-lg font-semibold mb-2">No Characters Yet</h3>
            <p className="text-muted-foreground mb-4">
              Generate characters using the Character Generator to build your roster.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Character List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Saved Characters</h3>
            {characters.map(character => (
              <Card 
                key={character.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedCharacter?.id === character.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => {
                  onCharacterSelect(character)
                  setShowDetails(true)
                }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-lg">
                        {character.name || `${character.race} ${character.class}`}
                      </CardTitle>
                      <CardDescription>
                        Level {character.displayLevel} {character.race} {character.class}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Badge variant="outline" className="text-xs">
                        {character.masteryDie} MD
                      </Badge>
                      {character.spellbook && character.spellbook.length > 0 && (
                        <Badge className="bg-purple-100 text-purple-800 text-xs">
                          <Sparkles className="w-3 h-3 mr-1" />
                          {character.spellbook.length} spells
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex gap-4">
                      <span>SP: {character.pools.spirit}</span>
                      <span>AD: {character.pools.active}</span>
                      <span>PD: {character.pools.passive}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          exportCharacterToMarkdown(character)
                        }}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      {onEditCharacter && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            onEditCharacter(character)
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteCharacter(character.id)
                        }}
                        className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Character Details */}
          {showDetails && selectedCharacter && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Character Details</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDetails(false)}
                >
                  Close
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>
                    {selectedCharacter.name || `${selectedCharacter.race} ${selectedCharacter.class}`}
                  </CardTitle>
                  <CardDescription>
                    Level {selectedCharacter.displayLevel} {selectedCharacter.race} {selectedCharacter.class}
                    {selectedCharacter.magicPath && ` • ${selectedCharacter.magicPath}`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Core Stats */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-muted rounded p-2">
                      <div className="text-xs text-muted-foreground">Spirit Points</div>
                      <div className="font-bold">{selectedCharacter.pools.spirit}</div>
                    </div>
                    <div className="bg-muted rounded p-2">
                      <div className="text-xs text-muted-foreground">Active DP</div>
                      <div className="font-bold">{selectedCharacter.pools.active}</div>
                    </div>
                    <div className="bg-muted rounded p-2">
                      <div className="text-xs text-muted-foreground">Passive DP</div>
                      <div className="font-bold">{selectedCharacter.pools.passive}</div>
                    </div>
                  </div>

                  {/* Abilities Summary */}
                  <div>
                    <h4 className="font-medium mb-2">Abilities</h4>
                    <div className="text-sm space-y-1">
                      {Object.entries(selectedCharacter.abilities).map(([ability, die]) => (
                        <div key={ability} className="flex justify-between">
                          <span>{ability}</span>
                          <span className="font-mono">{die}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Spellbook */}
                  {selectedCharacter.spellbook && selectedCharacter.spellbook.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Spellbook ({selectedCharacter.spellbook.length} spells)</h4>
                        {onUseSpellsForCharacter && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onUseSpellsForCharacter(selectedCharacter.id, selectedCharacter.spellbook!)}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Load Spells
                          </Button>
                        )}
                      </div>
                      
                      {/* Group spells by path */}
                      {(() => {
                        const spellsByPath = selectedCharacter.spellbook!.reduce((acc, spell) => {
                          if (!acc[spell.path]) acc[spell.path] = []
                          acc[spell.path].push(spell)
                          return acc
                        }, {} as Record<string, Spell[]>)

                        return Object.entries(spellsByPath).map(([path, spells]) => (
                          <div key={path} className="mb-3">
                            <h5 className="text-sm font-medium text-muted-foreground mb-1">
                              {path} ({spells.length} spells)
                            </h5>
                            <div className="space-y-1">
                              {spells.map(spell => (
                                <div key={spell.id} className="flex items-center justify-between text-sm bg-muted/50 rounded p-2">
                                  <span>{spell.name}</span>
                                  <div className="flex gap-1">
                                    <Badge className={`${rarityColors[spell.rarity]} text-xs`}>
                                      {spell.rarity}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      {spell.category}
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))
                      })()}
                    </div>
                  )}

                  {/* Class Feats */}
                  <div>
                    <h4 className="font-medium mb-2">Class Feats</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedCharacter.classFeats.map(feat => (
                        <Badge key={feat} variant="outline" className="text-xs">
                          {feat}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportCharacterToMarkdown(selectedCharacter)}
                      className="flex-1"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export MD
                    </Button>
                    {onEditCharacter && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditCharacter(selectedCharacter)}
                        className="flex-1"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  )
}