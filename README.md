# Portafolio de Orlando André Huapaya Huapaya

Portafolio personal construido con **Vite** y **JavaScript vanilla**, con diseño oscuro moderno, modo claro, animaciones y diseño responsive.

## Desarrollo

Requiere Node.js `20.19+` o `22.12+`.

```bash
npm install
npm run dev
```

La aplicación estará disponible en la dirección que muestre Vite (por defecto `http://localhost:5173`).

## Producción

```bash
npm run build
npm run preview
```

## Fotografía de perfil

La fotografía se carga desde:

```text
public/perfil.jpg
```

Puedes reemplazar ese archivo por la imagen que quieras utilizar. Mientras no exista, el sitio muestra automáticamente `public/perfil-fallback.svg` como respaldo.

## Formulario de contacto

No requiere backend: valida los campos y abre el cliente de correo con un mensaje prellenado dirigido a `ohuapayah@autonoma.edu.pe`.

## Currículum

El botón de descarga utiliza `public/Orlando-Huapaya-CV.pdf`. Puede regenerarlo con:

```bash
npm run generate:cv
```

## Publicar en GitHub Pages

El repositorio está preparado para publicarse en:

```text
https://andrehh-dotcom.github.io/Portafolio/
```

El workflow `.github/workflows/deploy.yml` compila el proyecto y lo publica automáticamente cuando se sube un cambio a la rama `main`.

Pasos para publicarlo:

1. Crear el repositorio `Portafolio` en GitHub bajo la cuenta `andrehh-dotcom`.
2. Subir el contenido de esta carpeta a la rama `main`.
3. En **Settings → Pages**, seleccionar **GitHub Actions** como fuente.
4. El workflow aparecerá en `Actions` y publicará automáticamente el sitio.

Si tienes GitHub CLI instalado y autenticado, puedes crear y subir el repositorio con:

```bash
git init
git add .
git commit -m "Initial commit: portfolio"
git branch -M main
gh repo create andrehh-dotcom/Portafolio --public --source=. --remote=origin --push
```
