import Link from 'next/link';

export default function Rules() {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Eldritch RPG Rules Reference
        </h1>
        <p className="text-lg text-gray-600">
          Quick reference for Eldritch RPG 2nd Edition rules and mechanics
        </p>
      </header>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">Coming Soon</h2>
        <p className="text-gray-600 mb-4">
          The Rules Reference is currently under development. This section will provide
          quick access to core game mechanics and rules.
        </p>
        <p className="text-gray-600">
          Features planned:
        </p>
        <ul className="list-disc list-inside text-gray-600 mt-2">
          <li>Core mechanics quick reference</li>
          <li>Combat rules and procedures</li>
          <li>Character creation guidelines</li>
          <li>Magic and spellcasting rules</li>
          <li>Equipment and gear references</li>
        </ul>
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