# העלאה ל-Railway - מדריך שלב אחר שלב

## שלב 1: הרשמה ל-Railway

1. **לך ל:** https://railway.app
2. **לחץ "Start a New Project"** או **"Login"**
3. **בחר "Login with GitHub"**
4. **הרשא ל-Railway** לגשת ל-GitHub repositories שלך

---

## שלב 2: צור פרויקט חדש

1. **לחץ "New Project"** (כפתור כחול גדול)
2. **בחר "Deploy from GitHub repo"**
3. **אם זה הפעם הראשונה:**
   - לחץ "Configure GitHub App"
   - בחר את ה-repositories שאתה רוצה (או "All repositories")
   - לחץ "Install"
4. **בחר את ה-repo:** `HatonaMe` (או `Seanpesis/HatonaMe`)
5. **לחץ "Deploy Now"**

---

## שלב 3: הגדר את השרת

Railway יתחיל לבנות את הפרויקט אוטומטית, אבל צריך להגדיר כמה דברים:

### 3.1: שנה את Start Command

1. **לחץ על הפרויקט** שיצר Railway
2. **Settings** (הגלגל שיניים למעלה)
3. **Deploy** → **Start Command**
4. **החלף את הפקודה ל:**
   ```
   node server/index.js
   ```
5. **לחץ "Save"**

### 3.2: הוסף Environment Variables

1. **Variables** (בתפריט השמאלי)
2. **"New Variable"** → הוסף:

   **Variable 1:**
   - **Key:** `BASE_URL`
   - **Value:** `https://hatoname.netlify.app`
   - **לחץ "Add"**

   **Variable 2:**
   - **Key:** `PORT`
   - **Value:** `${{PORT}}`
   - **לחץ "Add"**

   ⚠️ **חשוב:** `${{PORT}}` עם הסוגריים הכפולים - Railway נותן את זה אוטומטית!

---

## שלב 4: קבל כתובת (Domain)

1. **Settings** → **Networking**
2. **"Generate Domain"** (כפתור כחול)
3. **תקבל כתובת כמו:**
   ```
   hatoname-production.up.railway.app
   ```
4. **שמור את הכתובת!** תצטרך אותה בהמשך

---

## שלב 5: בדוק שהשרת עובד

1. **פתח בדפדפן:**
   ```
   https://hatoname-production.up.railway.app/api/events
   ```
2. **אמור לראות:**
   - אם יש אירועים: JSON עם האירועים
   - אם אין: `[]` (רשימה ריקה)

3. **אם יש שגיאה:**
   - לך ל-**Deployments** → לחץ על ה-Deployment האחרון
   - בדוק את ה-**Logs** - שם תראה מה השגיאה

---

## שלב 6: עדכן את Netlify

1. **Netlify Dashboard** → **Site settings** → **Environment variables**
2. **"Add variable":**
   - **Key:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://hatoname-production.up.railway.app` (הכתובת מ-Railway!)
3. **"Save"**

---

## שלב 7: Deploy מחדש ב-Netlify

1. **Deploys** → **"Trigger deploy"** → **"Deploy site"**
2. או פשוט עשה push ל-GitHub:
   ```bash
   git commit --allow-empty -m "Trigger Netlify rebuild"
   git push
   ```

---

## שלב 8: העבר את הנתונים (אופציונלי)

האירוע "שון וליפז" נמצא במסד נתונים מקומי. יש כמה אפשרויות:

### אפשרות A: צור מחדש (הכי קל)

1. **פתח:** https://hatoname.netlify.app
2. **צור אירוע חדש** בשם "שון וליפז"
3. **טען מחדש את המוזמנים** (אם יש קובץ Excel)

### אפשרות B: העלה את המסד נתונים

1. **מצא את הקובץ:** `wedding_planner.db` בתיקיית הפרויקט
2. **Railway** → **Project** → **Volumes**
3. **"Create Volume"**
4. **העלה את הקובץ** לשם
5. **עדכן את הנתיב** ב-`server/database/db.js` (אם צריך)

---

## בדיקה סופית:

1. **פתח:** https://hatoname.netlify.app
2. **אמור לראות:**
   - ✅ האירועים נטענים
   - ✅ אפשר ליצור אירועים חדשים
   - ✅ הכל עובד!

3. **פתח את הקונסול** (F12):
   - **Console** - לא אמורות להיות שגיאות
   - **Network** - ה-API calls אמורים להצליח

---

## בעיות נפוצות:

### "Build failed"
→ בדוק את ה-Logs ב-Railway → Deployments

### "Port already in use"
→ Railway נותן את ה-PORT אוטומטית - לא צריך להגדיר ידנית

### "Database error"
→ SQLite יעבוד, אבל אם יש בעיות, עדיף PostgreSQL

### "API calls still failing"
→ ודא ש-`NEXT_PUBLIC_API_URL` מוגדר נכון ב-Netlify
→ ודא ש-Deploy מחדש ב-Netlify

---

## סיכום:

✅ **Railway:** השרת רץ על `hatoname-production.up.railway.app`  
✅ **Netlify:** הלקוח רץ על `hatoname.netlify.app`  
✅ **מחובר:** Netlify → Railway  
✅ **עובד:** הכל אמור לעבוד!  

---

**אם נתקעת, שלח לי את ה-Logs מ-Railway ואעזור!** 🚀

