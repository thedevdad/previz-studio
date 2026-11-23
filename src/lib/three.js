// Three.js con los complementos que usa la app, en un solo objeto.
import * as core from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { Sky } from 'three/addons/objects/Sky.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

// Misma respuesta de color que el motor anterior: sin gestión de color y salida lineal.
core.ColorManagement.enabled = false;

export const THREE = { ...core, GLTFLoader, SkeletonUtils, Sky, TransformControls, OrbitControls, EffectComposer, RenderPass, GTAOPass, UnrealBloomPass, BokehPass, OutputPass };
