const Database = require('better-sqlite3');
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
    try {
      // Ensure directory exists
      const dbDir = path.dirname(DB_PATH);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }
      
      db = new Database(DB_PATH);
      console.log(`Connected to SQLite database at: ${DB_PATH}`);
      
      createTablesSQLite().then(resolve).catch(reject);
    } catch (err) {
      console.error('Error opening database:', err);
      reject(err);
    }
  });
}

function createTablesSQLite() {
  return new Promise((resolve, reject) => {
    try {
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
          table_id INTEGER,
          rsvp_status TEXT DEFAULT 'pending',
          plus_one INTEGER DEFAULT 0,
          dietary_restrictions TEXT,
          rsvp_date DATETIME,
          invitation_sent INTEGER DEFAULT 0,
          invitation_sent_at DATETIME,
          notes TEXT,
          FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
        )`,
        
        // Tables table
        `CREATE TABLE IF NOT EXISTS tables (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          event_id INTEGER NOT NULL,
          table_number INTEGER NOT NULL,
          capacity INTEGER DEFAULT 10,
          table_type TEXT DEFAULT 'round',
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

      // Execute all queries synchronously with better-sqlite3
      queries.forEach((query, index) => {
        try {
          db.exec(query);
          console.log(`Created table ${index + 1}/${queries.length}`);
        } catch (err) {
          console.error(`Error creating table ${index}:`, err);
          throw err;
        }
      });
      
      console.log('All SQLite tables created successfully');
      resolve();
    } catch (error) {
      reject(error);
    }
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
    // Return PostgreSQL adapter that mimics better-sqlite3 API
    return {
      all: (query, params, callback) => {
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
      }
    };
  } else {
    if (!db) {
      throw new Error('SQLite database not initialized');
    }
    
    // Return adapter that converts better-sqlite3 to callback-style API
    return {
      all: (query, params, callback) => {
        try {
          const stmt = db.prepare(query);
          const rows = stmt.all(params || []);
          callback(null, rows);
        } catch (err) {
          callback(err, null);
        }
      },
      get: (query, params, callback) => {
        try {
          const stmt = db.prepare(query);
          const row = stmt.get(params || []);
          callback(null, row || null);
        } catch (err) {
          callback(err, null);
        }
      },
      run: (query, params, callback) => {
        try {
          const stmt = db.prepare(query);
          const result = stmt.run(params || []);
          
          if (callback) {
            const context = {
              lastID: result.lastInsertRowid || null,
              changes: result.changes || 0
            };
            callback.call(context, null);
          }
        } catch (err) {
          if (callback) callback(err);
        }
      }
    };
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
    try {
      db.close();
      console.log('SQLite connection closed');
      return Promise.resolve();
    } catch (err) {
      return Promise.reject(err);
    }
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

