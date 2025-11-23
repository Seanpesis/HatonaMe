const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../../wedding_planner.db');

let db = null;

function init() {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        reject(err);
        return;
      }
      console.log('Connected to SQLite database');
      createTables().then(resolve).catch(reject);
    });
  });
}

function createTables() {
  return new Promise((resolve, reject) => {
    const queries = [
      // Events table
      `CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        date TEXT,
        location TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Guests table
      `CREATE TABLE IF NOT EXISTS guests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        category TEXT,
        phone TEXT,
        table_number INTEGER,
        rsvp_status TEXT DEFAULT 'pending',
        rsvp_guests_count INTEGER DEFAULT 1,
        rsvp_response_date DATETIME,
        notes TEXT,
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
      )`,
      
      // Tables table
      `CREATE TABLE IF NOT EXISTS tables (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id INTEGER NOT NULL,
        table_number INTEGER NOT NULL,
        capacity INTEGER DEFAULT 10,
        category TEXT,
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
        UNIQUE(event_id, table_number)
      )`,
      
      // Invitations table
      `CREATE TABLE IF NOT EXISTS invitations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id INTEGER NOT NULL,
        image_path TEXT,
        text_overlay TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
      )`,
      
      // WhatsApp messages table
      `CREATE TABLE IF NOT EXISTS whatsapp_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id INTEGER NOT NULL,
        guest_id INTEGER,
        phone TEXT NOT NULL,
        message TEXT,
        sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'sent',
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
        FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE SET NULL
      )`
    ];

    let completed = 0;
    queries.forEach((query, index) => {
      db.run(query, (err) => {
        if (err) {
          console.error(`Error creating table ${index}:`, err);
          reject(err);
          return;
        }
        completed++;
        if (completed === queries.length) {
          resolve();
        }
      });
    });
  });
}

function getDb() {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
}

function close() {
  return new Promise((resolve, reject) => {
    if (db) {
      db.close((err) => {
        if (err) {
          reject(err);
        } else {
          console.log('Database connection closed');
          resolve();
        }
      });
    } else {
      resolve();
    }
  });
}

module.exports = {
  init,
  getDb,
  close
};

