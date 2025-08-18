import HttpClient from '../../utils/httpClient.js';
import { validateField } from '../../utils/validation.js';

const api = new HttpClient('https://example.com/api');

export function initLoginPage() {
  const form = document.querySelector(".login-form");
  if (!form) return;

  // навесим валидацию
  form.querySelectorAll("input").forEach(input => {
    input.addEventListener("blur", () => validateField(input));
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = form.querySelector('input[name="email"]').value;
    const password = form.querySelector('input[name="password"]').value;

    try {
      const response = await api.post('/login', { email, password });
      console.log("Успешный вход:", response);
    } catch (err) {
      console.error("Ошибка:", err.message);
    }
  });
}
