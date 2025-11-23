# בדיקת חיבור API

## השרת עובד! ✅

ראיתי שהשרת מחזיר נתונים:
```json
[{"id":1,"name":"שון וליפז","date":"2026-11-10",...}]
```

## הבעיה:

Netlify לא מצליח לגשת לשרת המקומי שלך.

---

## פתרונות:

### פתרון 1: השרת רץ מקומית (לפיתוח בלבד)

אם אתה מריץ את השרת על המחשב שלך (`npm run dev`):

**זה לא יעבוד מ-Netlify!** 
- Netlify לא יכול לגשת ל-`localhost:5000`
- זה עובד רק כשאתה פותח את האתר מקומית

**לפיתוח מקומי:**
- פתח: `http://localhost:3000` (לא Netlify)
- שם זה יעבוד

---

### פתרון 2: העלה את השרת ל-Railway (מומלץ!)

כדי שהכל יעבוד מ-Netlify, השרת **חייב** להיות באוויר:

1. **לך ל:** https://railway.app
2. **"New Project"** → **"Deploy from GitHub"**
3. **בחר `HatonaMe`**
4. **הגדר:**
   - **Start Command:** `node server/index.js`
   - **Variables:**
     - `BASE_URL` = `https://hatoname.netlify.app`
     - `PORT` = `${{PORT}}`

5. **קבל כתובת:** `your-project.up.railway.app`

6. **עדכן את Netlify:**
   - **Environment Variables:**
     - `NEXT_PUBLIC_API_URL` = `https://your-project.up.railway.app`

7. **Deploy מחדש ב-Netlify**

---

### פתרון 3: העבר את הנתונים ל-Railway

אחרי שהשרת על Railway, צריך להעביר את הנתונים:

**אפשרות A: העלה את המסד נתונים**
1. מצא את `wedding_planner.db`
2. העלה ל-Railway Volume

**אפשרות B: ייצא/ייבא**
```bash
# ייצא
sqlite3 wedding_planner.db .dump > backup.sql
# העלה את backup.sql ל-Railway
```

**אפשרות C: צור מחדש**
- פשוט צור את האירוע "שון וליפז" מחדש ב-Railway

---

## בדיקה:

### בדוק שהשרת המקומי עובד:
```bash
curl http://localhost:5000/api/events
```
אמור לראות את האירוע.

### בדוק מ-Netlify:
פתח את הקונסול בדפדפן (F12) → Network tab
- תראה אם ה-API call נכשל
- תראה את השגיאה המדויקת

---

## סיכום:

✅ **השרת עובד** - הנתונים קיימים  
❌ **Netlify לא יכול לגשת** - כי השרת מקומי  
✅ **פתרון:** העלה את השרת ל-Railway  

---

**אחרי שתעלה את השרת ל-Railway ותעביר את הנתונים, הכל יעבוד מ-Netlify!** 🎉

