# העלאה פשוטה - הכל במקום אחד

## אפשרות 1: Render (הכי פשוט!)

Render יכול להריץ גם את הלקוח וגם את השרת!

### שלב 1: הרשמה
1. לך ל: https://render.com
2. הירשם עם GitHub

### שלב 2: העלה את השרת
1. "New" → "Web Service"
2. בחר את ה-repo שלך
3. הגדר:
   - **Name:** `hatoname-server`
   - **Environment:** `Node`
   - **Root Directory:** `./` (או השאר ריק)
   - **Build Command:** `npm install`
   - **Start Command:** `node server/index.js`
   - **Port:** `5000`

4. **Environment Variables:**
   - `PORT` = `5000`
   - `BASE_URL` = `https://hatoname-server.onrender.com` (תקבל אחרי ה-Deploy)

### שלב 3: העלה את הלקוח
1. "New" → "Static Site"
2. בחר את ה-repo שלך
3. הגדר:
   - **Name:** `hatoname-wedding`
   - **Root Directory:** `client`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `.next`

4. **Environment Variables:**
   - `NEXT_PUBLIC_API_URL` = `https://hatoname-server.onrender.com`

### שלב 4: עדכן את BASE_URL
1. חזור לשרת
2. Settings → Environment
3. עדכן: `BASE_URL` = `https://hatoname-wedding.onrender.com`

---

## אפשרות 2: Railway (מומלץ!)

Railway יכול להריץ הכל - גם הלקוח וגם השרת!

### שלב 1: הרשמה
1. לך ל: https://railway.app
2. הירשם עם GitHub

### שלב 2: צור פרויקט
1. "New Project"
2. "Deploy from GitHub repo"
3. בחר את ה-repo

### שלב 3: הוסף שירות לשרת
1. "New" → "GitHub Repo"
2. בחר את אותו repo
3. הגדר:
   - **Root Directory:** `/`
   - **Start Command:** `node server/index.js`

4. **Variables:**
   - `PORT` = `${{PORT}}`
   - `BASE_URL` = `https://yourproject.up.railway.app` (אחרי שתקבל)

### שלב 4: הוסף שירות ללקוח
1. "New" → "GitHub Repo"
2. בחר את אותו repo
3. הגדר:
   - **Root Directory:** `/client`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`

4. **Variables:**
   - `NEXT_PUBLIC_API_URL` = כתובת השרת מ-Railway

---

## איזה לבחור?

**Render:**
- ✅ חינמי
- ✅ קל מאוד
- ⚠️ שרת "נרדם" אחרי 15 דקות (בחינמי)

**Railway:**
- ✅ חינמי ($5 חינמי כל חודש)
- ✅ לא נרדם
- ✅ יותר מהיר

**המלצה:** Railway אם אתה רוצה שהשרת יעבוד תמיד!

---

## אחרי העלאה:

1. **קבל את הכתובת:**
   - Render: `yourname.onrender.com`
   - Railway: `yourname.up.railway.app`

2. **עדכן את BASE_URL:**
   - ב-Settings → Environment Variables
   - `BASE_URL` = הכתובת של הלקוח

3. **בדוק:**
   - פתח את האתר
   - צור אירוע
   - שלח הזמנה לעצמך
   - בדוק שהקישור עובד!

---

**עכשיו הכל יעבוד תמיד!** 🎉

