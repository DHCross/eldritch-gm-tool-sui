import Link from 'next/link';
import StatBlockParser from '../../components/StatBlockParser';

export default function StatBlockParserPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex justify-start p-4">
        <Link
          href="/gm-tools"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
        >
          ← Back to GM Tools
        </Link>
      </div>
      <StatBlockParser />
    </div>
  );
}