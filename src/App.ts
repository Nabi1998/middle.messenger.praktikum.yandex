import Handlebars from 'handlebars';
import './helpers/handlebarsHelpers';

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

  constructor() {
    this.appElement = document.getElementById('app');
    this.setupRouting();
  }

  private setupRouting(): void {
    window.addEventListener('hashchange', this.handleRouting.bind(this));
    window.addEventListener('load', this.handleRouting.bind(this));
  }

  private handleRouting(): void {
    const hash = location.hash.slice(1);
    let page: string = 'loginPage';

    switch (hash) {
      case 'register':
        page = 'registrationPage';
        break;
      case 'chat':
        page = 'chatPage';
        break;
      case 'profile':
        page = 'profilePage';
        break;
      case 'profile-edit':
        page = 'editProfilePage';
        break;
      case 'login':
        page = 'loginPage';
        break;
      case 'not-found':
        page = 'errorPage';
        break;
      case 'not-supported':
        page = 'errorPageTwo';
        break;
      case 'change-data':
        page = 'changeData';
        break;
      default:
        page = 'loginPage';
    }

    this.renderPage(page);
  }

  private renderPage(pageName: string): void {
    if (!this.appElement) return;

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
        data = {
          user: {
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
        data = {
          user: {
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

    // Настраиваем навигацию для всех страниц
    this.setupNavigation();
  }

  private setupNavigation(): void {
    // Обработчики для навигации
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      
      if (target.matches('[data-page]')) {
        const page = target.getAttribute('data-page');
        if (page) {
          location.hash = page;
        }
      }

      // Обработка кнопки "Назад"
      if (target.matches('.back-button') || target.textContent?.includes('Назад')) {
        history.back();
      }

      // Обработка логаута
      if (target.matches('.logout-button') || target.textContent?.includes('Выйти')) {
        location.hash = 'login';
      }
    });
  }
}

// Инициализируем приложение
const app = new App();

// Делаем доступным глобально для отладки
(window as any).app = app;
