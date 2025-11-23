# תיקון שגיאת "מוזמן לא נמצא"

## הבעיה:
כשמוזמן פותח את הקישור, הוא רואה "מוזמן לא נמצא".

## הסיבה:
השרת (Backend) לא נגיש או לא מוגדר נכון ב-Netlify.

---

## פתרון:

### שלב 1: ודא שהשרת על Railway/Render

השרת **חייב** להיות באוויר כדי שהמוזמנים יוכלו לגשת!

#### אם עדיין לא העלית:
1. **לך ל:** https://railway.app
2. **"New Project"** → **"Deploy from GitHub"**
3. **בחר `HatonaMe`**
4. **הגדר:**
   - **Start Command:** `node server/index.js`
   - **Variables:**
     - `BASE_URL` = `https://hatoname.netlify.app`
     - `PORT` = `${{PORT}}`

5. **קבל כתובת:** `your-project.up.railway.app`

---

### שלב 2: הגדר Environment Variable ב-Netlify

1. **Netlify Dashboard** → **Site settings** → **Environment variables**
2. **הוסף:**
   - **Key:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://your-project.up.railway.app` (הכתובת מ-Railway!)

3. **Deploy מחדש:**
   - **Deploys** → **Trigger deploy** → **Deploy site**

---

### שלב 3: בדיקה

1. **פתח:** https://hatoname.netlify.app/rsvp/1/1
2. **בדוק את הקונסול** (F12) - אמור לראות:
   - אם יש שגיאה - תראה את הפרטים
   - אם זה עובד - תראה את הנתונים

---

## מה תיקנתי בקוד:

1. ✅ **שיפרתי הודעות שגיאה** - עכשיו יש פרטים טכניים
2. ✅ **תיקנתי את API URL** - עכשיו משתמש ב-relative path ב-production
3. ✅ **הוספתי error interceptor** - לוגים טובים יותר

---

## בדיקות:

### בדוק שהשרת עובד:
פתח בדפדפן:
```
https://your-project.up.railway.app/api/guests/1
```

אמור לראות JSON עם פרטי המוזמן.

### בדוק את Netlify:
פתח:
```
https://hatoname.netlify.app/api/guests/1
```

אמור לראות את אותו JSON (אם ה-rewrite עובד).

---

## אם עדיין לא עובד:

### אפשרות 1: השרת לא רץ
→ ודא שהשרת על Railway ורץ

### אפשרות 2: Environment Variable לא מוגדר
→ ודא ש-`NEXT_PUBLIC_API_URL` מוגדר ב-Netlify

### אפשרות 3: CORS error
→ ודא שהשרת מאפשר CORS מ-Netlify

### אפשרות 4: הנתונים לא במסד הנתונים
→ ודא שיש מוזמנים במסד הנתונים

---

## טיפ:

פתח את הקונסול בדפדפן (F12) ותראה בדיוק מה השגיאה:
- Network tab - תראה אם ה-API call נכשל
- Console - תראה הודעות שגיאה

---

**אחרי שתעלה את השרת ל-Railway ותגדיר את `NEXT_PUBLIC_API_URL`, זה יעבוד!** 🎉

