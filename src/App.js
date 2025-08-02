import Handlebars from 'handlebars';
import './helpers/handlebarsHelpers.js';

import Button from './components/Button.js';
import Input from './components/input.js';
import Footer from './components/Footer.js';
import Link from './components/Link.js';

Handlebars.registerPartial('Button', Button);
Handlebars.registerPartial('Input', Input);
Handlebars.registerPartial('Footer', Footer);
Handlebars.registerPartial('Link', Link);

import { loginPage } from './pages/loginPage';
import { registrationPage } from './pages/registrationPage';
import { chatPage } from './pages/chatPage';
import { profilePage } from './pages/profilePage';
import { editProfilePage } from './pages/editProfilePage';
import { errorPage } from './pages/errorPage';
import { errorPageTwo } from './pages/errorPage';


const Pages = {
  loginPage,
  registrationPage,
  chatPage,
  profilePage,
  errorPage,
  errorPageTwo,
  editProfilePage
};


export default class App {
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
    this.appElement.innerHTML = template({});
    this.attachEventListeners();
  }

  attachEventListeners() {
    const footerLinks = document.querySelectorAll('.footer-link');
    footerLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.changePage(e.target.dataset.page);
      });
    });
  }

  changePage(page) {
    this.state.currentPage = page;
    this.render();
  }

}


const app = new App();

window.addEventListener('hashchange', handleRouting);
window.addEventListener('load', handleRouting);

function handleRouting() {
  const hash = location.hash.slice(1); // Убираем #
  let page = 'loginPage';

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
    default:
      page = 'loginPage';
  }

  app.changePage(page);
}
