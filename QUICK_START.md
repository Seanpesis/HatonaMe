# התחלה מהירה - HatonaME

## שלב 1: הפעלה

### Windows:
לחץ פעמיים על `start.bat` או הרץ ב-PowerShell:
```powershell
.\start.bat
```

### או ידנית:
```bash
npm run dev
```

## שלב 2: פתיחת האתר

פתח דפדפן בכתובת:
**http://localhost:3000**

## מה אמור לקרות:

1. תראה בקונסול:
   - "Connected to SQLite database"
   - "Database initialized successfully"
   - "Server running on port 5000"
   - "ready - started server on 0.0.0.0:3000"

2. בדפדפן תראה את דף הבית של האתר

## אם זה לא עובד:

### שגיאה: "npm: command not found"
→ התקן Node.js מ: https://nodejs.org/

### שגיאה: "Cannot find module"
→ הרץ:
```bash
npm install
cd client
npm install
cd ..
```

### שגיאה: "Port already in use"
→ סגור תהליכים אחרים או שנה פורט ב-`package.json`

### האתר לא נטען
→ ודא ששני השרתים רצים (תראה 2 הודעות "running")

### שגיאת canvas (Windows)
→ זה לא קריטי - המערכת תעבוד גם בלי זה (רק לא תוכל להוסיף טקסט על תמונות)

## צעדים ראשונים:

1. לחץ על "יצירת אירוע חדש"
2. מלא שם אירוע ושמור
3. פתח את האירוע
4. בטאב "מוזמנים" - גרור קובץ Excel
5. בטאב "שולחנות" - לחץ "סדר שולחנות אוטומטית"

## עזרה נוספת:

- ראה `README.md` למדריך מלא
- ראה `INSTALLATION.md` לפרטים טכניים
- ראה `EXCEL_TEMPLATE.md` לתבנית Excel

