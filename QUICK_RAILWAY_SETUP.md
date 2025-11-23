# העלאה מהירה ל-Railway - 3 שלבים

## שלב 1: צור פרויקט (2 דקות)

1. **https://railway.app** → **Login with GitHub**
2. **"New Project"** → **"Deploy from GitHub"**
3. **בחר `HatonaMe`** → **"Deploy Now"**

---

## שלב 2: הגדר (1 דקה)

1. **Settings** → **Deploy:**
   - **Start Command:** `node server/index.js`

2. **Variables:**
   - `BASE_URL` = `https://hatoname.netlify.app`
   - `PORT` = `${{PORT}}`

3. **Networking:**
   - **"Generate Domain"** → שמור את הכתובת

---

## שלב 3: עדכן Netlify (1 דקה)

1. **Netlify** → **Environment variables**
2. **הוסף:** `NEXT_PUBLIC_API_URL` = כתובת Railway
3. **Deploy מחדש**

---

**סיימת!** 🎉

