import Block from '../../services/Block';
import loginTemplateRaw from './loginPage.hbs?raw';
import { validateField } from '../../utils/validation';
import AuthService from '../../services/AuthService';

const loginTemplate = loginTemplateRaw as unknown as string;

export class loginPage extends Block {
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
    return loginTemplate;
  }

  protected async componentDidMount() {}

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

    // Validate all inputs
    let isValid = true;
    form.querySelectorAll<HTMLInputElement>('input').forEach((input) => {
      const errorEl = input.parentElement?.querySelector<HTMLElement>('.error-message');
      if (!validateField(input, errorEl)) isValid = false;
    });

    if (!isValid) return;

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
  }
}
