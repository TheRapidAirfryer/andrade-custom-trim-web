# Andrade Custom Trim — sitio web

Sitio estático bilingüe (inglés en `/`, español en `/es/`) basado en la propuesta del cliente del 2 de octubre de 2026.

## Uso

Desde la carpeta `andrade-custom-trim-web`:

```bash
npm run dev     # genera el sitio, lo abre en http://localhost:4321 y recarga al guardar cambios
npm run build   # solo genera dist/ para publicar
```

No necesita `npm install`: solo hace falta Node 18 o superior. Para usar otro puerto: `set PORT=3000 && npm run dev`.

Para publicar, sube la carpeta `dist/` a cualquier hosting estático (Vercel, Netlify, Cloudflare Pages).

## Dónde se edita

- `src/config.mjs`: teléfono, correo, dirección, horario, ciudades, fotos y portafolio.
- `src/i18n.mjs`: todos los textos en inglés y español.
- `src/assets/styles.css`: diseño (colores de la propuesta: #F6F3ED, #282C29 y #FE6C13).
- `build.mjs`: estructura de las páginas, SEO, sitemap y robots.

## Pendiente antes de publicar

1. **Fotos:** las 16 fotos de la propuesta (incluidos el logo, la sala de exhibición y Víctor y Michelle) están en `src/img/`. Se sacaron del PDF y se convirtieron a WebP; las de mayor calidad sin convertir están en `../.tools/pdf-images/`. Cuando el cliente mande los originales, reemplaza esos archivos con el mismo nombre. Las fotos extra del portafolio (las rutas que no empiezan con `/img/`) todavía se cargan del sitio actual: cópialas a `src/img/` antes de que se reemplace el sitio viejo.
2. **Formulario:** crea una cuenta en Formspree o Web3Forms y pega la URL en `FORM_ENDPOINT`. Así se activan el envío directo y la opción de adjuntar fotos. Sin esa URL, el formulario abre la aplicación de correo del visitante.
3. **Datos por confirmar:** el horario (se usó lunes a viernes, de 8 a 5, como dice la propuesta), el enlace exacto a las reseñas de Google (`googleReviewsUrl`) y las redes sociales (`social`).
4. **Preguntas frecuentes:** las respuestas son un borrador. Hay que validarlas con el cliente.
