const validationRules = {
  first_name: {
    regex: /^[A-ZА-Я][a-zа-я-]*$/,
    message: "Первая буква заглавная, только буквы (латиница/кириллица), допустим дефис."
  },
  second_name: {
    regex: /^[A-ZА-Я][a-zа-я-]*$/,
    message: "Первая буква заглавная, только буквы (латиница/кириллица), допустим дефис."
  },
  login: {
    regex: /^(?=.*[a-zA-Z])[a-zA-Z0-9_-]{3,20}$/,
    message: "От 3 до 20 символов, латиница, цифры допустимы, но не только из цифр."
  },
  email: {
    regex: /^[a-zA-Z0-9._-]+@[a-zA-Z]+\.[a-zA-Z]+$/,
    message: "Неверный email (пример: user@mail.com)."
  },
  password: {
    regex: /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,40}$/,
    message: "От 8 до 40 символов, хотя бы одна заглавная и цифра."
  },
  phone: {
    regex: /^\+?\d{10,15}$/,
    message: "Телефон от 10 до 15 цифр, может начинаться с '+'."
  },
  message: {
    regex: /^(?!\s*$).+/,
    message: "Сообщение не должно быть пустым."
  }
};


export function validateField(input, errorEl) {
  const rule = validationRules[input.name];
  if (!rule) return true;

  if (!rule.regex.test(input.value)) {
    errorEl.textContent = rule.message;
    input.classList.add("invalid");
    return false;
  }

  errorEl.textContent = "";
  input.classList.remove("invalid");
  return true;
}