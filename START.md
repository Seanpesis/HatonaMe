# איך להפעיל את האתר

## דרך מהירה (מומלץ):

פתח PowerShell או Command Prompt בתיקיית הפרויקט והרץ:

```bash
npm run dev
```

זה יפעיל את השרת והלקוח יחד.

## דרך נפרדת:

### טרמינל 1 - שרת:
```bash
npm run server
```

### טרמינל 2 - לקוח:
```bash
cd client
npm run dev
```

## פתיחת האתר:

לאחר שהשרתים רצים, פתח דפדפן בכתובת:

**http://localhost:3000**

## אם יש שגיאות:

1. **ודא שהתקנת את כל התלויות:**
   ```bash
   npm install
   cd client
   npm install
   ```

2. **ודא שהפורטים פנויים:**
   - פורט 5000 - שרת backend
   - פורט 3000 - שרת frontend

3. **אם יש שגיאת canvas (Windows):**
   - ראה INSTALLATION.md לפרטים

4. **בדוק את הקונסול:**
   - אמור לראות: "Server running on port 5000"
   - אמור לראות: "Database initialized successfully"

## בעיות נפוצות:

### "Cannot find module"
→ הרץ: `npm install` ו-`cd client && npm install`

### "Port already in use"
→ סגור תהליכים אחרים שמשתמשים בפורטים 3000 או 5000

### "Database error"
→ ודא שיש הרשאות כתיבה בתיקיית הפרויקט

### האתר לא נטען
→ ודא ששני השרתים רצים (backend ו-frontend)

