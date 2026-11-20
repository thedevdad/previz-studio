// Three.js con los complementos que usa la app, en un solo objeto.
import * as core from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { SkeletonUtils } from 'three/examples/jsm/utils/SkeletonUtils.js';

export const THREE = { ...core, GLTFLoader, SkeletonUtils };
