// import Block from '../../services/Block';
// import editProfileTemplateRaw from './editProfilePage.hbs?raw';
// import { setupFormValidation } from '../../utils/validation';
// import AuthService from '../../services/AuthService';
// import AuthAPI from '../../services/AuthAPI';
// import UserAPI from '../../services/UserAPI';
// import { User } from '../../types/api';
//
// const editProfileTemplate = editProfileTemplateRaw as unknown as string;
//
// interface EditProfileProps {
//   first_name?: string;
//   second_name?: string;
//   display_name?: string;
//   login?: string;
//   email?: string;
//   phone?: string;
//   avatar?: string | null;
// }
//
// export class editProfilePage extends Block<EditProfileProps> {
//   constructor() {
//     super({});
//   }
//
//   protected render(): string {
//     return editProfileTemplate;
//   }
//
//   protected async componentDidMount(): Promise<void> {
//     try {
//       // === Получаем текущего пользователя ===
//       const currentUser: User = await AuthService.getCurrentUser() || await AuthAPI.getUser();
//
//       if (currentUser) {
//         // Один вызов setProps — без промежуточных изменений
//         this.setProps({
//           email: currentUser.email ?? '',
//           login: currentUser.login ?? '',
//           first_name: currentUser.first_name ?? '',
//           second_name: currentUser.second_name ?? '',
//           display_name: currentUser.display_name ?? '',
//           phone: currentUser.phone ?? '',
//           avatar: currentUser.avatar ?? null,
//         });
//       }
//
//       // === Находим форму ===
//       const form = this._element?.querySelector<HTMLFormElement>('.edit-profile-form');
//       if (!form) return;
//
//       // === Валидация ===
//       const validateAll = setupFormValidation(form);
//
//       form.addEventListener('submit', async (e) => {
//         e.preventDefault();
//         const formData = new FormData(form);
//         const data = Object.fromEntries(formData.entries()) as Partial<User>;
//
//         if (!validateAll()) {
//           console.error('❌ Ошибка валидации профиля');
//           return;
//         }
//
//         try {
//           const updatedUser = await UserAPI.changeProfile(data);
//           console.warn('✅ Профиль успешно обновлен:', updatedUser);
//
//           // Обновляем props одним вызовом
//           this.setProps({
//             ...this.props,
//             ...updatedUser,
//           });
//
//           // Перенаправляем обратно в профиль
//           if ((window as any).app?.getRouter) {
//             (window as any).app.getRouter().go('/settings');
//           } else {
//             location.hash = 'settings';
//           }
//         } catch (error) {
//           console.error('❌ Ошибка при сохранении профиля:', error);
//         }
//       });
//
//       // === Работа с модальным окном аватара ===
//       const avatarModal = this._element?.querySelector<HTMLElement>('#avatar-modal');
//       const openAvatarBtn = this._element?.querySelector<HTMLElement>('#open-avatar-modal');
//       const closeAvatarBtn = this._element?.querySelector<HTMLElement>('#close-avatar-modal');
//       const fileInput = this._element?.querySelector<HTMLInputElement>('.edit-profile-avatar-input');
//
//       if (openAvatarBtn && avatarModal) openAvatarBtn.addEventListener('click', () => avatarModal.classList.remove('hidden'));
//       if (closeAvatarBtn && avatarModal) closeAvatarBtn.addEventListener('click', () => avatarModal.classList.add('hidden'));
//       if (avatarModal) avatarModal.addEventListener('click', (e) => { if (e.target === avatarModal) avatarModal.classList.add('hidden'); });
//
//       if (fileInput) {
//         fileInput.addEventListener('change', (e) => {
//           const target = e.target as HTMLInputElement;
//           if (target.files && target.files[0]) {
//             console.warn('📸 Загружаем аватар:', target.files[0].name);
//             // Здесь можно реализовать загрузку файла на сервер
//           }
//         });
//       }
//
//     } catch (error) {
//       console.error('❌ Ошибка загрузки данных пользователя:', error);
//     }
//   }
//
//   protected componentDidUpdate(oldProps: EditProfileProps, newProps: EditProfileProps): boolean {
//     // Можно добавить проверку изменений, чтобы избежать лишних логов/рендеров
//     const oldStr = JSON.stringify(oldProps);
//     const newStr = JSON.stringify(newProps);
//     if (oldStr !== newStr) {
//       console.log('componentDidUpdate', oldProps, newProps);
//       return true;
//     }
//     return false;
//   }
// }



// import Block from '../../services/Block';
// import editProfileTemplateRaw from './editProfilePage.hbs?raw';
// import { setupFormValidation } from '../../utils/validation';
// import AuthService from '../../services/AuthService';
// import AuthAPI from '../../services/AuthAPI';
// import UserAPI from '../../services/UserAPI';
// import { User } from '../../types/api';
//
// const editProfileTemplate = editProfileTemplateRaw as unknown as string;
//
// interface EditProfileProps {
//   first_name?: string;
//   second_name?: string;
//   display_name?: string;
//   login?: string;
//   email?: string;
//   phone?: string;
//   avatar?: string | null;
// }
//
// export class editProfilePage extends Block<EditProfileProps> {
//   constructor() {
//     super({});
//   }
//
//   protected render(): string {
//     return editProfileTemplate;
//   }
//
//   protected async componentDidMount(): Promise<void> {
//     try {
//       // === Получаем текущего пользователя ===
//       const currentUser: User = await AuthService.getCurrentUser() || await AuthAPI.getUser();
//
//       if (currentUser) {
//         this.setProps({
//           email: currentUser.email ?? '',
//           login: currentUser.login ?? '',
//           first_name: currentUser.first_name ?? '',
//           second_name: currentUser.second_name ?? '',
//           display_name: currentUser.display_name ?? '',
//           phone: currentUser.phone ?? '',
//           avatar: currentUser.avatar ?? null,
//         });
//       }
//
//       // === Находим форму профиля ===
//       const form = this._element?.querySelector<HTMLFormElement>('.edit-profile-form');
//       if (!form) return;
//
//       const validateAll = setupFormValidation(form);
//
//       // === Сохранение профиля ===
//       form.addEventListener('submit', async (e) => {
//         e.preventDefault();
//         const formData = new FormData(form);
//         const data = Object.fromEntries(formData.entries()) as Partial<User>;
//
//         if (!validateAll()) {
//           console.error('❌ Ошибка валидации профиля');
//           return;
//         }
//
//         try {
//           const updatedUser = await UserAPI.changeProfile(data);
//           console.warn('✅ Профиль успешно обновлен:', updatedUser);
//
//           // Обновляем props
//           this.setProps({ ...this.props, ...updatedUser });
//
//           // Перенаправление на страницу профиля
//           const app = (window as any).app;
//           if (app?.getRouter) {
//             app.getRouter().go('/settings');
//           } else {
//             location.hash = 'settings';
//           }
//         } catch (error) {
//           console.error('❌ Ошибка при сохранении профиля:', error);
//         }
//       });
//
//       // === Работа с аватаром ===
//       const avatarModal = this._element?.querySelector<HTMLElement>('#avatar-modal');
//       const openAvatarBtn = this._element?.querySelector<HTMLElement>('#open-avatar-modal');
//       const closeAvatarBtn = this._element?.querySelector<HTMLElement>('#close-avatar-modal');
//       const fileInput = this._element?.querySelector<HTMLInputElement>('.edit-profile-avatar-input');
//       const avatarPreview = this._element?.querySelector<HTMLElement>('.edit-profile-avatar');
//
//       if (openAvatarBtn && avatarModal) openAvatarBtn.addEventListener('click', () => avatarModal.classList.remove('hidden'));
//       if (closeAvatarBtn && avatarModal) closeAvatarBtn.addEventListener('click', () => avatarModal.classList.add('hidden'));
//       if (avatarModal) avatarModal.addEventListener('click', (e) => { if (e.target === avatarModal) avatarModal.classList.add('hidden'); });
//
//       if (fileInput) {
//         fileInput.addEventListener('change', async (e) => {
//           const target = e.target as HTMLInputElement;
//           if (target.files && target.files[0]) {
//             const file = target.files[0];
//
//             // Превью аватара на странице
//             if (avatarPreview) {
//               const reader = new FileReader();
//               reader.onload = () => {
//                 avatarPreview.style.backgroundImage = `url(${reader.result})`;
//               };
//               reader.readAsDataURL(file);
//             }
//
//             // Загружаем аватар на сервер
//             const formData = new FormData();
//             formData.append('avatar', file);
//
//             try {
//               const updatedUser = await UserAPI.changeAvatar(formData);
//               console.warn('✅ Аватар успешно обновлен:', updatedUser);
//
//               // Обновляем props с новым avatar
//
//               const app = (window as any).app;
//               if (app?.getRouter) {
//                 app.getRouter().go('/settings/edit');
//               } else {
//                 location.hash = 'settings/edit';
//               }
//               this.setProps({ ...this.props, avatar: updatedUser.avatar });
//             } catch (err) {
//               console.error('❌ Ошибка при загрузке аватара:', err);
//             }
//           }
//         });
//       }
//
//     } catch (error) {
//       console.error('❌ Ошибка загрузки данных пользователя:', error);
//     }
//   }
//
//   protected componentDidUpdate(oldProps: EditProfileProps, newProps: EditProfileProps): boolean {
//     const oldStr = JSON.stringify(oldProps);
//     const newStr = JSON.stringify(newProps);
//     if (oldStr !== newStr) {
//       console.log('componentDidUpdate', oldProps, newProps);
//       return true;
//     }
//     return false;
//   }
// }

import Block from '../../services/Block';
import editProfileTemplateRaw from './editProfilePage.hbs?raw';
import { setupFormValidation } from '../../utils/validation';
import AuthService from '../../services/AuthService';
import AuthAPI from '../../services/AuthAPI';
import UserAPI from '../../services/UserAPI';
import { User } from '../../types/api';

const editProfileTemplate = editProfileTemplateRaw as unknown as string;

// Базовый URL сервера
const BASE_URL = 'https://example.com';

interface EditProfileProps {
  first_name?: string;
  second_name?: string;
  display_name?: string;
  login?: string;
  email?: string;
  phone?: string;
  avatar?: string | null;
}

export class editProfilePage extends Block<EditProfileProps> {
  constructor() {
    super({});
  }

  private setAvatar(avatarDiv: HTMLElement, avatarPath: string | null) {
    if (!avatarDiv) return;

    if (avatarPath) {
      avatarDiv.style.backgroundImage = `url(${avatarPath})`;
      avatarDiv.style.backgroundSize = 'cover';
      avatarDiv.style.backgroundPosition = 'center';
      avatarDiv.style.borderRadius = '50%';
      avatarDiv.textContent = '';
    } else {
      avatarDiv.style.backgroundImage = '';
      avatarDiv.textContent = '🖼️';
    }
  }

  protected render(): string {
    return editProfileTemplate;
  }

  protected async componentDidMount(): Promise<void> {
    try {
      // Получаем текущего пользователя
      const currentUser: User = await AuthService.getCurrentUser() || await AuthAPI.getUser();
      const avatarFullPath = currentUser.avatar ? BASE_URL + currentUser.avatar : null;

      if (currentUser) {
        this.setProps({
          email: currentUser.email ?? '',
          login: currentUser.login ?? '',
          first_name: currentUser.first_name ?? '',
          second_name: currentUser.second_name ?? '',
          display_name: currentUser.display_name ?? '',
          phone: currentUser.phone ?? '',
          avatar: avatarFullPath,
        });
      }

      // Элементы DOM
      const form = this._element?.querySelector<HTMLFormElement>('.edit-profile-form');
      const avatarModal = this._element?.querySelector<HTMLElement>('#avatar-modal');
      const openAvatarBtn = this._element?.querySelector<HTMLElement>('#open-avatar-modal');
      const closeAvatarBtn = this._element?.querySelector<HTMLElement>('#close-avatar-modal');
      const fileInput = this._element?.querySelector<HTMLInputElement>('.edit-profile-avatar-input');
      const avatarPreview = this._element?.querySelector<HTMLElement>('.edit-profile-avatar');

      // Отображаем текущий аватар
      this.setAvatar(avatarPreview!, this.props.avatar ?? null);

      if (!form) return;

      // Валидация формы
      const validateAll = setupFormValidation(form);

      // Сабмит формы через JS
      form.addEventListener('submit', async (e) => {
        e.preventDefault(); // ⚠️ ключевой момент — форма не должна сабмититься нативно

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries()) as Partial<User>;

        if (!validateAll()) {
          console.error('❌ Ошибка валидации профиля');
          return;
        }

        try {
          const updatedUser = await UserAPI.changeProfile(data);
          const avatarPath = updatedUser.avatar ? BASE_URL + updatedUser.avatar : null;

          this.setProps({ ...this.props, ...updatedUser, avatar: avatarPath });
          this.setAvatar(avatarPreview!, avatarPath);

          // Перенаправление через роутер
          const app = (window as any).app;
          if (app?.getRouter) {
            app.getRouter().go('/settings');
          } else {
            location.hash = 'settings';
          }
        } catch (err) {
          console.error('❌ Ошибка при сохранении профиля:', err);
        }
      });

      // Работа с модальным окном аватара
      if (openAvatarBtn && avatarModal) openAvatarBtn.addEventListener('click', () => avatarModal.classList.remove('hidden'));
      if (closeAvatarBtn && avatarModal) closeAvatarBtn.addEventListener('click', () => avatarModal.classList.add('hidden'));
      if (avatarModal) avatarModal.addEventListener('click', (e) => { if (e.target === avatarModal) avatarModal.classList.add('hidden'); });

      // Загрузка нового аватара
      if (fileInput) {
        fileInput.addEventListener('change', async (e) => {
          e.preventDefault();
          const target = e.target as HTMLInputElement;
          if (!target.files?.length) return;

          const file = target.files[0];

          // Превью аватара
          const reader = new FileReader();
          reader.onload = () => this.setAvatar(avatarPreview!, reader.result as string);
          reader.readAsDataURL(file);

          // Отправка аватара на сервер
          const avatarFormData = new FormData();
          avatarFormData.append('avatar', file);

          try {
            const updatedUser = await UserAPI.changeAvatar(avatarFormData);
            const avatarPath = updatedUser.avatar ? BASE_URL + updatedUser.avatar : null;

            this.setProps({ ...this.props, avatar: avatarPath });
            this.setAvatar(avatarPreview!, avatarPath);

            const app = (window as any).app;
            if (app?.getRouter) {
              app.getRouter().go('/settings');
            } else {
              location.hash = 'settings';
            }

            if (avatarModal) avatarModal.classList.add('hidden');
          } catch (err) {
            console.error('❌ Ошибка при загрузке аватара:', err);
          }
        });
      }
    } catch (err) {
      console.error('❌ Ошибка загрузки данных пользователя:', err);
    }
  }

  protected componentDidUpdate(oldProps: EditProfileProps, newProps: EditProfileProps): boolean {
    if (oldProps.avatar !== newProps.avatar && this._element) {
      const avatarDiv = this._element.querySelector<HTMLElement>('.edit-profile-avatar');
      this.setAvatar(avatarDiv!, newProps.avatar ?? null);
    }
    return JSON.stringify(oldProps) !== JSON.stringify(newProps);
  }
}



