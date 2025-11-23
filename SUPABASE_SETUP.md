# הגדרת Supabase - מדריך מלא

## שלב 1: צור פרויקט (2 דקות)

1. **לך ל:** https://supabase.com
2. **"Start your project"** → **"Sign up"**
3. **הירשם** (עם GitHub/Email)
4. **"New Project"**
5. **הגדר:**
   - **Name:** `hatoname-wedding`
   - **Database Password:** (שמור את זה במקום בטוח!)
   - **Region:** `West Europe` (או הכי קרוב אליך)
6. **"Create new project"**

⏳ **חכה 2 דקות** - Supabase יוצר את המסד נתונים

---

## שלב 2: קבל את ה-Connection String

1. **Project Settings** (הגלגל שיניים) → **Database**
2. **"Connection string"** → **"URI"**
3. **העתק את ה-String:**
   ```
   postgresql://postgres.xxxxx:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
   ```

**שמור את זה!** תצטרך אותו בקוד.

---

## שלב 3: צור את הטבלאות

1. **SQL Editor** (בתפריט השמאלי)
2. **"New query"**
3. **הדבק את הקוד** (אצור לך קובץ SQL)
4. **"Run"** (או Ctrl+Enter)

---

## שלב 4: עדכן את הקוד

אצטרך:
1. להתקין `pg` (PostgreSQL client)
2. לעדכן את `server/database/db.js`
3. להמיר את כל ה-queries מ-SQLite ל-PostgreSQL

---

## מה זה יתן לך:

✅ **מסד נתונים גלובלי** - נגיש מכל מקום  
✅ **PostgreSQL** - מקצועי ואמין  
✅ **Dashboard** - נוח לניהול  
✅ **חינמי** - עד 500MB + 2GB bandwidth  

---

**רוצה שאתחיל להמיר את הקוד?** 🚀

