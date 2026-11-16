<div align="center">

# 🎬 Previz Studio

**Planifica tus planos antes de rodar.**
Dibuja la planta del set, coloca cámaras y personajes, y mira la secuencia en 3D, todo desde el navegador.

[![Abrir la app](https://img.shields.io/badge/▶_Abrir_la_app-thedevdad.github.io-e8590c?style=for-the-badge)](https://thedevdad.github.io/previz-studio/)

![HTML](https://img.shields.io/badge/un_solo_archivo-HTML-f4a261?style=flat-square)
![Three.js](https://img.shields.io/badge/3D-Three.js_r128-1b1d21?style=flat-square)
![Sin instalación](https://img.shields.io/badge/sin_instalación-navegador-2f7d4f?style=flat-square)
![Idioma](https://img.shields.io/badge/interfaz-español-d62828?style=flat-square)

</div>

---

## ✨ ¿Qué es?

**Previz Studio** es una herramienta de previsualización (*previz*) pensada para cortometrajes y guiones. En lugar de imaginar un plano, lo montas: paredes, muebles, coches, personas, la cámara y su recorrido. Después lo reproduces en 3D para ver exactamente qué va a ver el objetivo.

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
- **Mis modelos 3D**: importa tus propios `.glb` o carpetas `.gltf` con texturas, de [Poly Haven](https://polyhaven.com), [Quaternius](https://quaternius.com) o [Kenney](https://kenney.nl).

### 🎥 Cámara
- Varios **planos por localización**, también fijos, ideales para storyboard.
- Puntos de cámara con **posición, altura, objetivo, lente y duración**, unidos por una trayectoria curva.
- **Recorridos de personajes** (andar, correr, hablar por teléfono) con velocidad y retardo.

### 🎬 Vista 3D
- **Tres estilos visuales**:

  | 🎞️ Cinematográfico | 🖍️ Cel-shading | ✏️ Boceto a mano |
  |:---:|:---:|:---:|
  | luz realista y sombras | aspecto de cómic | trazo de lápiz |

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

- **Un único archivo `index.html`**: HTML, CSS y JavaScript sin dependencias que instalar ni servidor.
- **[Three.js r128](https://threejs.org)** para el 3D, con `GLTFLoader` para los modelos importados.
- Lo que tienes abierto se guarda en el **almacenamiento del navegador**; los proyectos, en **archivos tuyos**.
- Publicado con **GitHub Pages**.

---

## ⚠️ Limitaciones conocidas

- El trabajo sin guardar vive en el navegador donde lo hiciste. Guarda el proyecto en un archivo para llevarlo a otro equipo.
- Los **vídeos de referencia** no se incluyen en el archivo del proyecto.
- Los modelos comprimidos con **Draco** no se pueden importar.
- **📜 Desde guion** (generar una planta a partir de una escena) solo funciona en la versión de claude.ai.

---

## 🗺️ Próximamente

- [ ] Estilo **Realista** (iluminación de cine y desenfoque de profundidad)
- [ ] Exportar el **storyboard** como imágenes
- [ ] Animaciones de escena: puertas que se abren, cámara en mano
- [ ] Trazados curvos para muros, calles y recorridos
- [ ] Exportar **vídeo** del recorrido de cámara

---

<div align="center">

Hecho con 🎬 para planificar cortos con cabeza.
**León Moulet López** · [@thedevdad](https://github.com/thedevdad)

</div>
