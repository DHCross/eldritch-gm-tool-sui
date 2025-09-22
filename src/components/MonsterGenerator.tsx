'use client';

import { useState } from 'react';

interface MonsterCalculatorResult {
  hitPoints: number;
  threatLevel: string;
  totalThreatMV: number;
}

export default function MonsterGenerator() {
  const [monsterNature, setMonsterNature] = useState('1'); // Mundane
  const [monsterSize, setMonsterSize] = useState('1'); // Small or Medium
  const [tier1Threat, setTier1Threat] = useState('4'); // d4
  const [tier2Threat, setTier2Threat] = useState('0'); // None
  const [tier3Threat, setTier3Threat] = useState('0'); // None
  const [monsterArmor, setMonsterArmor] = useState('0'); // None
  const [result, setResult] = useState<MonsterCalculatorResult | null>(null);

  const monsterNatures = [
    { value: '1', label: 'Mundane' },
    { value: '2', label: 'Magical' },
    { value: '3', label: 'Preternatural' },
    { value: '4', label: 'Supernatural' }
  ];

  const monsterSizes = [
    { value: '0', label: 'Minuscule or Tiny' },
    { value: '1', label: 'Small or Medium' },
    { value: '2', label: 'Large' },
    { value: '3', label: 'Huge' },
    { value: '4', label: 'Gargantuan' }
  ];

  const threatDice = [
    { value: '0', label: 'None' },
    { value: '4', label: 'd4' },
    { value: '6', label: 'd6' },
    { value: '8', label: 'd8' },
    { value: '10', label: 'd10' },
    { value: '12', label: 'd12' },
    { value: '14', label: 'd14' },
    { value: '16', label: 'd16' },
    { value: '18', label: 'd18' },
    { value: '20', label: 'd20' }
  ];

  const armorTypes = [
    { value: '0', label: 'None' },
    { value: '2', label: 'Hide' },
    { value: '3', label: 'Leather' },
    { value: '4', label: 'Chain' },
    { value: '5', label: 'Plate' },
    { value: '6', label: 'Magical' }
  ];

  function calculateHitPoints(
    threatMinor: number,
    threatStandard: number,
    threatExceptional: number,
    creatureSize: number,
    creatureNature: number,
    armorBonus: number
  ): number {
    const sizeModifier = parseFloat(creatureSize.toString());
    const natureModifier = parseFloat(creatureNature.toString());

    const totalModifier = (sizeModifier + natureModifier) / 2;
    const totalHitPoints = threatMinor + threatStandard + threatExceptional;
    let finalHitPoints = Math.ceil(totalHitPoints * totalModifier);

    finalHitPoints += armorBonus; // Add armor bonus to final hit points

    return finalHitPoints;
  }

  function determineThreatLevel(minor: string, standard: string, exceptional: string): string {
    if (minor !== "0" && standard === "0" && exceptional === "0") {
      return "a Minor";
    } else if (standard === "0" && exceptional !== "0") {
      return "a Standard";
    } else if (standard !== "0" && exceptional === "0") {
      return "a Standard";
    } else if (standard === "0" && exceptional === "0") {
      return "a Minor";
    } else {
      return "an Exceptional";
    }
  }

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();

    const minor = parseInt(tier1Threat);
    const standard = parseInt(tier2Threat);
    const exceptional = parseInt(tier3Threat);
    const armorBonus = parseFloat(monsterArmor);

    const totalThreatMV = minor + standard + exceptional;
    const threatLevel = determineThreatLevel(tier1Threat, tier2Threat, tier3Threat);

    const hitPoints = calculateHitPoints(
      minor,
      standard,
      exceptional,
      parseFloat(monsterSize),
      parseFloat(monsterNature),
      armorBonus
    );

    setResult({
      hitPoints,
      threatLevel,
      totalThreatMV
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Eldritch RPG Monster HP Calculator
        </h1>
        <p className="text-gray-600">
          Calculate monster hit points based on threat tiers, size, nature, and armor
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <form onSubmit={handleCalculate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Monster Nature */}
            <div>
              <label htmlFor="monsterNature" className="block text-sm font-medium text-gray-700 mb-2">
                Monster Nature:
              </label>
              <select
                id="monsterNature"
                value={monsterNature}
                onChange={(e) => setMonsterNature(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-center"
              >
                {monsterNatures.map(nature => (
                  <option key={nature.value} value={nature.value}>{nature.label}</option>
                ))}
              </select>
            </div>

            {/* Monster Size */}
            <div>
              <label htmlFor="monsterSize" className="block text-sm font-medium text-gray-700 mb-2">
                Monster Size:
              </label>
              <select
                id="monsterSize"
                value={monsterSize}
                onChange={(e) => setMonsterSize(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-center"
              >
                {monsterSizes.map(size => (
                  <option key={size.value} value={size.value}>{size.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Threat Tier 1 */}
            <div>
              <label htmlFor="tier1Threat" className="block text-sm font-medium text-gray-700 mb-2">
                Threat Tier 1 (MV):
              </label>
              <select
                id="tier1Threat"
                value={tier1Threat}
                onChange={(e) => setTier1Threat(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-center"
              >
                {threatDice.filter(die => die.value !== '0').map(die => (
                  <option key={die.value} value={die.value}>{die.label}</option>
                ))}
              </select>
            </div>

            {/* Threat Tier 2 */}
            <div>
              <label htmlFor="tier2Threat" className="block text-sm font-medium text-gray-700 mb-2">
                Threat Tier 2 (MV):
              </label>
              <select
                id="tier2Threat"
                value={tier2Threat}
                onChange={(e) => setTier2Threat(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-center"
              >
                {threatDice.map(die => (
                  <option key={die.value} value={die.value}>{die.label}</option>
                ))}
              </select>
            </div>

            {/* Threat Tier 3 */}
            <div>
              <label htmlFor="tier3Threat" className="block text-sm font-medium text-gray-700 mb-2">
                Threat Tier 3 (MV):
              </label>
              <select
                id="tier3Threat"
                value={tier3Threat}
                onChange={(e) => setTier3Threat(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-center"
              >
                {threatDice.map(die => (
                  <option key={die.value} value={die.value}>{die.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Monster Armor */}
          <div>
            <label htmlFor="monsterArmor" className="block text-sm font-medium text-gray-700 mb-2">
              Monster Armor:
            </label>
            <select
              id="monsterArmor"
              value={monsterArmor}
              onChange={(e) => setMonsterArmor(e.target.value)}
              className="w-full md:w-1/2 rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-center"
            >
              {armorTypes.map(armor => (
                <option key={armor.value} value={armor.value}>{armor.label}</option>
              ))}
            </select>
          </div>

          <div className="text-center">
            <button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Calculate Hit Points
            </button>
          </div>
        </form>
      </div>

      {/* Results */}
      {result && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Calculation Results</h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="text-3xl font-bold text-red-600 mb-2">
                {result.hitPoints} Hit Points
              </div>
              <div className="text-lg text-gray-700">
                This creature is <strong>{result.threatLevel}</strong> threat (MV {result.totalThreatMV}).
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Additional Notes */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Calculation Notes</h3>
        <div className="text-sm text-gray-700 space-y-2">
          <p><strong>Size and Nature Modifier:</strong> (Size Value + Nature Value) ÷ 2</p>
          <p><strong>Base Hit Points:</strong> Tier 1 + Tier 2 + Tier 3 threat dice values</p>
          <p><strong>Final Hit Points:</strong> Ceil(Base HP × Modifier) + Armor Bonus</p>
        </div>
      </div>

      {/* Attack Type Selector (from legacy) */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Primary Attack Type</h3>
        <select className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-center">
          <option>Melee attack is highest potential harm</option>
          <option>Natural weapons is highest potential harm</option>
          <option>Ranged attack is highest potential harm</option>
          <option>Arcane attack is highest potential harm</option>
        </select>
        <p className="text-sm text-gray-500 mt-2">
          This selection helps you determine which attack type should be the monster&apos;s primary threat.
        </p>
      </div>
    </div>
  );
}