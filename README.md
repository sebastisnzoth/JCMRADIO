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

## Publicación en GitHub Pages (diseño 2026)

La rama `feat/jcm-premium-red-2026` incorpora `.github/workflows/pages.yml`.
Al fusionarla a `main`, GitHub Actions ejecuta `npm ci`, `npm run lint`, `npm run build`, prepara `404.html` para rutas SPA y publica `dist`.

**Configuración requerida en GitHub**: Settings → Pages → Build and deployment → Source: **GitHub Actions**. En planes que no admitan Pages para repositorios privados, convertir el repositorio en público o habilitar un plan compatible (revisar antes que no existan secretos ni datos privados en el historial).

**URL prevista al habilitar Pages**: https://sebastisnzoth.github.io/JCMRADIO/ (no es prueba de que ya esté publicada).

**Limitaciones funcionales**: El endpoint `/api/radio-info` proviene del servidor Express y no corre en GitHub Pages; el reproductor SonicPanel sigue siendo un iframe independiente, pero requiere verificar CORS/embedding y reproducción real. Para usar Google/Firebase Auth en Pages puede requerirse autorizar `sebastisnzoth.github.io` en Firebase Authentication → Settings → Authorized domains. Enlaces de administración están adaptados al prefijo `/JCMRADIO/`.
