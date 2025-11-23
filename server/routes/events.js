const express = require('express');
const router = express.Router();
const db = require('../database/db');

// Get all events
router.get('/', (req, res) => {
  const database = db.getDb();
  database.all('SELECT * FROM events ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Get single event
router.get('/:id', (req, res) => {
  const database = db.getDb();
  const { id } = req.params;
  
  database.get('SELECT * FROM events WHERE id = ?', [id], (err, event) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(event);
  });
});

// Create new event
router.post('/', (req, res) => {
  const database = db.getDb();
  const { name, date, location } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Event name is required' });
  }
  
  database.run(
    'INSERT INTO events (name, date, location) VALUES (?, ?, ?)',
    [name, date || null, location || null],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: this.lastID, name, date, location });
    }
  );
});

// Update event
router.put('/:id', (req, res) => {
  const database = db.getDb();
  const { id } = req.params;
  const { name, date, location } = req.body;
  
  database.run(
    'UPDATE events SET name = ?, date = ?, location = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [name, date, location, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Event not found' });
      }
      res.json({ id, name, date, location });
    }
  );
});

// Delete event
router.delete('/:id', (req, res) => {
  const database = db.getDb();
  const { id } = req.params;
  
  database.run('DELETE FROM events WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json({ message: 'Event deleted successfully' });
  });
});

module.exports = router;

