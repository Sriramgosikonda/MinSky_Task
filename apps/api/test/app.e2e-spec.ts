import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    process.env.API_KEY = 'test-api-key';
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  describe('Concurrent Bookings', () => {
    it('should handle concurrent bookings correctly', async () => {
      const N = 10;
      const totalRequests = N + 5;

      // Create an event with N remaining tickets
      const eventData = {
        name: 'Test Event',
        date: '2024-12-01T20:00:00Z',
        venue: 'Test Venue',
        description: 'Test Description',
        totalTickets: N,
        bookedTickets: 0,
        basePrice: '50.00',
        currentPrice: '50.00',
        floorPrice: '40.00',
        ceilingPrice: '100.00',
        pricingRules: '{}',
      };

      const createEventResponse = await request(app.getHttpServer())
        .post('/events')
        .set('x-api-key', 'test-api-key')
        .send(eventData)
        .expect(201);

      const eventId = createEventResponse.body.id;

      // Fire N+5 concurrent booking requests
      const bookingPromises = Array.from({ length: totalRequests }, (_, i) =>
        request(app.getHttpServer())
          .post('/bookings')
          .send({
            eventId,
            email: `user${i}@test.com`,
            quantity: 1,
          })
      );

      const results = await Promise.allSettled(bookingPromises);

      const fulfilled = results.filter(result => result.status === 'fulfilled');
      const rejected = results.filter(result => result.status === 'rejected');

      // Assert exactly N requests succeed and 5 requests fail
      expect(fulfilled.length).toBe(N);
      expect(rejected.length).toBe(5);

      // Verify the final bookedTickets count in the database
      const eventsResponse = await request(app.getHttpServer())
        .get('/events')
        .expect(200);

      const event = eventsResponse.body.find((e: any) => e.id === eventId);
      expect(event.bookedTickets).toBe(N);
    });
  });
});
