import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-12">
        <div className="flex flex-col items-center gap-4 text-center md:flex-row md:justify-center md:gap-6 md:text-left">
          <Image
            src="/hoskbrew-logo.png"
            alt="HoskBrew star logo for the Eldritch RPG GM Tools Suite"
            width={220}
            height={109}
            sizes="(min-width: 768px) 220px, 160px"
            priority
            className="h-auto w-32 max-w-[220px] md:w-[220px]"
          />
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2 md:mb-4">
              Eldritch RPG GM Tools Suite
            </h1>
            <p className="text-xl text-gray-600">
              Essential tools for Game Masters running Eldritch RPG campaigns
            </p>
          </div>
        </div>
      </header>

      <main>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="flex flex-col bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">For Players</h2>
            <p className="text-lg text-gray-600 mb-6">
              Jump straight into character creation, spell references, and tools to keep your hero ready for every eldritch encounter.
            </p>
            <ul className="space-y-3 text-gray-600">
              <li>• Quick character and NPC builders tailored for player use.</li>
              <li>• Access to spellbooks, equipment, and lore summaries.</li>
              <li>• Resources to track progress, parties, and campaign history.</li>
            </ul>
            <Link
              href="/player-tools"
              className="mt-8 inline-block self-start bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded transition-colors"
            >
              Explore Player Tools
            </Link>
          </div>

          <div className="flex flex-col bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">For Game Masters</h2>
            <p className="text-lg text-gray-600 mb-6">
              Orchestrate unforgettable sessions with encounter planning, monster management, and campaign organization at your fingertips.
            </p>
            <ul className="space-y-3 text-gray-600">
              <li>• Comprehensive encounter and monster generators.</li>
              <li>• Battle calculators, rosters, and party management dashboards.</li>
              <li>• Direct links to rules, documentation, and the full bestiary.</li>
            </ul>
            <Link
              href="/gm-tools"
              className="mt-8 inline-block self-start bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded transition-colors"
            >
              Explore GM Tools
            </Link>
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
