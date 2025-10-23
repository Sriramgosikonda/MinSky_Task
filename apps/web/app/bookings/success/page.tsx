'use client';

import Link from 'next/link';

export default function BookingSuccessPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-green-400">Booking Successful!</h1>
        <p className="text-lg mb-8">Your tickets have been booked successfully.</p>
        <div className="space-x-4">
          <Link href="/my-bookings" className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded text-white">
            View My Bookings
          </Link>
          <Link href="/events" className="bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded text-white">
            Browse More Events
          </Link>
        </div>
      </div>
    </div>
  );
}