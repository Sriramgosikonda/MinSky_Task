import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsController } from './events.controller';
import { BookingsController } from './bookings.controller';
import { AnalyticsController } from './analytics.controller';
import { SeedController } from './seed.controller';
import { PricingService } from './pricing.service';

@Module({
  imports: [],
  controllers: [AppController, EventsController, BookingsController, AnalyticsController, SeedController],
  providers: [AppService, PricingService],
})
export class AppModule {}
