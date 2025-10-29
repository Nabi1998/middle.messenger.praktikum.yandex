import Block from '../../services/Block';
import loginTemplateRaw from './loginPage.hbs?raw';
import { setupFormValidation } from '../../utils/validation';
import AuthService from '../../services/AuthService';


const loginTemplate = loginTemplateRaw as unknown as string;

export class loginPage extends Block {
  constructor() {
    super({});
  }

  protected render(): string {
    return loginTemplate as unknown as string;
  }

  protected componentDidMount() {
    const form = this._element?.querySelector<HTMLFormElement>('.login-form');
    if (!form) return;

    // === Временная кнопка "Выйти" для теста ===
    const logoutBtn = document.createElement('button');
    logoutBtn.textContent = 'Выйти (тест)';
    logoutBtn.type = 'button';
    logoutBtn.style.marginBottom = '10px';
    form.insertBefore(logoutBtn, form.firstChild);

    logoutBtn.addEventListener('click', () => {
      console.log('Тестовый logout');
      document.cookie.split(';').forEach((c) => {
        document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
      });
      localStorage.clear();
      alert('Тестовый logout выполнен, теперь можно логиниться заново');
    });
    // =========================================

    // Настраиваем валидацию
    const validateAll = setupFormValidation(form);

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!validateAll()) {
        console.error('❌ Ошибка валидации');
        return;
      }

      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries()) as Record<string, FormDataEntryValue>;

      const loginData = {
        login: String(data.login),
        password: String(data.password),
      };

      try {
        const submitButton = form.querySelector<HTMLButtonElement>('button[type="submit"]');
        if (submitButton) {
          submitButton.disabled = true;
          submitButton.textContent = 'Вход...';
        }

        await AuthService.signin(loginData);

        console.warn('✅ Вход выполнен успешно');

        const app = (window as any).app;
        if (app && app.getRouter) {
          app.getRouter().go('/messenger');
        } else {
          location.hash = 'chat';
        }
      } catch (error) {
        console.error('❌ Ошибка входа:', error);
        const errorMessage = error instanceof Error ? error.message : 'Ошибка входа';

        let errorElement = form.querySelector<HTMLElement>('.error-message');
        if (!errorElement) {
          errorElement = document.createElement('div');
          errorElement.className = 'error-message';
          form.insertBefore(errorElement, form.firstChild);
        }

        const errorEl = errorElement as HTMLElement;
        errorEl.style.color = 'red';
        errorEl.style.marginBottom = '10px';

        if (errorMessage.includes('user not found')) {
          errorEl.textContent = 'Пользователь не найден. Проверьте логин и пароль.';
        } else if (errorMessage.includes('invalid password')) {
          errorEl.textContent = 'Неверный пароль. Попробуйте снова.';
        } else {
          errorEl.textContent = errorMessage;
        }
      } finally {
        const submitButton = form.querySelector<HTMLButtonElement>('button[type="submit"]');
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = 'Войти';
        }
      }
    });
  }
}
