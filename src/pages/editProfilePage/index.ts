export { default as editProfilePage } from './editProfilePage.hbs?raw';

import { setupFormValidation } from '../../utils/validation';

export function initEditProfilePage(): void {
  const form = document.querySelector<HTMLFormElement>('.edit-profile-form');
  if (!form) return;

  // Настраиваем валидацию для всех полей
  const validateAll = setupFormValidation(form);

  // Обработка отправки формы
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Проверяем валидацию
    if (validateAll()) {
      console.log('✅ Данные профиля:', data);
      // Здесь можно отправить данные на сервер
      location.hash = 'profile';
    } else {
      console.log('❌ Ошибка валидации профиля');
    }
  });

  // Настройка модального окна для аватара
  const avatarModal = document.getElementById('avatar-modal');
  const openAvatarBtn = document.getElementById('open-avatar-modal');
  const closeAvatarBtn = document.getElementById('close-avatar-modal');
  const fileInput = document.querySelector<HTMLInputElement>('.edit-profile-avatar-input');

  if (openAvatarBtn && avatarModal) {
    openAvatarBtn.addEventListener('click', () => {
      avatarModal.classList.remove('hidden');
    });
  }

  if (closeAvatarBtn && avatarModal) {
    closeAvatarBtn.addEventListener('click', () => {
      avatarModal.classList.add('hidden');
    });
  }

  // Обработка загрузки файла
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        console.log('Выбран файл:', target.files[0].name);
        // Здесь можно загрузить файл на сервер
      }
    });
  }

  // Закрытие модального окна по клику вне его
  if (avatarModal) {
    avatarModal.addEventListener('click', (e) => {
      if (e.target === avatarModal) {
        avatarModal.classList.add('hidden');
      }
    });
  }
}


