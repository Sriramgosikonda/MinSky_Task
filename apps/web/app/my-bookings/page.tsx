'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Booking {
  id: string;
  eventId: string;
  userEmail: string;
  quantity: number;
  pricePaid: string;
  createdAt: string;
  event?: { name: string; date: string; venue: string };
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');

  const fetchBookings = async () => {
    if (!email) return;
    try {
      const res = await fetch(`http://localhost:3000/bookings?userEmail=${encodeURIComponent(email)}`);
      const data = await res.json();

      // Fetch event details for each booking
      const bookingsWithEvents = await Promise.all(
        data.map(async (booking: Booking) => {
          try {
            const eventRes = await fetch(`http://localhost:3000/events/${booking.eventId}`);
            const eventData = await eventRes.json();
            return { ...booking, event: { name: eventData.name, date: eventData.date, venue: eventData.venue } };
          } catch (error) {
            console.error('Failed to fetch event for booking:', error);
            return booking;
          }
        })
      );

      setBookings(bookingsWithEvents);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (email) fetchBookings();
  }, [email]);

  if (loading && !email) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl mb-4">My Bookings</h1>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-2 bg-slate-800 border border-slate-700 rounded mb-4"
          />
          <button
            onClick={fetchBookings}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white"
          >
            View Bookings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <header className="border-b border-slate-700 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">My Bookings</h1>
          <Link href="/events" className="text-blue-400 hover:underline">Back to Events</Link>
        </div>
      </header>
      <main className="max-w-7xl mx-auto p-8">
        {bookings.length === 0 ? (
          <p>No bookings found.</p>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-slate-800 p-6 rounded-lg">
                {booking.event && (
                  <>
                    <p><strong>Event:</strong> {booking.event.name}</p>
                    <p><strong>Venue:</strong> {booking.event.venue}</p>
                    <p><strong>Date:</strong> {new Date(booking.event.date).toLocaleDateString()}</p>
                  </>
                )}
                <p><strong>Email:</strong> {booking.userEmail}</p>
                <p><strong>Quantity:</strong> {booking.quantity}</p>
                <p><strong>Price Paid:</strong> ₹{booking.pricePaid}</p>
                <p><strong>Booked At:</strong> {new Date(booking.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}