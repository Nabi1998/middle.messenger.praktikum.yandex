// export { default as registrationPage } from './registrationPage.hbs?raw';
//
// import { setupFormValidation } from '../../utils/validation';
// import AuthService from '../../services/AuthService';
// import { SignUpData } from '../../types/api';
//
// export function initRegistrationPage(): void {
//   // Logic moved to registrationPage.ts component
// }
//
// function passwordsMatch(form: HTMLFormElement): boolean {
//   const pwd = form.querySelector<HTMLInputElement>('input[name="password"]')?.value ?? '';
//   const pwd2 = form.querySelector<HTMLInputElement>('input[name="password_repeat"]')?.value ?? '';
//   const errorEl = form.querySelector<HTMLInputElement>('input[name="password_repeat"]')?.parentElement?.querySelector<HTMLElement>('.error-message');
//
//   if (pwd && pwd2 && pwd !== pwd2) {
//     if (errorEl) errorEl.textContent = 'Пароли не совпадают';
//     return false;
//   }
//
//   if (errorEl) errorEl.textContent = '';
//   return true;
// }
