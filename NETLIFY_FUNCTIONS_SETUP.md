# העלאה ל-Netlify Functions + מסד נתונים חיצוני

## הרעיון:
- ✅ השרת רץ על Netlify (Serverless Functions)
- ✅ מסד נתונים חיצוני (Supabase/PostgreSQL) - נגיש מכל מקום
- ✅ הכל במקום אחד!

---

## אפשרות 1: Supabase (מומלץ! - הכי קל)

### למה Supabase?
- ✅ חינמי לחלוטין
- ✅ PostgreSQL (מסד נתונים מקצועי)
- ✅ קל מאוד להגדרה
- ✅ Dashboard נוח

### שלב 1: צור פרויקט ב-Supabase

1. **לך ל:** https://supabase.com
2. **הירשם** (חינמי)
3. **"New Project"**
4. **הגדר:**
   - **Name:** `hatoname-wedding`
   - **Database Password:** (שמור את זה!)
   - **Region:** בחר הכי קרוב (Europe)
5. **"Create new project"** (לוקח 2 דקות)

### שלב 2: קבל את ה-Connection String

1. **Project Settings** → **Database**
2. **"Connection string"** → **"URI"**
3. **העתק את ה-String** - נראה כמו:
   ```
   postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres
   ```

### שלב 3: צור את הטבלאות

1. **SQL Editor** → **"New query"**
2. **הדבק את הקוד** מ-`CREATE_TABLES.sql` (אצור לך)
3. **"Run"**

### שלב 4: עדכן את הקוד

אצטרך להמיר את SQLite ל-PostgreSQL. זה דורש:
- שינוי ב-`server/database/db.js`
- התקנת `pg` (PostgreSQL client)
- עדכון כל ה-queries

---

## אפשרות 2: PlanetScale (MySQL - חינמי)

### למה PlanetScale?
- ✅ חינמי
- ✅ MySQL
- ✅ קל להגדרה

### שלב 1: צור Database

1. **לך ל:** https://planetscale.com
2. **הירשם** עם GitHub
3. **"Create database"**
4. **קבל את ה-Connection String**

### שלב 2: עדכן את הקוד

צריך להמיר ל-MySQL במקום SQLite.

---

## אפשרות 3: MongoDB Atlas (חינמי)

### למה MongoDB?
- ✅ חינמי
- ✅ NoSQL (יותר גמיש)
- ✅ קל להגדרה

---

## המלצה שלי: Supabase

**למה?**
- ✅ הכי קל להגדרה
- ✅ PostgreSQL (מקצועי)
- ✅ Dashboard מעולה
- ✅ חינמי לחלוטין

---

## מה צריך לעשות:

1. **צור מסד נתונים ב-Supabase**
2. **אמיר את הקוד** מ-SQLite ל-PostgreSQL
3. **המיר את השרת** ל-Netlify Functions
4. **הגדר Environment Variables**

---

**רוצה שאתחיל להמיר את הקוד ל-Supabase + Netlify Functions?** 🚀

