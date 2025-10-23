# Design Document: Dynamic Event Ticketing Platform

## Pricing Algorithm Design

The dynamic pricing engine implements three weighted rules that combine to determine ticket prices:

### Time-Based Rule
- **Logic**: Price increases as the event date approaches
- **Formula**: `adjustment = max(0, (30 - daysUntilEvent) / 30) * TIME_WEIGHT`
- **Rationale**: Creates urgency for last-minute buyers while maintaining fair pricing for early bookers
- **Weight**: 0.2 (configurable via TIME_WEIGHT env var)

### Demand-Based Rule
- **Logic**: Price increases when recent booking velocity is high
- **Formula**: `adjustment = (recentBookings / 10) * DEMAND_WEIGHT`
- **Rationale**: Prevents panic buying and ensures fair distribution during high demand periods
- **Weight**: 0.15 (configurable via DEMAND_WEIGHT env var)
- **Time Window**: Last 7 days

### Inventory-Based Rule
- **Logic**: Price increases as tickets become scarce
- **Formula**: `adjustment = ((totalTickets - remainingTickets) / totalTickets) * INVENTORY_WEIGHT`
- **Rationale**: Maximizes revenue from final tickets while preventing artificial scarcity
- **Weight**: 0.25 (configurable via INVENTORY_WEIGHT env var)

### Combined Formula
```
currentPrice = basePrice × (1 + timeAdjustment + demandAdjustment + inventoryAdjustment)
currentPrice = max(floorPrice, min(ceilingPrice, currentPrice))
```

## Concurrency Control Approach

### Problem
Multiple users attempting to book the last remaining ticket simultaneously could result in overselling.

### Solution: Transactional Row-Level Locking
- **Database**: PostgreSQL with Drizzle ORM
- **Locking**: `FOR UPDATE` clause on event row during booking
- **Transaction**: Wrap entire booking logic in database transaction
- **Error Handling**: Clear error messages for failed bookings

### Implementation Details
```typescript
await db.transaction(async (tx) => {
  const event = await tx.select().from(events).where(eq(events.id, eventId)).for('update').limit(1);
  // Check availability and update counts atomically
});
```

### Testing
Automated Jest test simulates concurrent requests using Promise.all() to verify exactly one booking succeeds when racing for the last ticket.

## Monorepo Architecture

### Structure
```
apps/
  api/          # NestJS backend
  web/          # Next.js frontend
packages/
  database/     # Shared Drizzle schema and client
  ui/           # Shared UI components
  eslint-config/
  typescript-config/
```

### Benefits
- **Shared Code**: Database schema and types shared between frontend/backend
- **Independent Deployment**: Apps can be deployed separately
- **Type Safety**: TypeScript ensures consistency across boundaries
- **Tooling**: Unified linting, formatting, and build processes

## Trade-offs and Future Improvements

### Trade-offs Made
1. **Polling vs WebSockets**: Chose simple 30s polling over real-time updates for simplicity
2. **In-memory Calculations**: Pricing computed on-demand rather than cached for accuracy
3. **Simple Auth**: Hardcoded API key instead of JWT for admin operations

### Future Improvements
1. **Caching Layer**: Redis for pricing calculations and event data
2. **Real-time Updates**: WebSockets for instant price changes
3. **Advanced Analytics**: Time-series data for better demand prediction
4. **Queue System**: Background processing for heavy computations
5. **Rate Limiting**: Prevent abuse of booking endpoints
6. **Database Optimization**: Indexing strategy for high-traffic scenarios

### Scalability Considerations
- **Read Replicas**: Separate read/write databases
- **Sharding**: Partition data by event date or region
- **CDN**: Static assets and API responses
- **Load Balancing**: Multiple backend instances

This design balances simplicity with robustness, ensuring the core dynamic pricing and concurrency requirements are met while providing a foundation for future enhancements.