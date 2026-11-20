// Three.js con los complementos que usa la app, en un solo objeto.
import * as core from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';

// Misma respuesta de color que el motor anterior: sin gestión de color y salida lineal.
core.ColorManagement.enabled = false;

export const THREE = { ...core, GLTFLoader, SkeletonUtils };
