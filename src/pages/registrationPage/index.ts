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
    const data = Object.fromEntries(formData.entries()) as any;

    const signUpData: SignUpData = {
      first_name: data.first_name,
      second_name: data.second_name,
      login: data.login,
      email: data.email,
      password: data.password,
      phone: data.phone
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
      const app = (window as any).app;
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
        (errorElement as HTMLElement).style.color = 'red';
        (errorElement as HTMLElement).style.marginBottom = '10px';
        form.insertBefore(errorElement, form.firstChild);
      }
      
      // Если ошибка связана с существующим пользователем, показываем более понятное сообщение
      if (errorMessage.includes('User already in system')) {
        errorElement.textContent = 'Пользователь с таким email или логином уже существует. Попробуйте другие данные или войдите в систему.';
      } else {
        errorElement.textContent = errorMessage;
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
