const express = require('express');
const router = express.Router();
const db = require('../database/db');

// Get all guests for an event
router.get('/event/:eventId', (req, res) => {
  const database = db.getDb();
  const { eventId } = req.params;
  
  database.all(
    'SELECT * FROM guests WHERE event_id = ? ORDER BY category, name',
    [eventId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    }
  );
});

// Get single guest
router.get('/:id', (req, res) => {
  const database = db.getDb();
  const { id } = req.params;
  
  database.get('SELECT * FROM guests WHERE id = ?', [id], (err, guest) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!guest) {
      return res.status(404).json({ error: 'Guest not found' });
    }
    res.json(guest);
  });
});

// Update guest
router.put('/:id', (req, res) => {
  const database = db.getDb();
  const { id } = req.params;
  const { name, category, phone, table_number, rsvp_status, rsvp_guests_count, notes } = req.body;
  
  database.run(
    `UPDATE guests SET 
      name = ?, category = ?, phone = ?, table_number = ?, 
      rsvp_status = ?, rsvp_guests_count = ?, notes = ? 
      WHERE id = ?`,
    [name, category, phone, table_number, rsvp_status, rsvp_guests_count, notes, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Guest not found' });
      }
      res.json({ id, name, category, phone, table_number, rsvp_status, rsvp_guests_count, notes });
    }
  );
});

// Delete guest
router.delete('/:id', (req, res) => {
  const database = db.getDb();
  const { id } = req.params;
  
  database.run('DELETE FROM guests WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Guest not found' });
    }
    res.json({ message: 'Guest deleted successfully' });
  });
});

// Update RSVP status
router.post('/:id/rsvp', (req, res) => {
  const database = db.getDb();
  const { id } = req.params;
  const { status, guests_count } = req.body;
  
  database.run(
    'UPDATE guests SET rsvp_status = ?, rsvp_guests_count = ?, rsvp_response_date = CURRENT_TIMESTAMP WHERE id = ?',
    [status, guests_count || 1, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'RSVP updated successfully' });
    }
  );
});

module.exports = router;

