import View, { ViewProps } from '../services/View';
import chatPageTemplate from './chatPage/chatPage.hbs?raw';

export interface ChatPageProps extends ViewProps {
  chats?: Array<{
    id: string;
    title: string;
    lastMessage: string;
    unreadCount: number;
  }>;
}

export default class ChatPage extends View {
  protected getData(): ChatPageProps {
    return {
      chats: this.props.chats || [
        { id: '1', title: 'Общий чат', lastMessage: 'Привет всем!', unreadCount: 0 },
        { id: '2', title: 'Рабочие вопросы', lastMessage: 'Когда будет встреча?', unreadCount: 2 }
      ]
    };
  }

  protected template(): string {
    return chatPageTemplate;
  }

  protected afterRender(): void {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    const chatItems = this.getElement()?.querySelectorAll('.chat-item');
    if (chatItems) {
      chatItems.forEach(item => {
        item.addEventListener('click', () => {
          const chatId = item.getAttribute('data-chat-id');
          if (chatId) {
            this.selectChat(chatId);
          }
        });
      });
    }

    const newChatBtn = this.getElement()?.querySelector('.new-chat-btn');
    if (newChatBtn) {
      newChatBtn.addEventListener('click', () => {
        this.createNewChat();
      });
    }
  }

  private selectChat(chatId: string): void {
    // Update UI to show selected chat
    const chatItems = this.getElement()?.querySelectorAll('.chat-item');
    chatItems?.forEach(item => {
      item.classList.remove('active');
      if (item.getAttribute('data-chat-id') === chatId) {
        item.classList.add('active');
      }
    });

    // Enable message input
    const messageInput = this.getElement()?.querySelector('.message-input') as HTMLInputElement;
    const sendBtn = this.getElement()?.querySelector('.send-btn') as HTMLButtonElement;
    if (messageInput && sendBtn) {
      messageInput.disabled = false;
      sendBtn.disabled = false;
    }

    // Emit event for chat selection
    this.eventBus().emit('chat:selected', chatId);
  }

  private createNewChat(): void {
    this.eventBus().emit('chat:create');
  }
}
