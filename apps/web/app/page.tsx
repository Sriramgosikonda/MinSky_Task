import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="border-b border-slate-700/50 backdrop-blur-sm bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <h1 className="text-3xl font-light tracking-tight text-slate-100">
            Ticketing System
          </h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-8 py-16">
        <div className="space-y-12">
          <div className="space-y-4">
            <h2 className="text-4xl font-light text-slate-100 tracking-tight">
              Dynamic Event Pricing
            </h2>
            <p className="text-lg text-slate-400 leading-relaxed max-w-2xl">
              A sophisticated platform for managing events with intelligent
              pricing algorithms and real-time availability tracking.
            </p>
          </div>

          <div className="text-center">
            <Link
              href="/events"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
            >
              View Events
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
