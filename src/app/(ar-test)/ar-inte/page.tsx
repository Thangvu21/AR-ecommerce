'use client';
import { useRef, useEffect, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { useAREngine } from '@/hooks/useAREngine';
import type { ARProduct } from '@/lib/ar';
import { is } from 'date-fns/locale';

const ARTryOnPage = () => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [is3DMode, setIs3DMode] = useState(false);
  
  const { state, start, stop, setProduct } = useAREngine();

  useEffect(() => {
    const product: ARProduct = {
      id: is3DMode ? 'glasses-3d' : 'glasses-2d',
      type: 'glasses',
      overlayUrl: is3DMode ? '' : '/test-ar/sunglasses.png',
      modelUrl: is3DMode ? '/test-ar/glass.glb' : undefined,
      metadata: { 
        eyeDistanceDivisor: is3DMode ? 500 : 180,
        initAdjustPosition: is3DMode ? { x: 0, y: -1, z: 0 } : { x: 0, y: 0, z: 0 },
        initAdjustRotation: is3DMode ? { x: 0, y: 0, z: 0 } : { x: 0, y: 0, z: 0 }
      }
    };
    setProduct(product);
  }, [setProduct, is3DMode]);

  const handleUserMedia = useCallback(() => {
    console.log('Camera ready');
    setIsVideoReady(true);
  }, []);

  useEffect(() => {
    if (!isVideoReady) return;

    const video = webcamRef.current?.video;
    const canvas = canvasRef.current;
    
    if (video && canvas) {
      console.log('Starting AR Engine', video.readyState);
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      start(video, canvas);
    }
    
    return () => stop();
  }, [isVideoReady, start, stop]);

  return (
    <div>
      <div style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.2)', padding: '20px', background: '#f5f5f5' }}>
        <h1 style={{ textAlign: 'center', margin: '0 0 20px 0' }}>AR Try-On (Integrated)</h1>
        <div style={{ textAlign: 'center' }}>
          <button 
            onClick={() => setIs3DMode(!is3DMode)}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              cursor: 'pointer',
              backgroundColor: is3DMode ? '#4CAF50' : '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              transition: 'all 0.3s ease',
              fontWeight: 'bold'
            }}
          >
            {is3DMode ? '3D Model (GLTF)' : '2D Texture (PNG)'}
          </button>
          <p style={{ marginTop: '10px', color: '#666', fontSize: '14px' }}>
            Current mode: {is3DMode ? '3D Model with full rotation' : '2D Texture with basic rotation'}
          </p>
        </div>
      </div>
      
      <div style={{ position: 'relative', width: 640, height: 480, margin: '20px auto' }}>
        {state.isLoading && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(255, 255, 255, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>Loading AR model...</div>
              <div style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
                {is3DMode ? 'Loading 3D GLTF model...' : 'Loading 2D texture...'}
              </div>
            </div>
          </div>
        )}
        {state.error && (
          <div style={{ 
            position: 'absolute', 
            top: 10, 
            left: 10, 
            right: 10,
            background: 'rgba(255, 0, 0, 0.8)', 
            color: 'white', 
            padding: '12px',
            borderRadius: '5px',
            zIndex: 10
          }}>
            Error: {state.error}
          </div>
        )}
      
        <Webcam 
          ref={webcamRef} 
          mirrored
          onUserMedia={handleUserMedia}
          style={{ width: 640, height: 480 }}
          videoConstraints={{ width: 640, height: 480, facingMode: 'user' }}
        />
        <canvas 
          ref={canvasRef} 
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: 640, 
            height: 480,
            pointerEvents: 'none' 
          }} 
        />
        
        <div style={{ 
          position: 'absolute', 
          bottom: 10, 
          left: 10, 
          background: 'rgba(0,0,0,0.7)', 
          color: 'white', 
          padding: '10px 12px',
          borderRadius: '5px',
          fontSize: '12px',
          fontFamily: 'monospace'
        }}>
          <div>Mode: <strong>{is3DMode ? '3D' : '2D'}</strong></div>
          <div>Video Ready: {isVideoReady ? '✓' : '✗'}</div>
          <div>Model Loaded: {state.isModelLoaded ? '✓' : '✗'}</div>
          <div>Detecting: {state.isDetecting ? '✓' : '✗'}</div>
          <div>Face: {state.faceDetected ? '✓ Detected' : '✗ Not found'}</div>
          <div>FPS: {state.fps}</div>
        </div>
      </div>
    </div>
  );
};

export default ARTryOnPage;