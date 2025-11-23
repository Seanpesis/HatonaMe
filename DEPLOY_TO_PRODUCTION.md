# העלאת האתר לאוויר - מדריך מלא

## למה להעלות לאוויר?

✅ **עובד תמיד** - לא צריך להשאיר את המחשב דלוק  
✅ **כתובת קבועה** - לא משתנה  
✅ **נגיש מכל מקום** - המוזמנים יכולים לגשת  
✅ **חינמי** - יש אפשרויות חינמיות מעולות  

---

## אפשרויות מומלצות:

### 1. Vercel (מומלץ ביותר!) ⭐

**למה Vercel?**
- ✅ חינמי לחלוטין
- ✅ מושלם ל-Next.js (הם יצרו את Next.js!)
- ✅ קל מאוד להעלאה
- ✅ כתובת קבועה: `yourname.vercel.app`
- ✅ HTTPS אוטומטי
- ✅ עדכון אוטומטי

**איך מעלים:**

#### שלב 1: התקן Vercel CLI
```bash
npm install -g vercel
```

#### שלב 2: התחבר
```bash
vercel login
```

#### שלב 3: העלה את הלקוח (Next.js)
```bash
cd client
vercel
```

ענה על השאלות:
- Set up and deploy? **Y**
- Which scope? בחר את החשבון שלך
- Link to existing project? **N**
- What's your project's name? **hatoname-wedding**
- In which directory is your code located? **./**

**תקבל כתובת כמו:** `hatoname-wedding.vercel.app`

#### שלב 4: העלה את השרת (Backend)

**אפשרות A: Vercel Serverless Functions**
- צריך להמיר את השרת ל-serverless functions
- יותר מורכב

**אפשרות B: Railway/Render (מומלץ לשרת)**

---

### 2. Railway (מומלץ לשרת!) ⭐

**למה Railway?**
- ✅ חינמי (עם מגבלות)
- ✅ קל מאוד
- ✅ תומך ב-SQLite
- ✅ כתובת קבועה
- ✅ HTTPS אוטומטי

**איך מעלים:**

#### שלב 1: הרשמה
1. לך ל: https://railway.app
2. הירשם עם GitHub

#### שלב 2: צור פרויקט חדש
1. לחץ "New Project"
2. בחר "Deploy from GitHub repo"
3. בחר את ה-repo שלך

#### שלב 3: הגדר את השרת
1. Railway יזהה אוטומטית את `package.json`
2. הגדר את ה-PORT:
   - Variables → Add Variable
   - `PORT` = `5000`

#### שלב 4: קבל כתובת
- Railway יתן לך כתובת כמו: `yourproject.up.railway.app`
- זה הכתובת של השרת!

#### שלב 5: העלה גם את הלקוח
- אפשר גם ב-Vercel (קל יותר)
- או ב-Railway (בפרויקט נפרד)

---

### 3. Render (חינמי)

**למה Render?**
- ✅ חינמי לחלוטין
- ✅ קל להעלאה
- ✅ תומך ב-SQLite
- ⚠️ שרת "נרדם" אחרי 15 דקות ללא שימוש (בחינמי)

**איך מעלים:**

#### שלב 1: הרשמה
1. לך ל: https://render.com
2. הירשם עם GitHub

#### שלב 2: צור Web Service
1. "New" → "Web Service"
2. בחר את ה-repo שלך
3. הגדר:
   - **Name:** `hatoname-server`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server/index.js`
   - **Port:** `5000`

#### שלב 3: קבל כתובת
- Render יתן: `hatoname-server.onrender.com`

---

## המלצה שלי: Vercel + Railway

### Vercel ללקוח (Frontend):
- הכי קל ל-Next.js
- חינמי
- מהיר

### Railway לשרת (Backend):
- תומך ב-SQLite
- קל להגדרה
- חינמי

---

## איך להגדיר את BASE_URL:

### אחרי העלאה:

1. **קבל את הכתובת:**
   - Vercel: `yourname.vercel.app`
   - Railway: `yourproject.up.railway.app`

2. **הגדר ב-Railway (לשרת):**
   - Variables → Add Variable
   - `BASE_URL` = `https://yourname.vercel.app`

3. **או אם הכל על Railway:**
   - `BASE_URL` = `https://your-frontend.up.railway.app`

---

## הערות חשובות:

### SQLite ב-Production:
- ⚠️ SQLite לא מומלץ ל-Production
- אבל זה יעבוד ל-Railway/Render
- לפרויקט גדול יותר, עדיף PostgreSQL

### קבצים (uploads):
- קבצים שנשמרים ב-`server/uploads` יאבדו ב-Restart
- עדיף להשתמש ב-Cloud Storage (S3, Cloudinary)

### WhatsApp:
- WhatsApp Web יעבוד גם ב-Production
- אבל צריך שהשרת יהיה פעיל כל הזמן
- ב-Render (חינמי) השרת "נרדם" אחרי 15 דקות

---

## תהליך מלא - Vercel + Railway:

### 1. העלה את הלקוח ל-Vercel:
```bash
cd client
npm install -g vercel
vercel login
vercel
```

### 2. העלה את השרת ל-Railway:
1. הרשם ב-Railway
2. New Project → Deploy from GitHub
3. בחר את ה-repo
4. הגדר Variables:
   - `PORT` = `5000`
   - `BASE_URL` = `https://yourname.vercel.app`

### 3. עדכן את Next.js:
ב-`client/next.config.js`, שנה:
```javascript
destination: 'https://yourproject.up.railway.app/api/:path*',
```

### 4. Deploy מחדש:
```bash
cd client
vercel --prod
```

---

## חלופות אחרות:

### Heroku:
- ⚠️ כבר לא חינמי (מ-2022)
- אבל עדיין אפשרי

### DigitalOcean:
- $5/חודש
- VPS מלא
- יותר שליטה

### AWS/GCP:
- חינמי (Free Tier)
- יותר מורכב

---

## סיכום:

**לבדיקה מהירה:** ngrok  
**לשימוש קבוע:** Vercel + Railway (חינמי!)  
**לפרויקט גדול:** DigitalOcean/AWS  

**המלצה שלי:** התחל עם Vercel + Railway - זה חינמי וקל!

---

**רוצה עזרה בהעלאה?** אמור לי איזה שירות בחרת ואעזור לך!

