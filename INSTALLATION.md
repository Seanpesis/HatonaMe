# הוראות התקנה מפורטות

## שלב 1: התקנת Node.js

אם עדיין לא התקנת Node.js:
1. הורד מ: https://nodejs.org/
2. התקן את הגרסה LTS (מומלץ)
3. ודא שהתקנה הצליחה על ידי הרצת:
   ```bash
   node --version
   npm --version
   ```

## שלב 2: התקנת תלויות

### Windows:

פתח PowerShell או Command Prompt בתיקיית הפרויקט והרץ:

```powershell
# התקנת תלויות שרת
npm install

# התקנת תלויות לקוח
cd client
npm install
cd ..
```

### Linux/Mac:

```bash
# התקנת תלויות שרת
npm install

# התקנת תלויות לקוח
cd client && npm install && cd ..
```

## שלב 3: התקנת תלויות נוספות (Windows)

אם אתה משתמש ב-Windows, ייתכן שתצטרך להתקין תלויות נוספות עבור `canvas`:

### אפשרות 1: שימוש ב-Chocolatey

```powershell
choco install python2 visualstudio2019-workload-vctools
```

### אפשרות 2: התקנה ידנית

1. התקן Python 2.7
2. התקן Visual Studio Build Tools
3. הרץ מחדש: `npm install`

**הערה:** אם יש בעיות עם `canvas`, המערכת תעבוד גם בלעדיו (רק ללא הוספת טקסט על תמונות).

## שלב 4: הפעלת המערכת

### הפעלה מהירה (שני השרתים יחד):

```bash
npm run dev
```

זה יפעיל:
- שרת backend על `http://localhost:5000`
- שרת frontend על `http://localhost:3000`

### הפעלה נפרדת:

**טרמינל 1 - שרת:**
```bash
npm run server
```

**טרמינל 2 - לקוח:**
```bash
cd client
npm run dev
```

## שלב 5: שימוש ראשוני

1. פתח דפדפן בכתובת: `http://localhost:3000`
2. צור אירוע חדש
3. טען קובץ Excel עם מוזמנים (ראה `EXCEL_TEMPLATE.md`)
4. סדר שולחנות
5. העלה הזמנה
6. התחבר ל-WhatsApp (סרוק QR Code)
7. שלח הזמנות

## פתרון בעיות נפוצות

### שגיאת "canvas" ב-Windows
אם אתה מקבל שגיאה הקשורה ל-`canvas`:
- התקן את התלויות כמתואר למעלה
- או, התקן רק את התלויות הבסיסיות:
  ```bash
  npm install --no-optional
  ```

### פורט תפוס
אם הפורט 3000 או 5000 תפוס:
- שנה את הפורט ב-`server/index.js` (שורה 7)
- שנה את הפורט ב-`client/package.json` (בפקודת `dev`)

### WhatsApp לא מתחבר
- ודא שהטלפון מחובר לאינטרנט
- סרוק את ה-QR Code מחדש
- בדוק את הקונסול לשגיאות

### מסד נתונים לא נוצר
- ודא שיש הרשאות כתיבה בתיקיית הפרויקט
- בדוק את הקונסול לשגיאות

## תמיכה

אם נתקלת בבעיות, בדוק:
1. את הקונסול של השרת והלקוח
2. את קובץ ה-README.md
3. את קובץ ה-EXCEL_TEMPLATE.md

