# העלאה מהירה - Vercel + Railway

## תהליך של 10 דקות:

### חלק 1: העלאת הלקוח ל-Vercel (5 דקות)

#### שלב 1: התקן Vercel
```bash
npm install -g vercel
```

#### שלב 2: התחבר
```bash
vercel login
```
פתח את הקישור בדפדפן והתחבר.

#### שלב 3: העלה את הלקוח
```bash
cd client
vercel
```

ענה על השאלות:
- **Set up and deploy?** → `Y`
- **Which scope?** → בחר את החשבון שלך
- **Link to existing project?** → `N`
- **What's your project's name?** → `hatoname-wedding` (או שם אחר)
- **In which directory is your code located?** → `./`

**תקבל כתובת כמו:** `https://hatoname-wedding.vercel.app`

**שמור את הכתובת!** תצטרך אותה בהמשך.

---

### חלק 2: העלאת השרת ל-Railway (5 דקות)

#### שלב 1: הרשמה
1. לך ל: https://railway.app
2. לחץ "Start a New Project"
3. הירשם עם GitHub (הכי קל)

#### שלב 2: צור פרויקט
1. לחץ "New Project"
2. בחר "Deploy from GitHub repo"
3. אם זה הפעם הראשונה, הרשא ל-Railway לגשת ל-GitHub
4. בחר את ה-repo של הפרויקט

#### שלב 3: הגדר את השרת
Railway יזהה אוטומטית את `package.json` ויתחיל לבנות.

**אבל צריך להגדיר כמה דברים:**

1. **שנה את Start Command:**
   - Settings → Deploy
   - Start Command: `node server/index.js`

2. **הוסף Variables:**
   - Variables → Add Variable
   - `PORT` = `${{PORT}}` (Railway נותן את זה אוטומטית)
   - `BASE_URL` = `https://hatoname-wedding.vercel.app` (הכתובת מ-Vercel!)

#### שלב 4: קבל את הכתובת
1. לחץ על הפרויקט
2. Settings → Networking
3. לחץ "Generate Domain"
4. תקבל כתובת כמו: `hatoname-production.up.railway.app`

**שמור את הכתובת!**

---

### חלק 3: עדכן את הלקוח

#### עדכן את `client/next.config.js`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://hatoname-production.up.railway.app/api/:path*',
      },
    ];
  },
};
```

**החלף** `hatoname-production.up.railway.app` בכתובת האמיתית שלך מ-Railway!

#### Deploy מחדש ל-Vercel:
```bash
cd client
vercel --prod
```

---

### חלק 4: בדיקה

1. **פתח את האתר:**
   - `https://hatoname-wedding.vercel.app`

2. **בדוק שהכל עובד:**
   - צור אירוע
   - טען מוזמנים
   - שלח הזמנה לעצמך
   - בדוק שהקישור עובד

---

## טיפים:

### אם יש שגיאות:

1. **בדוק את ה-Logs:**
   - Railway: View Logs
   - Vercel: Deployments → View Function Logs

2. **ודא שה-Variables נכונים:**
   - Railway: Variables
   - Vercel: Settings → Environment Variables

3. **בדוק את ה-PORT:**
   - Railway משתמש ב-`${{PORT}}` אוטומטית
   - לא צריך להגדיר ידנית

### עדכונים עתידיים:

**לעדכן את הלקוח:**
```bash
cd client
vercel --prod
```

**לעדכן את השרת:**
- Railway מעדכן אוטומטית מ-GitHub!
- או: Railway Dashboard → Redeploy

---

## עלויות:

✅ **Vercel:** חינמי לחלוטין  
✅ **Railway:** $5 חינמי כל חודש (מספיק לפרויקט קטן)  
💰 **סה"כ:** חינמי!  

---

## מה קורה עכשיו?

✅ האתר עובד תמיד  
✅ כתובת קבועה  
✅ HTTPS אוטומטי  
✅ עדכון אוטומטי מ-GitHub  
✅ המוזמנים יכולים לגשת!  

---

**עכשיו הקישורים ב-WhatsApp יעבדו מושלם!** 🎉

---

## בעיות נפוצות:

### "Cannot find module"
→ ודא ש-`node_modules` לא ב-`.gitignore` (אבל זה בסדר - Railway מתקין מחדש)

### "Port already in use"
→ Railway נותן את ה-PORT אוטומטית - לא צריך להגדיר

### "Database error"
→ SQLite יעבוד, אבל הקבצים נשמרים ב-Railway. לפרויקט גדול יותר, עדיף PostgreSQL

---

**רוצה עזרה?** אמור לי איפה נתקעת!

