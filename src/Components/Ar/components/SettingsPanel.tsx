import React from 'react';
import { X } from 'lucide-react';

interface SettingsPanelProps {
  show: boolean;
  onClose: () => void;
  cameraIIEnabled: boolean;
  onToggleCompare: () => void;
  onRefreshCamera: () => void;
}

export function SettingsPanel({
  show,
  onClose,
  cameraIIEnabled,
  onToggleCompare,
  onRefreshCamera,
}: SettingsPanelProps) {
  if (!show) return null;

  return (
    <div className="absolute bottom-30 left-1/2 -translate-x-1/2 transition-all duration-300 translate-y-0 opacity-100">
      <div className="bg-black/80 backdrop-blur-xl border border-white/20 rounded-3xl p-6 w-80 shadow-2xl no-dismiss">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-white">Cài đặt hiển thị</h3>
          <button onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-white">Chế độ so sánh</span>
            <button
              onClick={onToggleCompare}
              className={`w-14 h-8 rounded-full transition ${
                cameraIIEnabled ? 'bg-purple-500' : 'bg-gray-600'
              } relative`}
            >
              <div
                className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
                  cameraIIEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <button
            onClick={onRefreshCamera}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-2xl font-medium transition"
          >
            Làm mới camera
          </button>
        </div>
      </div>
    </div>
  );
}
