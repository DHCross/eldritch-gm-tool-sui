import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useKV } from '@github/spark/hooks'
import { User, Download, Copy } from "@phosphor-icons/react"
import { toast } from 'sonner'

interface Character {
  race: string
  class: string
  level: number
  abilities: Record<string, string>
  specialties: Record<string, Record<string, string>>
  focuses: Record<string, Record<string, string>>
  defensePools: {
    activeDefense: number
    passiveDefense: number
    spiritPoints: number
  }
  advantages: string[]
  flaws: string[]
  classFeats: string[]
  equipment: string[]
  spellcasting?: {
    masteryPath: string
    pathSpecialization: string | null
    knownSpells: Array<{ name: string; rarity: string }>
  }
  actions: Record<string, string>
  iconicItem: {
    type: string
    description: string
    magicProperty?: string
  }
  masteryDie: string
}

const charGenData = {
  dieRanks: ['d4', 'd6', 'd8', 'd10', 'd12'],
  abilities: ['Competence', 'Prowess', 'Fortitude'],
  specialties: {
    Competence: ['Adroitness', 'Expertise', 'Perception'],
    Prowess: ['Agility', 'Melee', 'Precision'],
    Fortitude: ['Endurance', 'Strength', 'Willpower']
  },
  focuses: {
    Adroitness: ['Skulduggery', 'Cleverness'],
    Expertise: ['Wizardry', 'Theurgy'],
    Perception: ['Alertness', 'Perspicacity'],
    Agility: ['Speed', 'Reaction'],
    Melee: ['Threat', 'Finesse'],
    Precision: ['Ranged Threat', 'Ranged Finesse'],
    Endurance: ['Vitality', 'Resilience'],
    Strength: ['Ferocity', 'Might'],
    Willpower: ['Courage', 'Resistance']
  },
  races: ['Human', 'Elf', 'Dwarf', 'Gnome', 'Half-Elf', 'Half-Orc', 'Halfling', 'Drakkin'],
  classes: ['Adept', 'Assassin', 'Barbarian', 'Mage', 'Mystic', 'Rogue', 'Theurgist', 'Warrior'],
  levels: [1, 2, 3, 4, 5],
  casterClasses: ['Adept', 'Mage', 'Mystic', 'Theurgist'],
  magicPathsByClass: {
    Adept: ['Thaumaturgy', 'Elementalism', 'Sorcery'],
    Mage: ['Thaumaturgy', 'Elementalism', 'Sorcery'],
    Mystic: ['Mysticism'],
    Theurgist: ['Druidry', 'Hieraticism']
  },
  levelInfo: [
    { level: 1, masteryDie: 'd4', usesPerDay: 2, cp_range: '10 to 100' },
    { level: 2, masteryDie: 'd6', usesPerDay: 4, cp_range: '101 to 199' },
    { level: 3, masteryDie: 'd8', usesPerDay: 6, cp_range: '200 to 299' },
    { level: 4, masteryDie: 'd10', usesPerDay: 8, cp_range: '300 to 399' },
    { level: 5, masteryDie: 'd12', usesPerDay: 10, cp_range: '400 to 500+' }
  ],
  // Simplified data structures for the demo - full data would be much larger
  raceMinima: {
    Human: { Competence: 'd6', Prowess: 'd6', Melee: 'd4', Threat: '+1', Fortitude: 'd4', Willpower: 'd6' },
    Elf: { Competence: 'd6', Expertise: 'd6', Wizardry: '+1', Prowess: 'd4', Agility: 'd4', Reaction: '+1' },
    Dwarf: { Fortitude: 'd8', Endurance: 'd4', Prowess: 'd6', Melee: 'd6' }
    // ... other races would be here
  },
  classMinima: {
    Warrior: { Prowess: 'd8', Melee: 'd6', Threat: '+1', Fortitude: 'd6' },
    Mage: { Competence: 'd6', Expertise: 'd8', Wizardry: '+1', Fortitude: 'd4', Willpower: 'd6', Resistance: '+1' },
    Rogue: { Competence: 'd4', Adroitness: 'd4', Skulduggery: '+1', Perception: 'd4', Prowess: 'd6', Agility: 'd8' }
    // ... other classes would be here
  },
  allAdvantages: {
    Human: ['Fortunate', 'Survival'],
    Elf: ['Night Vision', 'Gift of Magic', 'Magic Resistance (+1)'],
    Warrior: ['Commanding', 'Intimidation', 'Magic Resistance (+1)', 'Tactician']
    // ... other advantages would be here
  },
  classFeats: {
    Warrior: ['Battle Savvy', 'Maneuvers', 'Stunning Reversal', 'Sunder Foe'],
    Mage: ['Arcane Finesse', 'Dweomers', 'Intangible Threat', 'Path Mastery']
    // ... other class feats would be here
  },
  spellsByPath: {
    Elementalism: {
      Common: ['Air Bubble', 'Ball of Light', 'Boil Water', 'Breeze', 'Fire Strike'],
      Uncommon: ['Arcane Maelstrom', 'Crystal Enhancement', 'Energy Drain']
    },
    Sorcery: {
      Common: ['Arcane Lock', 'Arcane Mark', 'Minor Illusion', 'Shadow Step'],
      Uncommon: ['Audio Illusion', 'Chameleon', 'Dustify', 'Enfeeblement']
    }
    // ... other paths would be here
  }
}

export default function CharacterGenerator() {
  const [race, setRace] = useState('')
  const [characterClass, setCharacterClass] = useState('')
  const [level, setLevel] = useState('')
  const [magicPath, setMagicPath] = useState('')
  const [hasMagicalItem, setHasMagicalItem] = useState(false)
  const [character, setCharacter] = useKV<Character | null>('generated-character', null)

  const showMagicPath = characterClass && 
    charGenData.magicPathsByClass[characterClass as keyof typeof charGenData.magicPathsByClass] &&
    characterClass !== 'Adept' && characterClass !== 'Mystic'

  const generateCharacter = () => {
    if (!race || !characterClass || !level) {
      toast.error("Please select a race, class, and level.")
      return
    }

    const levelNum = parseInt(level)
    
    // Initialize character with base stats
    const newCharacter: Character = {
      race,
      class: characterClass,
      level: levelNum,
      abilities: {
        Competence: 'd4',
        Prowess: 'd4', 
        Fortitude: 'd4'
      },
      specialties: {
        Competence: { Adroitness: 'd4', Expertise: 'd4', Perception: 'd4' },
        Prowess: { Agility: 'd4', Melee: 'd4', Precision: 'd4' },
        Fortitude: { Endurance: 'd4', Strength: 'd4', Willpower: 'd4' }
      },
      focuses: {
        Competence: { 
          Skulduggery: '+0', Cleverness: '+0', Wizardry: '+0', Theurgy: '+0',
          Alertness: '+0', Perspicacity: '+0'
        },
        Prowess: {
          Speed: '+0', Reaction: '+0', Threat: '+0', Finesse: '+0',
          'Ranged Threat': '+0', 'Ranged Finesse': '+0'
        },
        Fortitude: {
          Vitality: '+0', Resilience: '+0', Ferocity: '+0', Might: '+0',
          Courage: '+0', Resistance: '+0'
        }
      },
      defensePools: { activeDefense: 0, passiveDefense: 0, spiritPoints: 0 },
      advantages: [],
      flaws: [],
      classFeats: [],
      equipment: [],
      actions: {},
      iconicItem: { type: '', description: '' },
      masteryDie: charGenData.levelInfo[levelNum - 1].masteryDie
    }

    // Apply race and class minima (simplified)
    const raceMinima = charGenData.raceMinima[race as keyof typeof charGenData.raceMinima] || {}
    const classMinima = charGenData.classMinima[characterClass as keyof typeof charGenData.classMinima] || {}
    
    // For demo purposes, apply some basic improvements
    if (characterClass === 'Warrior') {
      newCharacter.abilities.Prowess = 'd8'
      newCharacter.specialties.Prowess.Melee = 'd6'
      newCharacter.abilities.Fortitude = 'd6'
    } else if (characterClass === 'Mage') {
      newCharacter.abilities.Competence = 'd6'
      newCharacter.specialties.Competence.Expertise = 'd8'
      newCharacter.focuses.Competence.Wizardry = '+1'
    }

    // Calculate defense pools
    const getMV = (val: string) => val.startsWith('d') ? parseInt(val.substring(1)) : 0
    newCharacter.defensePools = {
      activeDefense: getMV(newCharacter.abilities.Prowess) + getMV(newCharacter.specialties.Prowess.Agility) + getMV(newCharacter.specialties.Prowess.Melee),
      passiveDefense: getMV(newCharacter.abilities.Fortitude) + getMV(newCharacter.specialties.Fortitude.Endurance) + getMV(newCharacter.specialties.Fortitude.Strength),
      spiritPoints: getMV(newCharacter.abilities.Competence) + getMV(newCharacter.specialties.Fortitude.Willpower)
    }

    // Add advantages, equipment, etc.
    newCharacter.advantages = charGenData.allAdvantages[race as keyof typeof charGenData.allAdvantages] || []
    const classAdvantages = charGenData.allAdvantages[characterClass as keyof typeof charGenData.allAdvantages] || []
    newCharacter.advantages = [...new Set([...newCharacter.advantages, ...classAdvantages])]
    
    if (hasMagicalItem) {
      newCharacter.advantages.push('Iconic Arcane Inheritance')
    }

    newCharacter.classFeats = charGenData.classFeats[characterClass as keyof typeof charGenData.classFeats] || []
    
    // Generate spells for caster classes
    if (charGenData.casterClasses.includes(characterClass)) {
      const paths = charGenData.magicPathsByClass[characterClass as keyof typeof charGenData.magicPathsByClass] || []
      newCharacter.spellcasting = {
        masteryPath: characterClass === 'Adept' ? 'Arcanum' : paths.join(', '),
        pathSpecialization: magicPath || paths[0] || null,
        knownSpells: []
      }
      
      // Generate some sample spells
      const pathSpells = charGenData.spellsByPath[magicPath as keyof typeof charGenData.spellsByPath]
      if (pathSpells) {
        const commonSpells = pathSpells.Common || []
        const uncommonSpells = pathSpells.Uncommon || []
        
        for (let i = 0; i < 4; i++) {
          if (Math.random() < 0.7 && commonSpells.length > 0) {
            const spell = commonSpells[Math.floor(Math.random() * commonSpells.length)]
            newCharacter.spellcasting.knownSpells.push({ name: spell, rarity: 'Common' })
          } else if (uncommonSpells.length > 0) {
            const spell = uncommonSpells[Math.floor(Math.random() * uncommonSpells.length)]
            newCharacter.spellcasting.knownSpells.push({ name: spell, rarity: 'Uncommon' })
          }
        }
      }
    }

    // Generate actions
    newCharacter.actions = {
      meleeAttack: `${newCharacter.abilities.Prowess} + ${newCharacter.specialties.Prowess.Melee}`,
      rangedAttack: `${newCharacter.abilities.Prowess} + ${newCharacter.specialties.Prowess.Precision}`,
      perceptionCheck: `${newCharacter.abilities.Competence} + ${newCharacter.specialties.Competence.Perception}`
    }

    if (charGenData.casterClasses.includes(characterClass)) {
      newCharacter.actions.magicAttack = `${newCharacter.abilities.Competence} + ${newCharacter.specialties.Competence.Expertise}`
    }

    // Set iconic item
    newCharacter.iconicItem = {
      type: hasMagicalItem ? 'Iconic Arcane Item' : 'Iconic Item',
      description: hasMagicalItem ? 'A personalized item with inherent magical properties.' : 'A personalized item of great significance.',
      magicProperty: hasMagicalItem ? 'Enhanced capabilities relevant to class' : undefined
    }

    setCharacter(newCharacter)
    toast.success("Character generated successfully!")
  }

  const exportToMarkdown = () => {
    if (!character) {
      toast.error("Generate a character first!")
      return
    }

    let md = `# ${character.race} ${character.class} (Level ${character.level})\n\n`
    md += `### Core Stats\n`
    md += `- **SP:** ${character.defensePools.spiritPoints} | **Active DP:** ${character.defensePools.activeDefense} | **Passive DP:** ${character.defensePools.passiveDefense}\n`
    md += `- **Mastery Die:** ${character.masteryDie}\n\n`
    
    md += `### Abilities\n`
    charGenData.abilities.forEach(a => {
      const specialtyStrings = charGenData.specialties[a as keyof typeof charGenData.specialties].map(sp => {
        const specValue = character.specialties[a]?.[sp] || 'd4'
        return `${sp} **${specValue}**`
      }).join(', ')
      md += `**${a} ${character.abilities[a]}** → ${specialtyStrings}\n`
    })
    md += `\n`
    
    md += `### Actions\n`
    Object.entries(character.actions).forEach(([name, value]) => {
      md += `- **${name.replace(/([A-Z])/g, ' $1').trim()}:** ${value}\n`
    })
    md += `\n`

    md += `### Advantages\n`
    md += character.advantages.map(adv => `- ${adv}`).join('\n') + '\n\n'
    
    md += `### Class Feats\n`
    md += character.classFeats.map(feat => `- ${feat}`).join('\n') + '\n\n'

    if (character.spellcasting) {
      md += `### Spellcasting\n`
      md += `- **Mastery Path(s):** ${character.spellcasting.masteryPath}\n`
      if (character.spellcasting.pathSpecialization) {
        md += `- **Chosen Magic Path:** ${character.spellcasting.pathSpecialization}\n`
      }
      md += `**Known Spells:**\n`
      md += character.spellcasting.knownSpells.map(s => `- ${s.name} (${s.rarity})`).join('\n') + '\n\n'
    }

    return md
  }

  const handleExport = () => {
    const md = exportToMarkdown()
    if (md) {
      const blob = new Blob([md], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'character.md'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success("Character exported successfully!")
    }
  }

  const handleCopy = async () => {
    const md = exportToMarkdown()
    if (md) {
      try {
        await navigator.clipboard.writeText(md)
        toast.success("Character copied to clipboard!")
      } catch (err) {
        toast.error("Failed to copy to clipboard")
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="text-accent" />
          Detailed Character Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="race">Race</Label>
            <Select value={race} onValueChange={setRace}>
              <SelectTrigger>
                <SelectValue placeholder="Select Race" />
              </SelectTrigger>
              <SelectContent>
                {charGenData.races.map(r => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="class">Class</Label>
            <Select value={characterClass} onValueChange={setCharacterClass}>
              <SelectTrigger>
                <SelectValue placeholder="Select Class" />
              </SelectTrigger>
              <SelectContent>
                {charGenData.classes.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="level">Level</Label>
            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Select Level" />
              </SelectTrigger>
              <SelectContent>
                {charGenData.levels.map(l => (
                  <SelectItem key={l} value={l.toString()}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {showMagicPath && (
          <div>
            <Label htmlFor="magic-path">Chosen Magic Path</Label>
            <Select value={magicPath} onValueChange={setMagicPath}>
              <SelectTrigger>
                <SelectValue placeholder="Select Magic Path" />
              </SelectTrigger>
              <SelectContent>
                {charGenData.magicPathsByClass[characterClass as keyof typeof charGenData.magicPathsByClass]?.map(p => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="magical-item"
            checked={hasMagicalItem}
            onCheckedChange={setHasMagicalItem}
          />
          <Label htmlFor="magical-item">Iconic Arcane Inheritance (Costs 4 CP)</Label>
        </div>

        <div className="flex gap-2">
          <Button onClick={generateCharacter} className="flex-1">
            Generate Character
          </Button>
          <Button variant="outline" onClick={handleExport} disabled={!character}>
            <Download size={16} className="mr-2" />
            Export MD
          </Button>
          <Button variant="outline" onClick={handleCopy} disabled={!character}>
            <Copy size={16} className="mr-2" />
            Copy MD
          </Button>
        </div>

        {character && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Generated Character</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-mono text-sm whitespace-pre-line">
                {exportToMarkdown()}
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  )
}