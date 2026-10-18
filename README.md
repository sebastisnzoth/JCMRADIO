# JCM RADIO

Sitio web de la radio online y panel de administración existentes. Proyecto React 19 + TypeScript + Vite, Firebase y reproductor SonicPanel.

## Sitio público

- Portada responsive con acceso directo a la transmisión.
- Player oficial: `https://sp.aljania.com/cp/widgets/player/single/?p=8120`.
- Portada y título musical cuando están disponibles.
- Enlaces sociales administrados en Firestore.
- Enlace para compartir y alternativa para abrir el player en otra pestaña.
- Fallback visual si Firestore o el endpoint de metadatos no responden.

## Desarrollo

```bash
npm ci
npm run lint
npm run build
npm run dev
```

El servidor Express de desarrollo ofrece `/api/radio-info`; **GitHub Pages es hosting estático y no ejecuta Express**. En hosting estático, la información de canciones puede no mostrarse, pero el iframe del player sigue disponible independientemente de esa API. Para producción con metadatos es necesario un backend accesible o un endpoint CORS compatible.

## Seguridad y publicación

- Las mejoras web se trabajan en una rama/PR, sin cambiar la aplicación Android ni las reglas de Firestore.
- Validar en dispositivos móviles, reproducción real y permisos del navegador antes de fusionar.
- Para publicar en GitHub Pages, configurar el `base` de Vite y el enrutado del panel según la URL definitiva. El proyecto actual no incluye un workflow de Pages verificado.
- Las imágenes remotas de canciones pueden no coincidir con la pista transmitida; se muestra el arte de la estación como alternativa.

## Cambios de la portada (octubre 2026)

Se eliminó el ancho fijo del iframe, se mejoró la navegación accesible y mobile, se agregó una portada editorial y se permite renderizar el sitio sin depender de la llegada de Firestore.
