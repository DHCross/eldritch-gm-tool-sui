// src/components/GmQuickGuide.tsx
'use client';

import React from 'react';

const GmQuickGuide = () => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-bold mb-4">GM Quick Guide</h2>

      {/* Ability Ranks, Costs, and Core Defense Formulas */}
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-2">I. Ability Ranks, Costs, and Core Defense Formulas</h3>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Die Rank</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max Value (MV)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CP Cost</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cumulative CP</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">d4</td>
              <td className="px-6 py-4 whitespace-nowrap">4</td>
              <td className="px-6 py-4 whitespace-nowrap">4</td>
              <td className="px-6 py-4 whitespace-nowrap">4</td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">d6</td>
              <td className="px-6 py-4 whitespace-nowrap">6</td>
              <td className="px-6 py-4 whitespace-nowrap">6</td>
              <td className="px-6 py-4 whitespace-nowrap">10</td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">d8</td>
              <td className="px-6 py-4 whitespace-nowrap">8</td>
              <td className="px-6 py-4 whitespace-nowrap">8</td>
              <td className="px-6 py-4 whitespace-nowrap">18</td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">d10</td>
              <td className="px-6 py-4 whitespace-nowrap">10</td>
              <td className="px-6 py-4 whitespace-nowrap">10</td>
              <td className="px-6 py-4 whitespace-nowrap">28</td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">d12</td>
              <td className="px-6 py-4 whitespace-nowrap">12</td>
              <td className="px-6 py-4 whitespace-nowrap">12</td>
              <td className="px-6 py-4 whitespace-nowrap">40</td>
            </tr>
          </tbody>
        </table>
        <p className="mt-2 text-gray-600"><b>MV Calculation:</b> The highest number the die can roll; MV underpins all defense pool formulas.</p>

        <h4 className="text-lg font-bold mt-4 mb-2">Defense Pool Formulas and Abilities</h4>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Defense Pool</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MV Formula</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialties</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">Active Defense Pool (ADP)</td>
              <td className="px-6 py-4 whitespace-nowrap">Prowess MV + Agility MV + Melee MV</td>
              <td className="px-6 py-4 whitespace-nowrap">Agility (Speed, Reaction); Melee (Threat, Finesse)</td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">Passive Defense Pool (PDP)</td>
              <td className="px-6 py-4 whitespace-nowrap">Fortitude MV + Endurance MV + Strength MV</td>
              <td className="px-6 py-4 whitespace-nowrap">Endurance (Vitality, Resilience); Strength (Ferocity, Might)</td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">Spirit Points (SP)</td>
              <td className="px-6 py-4 whitespace-nowrap">Competence MV + Willpower MV</td>
              <td className="px-6 py-4 whitespace-nowrap">Competence (Expertise, Perception); Willpower (Courage, Resistance)</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Armor, Shields, and Damage Reduction */}
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-2">II. Armor, Shields, and Damage Reduction</h3>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material/Class</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DR Die Rank</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">HP Bonus (Opt)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shield Threat Negation</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lore/Description</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">Hide</td>
              <td className="px-6 py-4 whitespace-nowrap">Tough Pelt</td>
              <td className="px-6 py-4 whitespace-nowrap">d4</td>
              <td className="px-6 py-4 whitespace-nowrap">+2 HP</td>
              <td className="px-6 py-4 whitespace-nowrap">N/A</td>
              <td className="px-6 py-4 whitespace-nowrap">Drakkin scaly hide</td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">Leather</td>
              <td className="px-6 py-4 whitespace-nowrap">Scaled/Pangolin</td>
              <td className="px-6 py-4 whitespace-nowrap">d6</td>
              <td className="px-6 py-4 whitespace-nowrap">+3 HP</td>
              <td className="px-6 py-4 whitespace-nowrap">N/A</td>
              <td className="px-6 py-4 whitespace-nowrap">Gweithraul tough skin</td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">Chain Mail</td>
              <td className="px-6 py-4 whitespace-nowrap">Carapace or Rings</td>
              <td className="px-6 py-4 whitespace-nowrap">d8</td>
              <td className="px-6 py-4 whitespace-nowrap">+4 HP</td>
              <td className="px-6 py-4 whitespace-nowrap">N/A</td>
              <td className="px-6 py-4 whitespace-nowrap">Wrhydri Chain (dwarf-forged)</td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">Plate Mail</td>
              <td className="px-6 py-4 whitespace-nowrap">Exoskeleton/Steel</td>
              <td className="px-6 py-4 whitespace-nowrap">d10</td>
              <td className="px-6 py-4 whitespace-nowrap">+5 HP</td>
              <td className="px-6 py-4 whitespace-nowrap">N/A</td>
              <td className="px-6 py-4 whitespace-nowrap">Invictus Plate</td>
            </tr>
            <tr>
                <td className="px-6 py-4 whitespace-nowrap">Magical Armor</td>
                <td className="px-6 py-4 whitespace-nowrap">Mithral/Adamantine</td>
                <td className="px-6 py-4 whitespace-nowrap">d12</td>
                <td className="px-6 py-4 whitespace-nowrap">+6 HP</td>
                <td className="px-6 py-4 whitespace-nowrap">N/A</td>
                <td className="px-6 py-4 whitespace-nowrap">Hledrith Armor (elven)</td>
            </tr>
            <tr>
                <td className="px-6 py-4 whitespace-nowrap">Shield (Small)</td>
                <td className="px-6 py-4 whitespace-nowrap">Forearm guard</td>
                <td className="px-6 py-4 whitespace-nowrap">N/A</td>
                <td className="px-6 py-4 whitespace-nowrap">N/A</td>
                <td className="px-6 py-4 whitespace-nowrap">-1 Threat Point</td>
                <td className="px-6 py-4 whitespace-nowrap">Anoth Shield (dwarven)</td>
            </tr>
            <tr>
                <td className="px-6 py-4 whitespace-nowrap">Shield (Medium)</td>
                <td className="px-6 py-4 whitespace-nowrap">Wood/bone piece</td>
                <td className="px-6 py-4 whitespace-nowrap">N/A</td>
                <td className="px-6 py-4 whitespace-nowrap">N/A</td>
                <td className="px-6 py-4 whitespace-nowrap">-2 Threat Points</td>
                <td className="px-6 py-4 whitespace-nowrap">Goedenhud Shield (druidic)</td>
            </tr>
            <tr>
                <td className="px-6 py-4 whitespace-nowrap">Shield (Large)</td>
                <td className="px-6 py-4 whitespace-nowrap">Elemental barrier</td>
                <td className="px-6 py-4 whitespace-nowrap">N/A</td>
                <td className="px-6 py-4 whitespace-nowrap">N/A</td>
                <td className="px-6 py-4 whitespace-nowrap">-3 Threat Points</td>
                <td className="px-6 py-4 whitespace-nowrap">Tylwyth Shield (fairy magic)</td>
            </tr>
          </tbody>
        </table>
      </div>

        {/* Magic Item Rarity, Costs, and Potency */}
        <div className="mb-8">
        <h3 className="text-xl font-bold mb-2">III. Magic Item Rarity, Costs, and Potency</h3>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rarity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MV Range</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">EP (Energy Points)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes / Examples</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">Common</td>
              <td className="px-6 py-4 whitespace-nowrap">1d4 (±1)</td>
              <td className="px-6 py-4 whitespace-nowrap">4 rounds</td>
              <td className="px-6 py-4 whitespace-nowrap">8 EP</td>
              <td className="px-6 py-4 whitespace-nowrap">Replaces “Archetypal”</td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">Uncommon</td>
              <td className="px-6 py-4 whitespace-nowrap">1d6 (±2)</td>
              <td className="px-6 py-4 whitespace-nowrap">6 rounds</td>
              <td className="px-6 py-4 whitespace-nowrap">12 EP</td>
              <td className="px-6 py-4 whitespace-nowrap">Staff of Elemental Threat</td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">Esoteric</td>
              <td className="px-6 py-4 whitespace-nowrap">1d8 (±3)</td>
              <td className="px-6 py-4 whitespace-nowrap">8 rounds</td>
              <td className="px-6 py-4 whitespace-nowrap">16 EP</td>
              <td className="px-6 py-4 whitespace-nowrap">Potion of Quickness</td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">Occult</td>
              <td className="px-6 py-4 whitespace-nowrap">1d10 (±4)</td>
              <td className="px-6 py-4 whitespace-nowrap">10 rounds</td>
              <td className="px-6 py-4 whitespace-nowrap">20 EP</td>
              <td className="px-6 py-4 whitespace-nowrap">Liquid Armor</td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">Legendary</td>
              <td className="px-6 py-4 whitespace-nowrap">1d12 (±5)</td>
              <td className="px-6 py-4 whitespace-nowrap">12 rounds</td>
              <td className="px-6 py-4 whitespace-nowrap">30 EP</td>
              <td className="px-6 py-4 whitespace-nowrap">Rod of Transmutation</td>
            </tr>
          </tbody>
        </table>
        <p className="mt-2 text-gray-600"><b>Magic Cost:</b> 1 Effect: 1 EP, Area: 2 EP, Multi Effect (Single): 3 EP, Multi Effect (Multiple): 4 EP</p>
      </div>

    {/* Creature/NPC Quick Stat Block (QSB) Generation */}
    <div className="mb-8">
        <h3 className="text-xl font-bold mb-2">IV. Creature/NPC Quick Stat Block (QSB) Generation</h3>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Threat Dice (TD)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MV Basis</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">HP Multiplier</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sample Ranks</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">Minor</td>
              <td className="px-6 py-4 whitespace-nowrap">1dX</td>
              <td className="px-6 py-4 whitespace-nowrap">MV of TD</td>
              <td className="px-6 py-4 whitespace-nowrap">x1 Mundane/small, x1.5 magical</td>
              <td className="px-6 py-4 whitespace-nowrap">d4 Bandit, d6 Goblin</td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">Standard</td>
              <td className="px-6 py-4 whitespace-nowrap">Up to 2dX</td>
              <td className="px-6 py-4 whitespace-nowrap">MV of TD</td>
              <td className="px-6 py-4 whitespace-nowrap">x1 Mundane, x2 Preternat.</td>
              <td className="px-6 py-4 whitespace-nowrap">2d6 Guard, 2d8 Orc</td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">Exceptional</td>
              <td className="px-6 py-4 whitespace-nowrap">Up to 3dX</td>
              <td className="px-6 py-4 whitespace-nowrap">MV of TD</td>
              <td className="px-6 py-4 whitespace-nowrap">x1.5-2.5 Magical</td>
              <td className="px-6 py-4 whitespace-nowrap">3d8 Wizard, 3d12 Giant</td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">Legendary</td>
              <td className="px-6 py-4 whitespace-nowrap">3+dX</td>
              <td className="px-6 py-4 whitespace-nowrap">MV of TD</td>
              <td className="px-6 py-4 whitespace-nowrap">x2.5-4 Supernat.</td>
              <td className="px-6 py-4 whitespace-nowrap">3d16 Demon, 3d12 Vampire</td>
            </tr>
          </tbody>
        </table>
        <p className="mt-2 text-gray-600"><b>QSB Structure:</b> HP = MV × Size/Nature multiplier, split (Active/Passive) as needed.</p>
    </div>

    {/* Enhanced NPC Generator Template */}
    <div className="mb-8">
        <h3 className="text-xl font-bold mb-2">V. Enhanced NPC Generator Template</h3>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Key</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CP Range</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ability Dice</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Focuses (Total)</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">A</td>
              <td className="px-6 py-4 whitespace-nowrap">30-100</td>
              <td className="px-6 py-4 whitespace-nowrap">d4 + 3d4</td>
              <td className="px-6 py-4 whitespace-nowrap">(0)</td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">B</td>
              <td className="px-6 py-4 whitespace-nowrap">101-199</td>
              <td className="px-6 py-4 whitespace-nowrap">d6 + 3d6</td>
              <td className="px-6 py-4 whitespace-nowrap">+1</td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">C</td>
              <td className="px-6 py-4 whitespace-nowrap">200-299</td>
              <td className="px-6 py-4 whitespace-nowrap">d8 + 3d8</td>
              <td className="px-6 py-4 whitespace-nowrap">+3 total</td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">D</td>
              <td className="px-6 py-4 whitespace-nowrap">300-399</td>
              <td className="px-6 py-4 whitespace-nowrap">d10 + 3d10</td>
              <td className="px-6 py-4 whitespace-nowrap">6 (4x+1, 2x+2)</td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">E</td>
              <td className="px-6 py-4 whitespace-nowrap">400-500+</td>
              <td className="px-6 py-4 whitespace-nowrap">d12 + 3d12</td>
              <td className="px-6 py-4 whitespace-nowrap">6 (3x+2, 3x+3)</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GmQuickGuide;
