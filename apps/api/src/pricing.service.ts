import { Injectable } from '@nestjs/common';
import { db, events, bookings, eq, sql } from '@repo/database';

@Injectable()
export class PricingService {
  private readonly TIME_WEIGHT = parseFloat(process.env.TIME_WEIGHT || '0.2');
  private readonly DEMAND_WEIGHT = parseFloat(process.env.DEMAND_WEIGHT || '0.15');
  private readonly INVENTORY_WEIGHT = parseFloat(process.env.INVENTORY_WEIGHT || '0.25');

  async calculatePrice(eventId: string): Promise<number> {
    const event = await db.select().from(events).where(eq(events.id, eventId)).limit(1);
    if (!event.length) throw new Error('Event not found');

    const e = event[0];
    const now = new Date();
    const eventDate = new Date(e.date);
    const daysUntilEvent = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

    // Time-based adjustment: closer to event, higher price
    const timeAdjustment = Math.max(0, (30 - daysUntilEvent) / 30) * this.TIME_WEIGHT;

    // Demand-based adjustment: if more than 10 bookings in last hour, increase by 15%
    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
    const recentBookings = await db
      .select({ count: sql<number>`count(*)` })
      .from(bookings)
      .where(sql`${bookings.eventId} = ${eventId} AND ${bookings.createdAt} > ${hourAgo}`);

    const demandAdjustment = recentBookings[0].count > 10 ? 0.15 * this.DEMAND_WEIGHT : 0;

    // Inventory adjustment: when less than 20% tickets remain, increase by 25%
    const remainingTickets = e.totalTickets - e.bookedTickets;
    const remainingPercentage = remainingTickets / e.totalTickets;
    const inventoryAdjustment = remainingPercentage < 0.2 ? 0.25 * this.INVENTORY_WEIGHT : 0;

    const totalAdjustment = timeAdjustment + demandAdjustment + inventoryAdjustment;
    const newPrice = parseFloat(e.basePrice) * (1 + totalAdjustment);

    // Respect floor and ceiling
    const finalPrice = Math.max(parseFloat(e.floorPrice), Math.min(parseFloat(e.ceilingPrice), newPrice));

    // Update current price in DB
    await db.update(events).set({ currentPrice: finalPrice.toFixed(2) }).where(eq(events.id, eventId));

    return finalPrice;
  }

  async getPriceBreakdown(eventId: string) {
    const event = await db.select().from(events).where(eq(events.id, eventId)).limit(1);
    if (!event.length) throw new Error('Event not found');

    const e = event[0];
    const now = new Date();
    const eventDate = new Date(e.date);
    const daysUntilEvent = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

    const timeAdjustment = Math.max(0, (30 - daysUntilEvent) / 30) * this.TIME_WEIGHT;
    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
    const recentBookings = await db
      .select({ count: sql<number>`count(*)` })
      .from(bookings)
      .where(sql`${bookings.eventId} = ${eventId} AND ${bookings.createdAt} > ${hourAgo}`);

    const demandAdjustment = recentBookings[0].count > 10 ? 0.15 * this.DEMAND_WEIGHT : 0;
    const remainingTickets = e.totalTickets - e.bookedTickets;
    const remainingPercentage = remainingTickets / e.totalTickets;
    const inventoryAdjustment = remainingPercentage < 0.2 ? 0.25 * this.INVENTORY_WEIGHT : 0;

    return {
      basePrice: parseFloat(e.basePrice),
      timeAdjustment,
      demandAdjustment,
      inventoryAdjustment,
      totalAdjustment: timeAdjustment + demandAdjustment + inventoryAdjustment,
      currentPrice: parseFloat(e.currentPrice),
      floorPrice: parseFloat(e.floorPrice),
      ceilingPrice: parseFloat(e.ceilingPrice),
    };
  }
}