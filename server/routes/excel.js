const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const path = require('path');
const db = require('../database/db');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'excel-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.xlsx' || ext === '.xls') {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed'));
    }
  }
});

// Upload and parse Excel file
router.post('/upload/:eventId', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const { eventId } = req.params;
  const database = db.getDb();

  try {
    // Read Excel file
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    if (data.length === 0) {
      return res.status(400).json({ error: 'Excel file is empty' });
    }

    // Insert guests into database
    const guests = [];
    database.serialize(() => {
      const stmt = database.prepare(
        'INSERT INTO guests (event_id, name, category, phone, rsvp_guests_count) VALUES (?, ?, ?, ?, ?)'
      );

      data.forEach((row) => {
        // Handle Hebrew column names - common variations
        const name = row['שם'] || row['שם מלא'] || row['name'] || row['Name'] || '';
        const category = row['קטגוריה'] || row['category'] || row['Category'] || '';
        const phone = row['טלפון'] || row['phone'] || row['Phone'] || '';
        const count = parseInt(row['כמות'] || row['כמות מוזמנים'] || row['count'] || row['Count'] || 1);

        if (name) {
          stmt.run([eventId, name, category, phone, count], function(err) {
            if (err) {
              console.error('Error inserting guest:', err);
            } else {
              guests.push({
                id: this.lastID,
                name,
                category,
                phone,
                count: count
              });
            }
          });
        }
      });

      stmt.finalize((err) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ 
          message: 'Excel file processed successfully',
          guests: guests,
          total: guests.length
        });
      });
    });
  } catch (error) {
    console.error('Error processing Excel file:', error);
    res.status(500).json({ error: 'Error processing Excel file: ' + error.message });
  }
});

module.exports = router;

