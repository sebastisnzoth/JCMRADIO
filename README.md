# JCM RADIO

Sitio web de la radio online y panel de administración existentes. Proyecto React 19 + TypeScript + Vite, Firebase y reproductor SonicPanel.

## Sitio público

Diseño negro/azul noche con acentos rojos (tipografías Saira e Inter, autoalojadas con `@fontsource-variable`), responsive para escritorio, tablet y celular.

- **Cabecera fija**: logo JCM RADIO, menú (Inicio, Programación, Noticias, Nosotros, Contacto) que resalta la sección visible, redes sociales y botón **Escuchar ahora**. En celular: logo centrado y menú hamburguesa.
- **Hero** con foto de estudio (micrófono y cartel ON AIR), título "JCM RADIO — La radio que te acompaña" y accesos a escuchar y a la programación.
- **Reproductor propio** (`<audio>` HTML5) con play/pausa, volumen, silencio y controles en la pantalla de bloqueo (Media Session). Al pausar se corta la descarga y al reanudar vuelve al vivo.
  - Señal principal: `https://sp.aljania.com/8120/stream` (URL SSL de SonicPanel para reproductores HTML5).
  - Respaldo automático: `https://sp.aljania.com:8120/stream`.
  - Si ninguna conecta, se ofrece el player oficial: `https://sp.aljania.com/cp/widgets/player/single/?p=8120`.
- **Canción actual y carátula**: se consultan cada 30 s en `/api/radio-info` (servidor Express) y, si no existe, en la API pública de SonicPanel (`get_info.php?p=8120`). Si ninguna responde se muestra "Transmitiendo en vivo".
- **Programación destacada** con indicador **EN VIVO** calculado con la hora de Lima (UTC−5) y la grilla completa desplegable.
- Secciones de **Noticias**, **Nosotros** y **Contacto** (WhatsApp, redes y botón para compartir).
- Redes sociales, WhatsApp, enlace de TV (se muestra con el logo de YouTube si apunta a YouTube) y anuncio de bienvenida administrados en Firestore (`config/main`) desde el panel.

### Cómo editar el contenido

- Textos, horarios de programas y noticias: `src/components/site/content.ts`.
- URLs de la señal y del player alternativo: `src/components/site/radio.tsx`.
- Imágenes (WebP optimizadas): `src/assets/images/`.
- Estilos del sitio: `src/components/site/site.css`.

## Desarrollo

```bash
npm ci
npm run lint
npm run build
npm run dev
```

El servidor Express ofrece `/api/radio-info`; **GitHub Pages es hosting estático y no ejecuta Express**. En hosting estático el sitio intenta la API pública de SonicPanel directamente; si el navegador la bloquea (CORS), la canción actual no se muestra, pero la reproducción no depende de esa API.

Para probar la versión compilada con Express: `npm run build` y luego `NODE_ENV=production npx tsx server.ts` (puerto 3000).

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

**Limitaciones funcionales**: El endpoint `/api/radio-info` proviene del servidor Express y no corre en GitHub Pages (se usa la API de SonicPanel como alternativa). El reproductor HTML5 no necesita CORS, pero conviene verificar la reproducción real en celulares. Para usar Google/Firebase Auth en Pages puede requerirse autorizar `sebastisnzoth.github.io` en Firebase Authentication → Settings → Authorized domains. Enlaces de administración están adaptados al prefijo `/JCMRADIO/`.
