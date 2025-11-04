// import Router from './utils/Router';
// import AuthService from './services/AuthService';
// import Block from './services/Block';
// import Handlebars from 'handlebars';
//
//
// import Button from './components/Button/Button';
// import Input from './components/Input/Input';
// import Footer from './components/Footer';
// import Link from './components/Link';
//
// Handlebars.registerPartial('Button', Button);
// Handlebars.registerPartial('Input', Input);
// Handlebars.registerPartial('Footer', Footer);
// Handlebars.registerPartial('Link', Link);
//
// // Импортируем страницы как классы-наследники Block
// import { loginPage } from './pages/loginPage/loginPage';
// import { registrationPage } from './pages/registrationPage/registrationPage';
// import { chatPage } from './pages/chatPage/chatPage';
// import { profilePage } from './pages/profilePage/profilePage';
// import { editProfilePage } from './pages/editProfilePage/editProfilePage';
// import { changeDataPage } from './pages/changeData/changeData';
// import { errorPage } from './pages/errorPage/index';
// import { errorPageTwo } from './pages/errorPage/index';
//
// export default class App {
//   private appElement: HTMLElement | null;
//   private router: Router;
//   private currentPage: Block | null = null;
//
//   constructor() {
//     this.appElement = document.getElementById('app');
//     this.router = new Router();
//     this.setupRoutes();
//     this.setupGlobalNavigation();
//     this.initAuth();
//   }
//
//   private async initAuth(): Promise<void> {
//     const isAuthenticated = await AuthService.checkAuth();
//
//     const currentPath = window.location.pathname;
//     const protectedRoutes = ['/messenger', '/settings', '/edit-profile', '/change-password'];
//
//     if (!isAuthenticated && protectedRoutes.includes(currentPath)) {
//       this.router.go('/');
//     }
//   }
//
//   private setupRoutes(): void {
//     this.router
//       .use('/', () => this.renderPage('loginPage'))
//       .use('/sign-up', () => this.renderPage('registrationPage'))
//       .use('/messenger', () => this.renderProtectedPage('chatPage'))
//       .use('/settings', () => this.renderProtectedPage('profilePage'))
//       .use('/edit-profile', () => this.renderProtectedPage('editProfilePage'))
//       .use('/change-password', () => this.renderProtectedPage('changeData'))
//       .use('/404', () => this.renderPage('errorPage'))
//       .use('/500', () => this.renderPage('errorPageTwo'));
//
//     this.router.start();
//   }
//
//   private renderProtectedPage(pageName: string): void {
//     if (!AuthService.getIsAuthenticated()) {
//       this.router.go('/');
//       return;
//     }
//     this.renderPage(pageName);
//   }
//
//   private renderPage(pageName: string): void {
//     if (!this.appElement) return;
//
//     // Скрываем или удаляем предыдущую страницу
//     if (this.currentPage) {
//       this.currentPage.hide();
//     }
//
//     let page: Block;
//
//     switch (pageName) {
//       case 'loginPage':
//         page = new loginPage();
//         break;
//       case 'registrationPage':
//         page = new registrationPage();
//         break;
//       case 'chatPage':
//         page = new chatPage();
//         break;
//       case 'profilePage':
//         page = new profilePage();
//         break;
//       case 'editProfilePage':
//         page = new editProfilePage();
//         break;
//       case 'changeData':
//         page = new changeDataPage();
//         break;
//       case 'errorPage':
//         page = new errorPage({ errorCode: '404', errorText: 'Не туда попали' });
//         break;
//       case 'errorPageTwo':
//         page = new errorPageTwo({ errorCode: '500', errorText: 'Мы уже фиксим' });
//         break;
//       default:
//         page = new loginPage();
//     }
//
//     // Очищаем контейнер и вставляем страницу
//     this.appElement.innerHTML = '';
//     this.appElement.appendChild(page.getContent());
//
//     // Вызываем componentDidMount и все события страницы
//     page.dispatchComponentDidMount();
//
//     this.currentPage = page;
//   }
//
//   private setupGlobalNavigation(): void {
//     document.addEventListener('click', (e) => {
//       const target = e.target as HTMLElement;
//
//       if (target.matches('[data-route]')) {
//         e.preventDefault();
//         const route = target.getAttribute('data-route');
//         if (route) this.router.go(route);
//         return;
//       }
//
//       if (target.matches('.back-button') ||
//         (target.matches('button, a') && target.textContent?.includes('Назад'))) {
//         e.preventDefault();
//         this.router.back();
//         return;
//       }
//
//       if (target.matches('.logout-button') ||
//         (target.matches('button, a') && target.textContent?.includes('Выйти'))) {
//         e.preventDefault();
//         this.handleLogout();
//         return;
//       }
//
//       if (target.matches('button[data-route]')) {
//         e.preventDefault();
//         const route = target.getAttribute('data-route');
//         if (route) this.router.go(route);
//         return;
//       }
//     });
//   }
//
//   private async handleLogout(): Promise<void> {
//     try {
//       await AuthService.logout();
//       this.router.go('/');
//     } catch (error) {
//       console.error('Ошибка при выходе:', error);
//       this.router.go('/');
//     }
//   }
//
//   public getRouter(): Router {
//     return this.router;
//   }
// }


import { Routes } from './routes';
import Router from './utils/Router';
import AuthService from './services/AuthService';
import Block from './services/Block';
import Handlebars from 'handlebars';

import Button from './components/Button/Button';
import Input from './components/Input/Input';
import Footer from './components/Footer';
import Link from './components/Link';

Handlebars.registerPartial('Button', Button);
Handlebars.registerPartial('Input', Input);
Handlebars.registerPartial('Footer', Footer);
Handlebars.registerPartial('Link', Link);

// Импортируем страницы как классы-наследники Block
import { loginPage } from './pages/loginPage/loginPage';
import { registrationPage } from './pages/registrationPage/registrationPage';
import { chatPage } from './pages/chatPage/chatPage';
import { profilePage } from './pages/profilePage/profilePage';
import { editProfilePage } from './pages/editProfilePage/editProfilePage';
import { changeDataPage } from './pages/changeData/changeData';
import { errorPage } from './pages/errorPage/index';
import { errorPageTwo } from './pages/errorPage/index';

export default class App {
  private appElement: HTMLElement | null;
  private router: Router;
  private currentPage: Block | null = null;

  constructor() {
    this.appElement = document.getElementById('app');
    this.router = new Router();
    this.setupRoutes();
    this.setupGlobalNavigation();
    this.startApp();
  }

  // 🔹 Запуск приложения с проверкой авторизации
  private async startApp(): Promise<void> {
    // 1️⃣ Проверяем авторизацию один раз
    await AuthService.checkAuth();

    // 2️⃣ Стартуем маршрутизатор
    await this.router.start();
  }

  private setupRoutes(): void {
    this.router
      .use(Routes.SignIn, () => this.renderPage('loginPage'))
      .use(Routes.SignUp, () => this.renderPage('registrationPage'))
      .use(Routes.Messenger, () => this.renderPage('chatPage'), true)
      .use(Routes.Settings, () => this.renderPage('profilePage'), true)
      .use(Routes.EditProfile, () => this.renderPage('editProfilePage'), true)
      .use(Routes.ChangePassword, () => this.renderPage('changeData'), true)
      .use(Routes.Error404, () => this.renderPage('errorPage'))
      .use(Routes.Error500, () => this.renderPage('errorPageTwo'));
  }

  private renderPage(pageName: string): void {
    if (!this.appElement) return;

    if (this.currentPage) {
      this.currentPage.hide();
    }

    let page: Block;

    switch (pageName) {
      case 'loginPage':
        page = new loginPage();
        break;
      case 'registrationPage':
        page = new registrationPage();
        break;
      case 'chatPage':
        page = new chatPage();
        break;
      case 'profilePage':
        page = new profilePage();
        break;
      case 'editProfilePage':
        page = new editProfilePage();
        break;
      case 'changeData':
        page = new changeDataPage();
        break;
      case 'errorPage':
        page = new errorPage({ errorCode: '404', errorText: 'Не туда попали' });
        break;
      case 'errorPageTwo':
        page = new errorPageTwo({ errorCode: '500', errorText: 'Мы уже фиксим' });
        break;
      default:
        page = new loginPage();
    }

    this.appElement.innerHTML = '';
    this.appElement.appendChild(page.getContent());

    page.dispatchComponentDidMount();
    this.currentPage = page;
  }

  private setupGlobalNavigation(): void {
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;

      const route = target.getAttribute?.('data-route');
      if (route) {
        e.preventDefault();
        this.router.go(route);
        return;
      }

      if (target.matches('.back-button') || (target.matches('button, a') && target.textContent?.includes('Назад'))) {
        e.preventDefault();
        this.router.back();
        return;
      }

      if (target.matches('.logout-button') || (target.matches('button, a') && target.textContent?.includes('Выйти'))) {
        e.preventDefault();
        this.handleLogout();
        return;
      }
    });
  }

  private async handleLogout(): Promise<void> {
    try {
      await AuthService.logout();
      this.router.go('/');
    } catch (error) {
      console.error('Ошибка при выходе:', error);
      this.router.go('/');
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}
