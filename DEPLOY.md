# Деплой НЕЙРО АРТЕЛЬ — Cloudflare Pages

## Шаг 1: Firebase (авторизация + база данных)

### 1.1 Создай проект Firebase
1. Открой https://console.firebase.google.com
2. Нажми **Add project** → дай имя (например `neyroartel-course`)
3. Google Analytics — можно отключить

### 1.2 Включи Authentication
1. В меню слева → **Authentication** → **Get started**
2. **Sign-in method** → включи:
   - **Email/Password** → Enable
   - **Google** → Enable (укажи email поддержки)

### 1.3 Создай Firestore
1. В меню → **Firestore Database** → **Create database**
2. Режим: **Production mode**
3. Регион: `europe-west3` (Франкфурт) или ближайший

### 1.4 Правила Firestore (Security Rules)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```
Вставь в **Firestore → Rules → Edit rules**

### 1.5 Получи конфиг
1. **Project Settings** (шестерёнка) → **General** → листай вниз
2. **Your apps** → нажми **</>** (Web)
3. Дай имя приложению → **Register app**
4. Скопируй объект `firebaseConfig`

### 1.6 Вставь конфиг в index.html
Найди в `index.html` строку:
```js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  ...
```
Замени все `YOUR_*` на свои значения.

---

## Шаг 2: Cloudflare Pages

### Вариант A — через Git (рекомендуется)
1. Загрузи папку `Claude_edu` в GitHub репозиторий
2. Открой https://pages.cloudflare.com
3. **Create a project** → **Connect to Git** → выбери репозиторий
4. **Build settings**:
   - Framework preset: `None`
   - Build command: *(пусто)*
   - Build output directory: `/` или `.`
5. **Save and Deploy**

### Вариант B — через Drag & Drop
1. Открой https://pages.cloudflare.com
2. **Create a project** → **Direct Upload**
3. Перетащи папку `Claude_edu`

### Привязка домена
1. В настройках проекта → **Custom domains** → **Add custom domain**
2. Введи свой домен (например `course.neyroartel.ru`)
3. Добавь CNAME запись в DNS своего регистратора:
   ```
   CNAME  course  <project>.pages.dev
   ```

---

## Файлы проекта
```
Claude_edu/
├── index.html      ← весь курс
├── _headers        ← security headers для Cloudflare
├── _redirects      ← SPA routing
└── DEPLOY.md       ← этот файл
```

---

## Сброс прогресса пользователя (для тестов)
В консоли браузера (F12):
```js
localStorage.clear(); location.reload();
```
