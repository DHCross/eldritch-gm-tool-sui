// Eldritch RPG game data and tables

export const SPELL_CHALLENGE_TABLE = [
  { challenge: 'D0', rarity: 'Common', maintenance: 'None' },
  { challenge: 'D4', rarity: 'Common', maintenance: '-1' },
  { challenge: 'D6', rarity: 'Uncommon', maintenance: '-2' },
  { challenge: 'D8', rarity: 'Esoteric', maintenance: '-3' },
  { challenge: 'D10', rarity: 'Occult', maintenance: '-4' },
  { challenge: 'D12', rarity: 'Legendary', maintenance: '-5' },
]

export const SPELL_POTENCY_TABLE = [
  { potency: 1, challenge: 'd4', rarity: 'Common', modifier: '±1' },
  { potency: 2, challenge: 'd6', rarity: 'Uncommon', modifier: '±2' },
  { potency: 3, challenge: 'd8', rarity: 'Esoteric', modifier: '±3' },
  { potency: 4, challenge: 'd10', rarity: 'Occult', modifier: '±4' },
  { potency: 5, challenge: 'd12', rarity: 'Legendary', modifier: '±5' },
]

export const SPELL_FAILURE_TABLE = [
  { rarity: 'D0 (Auto Harm)', consequence: 'N/A None' },
  { rarity: 'D4 (Common)', consequence: 'Next Round Spell Fizzles' },
  { rarity: 'D6 (Uncommon)', consequence: '2 rounds -1 spirit point' },
  { rarity: 'D8 (Esoteric)', consequence: '3 rounds -3 spirit points' },
  { rarity: 'D10 (Occult)', consequence: '4 rounds -4 spirit points' },
  { rarity: 'D12 (Legendary)', consequence: '5 rounds -5 spirit points' },
]

export const RARITY_UNLOCK_TABLE = [
  { rank: 'Weak (1-3)', rarity: 'd4 (Common)' },
  { rank: 'Average (4+)', rarity: 'd6 (Uncommon)' },
  { rank: 'Respectable (12+)', rarity: 'd8 (Esoteric)' },
  { rank: 'Skilled (16+)', rarity: 'd10 (Occult)' },
  { rank: 'Great (20+)', rarity: 'd12 (Legendary)' },
  { rank: 'Phenomenal (24+)', rarity: 'd12+ (Legendary+)' },
]

export const CHALLENGE_DIFFICULTIES = [
  { challenge: 'Easy', base: 'd4', disadvantage: '2d4' },
  { challenge: 'Moderate', base: 'd6', disadvantage: '2d6' },
  { challenge: 'Difficult', base: 'd8', disadvantage: '2d8' },
  { challenge: 'Demanding', base: 'd10', disadvantage: '2d10' },
  { challenge: 'Formidable', base: 'd12', disadvantage: '2d12' },
]

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

export const BATTLE_PHASES = [
  { prowess: 'd12', phase: 1, initiative: '12+' },
  { prowess: 'd10', phase: 2, initiative: '9-11' },
  { prowess: 'd8', phase: 3, initiative: '7-8' },
  { prowess: 'd6', phase: 4, initiative: '5-6' },
  { prowess: 'd4', phase: 5, initiative: '1-4' },
]