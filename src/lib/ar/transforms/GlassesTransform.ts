import * as THREE from 'three';
import type { ITransformCalculator } from './ITransformCalculator';
import type { FaceLandmarks, ARSettings, ARTransform, VideoSize } from '../types';
import { KEYPOINT_INDICES, DEFAULT_AR_SETTINGS } from '../types';

export class GlassesTransform implements ITransformCalculator {
  calculate(
    landmarks: FaceLandmarks,
    settings: ARSettings,
    videoSize: VideoSize
  ): ARTransform {
    const mesh = landmarks.scaledMesh;

    const leftEye = mesh[KEYPOINT_INDICES.LEFT_EYE];
    const rightEye = mesh[KEYPOINT_INDICES.RIGHT_EYE];
    const eyeCenter = mesh[KEYPOINT_INDICES.EYE_CENTER];

    const eyeDistance = Math.sqrt(
      Math.pow(rightEye[0] - leftEye[0], 2) + Math.pow(rightEye[1] - leftEye[1], 2)
    );

    const baseScale = eyeDistance / 140;
    const userScale = settings.scale / DEFAULT_AR_SETTINGS.scale;
    const finalScale = baseScale * userScale;

    const offsetX = ((settings.offsetX - 50) / 50) * 0.5;
    const offsetY = ((settings.offsetY - 50) / 50) * 0.5;

    const posX = (eyeCenter[0] - videoSize.width / 2) * -0.01 + offsetX;
    const posY = (eyeCenter[1] - videoSize.height / 2) * -0.01 + offsetY;
    const posZ = 1;

    const eyeLine = new THREE.Vector2(rightEye[0] - leftEye[0], rightEye[1] - leftEye[1]);
    const rotationZ = Math.atan2(eyeLine.y, eyeLine.x);

    return {
      position: { x: posX, y: posY, z: posZ },
      rotation: { x: 0, y: 0, z: rotationZ },
      scale: { x: finalScale, y: finalScale, z: finalScale },
    };
  }
}
