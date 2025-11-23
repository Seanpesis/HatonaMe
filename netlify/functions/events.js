const { initializeDatabase } = require('./database/db');

// Initialize database on cold start
let db = null;
const initDB = async () => {
  if (!db) {
    db = await initializeDatabase();
  }
  return db;
};

exports.handler = async (event, context) => {
  // Add CORS headers to all responses
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  };

  // Handle OPTIONS request for CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  try {
    const database = await initDB();
    
    const { httpMethod, body, queryStringParameters } = event;
    const path = event.path || event.rawUrl || '';
    
    console.log('Events function called:', { httpMethod, path, queryStringParameters });

    switch (httpMethod) {
      case 'GET':
        // Check if this is a request for a specific event
        const eventId = queryStringParameters?.id;
        
        if (!eventId) {
          // Get all events
          const events = await new Promise((resolve, reject) => {
            database.all('SELECT * FROM events ORDER BY created_at DESC', (err, rows) => {
              if (err) reject(err);
              else resolve(rows);
            });
          });
          
          return {
            statusCode: 200,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            },
            body: JSON.stringify(events)
          };
        } else {
          // Get single event
          const event = await new Promise((resolve, reject) => {
            database.get('SELECT * FROM events WHERE id = ?', [eventId], (err, row) => {
              if (err) reject(err);
              else resolve(row);
            });
          });
          
          if (!event) {
            return {
              statusCode: 404,
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders
              },
              body: JSON.stringify({ error: 'Event not found' })
            };
          }
          
          return {
            statusCode: 200,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            },
            body: JSON.stringify(event)
          };
        }
      
      case 'POST':
        const eventData = JSON.parse(body);
        const newEvent = await new Promise((resolve, reject) => {
          database.run(
            'INSERT INTO events (name, date, location) VALUES (?, ?, ?)',
            [eventData.name, eventData.date, eventData.location],
            function(err) {
              if (err) reject(err);
              else {
                database.get('SELECT * FROM events WHERE id = ?', [this.lastID], (err, row) => {
                  if (err) reject(err);
                  else resolve(row);
                });
              }
            }
          );
        });
        
        return {
          statusCode: 201,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          },
          body: JSON.stringify(newEvent)
        };
      
      case 'PUT':
        const updateId = queryStringParameters?.id;
        const updateData = JSON.parse(body);
        
        if (!updateId) {
          return {
            statusCode: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            },
            body: JSON.stringify({ error: 'Event ID is required' })
          };
        }
        
        await new Promise((resolve, reject) => {
          database.run(
            'UPDATE events SET name = ?, date = ?, location = ? WHERE id = ?',
            [updateData.name, updateData.date, updateData.location, updateId],
            function(err) {
              if (err) reject(err);
              else resolve();
            }
          );
        });
        
        const updatedEvent = await new Promise((resolve, reject) => {
          database.get('SELECT * FROM events WHERE id = ?', [updateId], (err, row) => {
            if (err) reject(err);
            else resolve(row);
          });
        });
        
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          },
          body: JSON.stringify(updatedEvent)
        };
      
      case 'DELETE':
        const deleteId = queryStringParameters?.id;
        
        if (!deleteId) {
          return {
            statusCode: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            },
            body: JSON.stringify({ error: 'Event ID is required' })
          };
        }
        
        await new Promise((resolve, reject) => {
          database.run('DELETE FROM events WHERE id = ?', [deleteId], function(err) {
            if (err) reject(err);
            else resolve();
          });
        });
        
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          },
          body: JSON.stringify({ message: 'Event deleted successfully' })
        };
      
      default:
        return {
          statusCode: 405,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          },
          body: JSON.stringify({ error: 'Method not allowed' })
        };
    }
  } catch (error) {
    console.error('Events API error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      },
      body: JSON.stringify({ error: 'Internal server error', details: error.message })
    };
  }
};