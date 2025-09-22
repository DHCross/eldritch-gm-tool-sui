import Link from 'next/link';

export default function GMTools() {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          GM Tool Suite
        </h1>
        <p className="text-lg text-gray-600">
          All-in-one toolkit for Game Masters running Eldritch RPG campaigns
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-3">⚔️ Encounter Generator</h3>
          <p className="text-gray-600 mb-4">Create balanced encounters with detailed statistics.</p>
          <Link href="/encounter-generator" className="text-blue-600 hover:text-blue-800 font-medium">
            Generate Encounters →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-3">👤 Character Tools</h3>
          <p className="text-gray-600 mb-4">Generate and manage player characters.</p>
          <div className="space-y-2">
            <Link href="/character-generator" className="block text-blue-600 hover:text-blue-800 font-medium">
              Character Generator →
            </Link>
            <Link href="/roster" className="block text-blue-600 hover:text-blue-800 font-medium">
              Character Roster →
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-3">🧙 NPC Tools</h3>
          <p className="text-gray-600 mb-4">Create and organize non-player characters.</p>
          <div className="space-y-2">
            <Link href="/npc-generator" className="block text-blue-600 hover:text-blue-800 font-medium">
              NPC Generator →
            </Link>
            <Link href="/npc-roster" className="block text-blue-600 hover:text-blue-800 font-medium">
              NPC Roster →
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-3">👹 Monster Tools</h3>
          <p className="text-gray-600 mb-4">Generate creatures and manage bestiary.</p>
          <div className="space-y-2">
            <Link href="/monster-generator" className="block text-blue-600 hover:text-blue-800 font-medium">
              Monster Generator →
            </Link>
            <Link href="/monster-roster" className="block text-blue-600 hover:text-blue-800 font-medium">
              Monster Roster →
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-3">⚡ Battle Calculator</h3>
          <p className="text-gray-600 mb-4">Track combat and manage battle phases.</p>
          <Link href="/battle-calculator" className="text-blue-600 hover:text-blue-800 font-medium">
            Battle Calculator →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-3">📚 References</h3>
          <p className="text-gray-600 mb-4">Quick access to rules and spell references.</p>
          <div className="space-y-2">
            <Link href="/grimoire" className="block text-blue-600 hover:text-blue-800 font-medium">
              Grimoire →
            </Link>
            <Link href="/rules" className="block text-blue-600 hover:text-blue-800 font-medium">
              Rules Reference →
            </Link>
          </div>
        </div>
      </div>

      <div className="text-center">
        <Link
          href="/"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}