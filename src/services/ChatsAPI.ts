import HTTPTransport from './HTTPTransport';
import { Chat, CreateChatData, ChatUser } from '../types/api';

class ChatsAPI extends HTTPTransport {
  constructor() {
    super('/chats');
  }

  getChats(): Promise<Chat[]> {
    return this.get('').then((response) => {
      if (response.status === 200) {
        return JSON.parse(response.response);
      }
      throw new Error('Failed to get chats');
    });
  }

  createChat(data: CreateChatData): Promise<{ id: number }> {
    return this.post('', { data }).then((response) => {
      if (response.status === 200) {
        return JSON.parse(response.response);
      }
      throw new Error(JSON.parse(response.response).reason || 'Failed to create chat');
    });
  }

  deleteChat(chatId: number): Promise<void> {
    return this.delete('', { data: { chatId } }).then((response) => {
      if (response.status === 200) {
        return;
      }
      throw new Error('Failed to delete chat');
    });
  }

  getChatUsers(chatId: number): Promise<ChatUser[]> {
    return this.get(`/${chatId}/users`).then((response) => {
      if (response.status === 200) {
        return JSON.parse(response.response);
      }
      throw new Error('Failed to get chat users');
    });
  }

  addUsersToChat(chatId: number, users: number[]): Promise<void> {
    return this.put('/users', { data: { users, chatId } }).then((response) => {
      if (response.status === 200) {
        return;
      }
      throw new Error(JSON.parse(response.response).reason || 'Failed to add users to chat');
    });
  }

  removeUsersFromChat(chatId: number, users: number[]): Promise<void> {
    return this.delete('/users', { data: { users, chatId } }).then((response) => {
      if (response.status === 200) {
        return;
      }
      throw new Error(JSON.parse(response.response).reason || 'Failed to remove users from chat');
    });
  }

  getChatToken(chatId: number): Promise<{ token: string }> {
    console.log(chatId, 'chatId');
    return this.post(`/token/${chatId}`).then((response) => {
      if (response.status === 200) {
        return JSON.parse(response.response);
      }
      throw new Error('Failed to get chat token');
    });
  }
}

export default new ChatsAPI();
