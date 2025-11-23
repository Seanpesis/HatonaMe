# הגדרת התראות אימייל ו-WhatsApp

## 🔔 מה נוסף?

עכשיו כשאורח מאשר/מבטל הגעה, תקבל התראה אוטומטית ל:
- **WhatsApp**: 0545608972
- **Email**: sean.pesis1@gmail.com

## 📧 הגדרת EmailJS (עבור אימייל אמיתי)

### 1. הרשמה ל-EmailJS
1. לך ל-[EmailJS.com](https://www.emailjs.com/)
2. צור חשבון חינמי
3. צור Service חדש (Gmail/Outlook/etc.)
4. צור Template חדש

### 2. הגדרת Template
צור template עם התוכן הבא:
```
Subject: עדכון RSVP - {{event_name}}

שלום,

{{status_message}}

מוזמן: {{guest_name}}
אירוע: {{event_name}}
סטטוס: {{rsvp_status}}
מספר משתתפים: {{guests_count}}

לצפייה במצב כללי:
{{site_url}}

תאריך: {{date}}
```

### 3. הוסף משתני סביבה ב-Netlify
ב-Site Settings > Environment Variables:
```
EMAILJS_SERVICE_ID=your_service_id
EMAILJS_TEMPLATE_ID=your_template_id
EMAILJS_USER_ID=your_user_id
```

## 📱 הגדרת WhatsApp אמיתי

### אפשרות 1: WhatsApp Business API
1. הירשם ל-[WhatsApp Business Platform](https://business.whatsapp.com/)
2. קבל Access Token
3. הוסף ב-Netlify Environment Variables:
```
WHATSAPP_ACCESS_TOKEN=your_token
WHATSAPP_PHONE_ID=your_phone_id
```

### אפשרות 2: Twilio WhatsApp
1. פתח חשבון ב-[Twilio](https://www.twilio.com/whatsapp)
2. הוסף ב-Environment Variables:
```
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

## 🎯 איך זה עובד?

### כרגע (סימולציה):
- ההתראות מופיעות בלוגים של Netlify Functions
- תוכל לראות אותן בקונסול

### אחרי הגדרה אמיתית:
1. אורח מאשר הגעה דרך הקישור
2. המערכת שולחת התראה אוטומטית ל-WhatsApp ואימייל שלך
3. תקבל עדכון עם:
   - שם האורח
   - סטטוס (אישר/ביטל/ממתין)
   - מספר משתתפים (אם אישר)
   - קישור לדף הסטטיסטיקות

## 📊 דף סטטיסטיקות חדש

נוסף דף מעקב במ-: `https://hatoname.netlify.app/events/[id]/stats`

תכונות:
- ✅ סטטיסטיקות בזמן אמת
- ✅ אחוז תגובות
- ✅ מספר משתתפים כולל
- ✅ תגובות אחרונות
- ✅ גרפים ויזואליים

## 🔄 איך לעדכן

1. **העלה את השינויים:**
```bash
git add .
git commit -m "Add RSVP notifications"
git push origin main
```

2. **Netlify יעדכן אוטומטית**

3. **הוסף משתני סביבה** (אם רוצה אימייל/WhatsApp אמיתי)

## 🎉 מוכן!

עכשיו תקבל התראה על כל אישור/ביטול הגעה!

### הודעות שתקבל:

**WhatsApp:**
```
✅ אישור הגעה התקבל!

👤 יוסי כהן
🎉 החתונה של שרה ודוד
👥 מספר מוזמנים: 2

📊 לצפייה במצב כללי:
https://hatoname.netlify.app/
```

**Email:**
```
Subject: עדכון RSVP - החתונה של שרה ודוד

אישור הגעה התקבל!

מוזמן: יוסי כהן
אירוע: החתונה של שרה ודוד  
מספר מוזמנים: 2

לצפייה במצב כללי של האירוע:
https://hatoname.netlify.app/
```

**המערכת עובדת! 🚀**