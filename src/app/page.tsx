import Link from 'next/link';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Eldritch RPG GM Tools Suite
        </h1>
        <p className="text-xl text-gray-600">
          Essential tools for Game Masters running Eldritch RPG campaigns
        </p>
      </header>

      <main>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <h2 className="text-2xl font-bold mb-3">🎲 GM Tool Suite</h2>
            <p className="text-gray-600 mb-4">
              All-in-one toolkit with encounter generator, NPC creator, battle calculator, and more.
            </p>
            <Link
              href="/gm-tools"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-block transition-colors"
            >
              Launch GM Tools
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <h2 className="text-2xl font-bold mb-3">⚔️ Advanced Encounter Generator</h2>
            <p className="text-gray-600 mb-4">
              Create balanced encounters with detailed monster statistics and threat calculations.
            </p>
            <Link
              href="/encounter-generator"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-block transition-colors"
            >
              Generate Encounters
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <h2 className="text-2xl font-bold mb-3">👤 Character Generator</h2>
            <p className="text-gray-600 mb-4">
              Generate complete player characters for Eldritch RPG 2nd Edition.
            </p>
            <Link
              href="/character-generator"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-block transition-colors"
            >
              Create Characters
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <h2 className="text-2xl font-bold mb-3">🧙 NPC Generator</h2>
            <p className="text-gray-600 mb-4">
              Create detailed non-player characters with stats, backgrounds, and equipment.
            </p>
            <div className="space-y-2">
              <Link
                href="/npc-generator"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-block transition-colors mr-2"
              >
                Generate NPCs
              </Link>
              <Link
                href="/npc-roster"
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded inline-block transition-colors"
              >
                NPC Roster
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <h2 className="text-2xl font-bold mb-3">👹 Monster Generator</h2>
            <p className="text-gray-600 mb-4">
              Generate creatures and monsters for your Eldritch RPG encounters.
            </p>
            <div className="space-y-2">
              <Link
                href="/monster-generator"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-block transition-colors mr-2"
              >
                Create Monsters
              </Link>
              <Link
                href="/monster-roster"
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded inline-block transition-colors"
              >
                Monster Roster
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <h2 className="text-2xl font-bold mb-3">📖 Beings Diverse and Malign</h2>
            <p className="text-gray-600 mb-4">
              The complete bestiary of creatures, monsters, and adversaries from the Eldritch archives.
            </p>
            <Link
              href="/bestiary"
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded inline-block transition-colors"
            >
              ⚠️ Access Bestiary
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <h2 className="text-2xl font-bold mb-3">⚡ Battle Phase Calculator</h2>
            <p className="text-gray-600 mb-4">
              Track initiative, manage combat rounds, and calculate battle phases.
            </p>
            <Link
              href="/battle-calculator"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-block transition-colors"
            >
              Battle Calculator
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <h2 className="text-2xl font-bold mb-3">📚 Grimoire Index</h2>
            <p className="text-gray-600 mb-4">
              Browse spell and magic references for your Eldritch RPG campaigns.
            </p>
            <Link
              href="/grimoire"
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded inline-block transition-colors"
            >
              View Grimoire
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <h2 className="text-2xl font-bold mb-3">🗂️ Party Management</h2>
            <p className="text-gray-600 mb-4">
              Organize characters into party folders, manage groups, and calculate party defense levels for encounter balancing.
            </p>
            <div className="space-y-2">
              <Link
                href="/party-management"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-block transition-colors mr-2"
              >
                Party Manager
              </Link>
              <Link
                href="/roster"
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded inline-block transition-colors"
              >
                PC Roster
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="text-center mt-12 pt-8 border-t border-gray-200">
        <div className="text-gray-600">
          <p>&copy; 2025 Eldritch RPG GM Tools</p>
          <p>Tools for the Eldritch RPG system</p>
          <div className="mt-4 space-x-4">
            <Link href="/rules" className="text-blue-600 hover:text-blue-800">
              Game Rules
            </Link>
            <Link href="/documentation" className="text-blue-600 hover:text-blue-800">
              Documentation
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
