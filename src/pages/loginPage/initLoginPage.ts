import { setupFormValidation } from '../../utils/validation';

export function initLoginPage(): void {
  const form = document.querySelector<HTMLFormElement>('.login-form');
  if (!form) return;

  // Настраиваем валидацию для всех полей
  const validateAll = setupFormValidation(form);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const loginInput = form.querySelector<HTMLInputElement>('input[name="login"]');
    const passwordInput = form.querySelector<HTMLInputElement>('input[name="password"]');

    const login = loginInput?.value ?? '';
    const password = passwordInput?.value ?? '';

    console.log('Попытка входа:', { login, password });
    
    // Проверяем валидацию
    if (validateAll()) {
      console.log('✅ Вход выполнен успешно');
      location.hash = 'chat';
    } else {
      console.log('❌ Ошибка валидации');
    }
  });
}
