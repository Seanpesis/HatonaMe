const { Pool } = require('pg');

let pool = null;

function init() {
  // Get connection string from environment
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.warn('DATABASE_URL not set - using SQLite fallback');
    return Promise.resolve();
  }

  pool = new Pool({
    connectionString: connectionString,
    ssl: connectionString.includes('supabase') ? { rejectUnauthorized: false } : false,
  });

  return createTables();
}

function createTables() {
  if (!pool) {
    return Promise.resolve();
  }

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

  return Promise.all(queries.map(query => pool.query(query)))
    .then(() => {
      console.log('PostgreSQL tables created successfully');
    })
    .catch(err => {
      console.error('Error creating PostgreSQL tables:', err);
      throw err;
    });
}

function getDb() {
  if (!pool) {
    throw new Error('Database not initialized - DATABASE_URL not set');
  }
  return pool;
}

function query(text, params) {
  return pool.query(text, params);
}

function close() {
  if (pool) {
    return pool.end();
  }
  return Promise.resolve();
}

module.exports = {
  init,
  getDb,
  query,
  close
};

