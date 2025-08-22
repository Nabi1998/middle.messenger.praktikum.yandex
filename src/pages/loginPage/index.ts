export { default as loginPage } from './loginPage.hbs?raw';

import { setupFormValidation } from '../../utils/validation.ts';
import { serializeForm } from '../../utils/form';

export function initLoginPage(): void {
  const form = document.querySelector<HTMLFormElement>('.login-form');
  if (!form) return;

  const validateAll = setupFormValidation(form);

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const isValid = validateAll();

    if (isValid) {
      const data = serializeForm(form);
      console.log('✅ Данные формы:', data);
    } else {
      console.log('❌ Ошибка валидации');
    }
  });
}


