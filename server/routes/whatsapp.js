const express = require('express');
const router = express.Router();
const whatsappService = require('../services/whatsappService');
const db = require('../database/db');
const QRCode = require('qrcode');

// Get WhatsApp connection status
router.get('/status', async (req, res) => {
  const status = whatsappService.getStatus();
  
  // If there's a QR code, generate it as data URL
  if (status.qrCode) {
    try {
      const qrDataUrl = await QRCode.toDataURL(status.qrCode);
      status.qrCodeImage = qrDataUrl;
    } catch (err) {
      console.error('Error generating QR code image:', err);
    }
  }
  
  res.json(status);
});

// Send invitation to single guest
router.post('/send/:eventId/:guestId', async (req, res) => {
  const { eventId, guestId } = req.params;
  const database = db.getDb();

  try {
    // Get guest and invitation
    const guest = await new Promise((resolve, reject) => {
      database.get('SELECT * FROM guests WHERE id = ? AND event_id = ?', [guestId, eventId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!guest) {
      return res.status(404).json({ error: 'Guest not found' });
    }

    if (!guest.phone) {
      return res.status(400).json({ error: 'Guest phone number is missing' });
    }

    const invitation = await new Promise((resolve, reject) => {
      database.get('SELECT * FROM invitations WHERE event_id = ? ORDER BY created_at DESC LIMIT 1', [eventId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    // Create message with RSVP link
    const rsvpLink = `${process.env.BASE_URL || 'https://hatoname.netlify.app'}/rsvp/${eventId}/${guestId}`;
    let message = `שלום ${guest.name},\n\nאנחנו שמחים להזמין אותך לחתונה שלנו!\n\n`;
    
    if (invitation && invitation.text_overlay) {
      message += `${invitation.text_overlay}\n\n`;
    }
    
    message += `אנא אשר/י הגעה דרך הקישור הבא:\n${rsvpLink}\n\nתודה!`;

    // Send via WhatsApp
    const result = await whatsappService.sendMessage(guest.phone, message, invitation?.image_path);

    // Save message to database
    database.run(
      'INSERT INTO whatsapp_messages (event_id, guest_id, phone, message, status) VALUES (?, ?, ?, ?, ?)',
      [eventId, guestId, guest.phone, message, result.success ? 'sent' : 'failed'],
      (err) => {
        if (err) {
          console.error('Error saving message:', err);
        }
      }
    );

    res.json(result);
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    res.status(500).json({ error: error.message });
  }
});

// Send invitations to multiple guests
router.post('/send-bulk/:eventId', async (req, res) => {
  const { eventId } = req.params;
  const { guestIds, category } = req.body;
  const database = db.getDb();

  try {
    let query = 'SELECT * FROM guests WHERE event_id = ?';
    const params = [eventId];

    if (guestIds && guestIds.length > 0) {
      query += ' AND id IN (' + guestIds.map(() => '?').join(',') + ')';
      params.push(...guestIds);
    } else if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    const guests = await new Promise((resolve, reject) => {
      database.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    const invitation = await new Promise((resolve, reject) => {
      database.get('SELECT * FROM invitations WHERE event_id = ? ORDER BY created_at DESC LIMIT 1', [eventId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    const results = [];
    for (const guest of guests) {
      if (!guest.phone) {
        results.push({ guest: guest.name, success: false, error: 'No phone number' });
        continue;
      }

      const rsvpLink = `${process.env.BASE_URL || 'https://hatoname.netlify.app'}/rsvp/${eventId}/${guest.id}`;
      let message = `שלום ${guest.name},\n\nאנחנו שמחים להזמין אותך לחתונה שלנו!\n\n`;
      
      if (invitation && invitation.text_overlay) {
        message += `${invitation.text_overlay}\n\n`;
      }
      
      message += `אנא אשר/י הגעה דרך הקישור הבא:\n${rsvpLink}\n\nתודה!`;

      try {
        const result = await whatsappService.sendMessage(guest.phone, message, invitation?.image_path);
        results.push({ guest: guest.name, ...result });

        database.run(
          'INSERT INTO whatsapp_messages (event_id, guest_id, phone, message, status) VALUES (?, ?, ?, ?, ?)',
          [eventId, guest.id, guest.phone, message, result.success ? 'sent' : 'failed']
        );
      } catch (error) {
        results.push({ guest: guest.name, success: false, error: error.message });
      }
    }

    res.json({ results, total: results.length });
  } catch (error) {
    console.error('Error sending bulk messages:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get RSVP response (for webhook)
router.post('/rsvp/:eventId/:guestId', (req, res) => {
  const { eventId, guestId } = req.params;
  const { status, guests_count } = req.body;
  const database = db.getDb();

  database.run(
    'UPDATE guests SET rsvp_status = ?, rsvp_guests_count = ?, rsvp_response_date = CURRENT_TIMESTAMP WHERE id = ? AND event_id = ?',
    [status, guests_count || 1, guestId, eventId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'RSVP updated successfully' });
    }
  );
});

module.exports = router;

