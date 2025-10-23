import { Controller, Get, Post, Param, Body, Headers, UnauthorizedException } from '@nestjs/common';
import { PricingService } from './pricing.service';
import { db, events, eq } from '@repo/database';

@Controller('events')
export class EventsController {
  constructor(private readonly pricingService: PricingService) {}

  @Get()
  async getEvents() {
    const eventList = await db.select().from(events);
    const eventsWithPrices = await Promise.all(
      eventList.map(async (event) => {
        const price = await this.pricingService.calculatePrice(event.id);
        return { ...event, currentPrice: price };
      })
    );
    return eventsWithPrices;
  }

  @Get(':id')
  async getEvent(@Param('id') id: string) {
    const event = await db.select().from(events).where(eq(events.id, id)).limit(1);
    if (!event.length) throw new Error('Event not found');
    const priceBreakdown = await this.pricingService.getPriceBreakdown(id);
    return { ...event[0], ...priceBreakdown };
  }

  @Post()
  async createEvent(@Body() body: any, @Headers('x-api-key') apiKey: string) {
    if (apiKey !== process.env.API_KEY) throw new UnauthorizedException('Invalid API key');
    const newEvent = await db.insert(events).values(body).returning();
    return newEvent[0];
  }
}