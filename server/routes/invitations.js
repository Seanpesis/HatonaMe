const express = require('express');
const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const db = require('../database/db');

// Try to load canvas (optional - may not work on Windows without build tools)
let canvas = null;
try {
  canvas = require('canvas');
} catch (err) {
  console.warn('Canvas not available - text overlay on invitations will be disabled');
  console.warn('To enable: Install Visual Studio Build Tools with C++ workload');
}

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/invitations'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'invitation-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Upload invitation image with text overlay
router.post('/upload/:eventId', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }

  const { eventId } = req.params;
  const { text, position = 'bottom' } = req.body;
  const database = db.getDb();

  try {
    let finalImagePath = req.file.path;

    // If text is provided, add text overlay (only if canvas is available)
    if (text && canvas) {
      try {
        const { createCanvas, loadImage } = canvas;
        const image = await loadImage(req.file.path);
        const canvasObj = createCanvas(image.width, image.height);
        const ctx = canvasObj.getContext('2d');

        // Draw original image
        ctx.drawImage(image, 0, 0);

        // Add text overlay
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 3;
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const textX = canvasObj.width / 2;
        let textY;
        
        if (position === 'top') {
          textY = 100;
        } else if (position === 'bottom') {
          textY = canvasObj.height - 100;
        } else {
          textY = canvasObj.height / 2;
        }

        // Draw text with stroke
        ctx.strokeText(text, textX, textY);
        ctx.fillText(text, textX, textY);

        // Save the image with text
        const buffer = canvasObj.toBuffer('image/png');
        const outputPath = req.file.path.replace(path.extname(req.file.path), '-with-text.png');
        await sharp(buffer).toFile(outputPath);
        finalImagePath = outputPath;
      } catch (err) {
        console.warn('Could not add text overlay:', err.message);
        // Continue without text overlay
      }
    } else if (text && !canvas) {
      console.warn('Text overlay requested but canvas is not available');
    }

    // Save to database
    database.run(
      'INSERT INTO invitations (event_id, image_path, text_overlay) VALUES (?, ?, ?)',
      [eventId, finalImagePath, text || null],
      function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({
          id: this.lastID,
          event_id: eventId,
          image_path: finalImagePath,
          text_overlay: text
        });
      }
    );
  } catch (error) {
    console.error('Error processing invitation:', error);
    res.status(500).json({ error: 'Error processing invitation: ' + error.message });
  }
});

// Get invitation for event
router.get('/event/:eventId', (req, res) => {
  const database = db.getDb();
  const { eventId } = req.params;
  
  database.get(
    'SELECT * FROM invitations WHERE event_id = ? ORDER BY created_at DESC LIMIT 1',
    [eventId],
    (err, invitation) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!invitation) {
        return res.status(404).json({ error: 'No invitation found for this event' });
      }
      res.json(invitation);
    }
  );
});

// Serve invitation image
router.get('/image/:id', (req, res) => {
  const database = db.getDb();
  const { id } = req.params;
  
  database.get('SELECT image_path FROM invitations WHERE id = ?', [id], (err, invitation) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!invitation || !invitation.image_path) {
      return res.status(404).json({ error: 'Invitation image not found' });
    }
    const imagePath = path.resolve(invitation.image_path);
    res.sendFile(imagePath, (err) => {
      if (err) {
        console.error('Error sending file:', err);
        res.status(500).json({ error: 'Error serving image' });
      }
    });
  });
});

module.exports = router;

