import View, { ViewProps } from '../services/View';
import { serializeForm } from '../utils/form';
import { setupFormValidation } from '../utils/validation';
import registrationPageTemplate from './registrationPage/registrationPage.hbs?raw';

export interface RegistrationPageProps extends ViewProps {
  error?: string;
  isLoading?: boolean;
}

export default class RegistrationPage extends View {
  protected getData(): RegistrationPageProps {
    return {
      error: this.props.error,
      isLoading: this.props.isLoading
    };
  }

  protected template(): string {
    return registrationPageTemplate;
  }

  protected afterRender(): void {
    this.setupFormValidation();
    this.setupEventListeners();
  }

  private setupFormValidation(): void {
    const form = this.getElement()?.querySelector<HTMLFormElement>('.login-form');
    if (!form) return;

    const validateAll = setupFormValidation(form);
    form.addEventListener('submit', this.handleSubmit.bind(this, validateAll, form));
  }

  private setupEventListeners(): void {
    const footerLink = this.getElement()?.querySelector<HTMLAnchorElement>('.footer-link');
    if (footerLink) {
      footerLink.addEventListener('click', (e) => {
        e.preventDefault();
        const page = footerLink.dataset.page;
        if (page) {
          this.eventBus().emit('page:change', page);
        }
      });
    }
  }

  private handleSubmit(validateAll: () => boolean, form: HTMLFormElement, e: Event): void {
    e.preventDefault();

    const isValid = validateAll() && this.passwordsMatch(form);
    if (!isValid) {
      this.setProps({ error: 'Пожалуйста, исправьте ошибки в форме' });
      return;
    }

    const data = serializeForm(form);
    this.eventBus().emit('user:register', data);
  }

  private passwordsMatch(form: HTMLFormElement): boolean {
    const pwd = form.querySelector<HTMLInputElement>('input[name="password"]')?.value ?? '';
    const pwd2 = form.querySelector<HTMLInputElement>('input[name="password_repeat"]')?.value ?? '';
    
    if (pwd && pwd2 && pwd !== pwd2) {
      const errorEl = form.querySelector<HTMLInputElement>('input[name="password_repeat"]')?.parentElement?.querySelector<HTMLElement>('.error-message');
      if (errorEl) errorEl.textContent = 'Пароли не совпадают';
      return false;
    }
    
    return true;
  }
}
