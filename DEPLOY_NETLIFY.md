# העלאה ל-Netlify - מדריך מלא

## Netlify מושלם ל-Next.js!

Netlify תומך ב-Next.js בצורה מעולה ויש להם תמיכה מובנית.

---

## שלב 1: העלה ל-GitHub

אם עדיין לא העלית:

```bash
git add .
git commit -m "Initial commit - HatonaME Wedding Planner"
git branch -M main
git remote add origin https://github.com/Seanpesis/HatonaMe.git
git push -u origin main
```

---

## שלב 2: העלה ל-Netlify

### אופציה A: דרך האתר (הכי קל!)

1. **לך ל:** https://app.netlify.com
2. **הירשם/התחבר** עם GitHub
3. **"Add new site"** → **"Import an existing project"**
4. **בחר GitHub** → בחר את ה-repo `HatonaMe`
5. **הגדר:**
   - **Base directory:** `client` (חשוב!)
   - **Build command:** `npm install && npm run build`
   - **Publish directory:** `.next`
6. **"Deploy site"**

### אופציה B: דרך Netlify CLI

```bash
# התקן Netlify CLI
npm install -g netlify-cli

# התחבר
netlify login

# Deploy
cd client
netlify deploy --prod
```

---

## שלב 3: הגדר את השרת (Backend)

Netlify תומך ב-Serverless Functions, אבל השרת שלך צריך להיות במקום אחר.

### אפשרות 1: Railway (מומלץ!)

1. **לך ל:** https://railway.app
2. **"New Project"** → **"Deploy from GitHub"**
3. **בחר את ה-repo**
4. **הגדר:**
   - **Root Directory:** `/` (שורש הפרויקט)
   - **Start Command:** `node server/index.js`
5. **Environment Variables:**
   - `PORT` = `${{PORT}}`
   - `BASE_URL` = `https://your-site.netlify.app` (הכתובת מ-Netlify!)

### אפשרות 2: Render

1. **לך ל:** https://render.com
2. **"New"** → **"Web Service"**
3. **בחר את ה-repo**
4. **הגדר:**
   - **Root Directory:** `/`
   - **Build Command:** `npm install`
   - **Start Command:** `node server/index.js`
   - **Port:** `5000`
5. **Environment Variables:**
   - `BASE_URL` = `https://your-site.netlify.app`

---

## שלב 4: עדכן את Next.js

עדכן את `client/next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL 
          ? `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`
          : 'http://localhost:5000/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
```

---

## שלב 5: הגדר Environment Variables ב-Netlify

1. **Netlify Dashboard** → **Site settings** → **Environment variables**
2. **הוסף:**
   - `NEXT_PUBLIC_API_URL` = `https://your-server.up.railway.app` (או Render)

---

## שלב 6: Deploy מחדש

אחרי כל שינוי, Netlify מעדכן אוטומטית מ-GitHub!

או ידנית:
```bash
cd client
netlify deploy --prod
```

---

## מה קורה עכשיו?

✅ **Frontend (Next.js)** → Netlify  
✅ **Backend (Express)** → Railway/Render  
✅ **כתובת קבועה** → `your-site.netlify.app`  
✅ **HTTPS אוטומטי**  
✅ **עדכון אוטומטי** מ-GitHub  

---

## עדכון BASE_URL

ב-Railway/Render, עדכן:
- `BASE_URL` = `https://your-site.netlify.app`

עכשיו הקישורים ב-WhatsApp יעבדו! 🎉

---

## טיפים:

1. **Netlify Forms** - אפשר להוסיף טופס RSVP ישירות ב-Netlify
2. **Netlify Functions** - אפשר להמיר את השרת ל-Serverless Functions
3. **Custom Domain** - אפשר להוסיף דומיין משלך

---

## בעיות נפוצות:

### "Build failed"
→ בדוק את ה-Logs ב-Netlify Dashboard

### "API calls not working"
→ ודא ש-`NEXT_PUBLIC_API_URL` מוגדר נכון

### "Database error"
→ SQLite לא יעבוד ב-Netlify Functions - צריך Railway/Render לשרת

---

**עכשיו הכל יעבוד תמיד!** 🚀

