import HttpClient from '../../utils/httpClient';
import { validateField } from '../../utils/validation';

const api = new HttpClient('https://example.com/api');

export function initLoginPage(): void {
  const form = document.querySelector<HTMLFormElement>('.login-form');
  if (!form) return;

  form.querySelectorAll<HTMLInputElement>('input').forEach((input) => {
    input.addEventListener('blur', () => {
      const errorEl = input.parentElement?.querySelector<HTMLElement>('.error-message');
      validateField(input, errorEl);
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const emailInput = form.querySelector<HTMLInputElement>('input[name="email"]');
    const passwordInput = form.querySelector<HTMLInputElement>('input[name="password"]');

    const email = emailInput?.value ?? '';
    const password = passwordInput?.value ?? '';

    try {
      const response = await api.post('/login', { email, password });
      console.log('Успешный вход:', response);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('Ошибка:', message);
    }
  });
}
