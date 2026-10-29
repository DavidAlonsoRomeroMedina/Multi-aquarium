# Para Abril

Carta de cumpleaños. Al abrir el link aparece un sobre; al tocar el sello se abre el mensaje.

## Verla en local

```powershell
npm install
npm run dev
```

La carta queda en `http://localhost:5173`.

## Encender, pausar o actualizar

- **Link público:** la ruta `/` (el mismo sitio en Vercel).
- **Panel oculto:** `/para-david` — ahí se enciende o se pausa la carta.
- **Cambiar el texto:** edita `src/constants/letter.js`, luego `git add .`, `git commit` y `git push` a `main`. Vercel vuelve a publicar solo.

La contraseña del panel es `VITE_ADMIN_PASSWORD` (archivo `.env` local y variables de entorno de Vercel).
