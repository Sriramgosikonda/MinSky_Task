import { config } from 'dotenv';

config({ path: '../../packages/database/.env' });
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

  console.log('DB URL:', process.env.DATABASE_URL);
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3002'],
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
