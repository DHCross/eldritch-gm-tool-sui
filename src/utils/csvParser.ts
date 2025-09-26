export interface Spell {
  path: string;
  category: string;
  tier: string;
  spellName: string;
  rankDie: string;
  rarity: string;
  effects: string;
  notes: string;
}

export function parseCSV(csvText: string): Spell[] {
  const lines = csvText.split('\n').filter(line => line.trim());
  const dataLines = lines.slice(1);

  return dataLines.map(line => {
    const values = parseCSVLine(line);
    return {
      path: values[0] || '',
      category: values[1] || '',
      tier: values[2] || '',
      spellName: values[3] || '',
      rankDie: values[4] || '',
      rarity: values[5] || '',
      effects: values[6] || '',
      notes: values[7] || ''
    };
  }).filter(spell => spell.spellName.trim() !== '');
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i += 2;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
        i++;
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      result.push(current.trim());
      current = '';
      i++;
    } else {
      current += char;
      i++;
    }
  }

  // Add the last field
  result.push(current.trim());

  return result;
}