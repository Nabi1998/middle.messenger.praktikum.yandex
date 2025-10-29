import Block from '../../services/Block';
import registrationTemplateRaw from './registrationPage.hbs?raw';
import { setupFormValidation } from '../../utils/validation';
import AuthService from '../../services/AuthService';
import { SignUpData } from '../../types/api';

const registrationTemplate = registrationTemplateRaw as unknown as string;

export class registrationPage extends Block {
  constructor() {
    super({});
  }

  protected render(): string {
    return registrationTemplate as unknown as string;
  }

  protected componentDidMount() {
    const form = this._element?.querySelector<HTMLFormElement>('.login-form');
    if (!form) return;

    // Настраиваем валидацию
    const validateAll = setupFormValidation(form);

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!validateAll() || !this.passwordsMatch(form)) {
        console.error('❌ Ошибка валидации');
        return;
      }

      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries()) as Record<string, FormDataEntryValue>;

      const signUpData: SignUpData = {
        first_name: String(data.first_name),
        second_name: String(data.second_name),
        login: String(data.login),
        email: String(data.email),
        password: String(data.password),
        phone: String(data.phone),
      };

      try {
        const submitButton = form.querySelector<HTMLButtonElement>('button[type="submit"]');
        if (submitButton) {
          submitButton.disabled = true;
          submitButton.textContent = 'Регистрация...';
        }

        await AuthService.signup(signUpData);

        console.warn('✅ Регистрация выполнена успешно');

        const app = (window as any).app;
        if (app && app.getRouter) {
          app.getRouter().go('/messenger');
        } else {
          location.hash = 'chat';
        }
      } catch (error) {
        console.error('❌ Ошибка регистрации:', error);
        const errorMessage = error instanceof Error ? error.message : 'Ошибка регистрации';

        let errorElement = form.querySelector<HTMLElement>('.error-message');
        if (!errorElement) {
          errorElement = document.createElement('div');
          errorElement.className = 'error-message';
          form.insertBefore(errorElement, form.firstChild);
        }

        const errorEl = errorElement as HTMLElement;
        errorEl.style.color = 'red';
        errorEl.style.marginBottom = '10px';

        if (errorMessage.includes('User already in system')) {
          errorEl.textContent = 'Пользователь с таким логином или email уже существует. Попробуйте войти.';
        } else {
          errorEl.textContent = errorMessage;
        }
      } finally {
        const submitButton = form.querySelector<HTMLButtonElement>('button[type="submit"]');
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = 'Зарегистрироваться';
        }
      }
    });
  }

  private passwordsMatch(form: HTMLFormElement): boolean {
    const pwd = form.querySelector<HTMLInputElement>('input[name="password"]')?.value ?? '';
    const pwd2 = form.querySelector<HTMLInputElement>('input[name="password_repeat"]')?.value ?? '';
    const errorEl = form.querySelector<HTMLInputElement>('input[name="password_repeat"]')?.parentElement?.querySelector<HTMLElement>('.error-message');

    if (pwd && pwd2 && pwd !== pwd2) {
      if (errorEl) errorEl.textContent = 'Пароли не совпадают';
      return false;
    }

    if (errorEl) errorEl.textContent = '';
    return true;
  }
}
