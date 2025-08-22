import View, { ViewProps } from '../services/View';
import { serializeForm } from '../utils/form';
import { setupFormValidation } from '../utils/validation';
import loginPageTemplate from './loginPage/loginPage.hbs?raw';

export interface LoginPageProps extends ViewProps {
  error?: string;
  isLoading?: boolean;
}

export default class LoginPage extends View {
  protected getData(): LoginPageProps {
    return {
      error: this.props.error,
      isLoading: this.props.isLoading
    };
  }

  protected template(): string {
    return loginPageTemplate;
  }

  protected afterRender(): void {
    this.setupFormValidation();
    this.setupEventListeners();
  }

  private setupFormValidation(): void {
    const form = this.getElement()?.querySelector<HTMLFormElement>('.login-form');
    if (!form) return;

    const validateAll = setupFormValidation(form);
    form.addEventListener('submit', this.handleSubmit.bind(this, validateAll));
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

  private handleSubmit(validateAll: () => boolean, e: Event): void {
    e.preventDefault();
    const form = e.target as HTMLFormElement;

    if (!validateAll()) {
      this.setProps({ error: 'Пожалуйста, исправьте ошибки в форме' });
      return;
    }

    const data = serializeForm(form);
    this.eventBus().emit('user:login', data);
  }
}
