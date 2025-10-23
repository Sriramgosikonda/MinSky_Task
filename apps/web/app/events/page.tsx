'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Event {
  id: string;
  name: string;
  date: string;
  venue: string;
  description: string;
  totalTickets: number;
  bookedTickets: number;
  currentPrice: number;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch('http://localhost:3001/events');
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setEvents(data);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <header className="border-b border-slate-700 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Events</h1>
          <Link href="/" className="text-blue-400 hover:underline">Home</Link>
        </div>
      </header>
      <main className="max-w-7xl mx-auto p-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <div key={event.id} className="bg-slate-800 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-2">{event.name}</h2>
              <p className="text-slate-400 mb-2">{event.venue}</p>
              <p className="text-slate-400 mb-2">{new Date(event.date).toLocaleDateString()}</p>
              <p className="text-green-400 font-bold mb-4">₹{event.currentPrice}</p>
              <p className="text-sm text-slate-500 mb-4">
                {event.totalTickets - event.bookedTickets} tickets left
              </p>
              <Link
                href={`/events/${event.id}`}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white"
              >
                View Details
              </Link>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}