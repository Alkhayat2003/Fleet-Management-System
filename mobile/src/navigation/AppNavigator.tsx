import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import MapScreen from '../screens/MapScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LoadingScreen from '../components/LoadingScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import UnauthorizedScreen from '../components/UnauthorizedScreen';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

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

// مكون الشعار المخصص للشريط العلوي
const CustomHeaderLogo: React.FC<{ onRefresh?: () => void, refreshing?: boolean }> = ({ onRefresh, refreshing }) => {
  return (
    <View style={styles.headerLogoContainer}>
      <View style={styles.headerLogoIconContainer}>
        <View style={styles.headerLogoIcon}>
          <Ionicons name="car-sport" size={28} color="#fff" />
        </View>
        <View style={styles.headerLogoGlow} />
      </View>
      <Text style={styles.headerLogoText}>إدارة الأسطول</Text>
      {onRefresh && (
        <TouchableOpacity
          style={styles.headerRefreshButton}
          onPress={onRefresh}
          activeOpacity={0.7}
        >
          <Ionicons name={refreshing ? 'refresh' : 'refresh'} size={22} color="#fff" style={refreshing ? { transform: [{ rotate: '180deg' }] } : {}} />
        </TouchableOpacity>
      )}
    </View>
  );
};

// مكون زر القائمة الجانبية
const DrawerButton: React.FC<{ navigation: any }> = ({ navigation }) => {
  return (
    <TouchableOpacity
      style={styles.headerMenuButton}
      onPress={() => navigation.openDrawer()}
      activeOpacity={0.8}
    >
      <View style={styles.menuButtonIcon}>
        <Ionicons name="menu" size={24} color={COLORS.text} />
      </View>
      <View style={styles.menuButtonGlow} />
    </TouchableOpacity>
  );
};

// مكون القائمة الجانبية المخصص
const CustomDrawerContent: React.FC<any> = (props) => {
  const { user, logout } = useAuth();
  const currentRoute = props.state?.routes[props.state?.index]?.name;
  
  const handleNavigation = (screenName: string) => {
    props.navigation.navigate(screenName);
    props.navigation.closeDrawer();
  };
  
  const handleLogout = () => {
    props.navigation.closeDrawer();
    logout();
  };
  
  const isActiveRoute = (routeName: string) => {
    return currentRoute === routeName;
  };
  
  return (
    <View style={styles.drawerContainer}>
      {/* شعار التطبيق مع خلفية متدرجة */}
      <View style={styles.drawerHeader}>
        <View style={styles.drawerHeaderGradient}>
          <View style={styles.logoContainer}>
            <View style={styles.logoIconContainer}>
              <Ionicons name="car-sport" size={40} color={COLORS.text} />
              <View style={styles.logoGlow} />
            </View>
            <View style={styles.logoTextContainer}>
              <Text style={styles.logoTitle}>إدارة الأسطول</Text>
              <Text style={styles.logoSubtitle}>تطبيق السائقين المحترف</Text>
            </View>
          </View>
        </View>
      </View>
      
      {/* عناصر القائمة */}
      <View style={styles.menuItems}>
        <TouchableOpacity 
          style={[
            styles.menuItem,
            isActiveRoute('Dashboard') && styles.activeMenuItem
          ]}
          onPress={() => handleNavigation('Dashboard')}
          activeOpacity={0.7}
        >
          <View style={[
            styles.menuIconContainer,
            isActiveRoute('Dashboard') && styles.activeMenuIconContainer
          ]}>
            <Ionicons 
              name="home" 
              size={20} 
              color={isActiveRoute('Dashboard') ? COLORS.text : COLORS.accent} 
            />
          </View>
          <Text style={[
            styles.menuText,
            isActiveRoute('Dashboard') && styles.activeMenuText
          ]}>
            الرئيسية
          </Text>
          {isActiveRoute('Dashboard') && <View style={styles.activeIndicator} />}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.menuItem,
            isActiveRoute('Map') && styles.activeMenuItem
          ]}
          onPress={() => handleNavigation('Map')}
          activeOpacity={0.7}
        >
          <View style={[
            styles.menuIconContainer,
            isActiveRoute('Map') && styles.activeMenuIconContainer
          ]}>
            <Ionicons 
              name="map" 
              size={20} 
              color={isActiveRoute('Map') ? COLORS.text : COLORS.success} 
            />
          </View>
          <Text style={[
            styles.menuText,
            isActiveRoute('Map') && styles.activeMenuText
          ]}>
            الخريطة
          </Text>
          {isActiveRoute('Map') && <View style={styles.activeIndicator} />}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.menuItem,
            isActiveRoute('Profile') && styles.activeMenuItem
          ]}
          onPress={() => handleNavigation('Profile')}
          activeOpacity={0.7}
        >
          <View style={[
            styles.menuIconContainer,
            isActiveRoute('Profile') && styles.activeMenuIconContainer
          ]}>
            <Ionicons 
              name="person" 
              size={20} 
              color={isActiveRoute('Profile') ? COLORS.text : COLORS.warning} 
            />
          </View>
          <Text style={[
            styles.menuText,
            isActiveRoute('Profile') && styles.activeMenuText
          ]}>
            الملف الشخصي
          </Text>
          {isActiveRoute('Profile') && <View style={styles.activeIndicator} />}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.menuItem,
            isActiveRoute('Notifications') && styles.activeMenuItem
          ]}
          onPress={() => handleNavigation('Notifications')}
          activeOpacity={0.7}
        >
          <View style={[
            styles.menuIconContainer,
            isActiveRoute('Notifications') && styles.activeMenuIconContainer
          ]}>
            <Ionicons 
              name="notifications" 
              size={20} 
              color={isActiveRoute('Notifications') ? COLORS.text : COLORS.accent} 
            />
          </View>
          <Text style={[
            styles.menuText,
            isActiveRoute('Notifications') && styles.activeMenuText
          ]}>
            الإشعارات
          </Text>
          {isActiveRoute('Notifications') && <View style={styles.activeIndicator} />}
        </TouchableOpacity>
      </View>
      
      {/* زر تسجيل الخروج */}
      <View style={styles.logoutSection}>
        <TouchableOpacity 
          style={styles.logoutMenuItem}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <View style={styles.logoutIconContainer}>
            <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
          </View>
          <Text style={styles.logoutMenuText}>تسجيل الخروج</Text>
        </TouchableOpacity>
      </View>
      
      {/* معلومات إضافية */}
      <View style={styles.drawerFooter}>
        <View style={styles.footerContent}>
          <Text style={styles.footerText}>إدارة الأسطول v1.0</Text>
          <Text style={styles.footerSubtext}>جميع الحقوق محفوظة</Text>
        </View>
      </View>
    </View>
  );
};

// القائمة الجانبية للسائقين
const DriverDrawerNavigator: React.FC = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={({ route, navigation }) => ({
        headerShown: true,
        headerStyle: {
          backgroundColor: COLORS.background,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerTintColor: COLORS.text,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
        headerTitleAlign: 'center',
        headerShadowVisible: false,
        headerLeft: () => <DrawerButton navigation={navigation} />,
        drawerPosition: 'left',
        drawerStyle: {
          width: 320,
          backgroundColor: COLORS.background,
        },
        drawerActiveTintColor: COLORS.text,
        drawerInactiveTintColor: COLORS.textLight,
        drawerLabelStyle: {
          fontSize: 16,
          fontWeight: '500',
          marginLeft: -20,
        },
        drawerIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Map') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Notifications') {
            iconName = focused ? 'notifications' : 'notifications-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Drawer.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'الرئيسية',
          drawerLabel: 'الرئيسية',
          headerTitle: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="home" size={28} color={COLORS.accent} style={{ marginRight: 10 }} />
              <Text style={{ color: '#fff', fontSize: 22, fontWeight: 'bold', marginRight: 16 }}>الرئيسية</Text>
            </View>
          ),
        }}
      />
      <Drawer.Screen
        name="Map"
        component={MapScreen}
        options={{
          title: 'الخريطة',
          drawerLabel: 'الخريطة',
          headerTitle: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="map" size={28} color={COLORS.success} style={{ marginRight: 10 }} />
              <Text style={{ color: '#fff', fontSize: 22, fontWeight: 'bold', marginRight: 16 }}>الخريطة</Text>
            </View>
          ),
        }}
      />
      <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'الملف الشخصي',
          drawerLabel: 'الملف الشخصي',
          headerTitle: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="person" size={28} color={COLORS.warning} style={{ marginRight: 10 }} />
              <Text style={{ color: '#fff', fontSize: 22, fontWeight: 'bold', marginRight: 16 }}>الملف الشخصي</Text>
            </View>
          ),
        }}
      />
      <Drawer.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          title: 'الإشعارات',
          drawerLabel: 'الإشعارات',
          headerTitle: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="notifications" size={28} color={COLORS.accent} style={{ marginRight: 10 }} />
              <Text style={{ color: '#fff', fontSize: 22, fontWeight: 'bold', marginRight: 16 }}>الإشعارات</Text>
            </View>
          ),
        }}
      />
    </Drawer.Navigator>
  );
};

const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  // التحقق من الدور
  if (isAuthenticated && user?.role !== 'driver') {
    return <UnauthorizedScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <Stack.Screen name="Main" component={DriverDrawerNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  // شعار الشريط العلوي
  headerLogoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogoIconContainer: {
    position: 'relative',
    marginRight: 12,
  },
  headerLogoIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.glass,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.glass,
  },
  headerLogoGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 24,
    backgroundColor: COLORS.accent,
    opacity: 0.3,
    zIndex: -1,
  },
  headerLogoTextContainer: {
    flex: 1,
  },
  headerLogoText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  headerLogoSubtext: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '400',
  },
  headerMenuButton: {
    position: 'relative',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  menuButtonIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.glass,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.glass,
  },
  menuButtonGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 24,
    backgroundColor: COLORS.accent,
    opacity: 0.2,
    zIndex: -1,
  },
  
  // القائمة الجانبية
  drawerContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  drawerHeader: {
    backgroundColor: COLORS.background,
    paddingTop: 50,
    paddingBottom: 25,
    paddingHorizontal: 20,
  },
  drawerHeaderGradient: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  logoIconContainer: {
    position: 'relative',
    marginRight: 14,
  },
  logoIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.glass,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.glass,
  },
  logoGlow: {
    position: 'absolute',
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
    borderRadius: 31,
    backgroundColor: COLORS.accent,
    opacity: 0.2,
    zIndex: -1,
  },
  logoTextContainer: {
    flex: 1,
  },
  logoTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 3,
  },
  logoSubtitle: {
    fontSize: 13,
    color: COLORS.textLight,
    fontWeight: '400',
  },
  
  // عناصر القائمة
  menuItems: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 18,
    marginBottom: 12,
    borderRadius: 18,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeMenuItem: {
    backgroundColor: COLORS.glass,
    borderColor: COLORS.accent,
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.glass,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 18,
    borderWidth: 1,
    borderColor: COLORS.glass,
  },
  activeMenuIconContainer: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  menuText: {
    fontSize: 17,
    color: COLORS.text,
    fontWeight: '500',
    flex: 1,
  },
  activeMenuText: {
    color: COLORS.text,
    fontWeight: '600',
  },
  activeIndicator: {
    width: 4,
    height: 28,
    borderRadius: 2,
    backgroundColor: COLORS.accent,
  },
  
  // زر تسجيل الخروج
  logoutSection: {
    paddingHorizontal: 18,
    paddingBottom: 20,
  },
  logoutMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderRadius: 18,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  logoutIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${COLORS.danger}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 18,
    borderWidth: 1,
    borderColor: `${COLORS.danger}30`,
  },
  logoutMenuText: {
    fontSize: 17,
    color: COLORS.danger,
    fontWeight: '600',
    flex: 1,
  },
  
  // تذييل القائمة
  drawerFooter: {
    paddingHorizontal: 18,
    paddingBottom: 25,
  },
  footerContent: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  footerText: {
    fontSize: 13,
    color: COLORS.textLight,
    fontWeight: '500',
    marginBottom: 3,
  },
  footerSubtext: {
    fontSize: 11,
    color: COLORS.textLight,
    fontWeight: '400',
  },
  headerRefreshButton: {
    marginLeft: 12,
    backgroundColor: COLORS.accent,
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
});

export default AppNavigator; 