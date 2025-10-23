import { Controller, Get, Param } from '@nestjs/common';
import { db, bookings, events, eq, sql } from '@repo/database';

@Controller('analytics')
export class AnalyticsController {
  @Get('events/:id')
  async getEventAnalytics(@Param('id') eventId: string) {
    const event = await db.select().from(events).where(eq(events.id, eventId)).limit(1);
    if (!event.length) throw new Error('Event not found');

    const eventBookings = await db.select().from(bookings).where(eq(bookings.eventId, eventId));

    const totalSold = eventBookings.reduce((sum, b) => sum + b.quantity, 0);
    const totalRevenue = eventBookings.reduce((sum, b) => sum + parseFloat(b.pricePaid), 0);
    const avgPrice = totalSold > 0 ? totalRevenue / totalSold : 0;

    return {
      eventId,
      totalSold,
      totalRevenue,
      avgPrice,
      remainingTickets: event[0].totalTickets - event[0].bookedTickets,
    };
  }

  @Get('summary')
  async getOverallSummary() {
    const allEvents = await db.select().from(events);
    const allBookings = await db.select().from(bookings);

    const totalEvents = allEvents.length;
    const totalSold = allBookings.reduce((sum, b) => sum + b.quantity, 0);
    const totalRevenue = allBookings.reduce((sum, b) => sum + parseFloat(b.pricePaid), 0);
    const avgPrice = totalSold > 0 ? totalRevenue / totalSold : 0;

    return {
      totalEvents,
      totalSold,
      totalRevenue,
      avgPrice,
    };
  }
}