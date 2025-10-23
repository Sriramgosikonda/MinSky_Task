# Dynamic Event Ticketing Platform

A full-stack event ticketing platform with intelligent dynamic pricing. Ticket prices automatically adjust based on time until event, booking velocity, and remaining inventory.

## Tech Stack

- **Monorepo**: Turborepo
- **Frontend**: Next.js 15 (App Router) with TypeScript
- **Backend**: NestJS with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: Tailwind CSS

## Prerequisites

- Node.js 18+
- PostgreSQL 16 (installed at C:\Program Files\PostgreSQL\16)
- pnpm package manager

## Installation

1. Clone the repository
2. Copy `.env.example` to `.env` in packages/database and configure DATABASE_URL
3. Install dependencies: `pnpm install`
4. Push database schema: `pnpm db:push`
5. Seed database: `pnpm db:seed`

## Running the Application

Start both frontend and backend: `pnpm dev`

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## Environment Variables

Create `.env` file in `packages/database/`:

```
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/ticketing_db"
TIME_WEIGHT=0.2
DEMAND_WEIGHT=0.15
INVENTORY_WEIGHT=0.25
API_KEY=your-admin-api-key
```

## Testing

Run tests: `pnpm test`

## API Endpoints

### Events
- `GET /events` - List all events with current prices
- `GET /events/:id` - Event details with price breakdown
- `POST /events` - Create event (requires API key)

### Bookings
- `POST /bookings` - Create booking
- `GET /bookings?eventId=:id` - List bookings for event

### Analytics
- `GET /analytics/events/:id` - Event analytics
- `GET /analytics/summary` - Overall analytics

### Development
- `POST /seed` - Seed database

## Core Requirements

**1. Database Schema**

Design and implement schema for events and bookings.

**Event must include:**

- Basic info: name, date, venue, description
- Capacity: total tickets, booked tickets
- Pricing: base price, current price, floor, ceiling
- Pricing rules configuration (stored as JSON)

**Booking must include:**

- Reference to event
- User email
- Quantity
- Price paid (snapshot at booking time)
- Booking timestamp

The database package is set up with Drizzle. You need to:

- Create `src/schema.ts` with your table definitions
- Create `src/index.ts` to export the database client
- Create `src/seed.ts` to populate sample data

**2. Dynamic Pricing Engine**

This is the core challenge. Implement logic that calculates ticket price based on three rules:

**Time-Based Rule**

Price increases as event date approaches.

Example: Base price for events 30+ days out, +20% for events within 7 days, +50% for events tomorrow.

**Demand-Based Rule**

Price increases when booking velocity is high.

Example: If more than 10 bookings happened in the last hour, increase price by 15%.

**Inventory-Based Rule**

Price increases as tickets sell out.

Example: When less than 20% of tickets remain, increase price by 25%.

**Implementation requirements:**

- Each rule has a configurable weight (via environment variables)
- Rules combine to produce final price
- Price must respect floor (minimum) and ceiling (maximum)
- Price calculation must be deterministic and testable
- Formula: currentPrice = basePrice × (1 + sum of weighted adjustments)

**3. API Endpoints**

Build a REST API with these endpoints:

**Events**

- `GET /events` - List all events with current price and availability
- `GET /events/:id` - Get single event details with price breakdown
- `POST /events` - Create new event (simple auth is fine)

**Bookings**

- `POST /bookings` - Book tickets (body: eventId, userEmail, quantity)
- `GET /bookings?eventId=:id` - List bookings for an event

**Analytics**

- `GET /analytics/events/:id` - Get metrics for an event (total sold, revenue, average price, remaining)
- `GET /analytics/summary` - System-wide metrics

**Development**

- `POST /seed` - Seed database with sample events

**4. Concurrency Control**

**Critical requirement:** Prevent overselling when multiple users book simultaneously.
When only 1 ticket remains and 2 users try to book at the same time:

- Only 1 booking should succeed
- The other should receive a clear error
- No tickets should be oversold

You must:

- Implement proper transaction handling with row-level locking
- Write an automated test that proves this works

Example test structure:

```ts
typescriptdescribe("Concurrent Bookings", () => {
  it("prevents overbooking of last ticket", async () => {
    // Setup: Create event with 1 ticket remaining
    // Execute: Make 2 simultaneous booking requests
    // Assert: Exactly 1 succeeds, 1 fails with proper error
  });
});
```

**5. Frontend Pages**

Build these pages using Next.js App Router:

**Event List (`/events`)**

- Display all upcoming events
- Show name, date, venue, current price, tickets remaining
- Click event to view details

**Event Detail (`/events/[id]`)**

- Full event information
- Price breakdown showing base price and adjustments from each rule
- Booking form with quantity selector
- Real-time price updates (polling every 30 seconds is fine)

**Booking Confirmation (`/bookings/success`)**

- Show booking details after successful purchase
- Display price paid vs current price

**User Bookings (`/my-bookings`)**

- List user's bookings
- Show event name, tickets, price paid
- Compare price paid to current price

**Technical requirements:**

- Use Server Components where appropriate
- Handle form submission with Server Actions
- Show loading states and error messages
- Responsive design

**Testing Requirements**

**You must include:**

1. Unit tests for pricing calculation logic
   - Test each rule independently
   - Test combined rules
   - Test floor/ceiling constraints

2. Integration tests for booking flow

- Complete flow from price calculation to booking confirmation

3. Concurrency test (mandatory)

- Automated test proving your solution prevents overbooking

Minimum 70% coverage for pricing logic.

**Deliverables**

**1. GitHub Repository**

Include:

- All source code
- README.md with setup instructions
- DESIGN.md explaining your approach
- .env.example files
- Working seed script

**2. README.md**

Must contain:

- Prerequisites (Node version, database, etc)
- Installation steps (should work in under 5 commands)
- How to run the application
- How to run tests
- Environment variables documentation

**3. DESIGN.md**

Write 300-500 words explaining:

- Your pricing algorithm implementation and design choices
- How you solved the concurrency problem
- Monorepo architecture decisions
- Trade-offs you made
- What you would improve with more time

# Output Images

Here are the screenshots of the project output:

![Screenshot 2025-10-23 133757](./Screenshot%202025-10-23%20133757.png)  
![Screenshot 2025-10-23 133826](./Screenshot%202025-10-23%20133826.png)  
![Screenshot 2025-10-23 133915](./Screenshot%202025-10-23%20133915.png)

