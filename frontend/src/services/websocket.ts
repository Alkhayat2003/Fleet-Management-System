type MessageHandler = (data: any) => void;

export class WebSocketService {
  private socket: WebSocket | null = null;
  private url: string;
  private handlers: MessageHandler[] = [];

  constructor(url: string) {
    this.url = url;
  }

  connect() {
    this.socket = new WebSocket(this.url);
    this.socket.onopen = () => {
      console.log('تم الاتصال بـ WebSocket بنجاح');
    };
    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handlers.forEach((handler) => handler(data));
    };
    this.socket.onclose = () => {
      console.log('تم إغلاق اتصال WebSocket');
    };
    this.socket.onerror = (error) => {
      // طباعة تفاصيل أكثر عن الخطأ مع عنوان السيرفر
      console.error('خطأ في اتصال WebSocket:', error, 'url:', this.url);
    };
  }

  disconnect() {
    this.socket?.close();
  }

  onMessage(handler: MessageHandler) {
    this.handlers.push(handler);
  }

  send(data: any) {
    this.socket?.send(JSON.stringify(data));
  }
}

// مثال للاستخدام:
// const ws = new WebSocketService('ws://localhost:8000/ws/all-vehicles/');
// ws.connect();
// ws.onMessage((msg) => { ... });
// ws.send({ ... });
// ws.disconnect(); 