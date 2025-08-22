Messenger — веб‑приложение для обмена сообщениями. Функциональность:

- Авторизация и регистрация пользователей (валидация по blur и при submit)
- Страница чатов (заглушка шаблонов)
- Профиль и редактирование профиля, смена данных
- Модалка загрузки аватара на странице редактирования профиля

Дизайн
Ссылка на дизайн: https://www.figma.com/design/jF5fFFzgGOxQeB4CmKWTiE/Chat_external_link?node-id=0-1&p=f

Технологии / инструменты
- TypeScript (строгая типизация, tsc type-check)
- Vite (dev/build/preview)
- Handlebars (шаблоны страниц и компонентов)
- PostCSS (.pcss стили)
- ESLint (flat config, TypeScript + Prettier интеграция)
- Prettier (форматирование)
- Stylelint (stylelint-config-standard, stylelint-order)
- Vitest + jsdom (юнит‑тесты UI‑утилит)

Скрипты
- Установка зависимостей: npm install
- Дев‑сервер: npm run dev
- Сборка: npm run build
- Предпросмотр сборки: npm run preview
- Запуск прод‑сервера: npm run start
- Проверка типов: npm run type-check
- Линтинг кода: npm run lint
- Автофикс линта: npm run lint:fix
- Линтинг стилей: npm run stylelint
- Автофикс стилей: npm run stylelint:fix
- Тесты: npm run test

Как поменять аватар
Перейдите в «Редактирование профиля» и нажмите на аватар — откроется модальное окно для загрузки файла. Закрытие — по кнопке «Закрыть» или клику по фону.Используйте реализацию блока (Block) и Event Bus;

Ссылки
Netlify: https://message-dev.netlify.app/
