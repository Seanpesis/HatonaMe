const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const path = require('path');
const fs = require('fs');

let client = null;
let isReady = false;
let qrCode = null;

function initialize() {
  if (client) {
    return;
  }

  client = new Client({
    authStrategy: new LocalAuth({
      dataPath: path.join(__dirname, '../whatsapp-session')
    })
  });

  client.on('qr', (qr) => {
    qrCode = qr;
    console.log('QR Code received, scan it with your phone:');
    qrcode.generate(qr, { small: true });
  });

  client.on('ready', () => {
    isReady = true;
    qrCode = null;
    console.log('WhatsApp client is ready!');
  });

  client.on('authenticated', () => {
    console.log('WhatsApp authenticated');
  });

  client.on('auth_failure', (msg) => {
    console.error('WhatsApp authentication failed:', msg);
    isReady = false;
  });

  client.on('disconnected', (reason) => {
    console.log('WhatsApp client disconnected:', reason);
    isReady = false;
  });

  // Listen for incoming messages (for RSVP responses)
  client.on('message', async (message) => {
    // Handle RSVP responses via WhatsApp
    // This is a basic implementation - you can enhance it
    console.log('Received message:', message.body);
  });

  client.initialize().catch(err => {
    console.error('Error initializing WhatsApp client:', err);
  });
}

async function sendMessage(phoneNumber, message, imagePath = null) {
  if (!isReady) {
    return { success: false, error: 'WhatsApp client is not ready. Please scan QR code first.' };
  }

  try {
    // Format phone number (remove + and ensure it starts with country code)
    let formattedPhone = phoneNumber.replace(/[^0-9]/g, '');
    if (!formattedPhone.startsWith('972')) {
      // Assume Israeli number, add 972 if missing
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '972' + formattedPhone.substring(1);
      } else {
        formattedPhone = '972' + formattedPhone;
      }
    }
    formattedPhone = formattedPhone + '@c.us';

    if (imagePath && fs.existsSync(imagePath)) {
      const media = MessageMedia.fromFilePath(imagePath);
      await client.sendMessage(formattedPhone, media, { caption: message });
    } else {
      await client.sendMessage(formattedPhone, message);
    }

    return { success: true, message: 'Message sent successfully' };
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return { success: false, error: error.message };
  }
}

function getStatus() {
  return {
    isReady,
    qrCode,
    isAuthenticated: isReady
  };
}

function getClient() {
  return client;
}

module.exports = {
  initialize,
  sendMessage,
  getStatus,
  getClient
};

