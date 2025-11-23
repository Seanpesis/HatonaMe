const { SimpleDatabase } = require('./database/simple-db');

// Initialize database on cold start
let db = null;
const getDB = () => {
  if (!db) {
    db = new SimpleDatabase();
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
    
    console.log('Events function called:', { httpMethod, path, queryStringParameters });

    switch (httpMethod) {
      case 'GET':
        // Check if this is a request for a specific event
        const eventId = queryStringParameters?.id;
        
        if (!eventId) {
          // Get all events
          const events = database.getAllEvents();
          
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
          const event = database.getEvent(eventId);
          
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
        const newEvent = database.createEvent(eventData);
        
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
        
        const updatedEvent = database.updateEvent(updateId, updateData);
        
        if (!updatedEvent) {
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
        
        const deleted = database.deleteEvent(deleteId);
        
        if (!deleted) {
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