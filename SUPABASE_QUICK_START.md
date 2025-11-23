# Supabase - התחלה מהירה (5 דקות)

## שלב 1: צור פרויקט (2 דקות)

1. **https://supabase.com** → **"Start your project"**
2. **הירשם** (עם GitHub הכי קל)
3. **"New Project"**
4. **הגדר:**
   - **Name:** `hatoname-wedding`
   - **Database Password:** (שמור את זה!)
   - **Region:** `West Europe`
5. **"Create new project"**

⏳ **חכה 2 דקות**

---

## שלב 2: קבל Connection String (1 דקה)

1. **Project Settings** (גלגל שיניים) → **Database**
2. **"Connection string"** → **"URI"**
3. **העתק** - נראה כמו:
   ```
   postgresql://postgres.xxxxx:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
   ```

**שמור את זה!**

---

## שלב 3: צור את הטבלאות (1 דקה)

1. **SQL Editor** (בתפריט השמאלי)
2. **"New query"**
3. **העתק את כל הקוד** מ-`supabase/schema.sql`
4. **"Run"** (Ctrl+Enter)

✅ **סיימת!**

---

## שלב 4: הגדר ב-Netlify (1 דקה)

1. **Netlify Dashboard** → **Site settings** → **Environment variables**
2. **"Add variable":**
   - **Key:** `DATABASE_URL`
   - **Value:** Connection String מ-Supabase
3. **"Save"**

---

## ✅ סיימת!

עכשיו:
- ✅ מסד נתונים גלובלי על Supabase
- ✅ נגיש מכל מקום בעולם
- ✅ חינמי עד 500MB

**Deploy מחדש ב-Netlify והכל יעבוד!** 🎉

