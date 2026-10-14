# تطبيق السائقين - نظام إدارة الأسطول

## نظرة عامة

تطبيق هاتف للسائقين مبني بـ React Native و Expo، يتكامل مع نظام إدارة الأسطول الخلفي (Backend) المبني بـ Django.

## الميزات

- **تسجيل الدخول الآمن**: باستخدام JWT tokens
- **لوحة تحكم السائق**: عرض الرحلات النشطة والمتاحة
- **تتبع الموقع**: تتبع تلقائي ويدوي للموقع
- **الخريطة التفاعلية**: عرض الموقع الحالي والمسار
- **الملف الشخصي**: إدارة البيانات الشخصية
- **التحديثات المباشرة**: تحديث البيانات في الوقت الفعلي

## المتطلبات

- Node.js 16+
- npm أو yarn
- Expo CLI
- Android Studio (للتطوير على Android)
- Xcode (للتطوير على iOS - macOS فقط)

## التثبيت والتشغيل

### 1. تثبيت التبعيات

```bash
npm install
```

### 2. تشغيل التطبيق

```bash
# تشغيل على Android
npm run android

# تشغيل على iOS (macOS فقط)
npm run ios

# تشغيل على الويب
npm run web

# تشغيل Expo Development Server
npx expo start
```

### 3. إعداد الخادم الخلفي

تأكد من تشغيل الخادم الخلفي (Django) على المنفذ 8000:

```bash
cd ../backend
python manage.py runserver 8000
```

## هيكل المشروع

```
src/
├── components/          # المكونات المشتركة
│   └── LoadingScreen.tsx
├── contexts/           # سياقات React
│   ├── AuthContext.tsx
│   └── TripContext.tsx
├── navigation/         # نظام التنقل
│   └── AppNavigator.tsx
├── screens/           # شاشات التطبيق
│   ├── LoginScreen.tsx
│   ├── DashboardScreen.tsx
│   ├── MapScreen.tsx
│   └── ProfileScreen.tsx
├── services/          # خدمات API
│   ├── api.ts
│   └── locationService.ts
└── types/             # تعريفات TypeScript
    └── index.ts
```

## الشاشات

### 1. شاشة تسجيل الدخول

- تسجيل الدخول باستخدام اسم المستخدم وكلمة المرور
- تصميم جميل مع تدرج لوني
- التحقق من صحة البيانات

### 2. لوحة التحكم الرئيسية

- عرض إحصائيات سريعة
- قائمة الرحلات المتاحة
- إدارة الرحلة الحالية
- أزرار بدء وإنهاء الرحلات

### 3. شاشة الخريطة

- عرض الموقع الحالي
- تتبع الموقع في الخلفية
- إرسال الموقع يدوياً
- عرض سجل المواقع

### 4. الملف الشخصي

- عرض وتعديل البيانات الشخصية
- تغيير كلمة المرور
- معلومات الرخصة
- تسجيل الخروج

## الأذونات المطلوبة

### Android

- `ACCESS_FINE_LOCATION`
- `ACCESS_COARSE_LOCATION`
- `ACCESS_BACKGROUND_LOCATION`
- `FOREGROUND_SERVICE`
- `WAKE_LOCK`

### iOS

- `NSLocationWhenInUseUsageDescription`
- `NSLocationAlwaysAndWhenInUseUsageDescription`
- `UIBackgroundModes` (location, background-processing)

## التكوين

### تغيير عنوان الخادم

في ملف `src/services/api.ts`:

```typescript
const API_BASE_URL = 'http://your-server-ip:8000/api';
```

### إعدادات التطبيق

في ملف `app.json`:

```json
{
  "expo": {
    "name": "Fleet Management Driver App",
    "slug": "fleet-management-driver",
    "version": "1.0.0"
  }
}
```

## استكشاف الأخطاء

### مشاكل الاتصال بالخادم

1. تأكد من تشغيل الخادم الخلفي
2. تحقق من عنوان IP والمنفذ
3. تأكد من إعدادات الشبكة

### مشاكل الموقع

1. تأكد من منح الأذونات المطلوبة
2. تحقق من إعدادات GPS
3. أعد تشغيل التطبيق

### مشاكل تسجيل الدخول

1. تحقق من صحة بيانات تسجيل الدخول
2. تأكد من اتصال الإنترنت
3. تحقق من حالة الخادم

## المساهمة

1. Fork المشروع
2. أنشئ فرع جديد للميزة
3. اكتب الكود مع التعليقات
4. اختبر التطبيق
5. أرسل Pull Request

## الترخيص

هذا المشروع مرخص تحت رخصة MIT.

## الدعم

للحصول على الدعم أو الإبلاغ عن مشاكل:

- افتح Issue في GitHub
- تواصل مع فريق التطوير
