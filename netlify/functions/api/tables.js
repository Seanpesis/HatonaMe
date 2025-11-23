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
        if (path.includes('/event/') && path.includes('/arrangement')) {
          // Get table arrangement for event
          const eventId = path.split('/event/')[1].split('/')[0];
          
          const tables = await new Promise((resolve, reject) => {
            db.all('SELECT * FROM tables WHERE event_id = ? ORDER BY table_number', [eventId], (err, rows) => {
              if (err) reject(err);
              else resolve(rows);
            });
          });
          
          const guests = await new Promise((resolve, reject) => {
            db.all('SELECT * FROM guests WHERE event_id = ? AND table_id IS NOT NULL', [eventId], (err, rows) => {
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
            body: JSON.stringify({ tables, guests })
          };
        } else if (path.includes('/event/')) {
          // Get tables for event
          const eventId = path.split('/event/')[1];
          
          const tables = await new Promise((resolve, reject) => {
            db.all('SELECT * FROM tables WHERE event_id = ? ORDER BY table_number', [eventId], (err, rows) => {
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
            body: JSON.stringify(tables)
          };
        }
        break;
      
      case 'POST':
        if (path.includes('/arrange')) {
          // Arrange tables
          const eventId = path.split('/event/')[1].split('/')[0];
          const arrangeData = JSON.parse(body);
          
          // Update guest table assignments
          for (const assignment of arrangeData.assignments) {
            await new Promise((resolve, reject) => {
              db.run(
                'UPDATE guests SET table_id = ? WHERE id = ?',
                [assignment.tableId, assignment.guestId],
                function(err) {
                  if (err) reject(err);
                  else resolve();
                }
              );
            });
          }
          
          return {
            statusCode: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Headers': 'Content-Type',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
            },
            body: JSON.stringify({ message: 'Table arrangement updated successfully' })
          };
        } else {
          // Create new table
          const eventId = path.split('/event/')[1];
          const tableData = JSON.parse(body);
          
          const newTable = await new Promise((resolve, reject) => {
            db.run(
              'INSERT INTO tables (event_id, table_number, capacity, table_type) VALUES (?, ?, ?, ?)',
              [eventId, tableData.table_number, tableData.capacity, tableData.table_type || 'round'],
              function(err) {
                if (err) reject(err);
                else {
                  db.get('SELECT * FROM tables WHERE id = ?', [this.lastID], (err, row) => {
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
            body: JSON.stringify(newTable)
          };
        }
        break;
      
      case 'DELETE':
        const deleteId = path.split('/').pop();
        
        // Remove table assignments first
        await new Promise((resolve, reject) => {
          db.run('UPDATE guests SET table_id = NULL WHERE table_id = ?', [deleteId], function(err) {
            if (err) reject(err);
            else resolve();
          });
        });
        
        // Delete table
        await new Promise((resolve, reject) => {
          db.run('DELETE FROM tables WHERE id = ?', [deleteId], function(err) {
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
          body: JSON.stringify({ message: 'Table deleted successfully' })
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
    console.error('Tables API error:', error);
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