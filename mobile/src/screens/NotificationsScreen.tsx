import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import ApiService from '../services/api';
import { Notification } from '../types';
import { Ionicons } from '@expo/vector-icons';
import NotificationSocketService from '../services/notificationSocket';

const COLORS = {
  primary: '#667EEA',
  background: '#0F0F23',
  card: '#16213E',
  text: '#FFFFFF',
  textLight: '#B8B8B8',
  accent: '#4FACFE',
  warning: '#FA709A',
  success: '#43E97B',
  danger: '#FF6B6B',
  glass: 'rgba(255,255,255,0.07)',
  shadow: '#000000',
};

const NotificationItem = ({ notification, onMarkRead }: { notification: Notification; onMarkRead: (id: number) => void }) => (
  <TouchableOpacity
    style={[styles.notificationItem, !notification.is_read && styles.unreadNotification]}
    onPress={() => !notification.is_read && onMarkRead(notification.id)}
    activeOpacity={0.8}
  >
    <View style={styles.iconContainer}>
      <Ionicons name={notification.is_read ? 'notifications-outline' : 'notifications'} size={24} color={notification.is_read ? COLORS.textLight : COLORS.accent} />
    </View>
    <View style={styles.textContainer}>
      <Text style={[styles.message, !notification.is_read && styles.unreadMessage]}>{notification.message}</Text>
      <Text style={styles.timestamp}>{new Date(notification.timestamp).toLocaleString()}</Text>
    </View>
    {!notification.is_read && (
      <View style={styles.unreadDot} />
    )}
  </TouchableOpacity>
);

const NotificationsScreen: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ApiService.getNotifications();
      setNotifications(data);
    } catch (error) {
      // يمكن إضافة Toast أو Alert هنا
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    // الاشتراك في WebSocket
    const handleNewNotification = (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
      Alert.alert('New Notification', notification.message);
    };
    NotificationSocketService.subscribe(handleNewNotification);
    return () => {
      NotificationSocketService.unsubscribe(handleNewNotification);
    };
  }, [fetchNotifications]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const handleMarkRead = async (id: number) => {
    try {
      await ApiService.markNotificationAsRead(id);
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
    } catch (error) {
      // يمكن إضافة Toast أو Alert هنا
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <View style={styles.container}>
      {/* تم حذف العنوان العلوي بناءً على طلب المستخدم */}
      {loading ? (
        <ActivityIndicator size="large" color={COLORS.accent} style={{ marginTop: 40 }} />
      ) : notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off" size={48} color={COLORS.textLight} />
          <Text style={styles.emptyText}>No notifications yet.</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <NotificationItem notification={item} onMarkRead={handleMarkRead} />
          )}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.accent,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
  },
  unreadCountContainer: {
    backgroundColor: COLORS.danger,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
    minWidth: 24,
    alignItems: 'center',
  },
  unreadCountText: {
    color: COLORS.text,
    fontWeight: 'bold',
    fontSize: 14,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 10,
    padding: 14,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  unreadNotification: {
    backgroundColor: COLORS.glass,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent,
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  message: {
    color: COLORS.text,
    fontSize: 16,
    marginBottom: 4,
  },
  unreadMessage: {
    fontWeight: 'bold',
    color: COLORS.accent,
  },
  timestamp: {
    color: COLORS.textLight,
    fontSize: 13,
  },
  unreadDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.accent,
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyText: {
    color: COLORS.textLight,
    fontSize: 18,
    marginTop: 12,
  },
});

export default NotificationsScreen; 