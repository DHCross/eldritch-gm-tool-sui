import Link from 'next/link';

export default function CharacterGenerator() {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Character Generator
        </h1>
        <p className="text-lg text-gray-600">
          Generate complete player characters for Eldritch RPG 2nd Edition
        </p>
      </header>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">Coming Soon</h2>
        <p className="text-gray-600 mb-4">
          The Character Generator is currently under development. This tool will help you create
          detailed player characters with stats, backgrounds, equipment, and abilities.
        </p>
        <p className="text-gray-600">
          Features planned:
        </p>
        <ul className="list-disc list-inside text-gray-600 mt-2">
          <li>Random character generation</li>
          <li>Custom character creation</li>
          <li>Equipment and gear selection</li>
          <li>Background and trait assignment</li>
          <li>Export to character sheets</li>
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