const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/events', require('./routes/events'));
app.use('/api/guests', require('./routes/guests'));
app.use('/api/tables', require('./routes/tables'));
app.use('/api/excel', require('./routes/excel'));
app.use('/api/invitations', require('./routes/invitations'));
app.use('/api/whatsapp', require('./routes/whatsapp'));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Initialize simple database (no initialization needed)
console.log('Using simple JSON database');

// Initialize WhatsApp (optional for local development)
try {
  const whatsappService = require('./services/whatsappService');
  whatsappService.initialize();
} catch (error) {
  console.log('WhatsApp service not available (this is OK for development)');
}

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ ERROR: Port ${PORT} is already in use!`);
    console.error(`\nפתרונות:`);
    console.error(`1. סגור את התהליך הישן:`);
    console.error(`   Windows: netstat -ano | findstr :${PORT}`);
    console.error(`   ואז: taskkill /PID [מספר] /F`);
    console.error(`\n2. או שנה פורט בקובץ .env:`);
    console.error(`   PORT=5001`);
    console.error(`\n3. או לחץ Ctrl+C כאן וסגור את כל החלונות`);
    process.exit(1);
  } else {
    console.error('Server error:', err);
    process.exit(1);
  }
});

