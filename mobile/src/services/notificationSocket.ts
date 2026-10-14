import { Notification } from '../types';

const WS_BASE_URL = 'ws://192.168.1.100:8000/ws/all-vehicles/'; // عدل IP والمنفذ حسب إعداداتك

export type NotificationListener = (notification: Notification) => void;

class NotificationSocketService {
  private socket: WebSocket | null = null;
  private listeners: NotificationListener[] = [];

  connect() {
    if (this.socket) return;
    this.socket = new WebSocket(WS_BASE_URL);
    this.socket.onopen = () => {
      // يمكن إرسال رسالة اشتراك إذا لزم الأمر
    };
    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'notification' && data.data) {
          this.listeners.forEach((cb) => cb(data.data));
        }
      } catch (e) {
        // تجاهل الأخطاء البسيطة
      }
    };
    this.socket.onerror = (e) => {
      // يمكن إضافة منطق إعادة الاتصال
    };
    this.socket.onclose = () => {
      this.socket = null;
      // يمكن إضافة منطق إعادة الاتصال
    };
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  subscribe(listener: NotificationListener) {
    this.listeners.push(listener);
    this.connect();
  }

  unsubscribe(listener: NotificationListener) {
    this.listeners = this.listeners.filter((cb) => cb !== listener);
    if (this.listeners.length === 0) {
      this.disconnect();
    }
  }
}

export default new NotificationSocketService(); 