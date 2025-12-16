import React, { RefObject } from 'react';
import { Button } from '@/Components/ui/button';
import { RectangleGoggles, Palette, Layers2 } from 'lucide-react';

import { ProductSelector } from './ProductSelector';
import type { Product } from '../types';

interface SingleCameraViewProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  arEnabled: boolean;
  
  productGlassesList: Product[];
  productHatList: Product[];
  
  selectedGlassProduct: number | null;
  selectedHatProduct: number | null;
  
  showGlassList: boolean;
  showHatList: boolean;
  
  onToggleGlassList: () => void;
  onToggleHatList: () => void;
  
  onSelectGlassProduct: (index: number) => void;
  onSelectHatProduct: (index: number) => void;
  
  onToggleAR: () => void;
  onToggleCompare: () => void;
  
  showColorPicker: boolean;
  onToggleColorPicker: () => void;
}

export function SingleCameraView({
  videoRef,
  canvasRef,
  arEnabled,
  productGlassesList,
  productHatList,
  selectedGlassProduct,
  selectedHatProduct,
  showGlassList,
  showHatList,
  onToggleGlassList,
  onToggleHatList,
  onSelectGlassProduct,
  onSelectHatProduct,
  onToggleAR,
  onToggleCompare,
  showColorPicker,
  onToggleColorPicker,
}: SingleCameraViewProps) {
  return (
    <div className="relative w-full h-full flex items-center justify-center bg-black">
      <div className="absolute top-3 z-10 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 right-3">
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
        <p className="text-white">Model I</p>
      </div>

      <ProductSelector
        products={productGlassesList}
        selectedIndex={selectedGlassProduct}
        onSelect={onSelectGlassProduct}
        show={showGlassList}
        onToggle={onToggleGlassList}
        icon="glasses"
        position="right"
        topOffset="top-15"
      />

      <ProductSelector
        products={productHatList}
        selectedIndex={selectedHatProduct}
        onSelect={onSelectHatProduct}
        show={showHatList}
        onToggle={onToggleHatList}
        icon="hat"
        position="right"
        topOffset="top-72"
      />

      <div className="w-full max-w-[80%] max-h-[95%] border-0 rounded-2xl overflow-hidden shadow-2xl relative flex items-center justify-center">
        <video
          ref={videoRef}
          playsInline
          muted
          className="max-w-full max-h-full object-contain brightness-[1.15] contrast-[1.1] scale-x-[-1] block rounded-2xl"
        />
        {arEnabled && canvasRef && (
          <canvas
            ref={canvasRef}
            className="absolute max-w-full max-h-full object-contain pointer-events-none z-10 rounded-2xl"
          />
        )}
      </div>

      <div className="absolute top-20 left-4 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        <p className="text-white">Camera I</p>
      </div>

      <Button
        onClick={onToggleAR}
        title="Bật Model"
        className={`absolute size-12 top-40 left-10 p-4 rounded-full transition z-20 ${
          arEnabled 
            ? 'bg-indigo-500/80 ring-4 ring-indigo-500/30' 
            : 'bg-orange-600/60 ring-4 ring-orange-600/30'
        }`}
      >
        <RectangleGoggles className="size-6 text-white" />
      </Button>

      <Button
        onClick={onToggleCompare}
        className="absolute size-12 top-60 left-10 p-4 rounded-full bg-indigo-500/80 ring-4 ring-indigo-500/30 hover:bg-indigo-700 shadow-2xl"
        title="Bật chế độ so sánh (2 camera)"
      >
        <Layers2 className="size-6 text-white" />
      </Button>

      <Button
        onClick={onToggleColorPicker}
        title="Config Color Try-On"
        className={`absolute size-12 top-80 left-10 p-4 rounded-full no-dismiss-color transition z-20 ${
          showColorPicker 
            ? 'bg-indigo-500/80 ring-4 ring-indigo-500/30' 
            : 'bg-amber-500/60 ring-4 ring-amber-300/30'
        }`}
      >
        <Palette className="size-6" />
      </Button>
    </div>
  );
}
