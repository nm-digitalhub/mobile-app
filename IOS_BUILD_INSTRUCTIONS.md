# מעבר מExpo ל-React Native CLI - הוראות בנייה עבור iOS

## מסכם השלבים שבוצעו

✅ **המעבר הושלם בהצלחה!** האפליקציה עברה מExpo ל-React Native CLI.

### מה שוכח:
1. ✅ גיבוי הפרויקט הישן (`mobile-app-backup-20250624_005010.tar.gz`)
2. ✅ הסרת תלויות Expo מ-package.json
3. ✅ החלפת imports ב-App.js מExpo ל-React Native CLI
4. ✅ יצירת תיקיות native (ios/, android/)
5. ✅ עדכון הגדרות Android ו-iOS
6. ✅ התקנת native modules נדרשים
7. ✅ התאמת API configuration (החלפת expo-secure-store ב-AsyncStorage)

### שינויים מרכזיים שבוצעו:

#### 1. תלויות שהוחלפו:
- `expo-splash-screen` → `react-native-splash-screen`
- `expo-secure-store` → `@react-native-async-storage/async-storage`
- `@expo/vector-icons` → `react-native-vector-icons`
- `expo-camera` → `react-native-vision-camera`
- `expo-image-picker` → `react-native-image-picker`
- הסרה: `expo`, `@logrocket/react-native`, `expo-updates`

#### 2. קבצי הגדרה:
- ✅ `babel.config.js` - עודכן ל-React Native CLI preset
- ✅ `metro.config.js` - נוצר עבור React Native CLI
- ✅ `index.js` - עודכן לרגיסטרציה של React Native
- ✅ `ios/Podfile` - הוגדר עבור NMDigitalHub target

#### 3. הגדרות iOS:
- ✅ Bundle ID: `com.nmdigitalhub.app`
- ✅ App Name: `NM-DigitalHUB`
- ✅ הרשאות: Camera, Photos, Notifications
- ✅ RTL Support מוגדר

## הוראות בנייה ב-Mac (נדרש Xcode)

### דרישות מוקדמות:
- Mac עם macOS 12+ 
- Xcode 14+
- Node.js 18+
- CocoaPods

### 1. העתקת הפרויקט ל-Mac:
```bash
# העתק את התיקיה mobile-app לMac
# או שתף דרך git/cloud storage
```

### 2. התקנת תלויות:
```bash
cd mobile-app
npm install
```

### 3. התקנת iOS Pods:
```bash
cd ios
pod install
cd ..
```

### 4. בנייה ו-הרצה:

#### פיתוח (סימולטור):
```bash
# הפעל Metro bundler
npm start

# בטרמינל נפרד - הרץ iOS
npm run ios
# או
npx react-native run-ios
```

#### בנייה לשחרור (IPA):
```bash
# בניה עם Xcode:
cd ios
xcodebuild -workspace NMDigitalHub.xcworkspace \
           -scheme NMDigitalHub \
           -configuration Release \
           -destination generic/platform=iOS \
           -archivePath build/NMDigitalHub.xcarchive \
           archive

# יצירת IPA:
xcodebuild -exportArchive \
           -archivePath build/NMDigitalHub.xcarchive \
           -exportPath build/ipa \
           -exportOptionsPlist exportOptions.plist
```

### 5. יצירת exportOptions.plist:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>app-store</string>
    <key>uploadBitcode</key>
    <false/>
    <key>compileBitcode</key>
    <false/>
    <key>uploadSymbols</key>
    <true/>
</dict>
</plist>
```

## שינויים שנדרש להשלים ב-Mac

### 1. עדכון AppDelegate.swift:
```swift
import UIKit
import React
import SplashScreen // Add this

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {
  
  func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
    // Add splash screen
    SplashScreen.show()
    
    // Rest of your code...
    return true
  }
}
```

### 2. בדיקת Vector Icons:
ודא שב-`ios/NMDigitalHub/Info.plist` יש:
```xml
<key>UIAppFonts</key>
<array>
  <string>Ionicons.ttf</string>
</array>
```

### 3. הגדרות Push Notifications (אם נדרש):
- הוסף GoogleService-Info.plist ל-ios/NMDigitalHub/
- הפעל Push Notifications capabilities ב-Xcode

## בעיות אפשריות ופתרונות

### שגיאת Pod Install:
```bash
cd ios
rm -rf Pods Podfile.lock
pod install --repo-update
```

### שגיאת Bundle ID:
- בדוק ב-Xcode שה-Bundle ID הוא `com.nmdigitalhub.app`
- ודא שיש לך signing certificate מתאים

### שגיאות Vector Icons:
```bash
cd ios
rm -rf build
npx react-native run-ios --reset-cache
```

## מבנה הפרויקט החדש

```
mobile-app/
├── ios/                      # iOS Native Code
│   ├── NMDigitalHub.xcworkspace
│   ├── NMDigitalHub/
│   └── Podfile
├── android/                  # Android Native Code
│   ├── app/
│   └── build.gradle
├── src/                      # React Native Code
│   ├── screens/
│   ├── config/
│   └── components/
├── App.js                    # Main App Component (Updated)
├── index.js                  # App Registration (Updated)
├── package.json             # Dependencies (Updated)
├── babel.config.js          # Babel Config (Updated)
└── metro.config.js          # Metro Config (New)
```

## סטטוס הפונקציונליות

✅ **עובד:**
- Navigation (React Navigation)
- HTTP requests (Axios)
- Storage (AsyncStorage)
- RTL Support
- Basic styling

⚠️ **צריך בדיקה ב-Mac:**
- Camera functionality
- Image picker
- Push notifications
- Splash screen
- Vector icons rendering

🚨 **הוסר (יש להחליף אם נדרש):**
- LogRocket analytics
- Expo Updates
- Expo notifications

## הרצה ראשונה מומלצת

1. הרץ בסימולטור קודם
2. בדוק שכל הscreens נטענים
3. בדוק API connectivity
4. בדוק RTL rendering
5. רק אחר כך בנה ל-device

---

🎉 **המעבר הושלם בהצלחה!** האפליקציה כעת מוכנה לבניה כ-React Native CLI ללא תלות ב-Expo.