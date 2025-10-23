import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { db, bookings, events, eq, and, sql } from '@repo/database';

@Controller('bookings')
export class BookingsController {
  @Post()
  async createBooking(@Body() body: { eventId: string; email: string; quantity: number }) {
    const { eventId, email: userEmail, quantity } = body;

    // Use transaction with row-level lock
    const result = await db.transaction(async (tx) => {
      const event = await tx
        .select()
        .from(events)
        .where(eq(events.id, eventId))
        .for('update') // Row-level lock
        .limit(1);

      if (!event.length) throw new Error('Event not found');
      const e = event[0];

      if (e.bookedTickets + quantity > e.totalTickets) {
        throw new Error('Not enough tickets available');
      }

      // Calculate price
      const pricePaid = parseFloat(e.currentPrice) * quantity;

      // Create booking
      const newBooking = await tx.insert(bookings).values({
        eventId,
        userEmail,
        quantity,
        pricePaid: pricePaid.toFixed(2),
      }).returning();

      // Update booked tickets
      await tx.update(events)
        .set({ bookedTickets: sql`${events.bookedTickets} + ${quantity}` })
        .where(eq(events.id, eventId));

      return newBooking[0];
    });

    return result;
  }

  @Get()
  async getBookings(@Query('eventId') eventId?: string) {
    if (eventId) {
      return await db.select().from(bookings).where(eq(bookings.eventId, eventId));
    }
    return await db.select().from(bookings);
  }
}