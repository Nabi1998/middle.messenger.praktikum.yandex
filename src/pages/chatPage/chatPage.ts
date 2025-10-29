import Block from '../../services/Block';
import chatTemplateRaw from './chatPage.hbs?raw';
import { setupFormValidation } from '../../utils/validation';

const chatTemplate = chatTemplateRaw as unknown as string;

export class chatPage extends Block {
  constructor() {
    super({});
  }

  protected render(): string {
    return chatTemplate;
  }

  protected componentDidMount(): void {
    const messageForm = this._element?.querySelector<HTMLFormElement>('.message-form');
    if (!messageForm) return;

    const validateAll = setupFormValidation(messageForm);

    messageForm.addEventListener('submit', (e) => {
      e.preventDefault();

      if (validateAll()) {
        const messageInput = messageForm.querySelector<HTMLInputElement>('input[name="message"]');
        if (messageInput && messageInput.value.trim()) {
          console.warn('✅ Отправка сообщения:', messageInput.value);
          messageInput.value = '';

          const errorEl = messageInput.parentElement?.querySelector<HTMLElement>('.error-message');
          if (errorEl) errorEl.textContent = '';
          messageInput.classList.remove('invalid');
        }
      } else {
        console.error('❌ Ошибка валидации сообщения');
      }
    });

    const chatItems = this._element?.querySelectorAll('.chat-item');
    chatItems?.forEach((item) => {
      item.addEventListener('click', () => {
        chatItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');

        const placeholder = this._element?.querySelector('.chat-placeholder');
        if (placeholder) {
          placeholder.innerHTML = `
            <div class="active-chat">
              <h3>Чат: ${item.querySelector('.chat-title')?.textContent}</h3>
              <div class="messages">
                <div class="message">Привет! Как дела?</div>
                <div class="message own">Привет! Всё хорошо, а у тебя?</div>
              </div>
            </div>
          `;
        }

        console.warn('Выбран чат:', item.querySelector('.chat-title')?.textContent);
      });
    });

    const profileBtn = this._element?.querySelector('.profile-btn');
    if (profileBtn) {
      profileBtn.addEventListener('click', () => {
        const app = (window as any).app;
        if (app && app.getRouter) {
          app.getRouter().go('/settings');
        } else {
          location.hash = 'profile';
        }
      });
    }
  }
}
