export { default as registrationPage } from './registrationPage.hbs?raw';

import { setupFormValidation } from '../../utils/validation';

export function initRegistrationPage(): void {
  const form = document.querySelector<HTMLFormElement>('.login-form');
  if (!form) return;

  // Настраиваем валидацию для всех полей
  const validateAll = setupFormValidation(form);

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    console.warn('Данные формы (регистрация):', data);

    // Проверяем валидацию и совпадение паролей
    if (validateAll() && passwordsMatch(form)) {
      console.warn('✅ Регистрация успешна');
      location.hash = 'chat';
    } else {
      console.error('❌ Ошибка валидации');
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


