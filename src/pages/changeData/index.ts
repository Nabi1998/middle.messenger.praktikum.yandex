export { default as changeData } from './changeData.hbs?raw';

import { setupFormValidation } from '../../utils/validation';

export function initChangeDataPage(): void {
  const form = document.querySelector<HTMLFormElement>('.change-password-form');
  if (!form) return;

  // Настраиваем валидацию для всех полей
  const validateAll = setupFormValidation(form);

  // Обработка отправки формы
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Проверяем валидацию и совпадение паролей
    if (validateAll() && passwordsMatch(form)) {
      console.warn('✅ Пароль успешно изменен:', data);
      // Здесь можно отправить данные на сервер
      location.hash = 'profile';
    } else {
      console.error('❌ Ошибка валидации смены пароля');
    }
  });

  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target.textContent?.includes('Назад')) {
      history.back();
    }
  });
}

function passwordsMatch(form: HTMLFormElement): boolean {
  const newPassword = form.querySelector<HTMLInputElement>('input[name="newPassword"]')?.value ?? '';
  const repeatPassword = form.querySelector<HTMLInputElement>('input[name="repeatPassword"]')?.value ?? '';
  const errorEl = form.querySelector<HTMLInputElement>('input[name="repeatPassword"]')?.parentElement?.querySelector<HTMLElement>('.error-message');

  if (newPassword && repeatPassword && newPassword !== repeatPassword) {
    if (errorEl) errorEl.textContent = 'Пароли не совпадают';
    return false;
  }

  if (errorEl) errorEl.textContent = '';
  return true;
}
