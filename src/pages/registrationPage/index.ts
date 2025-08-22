export { default as registrationPage } from './registrationPage.hbs?raw';

import { setupFormValidation } from '../../utils/validation';
import { serializeForm } from '../../utils/form';

export function initRegistrationPage(): void {
  const form = document.querySelector<HTMLFormElement>('.login-form');
  if (!form) return;

  const validateAll = setupFormValidation(form);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const isValid = validateAll() && passwordsMatch(form);
    if (isValid) {
      const data = serializeForm(form);
      console.log('✅ Данные формы (регистрация):', data);
    } else {
      console.log('❌ Ошибка валидации (регистрация)');
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


