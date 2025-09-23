import NPCGenerator from '../../components/NPCGenerator';
import Link from 'next/link';

export default function NPCGeneratorPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>

        <NPCGenerator />
      </div>
    </div>
  );
}