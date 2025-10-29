import Block from '../../services/Block';
import profileTemplateRaw from './profilePage.hbs?raw';
import AuthService from '../../services/AuthService';
import AuthAPI from '../../services/AuthAPI';

const profileTemplate = profileTemplateRaw as unknown as string;

interface ProfileProps {
  first_name?: string;
  second_name?: string;
  display_name?: string;
  login?: string;
  email?: string;
  phone?: string;
  avatar?: string | null;
}

export class profilePage extends Block<ProfileProps> {
  constructor() {
    super({});
  }

  protected render(): string {
    return profileTemplate;
  }

  protected async componentDidMount() {
    try {
      // Получаем данные пользователя с сервера
      const currentUser = await AuthService.getCurrentUser() || await AuthAPI.getUser();

      if (currentUser) {
        // Обновляем props один раз
        this.setProps({
          first_name: currentUser.first_name ?? '',
          second_name: currentUser.second_name ?? '',
          display_name: currentUser.display_name ?? '',
          login: currentUser.login ?? '',
          email: currentUser.email ?? '',
          phone: currentUser.phone ?? '',
          avatar: currentUser.avatar ?? null,
        });
      }

      // Навешиваем обработчики кнопок
      this.bindEvents();

    } catch (error) {
      console.error('Ошибка загрузки профиля:', error);
    }
  }

  protected componentDidUpdate(oldProps: ProfileProps, newProps: ProfileProps): boolean {
    console.log('componentDidUpdate', oldProps, newProps);
    // Можно добавить логику, если нужно реагировать на изменение данных
    return true;
  }

  private bindEvents() {
    // Кнопка выхода
    const logoutBtn = this._element?.querySelector<HTMLButtonElement>('.logout-button');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.handleLogout());
    }

    // Кнопка редактирования профиля
    const editBtn = this._element?.querySelector<HTMLAnchorElement>('.action-link[data-route="/settings/edit"]');
    if (editBtn) {
      editBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const app = (window as any).app;
        app?.getRouter().go('/settings/edit');
      });
    }

    // Кнопка изменения пароля (если есть)
    const passwordBtn = this._element?.querySelector<HTMLAnchorElement>('.action-link[data-route="/settings/password"]');
    if (passwordBtn) {
      passwordBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const app = (window as any).app;
        app?.getRouter().go('/settings/password');
      });
    }

    // Кнопка возврата к чату
    const messengerBtn = this._element?.querySelector<HTMLAnchorElement>('.action-link[data-route="/messenger"]');
    if (messengerBtn) {
      messengerBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const app = (window as any).app;
        app?.getRouter().go('/messenger');
      });
    }
  }

  private async handleLogout() {
    try {
      await AuthService.logout();
      const app = (window as any).app;
      app?.getRouter().go('/');
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    }
  }
}
