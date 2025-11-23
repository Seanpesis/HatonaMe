# תיקון כתובת Netlify - הקישורים ב-WhatsApp

## ✅ מה תיקנתי:

עדכנתי את הקוד כך שישתמש ב-`https://hatoname.netlify.app` כברירת מחדל במקום `localhost`.

---

## חשוב: השרת צריך להיות גם באוויר!

כרגע הלקוח (Frontend) על Netlify, אבל השרת (Backend) צריך להיות גם באוויר כדי שהכל יעבוד.

### איפה השרת רץ עכשיו?

אם השרת רץ על המחשב המקומי שלך:
- ⚠️ זה לא יעבוד למוזמנים!
- ⚠️ צריך שהשרת יהיה גם באוויר

---

## פתרון: העלה את השרת ל-Railway

### שלב 1: הרשמה ל-Railway
1. לך ל: https://railway.app
2. הירשם עם GitHub

### שלב 2: צור פרויקט
1. "New Project" → "Deploy from GitHub"
2. בחר את ה-repo `HatonaMe`

### שלב 3: הגדר את השרת
1. Railway יזהה את `package.json`
2. **Settings** → **Deploy**:
   - **Start Command:** `node server/index.js`
3. **Variables** → **Add Variable**:
   - `BASE_URL` = `https://hatoname.netlify.app`
   - `PORT` = `${{PORT}}` (Railway נותן את זה אוטומטית)

### שלב 4: קבל את הכתובת
1. **Settings** → **Networking**
2. לחץ "Generate Domain"
3. תקבל כתובת כמו: `hatoname-production.up.railway.app`

**שמור את הכתובת!**

---

## שלב 5: עדכן את Netlify

1. **Netlify Dashboard** → **Site settings** → **Environment variables**
2. **הוסף:**
   - `NEXT_PUBLIC_API_URL` = `https://hatoname-production.up.railway.app` (הכתובת מ-Railway!)

3. **Deploy מחדש:**
   - **Deploys** → **Trigger deploy** → **Deploy site**

---

## בדיקה:

1. **פתח:** https://hatoname.netlify.app
2. **צור אירוע**
3. **שלח הזמנה לעצמך**
4. **בדוק שהקישור:** `https://hatoname.netlify.app/rsvp/1/1` עובד!

---

## אם השרת עדיין מקומי:

אם אתה עדיין מריץ את השרת על המחשב שלך (לא על Railway):

### אפשרות 1: העלה ל-Railway (מומלץ!)
→ עקוב אחרי ההוראות למעלה

### אפשרות 2: השתמש ב-ngrok (זמני)
```bash
ngrok http 5000
```
ואז עדכן את `BASE_URL` ב-`.env` לכתובת ngrok.

---

## סיכום:

✅ **לקוח (Frontend):** https://hatoname.netlify.app  
⏳ **שרת (Backend):** צריך להיות על Railway/Render  
✅ **BASE_URL:** `https://hatoname.netlify.app` (מוגדר בקוד)  

---

**אחרי שתעלה את השרת ל-Railway, הקישורים ב-WhatsApp יעבדו מושלם!** 🎉

