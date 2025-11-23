# תיקון שגיאת 500 - השרת לא נגיש

## הבעיה:
```
שגיאה בטעינת האירועים: Request failed with status code 500
API URL: לא מוגדר (משתמש ב-localhost)
```

## הסיבה:
Netlify מנסה לגשת ל-`localhost:5000` - זה לא עובד כי השרת לא נגיש מ-Netlify.

---

## פתרון מהיר:

### שלב 1: העלה את השרת ל-Railway (5 דקות)

1. **לך ל:** https://railway.app
2. **הירשם** עם GitHub
3. **"New Project"** → **"Deploy from GitHub"**
4. **בחר `HatonaMe`**
5. **Settings** → **Deploy:**
   - **Start Command:** `node server/index.js`
6. **Variables** → **Add Variable:**
   - `BASE_URL` = `https://hatoname.netlify.app`
   - `PORT` = `${{PORT}}`
7. **Settings** → **Networking:**
   - לחץ **"Generate Domain"**
   - תקבל: `hatoname-production.up.railway.app`

**שמור את הכתובת!**

---

### שלב 2: הגדר Environment Variable ב-Netlify

1. **Netlify Dashboard** → **Site settings** → **Environment variables**
2. **"Add variable":**
   - **Key:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://hatoname-production.up.railway.app` (הכתובת מ-Railway!)
3. **"Save"**

---

### שלב 3: Deploy מחדש

1. **Deploys** → **Trigger deploy** → **Deploy site**
2. או פשוט עשה push ל-GitHub (Netlify מעדכן אוטומטית)

---

### שלב 4: העבר את הנתונים

האירוע "שון וליפז" נמצא במסד נתונים מקומי. צריך להעביר:

**אפשרות A: צור מחדש (הכי קל)**
- פשוט צור את האירוע מחדש ב-Railway

**אפשרות B: העלה את המסד נתונים**
- מצא את `wedding_planner.db`
- העלה ל-Railway Volume

---

## בדיקה:

אחרי ה-Deploy:
1. **פתח:** https://hatoname.netlify.app
2. **פתח את הקונסול** (F12)
3. **Network tab** - תראה אם ה-API calls עובדים
4. **אמור לראות את האירועים!**

---

## אם עדיין לא עובד:

### בדוק את Railway:
פתח: `https://hatoname-production.up.railway.app/api/events`
אמור לראות JSON עם האירועים.

### בדוק את Netlify:
1. **Site settings** → **Environment variables**
2. ודא ש-`NEXT_PUBLIC_API_URL` מוגדר נכון
3. **Deploys** → בדוק את ה-Logs

### בדוק את הקונסול:
פתח את הקונסול (F12) → Console
- תראה הודעות שגיאה מדויקות
- Network tab - תראה את ה-API calls

---

## סיכום:

✅ **הבעיה:** השרת לא נגיש מ-Netlify  
✅ **הפתרון:** העלה את השרת ל-Railway  
✅ **הגדר:** `NEXT_PUBLIC_API_URL` ב-Netlify  
✅ **Deploy:** מחדש  

---

**אחרי שתעלה את השרת ל-Railway ותגדיר את ה-Variable, הכל יעבוד!** 🎉

