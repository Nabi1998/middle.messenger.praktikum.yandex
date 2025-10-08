import ChatsAPI from './ChatsAPI';
import WebSocketService, { Message } from './WebSocketService';
import EventBus from './EventBus';
import { Chat, CreateChatData, ChatUser } from '../types/api';

class ChatService extends EventBus {
  private chats: Chat[] = [];
  private currentChat: Chat | null = null;
  private messages: Message[] = [];
  private _isLoadingMessages = false;

  constructor() {
    super();
    this.setupWebSocketListeners();
  }

  private setupWebSocketListeners(): void {
    WebSocketService.on('connected', () => {
      this.emit('websocket:connected');
    });

    WebSocketService.on('disconnected', () => {
      this.emit('websocket:disconnected');
    });

    WebSocketService.on('newMessage', (message: Message) => {
      this.addMessage(message);
      this.emit('message:new', message);
    });

    WebSocketService.on('oldMessages', (messages: Message[]) => {
      this.setMessages(messages);
      this._isLoadingMessages = false;
      this.emit('messages:loaded', messages);
    });

    WebSocketService.on('error', (error: any) => {
      this.emit('websocket:error', error);
    });
  }

  async loadChats(): Promise<Chat[]> {
    try {
      this.chats = await ChatsAPI.getChats();
      this.emit('chats:loaded', this.chats);
      return this.chats;
    } catch (error) {
      this.emit('chats:error', error);
      throw error;
    }
  }

  async createChat(data: CreateChatData): Promise<Chat> {
    try {
      const result = await ChatsAPI.createChat(data);
      await this.loadChats(); // Reload chats to get the new one
      const newChat = this.chats.find(chat => chat.id === result.id);
      if (newChat) {
        this.emit('chat:created', newChat);
        return newChat;
      }
      throw new Error('Failed to find created chat');
    } catch (error) {
      this.emit('chat:error', error);
      throw error;
    }
  }

  async deleteChat(chatId: number): Promise<void> {
    try {
      await ChatsAPI.deleteChat(chatId);
      
      // If we're deleting the current chat, disconnect WebSocket
      if (this.currentChat && this.currentChat.id === chatId) {
        this.leaveCurrentChat();
      }
      
      // Remove from local chats array
      this.chats = this.chats.filter(chat => chat.id !== chatId);
      this.emit('chat:deleted', chatId);
      this.emit('chats:loaded', this.chats);
    } catch (error) {
      this.emit('chat:error', error);
      throw error;
    }
  }

  async joinChat(chatId: number): Promise<void> {
    try {
      const chat = this.chats.find(c => c.id === chatId);
      if (!chat) {
        throw new Error('Chat not found');
      }

      // Leave current chat if any
      if (this.currentChat) {
        this.leaveCurrentChat();
      }

      this.currentChat = chat;
      this.messages = [];
      this._isLoadingMessages = true;

      // Connect to WebSocket for this chat
      await WebSocketService.connect(chatId);
      
      this.emit('chat:joined', chat);
    } catch (error) {
      this.emit('chat:error', error);
      throw error;
    }
  }

  leaveCurrentChat(): void {
    if (this.currentChat) {
      WebSocketService.disconnect();
      const leftChat = this.currentChat;
      this.currentChat = null;
      this.messages = [];
      this.emit('chat:left', leftChat);
    }
  }

  async sendMessage(content: string): Promise<void> {
    if (!this.currentChat) {
      throw new Error('No active chat');
    }

    if (!content.trim()) {
      throw new Error('Message content cannot be empty');
    }

    try {
      WebSocketService.sendMessage(content.trim());
      this.emit('message:sent', content);
    } catch (error) {
      this.emit('message:error', error);
      throw error;
    }
  }

  loadMoreMessages(offset: number = 0): void {
    if (this._isLoadingMessages || !WebSocketService.isConnected()) {
      return;
    }

    this._isLoadingMessages = true;
    WebSocketService.getOldMessages(offset);
  }

  async getChatUsers(chatId: number): Promise<ChatUser[]> {
    try {
      const users = await ChatsAPI.getChatUsers(chatId);
      this.emit('chat:users:loaded', { chatId, users });
      return users;
    } catch (error) {
      this.emit('chat:users:error', error);
      throw error;
    }
  }

  async addUsersToChat(chatId: number, userIds: number[]): Promise<void> {
    try {
      await ChatsAPI.addUsersToChat(chatId, userIds);
      this.emit('chat:users:added', { chatId, userIds });
    } catch (error) {
      this.emit('chat:users:error', error);
      throw error;
    }
  }

  async removeUsersFromChat(chatId: number, userIds: number[]): Promise<void> {
    try {
      await ChatsAPI.removeUsersFromChat(chatId, userIds);
      this.emit('chat:users:removed', { chatId, userIds });
    } catch (error) {
      this.emit('chat:users:error', error);
      throw error;
    }
  }

  private addMessage(message: Message): void {
    // Avoid duplicates
    const exists = this.messages.some(m => m.id === message.id);
    if (!exists) {
      this.messages.push(message);
      this.sortMessages();
    }
  }

  private setMessages(messages: Message[]): void {
    this.messages = [...messages];
    this.sortMessages();
  }

  private sortMessages(): void {
    this.messages.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  }

  // Getters
  getChats(): Chat[] {
    return [...this.chats];
  }

  getCurrentChat(): Chat | null {
    return this.currentChat;
  }

  getMessages(): Message[] {
    return [...this.messages];
  }

  isWebSocketConnected(): boolean {
    return WebSocketService.isConnected();
  }

  getIsLoadingMessages(): boolean {
    return this._isLoadingMessages;
  }
}

export default new ChatService();
