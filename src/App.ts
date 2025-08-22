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

import AppController from './services/AppController';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import ChatPage from './pages/ChatPage';

export default class App {
  private controller: AppController;
  private appElement: HTMLElement | null;

  constructor() {
    this.controller = new AppController();
    this.appElement = document.getElementById('app');
    this.initializeViews();
    this.setupRouting();
  }

  private initializeViews(): void {
    // Register all views with the controller
    this.controller.registerView('loginPage', new LoginPage());
    this.controller.registerView('registrationPage', new RegistrationPage());
    this.controller.registerView('chatPage', new ChatPage());

    // Listen for state changes to update UI
    this.controller.getEventBus().on('state:changed', this.handleStateChange.bind(this));
    this.controller.getEventBus().on('error:show', this.showError.bind(this));
    this.controller.getEventBus().on('success:show', this.showSuccess.bind(this));
    this.controller.getEventBus().on('page:change', this.handlePageChange.bind(this));
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

    this.controller.getEventBus().emit('page:change', page);
  }

  private handlePageChange(pageName: string): void {
    const view = this.controller.getView(pageName);
    if (!view) {
      console.error(`View ${pageName} not found`);
      return;
    }

    if (this.appElement) {
      // Get the template and data from the view
      const template = view.getTemplate();
      const data = view.getViewData();
      
      // Compile and render with Handlebars
      const compiledTemplate = Handlebars.compile(template);
      const html = compiledTemplate(data);
      
      this.appElement.innerHTML = html;
      
      // Call afterRender to setup event listeners
      view.setupAfterRender();
    }
  }

  private handleStateChange(state: any): void {
    // Update loading states and other UI elements based on state
    if (state.isLoading) {
      this.showLoading();
    } else {
      this.hideLoading();
    }
  }

  private showError(message: string): void {
    // Show error notification
    console.error('Error:', message);
    // You could implement a toast notification system here
  }

  private showSuccess(message: string): void {
    // Show success notification
    console.log('Success:', message);
    // You could implement a toast notification system here
  }

  private showLoading(): void {
    // Show loading indicator
    const loadingEl = document.getElementById('loading');
    if (loadingEl) {
      loadingEl.style.display = 'block';
    }
  }

  private hideLoading(): void {
    // Hide loading indicator
    const loadingEl = document.getElementById('loading');
    if (loadingEl) {
      loadingEl.style.display = 'none';
    }
  }

  public getController(): AppController {
    return this.controller;
  }
}

// Initialize the app
const app = new App();

// Make app available globally for debugging
(window as any).app = app;
