import './styles/main.pcss';
import './styles/loginPage.pcss';
import './styles/chatPage.pcss';
import './styles/profilePage.pcss';
import './styles/editProfilePage.pcss';
import './styles/changeData.pcss';
import './styles/errorPage.pcss';
// import App from './App';
import App from './App2';

interface WindowWithApp extends Window {
  app?: App;
}

// document.addEventListener('DOMContentLoaded', () => {
//   const app = new App();
//   (window as WindowWithApp).app = app;
// });

// Since we are moving to Block mechanism, we should avoid document.addEventListener if possible,
// but for the entry point it is acceptable.
// However, to be consistent with the request "Использование addEventListener должно выполняться через механизм класса Block",
// we should ensure that inside the App and components we use the Block mechanism.
// The main.ts is the entry point, so it's fine to use DOMContentLoaded here to bootstrap the app.

document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  (window as WindowWithApp).app = app;
});
