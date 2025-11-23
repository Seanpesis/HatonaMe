const express = require('express');
const router = express.Router();
const db = require('../database/db');

// Get all tables for an event
router.get('/event/:eventId', (req, res) => {
  const database = db.getDb();
  const { eventId } = req.params;
  
  database.all(
    'SELECT * FROM tables WHERE event_id = ? ORDER BY table_number',
    [eventId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    }
  );
});

// Get table arrangement with guests
router.get('/event/:eventId/arrangement', (req, res) => {
  const database = db.getDb();
  const { eventId } = req.params;
  
  database.all(
    `SELECT t.*, 
     (SELECT COUNT(*) FROM guests WHERE table_number = t.table_number AND event_id = ?) as guest_count,
     (SELECT GROUP_CONCAT(name, ', ') FROM guests WHERE table_number = t.table_number AND event_id = ?) as guest_names
     FROM tables t WHERE t.event_id = ? ORDER BY t.table_number`,
    [eventId, eventId, eventId],
    (err, tables) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      // Get all guests with table assignments
      database.all(
        'SELECT * FROM guests WHERE event_id = ? ORDER BY table_number, name',
        [eventId],
        (err, guests) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          
          res.json({ tables, guests });
        }
      );
    }
  );
});

// Auto-arrange tables based on categories
router.post('/event/:eventId/arrange', (req, res) => {
  const database = db.getDb();
  const { eventId } = req.params;
  const { tableCapacity = 10 } = req.body;
  
  // Get all guests for the event
  database.all(
    'SELECT * FROM guests WHERE event_id = ? ORDER BY category, name',
    [eventId],
    (err, guests) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      // Group guests by category
      const guestsByCategory = {};
      guests.forEach(guest => {
        const category = guest.category || 'אחרים';
        if (!guestsByCategory[category]) {
          guestsByCategory[category] = [];
        }
        guestsByCategory[category].push(guest);
      });
      
      // Arrange tables
      let tableNumber = 1;
      const tableAssignments = [];
      
      Object.keys(guestsByCategory).forEach(category => {
        const categoryGuests = guestsByCategory[category];
        let currentTable = [];
        let currentTableCapacity = 0;
        
        categoryGuests.forEach(guest => {
          const guestCount = guest.rsvp_guests_count || 1;
          
          if (currentTableCapacity + guestCount > tableCapacity && currentTable.length > 0) {
            // Create new table
            tableAssignments.push({
              tableNumber: tableNumber++,
              category: category,
              guests: [...currentTable]
            });
            currentTable = [];
            currentTableCapacity = 0;
          }
          
          currentTable.push(guest);
          currentTableCapacity += guestCount;
        });
        
        // Add remaining guests to a table
        if (currentTable.length > 0) {
          tableAssignments.push({
            tableNumber: tableNumber++,
            category: category,
            guests: [...currentTable]
          });
        }
      });
      
      // Update database
      database.serialize(() => {
        // Clear existing table assignments
        database.run('UPDATE guests SET table_number = NULL WHERE event_id = ?', [eventId]);
        database.run('DELETE FROM tables WHERE event_id = ?', [eventId]);
        
        // Insert new tables and assign guests
        const tableStmt = database.prepare(
          'INSERT INTO tables (event_id, table_number, capacity, category) VALUES (?, ?, ?, ?)'
        );
        const guestStmt = database.prepare(
          'UPDATE guests SET table_number = ? WHERE id = ?'
        );
        
        tableAssignments.forEach(({ tableNumber, category, guests }) => {
          tableStmt.run([eventId, tableNumber, tableCapacity, category]);
          
          guests.forEach(guest => {
            guestStmt.run([tableNumber, guest.id]);
          });
        });
        
        tableStmt.finalize();
        guestStmt.finalize((err) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          res.json({ 
            message: 'Tables arranged successfully',
            tables: tableAssignments
          });
        });
      });
    }
  );
});

// Create manual table
router.post('/event/:eventId', (req, res) => {
  const database = db.getDb();
  const { eventId } = req.params;
  const { table_number, capacity, category } = req.body;
  
  database.run(
    'INSERT INTO tables (event_id, table_number, capacity, category) VALUES (?, ?, ?, ?)',
    [eventId, table_number, capacity || 10, category || null],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: this.lastID, event_id: eventId, table_number, capacity, category });
    }
  );
});

// Delete table
router.delete('/:id', (req, res) => {
  const database = db.getDb();
  const { id } = req.params;
  
  database.run('DELETE FROM tables WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Table deleted successfully' });
  });
});

module.exports = router;

