import { setupFormValidation } from '../../utils/validation';
import { serializeForm } from '../../utils/form';

export { default as changeData } from './changeData.hbs?raw';

export function initChangeDataPage(): void {
  const form = document.querySelector<HTMLFormElement>('.change-password-form');
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


