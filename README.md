# Support Mobile App - NM Digital Hub

אפליקציית מובייל היברידית לנציגי תמיכה של NM Digital Hub

## תכונות עיקריות

### 🎯 ניהול טיקטי תמיכה
- צפייה בכל הטיקטים עם פילטרים מתקדמים
- עדכון סטטוס וקדימות טיקטים
- הוספת תגובות והודעות
- עדכונים בזמן אמת

### 👥 ניהול לקוחות
- רשימת לקוחות עם חיפוש מתקדם
- פרטי לקוח מלאים כולל הזמנות ודומיינים
- היסטוריית פעילות הלקוח

### 📦 ניהול הזמנות
- צפייה בכל ההזמנות
- עדכון סטטוס הזמנות
- מעקב אחר תהליכי provisioning

### 📊 דשבורד ואנליטיקה
- סטטיסטיקות בזמן אמת
- גרפים ודוחות
- התראות חשובות

### 🔐 אבטחה מתקדמת
- אימות Laravel Sanctum
- תמיכה במכשירים מרובים
- ניהול הפעלות

## טכנולוגיות

- **Frontend**: React Native + Expo
- **Backend**: Laravel 10 + Filament 3
- **Database**: MySQL
- **Authentication**: Laravel Sanctum
- **Real-time**: WebSocket (עתידי)
- **Push Notifications**: Expo Notifications

## התקנה ופיתוח

### דרישות מקדימות
```bash
# Node.js 18+
node --version

# Expo CLI
npm install -g @expo/cli

# EAS CLI (לבניית האפליקציה)
npm install -g eas-cli
```

### התקנת dependencies
```bash
cd mobile-app
npm install
```

### הרצת האפליקציה בפיתוח
```bash
# הרצה על כל הפלטפורמות
npm start

# הרצה על Android
npm run android

# הרצה על iOS
npm run ios

# הרצה על Web
npm run web
```

### בניית האפליקציה לפרודקשן
```bash
# התקנת EAS
eas login

# הגדרת הפרויקט (אם נדרש)
eas build:configure

# בניה לכל הפלטפורמות
eas build --platform all

# בניה לאנדרואיד בלבד
eas build --platform android

# בניה ל-iOS בלבד
eas build --platform ios

# בניה ל-TestFlight
eas build --platform ios --profile testflight

# בניה לפרודקשן
eas build --platform ios --profile production
```

## הגדרת API

### משתני סביבה
ה-API URL כבר מוגדר נכון בקובץ `src/config/api.js`:

```javascript
// הגדרה אוטומטית - ייקח מ-environment variable או ברירת מחדל
const getBaseURL = () => {
  return process.env.EXPO_PUBLIC_API_URL || 'https://nm-digitalhub.com/api';
};
```

### אימות ההגדרה
```bash
# בדיקת חיבור ל-API (דורש הרשאות STAFF)
curl https://nm-digitalhub.com/api/auth/verify \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"
```

## מבנה הפרויקט

```
mobile-app/
├── src/
│   ├── config/
│   │   ├── api.js           # הגדרות API
│   │   └── constants.js     # קבועים כלליים
│   ├── screens/
│   │   ├── auth/           # מסכי אימות
│   │   ├── main/           # מסכים ראשיים
│   │   ├── tickets/        # ניהול טיקטים
│   │   ├── clients/        # ניהול לקוחות
│   │   ├── orders/         # ניהול הזמנות
│   │   └── profile/        # הגדרות פרופיל
│   ├── components/         # רכיבים משותפים
│   ├── services/          # שירותים
│   └── utils/             # עזרים
├── assets/                # תמונות ואייקונים
├── app.json              # הגדרות Expo
├── package.json          # Dependencies
└── README.md
```

## API Endpoints

### אימות
- `POST /api/auth/login` - התחברות
- `POST /api/auth/logout` - התנתקות
- `GET /api/auth/profile` - פרטי המשתמש
- `POST /api/auth/refresh` - רענון טוקן

### נתוני דשבורד
- `GET /api/mobile/dashboard` - נתוני דשבורד
- `GET /api/mobile/notifications` - התראות

### טיקטים
- `GET /api/mobile/tickets` - רשימת טיקטים
- `GET /api/mobile/tickets/{id}` - פרטי טיקט
- `PUT /api/mobile/tickets/{id}` - עדכון טיקט
- `POST /api/mobile/tickets/{id}/messages` - הוספת הודעה

### לקוחות
- `GET /api/mobile/clients` - רשימת לקוחות
- `GET /api/mobile/clients/{id}` - פרטי לקוח

### הזמנות
- `GET /api/mobile/orders` - רשימת הזמנות
- `PUT /api/mobile/orders/{id}` - עדכון הזמנה

### אנליטיקה
- `GET /api/mobile/analytics` - נתוני אנליטיקה

## תכונות מתקדמות

### תמיכה בעברית ו-RTL
האפליקציה תומכת במלואה בעברית וכיוון RTL:
- כל הטקסטים בעברית
- סידור רכיבים מימין לשמאל
- תאריכים בפורמט עברי
- פונטים מותאמים

### התראות Push
```javascript
// רישום למכשיר להתראות
import { registerForPushNotificationsAsync } from './services/notifications';

await registerForPushNotificationsAsync();
```

### קאש וביצועים
- קאש אוטומטי של API calls
- טעינה lazy של תמונות
- אופטימיזציה לרשימות ארוכות

## בעיות נפוצות ופתרונות

### האפליקציה נתקעת במסך Splash (TestFlight)
זוהי הבעיה הנפוצה ביותר. יכולות להיות מספר סיבות:

```bash
# 1. בדוק שהמשתמש הוא STAFF/ADMIN/SUPER_ADMIN
# באפליקציית הניהול (Filament) - ערוך הרשאות משתמש

# 2. בדוק חיבור API
curl https://nm-digitalhub.com/api/auth/verify \
  -H "Authorization: Bearer TOKEN" \
  -H "Accept: application/json"

# 3. וודא שהועלה Production Build ולא Development Build
# Development builds דורשים שרת פיתוח פעיל
```

**פתרון**: בנה מחדש עם:
```bash
eas build --platform ios --profile production
```

### שגיאת חיבור API
```bash
# בדוק שה-server פועל
curl https://nm-digitalhub.com/api/mobile/dashboard

# בדוק הרשאות CORS ו-Laravel Sanctum
```

### בעיות RTL
```javascript
// הפעלת RTL ידנית
import { I18nManager } from 'react-native';
I18nManager.forceRTL(true);
```

### בעיות בניה
```bash
# נקה את ה-cache
npx expo start --clear

# התקן מחדש dependencies
rm -rf node_modules package-lock.json
npm install

# נקה cache של Metro
npx expo start --clear
```

## תרומה לפרויקט

1. צור branch חדש מ-main
2. בצע את השינויים שלך
3. הרץ את הבדיקות
4. שלח Pull Request

### הרצת בדיקות
```bash
# בדיקת תקינות הקוד
npm run start

# בדיקת build ללא שגיאות
eas build --platform ios --profile preview --non-interactive

# בדיקת API connectivity
curl https://nm-digitalhub.com/api/auth/verify
```

## רישיון

הפרויקט הזה שייך ל-NM Digital Hub ומיועד לשימוש פנימי בלבד.

## תמיכה טכנית

לתמיכה טכנית, פנה למנהל המערכת או צור issue בפרויקט.

---

**NM Digital Hub** - פתרונות דיגיטליים מתקדמים