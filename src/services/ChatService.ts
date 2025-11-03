// import ChatsAPI from './ChatsAPI';
// import WebSocketService, { Message } from './WebSocketService';
// import EventBus from './EventBus';
// import AuthService from './AuthService';
// import { Chat, CreateChatData } from '../types/api';
//
// class ChatService extends EventBus {
//   private chats: Chat[] = [];
//   private currentChat: Chat | null = null;
//   private messages: Message[] = [];
//   private _isLoadingMessages = false;
//   private currentUserId: number;
//
//   constructor() {
//     super();
//     this.currentUserId = AuthService.getCurrentUser()?.id ?? 0;
//     this.setupWebSocketListeners();
//   }
//
//   private setupWebSocketListeners(): void {
//     WebSocketService.on('connected', () => this.emit('websocket:connected'));
//     WebSocketService.on('disconnected', () => this.emit('websocket:disconnected'));
//     WebSocketService.on('newMessage', (message: Message) => {
//       this.addMessage(message);
//       this.emit('message:received', message);
//     });
//     WebSocketService.on('oldMessages', (messages: Message[]) => {
//       this.setMessages(messages);
//       this._isLoadingMessages = false;
//       this.emit('messages:loaded', messages);
//     });
//     WebSocketService.on('error', (error: unknown) => this.emit('websocket:error', error));
//   }
//
//   async loadChats(): Promise<Chat[]> {
//     try {
//       this.chats = await ChatsAPI.getChats();
//       this.emit('chats:loaded', this.chats);
//       return this.chats;
//     } catch (error) {
//       this.emit('chats:error', error);
//       return [];
//     }
//   }
//
//   async createChat(data: CreateChatData): Promise<Chat | null> {
//     try {
//       const result = await ChatsAPI.createChat(data);
//       await this.loadChats();
//       const newChat = this.chats.find(chat => chat.id === result.id) ?? null;
//       if (newChat) this.emit('chat:created', newChat);
//       return newChat;
//     } catch (error) {
//       this.emit('chat:error', error);
//       return null;
//     }
//   }
//
//   async deleteChat(chatId: number): Promise<void> {
//     try {
//       await ChatsAPI.deleteChat(chatId);
//       if (this.currentChat?.id === chatId) this.leaveCurrentChat();
//       this.chats = this.chats.filter(chat => chat.id !== chatId);
//       this.emit('chat:deleted', chatId);
//       this.emit('chats:loaded', this.chats);
//     } catch (error) {
//       this.emit('chat:error', error);
//     }
//   }
//
//   async joinChat(chatId: number): Promise<void> {
//     if (!this.chats.length) await this.loadChats();
//
//     const chat = this.chats.find(c => c.id === chatId);
//     if (!chat) throw new Error('Чат не найден');
//
//     if (this.currentChat) this.leaveCurrentChat();
//
//     this.currentChat = chat;
//     this.messages = [];
//     this._isLoadingMessages = true;
//
//     await WebSocketService.connect(chatId);
//     this.emit('chat:joined', chat);
//   }
//
//   leaveCurrentChat(): void {
//     if (!this.currentChat) return;
//     WebSocketService.disconnect();
//     const leftChat = this.currentChat;
//     this.currentChat = null;
//     this.messages = [];
//     this.emit('chat:left', leftChat);
//   }
//
//   async sendMessage(chatId: number, content: string): Promise<void> {
//     if (!content.trim()) throw new Error('Сообщение не может быть пустым');
//
//     try {
//       if (this.currentChat?.id !== chatId || !this.isWebSocketConnected()) {
//         await this.joinChat(chatId);
//       }
//
//       WebSocketService.sendMessage(content.trim());
//
//       const msg: Message = {
//         id: Date.now(),
//         chatId,
//         userId: this.currentUserId,
//         content,
//         time: new Date().toISOString(),
//       };
//
//       this.addMessage(msg);
//       this.emit('message:sent', msg);
//     } catch (error) {
//       this.emit('message:error', error);
//     }
//   }
//
//   loadMoreMessages(offset: number = 0): void {
//     if (this._isLoadingMessages || !WebSocketService.isConnected()) return;
//     this._isLoadingMessages = true;
//     WebSocketService.getOldMessages(offset);
//   }
//
//   getMessages(): Message[] {
//     return [...this.messages];
//   }
//
//   private addMessage(message: Message): void {
//     if (!this.messages.some(m => m.id === message.id)) {
//       this.messages.push(message);
//       this.sortMessages();
//     }
//   }
//
//   private setMessages(messages: Message[]): void {
//     this.messages = [...messages];
//     this.sortMessages();
//   }
//
//   private sortMessages(): void {
//     this.messages.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
//   }
//
//   isWebSocketConnected(): boolean {
//     return WebSocketService.isConnected();
//   }
//
//   getCurrentChat(): Chat | null {
//     return this.currentChat;
//   }
//
//   getChats(): Chat[] {
//     return [...this.chats];
//   }
// }
//
// export default new ChatService();
//


import ChatsAPI from './ChatsAPI';
import WebSocketService from './WebSocketService';
import EventBus from './EventBus';
import AuthService from './AuthService';
import { Chat, CreateChatData } from '../types/api';

// Тип сообщения для TS (используем camelCase в коде)
export interface Message {
  id: number;
  chatId: number;
  userId: number;
  content: string;
  time: string;
}

class ChatService extends EventBus {
  private chats: Chat[] = [];
  private currentChat: Chat | null = null;
  private messages: Message[] = [];
  private _isLoadingMessages = false;
  private currentUserId: number;

  constructor() {
    super();
    this.currentUserId = AuthService.getCurrentUser()?.id ?? 0;
    this.setupWebSocketListeners();
  }

  /** Настройка слушателей WebSocket */
  private setupWebSocketListeners(): void {
    WebSocketService.on('connected', () => this.emit('websocket:connected'));
    WebSocketService.on('disconnected', () => this.emit('websocket:disconnected'));

    // newMessage приходит с сервера
    WebSocketService.on('newMessage', (message: unknown) => {
      const msg = this.transformMessage(message);
      this.addMessage(msg);
      this.emit('message:received', msg);
    });

    // oldMessages приходит массив сообщений
    WebSocketService.on('oldMessages', (messages: unknown) => {
      const msgs = (messages as any[]).map(this.transformMessage);
      this.setMessages(msgs);
      this._isLoadingMessages = false;
      this.emit('messages:loaded', msgs);
    });

    WebSocketService.on('error', (error: unknown) => this.emit('websocket:error', error));
  }

  /** Преобразуем сообщение от сервера в camelCase */
  private transformMessage(message: unknown): Message {
    const msg = message as Record<string, any>;
    return {
      id: msg.id,
      chatId: msg.chat_id ?? msg.chatId,
      userId: msg.user_id ?? msg.userId,
      content: msg.content,
      time: msg.time,
    };
  }

  /** Загрузка чатов */
  async loadChats(): Promise<Chat[]> {
    try {
      this.chats = await ChatsAPI.getChats();
      this.emit('chats:loaded', this.chats);
      return this.chats;
    } catch (error) {
      this.emit('chats:error', error);
      return [];
    }
  }

  /** Создание нового чата */
  async createChat(data: CreateChatData): Promise<Chat | null> {
    try {
      const result = await ChatsAPI.createChat(data);
      await this.loadChats();
      const newChat = this.chats.find(chat => chat.id === result.id) ?? null;
      if (newChat) this.emit('chat:created', newChat);
      return newChat;
    } catch (error) {
      this.emit('chat:error', error);
      return null;
    }
  }

  /** Удаление чата */
  async deleteChat(chatId: number): Promise<void> {
    try {
      await ChatsAPI.deleteChat(chatId);
      if (this.currentChat?.id === chatId) this.leaveCurrentChat();
      this.chats = this.chats.filter(chat => chat.id !== chatId);
      this.emit('chat:deleted', chatId);
      this.emit('chats:loaded', this.chats);
    } catch (error) {
      this.emit('chat:error', error);
    }
  }

  /** Присоединение к чату */
  async joinChat(chatId: number): Promise<void> {
    if (!this.chats.length) await this.loadChats();

    const chat = this.chats.find(c => c.id === chatId);
    if (!chat) throw new Error('Чат не найден');

    if (this.currentChat) this.leaveCurrentChat();

    this.currentChat = chat;
    this.messages = [];
    this._isLoadingMessages = true;

    await WebSocketService.connect(chatId);
    this.emit('chat:joined', chat);
  }

  /** Покидаем текущий чат */
  leaveCurrentChat(): void {
    if (!this.currentChat) return;
    WebSocketService.disconnect();
    const leftChat = this.currentChat;
    this.currentChat = null;
    this.messages = [];
    this.emit('chat:left', leftChat);
  }

  /** Отправка сообщения */
  async sendMessage(chatId: number, content: string): Promise<void> {
    if (!content.trim()) throw new Error('Сообщение не может быть пустым');

    try {
      if (this.currentChat?.id !== chatId || !this.isWebSocketConnected()) {
        await this.joinChat(chatId);
      }

      WebSocketService.sendMessage(content.trim());

      const msg: Message = {
        id: Date.now(),
        chatId,
        userId: this.currentUserId,
        content,
        time: new Date().toISOString(),
      };

      this.addMessage(msg);
      this.emit('message:sent', msg);
    } catch (error) {
      this.emit('message:error', error);
    }
  }

  /** Загрузка старых сообщений */
  loadMoreMessages(offset: number = 0): void {
    if (this._isLoadingMessages || !WebSocketService.isConnected()) return;
    this._isLoadingMessages = true;
    WebSocketService.getOldMessages(offset);
  }

  /** Получить все сообщения */
  getMessages(): Message[] {
    return [...this.messages];
  }

  /** Добавление сообщения в массив и сортировка */
  private addMessage(message: Message): void {
    if (!this.messages.some(m => m.id === message.id)) {
      this.messages.push(message);
      this.sortMessages();
    }
  }

  /** Установка массива сообщений */
  private setMessages(messages: Message[]): void {
    this.messages = [...messages];
    this.sortMessages();
  }

  /** Сортировка сообщений по времени */
  private sortMessages(): void {
    this.messages.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  }

  /** Проверка подключения WebSocket */
  isWebSocketConnected(): boolean {
    return WebSocketService.isConnected();
  }

  /** Получить текущий чат */
  getCurrentChat(): Chat | null {
    return this.currentChat;
  }

  /** Получить все чаты */
  getChats(): Chat[] {
    return [...this.chats];
  }
}

export default new ChatService();
