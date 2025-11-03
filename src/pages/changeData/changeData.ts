import Block from '../../services/Block';
import changeDataTemplateRaw from './changeData.hbs?raw';
import UserAPI from '../../services/UserAPI';
import { setupFormValidation } from '../../utils/validation'; // ✅ добавлен правильный импорт

const changeDataTemplate = changeDataTemplateRaw as unknown as string;

interface ChangeDataProps {
  errorMessage?: string;
  [key: string]: unknown;
}

export class changeDataPage extends Block<ChangeDataProps> {
  constructor() {
    super({});
  }

  protected render(): string {
    return changeDataTemplate;
  }

  protected componentDidMount() {
    const form = this._element?.querySelector<HTMLFormElement>('.change-password-form');
    if (!form) return;

    // ✅ Используем импорт напрямую, а не window
    const validateAll = setupFormValidation(form);

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!validateAll() || !this.passwordsMatch(form)) {
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
    });

    // Кнопка "Назад"
    const backBtn = this._element?.querySelector<HTMLElement>('.back-button');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        history.back();
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
