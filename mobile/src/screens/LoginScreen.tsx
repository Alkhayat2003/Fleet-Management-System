import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

// نظام الألوان الجديد - تصميم عصري وجذاب
const COLORS = {
  primary: '#667EEA', // أزرق بنفسجي جذاب
  primaryGradient: '#764BA2', // بنفسجي للتدريج
  secondary: '#F093FB', // وردي جذاب
  secondaryGradient: '#F5576C', // أحمر وردي للتدريج
  accent: '#4FACFE', // أزرق فاتح
  accentGradient: '#00F2FE', // أزرق سماوي للتدريج
  success: '#43E97B', // أخضر نيون
  successGradient: '#38F9D7', // أخضر سماوي للتدريج
  warning: '#FA709A', // وردي للتنبيهات
  danger: '#FF6B6B', // أحمر نيون
  background: '#0F0F23', // أسود مائل للأزرق
  surface: '#1A1A2E', // رمادي داكن
  card: '#16213E', // أزرق داكن للبطاقات
  text: '#FFFFFF', // أبيض للنصوص الرئيسية
  textLight: '#B8B8B8', // رمادي فاتح للنصوص الثانوية
  border: '#2A2A3E', // رمادي داكن للحدود
  shadow: '#000000', // أسود للظلال
  glass: 'rgba(255, 255, 255, 0.1)', // زجاجي شفاف
  glassDark: 'rgba(0, 0, 0, 0.3)', // زجاجي داكن
};

const LoginScreen: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuth();

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال اسم المستخدم وكلمة المرور');
      return;
    }

    const success = await login({ username: username.trim(), password });
    if (!success) {
      Alert.alert('خطأ', 'اسم المستخدم أو كلمة المرور غير صحيحة');
    }
  };

  return (
    <LinearGradient
      colors={[COLORS.background, COLORS.surface, COLORS.card]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* شعار التطبيق مع تأثيرات */}
          <View style={styles.logoContainer}>
            <View style={styles.logoIconContainer}>
              <View style={styles.logoIcon}>
                <Ionicons name="car-sport" size={80} color={COLORS.text} />
              </View>
              <View style={styles.logoGlow} />
            </View>
            <View style={styles.logoTextContainer}>
              <Text style={styles.logoText}>نظام إدارة الأسطول</Text>
              <Text style={styles.subtitleText}>تطبيق السائقين المحترف</Text>
            </View>
          </View>

          {/* نموذج تسجيل الدخول */}
          <View style={styles.formContainer}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>تسجيل الدخول</Text>
              <Text style={styles.formSubtitle}>أدخل بياناتك للوصول إلى النظام</Text>
            </View>

            {/* حقل اسم المستخدم */}
            <View style={styles.inputContainer}>
              <View style={styles.inputIconContainer}>
                <Ionicons name="person" size={20} color={COLORS.accent} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="اسم المستخدم"
                placeholderTextColor={COLORS.textLight}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* حقل كلمة المرور */}
            <View style={styles.inputContainer}>
              <View style={styles.inputIconContainer}>
                <Ionicons name="lock-closed" size={20} color={COLORS.accent} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="كلمة المرور"
                placeholderTextColor={COLORS.textLight}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color={COLORS.textLight}
                />
              </TouchableOpacity>
            </View>

            {/* زر تسجيل الدخول */}
            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryGradient]}
                style={styles.gradientButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.buttonContent}>
                  {isLoading ? (
                    <View style={styles.loadingContainer}>
                      <Ionicons name="refresh" size={20} color={COLORS.text} style={styles.loadingIcon} />
                      <Text style={styles.loginButtonText}>جاري تسجيل الدخول...</Text>
                    </View>
                  ) : (
                    <View style={styles.buttonContent}>
                      <Ionicons name="log-in" size={20} color={COLORS.text} style={styles.buttonIcon} />
                      <Text style={styles.loginButtonText}>تسجيل الدخول</Text>
                    </View>
                  )}
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* معلومات إضافية */}
            <View style={styles.infoContainer}>
              <View style={styles.infoIconContainer}>
                <Ionicons name="information-circle" size={20} color={COLORS.accent} />
              </View>
              <Text style={styles.infoText}>
                يرجى إدخال بيانات تسجيل الدخول المقدمة من إدارة الشركة
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  
  // شعار التطبيق
  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logoIconContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  logoIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.glass,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.glass,
  },
  logoGlow: {
    position: 'absolute',
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderRadius: 68,
    backgroundColor: COLORS.accent,
    opacity: 0.3,
    zIndex: -1,
  },
  logoTextContainer: {
    alignItems: 'center',
  },
  logoText: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: 16,
    color: COLORS.textLight,
    fontWeight: '400',
    textAlign: 'center',
  },
  
  // نموذج تسجيل الدخول
  formContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 30,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  formHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: '400',
    textAlign: 'center',
  },
  
  // حقول الإدخال
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    marginBottom: 20,
    paddingHorizontal: 16,
    backgroundColor: COLORS.surface,
    height: 56,
  },
  inputIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.glass,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: COLORS.glass,
  },
  input: {
    flex: 1,
    height: 56,
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'right',
    fontWeight: '500',
  },
  eyeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.glass,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    borderWidth: 1,
    borderColor: COLORS.glass,
  },
  
  // زر تسجيل الدخول
  loginButton: {
    marginTop: 10,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  gradientButton: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginLeft: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingIcon: {
    marginLeft: 8,
  },
  loginButtonText: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
  },
  
  // معلومات إضافية
  infoContainer: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.glass,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${COLORS.accent}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
    borderWidth: 1,
    borderColor: `${COLORS.accent}30`,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: '400',
    lineHeight: 20,
    textAlign: 'right',
  },
});

export default LoginScreen; 