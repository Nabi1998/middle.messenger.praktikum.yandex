import EventBus from './EventBus';

export interface Message {
  id: number;
  user_id: number;
  chat_id: number;
  type: 'message' | 'file';
  time: string;
  content: string;
  file?: {
    id: number;
    user_id: number;
    path: string;
    filename: string;
    content_type: string;
    content_size: number;
    upload_date: string;
  };
}

export interface WebSocketMessage {
  id?: string;
  type: 'get old' | 'message';
  content?: string;
}

class WebSocketService extends EventBus {
  private socket: WebSocket | null = null;
  private chatId: number | null = null;
  private token: string | null = null;
  private userId: number | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;
  private pingInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();
  }

  async connect(userId: number, chatId: number, token: string): Promise<void> {
    if (this.isConnecting || (this.socket && this.socket.readyState === WebSocket.OPEN)) {
      return;
    }

    this.isConnecting = true;
    this.userId = userId;
    this.chatId = chatId;
    this.token = token;

    try {
      // Формируем корректный URL с userId
      const wsUrl = `wss://ya-praktikum.tech/ws/chats/${userId}/${chatId}/${token}`;
      console.log(wsUrl, 'Connecting to WebSocket');
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.emit('connected');
        this.startPing();

        // Запрос истории сообщений сразу после подключения
        this.getOldMessages();
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (Array.isArray(data)) {
            // Старые сообщения
            this.emit('oldMessages', data.reverse());
          } else if (data.type === 'message') {
            // Новое сообщение
            this.emit('newMessage', data);
          } else if (data.type === 'pong') {
            // Pong - поддержание соединения
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.socket.onclose = (event) => {
        console.error('WebSocket closed:', event.code, event.reason);
        this.isConnecting = false;
        this.stopPing();
        this.emit('disconnected');

        // Попытка переподключения, если не было намеренного закрытия
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect();
        }
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnecting = false;
        this.emit('error', error);
      };

    } catch (error) {
      this.isConnecting = false;
      console.error('Failed to connect to WebSocket:', error);
      this.emit('error', error);
      throw error;
    }
  }

  disconnect(): void {
    this.stopPing();

    if (this.socket) {
      this.socket.close(1000, 'User disconnected');
      this.socket = null;
    }

    this.chatId = null;
    this.token = null;
    this.userId = null;
    this.reconnectAttempts = 0;
  }

  sendMessage(content: string): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not connected');
    }

    const message: WebSocketMessage = {
      id: this.generateMessageId(),
      type: 'message',
      content
    };

    this.socket.send(JSON.stringify(message));
  }

  getOldMessages(offset: number = 0): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;

    const message: WebSocketMessage = {
      id: this.generateMessageId(),
      type: 'get old',
      content: offset.toString()
    };

    this.socket.send(JSON.stringify(message));
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.error(`Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);

    setTimeout(() => {
      if (this.userId && this.chatId && this.token) {
        this.connect(this.userId, this.chatId, this.token);
      }
    }, delay);
  }

  private startPing(): void {
    this.pingInterval = setInterval(() => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000); // Каждые 30 секунд
  }

  private stopPing(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private generateMessageId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }

  getCurrentChatId(): number | null {
    return this.chatId;
  }
}

export default new WebSocketService();
