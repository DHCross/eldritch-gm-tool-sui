// src/components/GmQuickGuide.tsx
'use client';

import React from 'react';

const GmQuickGuide = () => {
  return (
    <div className="bg-charcoal-violet/50 border border-gray-800 rounded-lg shadow-inner p-6 mb-8 font-sans">
      <h2 className="text-3xl font-bold mb-6 text-center text-off-white border-b-2 border-muted-eldritch-green/30 pb-2">GM Screen: Combat Quick Reference</h2>

      {/* Core Combat Mechanics & Initiative */}
      <div className="mb-8 p-6 bg-[var(--panel)] border border-gray-800 rounded-xl shadow-md transition-shadow duration-300 hover:shadow-lg">
        <h3 className="text-2xl font-bold mb-3 text-off-white">I. Core Combat Mechanics & Initiative</h3>
        <p className="mb-4 text-off-white/80">Combat is divided into 10-second rounds, with actions taking place across five Battle Phases. Initiative is primarily determined by the Prowess ability rank.</p>

        <h4 className="text-xl font-semibold mb-2 text-muted-eldritch-green">Table 1.1: Battle Phase & Movement</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-900/60">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Prowess Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Battle Phase</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Initiative Range</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Base Movement Rate (Yards/Round)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700 text-off-white/90">
              <tr className="hover:bg-gray-800/50"><td className="px-6 py-4">d12</td><td className="px-6 py-4">1 (Fastest)</td><td className="px-6 py-4">12+</td><td className="px-6 py-4">24 yards + Agility MV</td></tr>
              <tr className="bg-gray-800/30 hover:bg-gray-800/50"><td className="px-6 py-4">d10</td><td className="px-6 py-4">2</td><td className="px-6 py-4">9-11</td><td className="px-6 py-4">22 yards + Agility MV</td></tr>
              <tr className="hover:bg-gray-800/50"><td className="px-6 py-4">d8</td><td className="px-6 py-4">3</td><td className="px-6 py-4">7-8</td><td className="px-6 py-4">20 yards + Agility MV</td></tr>
              <tr className="bg-gray-800/30 hover:bg-gray-800/50"><td className="px-6 py-4">d6</td><td className="px-6 py-4">4</td><td className="px-6 py-4">5-6</td><td className="px-6 py-4">18 yards + Agility MV</td></tr>
              <tr className="hover:bg-gray-800/50"><td className="px-6 py-4">d4</td><td className="px-6 py-4">5 (Slowest)</td><td className="px-6 py-4">1-4</td><td className="px-6 py-4">16 yards + Agility MV</td></tr>
            </tbody>
          </table>
        </div>
        <ul className="list-disc list-inside mt-4 space-y-1 text-off-white/80">
          <li><b className="text-soft-amethyst">Running:</b> Movement × 2 (Attack with a -3 penalty).</li>
          <li><b className="text-soft-amethyst">Sprinting:</b> Movement × 4 (No attack possible).</li>
          <li><b className="text-soft-amethyst">Initiative Modifiers:</b> Reaction (Agility focus) and Finesse (Melee/Precision focus) add static bonuses to the Prowess Score MV.</li>
          <li><b className="text-soft-amethyst">Surprise:</b> Simple surprise means defenders lose their first attack but keep their Active Defense Pool (ADP). Total surprise means they lose all actions and ADP in the first round.</li>
        </ul>

        <h4 className="text-xl font-semibold mt-6 mb-2 text-muted-eldritch-green">Table 1.2: Ability Ranks and Maximum Values (MV)</h4>
        <p className="mb-2 text-off-white/80">Defense Pools are calculated using the Maximum Value (MV) of each die rank.</p>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-900/60">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Die Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Max Value (MV)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Ability CP Cost</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Cumulative CP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700 text-off-white/90">
              <tr className="hover:bg-gray-800/50"><td className="px-6 py-4">d4</td><td className="px-6 py-4">4</td><td className="px-6 py-4">4</td><td className="px-6 py-4">4</td></tr>
              <tr className="bg-gray-800/30 hover:bg-gray-800/50"><td className="px-6 py-4">d6</td><td className="px-6 py-4">6</td><td className="px-6 py-4">6</td><td className="px-6 py-4">10</td></tr>
              <tr className="hover:bg-gray-800/50"><td className="px-6 py-4">d8</td><td className="px-6 py-4">8</td><td className="px-6 py-4">8</td><td className="px-6 py-4">18</td></tr>
              <tr className="bg-gray-800/30 hover:bg-gray-800/50"><td className="px-6 py-4">d10</td><td className="px-6 py-4">10</td><td className="px-6 py-4">10</td><td className="px-6 py-4">28</td></tr>
              <tr className="hover:bg-gray-800/50"><td className="px-6 py-4">d12</td><td className="px-6 py-4">12</td><td className="px-6 py-4">12</td><td className="px-6 py-4">40</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Attack, Defense, and Damage Mitigation */}
      <div className="mb-8 p-6 bg-[var(--panel)] border border-gray-800 rounded-xl shadow-md transition-shadow duration-300 hover:shadow-lg">
        <h3 className="text-2xl font-bold mb-3 text-off-white">II. Attack, Defense, and Damage Mitigation</h3>

        <h4 className="text-xl font-semibold mb-2 text-muted-eldritch-green">Table 2.1: Harm Calculation and Attack Formulas</h4>
        <p className="mb-2 text-off-white/80">Attacks determine Threat Points (Potential Harm) using the relevant ability branch; there is no &quot;to-hit&quot; roll.</p>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-900/60">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Attack Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Ability Branch Roll</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Focus Bonuses (Applied)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700 text-off-white/90">
              <tr className="hover:bg-gray-800/50"><td className="px-6 py-4">Melee Attack</td><td className="px-6 py-4">Prowess → Melee</td><td className="px-6 py-4">Threat focus.</td></tr>
              <tr className="bg-gray-800/30 hover:bg-gray-800/50"><td className="px-6 py-4">Ranged Attack</td><td className="px-6 py-4">Prowess → Precision</td><td className="px-6 py-4">Ranged Threat focus.</td></tr>
              <tr className="hover:bg-gray-800/50"><td className="px-6 py-4">Magic Attack</td><td className="px-6 py-4">Competence → Expertise</td><td className="px-6 py-4">Wizardry or Theurgy focus.</td></tr>
              <tr className="bg-gray-800/30 hover:bg-gray-800/50"><td className="px-6 py-4">Iconic Weapon Bonus</td><td className="px-6 py-4">Added to the base attack roll</td><td className="px-6 py-4">+1 Threat Point per Character Level.</td></tr>
              <tr className="hover:bg-gray-800/50"><td className="px-6 py-4">Damage Type Focus</td><td className="px-6 py-4">Added with Iconic Weapon</td><td className="px-6 py-4">Might (Crushing), Ferocity (Slashing), Speed (Impaling).</td></tr>
            </tbody>
          </table>
        </div>

        <h4 className="text-xl font-semibold mt-6 mb-2 text-muted-eldritch-green">Table 2.2: Defense Pool Formulas (Hit Points)</h4>
        <p className="mb-2 text-off-white/80">Defense Pools are calculated from the Maximum Values (MV) of basic abilities and specialties.</p>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-900/60">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Defense Pool</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Calculation Formula (MV Sum)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Recovery Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700 text-off-white/90">
              <tr className="hover:bg-gray-800/50"><td className="px-6 py-4">Active Defense Pool (ADP)</td><td className="px-6 py-4">Prowess MV + Agility MV + Melee MV</td><td className="px-6 py-4">100% refreshed after combat ends (approx. 1 minute).</td></tr>
              <tr className="bg-gray-800/30 hover:bg-gray-800/50"><td className="px-6 py-4">Passive Defense Pool (PDP)</td><td className="px-6 py-4">Fortitude MV + Endurance MV + Strength MV</td><td className="px-6 py-4">1 HP per day (or 2 HP per day with total bed rest).</td></tr>
              <tr className="hover:bg-gray-800/50"><td className="px-6 py-4">Spirit Points (SP)</td><td className="px-6 py-4">Competence MV + Willpower MV</td><td className="px-6 py-4">100% refreshed after safely escaping threat.</td></tr>
            </tbody>
          </table>
        </div>

        <h4 className="text-xl font-semibold mt-6 mb-2 text-muted-eldritch-green">Table 2.3: Order of Defenses & Damage Reduction (DR)</h4>
        <p className="mb-2 text-off-white/80">Threat Points are mitigated in a specific order:</p>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-900/60">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Defense Layer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Mitigation Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Mechanic</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700 text-off-white/90">
              <tr className="hover:bg-gray-800/50"><td className="px-6 py-4">1. Shield</td><td className="px-6 py-4">Fixed Reduction</td><td className="px-6 py-4">Deducts fixed Threat Points (1-3) from attack. Applies only if ADP &gt; 0.</td></tr>
              <tr className="bg-gray-800/30 hover:bg-gray-800/50"><td className="px-6 py-4">2. Active Defense</td><td className="px-6 py-4">Ablative HP</td><td className="px-6 py-4">Remaining Threat Points deplete ADP.</td></tr>
              <tr className="hover:bg-gray-800/50"><td className="px-6 py-4">3. Armor</td><td className="px-6 py-4">DR Die Roll</td><td className="px-6 py-4">If ADP depleted, Armor rolls its die rank to reduce remaining Threat Points.</td></tr>
              <tr className="bg-gray-800/30 hover:bg-gray-800/50"><td className="px-6 py-4">4. Passive Defense</td><td className="px-6 py-4">Ablative HP</td><td className="px-6 py-4">Remaining Threat Points deplete PDP. Character is Unconscious at 0 PDP.</td></tr>
            </tbody>
          </table>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-900/60">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Armor Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">DR Die Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Shield Size</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Threat Negated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700 text-off-white/90">
              <tr className="hover:bg-gray-800/50"><td className="px-6 py-4">Hide Armor</td><td className="px-6 py-4">d4</td><td className="px-6 py-4">Small Shield</td><td className="px-6 py-4">1 point</td></tr>
              <tr className="bg-gray-800/30 hover:bg-gray-800/50"><td className="px-6 py-4">Leather Armor</td><td className="px-6 py-4">d6</td><td className="px-6 py-4">Medium Shield</td><td className="px-6 py-4">2 points</td></tr>
              <tr className="hover:bg-gray-800/50"><td className="px-6 py-4">Chain Mail</td><td className="px-6 py-4">d8</td><td className="px-6 py-4">Large Shield</td><td className="px-6 py-4">3 points</td></tr>
              <tr className="bg-gray-800/30 hover:bg-gray-800/50"><td className="px-6 py-4">Plate Mail</td><td className="px-6 py-4">d10</td><td className="px-6 py-4"></td><td className="px-6 py-4"></td></tr>
              <tr className="hover:bg-gray-800/50"><td className="px-6 py-4">Magic Armor</td><td className="px-6 py-4">d12</td><td className="px-6 py-4"></td><td className="px-6 py-4"></td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Special Combat & Magic Rules */}
      <div className="mb-8 p-6 bg-[var(--panel)] border border-gray-800 rounded-xl shadow-md transition-shadow duration-300 hover:shadow-lg">
        <h3 className="text-2xl font-bold mb-3 text-off-white">III. Special Combat & Magic Rules</h3>

        <h4 className="text-xl font-semibold mb-2 text-muted-eldritch-green">Table 3.1: Defense Negation Costs</h4>
        <p className="mb-2 text-off-white/80">Defense Negation allows feats and spells to bypass normal defensive layers. Requires a successful challenge roll against the defense&apos;s die rank plus the SP cost listed below.</p>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-900/60">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Defense Negated</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Challenge Die</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Spirit Point (SP) Cost</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Mastery Die Requirement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700 text-off-white/90">
              <tr className="hover:bg-gray-800/50"><td className="px-6 py-4">Bypass Active Defense</td><td className="px-6 py-4">d12</td><td className="px-6 py-4">5 SP</td><td className="px-6 py-4">1 Mastery Die must be expended</td></tr>
              <tr className="bg-gray-800/30 hover:bg-gray-800/50"><td className="px-6 py-4">Bypass Armor</td><td className="px-6 py-4">Equal to Armor Die Rank (d4 to d12)</td><td className="px-6 py-4">1 SP per Die Rank (1 to 5 SP)</td><td className="px-6 py-4">Optional (Feat-dependent)</td></tr>
              <tr className="hover:bg-gray-800/50"><td className="px-6 py-4">Bypass Small Shield</td><td className="px-6 py-4">d8</td><td className="px-6 py-4">3 SP</td><td className="px-6 py-4">Optional (Feat-dependent)</td></tr>
              <tr className="bg-gray-800/30 hover:bg-gray-800/50"><td className="px-6 py-4">Bypass Medium Shield</td><td className="px-6 py-4">d10</td><td className="px-6 py-4">4 SP</td><td className="px-6 py-4">Optional (Feat-dependent)</td></tr>
              <tr className="hover:bg-gray-800/50"><td className="px-6 py-4">Bypass Large Shield</td><td className="px-6 py-4">d12</td><td className="px-6 py-4">5 SP</td><td className="px-6 py-4">Optional (Feat-dependent)</td></tr>
            </tbody>
          </table>
        </div>

        <h4 className="text-xl font-semibold mt-6 mb-2 text-muted-eldritch-green">Table 3.2: Mastery Die and Spirit Point Usage</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-900/60">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Function</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Mechanic</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Cost/Limit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700 text-off-white/90">
              <tr className="hover:bg-gray-800/50"><td className="px-6 py-4">Mastery Die Uses</td><td className="px-6 py-4">Added to ability test/attack roll (Mastery d4 up to d12).</td><td className="px-6 py-4">Level 1 (2/day), Level 5 (10/day).</td></tr>
              <tr className="bg-gray-800/30 hover:bg-gray-800/50"><td className="px-6 py-4">Master Twist</td><td className="px-6 py-4">Mastery Die rolls minimum value (1) with an Iconic Attack.</td><td className="px-6 py-4">Re-roll MD and add result to total threat.</td></tr>
              <tr className="hover:bg-gray-800/50"><td className="px-6 py-4">Surge (Mastery)</td><td className="px-6 py-4">Gain an extra Mastery Die use after daily slots are exhausted.</td><td className="px-6 py-4">Spend SP equal to Mastery Die MV (4 to 12 SP).</td></tr>
              <tr className="bg-gray-800/30 hover:bg-gray-800/50"><td className="px-6 py-4">Inspiration</td><td className="px-6 py-4">Add bonus to ability, feat, spell, or attack roll.</td><td className="px-6 py-4">4 SP per +1 bonus.</td></tr>
              <tr className="hover:bg-gray-800/50"><td className="px-6 py-4">Quickening</td><td className="px-6 py-4">Cast a spell instantly, bypassing the ability test.</td><td className="px-6 py-4">SP cost = MV of Challenge Die + 1 SP per additional effect.</td></tr>
              <tr className="bg-gray-800/30 hover:bg-gray-800/50"><td className="px-6 py-4">Spiritual Smite</td><td className="px-6 py-4">Augments physical attack with spiritual energy (+3 to +5 threat).</td><td className="px-6 py-4">8-12 SP base cost; +2 SP per additional +1 threat (up to +10 total).</td></tr>
            </tbody>
          </table>
        </div>

        <h4 className="text-xl font-semibold mt-6 mb-2 text-muted-eldritch-green">Table 3.3: Magic Attack Visual Manifestations (Core Paths)</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-900/60">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Magic Path</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Spell or Effect</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Key Visual Elements (Manifestation)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700 text-off-white/90">
              <tr className="hover:bg-gray-800/50"><td className="px-6 py-4">Default</td><td className="px-6 py-4">Eldritch Bolt</td><td className="px-6 py-4">A visible, physical bolt or continuous stream of glowing, potent substance.</td></tr>
              <tr className="bg-gray-800/30 hover:bg-gray-800/50"><td className="px-6 py-4">Elementalism</td><td className="px-6 py-4">Elemental Bolt/Shield</td><td className="px-6 py-4">A globular bolt of blazing fire, crackling electricity, or solid earth. Hard shell of earth or wall of flame barrier.</td></tr>
              <tr className="hover:bg-gray-800/50"><td className="px-6 py-4">Thaumaturgy</td><td className="px-6 py-4">Arcane Bolt/Assault</td><td className="px-6 py-4">An unpredictable sphere of energy zigzags forward, warping reality with erratic movements.</td></tr>
              <tr className="bg-gray-800/30 hover:bg-gray-800/50"><td className="px-6 py-4">Sorcery</td><td className="px-6 py-4">Chaos Assault</td><td className="px-6 py-4">A dark, swirling sphere of malevolent energy, surrounded by an aura of shadows, leaving an eerie trail.</td></tr>
              <tr className="hover:bg-gray-800/50"><td className="px-6 py-4">Hieraticism</td><td className="px-6 py-4">Divine Bolt/Armor</td><td className="px-6 py-4">A radiant sphere of holy light, radiating divine brilliance, accompanied by a low, humming sound. Manifests as celestial armor.</td></tr>
              <tr className="bg-gray-800/30 hover:bg-gray-800/50"><td className="px-6 py-4">Mysticism</td><td className="px-6 py-4">Mystic Bolt/Shield</td><td className="px-6 py-4">A swirling orb of telekinetic force, pulsating with power, pulling nearby objects into its chaotic field of debris.</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Opponent Stats and Templates */}
      <div className="p-6 bg-[var(--panel)] border border-gray-800 rounded-xl shadow-md transition-shadow duration-300 hover:shadow-lg">
        <h3 className="text-2xl font-bold mb-3 text-off-white">IV. Quick Opponent Stats and Templates</h3>

        <h4 className="text-xl font-semibold mb-2 text-muted-eldritch-green">Table 4.1: Creature Categories and Threat Dice (TD)</h4>
        <p className="mb-2 text-off-white/80">Creatures are categorized by the number of attack dice in their highest Threat Dice (TD) category.</p>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-900/60">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Creature Category (TY)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Attack Dice (TD) Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">MV Calculation Basis</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Example HP Multiplier (Size/Nature)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700 text-off-white/90">
              <tr className="hover:bg-gray-800/50"><td className="px-6 py-4">Minor (Weak)</td><td className="px-6 py-4">Single attack die (1d)</td><td className="px-6 py-4">MV of Highest TD</td><td className="px-6 py-4">Mundane/Medium: x1.0; Magical: x1.5</td></tr>
              <tr className="bg-gray-800/30 hover:bg-gray-800/50"><td className="px-6 py-4">Standard (Average)</td><td className="px-6 py-4">Up to 2 attack dice (2d)</td><td className="px-6 py-4">MV of Highest TD</td><td className="px-6 py-4">Preternatural/Medium: x2.0; Supernatural: x2.5</td></tr>
              <tr className="hover:bg-gray-800/50"><td className="px-6 py-4">Exceptional (Tough)</td><td className="px-6 py-4">Up to 3 attack dice (3d)</td><td className="px-6 py-4">MV of Highest TD</td><td className="px-6 py-4">Supernatural/Huge: x3.5; Gargantuan: x4.0</td></tr>
              <tr className="bg-gray-800/30 hover:bg-gray-800/50"><td className="px-6 py-4">Legendary</td><td className="px-6 py-4">3+ attack dice</td><td className="px-6 py-4">MV of Highest TD</td><td className="px-6 py-4">Can exceed d12 ranks (d14, d16, d20).</td></tr>
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-sm text-off-white/60 italic"><b>Quick Stat Block (QSB) Fields:</b> TY (Type), TD (Threat Dice: Melee, Natural, Ranged, Arcane), EA (Extra Attacks), HP (Hit Points, Active/Passive split), DR (Damage Reduction), ST (Saving Throw), BP (Battle Phase/Initiative).</p>

        <h4 className="text-xl font-semibold mt-6 mb-2 text-muted-eldritch-green">Table 4.2: Challenge & Saving Throw Difficulty</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-900/60">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Challenge Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Base Die (GM Rolls)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Disadvantage Roll</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Applicable Saving Throw Ranks (Creatures)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700 text-off-white/90">
              <tr className="hover:bg-gray-800/50"><td className="px-6 py-4">Easy</td><td className="px-6 py-4">d4</td><td className="px-6 py-4">2d4</td><td className="px-6 py-4">Minor creatures (d4)</td></tr>
              <tr className="bg-gray-800/30 hover:bg-gray-800/50"><td className="px-6 py-4">Moderate</td><td className="px-6 py-4">d6</td><td className="px-6 py-4">2d6</td><td className="px-6 py-4">Standard creatures (d6)</td></tr>
              <tr className="hover:bg-gray-800/50"><td className="px-6 py-4">Difficult</td><td className="px-6 py-4">d8</td><td className="px-6 py-4">2d8</td><td className="px-6 py-4">Exceptional creatures (d8-d12)</td></tr>
              <tr className="bg-gray-800/30 hover:bg-gray-800/50"><td className="px-6 py-4">Demanding</td><td className="px-6 py-4">d10</td><td className="px-6 py-4">2d10</td><td className="px-6 py-4">Legendary creatures (d14-d20+)</td></tr>
              <tr className="hover:bg-gray-800/50"><td className="px-6 py-4">Formidable</td><td className="px-6 py-4">d12</td><td className="px-6 py-4">2d12</td><td className="px-6 py-4">Legendary creatures (d14-d20+)</td></tr>
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-sm text-off-white/60 italic"><b>Saving Throw Types:</b> Cognitive Save (mental manipulation), Skillful Save (evasion/agility), Valorous Save (fortitude/resistance).</p>
      </div>
    </div>
  );
};

export default GmQuickGuide;
