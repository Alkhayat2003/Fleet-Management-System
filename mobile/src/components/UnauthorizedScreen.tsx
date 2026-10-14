import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

const COLORS = {
  primary: '#667EEA',
  background: '#0F0F23',
  card: '#16213E',
  text: '#FFFFFF',
  accent: '#4FACFE',
  danger: '#FF6B6B',
};

const UnauthorizedScreen: React.FC = () => {
  const { logout } = useAuth();
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="close-circle" size={80} color={COLORS.danger} />
      </View>
      <Text style={styles.title}>وصول غير مصرح</Text>
      <Text style={styles.message}>
        هذا التطبيق مخصص للسائقين فقط. يرجى التواصل مع الإدارة إذا كنت تعتقد أن هناك خطأ في حسابك.
      </Text>
      <TouchableOpacity style={styles.button} onPress={logout}>
        <Text style={styles.buttonText}>العودة إلى تسجيل الدخول</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  iconContainer: {
    marginBottom: 24,
    backgroundColor: COLORS.card,
    borderRadius: 60,
    padding: 18,
    shadowColor: COLORS.danger,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  title: {
    fontSize: 28,
    color: COLORS.danger,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 18,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 30,
  },
  button: {
    marginTop: 32,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 30,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  buttonText: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 1,
  },
});

export default UnauthorizedScreen; 