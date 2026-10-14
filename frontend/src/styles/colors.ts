export const colors = {
  // الألوان الأساسية - أزرق داكن كلون رئيسي
  primary: {
    main: '#1e293b', // أزرق داكن جداً
    light: '#334155', // أزرق داكن فاتح قليلاً
    dark: '#0f172a', // أزرق داكن جداً
    contrastText: '#ffffff'
  },

  // اللون الثانوي - ذهبي/برونزي للحيوية
  secondary: {
    main: '#d97706', // برونزي/ذهبي داكن
    light: '#f59e0b', // ذهبي فاتح
    dark: '#b45309', // برونزي داكن
    contrastText: '#ffffff'
  },

  // ألوان الحالة
  status: {
    success: '#059669', // أخضر داكن
    warning: '#d97706', // برونزي/ذهبي
    error: '#dc2626', // أحمر داكن
    info: '#0891b2' // أزرق فاتح
  },

  // ألوان محايدة - تدرجات الرمادي
  neutral: {
    50: '#f8fafc',   // أبيض مائل للرمادي
    100: '#f1f5f9',  // رمادي فاتح جداً
    200: '#e2e8f0',  // رمادي فاتح
    300: '#cbd5e1',  // رمادي متوسط فاتح
    400: '#94a3b8',  // رمادي متوسط
    500: '#64748b',  // رمادي متوسط داكن
    600: '#475569',  // رمادي داكن
    700: '#334155',  // رمادي داكن جداً
    800: '#1e293b',  // رمادي داكن جداً جداً
    900: '#0f172a'   // أسود تقريباً
  },

  // ألوان النصوص
  text: {
    primary: '#0f172a',    // أسود تقريباً
    secondary: '#475569',  // رمادي داكن
    tertiary: '#64748b',   // رمادي متوسط
    inverse: '#ffffff',    // أبيض
    accent: '#d97706'      // برونزي للتركيز
  },

  // ألوان الخلفيات
  background: {
    primary: '#ffffff',    // أبيض
    secondary: '#f8fafc',  // أبيض مائل للرمادي
    tertiary: '#f1f5f9',  // رمادي فاتح جداً
    accent: '#fef3c7'      // أصفر فاتح جداً للخلفيات المميزة
  },

  // ألوان الحدود
  border: {
    light: '#e2e8f0',      // رمادي فاتح
    medium: '#cbd5e1',     // رمادي متوسط فاتح
    dark: '#94a3b8',       // رمادي متوسط
    accent: '#f59e0b'      // ذهبي للحدود المميزة
  },

  // متدرجات البطاقات - تدرجات الرمادي مع لمسات من الأزرق والذهبي
  gradients: {
    card1: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', // أزرق داكن
    card2: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)', // ذهبي/برونزي
    card3: 'linear-gradient(135deg, #334155 0%, #475569 100%)', // رمادي متوسط داكن
    card4: 'linear-gradient(135deg, #64748b 0%, #94a3b8 100%)', // رمادي متوسط
    card5: 'linear-gradient(135deg, #b45309 0%, #d97706 100%)', // برونزي داكن
    header: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', // أزرق داكن جداً
    sidebar: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)', // أزرق داكن جداً
    accent: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)'  // ذهبي/برونزي
  },

  // ظلال
  shadows: {
    small: '0 2px 8px rgba(15, 23, 42, 0.1)',
    medium: '0 4px 16px rgba(15, 23, 42, 0.12)',
    large: '0 8px 32px rgba(15, 23, 42, 0.15)',
    card: '0 8px 32px rgba(15, 23, 42, 0.12)',
    header: '0 4px 20px rgba(15, 23, 42, 0.3)',
    accent: '0 4px 16px rgba(217, 119, 6, 0.2)' // ظل ذهبي
  }
};

export const theme = {
  colors,
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem'
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem'
  }
}; 