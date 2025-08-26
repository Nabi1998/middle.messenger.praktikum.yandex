export { default as chatPage } from './chatPage.hbs?raw';

import { setupFormValidation } from '../../utils/validation';

export function initChatPage(): void {
  const messageForm = document.querySelector<HTMLFormElement>('.message-form');
  if (messageForm) {
    const validateAll = setupFormValidation(messageForm);

    messageForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Проверяем валидацию
      if (validateAll()) {
        const messageInput = messageForm.querySelector<HTMLInputElement>('input[name="message"]');
        if (messageInput && messageInput.value.trim()) {
          console.warn('✅ Отправка сообщения:', messageInput.value);
          messageInput.value = '';
          // Очищаем ошибки после отправки
          const errorEl = messageInput.parentElement?.querySelector<HTMLElement>('.error-message');
          if (errorEl) errorEl.textContent = '';
          messageInput.classList.remove('invalid');
        }
      } else {
        console.error('❌ Ошибка валидации сообщения');
      }
    });
  }

  const chatItems = document.querySelectorAll('.chat-item');
  chatItems.forEach((item) => {
    item.addEventListener('click', () => {
      chatItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      const placeholder = document.querySelector('.chat-placeholder');

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

  const profileBtn = document.querySelector('.profile-btn');
  if (profileBtn) {
    profileBtn.addEventListener('click', () => {
      location.hash = 'profile';
    });
  }
}


