# פריסת האתר ב-Netlify עם WhatsApp RSVP

## שלב 1: הכנה לפריסה

1. וודא שכל הקבצים נמצאים במקומם:
   - `netlify/functions/` - כל ה-API functions
   - `netlify.toml` - קובץ התצורה
   - `client/` - אפליקציית Next.js

## שלב 2: פריסה ב-Netlify

1. היכנס ל-[Netlify](https://app.netlify.com)
2. לחץ על "Add new site" -> "Import an existing project"
3. בחר את המאגר שלך מ-GitHub
4. הגדרות בניה:
   - Build command: `npm install && npm run build`
   - Publish directory: `client/.next`
   - Functions directory: `netlify/functions`

## שלב 3: משתני סביבה

ב-Netlify, לך ל-Site settings -> Environment variables והוסף:

```
NODE_VERSION=18
NEXT_PUBLIC_API_URL=  (השאר ריק - יעבוד עם הפונקציות המקומיות)
```

## שלב 4: הגדרת WhatsApp

כרגע ה-WhatsApp מוגדר לעבוד עם סימולציה. כדי לחבר WhatsApp אמיתי:

### אפשרות 1: WhatsApp Business API
1. הירשם ל-[WhatsApp Business API](https://business.whatsapp.com/products/business-platform)
2. עדכן את הפונקציה `sendWhatsAppMessage` ב-`netlify/functions/api/whatsapp.js`

### אפשרות 2: Twilio WhatsApp
1. פתח חשבון ב-[Twilio](https://www.twilio.com/whatsapp)
2. הוסף את פרטי ה-API ב-environment variables
3. עדכן את הפונקציה להשתמש ב-Twilio SDK

## שלב 5: בדיקת הפונקציונליות

אחרי הפריסה:
1. צור אירוע חדש
2. הוסף אורחים (באמצעות Excel או ידנית)
3. שלח הזמנות WhatsApp
4. בדוק שקישורי ה-RSVP עובדים
5. וודא שהתשובות מתעדכנות במסד הנתונים

## התכונות שיעבדו:

✅ **ניהול אירועים**: יצירה, עריכה, מחיקה של אירועים
✅ **ניהול אורחים**: הוספה, עריכה, מחיקה של אורחים
✅ **העלאת Excel**: יבוא רשימת אורחים מקובץ Excel
✅ **שליחת הזמנות WhatsApp**: שליחה אישית או קבוצתית
✅ **RSVP מקוון**: אורחים יכולים לאשר הגעה דרך קישור
✅ **עדכון אוטומטי**: התשובות מתעדכנות באתר בזמן אמת
✅ **סידור שולחנות**: ניהול ושיבוץ אורחים לשולחנות

## קישור לאתר

אחרי הפריסה, תקבל קישור כמו:
`https://your-site-name.netlify.app`

קישורי RSVP יהיו בפורמט:
`https://your-site-name.netlify.app/rsvp/[eventId]/[guestId]`

## פתרון בעיות

### אם האתר לא עובד:
1. בדוק את הלוגים ב-Netlify Functions
2. וודא ש-Node version הוא 18
3. בדוק שכל הדפנדנסיות מותקנות

### אם WhatsApp לא עובד:
1. כרגע זה בסימולציה - בדוק את הקונסול
2. להטמעה אמיתית, תצטרך להגדיר WhatsApp Business API

### אם RSVP לא עובד:
1. בדוק שהקישור נוצר נכון
2. בדוק את הפונקציה guests/whatsapp ב-Netlify
3. וודא שמסד הנתונים מתעדכן

המערכת מוכנה לשימוש מלא ב-Netlify! 🎉