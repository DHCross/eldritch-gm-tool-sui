import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from 'sonner'
import { 
  RACES, 
  CLASSES, 
  LEVELS, 
  CASTER_CLASSES,
  MAGIC_PATHS_BY_CLASS,
  RACE_MINIMA,
  CLASS_MINIMA,
  CLASS_FEATS,
  LEVEL_INFO,
  SPECIALTIES,
  FOCUSES
} from '@/data/gameData'
import { 
  calculateDefensePools, 
  calculateCPSpent, 
  getDieRankIndex, 
  upgradeDieRank, 
  getFocusValue
} from '@/utils/gameUtils'

interface Character {
  race: string
  class: string
  level: number
  abilities: Record<string, string>
  specialties: Record<string, Record<string, string>>
  focuses: Record<string, Record<string, string>>
  advantages: string[]
  flaws: string[]
  classFeats: string[]
  equipment: string[]
  pools: { active: number, passive: number, spirit: number }
  masteryDie: string
  actions: Record<string, string>
}

const PlayerCharacterGenerator: React.FC = () => {
  const [settings, setSettings] = useState({
    race: '',
    class: '',
    level: 1,
    magicPath: '',
    iconicArcane: false
  })

  const [character, setCharacter] = useState<Character | null>(null)
  const [cpBreakdown, setCpBreakdown] = useState<any>(null)

  const generateCharacter = () => {
    if (!settings.race || !settings.class) {
      toast.error('Please select a race and class')
      return
    }

    // Initialize character
    const char: Character = {
      race: settings.race,
      class: settings.class,
      level: settings.level,
      abilities: { Competence: 'd4', Prowess: 'd4', Fortitude: 'd4' },
      specialties: {},
      focuses: {},
      advantages: [],
      flaws: [],
      classFeats: [],
      equipment: [],
      pools: { active: 0, passive: 0, spirit: 0 },
      masteryDie: LEVEL_INFO[settings.level - 1].masteryDie,
      actions: {}
    }

    // Initialize specialties and focuses
    for (const ability of ['Competence', 'Prowess', 'Fortitude']) {
      char.specialties[ability] = {}
      char.focuses[ability] = {}
      
      const specs = SPECIALTIES[ability as keyof typeof SPECIALTIES]
      for (const specialty of specs) {
        char.specialties[ability][specialty] = 'd4'
        
        const foci = FOCUSES[specialty as keyof typeof FOCUSES]
        for (const focus of foci) {
          char.focuses[ability][focus] = '+0'
        }
      }
    }

    // Create base character with minimums only
    const baseChar = JSON.parse(JSON.stringify(char))
    applyMinima(baseChar, RACE_MINIMA[settings.race as keyof typeof RACE_MINIMA] || {})
    applyMinima(baseChar, CLASS_MINIMA[settings.class as keyof typeof CLASS_MINIMA] || {})

    // Copy base to final character and apply improvements
    Object.assign(char, JSON.parse(JSON.stringify(baseChar)))

    // Calculate CP budget
    let cpBudget = 10 + (settings.level - 1) * 100
    if (settings.iconicArcane) {
      if (cpBudget >= 4) {
        cpBudget -= 4
      } else {
        toast.error('Not enough CP for Iconic Arcane Inheritance')
        return
      }
    }

    // Apply CP improvements
    spendCP(char, cpBudget, settings.class)

    // Generate other character features
    char.pools = calculateDefensePools(char)
    char.advantages = getAdvantages(settings.race, settings.class, settings.iconicArcane)
    char.flaws = getFlaws(settings.race)
    char.classFeats = getClassFeats(settings.class, settings.magicPath)
    char.equipment = getEquipment(settings.class)
    char.actions = calculateActions(char, settings.class)

    // Calculate CP breakdown
    const spent = calculateCPSpent(char, baseChar, settings.iconicArcane)

    setCharacter(char)
    setCpBreakdown(spent)
    toast.success('Character generated successfully!')
  }

  const applyMinima = (character: Character, minima: Record<string, string>) => {
    for (const [key, value] of Object.entries(minima)) {
      if (['Competence', 'Prowess', 'Fortitude'].includes(key)) {
        const currentRank = getDieRankIndex(character.abilities[key])
        const minimumRank = getDieRankIndex(value)
        if (minimumRank > currentRank) {
          character.abilities[key] = value
        }
      } else {
        // Handle specialties and focuses
        let found = false
        for (const [ability, specs] of Object.entries(character.specialties)) {
          if (specs[key]) {
            const currentRank = getDieRankIndex(specs[key])
            const minimumRank = getDieRankIndex(value)
            if (minimumRank > currentRank) {
              character.specialties[ability][key] = value
            }
            found = true
            break
          }
        }
        
        if (!found) {
          // Handle focus
          for (const [ability, foci] of Object.entries(character.focuses)) {
            if (foci[key]) {
              const currentValue = getFocusValue(foci[key])
              const minimumValue = getFocusValue(value)
              if (minimumValue > currentValue) {
                character.focuses[ability][key] = value
              }
              break
            }
          }
        }
      }
    }
  }

  const spendCP = (character: Character, budget: number, charClass: string) => {
    const upgradeOrder = getUpgradeOrder(charClass)
    let safety = 0

    while (budget > 0 && safety < 1000) {
      safety++
      let upgraded = false

      for (const key of upgradeOrder) {
        if (budget <= 0) break

        // Try to upgrade abilities
        if (['Competence', 'Prowess', 'Fortitude'].includes(key)) {
          const currentRank = character.abilities[key]
          const cost = getUpgradeCost(currentRank)
          if (currentRank !== 'd12' && budget >= cost) {
            character.abilities[key] = upgradeDieRank(currentRank)
            budget -= cost
            upgraded = true
            break
          }
        } else {
          // Try to upgrade specialties
          let found = false
          for (const [ability, specs] of Object.entries(character.specialties)) {
            if (specs[key]) {
              const currentRank = specs[key]
              const cost = getUpgradeCost(currentRank)
              if (currentRank !== 'd12' && budget >= cost) {
                character.specialties[ability][key] = upgradeDieRank(currentRank)
                budget -= cost
                upgraded = true
                found = true
                break
              }
            }
          }

          if (!found) {
            // Try to upgrade focuses
            for (const [ability, foci] of Object.entries(character.focuses)) {
              if (foci[key]) {
                const currentValue = getFocusValue(foci[key])
                if (currentValue < 5 && budget >= 4) {
                  character.focuses[ability][key] = `+${currentValue + 1}`
                  budget -= 4
                  upgraded = true
                  break
                }
              }
            }
          }

          if (upgraded) break
        }
      }

      if (!upgraded) break
    }
  }

  const getUpgradeCost = (dieRank: string): number => {
    const costs = { 'd4': 6, 'd6': 8, 'd8': 10, 'd10': 12, 'd12': Infinity }
    return costs[dieRank as keyof typeof costs] || Infinity
  }

  const getUpgradeOrder = (charClass: string): string[] => {
    const orders = {
      Warrior: ['Prowess', 'Melee', 'Strength', 'Fortitude', 'Precision', 'Endurance', 'Threat', 'Might'],
      Barbarian: ['Prowess', 'Melee', 'Strength', 'Fortitude', 'Endurance', 'Ferocity', 'Might', 'Vitality'],
      Rogue: ['Prowess', 'Agility', 'Competence', 'Adroitness', 'Perception', 'Skulduggery', 'Speed'],
      Assassin: ['Prowess', 'Agility', 'Melee', 'Adroitness', 'Finesse', 'Speed', 'Perception'],
      Mage: ['Competence', 'Expertise', 'Wizardry', 'Fortitude', 'Willpower', 'Resistance'],
      Mystic: ['Fortitude', 'Willpower', 'Competence', 'Expertise', 'Endurance', 'Resilience', 'Vitality'],
      Adept: ['Competence', 'Expertise', 'Adroitness', 'Perception', 'Cleverness', 'Wizardry'],
      Theurgist: ['Competence', 'Expertise', 'Theurgy', 'Fortitude', 'Willpower', 'Endurance']
    }
    return orders[charClass as keyof typeof orders] || ['Competence', 'Prowess', 'Fortitude']
  }

  const getAdvantages = (race: string, charClass: string, iconic: boolean): string[] => {
    const raceAdvantages = {
      Human: ['Fortunate', 'Survival'],
      Elf: ['Night Vision', 'Gift of Magic', 'Magic Resistance (+1)'],
      Dwarf: ['Night Vision', 'Strong-willed', 'Sense of Direction'],
      Gnome: ['Eidetic Memory', 'Low-Light Vision', 'Observant'],
      'Half-Elf': ['Heightened Senses', 'Low-Light Vision', 'Magic Resistance (+1)'],
      'Half-Orc': ['Low-light Vision', 'Intimidation', 'Menacing'],
      Halfling: ['Low Light Vision', 'Read Emotions', 'Resilient'],
      Drakkin: ['Natural Armor', 'Breath Weapon', 'Night Vision']
    }

    const classAdvantages = {
      Adept: ['Arcanum', 'Gift of Magic', 'Literacy', 'Scholar'],
      Assassin: ['Expeditious', 'Heightened Senses (hearing)', 'Observant', 'Read Emotions'],
      Barbarian: ['Animal Affinity', 'Brutishness', 'Menacing', 'Resilient'],
      Mage: ['Arcanum', 'Gift of Magic', 'Magic Defense', 'Scholar'],
      Mystic: ['Empathic', 'Gift of Magic', 'Intuitive', 'Magic Resistance (Lesser)', 'Strong-Willed'],
      Rogue: ['Expeditious', 'Fortunate', 'Streetwise', 'Underworld Contacts'],
      Theurgist: ['Gift of Magic', 'Magic Defense', 'Religion', 'Strong-Willed'],
      Warrior: ['Commanding', 'Intimidation', 'Magic Resistance (+1)', 'Tactician']
    }

    const advantages = [
      ...(raceAdvantages[race as keyof typeof raceAdvantages] || []),
      ...(classAdvantages[charClass as keyof typeof classAdvantages] || [])
    ]

    if (iconic) {
      advantages.push('Iconic Arcane Inheritance')
    }

    return [...new Set(advantages)]
  }

  const getFlaws = (race: string): string[] => {
    const flaws = {
      Gnome: ['Restriction: small weapons only'],
      Halfling: ['Restriction: small weapons only'],
      'Half-Orc': ['Ugliness']
    }
    return flaws[race as keyof typeof flaws] || []
  }

  const getClassFeats = (charClass: string, magicPath: string): string[] => {
    const feats = [...(CLASS_FEATS[charClass as keyof typeof CLASS_FEATS] || [])]
    
    // Replace Path Mastery with specific path
    const pathMasteryIndex = feats.indexOf('Path Mastery')
    if (pathMasteryIndex !== -1 && magicPath) {
      feats[pathMasteryIndex] = `Path Mastery (${magicPath})`
    }
    
    return feats
  }

  const getEquipment = (charClass: string): string[] => {
    const common = [
      'Set of ordinary clothes', 'Purse of 5 gold coins', 'Backpack', 'Small dagger',
      'Week\'s rations', 'Waterskin', 'Tinderbox', '50\' rope', 'Iron spikes',
      'Small hammer', '6\' traveling staff or 10\' pole', 'Hooded lantern and 2 oil flasks or d4+1 torches'
    ]

    const classEquipment = {
      Adept: ['Book of knowledge (area of expertise)'],
      Assassin: ['Assassin hood, jacket, cape, robe, or tunic'],
      Barbarian: ['Garments of woven wool or linen', 'Tunic', 'Overcoat or cloak'],
      Mage: ['Spellbook', 'Staff or focus item'],
      Mystic: ['Robes or shawl', 'Cloak', 'Armor up to leather'],
      Rogue: ['Set of thieves\' tools', 'Light armor (up to leather)', 'One weapon'],
      Theurgist: ['Prayer book', 'Holy relic or symbol', 'Focus item', 'Armor up to chain'],
      Warrior: ['One weapon of choice', 'Armor up to chain', 'Small to large shield', 'Steed']
    }

    return [...common, ...(classEquipment[charClass as keyof typeof classEquipment] || [])]
  }

  const calculateActions = (character: Character, charClass: string): Record<string, string> => {
    const actions: Record<string, string> = {}

    // Melee Attack
    let meleeAttack = `${character.abilities.Prowess} + ${character.specialties.Prowess.Melee}`
    const threatFocus = getFocusValue(character.focuses.Prowess.Threat)
    const finesseFocus = getFocusValue(character.focuses.Prowess.Finesse)
    if (threatFocus > 0) meleeAttack += ` + Threat +${threatFocus}`
    if (finesseFocus > 0) meleeAttack += ` + Finesse +${finesseFocus}`
    actions.meleeAttack = meleeAttack

    // Ranged Attack
    let rangedAttack = `${character.abilities.Prowess} + ${character.specialties.Prowess.Precision}`
    const rangedThreatFocus = getFocusValue(character.focuses.Prowess['Ranged Threat'])
    const rangedFinesseFocus = getFocusValue(character.focuses.Prowess['Ranged Finesse'])
    if (rangedThreatFocus > 0) rangedAttack += ` + Ranged Threat +${rangedThreatFocus}`
    if (rangedFinesseFocus > 0) rangedAttack += ` + Ranged Finesse +${rangedFinesseFocus}`
    actions.rangedAttack = rangedAttack

    // Perception Check
    let perceptionCheck = `${character.abilities.Competence} + ${character.specialties.Competence.Perception}`
    const alertnessFocus = getFocusValue(character.focuses.Competence.Alertness)
    const perspicacityFocus = getFocusValue(character.focuses.Competence.Perspicacity)
    if (alertnessFocus > 0) perceptionCheck += ` + Alertness +${alertnessFocus}`
    if (perspicacityFocus > 0) perceptionCheck += ` + Perspicacity +${perspicacityFocus}`
    actions.perceptionCheck = perceptionCheck

    // Magic Attack (for casters)
    if (CASTER_CLASSES.includes(charClass as any)) {
      let magicAttack = `${character.abilities.Competence} + ${character.specialties.Competence.Expertise}`
      const wizardryFocus = getFocusValue(character.focuses.Competence.Wizardry)
      const theurgyFocus = getFocusValue(character.focuses.Competence.Theurgy)
      if (wizardryFocus > 0) magicAttack += ` + Wizardry +${wizardryFocus}`
      if (theurgyFocus > 0) magicAttack += ` + Theurgy +${theurgyFocus}`
      actions.magicAttack = magicAttack
    }

    return actions
  }

  const exportMarkdown = () => {
    if (!character) return

    const char = character
    let md = `# ${char.race} ${char.class} (Level ${char.level})\n\n`
    
    md += `### Core Stats\n`
    md += `- **SP:** ${char.pools.spirit} | **Active DP:** ${char.pools.active} | **Passive DP:** ${char.pools.passive}\n`
    md += `- **Mastery Die:** ${char.masteryDie}\n\n`
    
    md += `### Abilities\n`
    for (const ability of ['Competence', 'Prowess', 'Fortitude']) {
      const specs = SPECIALTIES[ability as keyof typeof SPECIALTIES]
      const specStrings = specs.map(specialty => {
        const foci = FOCUSES[specialty as keyof typeof FOCUSES]
        const focusStrings = foci.map(focus => {
          const value = getFocusValue(char.focuses[ability][focus])
          return value > 0 ? `${focus} +${value}` : null
        }).filter(Boolean).join(', ')
        return `${specialty} **${char.specialties[ability][specialty]}**${focusStrings ? ` (${focusStrings})` : ''}`
      }).join(', ')
      
      md += `**${ability} ${char.abilities[ability]}** → ${specStrings}.\n`
    }
    
    md += `\n### Actions\n`
    Object.entries(char.actions).forEach(([name, value]) => {
      const displayName = name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
      md += `- **${displayName}:** ${value}\n`
    })
    
    md += `\n### Advantages & Flaws\n`
    md += `**Advantages:**\n${char.advantages.map(adv => `- ${adv}`).join('\n')}\n\n`
    md += `**Flaws:**\n${char.flaws.length ? char.flaws.map(flaw => `- ${flaw}`).join('\n') : '- None'}\n\n`
    
    md += `### Class Feats\n${char.classFeats.map(feat => `- ${feat}`).join('\n')}\n\n`
    
    md += `### Equipment\n${char.equipment.map(item => `- ${item}`).join('\n')}\n\n`

    if (cpBreakdown) {
      md += `### Character Points Spent\n`
      md += `- **Spent on Abilities:** ${cpBreakdown.abilities}\n`
      md += `- **Spent on Specialties:** ${cpBreakdown.specialties}\n`
      md += `- **Spent on Focuses:** ${cpBreakdown.focuses}\n`
      md += `- **Spent on Advantages:** ${cpBreakdown.advantages}\n`
      md += `- **Total CP Spent:** ${cpBreakdown.total}\n\n`
      md += `_Note: This shows CPs spent from the customization budget. Free racial/class minimums cost 0 CP._\n\n`
    }

    md += `### Level Advancement (Earned CP)\n`
    md += `| To Reach Level | Total Earned CP Required |\n`
    md += `| :------------- | :----------------------- |\n`
    md += `| Level 2        | 100                      |\n`
    md += `| Level 3        | 200                      |\n`
    md += `| Level 4        | 300                      |\n`
    md += `| Level 5        | 500                      |\n`

    // Create and download file
    const blob = new Blob([md], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${char.race}_${char.class}_L${char.level}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const copyMarkdown = async () => {
    if (!character) return

    const char = character
    let md = `# ${char.race} ${char.class} (Level ${char.level})\n\n`
    // ... (same markdown generation as above)
    
    try {
      await navigator.clipboard.writeText(md)
      toast.success('Markdown copied to clipboard!')
    } catch (err) {
      toast.error('Failed to copy markdown')
    }
  }

  const showMagicPathSelector = CASTER_CLASSES.includes(settings.class as any) && 
                                settings.class !== 'Adept' && 
                                settings.class !== 'Mystic'

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Player Character Generator</CardTitle>
          <CardDescription>
            Create detailed player characters following official Eldritch RPG rules
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="race">Race</Label>
              <Select value={settings.race} onValueChange={(value) => setSettings({ ...settings, race: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select race" />
                </SelectTrigger>
                <SelectContent>
                  {RACES.map((race) => (
                    <SelectItem key={race} value={race}>
                      {race}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="class">Class</Label>
              <Select value={settings.class} onValueChange={(value) => setSettings({ ...settings, class: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {CLASSES.map((charClass) => (
                    <SelectItem key={charClass} value={charClass}>
                      {charClass}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="level">Level</Label>
              <Select value={settings.level.toString()} onValueChange={(value) => setSettings({ ...settings, level: parseInt(value) })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEVELS.map((level) => (
                    <SelectItem key={level} value={level.toString()}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {showMagicPathSelector && (
              <div className="md:col-span-3">
                <Label htmlFor="magicPath">Chosen Magic Path</Label>
                <Select value={settings.magicPath} onValueChange={(value) => setSettings({ ...settings, magicPath: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select magic path" />
                  </SelectTrigger>
                  <SelectContent>
                    {MAGIC_PATHS_BY_CLASS[settings.class as keyof typeof MAGIC_PATHS_BY_CLASS]?.map((path) => (
                      <SelectItem key={path} value={path}>
                        {path}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="iconicArcane"
              checked={settings.iconicArcane}
              onCheckedChange={(checked) => setSettings({ ...settings, iconicArcane: checked as boolean })}
            />
            <Label htmlFor="iconicArcane">Iconic Arcane Inheritance (Costs 4 CP)</Label>
          </div>

          <div className="flex gap-4">
            <Button onClick={generateCharacter} className="flex-1">
              Generate Character
            </Button>
            {character && (
              <>
                <Button variant="outline" onClick={exportMarkdown}>
                  Export Markdown
                </Button>
                <Button variant="outline" onClick={copyMarkdown}>
                  Copy Markdown
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {character && (
        <Card>
          <CardHeader>
            <CardTitle>{character.race} {character.class}</CardTitle>
            <CardDescription>Level {character.level}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Core Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">{character.pools.spirit}</div>
                <div className="text-sm text-muted-foreground">Spirit Points</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">{character.pools.active}</div>
                <div className="text-sm text-muted-foreground">Active DP</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">{character.pools.passive}</div>
                <div className="text-sm text-muted-foreground">Passive DP</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">{character.masteryDie}</div>
                <div className="text-sm text-muted-foreground">Mastery Die</div>
              </div>
            </div>

            <Separator />

            {/* Abilities */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Abilities</h3>
              <div className="space-y-3">
                {Object.entries(character.abilities).map(([ability, die]) => {
                  const specs = SPECIALTIES[ability as keyof typeof SPECIALTIES]
                  return (
                    <div key={ability} className="space-y-1">
                      <div className="font-medium">
                        <span className="text-primary">{ability} {die}</span>
                      </div>
                      <div className="pl-4 space-y-1 text-sm">
                        {specs.map((specialty) => {
                          const specDie = character.specialties[ability][specialty]
                          const foci = FOCUSES[specialty as keyof typeof FOCUSES]
                          const focusValues = foci.map(focus => {
                            const value = getFocusValue(character.focuses[ability][focus])
                            return value > 0 ? `${focus} +${value}` : null
                          }).filter(Boolean)
                          
                          return (
                            <div key={specialty}>
                              <span className="font-medium">{specialty} {specDie}</span>
                              {focusValues.length > 0 && (
                                <span className="text-muted-foreground"> ({focusValues.join(', ')})</span>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <Separator />

            {/* Actions */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(character.actions).map(([name, value]) => {
                  const displayName = name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
                  return (
                    <div key={name} className="flex justify-between">
                      <span className="font-medium">{displayName}:</span>
                      <span className="font-mono text-sm">{value}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            <Separator />

            {/* Other Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Advantages</h3>
                <div className="flex flex-wrap gap-1">
                  {character.advantages.map((advantage, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {advantage}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Class Feats</h3>
                <div className="flex flex-wrap gap-1">
                  {character.classFeats.map((feat, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {feat}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {cpBreakdown && (
              <>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-4">Character Points Spent</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                    <div>
                      <div className="text-xl font-bold text-primary">{cpBreakdown.abilities}</div>
                      <div className="text-xs text-muted-foreground">Abilities</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-primary">{cpBreakdown.specialties}</div>
                      <div className="text-xs text-muted-foreground">Specialties</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-primary">{cpBreakdown.focuses}</div>
                      <div className="text-xs text-muted-foreground">Focuses</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-primary">{cpBreakdown.advantages}</div>
                      <div className="text-xs text-muted-foreground">Advantages</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-primary">{cpBreakdown.total}</div>
                      <div className="text-xs text-muted-foreground">Total</div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    This shows CPs spent from the customization budget. Free racial/class minimums cost 0 CP.
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default PlayerCharacterGenerator