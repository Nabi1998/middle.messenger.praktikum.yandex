export { default as changeData } from './changeData.hbs?raw';

import { setupFormValidation } from '../../utils/validation';

export function initChangeDataPage(): void {
  // Logic moved to changeData.ts component
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
