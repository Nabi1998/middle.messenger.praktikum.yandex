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
    // this.setupGlobalNavigation(); // Removed global navigation listener
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

  public getRouter(): Router {
    return this.router;
  }
}
