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

// For Netlify Functions, WhatsApp will work differently
// We'll need to use a simpler approach without the session-based authentication
const sendWhatsAppMessage = async (phoneNumber, message) => {
  // This is a placeholder - you would integrate with WhatsApp Business API
  // or another service like Twilio, MessageBird, etc.
  console.log(`Sending WhatsApp to ${phoneNumber}: ${message}`);
  
  // For now, we'll simulate success
  return { success: true, messageId: Date.now().toString() };
};

exports.handler = async (event, context) => {
  await initDB();
  
  const { httpMethod, path, body, queryStringParameters } = event;
  
  try {
    switch (httpMethod) {
      case 'GET':
        if (path.endsWith('/status')) {
          return {
            statusCode: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Headers': 'Content-Type',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
            },
            body: JSON.stringify({ 
              status: 'connected',
              message: 'WhatsApp service ready' 
            })
          };
        }
        break;
      
      case 'POST':
        if (path.includes('/send/')) {
          // Send individual invitation
          const pathParts = path.split('/');
          const eventId = pathParts[pathParts.length - 2];
          const guestId = pathParts[pathParts.length - 1];
          
          // Get event and guest data
          const event = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM events WHERE id = ?', [eventId], (err, row) => {
              if (err) reject(err);
              else resolve(row);
            });
          });
          
          const guest = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM guests WHERE id = ?', [guestId], (err, row) => {
              if (err) reject(err);
              else resolve(row);
            });
          });
          
          if (!event || !guest) {
            return {
              statusCode: 404,
              body: JSON.stringify({ error: 'Event or guest not found' })
            };
          }
          
          // Create RSVP link
          const rsvpLink = `${process.env.URL || 'https://your-site.netlify.app'}/rsvp/${eventId}/${guestId}`;
          
          // Create invitation message
          const message = `שלום ${guest.name}! 🎉\n\nאתה מוזמן לחתונה של ${event.name}\n📅 תאריך: ${event.date}\n📍 מקום: ${event.location}\n\nאנא אשר הגעה:\n${rsvpLink}\n\nנשמח לראותך! ❤️`;
          
          // Send WhatsApp message
          const result = await sendWhatsAppMessage(guest.phone, message);
          
          // Update guest with invitation sent status
          await new Promise((resolve, reject) => {
            db.run(
              'UPDATE guests SET invitation_sent = 1, invitation_sent_at = datetime("now") WHERE id = ?',
              [guestId],
              function(err) {
                if (err) reject(err);
                else resolve();
              }
            );
          });
          
          return {
            statusCode: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Headers': 'Content-Type',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
            },
            body: JSON.stringify({
              success: true,
              message: 'Invitation sent successfully',
              messageId: result.messageId
            })
          };
        } else if (path.includes('/send-bulk/')) {
          // Send bulk invitations
          const eventId = path.split('/send-bulk/')[1];
          const bulkData = JSON.parse(body);
          
          const event = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM events WHERE id = ?', [eventId], (err, row) => {
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
          
          // Get guests to send invitations to
          const guests = await new Promise((resolve, reject) => {
            const guestIds = bulkData.guestIds.map(() => '?').join(',');
            db.all(`SELECT * FROM guests WHERE id IN (${guestIds})`, bulkData.guestIds, (err, rows) => {
              if (err) reject(err);
              else resolve(rows);
            });
          });
          
          const results = [];
          
          for (const guest of guests) {
            try {
              const rsvpLink = `${process.env.URL || 'https://your-site.netlify.app'}/rsvp/${eventId}/${guest.id}`;
              const message = `שלום ${guest.name}! 🎉\n\nאתה מוזמן לחתונה של ${event.name}\n📅 תאריך: ${event.date}\n📍 מקום: ${event.location}\n\nאנא אשר הגעה:\n${rsvpLink}\n\nנשמח לראותך! ❤️`;
              
              const result = await sendWhatsAppMessage(guest.phone, message);
              
              // Update guest
              await new Promise((resolve, reject) => {
                db.run(
                  'UPDATE guests SET invitation_sent = 1, invitation_sent_at = datetime("now") WHERE id = ?',
                  [guest.id],
                  function(err) {
                    if (err) reject(err);
                    else resolve();
                  }
                );
              });
              
              results.push({ guestId: guest.id, success: true, messageId: result.messageId });
            } catch (error) {
              results.push({ guestId: guest.id, success: false, error: error.message });
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
              success: true,
              results: results,
              total: results.length,
              successful: results.filter(r => r.success).length,
              failed: results.filter(r => !r.success).length
            })
          };
        } else if (path.includes('/rsvp/')) {
          // Handle RSVP submission from WhatsApp link
          const pathParts = path.split('/');
          const eventId = pathParts[pathParts.length - 2];
          const guestId = pathParts[pathParts.length - 1];
          const rsvpData = JSON.parse(body);
          
          // Get event and guest data before update
          const event = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM events WHERE id = ?', [eventId], (err, row) => {
              if (err) reject(err);
              else resolve(row);
            });
          });
          
          const guestBefore = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM guests WHERE id = ?', [guestId], (err, row) => {
              if (err) reject(err);
              else resolve(row);
            });
          });
          
          if (!event || !guestBefore) {
            return {
              statusCode: 404,
              body: JSON.stringify({ error: 'Event or guest not found' })
            };
          }
          
          // Update guest RSVP
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
          if (guestBefore.rsvp_status !== rsvpData.status) {
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
              success: true,
              message: 'RSVP updated successfully',
              guest: updatedGuest,
              notification: notificationResult
            })
          };
        }
        break;
      
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
    console.error('WhatsApp API error:', error);
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