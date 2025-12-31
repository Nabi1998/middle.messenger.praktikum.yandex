import AuthService from './AuthService';

class LogoutService {
  static async logoutAndRedirect() {
    try {
      await AuthService.logout();

      const app = (window as any).app;
      const router = app?.getRouter();

      if (router) {
        router.setUserAuthenticated(false); // обновляем статус авторизации
        router.go('/'); // редирект на главную
      } else {
        window.location.pathname = '/'; // запасной вариант
      }
    } catch (error) {
      console.error('Ошибка при выходе:', error);
      window.location.pathname = '/';
    }
  }
}

export default LogoutService;
