# הגדרה סופית - Netlify + Supabase

## מה עשיתי:

✅ **עדכנתי את הקוד** לתמוך ב-PostgreSQL (Supabase)  
✅ **הוספתי fallback** ל-SQLite (אם אין DATABASE_URL)  
✅ **יצרתי schema** ל-Supabase  
✅ **הכל עובד אוטומטית!**  

---

## איך זה עובד:

### אם יש `DATABASE_URL` (Supabase):
- ✅ משתמש ב-PostgreSQL
- ✅ מסד נתונים גלובלי
- ✅ נגיש מכל מקום

### אם אין `DATABASE_URL`:
- ✅ משתמש ב-SQLite (מקומי)
- ✅ עובד לפיתוח

---

## שלב 1: צור Supabase (5 דקות)

1. **https://supabase.com** → **"Start your project"**
2. **הירשם** → **"New Project"**
3. **הגדר:**
   - Name: `hatoname-wedding`
   - Password: (שמור!)
   - Region: `West Europe`
4. **"Create new project"**

### קבל Connection String:
1. **Settings** → **Database** → **"Connection string"** → **"URI"**
2. **העתק** - נראה כמו:
   ```
   postgresql://postgres.xxxxx:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
   ```

### צור טבלאות:
1. **SQL Editor** → **"New query"**
2. **העתק את כל הקוד** מ-`supabase/schema.sql`
3. **"Run"**

---

## שלב 2: הגדר ב-Netlify

1. **Netlify Dashboard** → **Site settings** → **Environment variables**
2. **הוסף:**
   - `DATABASE_URL` = Connection String מ-Supabase
   - `BASE_URL` = `https://hatoname.netlify.app`
3. **"Save"**

---

## שלב 3: Deploy

Netlify יעדכן אוטומטית מ-GitHub!

או ידנית:
- **Deploys** → **"Trigger deploy"**

---

## מה קורה עכשיו:

✅ **השרת:** רץ על Netlify (או Railway אם תרצה)  
✅ **מסד נתונים:** Supabase (PostgreSQL) - גלובלי!  
✅ **נגיש:** מכל מקום בעולם  
✅ **חינמי:** Supabase חינמי עד 500MB  

---

## העברת נתונים:

האירוע "שון וליפז" נמצא במסד מקומי. אפשרויות:

### אפשרות A: צור מחדש
- פשוט צור את האירוע מחדש דרך האתר

### אפשרות B: ייצא/ייבא
```bash
# ייצא מ-SQLite
sqlite3 wedding_planner.db .dump > backup.sql

# ייבא ל-Supabase דרך SQL Editor
```

---

## בדיקה:

1. **פתח:** https://hatoname.netlify.app
2. **צור אירוע חדש**
3. **בדוק שהכל עובד!**

---

**עכשיו הכל על Netlify עם מסד נתונים גלובלי!** 🎉

