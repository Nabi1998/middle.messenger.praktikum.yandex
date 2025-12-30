import Block from '../../services/Block';
import editProfileTemplateRaw from './editProfilePage.hbs?raw';
import { validateField } from '../../utils/validation';
import AuthService from '../../services/AuthService';
import AuthAPI from '../../services/AuthAPI';
import UserAPI from '../../services/UserAPI';
import { User } from '../../types/api';

const editProfileTemplate = editProfileTemplateRaw as unknown as string;

// Базовый URL сервера
const BASE_URL = 'https://ya-praktikum.tech/api/v2/resources/';

interface EditProfileProps {
  first_name?: string;
  second_name?: string;
  display_name?: string;
  login?: string;
  email?: string;
  phone?: string;
  avatar?: string | null;
  [key: string]: unknown;
}

export class editProfilePage extends Block<EditProfileProps> {
  constructor() {
    super({
      events: {
        submit: (e: Event) => this.onSubmit(e),
        click: (e: Event) => this.onClick(e),
        change: (e: Event) => this.onChange(e),
      },
    });
  }

  private setAvatar(avatarDiv: HTMLElement, avatarPath: string | null) {
    if (!avatarDiv) return;

    if (avatarPath) {
      avatarDiv.style.backgroundImage = `url(${avatarPath})`;
      avatarDiv.style.backgroundSize = 'cover';
      avatarDiv.style.backgroundPosition = 'center';
      avatarDiv.style.borderRadius = '50%';
      avatarDiv.textContent = '';
    } else {
      avatarDiv.style.backgroundImage = '';
      avatarDiv.textContent = '🖼️';
    }
  }

  protected render(): string {
    return editProfileTemplate;
  }

  protected async componentDidMount(): Promise<void> {
    try {
      // Получаем текущего пользователя
      const currentUser: User = await AuthService.getCurrentUser() || await AuthAPI.getUser();
      const avatarFullPath = currentUser.avatar ? BASE_URL + currentUser.avatar : null;

      if (currentUser) {
        this.setProps({
          email: currentUser.email ?? '',
          login: currentUser.login ?? '',
          first_name: currentUser.first_name ?? '',
          second_name: currentUser.second_name ?? '',
          display_name: currentUser.display_name ?? '',
          phone: currentUser.phone ?? '',
          avatar: avatarFullPath,
        });
      }

      const avatarPreview = this._element?.querySelector<HTMLElement>('.edit-profile-avatar');
      this.setAvatar(avatarPreview!, this.props.avatar ?? null);

    } catch (err) {
      console.error('❌ Ошибка загрузки данных пользователя:', err);
    }
  }

  protected componentDidUpdate(oldProps: EditProfileProps, newProps: EditProfileProps): boolean {
    if (oldProps.avatar !== newProps.avatar && this._element) {
      const avatarDiv = this._element.querySelector<HTMLElement>('.edit-profile-avatar');
      this.setAvatar(avatarDiv!, newProps.avatar ?? null);
    }
    return JSON.stringify(oldProps) !== JSON.stringify(newProps);
  }

  private async onSubmit(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;

    let isValid = true;
    form.querySelectorAll<HTMLInputElement>('input').forEach((input) => {
      const errorEl = input.parentElement?.querySelector<HTMLElement>('.error-message');
      if (!validateField(input, errorEl)) isValid = false;
    });

    if (!isValid) {
      console.error('❌ Ошибка валидации профиля');
      return;
    }

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries()) as Partial<User>;

    try {
      // Отправляем только необходимые поля
      const updatedUser = await UserAPI.changeProfile({
        first_name: data.first_name as string,
        second_name: data.second_name as string,
        display_name: data.display_name as string,
        login: data.login as string,
        email: data.email as string,
        phone: data.phone as string
      });

      const avatarPath = updatedUser.avatar ? BASE_URL + updatedUser.avatar : null;
      const avatarPreview = this._element?.querySelector<HTMLElement>('.edit-profile-avatar');

      // Передаём только поля, которые есть в EditProfileProps
      this.setProps({
        ...this.props,
        first_name: updatedUser.first_name,
        second_name: updatedUser.second_name,
        display_name: updatedUser.display_name,
        login: updatedUser.login,
        email: updatedUser.email,
        phone: updatedUser.phone,
        avatar: avatarPath
      });

      this.setAvatar(avatarPreview!, avatarPath);

      // Перенаправление через роутер
      const app = (window as any).app;
      if (app?.getRouter) {
        app.getRouter().go('/settings');
      } else {
        location.hash = 'settings';
      }
    } catch (err) {
      console.error('❌ Ошибка при сохранении профиля:', err);
    }
  }

  private onClick(e: Event) {
    const target = e.target as HTMLElement;
    const avatarModal = this._element?.querySelector<HTMLElement>('#avatar-modal');

    if (target.id === 'open-avatar-modal' && avatarModal) {
      avatarModal.classList.remove('hidden');
    } else if (target.id === 'close-avatar-modal' && avatarModal) {
      avatarModal.classList.add('hidden');
    } else if (target === avatarModal && avatarModal) {
      avatarModal.classList.add('hidden');
    } else if (target.closest('.back-button')) {
      history.back();
    }
  }

  private async onChange(e: Event) {
    const target = e.target as HTMLInputElement;
    if (target.classList.contains('edit-profile-avatar-input')) {
      e.preventDefault();
      if (!target.files?.length) return;

      const file = target.files[0];
      const avatarPreview = this._element?.querySelector<HTMLElement>('.edit-profile-avatar');
      const avatarModal = this._element?.querySelector<HTMLElement>('#avatar-modal');

      // Превью аватара
      const reader = new FileReader();
      reader.onload = () => this.setAvatar(avatarPreview!, reader.result as string);
      reader.readAsDataURL(file);

      // Отправка аватара на сервер
      const avatarFormData = new FormData();
      avatarFormData.append('avatar', file);

      try {
        const updatedUser = await UserAPI.changeAvatar(avatarFormData);
        const avatarPath = updatedUser.avatar ? BASE_URL + updatedUser.avatar : null;

        this.setProps({ ...this.props, avatar: avatarPath });
        this.setAvatar(avatarPreview!, avatarPath);

        const app = (window as any).app;
        if (app?.getRouter) {
          app.getRouter().go('/settings');
        } else {
          location.hash = 'settings';
        }

        if (avatarModal) avatarModal.classList.add('hidden');
      } catch (err) {
        console.error('❌ Ошибка при загрузке аватара:', err);
      }
    }
  }
}
