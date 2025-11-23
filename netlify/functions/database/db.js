const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');

// Database path for Netlify Functions
let DB_PATH;
if (process.env.NETLIFY) {
  // In Netlify environment, use /tmp directory
  DB_PATH = '/tmp/wedding_planner.db';
} else {
  // Local development
  DB_PATH = path.join(__dirname, '../../wedding_planner.db');
}

let db = null;
let pgPool = null;
let usePostgreSQL = false;

function init() {
  // Check if DATABASE_URL is set (for PostgreSQL/Supabase)
  if (process.env.DATABASE_URL) {
    usePostgreSQL = true;
    return initPostgreSQL();
  } else {
    // Fallback to SQLite
    return initSQLite();
  }
}

function initPostgreSQL() {
  pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('supabase') ? { rejectUnauthorized: false } : false,
  });

  return createTablesPostgreSQL()
    .then(() => {
      console.log('Connected to PostgreSQL database');
    })
    .catch((err) => {
      console.error('Error connecting to PostgreSQL:', err);
      throw err;
    });
}

function initSQLite() {
  return new Promise((resolve, reject) => {
    // Ensure directory exists
    const dbDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        reject(err);
        return;
      }
      console.log(`Connected to SQLite database at: ${DB_PATH}`);
      createTablesSQLite().then(resolve).catch(reject);
    });
  });
}

function createTablesSQLite() {
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

function createTablesPostgreSQL() {
  const queries = [
    // Events table
    `CREATE TABLE IF NOT EXISTS events (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      date DATE,
      location TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    
    // Guests table
    `CREATE TABLE IF NOT EXISTS guests (
      id SERIAL PRIMARY KEY,
      event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      category TEXT,
      phone TEXT,
      table_number INTEGER,
      rsvp_status TEXT DEFAULT 'pending',
      rsvp_guests_count INTEGER DEFAULT 1,
      rsvp_response_date TIMESTAMP,
      notes TEXT
    )`,
    
    // Tables table
    `CREATE TABLE IF NOT EXISTS tables (
      id SERIAL PRIMARY KEY,
      event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      table_number INTEGER NOT NULL,
      capacity INTEGER DEFAULT 10,
      category TEXT,
      UNIQUE(event_id, table_number)
    )`,
    
    // Invitations table
    `CREATE TABLE IF NOT EXISTS invitations (
      id SERIAL PRIMARY KEY,
      event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      image_path TEXT,
      text_overlay TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    
    // WhatsApp messages table
    `CREATE TABLE IF NOT EXISTS whatsapp_messages (
      id SERIAL PRIMARY KEY,
      event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      guest_id INTEGER REFERENCES guests(id) ON DELETE SET NULL,
      phone TEXT NOT NULL,
      message TEXT,
      sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'sent'
    )`
  ];

  return Promise.all(queries.map(query => pgPool.query(query)))
    .then(() => {
      console.log('PostgreSQL tables created successfully');
    });
}

function getDb() {
  if (usePostgreSQL) {
    if (!pgPool) {
      throw new Error('PostgreSQL database not initialized');
    }
    // Return PostgreSQL adapter that mimics SQLite API
    return {
      all: (query, params, callback) => {
        // Convert ? placeholders to $1, $2, etc for PostgreSQL
        const pgQuery = convertQuery(query);
        pgPool.query(pgQuery, params || [])
          .then(result => callback(null, result.rows))
          .catch(err => callback(err, null));
      },
      get: (query, params, callback) => {
        const pgQuery = convertQuery(query);
        pgPool.query(pgQuery, params || [])
          .then(result => callback(null, result.rows[0] || null))
          .catch(err => callback(err, null));
      },
      run: (query, params, callback) => {
        // For INSERT queries, add RETURNING id if not present
        let pgQuery = convertQuery(query);
        const isInsert = query.trim().toUpperCase().startsWith('INSERT');
        if (isInsert && !pgQuery.toUpperCase().includes('RETURNING')) {
          pgQuery = pgQuery + ' RETURNING id';
        }
        
        pgPool.query(pgQuery, params || [])
          .then(result => {
            if (callback) {
              const context = {
                lastID: result.rows[0]?.id || null,
                changes: result.rowCount || 0
              };
              callback.call(context, null);
            }
          })
          .catch(err => {
            if (callback) callback(err);
          });
      },
      prepare: (query) => {
        let pgQuery = convertQuery(query);
        // For INSERT queries, add RETURNING id if not present
        const isInsert = query.trim().toUpperCase().startsWith('INSERT');
        if (isInsert && !pgQuery.toUpperCase().includes('RETURNING')) {
          pgQuery = pgQuery + ' RETURNING id';
        }
        
        return {
          run: (params, callback) => {
            pgPool.query(pgQuery, params || [])
              .then(result => {
                if (callback) {
                  const context = {
                    lastID: result.rows[0]?.id || null,
                    changes: result.rowCount || 0
                  };
                  callback.call(context, null);
                }
              })
              .catch(err => {
                if (callback) callback(err);
              });
          },
          finalize: (callback) => {
            if (callback) callback(null);
          }
        };
      }
    };
  } else {
    if (!db) {
      throw new Error('SQLite database not initialized');
    }
    return db;
  }
}

// Convert SQLite ? placeholders to PostgreSQL $1, $2, etc
function convertQuery(query) {
  if (!usePostgreSQL) return query;
  
  // If query already has $ placeholders, return as is
  if (query.includes('$1')) return query;
  
  // Convert ? to $1, $2, etc
  let paramIndex = 1;
  return query.replace(/\?/g, () => `$${paramIndex++}`);
}

function close() {
  if (usePostgreSQL && pgPool) {
    return pgPool.end().then(() => {
      console.log('PostgreSQL connection closed');
    });
  } else if (db) {
    return new Promise((resolve, reject) => {
      db.close((err) => {
        if (err) {
          reject(err);
        } else {
          console.log('SQLite connection closed');
          resolve();
        }
      });
    });
  }
  return Promise.resolve();
}

// Initialize database function for Netlify Functions
async function initializeDatabase() {
  if (db && !usePostgreSQL) return db; // Already initialized
  if (pgPool && usePostgreSQL) return pgPool; // Already initialized
  
  try {
    await init();
    return getDb();
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

module.exports = {
  init,
  getDb,
  close,
  initializeDatabase,
  db: () => getDb()
};

