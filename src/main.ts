import './styles/main.pcss';
import './styles/loginPage.pcss';
import './styles/chatPage.pcss';
import './styles/profilePage.pcss';
import './styles/editProfilePage.pcss';
import './styles/changeData.pcss';
import './styles/errorPage.pcss';
import App from './App';

interface WindowWithApp extends Window {
  app?: App;
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  (window as WindowWithApp).app = app;
});
