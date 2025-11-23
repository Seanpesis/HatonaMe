// Next.js API route for events - temporary mock data until backend is ready
let events = [
  {
    id: 1,
    name: 'החתונה שלנו',
    date: '2024-06-15',
    location: 'גן אירועים חלומות',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

let nextId = 2;

export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;

  switch (req.method) {
    case 'GET':
      if (id) {
        const event = events.find(e => e.id === parseInt(id));
        if (!event) {
          return res.status(404).json({ error: 'Event not found' });
        }
        return res.status(200).json(event);
      } else {
        return res.status(200).json(events);
      }

    case 'POST':
      const newEvent = {
        id: nextId++,
        name: req.body.name,
        date: req.body.date,
        location: req.body.location,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      events.push(newEvent);
      return res.status(201).json(newEvent);

    case 'PUT':
      if (!id) {
        return res.status(400).json({ error: 'Event ID required' });
      }
      const eventIndex = events.findIndex(e => e.id === parseInt(id));
      if (eventIndex === -1) {
        return res.status(404).json({ error: 'Event not found' });
      }
      events[eventIndex] = {
        ...events[eventIndex],
        name: req.body.name,
        date: req.body.date,
        location: req.body.location,
        updated_at: new Date().toISOString()
      };
      return res.status(200).json(events[eventIndex]);

    case 'DELETE':
      if (!id) {
        return res.status(400).json({ error: 'Event ID required' });
      }
      const deleteIndex = events.findIndex(e => e.id === parseInt(id));
      if (deleteIndex === -1) {
        return res.status(404).json({ error: 'Event not found' });
      }
      events.splice(deleteIndex, 1);
      return res.status(200).json({ message: 'Event deleted successfully' });

    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}