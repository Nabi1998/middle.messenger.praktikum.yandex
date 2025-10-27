export { default as registrationPage } from './registrationPage.hbs?raw';

import { setupFormValidation } from '../../utils/validation';
import AuthService from '../../services/AuthService';
import { SignUpData } from '../../types/api';

export function initRegistrationPage(): void {
  const form = document.querySelector<HTMLFormElement>('.login-form');
  if (!form) return;

  // Настраиваем валидацию для всех полей
  const validateAll = setupFormValidation(form);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Проверяем валидацию и совпадение паролей
    if (!validateAll() || !passwordsMatch(form)) {
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
      // Показываем индикатор загрузки
      const submitButton = form.querySelector<HTMLButtonElement>('button[type="submit"]');
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Регистрация...';
      }

      await AuthService.signup(signUpData);

      // Перенаправляем на страницу чата после успешной регистрации
      const app = (window as unknown).app;
      if (app && app.getRouter) {
        app.getRouter().go('/messenger');
      }

    } catch (error) {
      console.error('❌ Ошибка регистрации:', error);

      const errorMessage = error instanceof Error ? error.message : 'Ошибка регистрации';

      // Показываем ошибку пользователю
      let errorElement = form.querySelector<HTMLElement>('.error-message');

      if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        form.insertBefore(errorElement, form.firstChild);
      }

      // Приводим к HTMLElement и устанавливаем стили
      const errorEl = errorElement as HTMLElement;
      errorEl.style.color = 'red';
      errorEl.style.marginBottom = '10px';

      // Устанавливаем текст ошибки
      if (errorMessage.includes('User already in system')) {
        errorEl.textContent = 'Пользователь с таким email или логином уже существует. Попробуйте другие данные или войдите в систему.';
      } else {
        errorEl.textContent = errorMessage;
      }

    } finally {
      // Восстанавливаем кнопку
      const submitButton = form.querySelector<HTMLButtonElement>('button[type="submit"]');
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Зарегистрироваться';
      }
    }
  });
}

function passwordsMatch(form: HTMLFormElement): boolean {
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
