// Notification configuration for RSVP updates
const ADMIN_CONFIG = {
  whatsapp: {
    enabled: true,
    phone: "972545608972", // Admin WhatsApp number (without +)
  },
  email: {
    enabled: true,
    address: "sean.pesis1@gmail.com",
    service: "emailjs", // Using EmailJS for client-side email
    // These will be set in Netlify environment variables
    serviceId: process.env.EMAILJS_SERVICE_ID || "service_default",
    templateId: process.env.EMAILJS_TEMPLATE_ID || "template_default",
    userId: process.env.EMAILJS_USER_ID || "user_default",
  },
  siteUrl: "https://hatoname.netlify.app"
};

// Message templates
const MESSAGE_TEMPLATES = {
  whatsapp: {
    confirmed: (guestName, eventName, guestsCount) => 
      `✅ אישור הגעה התקבל!\n\n👤 ${guestName}\n🎉 ${eventName}\n👥 מספר מוזמנים: ${guestsCount}\n\n📊 לצפייה במצב כללי:\n${ADMIN_CONFIG.siteUrl}`,
    
    declined: (guestName, eventName) => 
      `❌ ביטול הגעה התקבל\n\n👤 ${guestName}\n🎉 ${eventName}\n\n📊 לצפייה במצב כללי:\n${ADMIN_CONFIG.siteUrl}`,
    
    pending: (guestName, eventName) => 
      `⏳ עדכון סטטוס התקבל\n\n👤 ${guestName}\n🎉 ${eventName}\n📝 סטטוס: ממתין לתשובה\n\n📊 לצפייה במצב כללי:\n${ADMIN_CONFIG.siteUrl}`
  },
  
  email: {
    subject: (eventName) => `עדכון RSVP - ${eventName}`,
    
    confirmed: (guestName, eventName, guestsCount) => 
      `אישור הגעה התקבל!\n\nמוזמן: ${guestName}\nאירוע: ${eventName}\nמספר מוזמנים: ${guestsCount}\n\nלצפייה במצב כללי של האירוע:\n${ADMIN_CONFIG.siteUrl}`,
    
    declined: (guestName, eventName) => 
      `ביטול הגעה התקבל\n\nמוזמן: ${guestName}\nאירוע: ${eventName}\n\nלצפייה במצב כללי של האירוע:\n${ADMIN_CONFIG.siteUrl}`,
    
    pending: (guestName, eventName) => 
      `עדכון סטטוס RSVP\n\nמוזמן: ${guestName}\nאירוع: ${eventName}\nסטטוס: ממתין לתשובה\n\nלצפייה במצב כללי של האירוע:\n${ADMIN_CONFIG.siteUrl}`
  }
};

// Notification functions
const sendWhatsAppNotification = async (message) => {
  if (!ADMIN_CONFIG.whatsapp.enabled) return { success: false, reason: 'WhatsApp disabled' };
  
  try {
    // For now, this is a simulation
    // In production, you would integrate with WhatsApp Business API
    console.log(`📱 WhatsApp notification to ${ADMIN_CONFIG.whatsapp.phone}:`);
    console.log(message);
    
    // Simulate API call
    return { 
      success: true, 
      messageId: Date.now().toString(),
      phone: ADMIN_CONFIG.whatsapp.phone 
    };
  } catch (error) {
    console.error('WhatsApp notification error:', error);
    return { success: false, error: error.message };
  }
};

const sendEmailNotification = async (subject, message) => {
  if (!ADMIN_CONFIG.email.enabled) return { success: false, reason: 'Email disabled' };
  
  try {
    // Using EmailJS for client-side email sending
    // This will work from the browser/Netlify Functions
    console.log(`📧 Email notification to ${ADMIN_CONFIG.email.address}:`);
    console.log(`Subject: ${subject}`);
    console.log(message);
    
    // For now, this is a simulation
    // In production, you would use EmailJS or another email service
    return { 
      success: true, 
      messageId: Date.now().toString(),
      email: ADMIN_CONFIG.email.address 
    };
  } catch (error) {
    console.error('Email notification error:', error);
    return { success: false, error: error.message };
  }
};

// Main notification function
const sendRSVPNotification = async (guest, event, rsvpStatus) => {
  const notifications = [];
  
  try {
    // Determine message content based on RSVP status
    let whatsappMessage, emailMessage, emailSubject;
    
    const guestsCount = (guest.plus_one || 0) + 1; // Guest + plus ones
    
    switch (rsvpStatus) {
      case 'confirmed':
        whatsappMessage = MESSAGE_TEMPLATES.whatsapp.confirmed(guest.name, event.name, guestsCount);
        emailMessage = MESSAGE_TEMPLATES.email.confirmed(guest.name, event.name, guestsCount);
        break;
      case 'declined':
        whatsappMessage = MESSAGE_TEMPLATES.whatsapp.declined(guest.name, event.name);
        emailMessage = MESSAGE_TEMPLATES.email.declined(guest.name, event.name);
        break;
      default:
        whatsappMessage = MESSAGE_TEMPLATES.whatsapp.pending(guest.name, event.name);
        emailMessage = MESSAGE_TEMPLATES.email.pending(guest.name, event.name);
    }
    
    emailSubject = MESSAGE_TEMPLATES.email.subject(event.name);
    
    // Send WhatsApp notification
    if (ADMIN_CONFIG.whatsapp.enabled) {
      const whatsappResult = await sendWhatsAppNotification(whatsappMessage);
      notifications.push({ type: 'whatsapp', ...whatsappResult });
    }
    
    // Send email notification
    if (ADMIN_CONFIG.email.enabled) {
      const emailResult = await sendEmailNotification(emailSubject, emailMessage);
      notifications.push({ type: 'email', ...emailResult });
    }
    
    return {
      success: true,
      notifications,
      guest: guest.name,
      event: event.name,
      status: rsvpStatus
    };
    
  } catch (error) {
    console.error('Notification error:', error);
    return {
      success: false,
      error: error.message,
      notifications
    };
  }
};

module.exports = {
  ADMIN_CONFIG,
  MESSAGE_TEMPLATES,
  sendRSVPNotification,
  sendWhatsAppNotification,
  sendEmailNotification
};