'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface EventDetail {
  id: string;
  name: string;
  date: string;
  venue: string;
  description: string;
  totalTickets: number;
  bookedTickets: number;
  basePrice: number;
  currentPrice: number;
  floorPrice: number;
  ceilingPrice: number;
  timeAdjustment: number;
  demandAdjustment: number;
  inventoryAdjustment: number;
  totalAdjustment: number;
}

export default function EventDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState({ email: '', quantity: 1 });
  const [bookingStatus, setBookingStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchEvent();
    const interval = setInterval(fetchEvent, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [id]);

  const fetchEvent = async () => {
    try {
      const res = await fetch(`http://localhost:3001/events/${id}`);
      const data = await res.json();
      setEvent(data);
    } catch (error) {
      console.error('Failed to fetch event:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingStatus('Booking...');

    try {
      const res = await fetch('http://localhost:3001/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: id, ...booking }),
      });

      if (res.ok) {
        setBookingStatus('Booking successful!');
        fetchEvent(); // Refresh event data
      } else {
        const error = await res.text();
        setBookingStatus(`Booking failed: ${error}`);
      }
    } catch (error) {
      setBookingStatus('Booking failed');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!event) return <div className="min-h-screen flex items-center justify-center">Event not found</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <header className="border-b border-slate-700 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">{event.name}</h1>
          <Link href="/events" className="text-blue-400 hover:underline">Back to Events</Link>
        </div>
      </header>
      <main className="max-w-7xl mx-auto p-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl mb-4">Event Details</h2>
            <p><strong>Venue:</strong> {event.venue}</p>
            <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
            <p><strong>Description:</strong> {event.description}</p>
            <p><strong>Tickets Available:</strong> {event.totalTickets - event.bookedTickets}</p>
          </div>
          <div>
            <h2 className="text-xl mb-4">Price Breakdown</h2>
            <p><strong>Base Price:</strong> ₹{event.basePrice}</p>
            <p><strong>Time Adjustment:</strong> +₹{event.timeAdjustment.toFixed(2)}</p>
            <p><strong>Demand Adjustment:</strong> +₹{event.demandAdjustment.toFixed(2)}</p>
            <p><strong>Inventory Adjustment:</strong> +₹{event.inventoryAdjustment.toFixed(2)}</p>
            <p><strong>Total Adjustment:</strong> +₹{event.totalAdjustment.toFixed(2)}</p>
            <p className="text-green-400 font-bold text-lg"><strong>Current Price:</strong> ₹{event.currentPrice}</p>
            <p><strong>Floor:</strong> ₹{event.floorPrice} | <strong>Ceiling:</strong> ₹{event.ceilingPrice}</p>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl mb-4">Book Tickets</h2>
          <form onSubmit={handleBooking} className="space-y-4">
            <div>
              <label className="block mb-2">Email:</label>
              <input
                type="email"
                value={booking.email}
                onChange={(e) => setBooking({ ...booking, email: e.target.value })}
                className="w-full p-2 bg-slate-800 border border-slate-700 rounded"
                placeholder="Enter your email"
                required
              />
            </div>
            <div>
              <label className="block mb-2">Quantity:</label>
              <input
                type="number"
                min="1"
                max={event.totalTickets - event.bookedTickets}
                value={booking.quantity}
                onChange={(e) => setBooking({ ...booking, quantity: parseInt(e.target.value) })}
                className="w-full p-2 bg-slate-800 border border-slate-700 rounded"
                placeholder="Enter quantity"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white"
              disabled={event.totalTickets - event.bookedTickets === 0}
            >
              Book Tickets
            </button>
          </form>
          {bookingStatus && <p className="mt-4">{bookingStatus}</p>}
        </div>
      </main>
    </div>
  );
}