import Link from 'next/link';

export default function NPCGenerator() {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          NPC Generator
        </h1>
        <p className="text-lg text-gray-600">
          Create detailed non-player characters with stats, backgrounds, and equipment
        </p>
      </header>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">Coming Soon</h2>
        <p className="text-gray-600 mb-4">
          The NPC Generator is currently under development. This tool will help you create
          detailed non-player characters for your campaigns.
        </p>
        <p className="text-gray-600">
          Features planned:
        </p>
        <ul className="list-disc list-inside text-gray-600 mt-2">
          <li>Random NPC generation</li>
          <li>Customizable stats and abilities</li>
          <li>Background and personality traits</li>
          <li>Equipment and inventory</li>
          <li>Save to NPC roster</li>
        </ul>
      </div>

      <div className="text-center space-x-4">
        <Link
          href="/npc-roster"
          className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          View NPC Roster
        </Link>
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