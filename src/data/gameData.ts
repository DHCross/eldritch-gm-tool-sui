// Eldritch RPG game data and tables

export const SPELL_CHALLENGE_TABLE = {
  'Common (D0)': { challenge: 'D0', maintenancePenalty: null },
  'Common (D4)': { challenge: 'D4', maintenancePenalty: '-1' },
  'Uncommon': { challenge: 'D6', maintenancePenalty: '-2' },
  'Esoteric': { challenge: 'D8', maintenancePenalty: '-3' },
  'Occult': { challenge: 'D10', maintenancePenalty: '-4' },
  'Legendary': { challenge: 'D12', maintenancePenalty: '-5' },
}

export const SPELL_POTENCY_TABLE = {
  '1': { challenge: 'd4', rarity: 'Common', modifier: '±1' },
  '2': { challenge: 'd6', rarity: 'Uncommon', modifier: '±2' },
  '3': { challenge: 'd8', rarity: 'Esoteric', modifier: '±3' },
  '4': { challenge: 'd10', rarity: 'Occult', modifier: '±4' },
  '5': { challenge: 'd12', rarity: 'Legendary', modifier: '±5' },
}

export const SPELL_FAILURE_TABLE = {
  'D0 (Auto Harm)': { reattemptConsequence: 'N/A None' },
  'D4 (Common)': { reattemptConsequence: 'Next Round Spell Fizzles' },
  'D6 (Uncommon)': { reattemptConsequence: '2 rounds', spiritLoss: 1, rounds: 2 },
  'D8 (Esoteric)': { reattemptConsequence: '3 rounds', spiritLoss: 3, rounds: 3 },
  'D10 (Occult)': { reattemptConsequence: '4 rounds', spiritLoss: 4, rounds: 4 },
  'D12 (Legendary)': { reattemptConsequence: '5 rounds', spiritLoss: 5, rounds: 5 },
}

export const RARITY_UNLOCK_TABLE = {
  'Weak (1-3)': 'd4 (Common)',
  'Average (4+)': 'd6 (Uncommon)',
  'Respectable (12+)': 'd8 (Esoteric)',
  'Skilled (16+)': 'd10 (Occult)',
  'Great (20+)': 'd12 (Legendary)',
  'Phenomenal (24+)': 'd12+ (Legendary+)',
}

export const CHALLENGE_DIFFICULTIES = {
  'Easy': { base: 'd4', withDisadvantage: '2d4' },
  'Moderate': { base: 'd6', withDisadvantage: '2d6' },
  'Difficult': { base: 'd8', withDisadvantage: '2d8' },
  'Demanding': { base: 'd10', withDisadvantage: '2d10' },
  'Formidable': { base: 'd12', withDisadvantage: '2d12' },
}

export const SUCCESS_CHANCE_TABLE = [
  {
    ability: 'Average (2d4)',
    difficulties: [
      { name: 'Easy (≥1d4)', standard: '94%', disadvantage: '59%' },
      { name: 'Moderate (≥1d6)', standard: '79%', disadvantage: '31%' },
      { name: 'Difficult (≥1d8)', standard: '62%', disadvantage: '18%' },
      { name: 'Demanding (≥1d10)', standard: '50%', disadvantage: '11%' },
      { name: 'Formidable (≥1d12)', standard: '41%', disadvantage: '8%' },
    ]
  },
  {
    ability: 'Respectable (2d6)',
    difficulties: [
      { name: 'Easy (≥1d4)', standard: '97%', disadvantage: '80%' },
      { name: 'Moderate (≥1d6)', standard: '90%', disadvantage: '56%' },
      { name: 'Difficult (≥1d8)', standard: '81%', disadvantage: '36%' },
      { name: 'Demanding (≥1d10)', standard: '69%', disadvantage: '24%' },
      { name: 'Formidable (≥1d12)', standard: '58%', disadvantage: '17%' },
    ]
  },
  {
    ability: 'Skilled (2d8)',
    difficulties: [
      { name: 'Easy (≥1d4)', standard: '98%', disadvantage: '89%' },
      { name: 'Moderate (≥1d6)', standard: '94%', disadvantage: '72%' },
      { name: 'Difficult (≥1d8)', standard: '88%', disadvantage: '54%' },
      { name: 'Demanding (≥1d10)', standard: '81%', disadvantage: '39%' },
      { name: 'Formidable (≥1d12)', standard: '72%', disadvantage: '28%' },
    ]
  },
  {
    ability: 'Great (2d10)',
    difficulties: [
      { name: 'Easy (≥1d4)', standard: '99%', disadvantage: '93%' },
      { name: 'Moderate (≥1d6)', standard: '96%', disadvantage: '82%' },
      { name: 'Difficult (≥1d8)', standard: '93%', disadvantage: '68%' },
      { name: 'Demanding (≥1d10)', standard: '88%', disadvantage: '53%' },
      { name: 'Formidable (≥1d12)', standard: '81%', disadvantage: '41%' },
    ]
  },
  {
    ability: 'Phenomenal (2d12)',
    difficulties: [
      { name: 'Easy (≥1d4)', standard: '99%', disadvantage: '95%' },
      { name: 'Moderate (≥1d6)', standard: '97%', disadvantage: '88%' },
      { name: 'Difficult (≥1d8)', standard: '95%', disadvantage: '77%' },
      { name: 'Demanding (≥1d10)', standard: '91%', disadvantage: '65%' },
      { name: 'Formidable (≥1d12)', standard: '87%', disadvantage: '53%' },
    ]
  },
]

export const BATTLE_PHASE_TABLE = [
  { prowess: 'd12', phase: 1, initiative: '12+' },
  { prowess: 'd10', phase: 2, initiative: '9-11' },
  { prowess: 'd8', phase: 3, initiative: '7-8' },
  { prowess: 'd6', phase: 4, initiative: '5-6' },
  { prowess: 'd4', phase: 5, initiative: '1-4' },
]

export const CRAFTING_CHALLENGE_TABLE = [
  { potency: '1d4 or ±1', challenge: '2d4 (Easy)', type: 'Common', time: '1 hour' },
  { potency: '1d6 or ±2', challenge: '2d6 (Moderate)', type: 'Uncommon', time: '2 hours' },
  { potency: '1d8 or ±3', challenge: '2d8 (Difficult)', type: 'Esoteric', time: '3 hours' },
  { potency: '1d10 or ±4', challenge: '2d10 (Demanding)', type: 'Occult', time: '4 hours' },
  { potency: '1d12 or ±5', challenge: '2d12 (Formidable)', type: 'Legendary', time: '5 hours' },
]

// Additional data for EncounterGenerator
export const ENCOUNTER_DIFFICULTY_TABLE = {
  1: { 
    Practitioner: [7,10,12,14,16,18], 
    Competent: [14,20,24,28,32,36], 
    Proficient: [21,29,36,42,48,55], 
    Advanced: [28,39,48,56,64,73], 
    Elite: [35,49,60,70,80,110] 
  },
  2: { 
    Practitioner: [14,20,24,28,32,36], 
    Competent: [28,39,48,56,64,73], 
    Proficient: [42,59,72,84,96,108], 
    Advanced: [56,77,96,112,128,144], 
    Elite: [70,95,120,140,160,190] 
  },
  3: { 
    Practitioner: [21,30,36,42,48,54], 
    Competent: [42,59,72,84,96,108], 
    Proficient: [63,84,108,126,144,162], 
    Advanced: [84,111,144,168,192,216], 
    Elite: [105,140,180,210,240,270] 
  },
  4: { 
    Practitioner: [28,42,50,56,64,72], 
    Competent: [56,77,96,112,128,144], 
    Proficient: [84,111,144,168,192,216], 
    Advanced: [112,147,180,224,256,288], 
    Elite: [140,185,228,280,320,360] 
  }
}

export const HIT_POINT_MODIFIERS = {
  'Minuscule': {'Mundane': 0.5, 'Magical': 1, 'Preternatural': 1.5, 'Supernatural': 2},
  'Tiny': {'Mundane': 0.5, 'Magical': 1, 'Preternatural': 1.5, 'Supernatural': 2},
  'Small': {'Mundane': 1, 'Magical': 1.5, 'Preternatural': 2, 'Supernatural': 2.5},
  'Medium': {'Mundane': 1, 'Magical': 1.5, 'Preternatural': 2, 'Supernatural': 2.5},
  'Large': {'Mundane': 1.5, 'Magical': 2, 'Preternatural': 2.5, 'Supernatural': 3},
  'Huge': {'Mundane': 2, 'Magical': 2.5, 'Preternatural': 3, 'Supernatural': 3.5},
  'Gargantuan': {'Mundane': 2.5, 'Magical': 3, 'Preternatural': 3.5, 'Supernatural': 4}
}

export const BATTLE_PHASES = {
  'd12': { phase: 1, initiative: '12+' },
  'd10': { phase: 2, initiative: '9-11' },
  'd8': { phase: 3, initiative: '7-8' },
  'd6': { phase: 4, initiative: '5-6' },
  'd4': { phase: 5, initiative: '1-4' },
}