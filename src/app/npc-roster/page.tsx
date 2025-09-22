import Link from 'next/link';

export default function NPCRoster() {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          NPC Roster
        </h1>
        <p className="text-lg text-gray-600">
          Manage your created NPCs and quickly access their details
        </p>
      </header>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">No NPCs Created Yet</h2>
        <p className="text-gray-600 mb-4">
          You haven&apos;t created any NPCs yet. Use the NPC Generator to create characters
          that will appear in this roster.
        </p>
        <div className="bg-gray-50 p-4 rounded">
          <p className="text-sm text-gray-600">
            Your NPC roster will display:
          </p>
          <ul className="list-disc list-inside text-sm text-gray-600 mt-2">
            <li>Character names and basic stats</li>
            <li>Quick access to full character sheets</li>
            <li>Organization by campaign or location</li>
            <li>Search and filter capabilities</li>
          </ul>
        </div>
      </div>

      <div className="text-center space-x-4">
        <Link
          href="/npc-generator"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          Create First NPC
        </Link>
        <Link
          href="/"
          className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}