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

    // Demand-based adjustment: more recent bookings, higher price
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const recentBookings = await db
      .select({ count: sql<number>`count(*)` })
      .from(bookings)
      .where(sql`${bookings.eventId} = ${eventId} AND ${bookings.createdAt} > ${weekAgo}`);

    const demandAdjustment = (recentBookings[0].count / 10) * this.DEMAND_WEIGHT; // Assume 10 bookings/week as baseline

    // Inventory adjustment: fewer tickets left, higher price
    const remainingTickets = e.totalTickets - e.bookedTickets;
    const inventoryAdjustment = ((e.totalTickets - remainingTickets) / e.totalTickets) * this.INVENTORY_WEIGHT;

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
    const recentBookings = await db
      .select({ count: sql<number>`count(*)` })
      .from(bookings)
      .where(sql`${bookings.eventId} = ${eventId} AND ${bookings.createdAt} > ${new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()}`);

    const demandAdjustment = ((recentBookings[0]?.count || 0) / 10) * this.DEMAND_WEIGHT;
    const remainingTickets = e.totalTickets - e.bookedTickets;
    const inventoryAdjustment = ((e.totalTickets - remainingTickets) / e.totalTickets) * this.INVENTORY_WEIGHT;

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