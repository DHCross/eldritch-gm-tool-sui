'use client';

import { useState } from 'react';
import {
  Combatant,
  BattleState,
  CombatantCategory,
  WeaponReach,
  NPCLevel,
  QSBClassification,
  RevitalizeOption,
  npcDefaults,
  qsbDefaults,
  prowessDieOptions,
  weaponReachOptions,
  combatantRoles,
  armorTypes,
  revitalizeOptions
} from '../data/battleData';
import {
  sortCombatants,
  applyThreat,
  performRevitalize,
  createCombatant,
  restoreAllADP,
  clearHostileCombatants,
  exportBattleToMarkdown
} from '../utils/battleUtils';

export default function BattleCalculator() {
  const [battleState, setBattleState] = useState<BattleState>({
    combatants: [],
    defeatedCombatants: [],
    autoRollEnabled: false,
    round: 1
  });

  const [newCombatant, setNewCombatant] = useState({
    category: 'pa' as CombatantCategory,
    name: '',
    prowessDie: 6,
    weaponReach: 'medium' as WeaponReach,
    role: 'Ally',
    level: '1' as NPCLevel,
    classification: 'Standard' as QSBClassification,
    customADP: '',
    customPDP: '',
    armor: '0',
    shield: 0,
    reactionFocus: 0,
    spiritPoints: 0,
    npcDetail: ''
  });

  const [threatInputs, setThreatInputs] = useState<Record<number, string>>({});
  const [armorRolls, setArmorRolls] = useState<Record<number, string>>({});
  const [showRevitalize, setShowRevitalize] = useState<Record<number, boolean>>({});
  const [spInputs, setSPInputs] = useState<Record<number, string>>({});

  const addCombatant = () => {
    if (!newCombatant.name.trim()) {
      alert('Please enter a combatant name.');
      return;
    }

    const combatant = createCombatant(
      newCombatant.category,
      newCombatant.name,
      newCombatant.prowessDie,
      newCombatant.weaponReach,
      newCombatant.role,
      newCombatant.level,
      newCombatant.classification,
      newCombatant.customADP ? parseInt(newCombatant.customADP) : undefined,
      newCombatant.customPDP ? parseInt(newCombatant.customPDP) : undefined,
      newCombatant.armor,
      newCombatant.shield,
      newCombatant.reactionFocus,
      newCombatant.spiritPoints,
      newCombatant.npcDetail
    );

    setBattleState(prev => ({
      ...prev,
      combatants: [...prev.combatants, combatant]
    }));

    // Reset form
    setNewCombatant({
      category: 'pa',
      name: '',
      prowessDie: 6,
      weaponReach: 'medium',
      role: 'Ally',
      level: '1',
      classification: 'Standard',
      customADP: '',
      customPDP: '',
      armor: '0',
      shield: 0,
      reactionFocus: 0,
      spiritPoints: 0,
      npcDetail: ''
    });
  };

  const removeCombatant = (id: number) => {
    setBattleState(prev => ({
      ...prev,
      combatants: prev.combatants.filter(c => c.id !== id)
    }));
  };

  const defeatCombatant = (id: number) => {
    const combatant = battleState.combatants.find(c => c.id === id);
    if (combatant) {
      setBattleState(prev => ({
        ...prev,
        combatants: prev.combatants.filter(c => c.id !== id),
        defeatedCombatants: [...prev.defeatedCombatants, combatant]
      }));
    }
  };

  const restoreCombatant = (id: number) => {
    const combatant = battleState.defeatedCombatants.find(c => c.id === id);
    if (combatant) {
      const restoredCombatant = { ...combatant, adp: 1, pdp: 1 };
      setBattleState(prev => ({
        ...prev,
        combatants: [...prev.combatants, restoredCombatant],
        defeatedCombatants: prev.defeatedCombatants.filter(c => c.id !== id)
      }));
    }
  };

  const handleApplyThreat = (id: number) => {
    const combatant = battleState.combatants.find(c => c.id === id);
    const threatPoints = parseInt(threatInputs[id]) || 0;

    if (!combatant || threatPoints <= 0) {
      alert('Please enter a valid number of Threat Points.');
      return;
    }

    const armorRoll = battleState.autoRollEnabled ? 0 : (parseInt(armorRolls[id]) || 0);
    const result = applyThreat(combatant, threatPoints, armorRoll, battleState.autoRollEnabled);

    setBattleState(prev => ({
      ...prev,
      combatants: prev.combatants.map(c => c.id === id ? result.combatant : c)
    }));

    if (result.armorRollResult !== undefined) {
      alert(`${combatant.name}'s armor rolled a ${result.armorRollResult} to mitigate threat.`);
    }

    if (result.defeated) {
      defeatCombatant(id);
    }

    // Clear inputs
    setThreatInputs(prev => ({ ...prev, [id]: '' }));
    setArmorRolls(prev => ({ ...prev, [id]: '' }));
  };

  const handleRevitalize = (id: number, option: RevitalizeOption) => {
    const combatant = battleState.combatants.find(c => c.id === id);
    if (!combatant) return;

    let spentSP: number | undefined;
    if (option === 'steadyRenewal') {
      spentSP = parseInt(spInputs[id]) || 0;
      if (spentSP > combatant.spiritPoints) {
        alert(`${combatant.name} does not have enough SP.`);
        return;
      }
    }

    const result = performRevitalize(combatant, option, spentSP);

    setBattleState(prev => ({
      ...prev,
      combatants: prev.combatants.map(c => c.id === id ? result.combatant : c)
    }));

    alert(result.message);

    if (result.success) {
      setShowRevitalize(prev => ({ ...prev, [id]: false }));
      setSPInputs(prev => ({ ...prev, [id]: '' }));
    }
  };

  const updateCombatantHP = (id: number, field: 'adp' | 'pdp', value: string) => {
    const newValue = parseInt(value) || 0;
    setBattleState(prev => ({
      ...prev,
      combatants: prev.combatants.map(c => {
        if (c.id === id) {
          const updated = { ...c, [field]: newValue };
          if (field === 'adp' && newValue > c.maxAdp) {
            updated.adp = c.maxAdp;
          }
          return updated;
        }
        return c;
      })
    }));
  };

  const handleRestoreAllADP = () => {
    setBattleState(prev => ({
      ...prev,
      combatants: restoreAllADP(prev.combatants)
    }));
    alert('All combatants have been restored to full ADP.');
  };

  const handleClearOpponents = () => {
    if (window.confirm('Are you sure you want to remove all hostile combatants?')) {
      setBattleState(prev => ({
        ...prev,
        combatants: clearHostileCombatants(prev.combatants)
      }));
      alert('All hostile combatants have been removed.');
    }
  };

  const handleExportBattle = () => {
    const markdown = exportBattleToMarkdown(
      battleState.combatants,
      battleState.defeatedCombatants,
      battleState.round
    );
    navigator.clipboard.writeText(markdown);
    alert('Battle state exported to clipboard!');
  };

  const sortedCombatants = sortCombatants(battleState.combatants);

  const getDefaults = () => {
    if (newCombatant.category === 'npc') {
      return npcDefaults[newCombatant.level];
    } else if (newCombatant.category === 'qsb') {
      return qsbDefaults[newCombatant.classification];
    }
    return { adp: 15, pdp: 10 };
  };

  const defaults = getDefaults();

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Battle Phase Calculator
        </h1>
        <p className="text-gray-600">
          Manage combat initiative and health tracking for Eldritch RPG 2nd Edition
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={handleRestoreAllADP}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            Restore All ADP
          </button>
          <button
            onClick={handleClearOpponents}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            Clear Opponents
          </button>
          <button
            onClick={handleExportBattle}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            Export Battle
          </button>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={battleState.autoRollEnabled}
              onChange={(e) => setBattleState(prev => ({ ...prev, autoRollEnabled: e.target.checked }))}
              className="mr-2"
            />
            <span className="text-sm font-medium">Auto-roll Armor</span>
          </label>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Round:</span>
            <input
              type="number"
              value={battleState.round}
              onChange={(e) => setBattleState(prev => ({ ...prev, round: parseInt(e.target.value) || 1 }))}
              className="w-16 border border-gray-300 rounded px-2 py-1 text-center"
              min="1"
            />
          </div>
        </div>

        {/* Add Combatant Form */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-bold mb-4">Add Combatant</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={newCombatant.category}
                onChange={(e) => setNewCombatant(prev => ({ ...prev, category: e.target.value as CombatantCategory }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="pa">Player Adventurer</option>
                <option value="npc">NPC</option>
                <option value="qsb">Quick Stat Block</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={newCombatant.name}
                onChange={(e) => setNewCombatant(prev => ({ ...prev, name: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                placeholder="Enter combatant name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prowess Die</label>
              <select
                value={newCombatant.prowessDie}
                onChange={(e) => setNewCombatant(prev => ({ ...prev, prowessDie: parseInt(e.target.value) }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                {prowessDieOptions.map(die => (
                  <option key={die} value={die}>d{die}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weapon Reach</label>
              <select
                value={newCombatant.weaponReach}
                onChange={(e) => setNewCombatant(prev => ({ ...prev, weaponReach: e.target.value as WeaponReach }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                {weaponReachOptions.map(reach => (
                  <option key={reach} value={reach}>{reach}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                value={newCombatant.role}
                onChange={(e) => setNewCombatant(prev => ({ ...prev, role: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                {combatantRoles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            {newCombatant.category === 'npc' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                <select
                  value={newCombatant.level}
                  onChange={(e) => setNewCombatant(prev => ({ ...prev, level: e.target.value as NPCLevel }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  {Object.keys(npcDefaults).map(level => (
                    <option key={level} value={level}>Level {level}</option>
                  ))}
                </select>
              </div>
            )}

            {newCombatant.category === 'qsb' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Classification</label>
                <select
                  value={newCombatant.classification}
                  onChange={(e) => setNewCombatant(prev => ({ ...prev, classification: e.target.value as QSBClassification }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  {Object.keys(qsbDefaults).map(classification => (
                    <option key={classification} value={classification}>{classification}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ADP (Default: {defaults.adp})
              </label>
              <input
                type="number"
                value={newCombatant.customADP}
                onChange={(e) => setNewCombatant(prev => ({ ...prev, customADP: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                placeholder={defaults.adp.toString()}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PDP (Default: {defaults.pdp})
              </label>
              <input
                type="number"
                value={newCombatant.customPDP}
                onChange={(e) => setNewCombatant(prev => ({ ...prev, customPDP: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                placeholder={defaults.pdp.toString()}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Armor</label>
              <select
                value={newCombatant.armor}
                onChange={(e) => setNewCombatant(prev => ({ ...prev, armor: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                {armorTypes.map(armor => (
                  <option key={armor} value={armor}>{armor === '0' ? 'None' : armor}</option>
                ))}
              </select>
            </div>

            {newCombatant.category === 'pa' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reaction Focus</label>
                  <input
                    type="number"
                    value={newCombatant.reactionFocus}
                    onChange={(e) => setNewCombatant(prev => ({ ...prev, reactionFocus: parseInt(e.target.value) || 0 }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Spirit Points</label>
                  <input
                    type="number"
                    value={newCombatant.spiritPoints}
                    onChange={(e) => setNewCombatant(prev => ({ ...prev, spiritPoints: parseInt(e.target.value) || 0 }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    min="0"
                  />
                </div>
              </>
            )}
          </div>

          <button
            onClick={addCombatant}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            Add Combatant
          </button>
        </div>
      </div>

      {/* Active Combatants */}
      {sortedCombatants.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Active Combatants (Initiative Order)</h2>

          <div className="space-y-4">
            {sortedCombatants.map((combatant, index) => (
              <div key={combatant.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-bold text-blue-600">#{index + 1}</span>
                    <span className="text-lg font-medium">{combatant.name}</span>
                    <span className="text-sm text-gray-600">
                      ({combatant.classification} • BP: {combatant.battlePhase} • {combatant.weaponReach} reach)
                    </span>
                    <span className={`text-sm px-2 py-1 rounded ${
                      combatant.role === 'Hostile' ? 'bg-red-100 text-red-800' :
                      combatant.role === 'Ally' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {combatant.role}
                    </span>
                  </div>
                  <button
                    onClick={() => removeCombatant(combatant.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Health Pools */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Active Defense Pool
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={combatant.adp}
                        onChange={(e) => updateCombatantHP(combatant.id, 'adp', e.target.value)}
                        className="w-20 border border-gray-300 rounded px-2 py-1 text-center"
                        min="0"
                        max={combatant.maxAdp}
                      />
                      <span className="text-sm text-gray-600">/ {combatant.maxAdp}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Passive Defense Pool
                    </label>
                    <input
                      type="number"
                      value={combatant.pdp}
                      onChange={(e) => updateCombatantHP(combatant.id, 'pdp', e.target.value)}
                      className="w-20 border border-gray-300 rounded px-2 py-1 text-center"
                      min="0"
                    />
                  </div>

                  {/* Threat Application */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Apply Threat
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={threatInputs[combatant.id] || ''}
                        onChange={(e) => setThreatInputs(prev => ({ ...prev, [combatant.id]: e.target.value }))}
                        className="w-20 border border-gray-300 rounded px-2 py-1 text-center"
                        placeholder="Threat"
                        min="0"
                      />
                      {!battleState.autoRollEnabled && combatant.armor !== '0' && (
                        <input
                          type="number"
                          value={armorRolls[combatant.id] || ''}
                          onChange={(e) => setArmorRolls(prev => ({ ...prev, [combatant.id]: e.target.value }))}
                          className="w-20 border border-gray-300 rounded px-2 py-1 text-center"
                          placeholder="Armor"
                          min="0"
                        />
                      )}
                      <button
                        onClick={() => handleApplyThreat(combatant.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Apply
                      </button>
                    </div>
                  </div>

                  {/* Revitalize (PA only) */}
                  {combatant.category === 'pa' && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Revitalize (SP: {combatant.spiritPoints})
                      </label>
                      {!showRevitalize[combatant.id] ? (
                        <button
                          onClick={() => setShowRevitalize(prev => ({ ...prev, [combatant.id]: true }))}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                        >
                          Revitalize
                        </button>
                      ) : (
                        <div className="space-y-1">
                          {Object.entries(revitalizeOptions).map(([key, option]) => (
                            <div key={key} className="flex items-center gap-1">
                              {key === 'steadyRenewal' ? (
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    value={spInputs[combatant.id] || ''}
                                    onChange={(e) => setSPInputs(prev => ({ ...prev, [combatant.id]: e.target.value }))}
                                    className="w-12 border border-gray-300 rounded px-1 text-xs"
                                    placeholder="SP"
                                    min="0"
                                    max={combatant.spiritPoints}
                                  />
                                  <button
                                    onClick={() => handleRevitalize(combatant.id, key as RevitalizeOption)}
                                    className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs"
                                    title={option.description}
                                  >
                                    {option.label}
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleRevitalize(combatant.id, key as RevitalizeOption)}
                                  className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs"
                                  title={option.description}
                                >
                                  {option.label}
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            onClick={() => setShowRevitalize(prev => ({ ...prev, [combatant.id]: false }))}
                            className="text-xs text-gray-500 hover:text-gray-700"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {combatant.armor !== '0' && (
                  <div className="mt-2 text-sm text-gray-600">
                    Armor: {combatant.armor} | Shield: {combatant.shield > 0 ? `+${combatant.shield}` : 'None'}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Defeated Combatants */}
      {battleState.defeatedCombatants.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Defeated Combatants</h2>
          <div className="space-y-2">
            {battleState.defeatedCombatants.map(combatant => (
              <div key={combatant.id} className="flex items-center justify-between p-3 bg-red-50 rounded">
                <span className="text-gray-700">
                  {combatant.name} ({combatant.classification})
                </span>
                <button
                  onClick={() => restoreCombatant(combatant.id)}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                >
                  Restore
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}