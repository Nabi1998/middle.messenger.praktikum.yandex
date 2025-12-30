import Block from '../../services/Block';
import changeDataTemplateRaw from './changeData.hbs?raw';
import UserAPI from '../../services/UserAPI';
import { validateField } from '../../utils/validation';

const changeDataTemplate = changeDataTemplateRaw as unknown as string;

interface ChangeDataProps {
  errorMessage?: string;
  [key: string]: unknown;
}

export class changeDataPage extends Block<ChangeDataProps> {
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
    return changeDataTemplate;
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
    if (target.closest('.back-button')) {
      history.back();
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
      console.error('❌ Ошибка валидации смены пароля');
      return;
    }

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
      // ✅ Запрос на смену пароля
      await UserAPI.changePassword({
        oldPassword: String(data.oldPassword),
        newPassword: String(data.newPassword),
      });

      console.log('✅ Пароль успешно изменен');
      // ✅ После успешной смены пароля — редирект на профиль
      const app = (window as any).app;
      if (app?.getRouter) {
        app.getRouter().go('/settings');
      } else {
        location.hash = 'settings';
      }
    } catch (error) {
      console.error('Ошибка смены пароля:', error);
      this.setProps({
        errorMessage: (error as Error).message || 'Ошибка смены пароля',
      });
    }
  }

  private passwordsMatch(form: HTMLFormElement): boolean {
    const newPassword =
      form.querySelector<HTMLInputElement>('input[name="newPassword"]')?.value ?? '';
    const repeatPassword =
      form.querySelector<HTMLInputElement>('input[name="repeatPassword"]')?.value ?? '';
    const errorEl = form
      .querySelector<HTMLInputElement>('input[name="repeatPassword"]')
      ?.parentElement?.querySelector<HTMLElement>('.error-message');

    if (newPassword && repeatPassword && newPassword !== repeatPassword) {
      if (errorEl) errorEl.textContent = 'Пароли не совпадают';
      return false;
    }

    if (errorEl) errorEl.textContent = '';
    return true;
  }
}
