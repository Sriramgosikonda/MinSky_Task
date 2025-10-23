const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const events = [
  {
    id: '1',
    name: 'Concert Night',
    date: '2024-12-01T20:00:00Z',
    venue: 'Madison Square Garden',
    description: 'An amazing concert experience',
    totalTickets: 1000,
    bookedTickets: 150,
    currentPrice: 75.00
  },
  {
    id: '2',
    name: 'Tech Conference',
    date: '2024-11-15T09:00:00Z',
    venue: 'Silicon Valley Convention Center',
    description: 'Latest in technology trends',
    totalTickets: 500,
    bookedTickets: 200,
    currentPrice: 150.00
  },
  {
    id: '3',
    name: 'Sports Event',
    date: '2024-10-30T18:00:00Z',
    venue: 'Stadium Arena',
    description: 'Exciting sports match',
    totalTickets: 2000,
    bookedTickets: 800,
    currentPrice: 50.00
  }
];

app.get('/events', (req, res) => {
  res.json(events);
});

app.get('/events/:id', (req, res) => {
  const event = events.find(e => e.id === req.params.id);
  if (event) {
    res.json(event);
  } else {
    res.status(404).json({ error: 'Event not found' });
  }
});

app.post('/bookings', (req, res) => {
  // Mock booking creation
  const { eventId, quantity } = req.body;
  const event = events.find(e => e.id === eventId);
  if (event && event.totalTickets - event.bookedTickets >= quantity) {
    event.bookedTickets += quantity;
    res.json({ success: true, message: 'Booking created' });
  } else {
    res.status(400).json({ error: 'Not enough tickets available' });
  }
});

app.get('/bookings', (req, res) => {
  // Mock bookings list
  res.json([]);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Mock API server running on http://localhost:${PORT}`);
});