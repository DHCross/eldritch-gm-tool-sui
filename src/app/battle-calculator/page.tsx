import Link from 'next/link';

export default function BattleCalculator() {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Battle Phase Calculator
        </h1>
        <p className="text-lg text-gray-600">
          Track initiative, manage combat rounds, and calculate battle phases
        </p>
      </header>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">Coming Soon</h2>
        <p className="text-gray-600 mb-4">
          The Battle Calculator is currently under development. This tool will help you manage
          combat encounters and track battle phases in real-time.
        </p>
        <p className="text-gray-600">
          Features planned:
        </p>
        <ul className="list-disc list-inside text-gray-600 mt-2">
          <li>Initiative tracking and sorting</li>
          <li>Combat round management</li>
          <li>Damage calculation and tracking</li>
          <li>Status effect monitoring</li>
          <li>Battle phase automation</li>
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