// Simple JSON database for Netlify Functions
const fs = require('fs');
const path = require('path');

// Database file path
const DB_FILE = '/tmp/wedding_database.json';

// Initialize empty database structure
const EMPTY_DB = {
  events: [],
  guests: [],
  tables: [],
  invitations: [],
  whatsapp_messages: [],
  lastId: {
    events: 0,
    guests: 0,
    tables: 0,
    invitations: 0,
    whatsapp_messages: 0
  }
};

// Load database from file or create new one
function loadDatabase() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.log('Error loading database, creating new one:', error.message);
  }
  
  // Return empty database if file doesn't exist or is corrupted
  return { ...EMPTY_DB };
}

// Save database to file
function saveDatabase(db) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving database:', error);
    return false;
  }
}

// Get next ID for table
function getNextId(db, table) {
  db.lastId[table] = (db.lastId[table] || 0) + 1;
  return db.lastId[table];
}

// Database operations
class SimpleDatabase {
  constructor() {
    this.db = loadDatabase();
  }

  // Events operations
  getAllEvents() {
    return this.db.events.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  getEvent(id) {
    return this.db.events.find(event => event.id == id);
  }

  createEvent(eventData) {
    const event = {
      id: getNextId(this.db, 'events'),
      name: eventData.name,
      date: eventData.date,
      location: eventData.location,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    this.db.events.push(event);
    saveDatabase(this.db);
    return event;
  }

  updateEvent(id, eventData) {
    const eventIndex = this.db.events.findIndex(event => event.id == id);
    if (eventIndex === -1) return null;
    
    this.db.events[eventIndex] = {
      ...this.db.events[eventIndex],
      name: eventData.name,
      date: eventData.date,
      location: eventData.location,
      updated_at: new Date().toISOString()
    };
    
    saveDatabase(this.db);
    return this.db.events[eventIndex];
  }

  deleteEvent(id) {
    const eventIndex = this.db.events.findIndex(event => event.id == id);
    if (eventIndex === -1) return false;
    
    // Also delete related data
    this.db.guests = this.db.guests.filter(guest => guest.event_id != id);
    this.db.tables = this.db.tables.filter(table => table.event_id != id);
    this.db.invitations = this.db.invitations.filter(inv => inv.event_id != id);
    
    this.db.events.splice(eventIndex, 1);
    saveDatabase(this.db);
    return true;
  }

  // Guests operations
  getGuests(eventId) {
    return this.db.guests
      .filter(guest => guest.event_id == eventId)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  getGuest(id) {
    return this.db.guests.find(guest => guest.id == id);
  }

  createGuest(guestData) {
    const guest = {
      id: getNextId(this.db, 'guests'),
      event_id: guestData.event_id,
      name: guestData.name,
      category: guestData.category || null,
      phone: guestData.phone || null,
      email: guestData.email || null,
      table_id: null,
      rsvp_status: 'pending',
      plus_one: 0,
      dietary_restrictions: null,
      rsvp_date: null,
      invitation_sent: 0,
      invitation_sent_at: null
    };
    
    this.db.guests.push(guest);
    saveDatabase(this.db);
    return guest;
  }

  updateGuest(id, guestData) {
    const guestIndex = this.db.guests.findIndex(guest => guest.id == id);
    if (guestIndex === -1) return null;
    
    this.db.guests[guestIndex] = {
      ...this.db.guests[guestIndex],
      ...guestData
    };
    
    saveDatabase(this.db);
    return this.db.guests[guestIndex];
  }

  updateGuestRSVP(id, rsvpData) {
    const guestIndex = this.db.guests.findIndex(guest => guest.id == id);
    if (guestIndex === -1) return null;
    
    this.db.guests[guestIndex] = {
      ...this.db.guests[guestIndex],
      rsvp_status: rsvpData.status,
      plus_one: rsvpData.plus_one || 0,
      dietary_restrictions: rsvpData.dietary_restrictions || null,
      rsvp_date: new Date().toISOString()
    };
    
    saveDatabase(this.db);
    return this.db.guests[guestIndex];
  }

  deleteGuest(id) {
    const guestIndex = this.db.guests.findIndex(guest => guest.id == id);
    if (guestIndex === -1) return false;
    
    this.db.guests.splice(guestIndex, 1);
    saveDatabase(this.db);
    return true;
  }

  // Initialize database if needed
  initialize() {
    // Database is already loaded in constructor
    return Promise.resolve();
  }

  // For compatibility with old code
  all(query, params, callback) {
    // This is a simplified version - you'd need to implement SQL-like queries
    // For now, just handle basic cases
    setTimeout(() => {
      if (query.includes('SELECT * FROM events')) {
        callback(null, this.getAllEvents());
      } else {
        callback(null, []);
      }
    }, 0);
  }

  get(query, params, callback) {
    setTimeout(() => {
      if (query.includes('SELECT * FROM events WHERE id')) {
        const event = this.getEvent(params[0]);
        callback(null, event || null);
      } else {
        callback(null, null);
      }
    }, 0);
  }

  run(query, params, callback) {
    setTimeout(() => {
      if (query.includes('INSERT INTO events')) {
        const event = this.createEvent({
          name: params[0],
          date: params[1],
          location: params[2]
        });
        callback.call({ lastID: event.id }, null);
      } else {
        callback(null);
      }
    }, 0);
  }
}

// Export functions for compatibility
let dbInstance = null;

async function initializeDatabase() {
  if (!dbInstance) {
    dbInstance = new SimpleDatabase();
    await dbInstance.initialize();
  }
  return dbInstance;
}

module.exports = {
  initializeDatabase,
  SimpleDatabase
};