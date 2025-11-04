// import AuthService from '../services/AuthService';
//
// export interface Route {
//   path: string;
//   component: () => void;
//   isProtected?: boolean;
// }
//
// export default class Router {
//   private routes: Route[] = [];
//   private currentPath: string = '';
//   private publicRoutes: string[] = ['/', '/sign-up', '/404', '/500'];
//
//   constructor() {
//     // Don't initialize immediately, wait for routes to be set up
//   }
//
//   public start(): void {
//     // Handle browser back/forward navigation
//     window.addEventListener('popstate', () => {
//       this.handleRoute(window.location.pathname);
//     });
//
//     // Handle initial page load
//     this.handleRoute(window.location.pathname);
//   }
//
//   public use(path: string, component: () => void, isProtected: boolean = false): Router {
//     this.routes.push({ path, component, isProtected });
//     return this;
//   }
//
//   public go(path: string): void {
//     if (this.currentPath === path) {
//       return;
//     }
//
//     // Update browser history
//     window.history.pushState({}, '', path);
//     this.handleRoute(path);
//   }
//
//   public back(): void {
//     window.history.back();
//   }
//
//   public forward(): void {
//     window.history.forward();
//   }
//
//   private async handleRoute(path: string): Promise<void> {
//     this.currentPath = path;
//
//     // Check if route requires authentication
//     const isPublicRoute = this.publicRoutes.includes(path);
//
//     if (!isPublicRoute) {
//       // Check authentication for protected routes
//       const isAuthenticated = await AuthService.checkAuth();
//
//       if (!isAuthenticated) {
//         // Redirect to login page if not authenticated
//         window.history.replaceState({}, '', '/');
//         this.currentPath = '/';
//         const loginRoute = this.routes.find(route => route.path === '/');
//         if (loginRoute) {
//           loginRoute.component();
//         }
//         return;
//       }
//     }
//
//     // Find matching route
//     const route = this.routes.find(route => route.path === path);
//
//     if (route) {
//       route.component();
//     } else {
//       // Handle 404 - find the 404 route or fallback to root
//       const notFoundRoute = this.routes.find(route => route.path === '/404');
//       if (notFoundRoute) {
//         window.history.replaceState({}, '', '/404');
//         this.currentPath = '/404';
//         notFoundRoute.component();
//       } else {
//         // Fallback to root route
//         const rootRoute = this.routes.find(route => route.path === '/');
//         if (rootRoute && path !== '/') {
//           window.history.replaceState({}, '', '/');
//           this.currentPath = '/';
//           rootRoute.component();
//         }
//       }
//     }
//   }
//
//   public getCurrentPath(): string {
//     return this.currentPath;
//   }
//
//   public async checkAuthAndRedirect(): Promise<void> {
//     const isAuthenticated = await AuthService.checkAuth();
//
//     if (isAuthenticated && (this.currentPath === '/' || this.currentPath === '/sign-up')) {
//       // If user is authenticated and on login/signup page, redirect to messenger
//       this.go('/messenger');
//     }
//   }
// }


// import AuthService from '../services/AuthService';
//
// export interface Route {
//   path: string;
//   component: () => void;
//   isProtected?: boolean;
// }
//
// export default class Router {
//   private routes: Route[] = [];
//   private currentPath: string = '';
//   private publicRoutes: string[] = ['/', '/sign-up', '/404', '/500'];
//
//   public start(): void {
//     window.addEventListener('popstate', () => {
//       this.handleRoute(window.location.pathname);
//     });
//
//     this.handleRoute(window.location.pathname);
//   }
//
//   public use(path: string, component: () => void, isProtected: boolean = false): Router {
//     this.routes.push({ path, component, isProtected });
//     return this;
//   }
//
//   public go(path: string): void {
//     if (this.currentPath === path) return;
//
//     window.history.pushState({}, '', path);
//     this.handleRoute(path);
//   }
//
//   public back(): void {
//     window.history.back();
//   }
//
//   public forward(): void {
//     window.history.forward();
//   }
//
//   private async handleRoute(path: string): Promise<void> {
//     this.currentPath = path;
//
//     const route = this.routes.find(route => route.path === path);
//
//     // ✅ Если это страница ошибок — просто отображаем без проверки
//     if (['/404', '/500'].includes(path)) {
//       if (route) route.component();
//       return;
//     }
//
//     // 🔒 Проверяем авторизацию только если страница защищена
//     const isPublicRoute = this.publicRoutes.includes(path);
//     const isProtectedRoute = route?.isProtected || ['/settings', '/messenger'].includes(path);
//
//     if (isProtectedRoute && !isPublicRoute) {
//       const isAuthenticated = await AuthService.checkAuth();
//
//       if (!isAuthenticated) {
//         // 🚫 Редиректим неавторизованных на / (страница входа)
//         window.history.replaceState({}, '', '/');
//         this.currentPath = '/';
//         const loginRoute = this.routes.find(r => r.path === '/');
//         if (loginRoute) loginRoute.component();
//         return;
//       }
//     }
//
//     // ✅ Если роут найден — рендерим компонент
//     if (route) {
//       route.component();
//     } else {
//       // ⚠️ Если роут не найден — 404
//       const notFoundRoute = this.routes.find(r => r.path === '/404');
//       if (notFoundRoute) {
//         window.history.replaceState({}, '', '/404');
//         this.currentPath = '/404';
//         notFoundRoute.component();
//       }
//     }
//   }
//
//   public getCurrentPath(): string {
//     return this.currentPath;
//   }
//
//   // 🔁 Проверка при загрузке: если уже авторизован — не показывать логин/регистрацию
//   public async checkAuthAndRedirect(): Promise<void> {
//     const isAuthenticated = await AuthService.checkAuth();
//
//     if (isAuthenticated && (this.currentPath === '/' || this.currentPath === '/sign-up')) {
//       this.go('/messenger');
//     }
//   }
// }


import AuthService from '../services/AuthService';

export interface Route {
  path: string;
  component: () => void;
  isProtected?: boolean;
}

export default class Router {
  private routes: Route[] = [];
  private currentPath: string = '';
  private publicRoutes: string[] = ['/', '/sign-up', '/404', '/500'];
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
