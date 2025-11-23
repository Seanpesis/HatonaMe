const { db, initializeDatabase } = require('../../../server/database/db');

// Initialize database on cold start
let initialized = false;
const initDB = async () => {
  if (!initialized) {
    await initializeDatabase();
    initialized = true;
  }
};

exports.handler = async (event, context) => {
  await initDB();
  
  const { httpMethod, path, body, queryStringParameters } = event;
  
  try {
    switch (httpMethod) {
      case 'GET':
        if (path.endsWith('/events')) {
          // Get all events
          const events = await new Promise((resolve, reject) => {
            db.all('SELECT * FROM events ORDER BY created_at DESC', (err, rows) => {
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
        } else {
          // Get single event
          const id = path.split('/').pop();
          const event = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM events WHERE id = ?', [id], (err, row) => {
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
          db.run(
            'INSERT INTO events (name, date, location, description, budget) VALUES (?, ?, ?, ?, ?)',
            [eventData.name, eventData.date, eventData.location, eventData.description, eventData.budget],
            function(err) {
              if (err) reject(err);
              else {
                db.get('SELECT * FROM events WHERE id = ?', [this.lastID], (err, row) => {
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
          db.run(
            'UPDATE events SET name = ?, date = ?, location = ?, description = ?, budget = ? WHERE id = ?',
            [updateData.name, updateData.date, updateData.location, updateData.description, updateData.budget, updateId],
            function(err) {
              if (err) reject(err);
              else resolve();
            }
          );
        });
        
        const updatedEvent = await new Promise((resolve, reject) => {
          db.get('SELECT * FROM events WHERE id = ?', [updateId], (err, row) => {
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
          db.run('DELETE FROM events WHERE id = ?', [deleteId], function(err) {
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