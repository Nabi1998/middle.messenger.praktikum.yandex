import Block from '../../services/Block';
import profileTemplateRaw from './profilePage.hbs?raw';
import AuthService from '../../services/AuthService';
import AuthAPI from '../../services/AuthAPI';
import LogoutService from '../../services/LogoutService';

const profileTemplate = profileTemplateRaw as unknown as string;


const BASE_URL = 'https://ya-praktikum.tech/api/v2/resources/';


interface ProfileProps {
  first_name?: string;
  second_name?: string;
  display_name?: string;
  login?: string;
  email?: string;
  phone?: string;
  avatar?: string | null;
  [key: string]: unknown;
}

export class profilePage extends Block<ProfileProps> {
  constructor() {
    super({
      events: {
        click: (e: Event) => this.onClick(e),
      },
    });
  }

  protected render(): string {
    return profileTemplate;
  }

  protected async componentDidMount() {
    try {
      // Получаем данные пользователя с сервера
      const currentUser = await AuthService.getCurrentUser() || await AuthAPI.getUser();

      if (!currentUser) return;

      // Путь к аватару (относительный путь, как возвращает сервер)
      const avatarFullPath = currentUser.avatar ? BASE_URL + currentUser.avatar : null;

      // Обновляем props один раз
      this.setProps({
        first_name: currentUser.first_name ?? '',
        second_name: currentUser.second_name ?? '',
        display_name: currentUser.display_name ?? '',
        login: currentUser.login ?? '',
        email: currentUser.email ?? '',
        phone: currentUser.phone ?? '',
        avatar: avatarFullPath, // передаем путь с сервера
      });

      const avatarDiv = this._element?.querySelector<HTMLElement>('.profile-avatar');
      if (avatarDiv) {
        if (avatarFullPath) {
          avatarDiv.style.backgroundImage = `url("${avatarFullPath}")`;
          avatarDiv.style.backgroundSize = 'cover';
          avatarDiv.style.backgroundPosition = 'center';
          avatarDiv.style.borderRadius = '50%';
          avatarDiv.textContent = ''; // убираем плейсхолдер
        } else {
          avatarDiv.style.backgroundImage = '';
          avatarDiv.textContent = '🖼️'; // показываем плейсхолдер
        }
      }

    } catch (error) {
      console.error('Ошибка загрузки профиля:', error);
    }
  }

  protected componentDidUpdate(oldProps: ProfileProps, newProps: ProfileProps): boolean {
    console.warn('componentDidUpdate', oldProps, newProps);
    // Можно добавить логику, если нужно реагировать на изменение данных
    return true;
  }

  private onClick(e: Event) {
    const target = e.target as HTMLElement;

    // Кнопка выхода
    if (target.closest('.logout-button')) {
      LogoutService.logoutAndRedirect();
      return;
    }

    // Кнопка редактирования профиля
    const editBtn = target.closest('.action-link[data-route="/settings/edit"]');
    if (editBtn) {
      e.preventDefault();
      const app = (window as any).app;
      app?.getRouter().go('/settings/edit');
      return;
    }

    // Кнопка изменения пароля (если есть)
    const passwordBtn = target.closest('.action-link[data-route="/settings/password"]');
    if (passwordBtn) {
      e.preventDefault();
      const app = (window as any).app;
      app?.getRouter().go('/settings/password');
      return;
    }

    // Кнопка возврата к чату
    const messengerBtn = target.closest('.action-link[data-route="/messenger"]');
    if (messengerBtn) {
      e.preventDefault();
      const app = (window as any).app;
      app?.getRouter().go('/messenger');
      return;
    }
  }
}
