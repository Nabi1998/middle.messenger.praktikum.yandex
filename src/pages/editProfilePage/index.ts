export { default as editProfilePage } from './editProfilePage.hbs?raw';

import { setupFormValidation } from '../../utils/validation.ts';
import { serializeForm } from '../../utils/form';

export function initEditProfilePage(): void {
  const form = document.querySelector<HTMLFormElement>('.edit-profile-form');
  if (!form) return;

  const validateAll = setupFormValidation(form);

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (validateAll()) {
      const data = serializeForm(form);
      console.log('✅ Данные формы:', data);
    } else {
      console.log('❌ Ошибка валидации');
    }
  });
}


