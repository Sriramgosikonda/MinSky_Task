import { pgTable, uuid, text, timestamp, integer, decimal, jsonb } from 'drizzle-orm/pg-core';

export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  date: timestamp('date').notNull(),
  venue: text('venue').notNull(),
  description: text('description').notNull(),
  totalTickets: integer('total_tickets').notNull(),
  bookedTickets: integer('booked_tickets').notNull().default(0),
  basePrice: decimal('base_price', { precision: 10, scale: 2 }).notNull(),
  currentPrice: decimal('current_price', { precision: 10, scale: 2 }).notNull(),
  floorPrice: decimal('floor_price', { precision: 10, scale: 2 }).notNull(),
  ceilingPrice: decimal('ceiling_price', { precision: 10, scale: 2 }).notNull(),
  pricingRules: jsonb('pricing_rules').notNull(),
});

export const bookings = pgTable('bookings', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').references(() => events.id).notNull(),
  userEmail: text('user_email').notNull(),
  quantity: integer('quantity').notNull(),
  pricePaid: decimal('price_paid', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});