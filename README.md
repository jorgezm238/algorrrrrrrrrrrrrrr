# Estudio de Algoritmia

Web de estudio estática (HTML + CSS + JavaScript, sin build ni dependencias): carga tus PDF y notebooks `.ipynb`, practica con tests A/B/C/D y verdadero/falso, y ejecuta el código de los notebooks en el navegador con Python (Pyodide).

## Uso en local
Abre la carpeta en VS Code → clic derecho en `index.html` → **Open with Live Server**.

## Despliegue en Vercel (página de testeo)
1. Sube este repositorio a GitHub (ver abajo).
2. En <https://vercel.com/new> pulsa **Import** sobre el repositorio.
3. Configuración: **Framework Preset: Other**, *Build Command* vacío, *Output Directory* vacío (raíz). Pulsa **Deploy**.
4. Cada `git push` a `main` redespliega automáticamente; las ramas y pull requests generan URLs de preview.

No hay variables de entorno, backend ni claves.

## Subir a GitHub
```
git remote add origin https://github.com/TU_USUARIO/estudio-algoritmia.git
git push -u origin main
```


## Notebooks incluidos
Los dos notebooks de las prácticas están en `notebooks/` y se abren desde el menú (**Práctica 1** y **Práctica 3**) sin subirlos a mano. Si cambias un `.ipynb` de esa carpeta, mantén el mismo nombre de archivo. La opción **Cargar otro notebook** sigue permitiendo abrir cualquier otro `.ipynb` local.

## Edición compartida en tiempo real (Firebase)
Vercel solo sirve archivos estáticos y no mantiene conexiones en tiempo real, así que la sincronización usa **Firebase Realtime Database** (plan gratuito Spark). Lo que se comparte es el **código de las celdas** de las dos prácticas: cuando alguien escribe, los demás lo ven al instante (y al entrar ven la última versión). Los resultados de ejecutar y el progreso de tests siguen siendo de cada persona.

1. En <https://console.firebase.google.com> crea un proyecto (sin Analytics) → **Build → Realtime Database → Crear base de datos** (modo bloqueado).
2. Pestaña **Reglas**, pega esto y publica:
```json
{
  "rules": {
    ".read": false,
    ".write": false,
    "nb": { "$nb": { "cells": {
      ".read": true, ".write": true,
      "$i": { ".validate": "newData.hasChildren(['src','t','by']) && newData.child('src').isString() && newData.child('src').val().length <= 20000" }
    } } },
    "presence": { "$nb": { ".read": true, "$id": { ".write": true } } }
  }
}
```
3. **Configuración del proyecto → Tus apps → Web (</>)**: copia el objeto `firebaseConfig` (incluye `databaseURL`) en `firebase-config.js`.
4. `git push`: Vercel redespliega y la edición compartida queda activa (verás "🟢 Edición compartida en tiempo real · N conectados" en las prácticas).

**Cosas a tener en cuenta**
- Las reglas permiten escribir a cualquiera que abra la página (es lo que se pidió). Quien quiera podrá borrar o estropear el código compartido; el botón *Restaurar originales* lo devuelve al original para todos. Para limitarlo, añade Firebase Authentication o restringe el acceso (Vercel Deployment Protection).
- Es «gana la última escritura» por celda: si dos personas teclean a la vez en la **misma** celda, prevalece el último cambio (no es un editor tipo Google Docs). Cada persona no se ve pisada mientras escribe.
- La `apiKey` de Firebase es pública por diseño; la seguridad la dan las reglas.

## Estructura
| Archivo | Contenido |
|---|---|
| `index.html` | Estructura de la página |
| `style.css` | Diseño (modo oscuro, adaptable) |
| `script.js` | Lógica: PDF, tests, intentos, notebooks, kernel Python |
| `data.js` | Temario, banco de preguntas y V/F (aquí se añaden preguntas) |
| `firebase-config.js` | Configuración de Firebase (edición compartida) |
| `notebooks/` | Las dos prácticas `.ipynb` incluidas |
| `vercel.json` | Configuración de Vercel (URLs limpias y caché) |

## Internet necesario en el navegador
PDF.js (cdnjs), Pyodide (jsDelivr, ~10 MB la primera vez) y las fuentes de Google se cargan desde CDN. Tus PDF y notebooks **no se suben a ningún servidor**: se procesan en tu navegador. El progreso se guarda en `localStorage` de cada navegador.

## Límites
- No hay IA: las preguntas generadas se crean con plantillas a partir de las definiciones del temario y de tus PDF.
- Python en el navegador: `input()` no funciona y los gráficos de matplotlib no se muestran.
