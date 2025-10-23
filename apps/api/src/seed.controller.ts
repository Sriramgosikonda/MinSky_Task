import { Controller, Post } from '@nestjs/common';
import { execSync } from 'child_process';

@Controller('seed')
export class SeedController {
  @Post()
  async seedDatabase() {
    try {
      execSync('cd ../../packages/database && pnpm db:seed', { stdio: 'inherit' });
      return { message: 'Database seeded successfully' };
    } catch (error) {
      return { error: 'Failed to seed database' };
    }
  }
}