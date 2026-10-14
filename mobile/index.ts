import 'react-native-reanimated';
import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';
import { LogBox } from 'react-native';
import App from './App';

// تجاهل بعض التحذيرات
LogBox.ignoreLogs([
  'Warning: Failed prop type',
  'Non-serializable values were found in the navigation state',
  'AsyncStorage has been extracted from react-native',
]);

// تسجيل المكون الرئيسي
registerRootComponent(App);
