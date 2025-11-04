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
    return loginTemplate;
  }

  protected async componentDidMount() {
    const form = this._element?.querySelector<HTMLFormElement>('.login-form');
    if (!form) return;

    // Настраиваем валидацию
    const validateAll = setupFormValidation(form);

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!validateAll()) return;

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

        // 🔹 После успешного входа обновляем статус в Router и редиректим
        const app = (window as any).app;
        if (app && app.getRouter) {
          app.getRouter().setUserAuthenticated(true); // ✅ важный момент
          app.getRouter().go('/messenger');
        } else {
          location.hash = 'chat';
        }

      } catch (error) {
        console.error('Ошибка входа:', error);
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


