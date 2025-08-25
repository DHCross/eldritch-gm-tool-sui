// Utility functions for Eldritch RPG calculations

import { DICE_RANKS, STEP_COSTS, FOCUS_STEP_COST, HP_MULTIPLIERS, BATTLE_PHASE_TABLE } from './gameData'

export function getDieValue(dieRank: string): number {
  if (!dieRank.startsWith('d')) return 0
  return parseInt(dieRank.slice(1), 10)
}

export function getDieRankIndex(dieRank: string): number {
  return DICE_RANKS.indexOf(dieRank as any)
}

export function getHigherDieRank(die1: string, die2: string): string {
  return getDieValue(die1) >= getDieValue(die2) ? die1 : die2
}

export function upgradeDieRank(currentRank: string): string {
  const currentIndex = getDieRankIndex(currentRank)
  if (currentIndex < DICE_RANKS.length - 1) {
    return DICE_RANKS[currentIndex + 1]
  }
  return currentRank
}

export function getFocusValue(focusString: string): number {
  if (!focusString) return 0
  return parseInt(focusString.replace('+', ''), 10) || 0
}

export function calculateDefensePools(character: any) {
  const activeDefense = getDieValue(character.abilities.Prowess) + 
                       getDieValue(character.specialties.Prowess.Agility) + 
                       getDieValue(character.specialties.Prowess.Melee)
  
  const passiveDefense = getDieValue(character.abilities.Fortitude) + 
                        getDieValue(character.specialties.Fortitude.Endurance) + 
                        getDieValue(character.specialties.Fortitude.Strength)
  
  const spiritPoints = getDieValue(character.abilities.Competence) + 
                      getDieValue(character.specialties.Fortitude.Willpower)

  return { active: activeDefense, passive: passiveDefense, spirit: spiritPoints }
}

export function calculateCPSpent(finalChar: any, baseChar: any, iconic: boolean = false) {
  let spent = { abilities: 0, specialties: 0, focuses: 0, advantages: 0, total: 0 }
  spent.advantages = iconic ? 4 : 0

  for (const ability of ['Competence', 'Prowess', 'Fortitude']) {
    // Calculate cost for ability upgrades
    let baseRankIndex = getDieRankIndex(baseChar.abilities[ability])
    let finalRankIndex = getDieRankIndex(finalChar.abilities[ability])
    for (let i = baseRankIndex; i < finalRankIndex; i++) {
      spent.abilities += STEP_COSTS[DICE_RANKS[i] as keyof typeof STEP_COSTS]
    }

    // Calculate cost for specialty upgrades
    const specialties = ability === 'Competence' ? ['Adroitness', 'Expertise', 'Perception'] :
                       ability === 'Prowess' ? ['Agility', 'Melee', 'Precision'] :
                       ['Endurance', 'Strength', 'Willpower']
    
    for (const specialty of specialties) {
      let baseSpecIndex = getDieRankIndex(baseChar.specialties[ability][specialty])
      let finalSpecIndex = getDieRankIndex(finalChar.specialties[ability][specialty])
      for (let i = baseSpecIndex; i < finalSpecIndex; i++) {
        spent.specialties += STEP_COSTS[DICE_RANKS[i] as keyof typeof STEP_COSTS]
      }
    }
    
    // Calculate cost for focus upgrades
    for (const specialty of specialties) {
      const focuses = specialty === 'Adroitness' ? ['Skulduggery', 'Cleverness'] :
                     specialty === 'Expertise' ? ['Wizardry', 'Theurgy'] :
                     specialty === 'Perception' ? ['Alertness', 'Perspicacity'] :
                     specialty === 'Agility' ? ['Speed', 'Reaction'] :
                     specialty === 'Melee' ? ['Threat', 'Finesse'] :
                     specialty === 'Precision' ? ['Ranged Threat', 'Ranged Finesse'] :
                     specialty === 'Endurance' ? ['Vitality', 'Resilience'] :
                     specialty === 'Strength' ? ['Ferocity', 'Might'] :
                     ['Courage', 'Resistance']
      
      for (const focus of focuses) {
        if (finalChar.focuses[ability] && finalChar.focuses[ability][focus] !== undefined) {
          let baseFocusValue = getFocusValue(baseChar.focuses[ability][focus])
          let finalFocusValue = getFocusValue(finalChar.focuses[ability][focus])
          spent.focuses += (finalFocusValue - baseFocusValue) * FOCUS_STEP_COST
        }
      }
    }
  }
  
  spent.total = spent.abilities + spent.specialties + spent.focuses + spent.advantages
  return spent
}

export function calculateHitPoints(baseMV: number, size: string, nature: string) {
  const multiplier = HP_MULTIPLIERS[size as keyof typeof HP_MULTIPLIERS]?.[nature as keyof typeof HP_MULTIPLIERS['Medium']] || 1
  return {
    hitPoints: Math.round(baseMV * multiplier),
    multiplier: multiplier
  }
}

export function calculateBattlePhase(prowessDie: string): number {
  return BATTLE_PHASE_TABLE[prowessDie as keyof typeof BATTLE_PHASE_TABLE] || 5
}

export function parseThreatDice(threatDice: string): { count: number, die: number, mv: number } {
  const match = threatDice.match(/(\d+)d(\d+)/)
  if (!match) return { count: 0, die: 4, mv: 0 }
  
  const count = parseInt(match[1], 10)
  const die = parseInt(match[2], 10)
  return { count, die, mv: count * die }
}

export function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

export function rollDie(sides: number): number {
  return Math.floor(Math.random() * sides) + 1
}

// Generate a random name (placeholder function)
export function generateRandomName(gender?: 'male' | 'female'): string {
  const maleNames = ['Aldric', 'Branwen', 'Caelum', 'Dorian', 'Elric', 'Gareth', 'Hadric', 'Ivan', 'Joren', 'Kael']
  const femaleNames = ['Ariana', 'Brielle', 'Celia', 'Diana', 'Elara', 'Fiona', 'Gwendolyn', 'Helena', 'Iris', 'Lyra']
  const surnames = ['Ashworth', 'Blackwood', 'Crowley', 'Darkbane', 'Emberstone', 'Frostborn', 'Goldleaf', 'Ironhold', 'Moonwhisper', 'Stormwind']
  
  const firstNames = gender === 'female' ? femaleNames : gender === 'male' ? maleNames : [...maleNames, ...femaleNames]
  const firstName = getRandomElement(firstNames)
  const lastName = getRandomElement(surnames)
  
  return `${firstName} ${lastName}`
}