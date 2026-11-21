<div align="center">

# 🎬 Previz Studio

**Planifica tus planos antes de rodar.**
Dibuja la planta del set, coloca cámaras y personajes, y mira la secuencia en 3D, todo desde el navegador.

[![Abrir la app](https://img.shields.io/badge/▶_Abrir_la_app-thedevdad.github.io-e8590c?style=for-the-badge)](https://thedevdad.github.io/previz-studio/)

![HTML](https://img.shields.io/badge/un_solo_archivo-HTML-f4a261?style=flat-square)
![Three.js](https://img.shields.io/badge/3D-Three.js_r187-1b1d21?style=flat-square)
![Sin instalación](https://img.shields.io/badge/sin_instalación-navegador-2f7d4f?style=flat-square)
![Idioma](https://img.shields.io/badge/interfaz-español-d62828?style=flat-square)

</div>

---

## ✨ ¿Qué es?

**Previz Studio** es una herramienta de previsualización (*previz*) pensada para planificar movimientos de cámara transmitir una idea, crear storyboard o más, en cualquier obra audiovisual. En lugar de imaginar un plano, lo montas: paredes, muebles, coches, personas, la cámara y su recorrido. Después lo reproduces en 3D para ver exactamente qué va a ver el objetivo.

Sirve para preparar el rodaje, comunicar ideas al equipo y montar un storyboard a partir de los mismos planos.

```
📐 Planta   →   🎥 Cámara   →   🎬 3D
dibujas el set   colocas planos     ves la secuencia
```

---

## 🧰 Funciones

### 📐 Planta
- **Muros** con grosor y altura propios, y **puertas** (bisagra izquierda o derecha) y **ventanas** que abren hueco en el muro.
- **Catálogo por categorías**:
  - **Estructura**
  - **Personas y animales**
  - **Casa**: salón, dormitorio, cocina, baño y luces.
  - **Cafetería**
  - **Calle**: vehículos, mobiliario urbano, señales, paradas…
- **Tiradores** de esquina, laterales y de giro, y redondeo de esquinas.
- **Capas** (Suelo, Muebles y Techo) para ocultar o bloquear. Lo más alto siempre se dibuja encima.
- **Personas** con rol (personaje, secundario o extra), sexo, poses predefinidas y ajuste fino, y aspecto (pelo, piel, ropa). También hay **perro**.
- **Personajes animados**: importa un personaje `.glb` con animaciones (por ejemplo de [ActionForge](https://actionforge.app) o Mixamo) y úsalo en lugar del muñeco. Anda, corre o se queda quieto según su recorrido.
- **Mis modelos 3D**: importa tus propios `.glb` o carpetas `.gltf` con texturas, de [Poly Haven](https://polyhaven.com), [Quaternius](https://quaternius.com) o [Kenney](https://kenney.nl).

### 🎥 Cámara
- Varios **planos por localización**, también fijos, ideales para storyboard.
- Puntos de cámara con **posición, altura, objetivo, lente y duración**, unidos por una trayectoria curva.
- **Recorridos de personajes** (andar, correr, hablar por teléfono) con velocidad y retardo.

### 🎬 Vista 3D
- **Cuatro estilos visuales**:

  | 🎞️ Cinematográfico | 🖍️ Cel-shading | ✏️ Boceto a mano | 📷 Realista |
  |:---:|:---:|:---:|:---:|
  | luz y sombras de cine | aspecto de cómic | trazo de lápiz | cielo real, sombras de contacto y desenfoque |

- **Hora del día**: día, atardecer o noche, con dirección del sol. La luz entra por las ventanas.
- **Vista libre** para recorrer el set y **arrastrar los puntos** de cámara y recorridos en 3D, también en altura.
- **Vídeo de referencia** superpuesto y sincronizado, para encajar tu cámara con un plano real mirando por el visor.

### 🗂️ Proyectos
- **Varias localizaciones** en un mismo proyecto.
- **💾 Guardar / 📂 Abrir** en un archivo `.previz.json` que incluye los modelos 3D importados.

---

## 🚀 Empezar en 1 minuto

1. Abre **[la app](https://thedevdad.github.io/previz-studio/)**.
2. En **Planta**, dibuja los muros y arrastra muebles desde el catálogo.
3. En **Cámara**, crea un plano y haz clic para colocar los puntos de la cámara.
4. Pasa a **3D** y pulsa ▶.
5. Guarda con **Ctrl+S**.

> 💡 **Consejo:** guarda tus proyectos en una carpeta de Google Drive, OneDrive o Dropbox para abrirlos desde cualquier equipo.

---

## ⌨️ Atajos

| Tecla | Acción |
|---|---|
| `Ctrl` + `S` | Guardar el proyecto |
| `Ctrl` + `Z` | Deshacer |
| `Supr` | Borrar lo seleccionado o un punto de cámara |
| `Espacio` | Reproducir o pausar (en 3D) |
| `↑ ↓ ← →` | Moverte por la vista libre 3D (`Mayús` para ir más rápido) |
| Rueda del ratón | Acercar o alejar |

---

## 🛠️ Cómo está hecho

- Proyecto **[Vite](https://vite.dev)** con el código separado en módulos dentro de `src/`.
- **[Three.js](https://threejs.org)** para el 3D, con `GLTFLoader` para los modelos importados.
- Los proyectos se guardan en **archivos tuyos** (`.previz.json`); la app empieza siempre vacía.
- Publicado con **GitHub Pages**. La versión anterior, de un solo archivo HTML, está en la etiqueta `v1-html`.

### Desarrollo

Necesitas [Node.js](https://nodejs.org) (versión LTS). En una terminal **PowerShell**, dentro de la carpeta del proyecto:

```
npm install
npm run dev
```

Abre la dirección que aparece (normalmente `http://localhost:5173`). Para generar la versión final en `dist/`:

```
npm run build
```

---

## ⚠️ Limitaciones conocidas

- La app empieza vacía cada vez: guarda tu proyecto en un archivo antes de cerrar (avisa si hay cambios sin guardar).
- Los **vídeos de referencia** no se incluyen en el archivo del proyecto.
- Los modelos comprimidos con **Draco** no se pueden importar.

---

## 🗺️ Próximamente

- [ ] Exportar el **storyboard** como imágenes
- [ ] Animaciones de escena: puertas que se abren, cámara en mano
- [ ] Trazados curvos para muros, calles y recorridos
- [ ] Exportar **vídeo** del recorrido de cámara

---

<div align="center">

Hecho con 🎬 para planificar cortos con cabeza.
**León Moulet López** · [@thedevdad](https://github.com/thedevdad)

</div>
