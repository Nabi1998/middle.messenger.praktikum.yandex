import Block from '../../services/Block';
import registrationTemplateRaw from './registrationPage.hbs?raw';
import { validateField } from '../../utils/validation';
import AuthService from '../../services/AuthService';
import { SignUpData } from '../../types/api';

const registrationTemplate = registrationTemplateRaw as unknown as string;

export class registrationPage extends Block {
  constructor() {
    super({
      events: {
        submit: (e: Event) => this.onSubmit(e),
        focusout: (e: Event) => this.onFocusOut(e),
        input: (e: Event) => this.onInput(e),
        click: (e: Event) => this.onClick(e),
      },
    });
  }

  protected render(): string {
    return registrationTemplate as unknown as string;
  }

  protected componentDidMount() {}

  private onFocusOut(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.tagName === 'INPUT') {
      const errorEl = input.parentElement?.querySelector<HTMLElement>('.error-message');
      validateField(input, errorEl);
    }
  }

  private onInput(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.tagName === 'INPUT') {
      const errorEl = input.parentElement?.querySelector<HTMLElement>('.error-message');
      if (input.value.trim() === '') {
        if (errorEl) errorEl.textContent = '';
        input.classList.remove('invalid');
      } else {
        validateField(input, errorEl);
      }
    }
  }

  private onClick(e: Event) {
    const target = e.target as HTMLElement;
    const link = target.closest('[data-route]');
    if (link) {
      e.preventDefault();
      const route = link.getAttribute('data-route');
      if (route) {
        const app = (window as any).app;
        app?.getRouter().go(route);
      }
    }
  }

  private async onSubmit(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;

    let isValid = true;
    form.querySelectorAll<HTMLInputElement>('input').forEach((input) => {
      const errorEl = input.parentElement?.querySelector<HTMLElement>('.error-message');
      if (!validateField(input, errorEl)) isValid = false;
    });

    if (!isValid || !this.passwordsMatch(form)) {
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
