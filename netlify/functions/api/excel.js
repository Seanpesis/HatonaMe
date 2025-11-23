const { db, initializeDatabase } = require('../../../server/database/db');
const multer = require('multer');
const xlsx = require('xlsx');

// Initialize database on cold start
let initialized = false;
const initDB = async () => {
  if (!initialized) {
    await initializeDatabase();
    initialized = true;
  }
};

// Parse multipart form data for file uploads
const parseMultipartData = (body, boundary) => {
  const parts = [];
  const chunks = body.split(`--${boundary}`);
  
  for (let i = 1; i < chunks.length - 1; i++) {
    const part = chunks[i];
    const [headers, ...contentParts] = part.split('\r\n\r\n');
    const content = contentParts.join('\r\n\r\n').replace(/\r\n$/, '');
    
    if (content) {
      const headerLines = headers.split('\r\n');
      const contentDisposition = headerLines.find(h => h.includes('Content-Disposition'));
      
      if (contentDisposition) {
        const nameMatch = contentDisposition.match(/name="([^"]+)"/);
        const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
        
        if (nameMatch) {
          parts.push({
            name: nameMatch[1],
            filename: filenameMatch ? filenameMatch[1] : null,
            content: content
          });
        }
      }
    }
  }
  
  return parts;
};

exports.handler = async (event, context) => {
  await initDB();
  
  const { httpMethod, path, body, headers } = event;
  
  try {
    if (httpMethod === 'POST' && path.includes('/upload/')) {
      const eventId = path.split('/upload/')[1];
      
      // Parse multipart data
      const contentType = headers['content-type'] || headers['Content-Type'];
      const boundary = contentType.split('boundary=')[1];
      
      if (!boundary) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Missing boundary in multipart data' })
        };
      }
      
      const parts = parseMultipartData(body, boundary);
      const filePart = parts.find(p => p.filename);
      
      if (!filePart) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'No file uploaded' })
        };
      }
      
      try {
        // Convert base64 content to buffer
        const fileBuffer = Buffer.from(filePart.content, 'base64');
        
        // Parse Excel file
        const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = xlsx.utils.sheet_to_json(worksheet);
        
        let addedCount = 0;
        const errors = [];
        
        for (const row of jsonData) {
          try {
            // Map common Hebrew column names
            const name = row['שם'] || row['Name'] || row['name'] || '';
            const phone = row['טלפון'] || row['Phone'] || row['phone'] || '';
            const email = row['אימייל'] || row['Email'] || row['email'] || '';
            
            if (!name || !phone) {
              errors.push(`שורה ${jsonData.indexOf(row) + 2}: חסר שם או טלפון`);
              continue;
            }
            
            // Clean phone number
            let cleanPhone = phone.toString().replace(/\D/g, '');
            if (cleanPhone.startsWith('972')) {
              cleanPhone = '0' + cleanPhone.substring(3);
            }
            
            // Insert guest
            await new Promise((resolve, reject) => {
              db.run(
                'INSERT INTO guests (event_id, name, phone, email) VALUES (?, ?, ?, ?)',
                [eventId, name, cleanPhone, email || null],
                function(err) {
                  if (err) reject(err);
                  else resolve();
                }
              );
            });
            
            addedCount++;
          } catch (error) {
            errors.push(`שורה ${jsonData.indexOf(row) + 2}: ${error.message}`);
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
            message: `${addedCount} אורחים נוספו בהצלחה`,
            addedCount,
            errors,
            totalRows: jsonData.length
          })
        };
        
      } catch (error) {
        return {
          statusCode: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({
            error: 'שגיאה בעיבוד קובץ Excel',
            details: error.message
          })
        };
      }
    }
    
    if (httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS'
        }
      };
    }
    
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
    
  } catch (error) {
    console.error('Excel API error:', error);
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