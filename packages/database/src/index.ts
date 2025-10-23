import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';
import { config } from 'dotenv';
import { eq, and, sql } from 'drizzle-orm';

config();

const connectionString = process.env.DATABASE_URL!;

const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });

export const { events, bookings } = schema;
export { eq, and, sql };