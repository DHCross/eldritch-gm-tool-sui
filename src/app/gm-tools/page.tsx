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

      <section className="mb-10 rounded-2xl border border-purple-200 bg-purple-50 p-6 shadow-sm">
        <div className="flex flex-col gap-4 text-center md:flex-row md:items-center md:justify-between md:text-left">
          <div>
            <h2 className="text-2xl font-bold text-purple-900 mb-2">📖 Explore the Full Bestiary</h2>
            <p className="text-purple-800">
              Dive into the complete catalog of eldritch creatures, filter by threat level, and pull stat blocks straight into
              your encounters.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/bestiary?from=gm-tools"
              className="inline-flex items-center justify-center rounded-md bg-purple-600 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-purple-700 transition-colors"
            >
              Open Bestiary Catalog →
            </Link>
            <Link
              href="/monster-roster?from=gm-tools"
              className="inline-flex items-center justify-center rounded-md border border-purple-200 bg-white px-5 py-3 text-sm font-semibold text-purple-800 shadow-sm hover:border-purple-300 hover:text-purple-900 transition-colors"
            >
              Manage Custom Monsters
            </Link>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-3">⚔️ Encounter Generator</h3>
          <p className="text-gray-600 mb-4">Create balanced encounters with detailed statistics.</p>
          <Link href="/encounter-generator?from=gm-tools" className="text-blue-600 hover:text-blue-800 font-medium">
            Generate Encounters →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-3">👤 Character Tools</h3>
          <p className="text-gray-600 mb-4">Generate and manage player characters.</p>
          <div className="space-y-2">
            <Link href="/character-generator?from=gm-tools" className="block text-blue-600 hover:text-blue-800 font-medium">
              Character Generator →
            </Link>
            <Link href="/roster?from=gm-tools" className="block text-blue-600 hover:text-blue-800 font-medium">
              Character Roster →
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-3">🧙 NPC Tools</h3>
          <p className="text-gray-600 mb-4">Create and organize non-player characters.</p>
          <div className="space-y-2">
            <Link href="/npc-generator?from=gm-tools" className="block text-blue-600 hover:text-blue-800 font-medium">
              NPC Generator →
            </Link>
            <Link href="/npc-roster?from=gm-tools" className="block text-blue-600 hover:text-blue-800 font-medium">
              NPC Roster →
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-3">👹 Monster Tools</h3>
          <p className="text-gray-600 mb-4">Generate creatures and manage bestiary.</p>
          <div className="space-y-2">
            <Link href="/monster-generator?from=gm-tools" className="block text-blue-600 hover:text-blue-800 font-medium">
              Monster Generator →
            </Link>
            <Link href="/monster-roster?from=gm-tools" className="block text-blue-600 hover:text-blue-800 font-medium">
              Monster Roster →
            </Link>
            <Link href="/bestiary?from=gm-tools" className="block text-blue-600 hover:text-blue-800 font-medium">
              Bestiary Catalog →
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-3">⚡ Battle Calculator</h3>
          <p className="text-gray-600 mb-4">Track combat and manage battle phases.</p>
          <Link href="/battle-calculator?from=gm-tools" className="text-blue-600 hover:text-blue-800 font-medium">
            Battle Calculator →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-3">📝 Game Content Parser</h3>
          <p className="text-gray-600 mb-4">Analyze and validate stat blocks, spells, and magic items for compliance.</p>
          <Link href="/stat-block-parser?from=gm-tools" className="text-blue-600 hover:text-blue-800 font-medium">
            Parse Game Content →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-3">📚 References</h3>
          <p className="text-gray-600 mb-4">Quick access to rules and spell references.</p>
          <div className="space-y-2">
            <Link href="/grimoire?from=gm-tools" className="block text-blue-600 hover:text-blue-800 font-medium">
              Grimoire →
            </Link>
            <Link href="/rules?from=gm-tools" className="block text-blue-600 hover:text-blue-800 font-medium">
              Rules Reference →
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
        <Link
          href="/"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          Back to Home
        </Link>
        <Link
          href="/player-tools"
          className="bg-white border border-blue-200 text-blue-700 hover:text-blue-900 hover:border-blue-300 font-bold py-2 px-4 rounded transition-colors shadow-sm"
        >
          Explore Player Tools
        </Link>
      </div>
    </div>
  );
}
