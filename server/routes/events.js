const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database/simple-db');

// Get all events
router.get('/', (req, res) => {
  try {
    const database = getDatabase();
    const events = database.getAllEvents();
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single event
router.get('/:id', (req, res) => {
  try {
    const database = getDatabase();
    const { id } = req.params;
    
    const event = database.getEvent(id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new event
router.post('/', (req, res) => {
  try {
    const database = getDatabase();
    const { name, date, location } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Event name is required' });
    }
    
    const event = database.createEvent({ name, date, location });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update event
router.put('/:id', (req, res) => {
  try {
    const database = getDatabase();
    const { id } = req.params;
    const { name, date, location } = req.body;
    
    const event = database.updateEvent(id, { name, date, location });
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete event
router.delete('/:id', (req, res) => {
  try {
    const database = getDatabase();
    const { id } = req.params;
    
    const deleted = database.deleteEvent(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

