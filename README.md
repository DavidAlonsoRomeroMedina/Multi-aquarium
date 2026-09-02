# Multi Aquarium

Aplicación web de **Admirador Secreto** para el grupo de rol Multi Aquarium. Los integrantes pueden enviar cartas (con imagen opcional) y hay un panel oculto para leer el buzón y gestionar la lista de destinatarios.

Temática: acuario mágico, glassmorphism y burbujas.

## Stack

- React + Vite
- Tailwind CSS
- Framer Motion
- React Router DOM
- Firebase (Firestore + Storage, Auth opcional)

## Estructura

```
src/
  App.jsx
  firebase.js
  constants/members.js
  components/
    AquariumBackground.jsx
    GlassCard.jsx
    LetterForm.jsx
    SiteHeader.jsx
    SuccessMessage.jsx
  pages/
    HomePage.jsx
    AdminPage.jsx
firestore.rules
storage.rules
.env.example
```

- Vista pública: `/` — formulario de carta.
- Vista oculta: `/admin-secret-aquarium` — buzón y CRUD de integrantes.

## Comandos

```bash
npm install
cp .env.example .env
npm run dev
```

En Windows (PowerShell):

```powershell
Copy-Item .env.example .env
npm install
npm run dev
```

La app queda en `http://localhost:5173`.

## Configurar Firebase

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com).
2. Activa **Firestore**, **Storage** y (si quieres) **Authentication**.
3. Registra una app web y copia las claves a `.env`:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_ADMIN_PASSWORD=cambia-esta-clave
```

4. Publica las reglas de este repo:

```bash
firebase deploy --only firestore:rules,storage
```

5. Entra a `/admin-secret-aquarium`, inicia sesión con `VITE_ADMIN_PASSWORD` y pulsa **Cargar lista inicial de 19 integrantes**.

Colecciones usadas:

- `members` — `{ name, createdAt }`
- `letters` — `{ sender, isAnonymous, recipientId, recipientName, message, imageUrl, createdAt }`

Imágenes: `letters/` en Firebase Storage.

## Auth del panel

Por defecto el panel usa una contraseña en `.env`. Esa clave viaja al cliente, así que es una barrera simple, no un candado real.

Para usar Firebase Auth:

```
VITE_USE_FIREBASE_AUTH=true
VITE_ADMIN_EMAIL=tu-admin@email.com
VITE_ADMIN_PASSWORD=la-clave-de-ese-usuario
```

Luego ajusta las reglas de Firestore/Storage para que solo ese usuario lea cartas.

## Scripts

| Comando        | Qué hace              |
| -------------- | --------------------- |
| `npm run dev`  | Servidor de desarrollo |
| `npm run build`| Build de producción    |
| `npm run preview` | Preview del build   |
