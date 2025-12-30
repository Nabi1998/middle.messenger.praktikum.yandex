import AuthService from '../services/AuthService';

export interface Route {
  path: string;
  component: () => void;
  isProtected?: boolean;
}

export default class Router {
  private routes: Route[] = [];
  private currentPath: string = '';
  private isUserAuthenticated: boolean = false;

  constructor() {}

  // 🔹 Старт маршрутизатора с проверкой авторизации
  public async start(): Promise<void> {
    // Проверяем авторизацию один раз
    this.isUserAuthenticated = await AuthService.checkAuth();

    // Обработка браузерной навигации
    window.addEventListener('popstate', () => {
      this.handleRoute(window.location.pathname);
    });

    // Обработка первой загрузки
    await this.handleRoute(window.location.pathname);
  }

  public use(path: string, component: () => void, isProtected: boolean = false): Router {
    this.routes.push({ path, component, isProtected });
    return this;
  }

  public go(path: string): void {
    if (this.currentPath === path) return;
    window.history.pushState({}, '', path);
    this.handleRoute(path);
  }

  public back(): void {
    window.history.back();
  }

  public forward(): void {
    window.history.forward();
  }

  // 🔹 Метод для обновления статуса авторизации
  public setUserAuthenticated(status: boolean) {
    this.isUserAuthenticated = status;
  }

  private async handleRoute(path: string): Promise<void> {
    this.currentPath = path;

    // Ошибочные страницы показываем всем
    if (['/404', '/500'].includes(path)) {
      const errorRoute = this.routes.find(r => r.path === path);
      if (errorRoute) errorRoute.component();
      return;
    }

    const route = this.routes.find(r => r.path === path);
    const isProtectedRoute = route?.isProtected || ['/messenger', '/settings', '/edit-profile', '/change-password'].includes(path);

    // Защищённая страница + не авторизован → редирект на /
    if (isProtectedRoute && !this.isUserAuthenticated) {
      window.history.replaceState({}, '', '/');
      this.currentPath = '/';
      const loginRoute = this.routes.find(r => r.path === '/');
      if (loginRoute) loginRoute.component();
      return;
    }

    // Если пользователь авторизован и зашёл на логин/регистрацию → редирект на /messenger
    if (this.isUserAuthenticated && (path === '/' || path === '/sign-up')) {
      window.history.replaceState({}, '', '/messenger');
      this.currentPath = '/messenger';
      const messengerRoute = this.routes.find(r => r.path === '/messenger');
      if (messengerRoute) messengerRoute.component();
      return;
    }

    // Рендер найденного маршрута
    if (route) {
      route.component();
    } else {
      const notFoundRoute = this.routes.find(r => r.path === '/404');
      if (notFoundRoute) {
        window.history.replaceState({}, '', '/404');
        this.currentPath = '/404';
        notFoundRoute.component();
      }
    }
  }

  public getCurrentPath(): string {
    return this.currentPath;
  }
}
