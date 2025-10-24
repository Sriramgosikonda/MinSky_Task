import { db } from './index.js';
import { events } from './schema.js';

async function seed() {
  console.log('Seeding database...');

  const sampleEvents = [
    {
      name: 'Concert A',
      date: new Date('2024-12-01T20:00:00Z'),
      venue: 'Venue A',
      description: 'A great concert',
      totalTickets: 10,
      bookedTickets: 0,
      basePrice: '50.00',
      currentPrice: '50.00',
      floorPrice: '40.00',
      ceilingPrice: '100.00',
      pricingRules: JSON.stringify({}),
    },
    {
      name: 'Concert B',
      date: new Date('2024-12-15T19:00:00Z'),
      venue: 'Venue B',
      description: 'Another great concert',
      totalTickets: 10,
      bookedTickets: 0,
      basePrice: '60.00',
      currentPrice: '60.00',
      floorPrice: '50.00',
      ceilingPrice: '120.00',
      pricingRules: JSON.stringify({}),
    },
    {
      name: 'Festival C',
      date: new Date('2024-12-20T18:00:00Z'),
      venue: 'Venue C',
      description: 'A festival event',
      totalTickets: 10,
      bookedTickets: 0,
      basePrice: '80.00',
      currentPrice: '80.00',
      floorPrice: '70.00',
      ceilingPrice: '150.00',
      pricingRules: JSON.stringify({}),
    },
  ];

  await db.insert(events).values(sampleEvents);
  console.log('Seeding completed.');
}

seed().catch(console.error);