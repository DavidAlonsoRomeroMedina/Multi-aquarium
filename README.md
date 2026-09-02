# Multi Aquarium

Aplicación web de **Admirador Secreto** para el grupo de rol Multi Aquarium. Los integrantes pueden enviar cartas (con imagen opcional) y hay un panel oculto para leer el buzón y gestionar la lista de destinatarios.

Temática: acuario mágico, glassmorphism y burbujas.

## Stack

- React + Vite
- Tailwind CSS
- Framer Motion
- React Router DOM
- Firebase Firestore (plan gratuito)
- Imágenes de cartas: Base64 (&lt; 1MB) o Imgur (gratis)

## Estructura

```
public/
  imagenes/          # Fotos de los 19 integrantes (ruta canónica)
  fondo/             # Fondos de estilo del acuario
src/
  App.jsx
  firebase.js
  lib/imageUpload.js
  constants/members.js
  components/
    AquariumBackground.jsx
    GlassCard.jsx
    LetterForm.jsx
    MemberPicker.jsx
    SiteHeader.jsx
    SuccessMessage.jsx
  pages/
    HomePage.jsx
    AdminPage.jsx
firestore.rules
.env.example
```

Las fotos de personajes deben vivir en **`public/imagenes/`** (por ejemplo `/imagenes/Bachira.png`). Vite las sirve desde la raíz del sitio.

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

## Configurar Firebase (gratis)

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com).
2. Activa solo **Firestore** (no hace falta Storage de pago).
3. Registra una app web y copia las claves a `.env`.
4. Publica las reglas:

```bash
firebase deploy --only firestore:rules
```

5. Entra a `/admin-secret-aquarium` o deja que la app cargue sola la lista de 19 integrantes.

Colecciones usadas:

- `members` — `{ name, image, createdAt }`
- `letters` — `{ sender, isAnonymous, recipientId, recipientName, message, imageUrl, createdAt }`

## Imágenes adjuntas (sin Firebase Storage)

Al enviar una carta:

- Si la imagen pesa **menos de 1MB** → se guarda como **Base64** en `imageUrl` dentro de Firestore.
- Si pesa **1MB o más** → se sube a la API pública de **Imgur** y se guarda el enlace en `imageUrl`.

Para Imgur, crea un Client-ID gratis en [api.imgur.com/oauth2/addclient](https://api.imgur.com/oauth2/addclient) (tipo *Anonymous*) y ponlo en `.env`:

```
VITE_IMGUR_CLIENT_ID=tu_client_id
```

Las fotos pequeñas funcionan aunque no configures Imgur.

## Auth del panel

Por defecto el panel usa una contraseña en `.env`. Esa clave viaja al cliente, así que es una barrera simple, no un candado real.

## Scripts

| Comando        | Qué hace              |
| -------------- | --------------------- |
| `npm run dev`  | Servidor de desarrollo |
| `npm run build`| Build de producción    |
| `npm run preview` | Preview del build   |
