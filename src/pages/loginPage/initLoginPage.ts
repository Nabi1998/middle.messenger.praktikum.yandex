// import { setupFormValidation } from '../../utils/validation';
// import AuthService from '../../services/AuthService';
//
// export function initLoginPage(): void {
//   const form = document.querySelector<HTMLFormElement>('.login-form');
//   if (!form) return;
//
//   // Настраиваем валидацию для всех полей
//   const validateAll = setupFormValidation(form);
//
//   form.addEventListener('submit', async (e) => {
//     e.preventDefault();
//
//     const loginInput = form.querySelector<HTMLInputElement>('input[name="login"]');
//     const passwordInput = form.querySelector<HTMLInputElement>('input[name="password"]');
//
//     const login = loginInput?.value ?? '';
//     const password = passwordInput?.value ?? '';
//
//     console.warn('Попытка входа:', { login, password });
//
//     // Проверяем валидацию
//     if (validateAll()) {
//       console.warn('✅ Вход выполнен успешно');
//       location.hash = 'chat';
//     } else {
//       console.error('❌ Ошибка валидации');
//     }
//   });
// }


import { setupFormValidation } from '../../utils/validation';
import AuthService from '../../services/AuthService';

export function initLoginPage(): void {
  const form = document.querySelector<HTMLFormElement>('.login-form');
  if (!form) return;


  // === Временная кнопка "Выйти" для теста ===
  const logoutBtn = document.createElement('button');
  logoutBtn.textContent = 'Выйти (тест)';
  logoutBtn.type = 'button';
  logoutBtn.style.marginBottom = '10px';
  form.insertBefore(logoutBtn, form.firstChild);

  logoutBtn.addEventListener('click', () => {
    console.log('Тестовый logout');

    // Очистка cookie (если есть сессия)
    document.cookie.split(';').forEach((c) => {
      document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
    });
    localStorage.clear();
    alert('Тестовый logout выполнен, теперь можно логиниться заново');
  });
  // =========================================

  // Настраиваем валидацию для всех полей
  const validateAll = setupFormValidation(form);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Проверяем валидацию
    if (!validateAll()) {
      console.error('❌ Ошибка валидации');
      return;
    }

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries()) as Record<string, FormDataEntryValue>;

    const loginData = {
      login: String(data.login),
      password: String(data.password),
    };

    try {
      // Показываем индикатор загрузки
      const submitButton = form.querySelector<HTMLButtonElement>('button[type="submit"]');
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Вход...';
      }

      // Отправляем запрос на авторизацию
      await AuthService.signin(loginData);

      console.warn('✅ Вход выполнен успешно');

      // Перенаправляем в чат после успешного входа
      const app = (window as unknown).app;
      if (app && app.getRouter) {
        app.getRouter().go('/messenger');
      } else {
        location.hash = 'chat';
      }

    } catch (error) {
      console.error('❌ Ошибка входа:', error);

      const errorMessage = error instanceof Error ? error.message : 'Ошибка входа';

      // Показываем ошибку пользователю
      let errorElement = form.querySelector<HTMLElement>('.error-message');
      if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        form.insertBefore(errorElement, form.firstChild);
      }

      const errorEl = errorElement as HTMLElement;
      errorEl.style.color = 'red';
      errorEl.style.marginBottom = '10px';

      // Устанавливаем текст ошибки
      if (errorMessage.includes('user not found')) {
        errorEl.textContent = 'Пользователь не найден. Проверьте логин и пароль.';
      } else if (errorMessage.includes('invalid password')) {
        errorEl.textContent = 'Неверный пароль. Попробуйте снова.';
      } else {
        errorEl.textContent = errorMessage;
      }

    } finally {
      // Восстанавливаем кнопку
      const submitButton = form.querySelector<HTMLButtonElement>('button[type="submit"]');
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Войти';
      }
    }
  });
}





