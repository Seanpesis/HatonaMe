const { initializeDatabase } = require('../database/db');

// Initialize database on cold start
let db = null;
const initDB = async () => {
  if (!db) {
    db = await initializeDatabase();
  }
  return db;
};

exports.handler = async (event, context) => {
  const database = await initDB();
  
  const { httpMethod, body, queryStringParameters } = event;
  const path = event.path || event.rawUrl || '';
  
  console.log('Events function called:', { httpMethod, path, body });
  
  try {
    switch (httpMethod) {
      case 'GET':
        if (path.includes('/events') && !path.includes('/events/')) {
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
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Headers': 'Content-Type',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
            },
            body: JSON.stringify(events)
          };
        } else if (path.includes('/events/')) {
          // Get single event
          const pathParts = path.split('/');
          const id = pathParts[pathParts.length - 1] || queryStringParameters?.id;
          if (!id) {
            return {
              statusCode: 400,
              body: JSON.stringify({ error: 'Event ID is required' })
            };
          }

          const event = await new Promise((resolve, reject) => {
            database.get('SELECT * FROM events WHERE id = ?', [id], (err, row) => {
              if (err) reject(err);
              else resolve(row);
            });
          });
          
          if (!event) {
            return {
              statusCode: 404,
              body: JSON.stringify({ error: 'Event not found' })
            };
          }
          
          return {
            statusCode: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Headers': 'Content-Type',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
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
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
          },
          body: JSON.stringify(newEvent)
        };
      
      case 'PUT':
        const updateId = path.split('/').pop();
        const updateData = JSON.parse(body);
        
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
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
          },
          body: JSON.stringify(updatedEvent)
        };
      
      case 'DELETE':
        const deleteId = path.split('/').pop();
        
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
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
          },
          body: JSON.stringify({ message: 'Event deleted successfully' })
        };
      
      case 'OPTIONS':
        return {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
          }
        };
      
      default:
        return {
          statusCode: 405,
          body: JSON.stringify({ error: 'Method not allowed' })
        };
    }
  } catch (error) {
    console.error('Events API error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};