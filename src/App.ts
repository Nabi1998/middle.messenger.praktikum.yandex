import Handlebars from 'handlebars';
import './helpers/handlebarsHelpers';
import Router from './utils/Router';
import AuthService from './services/AuthService';

import Button from './components/Button/Button';
import Input from './components/Input/Input';
import Footer from './components/Footer';
import Link from './components/Link';

Handlebars.registerPartial('Button', Button);
Handlebars.registerPartial('Input', Input);
Handlebars.registerPartial('Footer', Footer);
Handlebars.registerPartial('Link', Link);

// Импортируем страницы
import loginPage from './pages/loginPage/loginPage.hbs?raw';
import registrationPage from './pages/registrationPage/registrationPage.hbs?raw';
import chatPage from './pages/chatPage/chatPage.hbs?raw';
import profilePage from './pages/profilePage/profilePage.hbs?raw';
import editProfilePage from './pages/editProfilePage/editProfilePage.hbs?raw';
import changeData from './pages/changeData/changeData.hbs?raw';
import errorPage from './pages/errorPage/errorPage.hbs?raw';
import errorPageTwo from './pages/errorPage/errorPageTwo.hbs?raw';

// Импортируем функции инициализации
import { initLoginPage } from './pages/loginPage/initLoginPage';
import { initRegistrationPage } from './pages/registrationPage/index';
import { initChatPage } from './pages/chatPage/index';
import { initEditProfilePage } from './pages/editProfilePage/index';
import { initChangeDataPage } from './pages/changeData/index';

export default class App {
  private appElement: HTMLElement | null;
  private router: Router;

  constructor() {
    this.appElement = document.getElementById('app');
    this.router = new Router();
    this.setupRoutes();
    this.setupGlobalNavigation();
    this.initAuth();
  }

  private async initAuth(): Promise<void> {
    // Проверяем аутентификацию при запуске приложения
    const isAuthenticated = await AuthService.checkAuth();
    
    // Если пользователь не аутентифицирован и находится на защищенной странице
    const currentPath = window.location.pathname;
    const protectedRoutes = ['/messenger', '/settings', '/settings/edit', '/settings/password'];
    
    if (!isAuthenticated && protectedRoutes.includes(currentPath)) {
      this.router.go('/');
    }
  }

  private setupRoutes(): void {
    this.router
      .use('/', () => this.renderPage('loginPage'))
      .use('/sign-up', () => this.renderPage('registrationPage'))
      .use('/messenger', () => this.renderProtectedPage('chatPage'))
      .use('/settings', () => this.renderProtectedPage('profilePage'))
      .use('/settings/edit', () => this.renderProtectedPage('editProfilePage'))
      .use('/settings/password', () => this.renderProtectedPage('changeData'))
      .use('/404', () => this.renderPage('errorPage'))
      .use('/500', () => this.renderPage('errorPageTwo'));
    
    // Start the router after routes are configured
    this.router.start();
  }

  private renderProtectedPage(pageName: string): void {
    // Проверяем аутентификацию для защищенных страниц
    if (!AuthService.getIsAuthenticated()) {
      this.router.go('/');
      return;
    }
    this.renderPage(pageName);
  }

  private renderPage(pageName: string): void {
    if (!this.appElement) return;

    // Очищаем DOM перед рендерингом новой страницы
    this.appElement.innerHTML = '';

    let template: string;
    let data: any = {};

    switch (pageName) {
      case 'loginPage':
        template = loginPage;
        break;
      case 'registrationPage':
        template = registrationPage;
        break;
      case 'chatPage':
        template = chatPage;
        data = {
          chats: [
            { name: 'Чат 1', lastMessage: 'Привет!', time: '12:00' },
            { name: 'Чат 2', lastMessage: 'Как дела?', time: '11:30' }
          ]
        };
        break;
      case 'profilePage':
        template = profilePage;
        const currentUser = AuthService.getCurrentUser();
        data = {
          user: currentUser || {
            firstName: 'Иван',
            secondName: 'Иванов',
            displayName: 'ivan',
            email: 'ivan@example.com',
            phone: '+7 999 123-45-67'
          }
        };
        break;
      case 'editProfilePage':
        template = editProfilePage;
        const editUser = AuthService.getCurrentUser();
        data = {
          user: editUser || {
            firstName: 'Иван',
            secondName: 'Иванов',
            displayName: 'ivan',
            email: 'ivan@example.com',
            phone: '+7 999 123-45-67'
          }
        };
        break;
      case 'changeData':
        template = changeData;
        break;
      case 'errorPage':
        template = errorPage;
        data = { errorCode: '404', errorText: 'Не туда попали' };
        break;
      case 'errorPageTwo':
        template = errorPageTwo;
        data = { errorCode: '500', errorText: 'Мы уже фиксим' };
        break;
      default:
        template = loginPage;
    }

    // Компилируем и рендерим шаблон
    const compiledTemplate = Handlebars.compile(template);
    const html = compiledTemplate(data);
    this.appElement.innerHTML = html;

    // Инициализируем страницу
    this.initPage(pageName);
  }

  private initPage(pageName: string): void {
    switch (pageName) {
      case 'loginPage':
        initLoginPage();
        break;
      case 'registrationPage':
        initRegistrationPage();
        break;
      case 'chatPage':
        initChatPage();
        break;
      case 'editProfilePage':
        initEditProfilePage();
        break;
      case 'changeData':
        initChangeDataPage();
        break;
    }
  }

  private setupGlobalNavigation(): void {
    // Обработчики для навигации
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      
      // Обработка ссылок с data-route атрибутом
      if (target.matches('[data-route]')) {
        e.preventDefault();
        const route = target.getAttribute('data-route');
        if (route) {
          this.router.go(route);
        }
        return; // Важно: выходим после обработки
      }

      // Обработка кнопки "Назад" - только для кнопок и ссылок
      if (target.matches('.back-button') || 
          (target.matches('button, a') && target.textContent?.includes('Назад'))) {
        e.preventDefault();
        this.router.back();
        return;
      }

      // Обработка логаута - только для кнопок и ссылок
      if (target.matches('.logout-button') || 
          (target.matches('button, a') && target.textContent?.includes('Выйти'))) {
        e.preventDefault();
        this.handleLogout();
        return;
      }

      // Обработка кнопок с data-route в атрибутах
      if (target.matches('button[data-route]')) {
        e.preventDefault();
        const route = target.getAttribute('data-route');
        if (route) {
          this.router.go(route);
        }
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
      // В случае ошибки все равно перенаправляем на главную
      this.router.go('/');
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}
