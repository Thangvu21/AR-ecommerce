import type { FaceLandmarks, ARSettings, ARTransform, VideoSize } from '../types';

export interface ITransformCalculator {
  calculate(
    landmarks: FaceLandmarks,
    settings: ARSettings,
    videoSize: VideoSize
  ): ARTransform;
}
