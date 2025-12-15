"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-converter';
import '@tensorflow/tfjs-backend-webgl';

import { MyColorPickerComponent } from "./color";
import { useCameraManager } from './hooks/useCameraManager';
import { useProductManager } from './hooks/useProductManager';
import { useARControls } from './hooks/useARControls';
import { DualCameraView } from './components/DualCameraView';
import { SingleCameraView } from './components/SingleCameraView';
import { ControlPanel } from './components/ControlPanel';
import { ARSettingsSliders } from './components/ARSettingsSliders';
import { SettingsPanel } from './components/SettingsPanel';
import { LoadingScreen, ErrorScreen } from './components/LoadingAndError';
import type { ARSettings } from './types';

export default function Page() {
  const router = useRouter();
  const arContainerRef = useRef<HTMLDivElement | null>(null);

  const [cameraIIEnabled, setCameraIIEnabled] = useState(false);
  const [swapLayout, setSwapLayout] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [slidersOpen, setSlidersOpen] = useState(false);

  const [showColorPickerI, setShowColorPickerI] = useState(false);
  const [showColorPickerII, setShowColorPickerII] = useState(false);

  const [showGlassListI, setShowGlassListI] = useState(false);
  const [showGlassListII, setShowGlassListII] = useState(false);
  const [showHatListI, setShowHatListI] = useState(false);
  const [showHatListII, setShowHatListII] = useState(false);

  const [arSettings, setArSettings] = useState<ARSettings>({
    scale: 180,
    offsetX: 50,
    offsetY: 50,
    opacity: 100,
    colorI: "#aabbcc",
    colorII: "#aabbcc",
  });

  const { videoIRef, videoIIRef, camerasReady, error, startCameras, stopStreams } = 
    useCameraManager(cameraIIEnabled);
  
  const { productGlassesList, productHatList } = useProductManager();
  
  const {
    arEnabledI,
    arEnabledII,
    selectedGlassProductI,
    selectedGlassProductII,
    selectedHatProductI,
    selectedHatProductII,
    canvasRefI,
    canvasRefII,
    handleSelectedGlassProductI,
    handleSelectedGlassProductII,
    handleSelectedHatProductI,
    handleSelectedHatProductII,
    toggleARI,
    toggleARII,
    resetAR,
  } = useARControls(productGlassesList, productHatList);

  const handleBackButton = () => {
    router.replace('/');
    stopStreams();
  };

  const handleCompareButton = () => {
    setCameraIIEnabled(!cameraIIEnabled);
    resetAR();
    setShowColorPickerI(false);
    setShowColorPickerII(false);
  };

  const updateARSettings = (updates: Partial<ARSettings>) => {
    setArSettings(prev => ({ ...prev, ...updates }));
  };

  useEffect(() => {
    return () => {
      tf.disposeVariables();
    };
  }, []);

  useEffect(() => {
    const handler = (e: PointerEvent) => {
      const target = e.target as Node;
      if (!arContainerRef.current) return;
      if (!arContainerRef.current.contains(target) && 
          !(target instanceof Element && target.closest('.no-dismiss'))) {
        setShowSettings(false);
        setSlidersOpen(false);
      }
    };

    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, [showSettings, slidersOpen]);

  return (
    <>
      <div className="relative w-full h-screen bg-black overflow-hidden">
        <MyColorPickerComponent
          color={arSettings.colorI}
          setColor={(color) => updateARSettings({ colorI: color })}
          showColorPicker={showColorPickerI}
          setShowColorPicker={setShowColorPickerI}
          name="Model I"
        />
        <MyColorPickerComponent
          color={arSettings.colorII}
          setColor={(color) => updateARSettings({ colorII: color })}
          showColorPicker={showColorPickerII}
          setShowColorPicker={setShowColorPickerII}
          name="Model II"
        />
        
        <div className="relative w-full h-full flex items-center justify-center p-4">
          <div
            className={`
              w-full bg-black h-full rounded-3xl overflow-hidden shadow-2xl
              transition-all duration-500 ease-out
              ${cameraIIEnabled
                ? "h-full max-w-5xl"
                : "h-[80vh] max-h-screen aspect-video"
              }
            `}
          >
            {cameraIIEnabled ? (
              <DualCameraView
                videoIRef={videoIRef}
                videoIIRef={videoIIRef}
                canvasRefI={canvasRefI}
                canvasRefII={canvasRefII}
                arEnabledI={arEnabledI}
                arEnabledII={arEnabledII}
                swapLayout={swapLayout}
                productGlassesList={productGlassesList}
                productHatList={productHatList}
                selectedGlassProductI={selectedGlassProductI}
                selectedGlassProductII={selectedGlassProductII}
                selectedHatProductI={selectedHatProductI}
                selectedHatProductII={selectedHatProductII}
                showGlassListI={showGlassListI}
                showGlassListII={showGlassListII}
                showHatListI={showHatListI}
                showHatListII={showHatListII}
                onToggleGlassListI={() => setShowGlassListI(v => !v)}
                onToggleGlassListII={() => setShowGlassListII(v => !v)}
                onToggleHatListI={() => setShowHatListI(v => !v)}
                onToggleHatListII={() => setShowHatListII(v => !v)}
                onSelectGlassProductI={handleSelectedGlassProductI}
                onSelectGlassProductII={handleSelectedGlassProductII}
                onSelectHatProductI={handleSelectedHatProductI}
                onSelectHatProductII={handleSelectedHatProductII}
                onToggleARI={toggleARI}
                onToggleARII={toggleARII}
                showColorPickerI={showColorPickerI}
                showColorPickerII={showColorPickerII}
                onToggleColorPickerI={() => setShowColorPickerI(v => !v)}
                onToggleColorPickerII={() => setShowColorPickerII(v => !v)}
              />
            ) : (
              <SingleCameraView
                videoRef={videoIRef}
                canvasRef={canvasRefI}
                arEnabled={arEnabledI}
                productGlassesList={productGlassesList}
                productHatList={productHatList}
                selectedGlassProduct={selectedGlassProductI}
                selectedHatProduct={selectedHatProductI}
                showGlassList={showGlassListI}
                showHatList={showHatListI}
                onToggleGlassList={() => setShowGlassListI(v => !v)}
                onToggleHatList={() => setShowHatListI(v => !v)}
                onSelectGlassProduct={handleSelectedGlassProductI}
                onSelectHatProduct={handleSelectedHatProductI}
                onToggleAR={toggleARI}
                onToggleCompare={handleCompareButton}
                showColorPicker={showColorPickerI}
                onToggleColorPicker={() => setShowColorPickerI(v => !v)}
              />
            )}
          </div>
        </div>

        <ControlPanel
          onBack={handleBackButton}
          onSwapLayout={() => setSwapLayout(v => !v)}
          onToggleSliders={() => setSlidersOpen(v => !v)}
          onToggleSettings={() => setShowSettings(v => !v)}
          slidersOpen={slidersOpen}
          settingsOpen={showSettings}
        />

        <ARSettingsSliders
          settings={arSettings}
          onSettingsChange={updateARSettings}
          show={slidersOpen}
        />

        <SettingsPanel
          show={showSettings}
          onClose={() => setShowSettings(false)}
          cameraIIEnabled={cameraIIEnabled}
          onToggleCompare={handleCompareButton}
          onRefreshCamera={startCameras}
        />

        <LoadingScreen show={!camerasReady && !error} />
        <ErrorScreen error={error} onRetry={startCameras} />
      </div>
    </>
  );
}
