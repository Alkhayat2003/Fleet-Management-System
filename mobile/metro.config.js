const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// تحسين الأداء وإظهار الأخطاء
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// إضافة دعم للصور والملفات
config.resolver.assetExts.push('png', 'jpg', 'jpeg', 'gif', 'svg');

// تحسين التخزين المؤقت
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

// إضافة دعم للـ TypeScript
config.resolver.sourceExts = ['js', 'jsx', 'json', 'ts', 'tsx'];

module.exports = config; 