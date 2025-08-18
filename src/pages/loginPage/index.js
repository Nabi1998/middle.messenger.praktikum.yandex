// экспорт шаблона
export { default as loginPage } from './loginPage.hbs?raw';

// подключаем валидацию
import { validateField } from '../../utils/validation';

export function initLoginPage() {
  const form = document.querySelector(".login-form");
  if (!form) return;

  // blur-событие на каждом input
  form.querySelectorAll("input").forEach(input => {
    const errorEl = input.parentElement.querySelector(".error-message");
    input.addEventListener("blur", () => validateField(input, errorEl));
  });

  // submit
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    let isValid = true;
    form.querySelectorAll("input").forEach(input => {
      const errorEl = input.parentElement.querySelector(".error-message");
      if (!validateField(input, errorEl)) isValid = false;
    });

    if (isValid) {
      const data = Object.fromEntries(new FormData(form));
      console.log("✅ Данные формы:", data);
      // здесь можно отправить данные на сервер fetch("/login", ...)
    } else {
      console.log("❌ Ошибка валидации");
    }
  });
}
