import React from 'react';
import type { ARSettings } from '../types';

interface ARSettingsSlidersProps {
  settings: ARSettings;
  onSettingsChange: (updates: Partial<ARSettings>) => void;
  show: boolean;
}

export function ARSettingsSliders({ 
  settings, 
  onSettingsChange, 
  show 
}: ARSettingsSlidersProps) {
  if (!show) return null;

  return (
    <div className="absolute bottom-30 left-1/2 -translate-x-1/2 transition-all duration-300 translate-y-0 opacity-100 z-50 no-dismiss">
      <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-3xl p-6 w-80 shadow-2xl">
        <h3 className="text-lg font-bold text-white text-center mb-5">
          Điều chỉnh thử đồ
        </h3>
        <div className="space-y-5">
          <div>
            <label className="text-xs text-white/70">
              Kích cỡ Model I ({settings.scale}%)
            </label>
            <input
              type="range"
              min="20"
              max="150"
              value={settings.scale}
              onChange={(e) => onSettingsChange({ scale: +e.target.value })}
              className="w-full h-2 bg-gray-700 rounded-full"
            />
          </div>
          <div>
            <label className="text-xs text-white/70">
              Kích cỡ Model II ({settings.scale}%)
            </label>
            <input
              type="range"
              min="20"
              max="150"
              value={settings.scale}
              onChange={(e) => onSettingsChange({ scale: +e.target.value })}
              className="w-full h-2 bg-gray-700 rounded-full"
            />
          </div>
          <div>
            <label className="text-xs text-white/70">Trái ↔ Phải</label>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.offsetX}
              onChange={(e) => onSettingsChange({ offsetX: +e.target.value })}
              className="w-full h-2 bg-gray-700 rounded-full"
            />
          </div>
          <div>
            <label className="text-xs text-white/70">Lên ↓ Xuống</label>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.offsetY}
              onChange={(e) => onSettingsChange({ offsetY: +e.target.value })}
              className="w-full h-2 bg-gray-700 rounded-full"
            />
          </div>
          <div>
            <label className="text-xs text-white/70">
              Độ trong suốt ({settings.opacity}%)
            </label>
            <input
              type="range"
              min="30"
              max="100"
              value={settings.opacity}
              onChange={(e) => onSettingsChange({ opacity: +e.target.value })}
              className="w-full h-2 bg-gray-700 rounded-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
