// import Block from '../../services/Block';
// import chatTemplateRaw from './chatPage.hbs?raw';
// import { setupFormValidation } from '../../utils/validation';
// import LogoutService from '../../services/LogoutService';
//
// const chatTemplate = chatTemplateRaw as unknown as string;
//
// interface Chat {
//   id: number;
//   title: string;
//   last_message?: {
//     content: string;
//     time: string;
//   };
// }
//
// interface Message {
//   id: number;
//   chatId: number;
//   userId: number;
//   content: string;
//   time: string;
// }
//
// export class chatPage extends Block {
//   private chats: Chat[] = [];
//   private activeChatId: number | null = null;
//   private currentUserId: number = 0;
//   private currentMessages: Message[] = [];
//
//   constructor() {
//     super({});
//   }
//
//   protected render(): string {
//     return chatTemplate;
//   }
//
//   async componentDidMount(): Promise<void> {
//     const AuthService = (await import('../../services/AuthService')).default;
//     const ChatService = (await import('../../services/ChatService')).default;
//
//     this.currentUserId = AuthService.getCurrentUser()?.id ?? 0;
//
//     // Подписка на события чатов
//     ChatService.on('chats:loaded', (chats: Chat[]) => {
//       this.chats = chats;
//       this.renderChatList();
//     });
//
//     ChatService.on('chat:deleted', (chatId: number) => {
//       if (this.activeChatId === chatId) {
//         this.activeChatId = null;
//         this.currentMessages = [];
//         this.renderMessagesPlaceholder();
//       }
//       this.renderChatList();
//     });
//
//     // Новые сообщения
//     ChatService.on('message:received', (msg: Message) => {
//       if (msg.chatId === this.activeChatId) {
//         this.currentMessages.push(msg);
//         this.addMessageToDOM(msg);
//       }
//     });
//
//     ChatService.on('message:sent', (msg: Message) => {
//       if (msg.chatId === this.activeChatId) {
//         this.currentMessages.push(msg);
//         this.addMessageToDOM(msg);
//       }
//     });
//
//     // Старые сообщения после joinChat
//     ChatService.on('messages:loaded', (msgs: Message[]) => {
//       if (!this.activeChatId) return;
//       this.currentMessages = msgs;
//       this.renderMessages(this.activeChatId);
//     });
//
//     // Загрузка чатов
//     await ChatService.loadChats();
//
//     // Инициализация UI
//     this.initChatClickHandler();
//     this.initProfileButton();
//     this.initCreateChatButton();
//     this.initMessageForm();
//     this.initLogoutButton();
//     this.initDeleteChatButton();
//   }
//
//   private renderChatList() {
//     const chatList = this._element?.querySelector('.chat-list');
//     if (!chatList) return;
//
//     chatList.innerHTML = this.chats
//       .map(chat => `
//         <div class="chat-item ${chat.id === this.activeChatId ? 'active' : ''}" data-chat-id="${chat.id}">
//           <div class="chat-avatar">👤</div>
//           <div class="chat-info">
//             <div class="chat-title">${chat.title}</div>
//             <div class="chat-last-message">${chat.last_message?.content || ''}</div>
//             <div class="chat-time">${chat.last_message?.time || ''}</div>
//           </div>
//         </div>
//       `)
//       .join('');
//   }
//
//   private initChatClickHandler() {
//     const chatList = this._element?.querySelector('.chat-list');
//     if (!chatList) return;
//
//     chatList.addEventListener('click', async (event) => {
//       const target = (event.target as HTMLElement)?.closest('.chat-item');
//       if (!target) return;
//
//       const chatIdAttr = target.getAttribute('data-chat-id');
//       if (!chatIdAttr) return;
//
//       const chatId = Number(chatIdAttr);
//       if (isNaN(chatId)) return;
//
//       if (this.activeChatId === chatId) return; // Уже открыт
//
//       this.activeChatId = chatId;
//       chatList.querySelectorAll('.chat-item').forEach(item => item.classList.remove('active'));
//       target.classList.add('active');
//
//       const ChatService = (await import('../../services/ChatService')).default;
//       this.currentMessages = []; // очистка перед загрузкой
//       this.renderMessagesPlaceholder();
//
//       try {
//         await ChatService.joinChat(chatId);
//         // Старые сообщения придут через событие 'messages:loaded'
//       } catch (error) {
//         console.error('Ошибка при подключении к чату:', error);
//       }
//     });
//   }
//
//   private renderMessages(chatId: number) {
//     const messagesContainer = this._element?.querySelector('.chat-messages');
//     if (!messagesContainer) return;
//
//     messagesContainer.innerHTML = `
//       <div class="chat-header-active">
//         <h3>${this.chats.find(c => c.id === chatId)?.title || 'Чат'}</h3>
//         <button class="delete-chat-btn" style="background-color:red;color:white;padding:8px;border:none;border-radius:5px">Удалить чат</button>
//       </div>
//       <div class="messages">
//         ${this.currentMessages
//       .map(msg => `
//             <div class="message ${msg.userId === this.currentUserId ? 'own' : ''}">
//               <span class="msg-content">${msg.content}</span>
//               <span class="msg-time">${new Date(msg.time).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}</span>
//             </div>`)
//       .join('')}
//       </div>
//     `;
//
//     const messagesDiv = messagesContainer.querySelector('.messages');
//     if (messagesDiv) messagesDiv.scrollTop = messagesDiv.scrollHeight;
//   }
//
//   private renderMessagesPlaceholder() {
//     const messagesContainer = this._element?.querySelector('.chat-messages');
//     if (!messagesContainer) return;
//
//     messagesContainer.innerHTML = `
//       <div class="chat-placeholder">
//         <h3>Выберите чат для начала общения</h3>
//         <p>Здесь будут отображаться сообщения выбранного чата</p>
//       </div>
//     `;
//   }
//
//   private addMessageToDOM(msg: Message) {
//     const messagesDiv = this._element?.querySelector('.messages');
//     if (!messagesDiv) return;
//
//     messagesDiv.insertAdjacentHTML(
//       'beforeend',
//       `<div class="message ${msg.userId === this.currentUserId ? 'own' : ''}">
//         <span class="msg-content">${msg.content}</span>
//         <span class="msg-time">${new Date(msg.time).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}</span>
//       </div>`
//     );
//
//     messagesDiv.scrollTop = messagesDiv.scrollHeight;
//   }
//
//   private initMessageForm() {
//     const messageForm = this._element?.querySelector<HTMLFormElement>('.message-form');
//     if (!messageForm) return;
//
//     const validateAll = setupFormValidation(messageForm);
//
//     messageForm.addEventListener('submit', async (e) => {
//       e.preventDefault();
//       if (!this.activeChatId) return alert('Выберите чат');
//
//       const messageInput = messageForm.querySelector<HTMLInputElement>('input[name="message"]');
//       if (!messageInput || !validateAll() || !messageInput.value.trim()) return;
//
//       const content = messageInput.value.trim();
//       const ChatService = (await import('../../services/ChatService')).default;
//       await ChatService.sendMessage(this.activeChatId, content);
//
//       messageInput.value = '';
//     });
//   }
//
//   private initCreateChatButton() {
//     const newChatBtn = this._element?.querySelector('.new-chat-btn');
//     if (!newChatBtn) return;
//
//     newChatBtn.addEventListener('click', async () => {
//       const chatTitle = prompt('Введите название нового чата');
//       if (!chatTitle) return;
//
//       const ChatService = (await import('../../services/ChatService')).default;
//       await ChatService.createChat({ title: chatTitle });
//     });
//   }
//
//   private initDeleteChatButton() {
//     const messagesContainer = this._element?.querySelector('.chat-messages');
//     if (!messagesContainer) return;
//
//     messagesContainer.addEventListener('click', async (event) => {
//       const target = (event.target as HTMLElement).closest('.delete-chat-btn');
//       if (!target || !this.activeChatId) return;
//
//       const confirmDelete = confirm('Вы действительно хотите удалить этот чат?');
//       if (!confirmDelete) return;
//
//       const ChatService = (await import('../../services/ChatService')).default;
//       await ChatService.deleteChat(this.activeChatId);
//
//       this.activeChatId = null;
//       this.currentMessages = [];
//       this.renderMessagesPlaceholder();
//     });
//   }
//
//   private initProfileButton() {
//     const profileBtn = this._element?.querySelector('.profile-btn');
//     if (!profileBtn) return;
//     profileBtn.addEventListener('click', () => {
//       const app = (window as any).app;
//       app?.getRouter()?.go('/settings');
//     });
//   }
//
//   private initLogoutButton() {
//     const logoutBtn = this._element?.querySelector<HTMLButtonElement>('#login-button');
//     if (!logoutBtn) return;
//
//     logoutBtn.addEventListener('click', () => {
//       LogoutService.logoutAndRedirect();
//     });
//   }
// }

import Block from '../../services/Block';
import chatTemplateRaw from './chatPage.hbs?raw';
import { setupFormValidation } from '../../utils/validation';
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
    const ChatService = (await import('../../services/ChatService')).default;

    this.currentUserId = AuthService.getCurrentUser()?.id ?? 0;

    // Восстанавливаем выбранный чат из localStorage
    const savedChatId = localStorage.getItem('activeChatId');
    if (savedChatId) this.activeChatId = Number(savedChatId);

    // Подписка на события чатов
    ChatService.on('chats:loaded', (chats: Chat[]) => {
      this.chats = chats;
      this.renderChatList();

      // Если есть сохранённый активный чат — выделяем и подключаемся
      if (this.activeChatId) {
        const chatItem = this._element?.querySelector(`.chat-item[data-chat-id="${this.activeChatId}"]`);
        if (chatItem) chatItem.classList.add('active');
        ChatService.joinChat(this.activeChatId);
      }
    });

    ChatService.on('chat:deleted', (chatId: number) => {
      if (this.activeChatId === chatId) {
        this.activeChatId = null;
        localStorage.removeItem('activeChatId');
        this.currentMessages = [];
        this.renderMessagesPlaceholder();
      }
      this.renderChatList();
    });

    // Новые сообщения
    ChatService.on('message:received', (msg: Message) => {
      if (msg.chatId === this.activeChatId) {
        this.currentMessages.push(msg);
        this.addMessageToDOM(msg);
      }
    });

    ChatService.on('message:sent', (msg: Message) => {
      if (msg.chatId === this.activeChatId) {
        this.currentMessages.push(msg);
        this.addMessageToDOM(msg);
      }
    });

    // Старые сообщения после joinChat
    ChatService.on('messages:loaded', (msgs: Message[]) => {
      if (!this.activeChatId) return;
      this.currentMessages = msgs;
      this.renderMessages(this.activeChatId);
    });

    // Загрузка чатов
    await ChatService.loadChats();

    // Инициализация UI
    this.initChatClickHandler();
    this.initProfileButton();
    this.initCreateChatButton();
    this.initMessageForm();
    this.initLogoutButton();
    this.initDeleteChatButton();
  }

  private renderChatList() {
    const chatList = this._element?.querySelector('.chat-list');
    if (!chatList) return;

    chatList.innerHTML = this.chats
      .map(chat => `
        <div class="chat-item ${chat.id === this.activeChatId ? 'active' : ''}" data-chat-id="${chat.id}">
          <div class="chat-avatar">👤</div>
          <div class="chat-info">
            <div class="chat-title">${chat.title}</div>
            <div class="chat-last-message">${chat.last_message?.content || ''}</div>
            <div class="chat-time">${chat.last_message?.time || ''}</div>
          </div>
        </div>
      `)
      .join('');
  }

  private initChatClickHandler() {
    const chatList = this._element?.querySelector('.chat-list');
    if (!chatList) return;

    chatList.addEventListener('click', async (event) => {
      const target = (event.target as HTMLElement)?.closest('.chat-item');
      if (!target) return;

      const chatIdAttr = target.getAttribute('data-chat-id');
      if (!chatIdAttr) return;

      const chatId = Number(chatIdAttr);
      if (isNaN(chatId)) return;

      if (this.activeChatId === chatId) return; // Уже открыт

      this.activeChatId = chatId;
      localStorage.setItem('activeChatId', chatId.toString()); // сохраняем выбранный чат

      chatList.querySelectorAll('.chat-item').forEach(item => item.classList.remove('active'));
      target.classList.add('active');

      const ChatService = (await import('../../services/ChatService')).default;
      this.currentMessages = []; // очистка перед загрузкой
      this.renderMessagesPlaceholder();

      try {
        await ChatService.joinChat(chatId);
        // Старые сообщения придут через событие 'messages:loaded'
      } catch (error) {
        console.error('Ошибка при подключении к чату:', error);
      }
    });
  }

  private renderMessages(chatId: number) {
    const messagesContainer = this._element?.querySelector('.chat-messages');
    if (!messagesContainer) return;

    messagesContainer.innerHTML = `
      <div class="chat-header-active">
        <h3>${this.chats.find(c => c.id === chatId)?.title || 'Чат'}</h3>
        <button class="delete-chat-btn" style="background-color:red;color:white;padding:8px;border:none;border-radius:5px">Удалить чат</button>
      </div>
      <div class="messages">
        ${this.currentMessages
      .map(msg => `
            <div class="message ${msg.userId === this.currentUserId ? 'own' : ''}">
              <span class="msg-content">${msg.content}</span>
              <span class="msg-time">${new Date(msg.time).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}</span>
            </div>`)
      .join('')}
      </div>
    `;

    const messagesDiv = messagesContainer.querySelector('.messages');
    if (messagesDiv) messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  private renderMessagesPlaceholder() {
    const messagesContainer = this._element?.querySelector('.chat-messages');
    if (!messagesContainer) return;

    messagesContainer.innerHTML = `
      <div class="chat-placeholder">
        <h3>Выберите чат для начала общения</h3>
        <p>Здесь будут отображаться сообщения выбранного чата</p>
      </div>
    `;
  }

  private addMessageToDOM(msg: Message) {
    const messagesDiv = this._element?.querySelector('.messages');
    if (!messagesDiv) return;

    messagesDiv.insertAdjacentHTML(
      'beforeend',
      `<div class="message ${msg.userId === this.currentUserId ? 'own' : ''}">
        <span class="msg-content">${msg.content}</span>
        <span class="msg-time">${new Date(msg.time).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}</span>
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
      if (!this.activeChatId) return alert('Выберите чат');

      const messageInput = messageForm.querySelector<HTMLInputElement>('input[name="message"]');
      if (!messageInput || !validateAll() || !messageInput.value.trim()) return;

      const content = messageInput.value.trim();
      const ChatService = (await import('../../services/ChatService')).default;
      await ChatService.sendMessage(this.activeChatId, content);

      messageInput.value = '';
    });
  }

  private initCreateChatButton() {
    const newChatBtn = this._element?.querySelector('.new-chat-btn');
    if (!newChatBtn) return;

    newChatBtn.addEventListener('click', async () => {
      const chatTitle = prompt('Введите название нового чата');
      if (!chatTitle) return;

      const ChatService = (await import('../../services/ChatService')).default;
      await ChatService.createChat({ title: chatTitle });
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

      const ChatService = (await import('../../services/ChatService')).default;
      await ChatService.deleteChat(this.activeChatId);

      this.activeChatId = null;
      localStorage.removeItem('activeChatId');
      this.currentMessages = [];
      this.renderMessagesPlaceholder();
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

  private initLogoutButton() {
    const logoutBtn = this._element?.querySelector<HTMLButtonElement>('#login-button');
    if (!logoutBtn) return;

    logoutBtn.addEventListener('click', () => {
      LogoutService.logoutAndRedirect();
    });
  }
}
