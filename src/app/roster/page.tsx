import Link from 'next/link';

export default function Roster() {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Player Character Roster
        </h1>
        <p className="text-lg text-gray-600">
          Manage created PCs, organize parties, and calculate party defense levels
        </p>
      </header>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">No Characters Created Yet</h2>
        <p className="text-gray-600 mb-4">
          You haven't created any player characters yet. Use the Character Generator to create
          characters that will appear in this roster.
        </p>
        <div className="bg-gray-50 p-4 rounded">
          <p className="text-sm text-gray-600">
            Your character roster will display:
          </p>
          <ul className="list-disc list-inside text-sm text-gray-600 mt-2">
            <li>Character names and levels</li>
            <li>Party organization and management</li>
            <li>Defense level calculations</li>
            <li>Encounter balancing integration</li>
          </ul>
        </div>
      </div>

      <div className="text-center space-x-4">
        <Link
          href="/character-generator"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          Create First Character
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