type ValidationRule = {
  regex: RegExp;
  message: string;
};

type ValidationRules = Record<string, ValidationRule>;

const validationRules: ValidationRules = {
  first_name: {
    regex: /^[A-ZА-Я][a-zа-я-]*$/,
    message: 'Первая буква заглавная, только буквы (латиница/кириллица), допустим дефис.',
  },
  second_name: {
    regex: /^[A-ZА-Я][a-zа-я-]*$/,
    message: 'Первая буква заглавная, только буквы (латиница/кириллица), допустим дефис.',
  },
  login: {
    regex: /^(?=.*[a-zA-Z])[a-zA-Z0-9_-]{3,20}$/,
    message: 'От 3 до 20 символов, латиница, цифры допустимы, но не только из цифр.',
  },
  email: {
    regex: /^[a-zA-Z0-9._-]+@[a-zA-Z]+\.[a-zA-Z]+$/,
    message: 'Неверный email (пример: user@mail.com).',
  },
  password: {
    regex: /^(?=.*[A-Z])(?=.*\d).{8,40}$/,
    message: 'От 8 до 40 символов, хотя бы одна заглавная и цифра.',
  },
  password_repeat: {
    regex: /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,40}$/,
    message: 'От 8 до 40 символов, хотя бы одна заглавная и цифра.',
  },
  phone: {
    regex: /^\+?\d{10,15}$/,
    message: "Телефон от 10 до 15 цифр, может начинаться с '+'.",
  },
  message: {
    regex: /^(?!\s*$).+/,
    message: 'Сообщение не должно быть пустым.',
  },
  // Добавляем недостающие правила
  oldPassword: {
    regex: /^(?=.*[A-Z])(?=.*\d).{8,40}$/,
    message: 'От 8 до 40 символов, хотя бы одна заглавная и цифра.',
  },
  newPassword: {
    regex: /^(?=.*[A-Z])(?=.*\d).{8,40}$/,
    message: 'От 8 до 40 символов, хотя бы одна заглавная и цифра.',
  },
  repeatPassword: {
    regex: /^(?=.*[A-Z])(?=.*\d).{8,40}$/,
    message: 'От 8 до 40 символов, хотя бы одна заглавная и цифра.',
  },
  display_name: {
    regex: /^[A-ZА-Я][a-zа-я-]*$/,
    message: 'Первая буква заглавная, только буквы (латиница/кириллица), допустим дефис.',
  },
};

export function validateField(input: HTMLInputElement, errorEl?: HTMLElement | null): boolean {
  const rule = validationRules[input.name];
  if (!rule) return true;

  if (!rule.regex.test(input.value)) {
    if (errorEl) errorEl.textContent = rule.message;
    input.classList.add('invalid');
    return false;
  }

  if (errorEl) errorEl.textContent = '';
  input.classList.remove('invalid');
  return true;
}

export function setupFormValidation(form: HTMLFormElement): () => boolean {
  // This function attaches listeners directly, which might be deprecated if we move to Block events.
  // However, for now, we keep it but ensure it's not used where Block events are preferred.
  // Or we can modify it to not attach listeners but just return the validation function.

  // Since we are moving to Block events, we should probably avoid using this function to attach listeners
  // inside components. Instead, components should attach listeners via events prop and call validateField.

  // But for backward compatibility or if used outside components, we keep it.
  // The user asked to use addEventListener via Block mechanism.
  // So inside components, we should NOT call setupFormValidation that attaches listeners.
  // We should manually attach listeners in the component or use the events prop.

  // I already updated components to use events prop and call validateField directly.
  // So this function is likely not used in the updated components anymore, or only for initial validation check.

  /*
  form.querySelectorAll<HTMLInputElement>('input').forEach((input) => {
    const errorEl = input.parentElement?.querySelector<HTMLElement>('.error-message');

    // Валидация при потере фокуса
    input.addEventListener('blur', () => validateField(input, errorEl));

    // Валидация при вводе (в реальном времени)
    input.addEventListener('input', () => {
      if (input.value.trim() === '') {
        if (errorEl) errorEl.textContent = '';
        input.classList.remove('invalid');
      } else {
        validateField(input, errorEl);
      }
    });
  });
  */

  return () => {
    let isValid = true;
    form.querySelectorAll<HTMLInputElement>('input').forEach((input) => {
      const errorEl = input.parentElement?.querySelector<HTMLElement>('.error-message');
      if (!validateField(input, errorEl)) isValid = false;
    });
    return isValid;
  };
}
