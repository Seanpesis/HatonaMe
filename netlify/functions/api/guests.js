const { db, initializeDatabase } = require('../../../server/database/db');
const { sendRSVPNotification } = require('../services/notificationService');

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
        if (path.includes('/event/')) {
          // Get guests for specific event
          const eventId = path.split('/event/')[1];
          const guests = await new Promise((resolve, reject) => {
            db.all('SELECT * FROM guests WHERE event_id = ? ORDER BY name', [eventId], (err, rows) => {
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
            body: JSON.stringify(guests)
          };
        } else {
          // Get single guest
          const id = path.split('/').pop();
          const guest = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM guests WHERE id = ?', [id], (err, row) => {
              if (err) reject(err);
              else resolve(row);
            });
          });
          
          if (!guest) {
            return {
              statusCode: 404,
              body: JSON.stringify({ error: 'Guest not found' })
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
            body: JSON.stringify(guest)
          };
        }
      
      case 'POST':
        if (path.includes('/rsvp')) {
          // Handle RSVP submission
          const guestId = path.split('/')[2];
          const rsvpData = JSON.parse(body);
          
          // Get guest and event data before update
          const guestBefore = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM guests WHERE id = ?', [guestId], (err, row) => {
              if (err) reject(err);
              else resolve(row);
            });
          });
          
          if (!guestBefore) {
            return {
              statusCode: 404,
              body: JSON.stringify({ error: 'Guest not found' })
            };
          }
          
          const event = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM events WHERE id = ?', [guestBefore.event_id], (err, row) => {
              if (err) reject(err);
              else resolve(row);
            });
          });
          
          // Update RSVP
          await new Promise((resolve, reject) => {
            db.run(
              'UPDATE guests SET rsvp_status = ?, dietary_restrictions = ?, plus_one = ?, rsvp_date = datetime("now") WHERE id = ?',
              [rsvpData.status, rsvpData.dietary_restrictions, rsvpData.plus_one || 0, guestId],
              function(err) {
                if (err) reject(err);
                else resolve();
              }
            );
          });
          
          const updatedGuest = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM guests WHERE id = ?', [guestId], (err, row) => {
              if (err) reject(err);
              else resolve(row);
            });
          });
          
          // Send notification to admin only if status actually changed
          let notificationResult = null;
          if (event && guestBefore.rsvp_status !== rsvpData.status) {
            try {
              notificationResult = await sendRSVPNotification(updatedGuest, event, rsvpData.status);
            } catch (error) {
              console.error('Failed to send notification:', error);
              // Don't fail the RSVP update if notification fails
            }
          }
          
          return {
            statusCode: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Headers': 'Content-Type',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
            },
            body: JSON.stringify({
              ...updatedGuest,
              notification: notificationResult
            })
          };
        }
        break;
      
      case 'PUT':
        const updateId = path.split('/').pop();
        const updateData = JSON.parse(body);
        
        await new Promise((resolve, reject) => {
          db.run(
            'UPDATE guests SET name = ?, phone = ?, email = ?, rsvp_status = ?, dietary_restrictions = ?, plus_one = ? WHERE id = ?',
            [updateData.name, updateData.phone, updateData.email, updateData.rsvp_status, updateData.dietary_restrictions, updateData.plus_one, updateId],
            function(err) {
              if (err) reject(err);
              else resolve();
            }
          );
        });
        
        const updatedGuest = await new Promise((resolve, reject) => {
          db.get('SELECT * FROM guests WHERE id = ?', [updateId], (err, row) => {
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
          body: JSON.stringify(updatedGuest)
        };
      
      case 'DELETE':
        const deleteId = path.split('/').pop();
        
        await new Promise((resolve, reject) => {
          db.run('DELETE FROM guests WHERE id = ?', [deleteId], function(err) {
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
          body: JSON.stringify({ message: 'Guest deleted successfully' })
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
    console.error('Guests API error:', error);
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