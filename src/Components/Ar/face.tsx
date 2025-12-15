"use client";
import React, { useEffect, useRef, useState, useCallback, use } from "react";
import { useParams, useRouter } from "next/navigation";
import { Settings, Palette, FlipHorizontal, X, Settings2, RectangleGoggles, Layers2, Glasses, HardHat } from 'lucide-react';
import { Button } from "../ui/button";
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-converter';
import '@tensorflow/tfjs-backend-webgl';
import { useAREngine } from '@/hooks/useAREngine';
import type { ARProduct } from '@/lib/ar';
import { ar, ca } from "date-fns/locale";
import { ARObjectType } from "@/lib/ar/types";
import { prod } from "@tensorflow/tfjs-core";
import { MyColorPickerComponent } from "./color"
interface Product {
  _id: string;
  name: string;
  type: string;
  url: string;
  thumbnailUrl: string;
}


export default function Page() {
  const router = useRouter();

  const videoIIRef = useRef<HTMLVideoElement>(null);
  const videoIRef = useRef<HTMLVideoElement>(null);
  const arContainerRef = useRef<HTMLDivElement | null>(null);
  const { state, start, stop, setProduct } = useAREngine();
  const [productGlassesList, setProductGlassesList] = useState<Product[]>([]);
  const [productHatList, setProductHatList] = useState<Product[]>([]);
  const prefetchGlassesMapRef = useRef<Map<string, Promise<void>>>(new Map());
  const prefetchHatMapRef = useRef<Map<string, Promise<void>>>(new Map());
  const prefetchMapRef = useRef<Map<string, Promise<void>>>(new Map());

  const canvasRefI = useRef<any>(null);
  const canvasRefII = useRef<any>(null);
  // 4 canvas cho 2 sản phẩm
  const canvasGlassesRefI = useRef<any>(null);
  const canvasGlassesRefII = useRef<any>(null);
  const canvasHatRefI = useRef<any>(null);
  const canvasHatRefII = useRef<any>(null);

  const [camerasReady, setCamerasReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [CameraIIEnabled, setCameraIIEnabled] = useState(false);
  const [swapLayout, setSwapLayout] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Try-on state
  // Sửa lại 2 sản phẩm ID
  const [selectedGlassProductI, setSelectedGlassProductI] = useState<number | null>(null);
  const [selectedGlassProductII, setSelectedGlassProductII] = useState<number | null>(null);
  const [selectedHatProductI, setSelectedHatProductI] = useState<number | null>(null);
  const [selectedHatProductII, setSelectedHatProductII] = useState<number | null>(null);

  const arProductSelectedI = useRef<ARProduct | null>(null);
  const arProductSelectedII = useRef<ARProduct | null>(null);
  // San phẩm đang chọn
  const arProductGlassSelectedI = useRef<ARProduct | null>(null);
  const arProductGlassSelectedII = useRef<ARProduct | null>(null);
  const arProductHatSelectedI = useRef<ARProduct | null>(null);
  const arProductHatSelectedII = useRef<ARProduct | null>(null);

  const [arEnabledI, setArEnabledI] = useState(false);
  const [arEnabledII, setArEnabledII] = useState(false);

  const [slidersOpen, setSlidersOpen] = useState(false);

  const [colorI, setColorI] = useState("#aabbcc");
  const [colorII, setColorII] = useState("#aabbcc");

  const [showColorPickerI, setShowColorPickerI] = useState(false);
  const [showColorPickerII, setShowColorPickerII] = useState(false);

  const [showGlassListI, setShowGlassListI] = useState(false);
  const [showGlassListII, setShowGlassListII] = useState(false);
  const [showHatListI, setShowHatListI] = useState(false);
  const [showHatListII, setShowHatListII] = useState(false);
  // Nếu có 2 camera:

  // Điều chỉnh overlay
  const [scale, setScale] = useState(180);
  const [offsetX, setOffsetX] = useState(50);
  const [offsetY, setOffsetY] = useState(50);
  const [opacity, setOpacity] = useState(100);

  const handleSelectedGlassProductI = (index: number) => {
    const arProduct: ARProduct = {
      id: productGlassesList[index]._id,
      type: productGlassesList[index].type as ARObjectType,
      modelUrl: productGlassesList[index].url,
      overlayUrl: productGlassesList[index].thumbnailUrl,
    };
    setProduct(arProduct);
    setSelectedGlassProductI(index);
    arProductGlassSelectedI.current = arProduct;
    if (!arEnabledI) setArEnabledI(true);
  }

  const handleSelectedGlassProductII = (index: number) => {
    const arProduct: ARProduct = {
      id: productGlassesList[index]._id,
      type: productGlassesList[index].type as ARObjectType,
      modelUrl: productGlassesList[index].url,
      overlayUrl: productGlassesList[index].thumbnailUrl,
    };
    setProduct(arProduct);
    setSelectedGlassProductII(index);
    arProductGlassSelectedII.current = arProduct;
    if (!arEnabledII) setArEnabledII(true);
  }

  const handleSelectedHatProductI = (index: number) => {
    const arProduct: ARProduct = {
      id: productHatList[index]._id,
      type: productHatList[index].type as ARObjectType,
      modelUrl: productHatList[index].url,
      overlayUrl: productHatList[index].thumbnailUrl,
    };
    setProduct(arProduct);
    setSelectedHatProductI(index);
    arProductHatSelectedI.current = arProduct;
    if (!arEnabledI) setArEnabledI(true);
  }

  const handleSelectedHatProductII = (index: number) => {
    const arProduct: ARProduct = {
      id: productHatList[index]._id,
      type: productHatList[index].type as ARObjectType,
      modelUrl: productHatList[index].url,
      overlayUrl: productHatList[index].thumbnailUrl,
    };
    setProduct(arProduct);
    setSelectedHatProductII(index);
    arProductHatSelectedII.current = arProduct;
    if (!arEnabledII) setArEnabledII(true);
  }

  const handleButtonARI = () => {
    if (arEnabledI) {
      setArEnabledI(false);
      // setSelectedProductI(null);
      setSelectedGlassProductI(null);
      setSelectedHatProductI(null);
    } else {
      setArEnabledI(true);
      handleSelectedGlassProductI(0);
    }
  };

  const handleButtonARII = () => {
    if (arEnabledII) {
      setArEnabledII(false);
      // setSelectedProductII(null);
      setSelectedGlassProductII(null);
      setSelectedHatProductII(null);
    } else {
      setArEnabledII(true);
      if (productGlassesList.length > 0) {
        setSelectedGlassProductII(0);
      } else {
        setSelectedGlassProductII(null);
      }
    }
  };

  const handleBackButton = () => {
    router.replace('/');
    stopStreams();
  }

  const handleCompareButton = () => {
    setCameraIIEnabled(!CameraIIEnabled);
    setArEnabledI(false);
    setArEnabledII(false);
    setShowColorPickerI(false);
    setShowColorPickerII(false);
    setSelectedGlassProductI(null);
    setSelectedGlassProductII(null);
    setSelectedHatProductI(null);
    setSelectedHatProductII(null);
  };

  const startCameras = async () => {
    try {
      const [IIStream, IStream] = await Promise.all([
        navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false
        }),
        navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false
        }),
      ]);

      if (videoIIRef.current && CameraIIEnabled) {
        videoIIRef.current.srcObject = IIStream;
        videoIIRef.current.onloadedmetadata = async () => {
          await videoIIRef.current?.play();
        };
      }

      if (videoIRef.current) {
        videoIRef.current.srcObject = IStream;
        videoIRef.current.onloadedmetadata = async () => {
          await videoIRef.current?.play();
        };
      }

      setCamerasReady(true);
    } catch (err: any) {
      let msg = "Không thể mở camera";
      if (err.name === "NotAllowedError") msg = "Bạn chưa cấp quyền camera";
      else if (err.name === "OverconstrainedError") msg = "Thiết bị không hỗ trợ mở đồng thời 2 camera";
      setError(msg);
    }
  };

  const stopStreams = () => {
    console.log("Stopping streams...");
    [videoIIRef, videoIRef].forEach(ref => {
      if (ref.current?.srcObject) {
        (ref.current.srcObject as MediaStream)
          .getTracks()
          .forEach(t => t.stop());
        ref.current.srcObject = null;
      }
    });
  };

  useEffect(() => {
    const fetchGlassesDB = async () => {
      try {
        const response = await fetch('/api/models?type=glasses', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const result = await response.json();
        console.log("Fetch result:", result);
        if (result.success) {
          const list_item = [];
          for (const item of result.data) {
            const product: Product = {
              _id: item._id,
              name: item.name,
              type: item.type,
              url: item.url,
              thumbnailUrl: item.thumbnailUrl,
            };
            list_item.push(product);
          }
          setProductGlassesList(list_item);

          // Prefetch thumbnails + model blobs (warm browser cache) once
          for (const p of list_item) {
            if (p.thumbnailUrl && !prefetchGlassesMapRef.current.has(p.thumbnailUrl)) {
              const pr = new Promise<void>((res) => { const img = new Image(); img.src = p.thumbnailUrl; img.onload = () => res(); img.onerror = () => res(); });
              prefetchGlassesMapRef.current.set(p.thumbnailUrl, pr);
            }
            if (p.url && !prefetchGlassesMapRef.current.has(p.url)) {
              const pr = fetch(p.url, { method: 'GET', cache: 'force-cache', mode: 'cors' })
                .then(() => { }).catch(() => { });
              prefetchGlassesMapRef.current.set(p.url, pr);
            }
          }
        }
      } catch (error) {
        // handle error
      }
    };

    const fetchHatDB = async () => {
      try {
        const response = await fetch('/api/models?type=hat', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const result = await response.json();
        console.log("Fetch result:", result);
        if (result.success) {
          const list_item = [];
          for (const item of result.data) {
            const product: Product = {
              _id: item._id,
              name: item.name,
              type: item.type,
              url: item.url,
              thumbnailUrl: item.thumbnailUrl,
            };
            list_item.push(product);
          }
          setProductHatList(list_item);
          // console.log("Hat list:", list_item);
          for (const p of list_item) {
            if (p.thumbnailUrl && !prefetchHatMapRef.current.has(p.thumbnailUrl)) {
              const pr = new Promise<void>((res) => { const img = new Image(); img.src = p.thumbnailUrl; img.onload = () => res(); img.onerror = () => res(); });
              prefetchHatMapRef.current.set(p.thumbnailUrl, pr);
            }
            if (p.url && !prefetchHatMapRef.current.has(p.url)) {
              const pr = fetch(p.url, { method: 'GET', cache: 'force-cache', mode: 'cors' })
                .then(() => { }).catch(() => { });
              prefetchHatMapRef.current.set(p.url, pr);
            }
          }
        }
      } catch (error) {
        // handle error
      }
    };

    fetchGlassesDB();
    fetchHatDB();
    return () => {
      tf.disposeVariables();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const tryStart = async () => {
      if (!arEnabledI) return;

      const maxAttempts = 30;
      let attempts = 0;

      while (!cancelled && attempts < maxAttempts) {
        const canvas = canvasRefI.current as HTMLCanvasElement | null;
        const video = videoIRef.current;

        if (video && canvas instanceof HTMLCanvasElement) {
          console.log('Start AR Engine for Camera I', canvas, video, arProductSelectedI.current);
          try {
            await start(video, canvas);
          } catch (err) {
            console.error('Failed to start AR engine:', err);
          }
          return;
        }

        attempts++;
        // wait for next frame so DOM can mount the canvas
        await new Promise((res) => requestAnimationFrame(res));
      }

      if (!cancelled) console.warn('Canvas for AR did not become available in time.');
    };

    tryStart();

    return () => {
      cancelled = true;
    };
  }, [arEnabledI, start]);

  // Xử lý các trường hợp 1-2 camera
  useEffect(() => {
    startCameras();
    return () => stopStreams();
  }, [CameraIIEnabled]);

  // Chỏ con chuột ra bên ngoài tắt settings
  useEffect(() => {
    const handler = (e: PointerEvent) => {
      const target = e.target as Node;
      if (!arContainerRef.current) return;
      if (!arContainerRef.current.contains(target) && !(target instanceof Element && target.closest('.no-dismiss'))) {
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
        {/* Layout chính - 2 camera */}
        {/* <div style={{ position: 'absolute', bottom: 10, left: 10, background: 'rgba(0,0,0,0.5)', color: 'white', padding: 8, zIndex: 100 }}>
          <div>Video Ready: {ca ? 'Yes' : 'No'}</div>
          <div>Model Loaded: {state.isModelLoaded ? 'Yes' : 'No'}</div>
          <div>Detecting: {state.isDetecting ? 'Yes' : 'No'}</div>
          <div>Face: {state.faceDetected ? 'Detected' : 'Not found'}</div>
          <div>FPS: {state.fps}</div>
        </div> */}
        <MyColorPickerComponent
          color={colorI}
          setColor={setColorI}
          showColorPicker={showColorPickerI}
          setShowColorPicker={setShowColorPickerI}
          name="Model I"
        />
        <MyColorPickerComponent
          color={colorII}
          setColor={setColorII}
          showColorPicker={showColorPickerII}
          setShowColorPicker={setShowColorPickerII}
          name="Model II"
        />
        <div className="relative w-full h-full flex items-center justify-center p-4">
          <div
            className={`
             w-full bg-black h-full rounded-3xl overflow-hidden shadow-2xl
            transition-all duration-500 ease-out
            ${CameraIIEnabled
                ? "h-full max-w-5xl"
                : "h-[80vh] max-h-screen aspect-video"
              }
          `}
          >
            {/* Khi có 2 camera → chia đôi */}
            {CameraIIEnabled ? (
              <>
                <div className={`absolute top-5 z-10 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${swapLayout ? 'right-3' : 'left-0'}`}>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <p className="text-white">Model I</p>
                </div>

                {/* Product List cho Model I */}
                <div className={`absolute top-20 z-20 ${swapLayout ? 'right-6' : 'left-6'}`}>
                  <Button
                    onClick={() => setShowGlassListI((v) => !v)}
                    className="w-16 h-16 rounded-xl shadow-lg flex items-center justify-center bg-amber-700/70 hover:bg-amber-400 text-white"
                    title="Chọn sản phẩm"
                  >
                    <Glasses className="size-6" />
                  </Button>

                  {/* Danh sách xổ xuống */}
                  {showGlassListI && (
                    <div className={`absolute mt-3 top-full ${swapLayout ? 'right-[-6]' : 'left-[-6]'} bg-black/90 rounded-2xl p-2 shadow-2xl flex flex-col gap-2 max-h-36 overflow-y-auto z-30 scrollbar-hide`}>
                      {productGlassesList.map((p, idx) => (
                        <Button
                          key={idx}
                          type="button"

                          onClick={() => {
                            handleSelectedGlassProductI(idx);
                          }}
                          className={`w-16 h-16 p-0 rounded-xl overflow-hidden shadow-lg flex items-center justify-center transition-transform ${selectedGlassProductI === idx ? 'ring-2 ring-indigo-400 scale-105' : 'hover:scale-105'}`}
                          title={p.thumbnailUrl || p.name || ''}
                        >
                          <img src={p.thumbnailUrl || p.name || ''} alt={p.name || ''} className="w-full h-full object-cover block" />
                        </Button>
                      ))}
                    </div>
                  )}
                </div>

                <div className={`absolute top-82 z-20 ${swapLayout ? 'right-6' : 'left-6'}`}>
                  <Button
                    onClick={() => setShowHatListI((v) => !v)}
                    className="w-16 h-16 rounded-xl shadow-lg flex items-center justify-center bg-amber-700/70 hover:bg-amber-400 text-white"
                    title="Chọn sản phẩm"
                  >
                    <HardHat className="size-6" />
                  </Button>

                  {/* Danh sách xổ xuống */}
                  {showHatListI && (
                    <div className={`absolute mt-2 top-full ${swapLayout ? 'right-[-6]' : 'left-[-6]'} bg-black/90 rounded-2xl p-2 shadow-2xl flex flex-col gap-2 max-h-36 overflow-y-auto z-30 scrollbar-hide`}>
                      {productHatList.map((p, idx) => (
                        <Button
                          key={idx}
                          type="button"

                          onClick={() => {
                            handleSelectedHatProductI(idx);
                          }}
                          className={`w-16 h-16 p-0 rounded-xl overflow-hidden shadow-lg flex items-center justify-center transition-transform ${selectedHatProductI === idx ? 'ring-2 ring-indigo-400 scale-105' : 'hover:scale-105'}`}
                          title={p.thumbnailUrl || p.name || ''}
                        >
                          <img src={p.thumbnailUrl || p.name || ''} alt={p.name || ''} className="w-full h-full object-cover block" />
                        </Button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tag cho Model II (Camera Sau) */}
                <div className={`absolute top-5 z-10 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${swapLayout ? 'left-0' : 'right-3'}`}>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <p className="text-white">Model II</p>
                </div>

                {/* Product List cho Model II */}
                <div className={`absolute top-20 z-20 ${swapLayout ? 'left-6' : 'right-6'}`}>
                  <Button
                    onClick={() => setShowGlassListII((v) => !v)}
                    className="w-16 h-16 rounded-xl shadow-lg flex items-center justify-center bg-amber-700/70 hover:bg-amber-400 text-white"
                    title="Chọn sản phẩm"
                  >
                    <Glasses className="size-6" />
                  </Button>

                  {/* Danh sách xổ xuống */}
                  {showGlassListII && (
                    <div className={`absolute mt-3 top-full ${swapLayout ? 'left-[-6]' : 'right-[-6]'} bg-black/90 rounded-2xl p-2 shadow-2xl flex flex-col gap-2 max-h-36 overflow-y-auto z-30 scrollbar-hide`}>
                      {productGlassesList.map((p, idx) => (
                        <Button
                          key={idx}
                          type="button"

                          onClick={() => {
                            handleSelectedGlassProductII(idx);
                          }}
                          className={`w-16 h-16 p-0 rounded-xl overflow-hidden shadow-lg flex items-center justify-center transition-transform ${selectedGlassProductII === idx ? 'ring-2 ring-indigo-400 scale-105' : 'hover:scale-105'}`}
                          title={p.thumbnailUrl || p.name || ''}
                        >
                          <img src={p.thumbnailUrl || p.name || ''} alt={p.name || ''} className="w-full h-full object-cover block" />
                        </Button>
                      ))}
                    </div>
                  )}
                </div>

                <div className={`absolute top-82 z-20 ${swapLayout ? 'left-6' : 'right-6'}`}>
                  <Button
                    onClick={() => setShowHatListII((v) => !v)}
                    className="w-16 h-16 rounded-xl shadow-lg flex items-center justify-center bg-amber-700/70 hover:bg-amber-400 text-white"
                    title="Chọn sản phẩm"
                  >
                    <HardHat className="size-6" />
                  </Button>

                  {/* Danh sách xổ xuống */}
                  {showHatListII && (
                    <div className={`absolute mt-2 top-full ${swapLayout ? 'left-[-6]' : 'right-[-6]'} bg-black/90 rounded-2xl p-2 shadow-2xl flex flex-col gap-2 max-h-36 overflow-y-auto z-30 scrollbar-hide`}>
                      {productHatList.map((p, idx) => (
                        <Button
                          key={idx}
                          type="button"

                          onClick={() => {
                            handleSelectedHatProductII(idx);
                          }}
                          className={`w-16 h-16 p-0 rounded-xl overflow-hidden shadow-lg flex items-center justify-center transition-transform ${selectedHatProductII === idx ? 'ring-2 ring-indigo-400 scale-105' : 'hover:scale-105'}`}
                          title={p.thumbnailUrl || p.name || ''}
                        >
                          <img src={p.thumbnailUrl || p.name || ''} alt={p.name || ''} className="w-full h-full object-cover block" />
                        </Button>
                      ))}
                    </div>
                  )}
                </div>

                <div className={`flex flex-col h-full ${swapLayout ? 'md:flex-row-reverse' : 'md:flex-row'}`}>
                  {/* Camera sau */}
                  <div className="relative flex-1 px-0 md:px-1 lg:px-2 overflow-hidden rounded-2xl flex items-center justify-center">
                    <div className="w-full h-full max-w-full max-h-full aspect-square md:aspect-video">
                      <video
                        ref={videoIRef}
                        playsInline
                        muted
                        className="w-full h-full object-cover brightness-[1.15] contrast-[1.1] scale-x-[-1] block rounded-2xl"
                      />
                      {arEnabledI && canvasRefI && (
                        <canvas
                          ref={canvasRefI}
                          className="absolute top-0 left-0 w-full h-full pointer-events-none z-10"
                        />
                      )}
                    </div>
                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <p className="text-white">Camera I</p>
                    </div>
                    <Button
                      onClick={() => handleButtonARI()}
                      title="Bật Model I"
                      className={`absolute top-4 right-4 p-4 size-12 rounded-full transition z-20 ${arEnabledI ? 'bg-indigo-500/80 ring-4 ring-indigo-500/30' : 'bg-orange-600/60 ring-4 ring-orange-600/30'}`}
                    >
                      <RectangleGoggles className="size-6 text-white" />
                    </Button>
                    <Button
                      onClick={() => {
                        setShowColorPickerI(!showColorPickerI);
                      }}
                      title="Config Color Try-On"
                      className={`absolute top-4 right-20 p-4 size-12 rounded-full z-20 no-dismiss-color transition ${showColorPickerI ? 'bg-indigo-500/80 ring-4 ring-indigo-500/30' : 'bg-amber-500/60 ring-4 ring-amber-300/30'}`}>
                      <Palette className="size-6" />
                    </Button>
                  </div>

                  {/* Camera trước */}
                  <div className="relative flex-1 px-0 md:px-1 lg:px-2 overflow-hidden rounded-2xl flex items-center justify-center">
                    <div className="w-full h-full max-w-full max-h-full aspect-square md:aspect-video">
                      <video
                        ref={videoIIRef}
                        playsInline
                        muted
                        className="w-full h-full object-cover brightness-[1.2] scale-x-[-1] block rounded-2xl"
                      />
                      {arEnabledII && canvasRefII && (
                        <canvas
                          ref={canvasRefII}
                          className="absolute top-0 left-0 w-full h-full pointer-events-none z-10"
                        />
                      )}
                    </div>
                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                      <p className="text-white">Camera II</p>
                    </div>
                    <Button
                      onClick={() => handleButtonARII()}
                      title="Bật Model II"
                      className={`absolute size-12 top-4 right-4 p-4 rounded-full transition z-20 ${arEnabledII ? 'bg-indigo-500/80 ring-4 ring-indigo-500/30' : 'bg-orange-600/60 ring-4 ring-orange-600/30'}`}
                    >
                      <RectangleGoggles className="size-6 text-white" />
                    </Button>
                    <Button
                      onClick={() => {
                        setShowColorPickerII(!showColorPickerII);
                      }}
                      title="Config Color Try-On"
                      className={`absolute top-4 right-20 p-4 size-12 rounded-full z-20 no-dismiss-color transition ${showColorPickerII ? 'bg-indigo-500/80 ring-4 ring-indigo-500/30' : 'bg-amber-500/60 ring-4 ring-amber-300/30'}`}>
                      <Palette className="size-6" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              /* Khi chỉ còn 1 camera */
              <div className="relative w-full h-full flex items-center justify-center bg-black">
                <div className={`absolute top-3 z-10 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 right-3`}>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <p className="text-white">Model I</p>
                </div>
                {/* Product List cho Model I */}

                {/* Nút mở danh sách sản phẩm */}
                <div className={`absolute top-15 right-6 z-20`}>
                  <Button
                    onClick={() => setShowGlassListI((v) => !v)}
                    className="w-16 h-16 rounded-xl shadow-lg flex items-center justify-center bg-amber-700/70 hover:bg-amber-400 text-white"
                    title="Chọn sản phẩm"
                  >
                    <Glasses className="size-6" />
                  </Button>

                  {/* Danh sách xổ xuống */}
                  {showGlassListI && (
                    <div className="absolute mt-2 top-full right-[-7.5] bg-black/90 rounded-2xl p-2 shadow-2xl flex flex-col gap-2 max-h-36 overflow-y-auto z-30 scrollbar-hide">
                      {productGlassesList.map((p, idx) => (
                        <Button
                          key={idx}
                          type="button"

                          onClick={() => {
                            handleSelectedGlassProductI(idx);
                          }}
                          className={`w-16 h-16 p-0 rounded-xl overflow-hidden shadow-lg flex items-center justify-center transition-transform ${selectedGlassProductI === idx ? 'ring-2 ring-indigo-400 scale-105' : 'hover:scale-105'}`}
                          title={p.thumbnailUrl || p.name || ''}
                        >
                          <img src={p.thumbnailUrl || p.name || ''} alt={p.name || ''} className="w-full h-full object-cover block" />
                        </Button>
                      ))}
                    </div>
                  )}
                </div>

                <div className={`absolute top-72 right-6 z-20`}>
                  <Button
                    onClick={() => setShowHatListI((v) => !v)}
                    className="w-16 h-16 rounded-xl shadow-lg flex items-center justify-center bg-amber-700/70 hover:bg-amber-400 text-white"
                    title="Chọn sản phẩm"
                  >
                    <HardHat className="size-6" />
                  </Button>

                  {/* Danh sách xổ xuống */}
                  {showHatListI && (
                    <div className="absolute mt-2 top-full right-[-7.5] bg-black/90 rounded-2xl p-2 shadow-2xl flex flex-col gap-2 max-h-36 overflow-y-auto z-30 scrollbar-hide">
                      {productHatList.map((p, idx) => (
                        <Button
                          key={idx}
                          type="button"

                          onClick={() => {
                            handleSelectedHatProductI(idx);
                          }}
                          className={`w-16 h-16 p-0 rounded-xl overflow-hidden shadow-lg flex items-center justify-center transition-transform ${selectedHatProductI === idx ? 'ring-2 ring-indigo-400 scale-105' : 'hover:scale-105'}`}
                          title={p.thumbnailUrl || p.name || ''}
                        >
                          <img src={p.thumbnailUrl || p.name || ''} alt={p.name || ''} className="w-full h-full object-cover block" />
                        </Button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="w-full max-w-[80%] max-h-[95%] border-0 rounded-2xl overflow-hidden shadow-2xl relative">
                  <video
                    ref={videoIRef}
                    playsInline
                    muted
                    className="w-full h-full object-contain brightness-[1.15] contrast-[1.1] scale-x-[-1] block rounded-2xl"
                  />
                  {arEnabledI && canvasRefI && (
                    <canvas
                      ref={canvasRefI}
                      className="absolute top-10 left-2 w-full h-full pointer-events-none z-10"
                    />
                  )}
                </div>

                <div className="absolute top-20 left-4 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <p className="text-white">Camera I</p>
                </div>
                <Button
                  onClick={() => handleButtonARI()}
                  title="Bật Model"
                  className={`absolute size-12 top-40 left-10 p-4 rounded-full transition z-20 ${arEnabledI ? 'bg-indigo-500/80 ring-4 ring-indigo-500/30' : 'bg-orange-600/60 ring-4 ring-orange-600/30'}`}
                >
                  <RectangleGoggles className="size-6 text-white" />
                </Button>
                {/* Nút bật lại camera II khi đã tắt */}
                <Button className="absolute size-12 top-60 left-10 p-4 rounded-full bg-indigo-500/80 ring-4 ring-indigo-500/30 hover:bg-indigo-700 shadow-2xl"
                  title="Bật chế độ so sanh (2 camera)"
                  onClick={() => handleCompareButton()}
                >
                  <Layers2 className="size-6 text-white" />
                </Button>
                <Button
                  onClick={() => {
                    setShowColorPickerI(!showColorPickerI);
                  }}
                  title="Config Color Try-On"
                  className={`absolute size-12 top-80 left-10 p-4 rounded-full no-dismiss-color transition z-20 ${showColorPickerI ? 'bg-indigo-500/80 ring-4 ring-indigo-500/30' : 'bg-amber-500/60 ring-4 ring-amber-300/30'}`}>
                  <Palette className="size-6" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* ==================== THANH ĐIỀU KHIỂN DƯỚI (cập nhật nút Try-On) ==================== */}
        <div
          ref={arContainerRef}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/70 backdrop-blur-xl px-6 py-4 rounded-full shadow-2xl z-10 no-dismiss">
          <Button
            onClick={() => handleBackButton()}
            title="Exit AR"
            className={`size-12 p-4 rounded-full transition z-20 bg-indigo-500/80 ring-indigo-500/40} hover:bg-indigo-700 shadow-2xl`}
          >
            <X className="size-6 text-white" />
          </Button>
          <Button
            onClick={() => setSwapLayout(!swapLayout)}
            title="Swap Layout"
            className="p-4 size-12 rounded-full hover:bg-white/20 transition">
            <FlipHorizontal className="size-6 text-white" />
          </Button>

          <Button
            onClick={() => setSlidersOpen(!slidersOpen)}
            title="Config Try-On"
            className="p-4 size-12 rounded-full hover:bg-white/20 transition">
            <Settings2 className={`size-6 text-white transition-transform ${slidersOpen ? 'rotate-90' : ''}`} />
          </Button>

          <Button
            onClick={() => setShowSettings(!showSettings)}
            title="Setting Button"
            className="p-4 size-12 rounded-full hover:bg-white/20 transition relative"
          >
            <Settings className={`size-6 text-white transition-transform ${showSettings ? 'rotate-90' : ''}`} />
          </Button>

          {/* Nút Record đỏ (giữ nguyên) */}
          <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
            <div className="w-5 h-5 bg-white rounded-full"></div>
          </div>
        </div>

        {/* ==================== SLIDERS ĐIỀU CHỈNH TRY-ON (mở từ dưới lên) ==================== */}
        <div className={`absolute bottom-30 left-1/2 -translate-x-1/2 transition-all duration-300 ${slidersOpen ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0 pointer-events-none'} z-50 no-dismiss`}>
          <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-3xl p-6 w-80 shadow-2xl">
            <h3 className="text-lg font-bold text-white text-center mb-5">Điều chỉnh thử đồ</h3>
            <div className="space-y-5">
              <div>
                <label className="text-xs text-white/70">Kích cỡ Model I ({scale}%)</label>
                <input type="range" min="20" max="150" value={scale} onChange={e => setScale(+e.target.value)} className="w-full h-2 bg-gray-700 rounded-full" />
              </div>
              <div>
                <label className="text-xs text-white/70">Kích cỡ Model II ({scale}%)</label>
                <input type="range" min="20" max="150" value={scale} onChange={e => setScale(+e.target.value)} className="w-full h-2 bg-gray-700 rounded-full" />
              </div>
              <div>
                <label className="text-xs text-white/70">Trái ↔ Phải</label>
                <input type="range" min="0" max="100" value={offsetX} onChange={e => setOffsetX(+e.target.value)} className="w-full h-2 bg-gray-700 rounded-full" />
              </div>
              <div>
                <label className="text-xs text-white/70">Lên ↓ Xuống</label>
                <input type="range" min="0" max="100" value={offsetY} onChange={e => setOffsetY(+e.target.value)} className="w-full h-2 bg-gray-700 rounded-full" />
              </div>
              <div>
                <label className="text-xs text-white/70">Độ trong suốt ({opacity}%)</label>
                <input type="range" min="30" max="100" value={opacity} onChange={e => setOpacity(+e.target.value)} className="w-full h-2 bg-gray-700 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Panel cài đặt trượt lên */}
        <div className={`absolute bottom-30 left-1/2 -translate-x-1/2 transition-all duration-300 ${showSettings ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
          <div className="bg-black/80 backdrop-blur-xl border border-white/20 rounded-3xl p-6 w-80 shadow-2xl no-dismiss">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white">Cài đặt hiển thị</h3>
              <button onClick={() => setShowSettings(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-white">Chế độ so sánh</span>
                <button
                  onClick={() => {
                    setCameraIIEnabled(!CameraIIEnabled)
                    handleCompareButton();
                  }}
                  className={`w-14 h-8 rounded-full transition ${CameraIIEnabled ? 'bg-purple-500' : 'bg-gray-600'} relative`}
                >
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${CameraIIEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <button
                onClick={startCameras}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-2xl font-medium transition"
              >
                Làm mới camera
              </button>
            </div>
          </div>
        </div>

        {/* Loading */}
        {!camerasReady && !error && (
          <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-50">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-lg">Đang mở camera...</p>
            </div>
          </div>
        )}

        {/* Lỗi */}
        {error && (
          <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-50">
            <div className="text-center max-w-sm px-8">
              <p className="text-red-400 text-lg mb-6">{error}</p>
              <button
                onClick={startCameras}
                className="px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-2xl font-medium"
              >
                Thử lại
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}