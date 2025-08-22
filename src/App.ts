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

import { loginPage, initLoginPage } from './pages/loginPage/index.ts';
import { registrationPage, initRegistrationPage } from './pages/registrationPage/index.ts';
import { chatPage } from './pages/chatPage/index.ts';
import { profilePage } from './pages/profilePage/index.ts';
import { editProfilePage, initEditProfilePage } from './pages/editProfilePage/index.ts';
import { errorPage } from './pages/errorPage/index.ts';
import { errorPageTwo } from './pages/errorPage/index.ts';
import { changeData, initChangeDataPage } from './pages/changeData/index.ts';
export { initLoginPage } from './pages/loginPage/initLoginPage.ts';

const Pages: Record<string, any> = {
  loginPage,
  registrationPage,
  chatPage,
  profilePage,
  errorPage,
  errorPageTwo,
  editProfilePage,
  changeData,
};

const pageInits: Record<string, (() => void) | undefined> = {
  loginPage: initLoginPage,
  registrationPage: initRegistrationPage,
  editProfilePage: initEditProfilePage,
  changeDataPage: initChangeDataPage, // добавишь функцию по аналогии
};

export default class App {
  private state: { currentPage: string };
  private appElement: HTMLElement | null;

  constructor() {
    this.state = {
      currentPage: 'loginPage',
    };
    this.appElement = document.getElementById('app');
  }

  render() {
    const pageTemplate = Pages[this.state.currentPage];

    if (!pageTemplate) {
      console.error(`Page ${this.state.currentPage} not found`);
      return;
    }

    const template = Handlebars.compile(pageTemplate);
    if (this.appElement) {
      this.appElement.innerHTML = template({});
    }

    const initFn = pageInits[this.state.currentPage];
    if (initFn) {
      initFn();
    }
    this.attachEventListeners();
  }

  private attachEventListeners() {
    const footerLinks = document.querySelectorAll<HTMLAnchorElement>('.footer-link');
    footerLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = e.target as HTMLElement;
        const page = target.dataset.page;
        if (page) {
          this.changePage(page);
        }
      });
    });
    this.setupAvatarModal();
  }

  changePage(page: string) {
    this.state.currentPage = page;
    this.render();
  }

  private setupAvatarModal() {
    const avatarButton = document.getElementById('open-avatar-modal');
    const avatarModal = document.getElementById('avatar-modal');

    if (!avatarButton || !avatarModal) return;

    avatarButton.addEventListener('click', () => {
      avatarModal.classList.remove('hidden');
    });

    const closeBtn = document.getElementById('close-avatar-modal');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => avatarModal.classList.add('hidden'));
    }

    avatarModal.addEventListener('click', (e) => {
      if (e.target === avatarModal) {
        avatarModal.classList.add('hidden');
      }
    });
  }
}

const app = new App();

window.addEventListener('hashchange', handleRouting);
window.addEventListener('load', handleRouting);

function handleRouting() {
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

  app.changePage(page);
}
