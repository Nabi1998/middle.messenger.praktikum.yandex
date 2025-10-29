import Block from '../../services/Block';
import editProfileTemplateRaw from './editProfilePage.hbs?raw';
import { setupFormValidation } from '../../utils/validation';

const editProfileTemplate = editProfileTemplateRaw as unknown as string;

export class editProfilePage extends Block {
  constructor() {
    super({});
  }

  protected render(): string {
    return editProfileTemplate;
  }

  protected componentDidMount(): void {
    const form = this._element?.querySelector<HTMLFormElement>('.edit-profile-form');
    if (!form) return;

    const validateAll = setupFormValidation(form);

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());

      if (validateAll()) {
        console.warn('✅ Данные профиля:', data);
        // Здесь можно отправить данные на сервер
        const app = (window as any).app;
        if (app && app.getRouter) {
          app.getRouter().go('/profile');
        } else {
          location.hash = 'profile';
        }
      } else {
        console.error('❌ Ошибка валидации профиля');
      }
    });

    // === Работа с модальным окном аватара ===
    const avatarModal = this._element?.querySelector<HTMLElement>('#avatar-modal');
    const openAvatarBtn = this._element?.querySelector<HTMLElement>('#open-avatar-modal');
    const closeAvatarBtn = this._element?.querySelector<HTMLElement>('#close-avatar-modal');
    const fileInput = this._element?.querySelector<HTMLInputElement>('.edit-profile-avatar-input');

    if (openAvatarBtn && avatarModal) {
      openAvatarBtn.addEventListener('click', () => avatarModal.classList.remove('hidden'));
    }

    if (closeAvatarBtn && avatarModal) {
      closeAvatarBtn.addEventListener('click', () => avatarModal.classList.add('hidden'));
    }

    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement;
        if (target.files && target.files[0]) {
          console.warn('📸 Выбран файл аватара:', target.files[0].name);
          // Здесь можно добавить загрузку файла на сервер
        }
      });
    }

    // Закрытие модалки по клику вне неё
    if (avatarModal) {
      avatarModal.addEventListener('click', (e) => {
        if (e.target === avatarModal) avatarModal.classList.add('hidden');
      });
    }
  }
}
