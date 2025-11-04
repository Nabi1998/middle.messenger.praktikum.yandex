import Block from '../../services/Block';
import chatTemplateRaw from './chatPage.hbs?raw';
import ChatAPI from '../../services/ChatsAPI';
import { setupFormValidation } from '../../utils/validation';
import type { Message as WSMessage } from '../../services/WebSocketService';
import LogoutService from '../../services/LogoutService';

const chatTemplate = chatTemplateRaw as unknown as string;

interface Chat {
  id: number;
  title: string;
  last_message?: {
    content: string;
    time: string;
  };
}

interface ChatMessage extends WSMessage {
  chatId: number;
  userId: number;
}

interface Message {
  id: number;
  chatId: number;
  userId: number;
  content: string;
  time: string;
}

export class chatPage extends Block {
  private chats: Chat[] = [];
  private activeChatId: number | null = null;
  private currentUserId: number = 0;
  private currentMessages: Message[] = [];

  constructor() {
    super({});
  }

  protected render(): string {
    return chatTemplate;
  }

  async componentDidMount(): Promise<void> {
    const AuthService = (await import('../../services/AuthService')).default;
    this.currentUserId = AuthService.getCurrentUser()?.id ?? 0;

    await this.loadChats();

    this.initChatClickHandler();
    this.initProfileButton();
    this.initCreateChatButton();
    this.initMessageForm();
    this.initLogoutButton();
    this.initDeleteChatButton();

    const ChatService = (await import('../../services/ChatService')).default;
    ChatService.on('message:sent', (msg: unknown) => this.onMessageReceived(msg as ChatMessage));
    ChatService.on('message:received', (msg: unknown) => this.onMessageReceived(msg as ChatMessage));
  }

  private async loadChats() {
    try {
      this.chats = await ChatAPI.getChats();
      const chatList = this._element?.querySelector('.chat-list');
      if (!chatList) return;

      chatList.innerHTML = this.chats
        .map(chat => `
          <div class="chat-item" data-chat-id="${chat.id}">
            <div class="chat-avatar">👤</div>
            <div class="chat-info">
              <div class="chat-title">${chat.title}</div>
              <div class="chat-last-message">${chat.last_message?.content || ''}</div>
              <div class="chat-time">${chat.last_message?.time || ''}</div>
            </div>
          </div>
        `).join('');
    } catch (err) {
      console.error('Ошибка загрузки чатов:', err);
    }
  }

  private initChatClickHandler() {
    const chatList = this._element?.querySelector('.chat-list');
    if (!chatList) return;

    chatList.addEventListener('click', async (event) => {
      const target = (event.target as HTMLElement).closest('.chat-item');
      if (!target) return;

      const chatId = Number(target.getAttribute('data-chat-id'));
      this.activeChatId = chatId;

      chatList.querySelectorAll('.chat-item').forEach(item => item.classList.remove('active'));
      target.classList.add('active');

      await this.loadMessages(chatId);

      const tokenData = await ChatAPI.getChatToken(chatId);
      console.log('🪙 Токен для чата:', tokenData.token);
    });
  }

  // private initChatClickHandler() {
  //   const chatList = this._element?.querySelector('.chat-list');
  //   if (!chatList) return;
  //
  //   chatList.addEventListener('click', async (event) => {
  //     const target = (event.target as HTMLElement)?.closest('.chat-item');
  //
  //     if (!(target instanceof HTMLElement)) return; // безопасная проверка
  //
  //     const chatIdAttr = target.getAttribute('data-chat-id');
  //     if (!chatIdAttr) return;
  //
  //     const chatId = Number(chatIdAttr);
  //     if (isNaN(chatId)) return; // проверка на корректное число
  //
  //     this.activeChatId = chatId;
  //
  //     chatList.querySelectorAll('.chat-item').forEach(item => item.classList.remove('active'));
  //     target.classList.add('active');
  //
  //     await this.loadMessages(chatId);
  //
  //     const tokenData = await ChatAPI.getChatToken(chatId);
  //     console.log('🪙 Токен для чата:', tokenData.token);
  //   });
  // }

  private async loadMessages(chatId: number) {
    const messagesContainer = this._element?.querySelector('.chat-messages');
    if (!messagesContainer) return;

    try {
      const ChatService = (await import('../../services/ChatService')).default;
      this.currentMessages = await ChatService.getMessages();

      messagesContainer.innerHTML = `
        <div class="chat-header-active">
          <h3>${this.chats.find(c => c.id === chatId)?.title || 'Чат'}</h3>
          <button style="background-color: red; color: white; padding: 8px; border: none; border-radius: 5px" class="delete-chat-btn">Удалить чат</button>
        </div>
        <div class="messages">
          ${this.currentMessages
        .map(msg => `
          <div class="message ${msg.userId === this.currentUserId ? 'own' : ''}">
            <span class="msg-content">${msg.content}</span>
            <span class="msg-time">${new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>`).join('')}
        </div>
      `;

      const messagesDiv = messagesContainer.querySelector('.messages');
      if (messagesDiv) messagesDiv.scrollTop = messagesDiv.scrollHeight;
    } catch (err) {
      console.error('Ошибка загрузки сообщений:', err);
    }
  }

  private onMessageReceived(msg: Message) {
    if (msg.chatId !== this.activeChatId) return;
    this.addMessageToDOM(msg);
    this.currentMessages.push(msg);
  }

  private addMessageToDOM(msg: Message) {
    const messagesDiv = this._element?.querySelector('.messages');
    if (!messagesDiv) return;

    messagesDiv.insertAdjacentHTML(
      'beforeend',
      `<div class="message ${msg.userId === this.currentUserId ? 'own' : ''}">
        <span class="msg-content">${msg.content}</span>
        <span class="msg-time">${new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>`
    );

    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  private initMessageForm() {
    const messageForm = this._element?.querySelector<HTMLFormElement>('.message-form');
    if (!messageForm) return;

    const validateAll = setupFormValidation(messageForm);

    messageForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const messageInput = messageForm.querySelector<HTMLInputElement>('input[name="message"]');
      if (!messageInput || !validateAll() || !messageInput.value.trim()) return;
      if (!this.activeChatId) return alert('Выберите чат');

      const content = messageInput.value.trim();

      try {
        const ChatService = (await import('../../services/ChatService')).default;
        await ChatService.sendMessage(this.activeChatId, content);

        const msg: Message = {
          id: Date.now(),
          chatId: this.activeChatId,
          userId: this.currentUserId,
          content,
          time: new Date().toISOString(),
        };

        this.addMessageToDOM(msg);
        this.currentMessages.push(msg);
        messageInput.value = '';
      } catch (err) {
        console.error('Ошибка отправки сообщения:', err);
        alert('Не удалось отправить сообщение');
      }
    });
  }

  private initDeleteChatButton() {
    const messagesContainer = this._element?.querySelector('.chat-messages');
    if (!messagesContainer) return;

    messagesContainer.addEventListener('click', async (event) => {
      const target = (event.target as HTMLElement).closest('.delete-chat-btn');
      if (!target || !this.activeChatId) return;

      const confirmDelete = confirm('Вы действительно хотите удалить этот чат?');
      if (!confirmDelete) return;

      try {
        await ChatAPI.deleteChat(this.activeChatId);

        this.activeChatId = null;
        this.currentMessages = [];

        messagesContainer.innerHTML = `
          <div class="chat-placeholder">
            <h3>Выберите чат для начала общения</h3>
            <p>Здесь будут отображаться сообщения выбранного чата</p>
          </div>
        `;

        await this.loadChats();
      } catch (err) {
        console.error('Ошибка удаления чата:', err);
        alert('Не удалось удалить чат');
      }
    });
  }

  private initProfileButton() {
    const profileBtn = this._element?.querySelector('.profile-btn');
    if (!profileBtn) return;
    profileBtn.addEventListener('click', () => {
      const app = (window as any).app;
      app?.getRouter()?.go('/settings');
    });
  }

  private initCreateChatButton() {
    const newChatBtn = this._element?.querySelector('.new-chat-btn');
    if (!newChatBtn) return;

    newChatBtn.addEventListener('click', async () => {
      const chatTitle = prompt('Введите название нового чата');
      if (!chatTitle) return;

      try {
        await ChatAPI.createChat({ title: chatTitle });
        await this.loadChats();
      } catch (err) {
        console.error('Ошибка создания чата:', err);
      }
    });
  }

  /** 🔹 Кнопка выхода с редиректом на '/' */
  private initLogoutButton() {
    const logoutBtn = this._element?.querySelector<HTMLButtonElement>('#login-button');
    if (!logoutBtn) return;

    logoutBtn.addEventListener('click', () => {
      LogoutService.logoutAndRedirect();
    });
  }
}

