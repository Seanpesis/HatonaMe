# הגדרת ngrok - 5 דקות

## מה זה ngrok?
ngrok מאפשר לחשוף את השרת המקומי שלך לאינטרנט - מושלם לבדיקות!

## התקנה מהירה:

### Windows:

1. **הורד:**
   - לך ל: https://ngrok.com/download
   - הורד את Windows version
   - חלץ את הקובץ

2. **או עם Chocolatey:**
   ```powershell
   choco install ngrok
   ```

### Linux/Mac:
```bash
# עם Homebrew (Mac)
brew install ngrok

# או הורד ידנית
```

---

## שימוש:

### שלב 1: הרשמה (חינמי)
1. לך ל: https://dashboard.ngrok.com/signup
2. הירשם (חינמי)
3. קבל את ה-auth token

### שלב 2: הגדר את ה-token
```bash
ngrok config add-authtoken YOUR_TOKEN_HERE
```

### שלב 3: הפעל ngrok
```bash
ngrok http 3000
```

### שלב 4: קבל את הכתובת
תראה משהו כמו:
```
Forwarding   https://abc123.ngrok.io -> http://localhost:3000
```

**העתק את הכתובת:** `https://abc123.ngrok.io`

### שלב 5: עדכן את .env
צור קובץ `.env` בתיקיית הפרויקט:
```
BASE_URL=https://abc123.ngrok.io
PORT=5000
```

### שלב 6: הפעל מחדש את השרת
```bash
npm run dev
```

---

## ⚠️ חשוב לדעת:

1. **הכתובת משתנה** - כל פעם שסוגרים ngrok, מקבלים כתובת חדשה
2. **לכתובת קבועה** - צריך חשבון בתשלום ($8/חודש)
3. **לבדיקה** - זה מושלם! לשימוש קבוע עדיף שרת אמיתי

---

## טיפים:

- **שמור את הכתובת פתוחה** - כל עוד ngrok רץ, הכתובת עובדת
- **לכתובת קבועה** - אפשר לשלם ל-ngrok או להשתמש בשירות אחר
- **לבדיקה מהירה** - זה הפתרון הכי קל!

---

**עכשיו הקישורים ב-WhatsApp יעבדו!** 🎉

