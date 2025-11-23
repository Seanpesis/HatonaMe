const { SupabaseDatabase } = require('./database/supabase');

// Initialize database on cold start
let db = null;
const getDB = () => {
  if (!db) {
    db = new SupabaseDatabase();
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
    const database = getDB();
    
    const { httpMethod, body, queryStringParameters } = event;
    const path = event.path || event.rawUrl || '';
    
    console.log('Guests function called:', { httpMethod, path, queryStringParameters });

    switch (httpMethod) {
      case 'GET':
        const eventId = queryStringParameters?.event_id;
        const guestId = queryStringParameters?.id;
        
        if (guestId) {
          // Get single guest
          const guest = await database.getGuest(guestId);
          
          if (!guest) {
            return {
              statusCode: 404,
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders
              },
              body: JSON.stringify({ error: 'Guest not found' })
            };
          }
          
          return {
            statusCode: 200,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            },
            body: JSON.stringify(guest)
          };
        } else if (eventId) {
          // Get guests for specific event
          const guests = await database.getGuests(eventId);
          
          return {
            statusCode: 200,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            },
            body: JSON.stringify(guests)
          };
        } else {
          return {
            statusCode: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            },
            body: JSON.stringify({ error: 'event_id or id parameter is required' })
          };
        }
      
      case 'POST':
        const guestData = JSON.parse(body);
        
        if (!guestData.event_id) {
          return {
            statusCode: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            },
            body: JSON.stringify({ error: 'event_id is required' })
          };
        }
        
        const newGuest = await database.createGuest(guestData);
        
        return {
          statusCode: 201,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          },
          body: JSON.stringify(newGuest)
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
            body: JSON.stringify({ error: 'Guest ID is required' })
          };
        }

        // Check if this is an RSVP update
        if (updateData.rsvp_status) {
          const updatedGuest = await database.updateGuestRSVP(updateId, updateData);
          
          if (!updatedGuest) {
            return {
              statusCode: 404,
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders
              },
              body: JSON.stringify({ error: 'Guest not found' })
            };
          }

          // TODO: Send WhatsApp notification to event owner
          
          return {
            statusCode: 200,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            },
            body: JSON.stringify(updatedGuest)
          };
        } else {
          // Regular guest update
          const updatedGuest = await database.updateGuest(updateId, updateData);
          
          if (!updatedGuest) {
            return {
              statusCode: 404,
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders
              },
              body: JSON.stringify({ error: 'Guest not found' })
            };
          }
          
          return {
            statusCode: 200,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            },
            body: JSON.stringify(updatedGuest)
          };
        }
      
      case 'DELETE':
        const deleteId = queryStringParameters?.id;
        
        if (!deleteId) {
          return {
            statusCode: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            },
            body: JSON.stringify({ error: 'Guest ID is required' })
          };
        }
        
        const deleted = await database.deleteGuest(deleteId);
        
        if (!deleted) {
          return {
            statusCode: 404,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            },
            body: JSON.stringify({ error: 'Guest not found' })
          };
        }
        
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          },
          body: JSON.stringify({ message: 'Guest deleted successfully' })
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
    console.error('Guests API error:', error);
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