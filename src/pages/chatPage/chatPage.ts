import Block from '../../services/Block';
import chatTemplateRaw from './chatPage.hbs?raw';
import { validateField } from '../../utils/validation';
import LogoutService from '../../services/LogoutService';
import UserAPI from '../../services/UserAPI';
import { EventCallback } from '../../services/EventBus';

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

interface AddedUser {
  id: number;
  login: string;
}

export class chatPage extends Block {
  private chats: Chat[] = [];
  private activeChatId: number | null = null;
  private currentUserId: number = 0;
  private currentMessages: Message[] = [];

  constructor() {
    super({
      events: {
        click: (e: Event) => this.onClick(e),
        submit: (e: Event) => this.onSubmit(e),
      },
    });
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
    if (savedChatId) {
      this.activeChatId = Number(savedChatId);
      // Восстанавливаем список добавленных пользователей для этого чата
      this.renderAddedUsersList(this.activeChatId);
    }

    // Подписка на события чатов
    ChatService.on('chats:loaded', ((chats: Chat[]) => {
      this.chats = chats;
      this.renderChatList();

      // Если есть сохранённый активный чат — выделяем и подключаемся
      if (this.activeChatId) {
        const chatItem = this._element?.querySelector(`.chat-item[data-chat-id="${this.activeChatId}"]`);
        if (chatItem) chatItem.classList.add('active');
        ChatService.joinChat(this.activeChatId);
      }
    }) as EventCallback);

    ChatService.on('chat:deleted', ((chatId: number) => {
      if (this.activeChatId === chatId) {
        this.activeChatId = null;
        localStorage.removeItem('activeChatId');
        localStorage.removeItem(`addedUsers_${chatId}`); // Удаляем историю добавленных
        this.currentMessages = [];
        this.renderMessagesPlaceholder();
      }
      this.renderChatList();
    }) as EventCallback);

    // Новые сообщения
    ChatService.on('message:received', ((msg: Message) => {
      if (msg.chatId === this.activeChatId) {
        this.currentMessages.push(msg);
        this.addMessageToDOM(msg);
      }
    }) as EventCallback);

    ChatService.on('message:sent', ((msg: Message) => {
      if (msg.chatId === this.activeChatId) {
        this.currentMessages.push(msg);
        this.addMessageToDOM(msg);
      }
    }) as EventCallback);

    // Старые сообщения после joinChat
    ChatService.on('messages:loaded', ((msgs: Message[]) => {
      if (!this.activeChatId) return;
      this.currentMessages = msgs;
      this.renderMessages(this.activeChatId);
    }) as EventCallback);

    // Загрузка чатов
    await ChatService.loadChats();
  }

  // --- Методы для работы с LocalStorage (Добавленные пользователи) ---

  private getAddedUsersFromLS(chatId: number): AddedUser[] {
    const key = `addedUsers_${chatId}`;
    try {
      return JSON.parse(localStorage.getItem(key) || '[]');
    } catch {
      return [];
    }
  }

  private saveAddedUserToLS(chatId: number, user: AddedUser): void {
    const users = this.getAddedUsersFromLS(chatId);
    // Проверяем, нет ли уже такого пользователя в списке
    if (!users.some(u => u.id === user.id)) {
      users.push(user);
      localStorage.setItem(`addedUsers_${chatId}`, JSON.stringify(users));
    }
  }

  private removeAddedUserFromLS(chatId: number, userId: number): void {
    const users = this.getAddedUsersFromLS(chatId);
    const newUsers = users.filter(u => u.id !== userId);
    localStorage.setItem(`addedUsers_${chatId}`, JSON.stringify(newUsers));
  }

  private renderAddedUsersList(chatId: number): void {
    const modal = this._element?.querySelector('#add-user-modal');
    if (!modal) return;

    const addedContainer = modal.querySelector('#added-users-container');
    const addedList = modal.querySelector('#added-users-list');

    if (!addedContainer || !addedList) return;

    const users = this.getAddedUsersFromLS(chatId);

    addedList.innerHTML = '';

    if (users.length > 0) {
      addedContainer.classList.remove('hidden');
      users.forEach(user => {
        const item = document.createElement('div');
        item.className = 'added-user-item';
        item.innerHTML = `
          <span>✅ ${user.login}</span>
          <button class="remove-added-user-btn" data-user-id="${user.id}" title="Удалить из чата">🗑️</button>
        `;
        addedList.appendChild(item);
      });
    } else {
      addedContainer.classList.add('hidden');
    }
  }

  // -------------------------------------------------------------------

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

  private async onClick(e: Event) {
    const target = e.target as HTMLElement;

    // Chat item click
    const chatItem = target.closest('.chat-item');
    if (chatItem) {
      const chatIdAttr = chatItem.getAttribute('data-chat-id');
      if (!chatIdAttr) return;

      const chatId = Number(chatIdAttr);
      if (isNaN(chatId)) return;

      if (this.activeChatId === chatId) return; // Уже открыт

      this.activeChatId = chatId;
      localStorage.setItem('activeChatId', chatId.toString()); // сохраняем выбранный чат

      // Обновляем список добавленных пользователей для нового чата
      this.renderAddedUsersList(chatId);

      const chatList = this._element?.querySelector('.chat-list');
      if (chatList) {
        chatList.querySelectorAll('.chat-item').forEach(item => item.classList.remove('active'));
      }
      chatItem.classList.add('active');

      const ChatService = (await import('../../services/ChatService')).default;
      this.currentMessages = []; // очистка перед загрузкой
      this.renderMessagesPlaceholder();

      try {
        await ChatService.joinChat(chatId);
        // Старые сообщения придут через событие 'messages:loaded'
      } catch (error) {
        console.error('Ошибка при подключении к чату:', error);
      }
      return;
    }

    // New chat button
    if (target.closest('.new-chat-btn')) {
      const chatTitle = prompt('Введите название нового чата');
      if (!chatTitle) return;

      const ChatService = (await import('../../services/ChatService')).default;
      await ChatService.createChat({ title: chatTitle });
      return;
    }

    // Delete chat button
    if (target.closest('.delete-chat-btn')) {
      if (!this.activeChatId) return;

      const confirmDelete = confirm('Вы действительно хотите удалить этот чат?');
      if (!confirmDelete) return;

      const ChatService = (await import('../../services/ChatService')).default;
      await ChatService.deleteChat(this.activeChatId);

      this.activeChatId = null;
      localStorage.removeItem('activeChatId');
      this.currentMessages = [];
      this.renderMessagesPlaceholder();
      return;
    }

    // Add User Button
    if (target.closest('.add-user-btn')) {
      const modal = this._element?.querySelector('#add-user-modal');
      if (modal) {
        modal.classList.remove('hidden');
        // Очищаем только результаты поиска, список добавленных оставляем (он подгружается из LS)
        const resultsContainer = modal.querySelector('#search-results');
        if (resultsContainer) resultsContainer.innerHTML = '';

        // Убедимся, что список актуален
        if (this.activeChatId) {
          this.renderAddedUsersList(this.activeChatId);
        }
      }
      return;
    }

    // Cancel Add User
    if (target.closest('#cancel-add-user')) {
      const modal = this._element?.querySelector('#add-user-modal');
      if (modal) modal.classList.add('hidden');
      return;
    }

    // Add Found User Button
    if (target.closest('.add-found-user-btn')) {
      const btn = target.closest('.add-found-user-btn') as HTMLElement;
      const userId = Number(btn.getAttribute('data-user-id'));
      const userLogin = btn.getAttribute('data-user-login');
      if (!userId || !this.activeChatId) return;

      try {
        const ChatService = (await import('../../services/ChatService')).default;
        await ChatService.addUsersToChat(this.activeChatId, [userId]);

        // Обновляем UI кнопки
        btn.textContent = 'Добавлен';
        btn.setAttribute('disabled', 'true');
        btn.style.backgroundColor = 'green';

        // Сохраняем в LocalStorage и обновляем список
        if (userLogin) {
          this.saveAddedUserToLS(this.activeChatId, { id: userId, login: userLogin });
          this.renderAddedUsersList(this.activeChatId);
        }

      } catch (error) {
        console.error('Ошибка добавления пользователя:', error);
        alert('Ошибка добавления пользователя');
      }
      return;
    }

    // Remove Added User Button (from list)
    if (target.closest('.remove-added-user-btn')) {
      const btn = target.closest('.remove-added-user-btn') as HTMLElement;
      const userId = Number(btn.getAttribute('data-user-id'));
      if (!userId || !this.activeChatId) return;

      if (!confirm('Удалить пользователя из чата?')) return;

      try {
        const ChatService = (await import('../../services/ChatService')).default;
        await ChatService.removeUsersFromChat(this.activeChatId, [userId]);

        // Удаляем из LocalStorage и обновляем список
        this.removeAddedUserFromLS(this.activeChatId, userId);
        this.renderAddedUsersList(this.activeChatId);

        // Если пользователь был в результатах поиска, обновляем кнопку там тоже
        const searchBtn = this._element?.querySelector(`.add-found-user-btn[data-user-id="${userId}"]`) as HTMLElement;
        if (searchBtn) {
          searchBtn.textContent = 'Добавить';
          searchBtn.removeAttribute('disabled');
          searchBtn.style.backgroundColor = '';
        }

      } catch (error) {
        console.error('Ошибка удаления пользователя:', error);
        alert('Ошибка удаления пользователя');
      }
      return;
    }

    // Profile button
    if (target.closest('.profile-btn')) {
      const app = (window as any).app;
      app?.getRouter()?.go('/settings');
      return;
    }

    // Logout button
    if (target.closest('#login-button')) {
      LogoutService.logoutAndRedirect();
      return;
    }
  }

  private async onSubmit(e: Event) {
    const target = e.target as HTMLElement;

    // Message Form
    if (target.tagName === 'FORM' && target.classList.contains('message-form')) {
      e.preventDefault();
      if (!this.activeChatId) return alert('Выберите чат');

      const messageInput = target.querySelector<HTMLInputElement>('input[name="message"]');
      const errorEl = messageInput?.parentElement?.querySelector<HTMLElement>('.error-message');
      if (!messageInput || !validateField(messageInput, errorEl) || !messageInput.value.trim()) return;

      const content = messageInput.value.trim();
      const ChatService = (await import('../../services/ChatService')).default;
      await ChatService.sendMessage(this.activeChatId, content);

      messageInput.value = '';
      return;
    }

    // Search User Form (in Add User Modal)
    if (target.id === 'search-user-form') {
      e.preventDefault();
      const loginInput = target.querySelector<HTMLInputElement>('input[name="login"]');
      const login = loginInput?.value.trim();
      if (!login) return;

      const resultsContainer = this._element?.querySelector('#search-results');
      if (!resultsContainer) return;

      resultsContainer.innerHTML = 'Поиск...';

      try {
        const users = await UserAPI.searchUsers(login);
        if (!users.length) {
          resultsContainer.innerHTML = 'Пользователи не найдены';
          return;
        }

        // Получаем список уже добавленных, чтобы пометить их
        const addedUsers = this.activeChatId ? this.getAddedUsersFromLS(this.activeChatId) : [];

        resultsContainer.innerHTML = users.map(user => {
          const isAlreadyAdded = addedUsers.some(u => u.id === user.id);
          const btnText = isAlreadyAdded ? 'Добавлен' : 'Добавить';
          const btnDisabled = isAlreadyAdded ? 'disabled' : '';
          const btnStyle = isAlreadyAdded ? 'background-color: green;' : '';

          return `
          <div class="search-result-item">
            <span>${user.login}</span>
            <button
              class="add-found-user-btn"
              data-user-id="${user.id}"
              data-user-login="${user.login}"
              ${btnDisabled}
              style="${btnStyle}"
            >
              ${btnText}
            </button>
          </div>
        `;
        }).join('');

      } catch (error) {
        console.error('Ошибка поиска пользователей:', error);
        resultsContainer.innerHTML = 'Ошибка поиска';
      }
      return;
    }
  }

  private renderMessages(chatId: number) {
    const messagesContainer = this._element?.querySelector('.chat-messages');
    if (!messagesContainer) return;

    messagesContainer.innerHTML = `
      <div class="chat-header-active">
        <h3>${this.chats.find(c => c.id === chatId)?.title || 'Чат'}</h3>
        <div class="chat-actions">
          <button class="add-user-btn" style="margin-right: 5px;">+ Пользователь</button>
          <button class="delete-chat-btn" style="background-color:red;color:white;padding:8px;border:none;border-radius:5px">Удалить чат</button>
        </div>
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
}
