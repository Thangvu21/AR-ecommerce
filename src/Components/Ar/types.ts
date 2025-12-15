export interface Product {
  _id: string;
  name: string;
  type: string;
  url: string;
  thumbnailUrl: string;
  metadata?: {
    eyeDistanceDivisor?: number;
    initAdjustPosition?: { x: number; y: number; z: number };
    initAdjustRotation?: { x: number; y: number; z: number };
  };
}

export interface CameraState {
  camerasReady: boolean;
  error: string | null;
  cameraIIEnabled: boolean;
}

export interface ARControlState {
  arEnabledI: boolean;
  arEnabledII: boolean;
  selectedGlassProductI: number | null;
  selectedGlassProductII: number | null;
  selectedHatProductI: number | null;
  selectedHatProductII: number | null;
}

export interface UIState {
  swapLayout: boolean;
  showSettings: boolean;
  slidersOpen: boolean;
  showColorPickerI: boolean;
  showColorPickerII: boolean;
  showGlassListI: boolean;
  showGlassListII: boolean;
  showHatListI: boolean;
  showHatListII: boolean;
}

export interface ARSettings {
  scale: number;
  offsetX: number;
  offsetY: number;
  opacity: number;
  colorI: string;
  colorII: string;
}
