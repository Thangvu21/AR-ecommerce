import React from 'react';
import { Button } from '@/Components/ui/button';
import { 
  X, 
  FlipHorizontal, 
  Settings2, 
  Settings 
} from 'lucide-react';

interface ControlPanelProps {
  onBack: () => void;
  onSwapLayout: () => void;
  onToggleSliders: () => void;
  onToggleSettings: () => void;
  slidersOpen: boolean;
  settingsOpen: boolean;
}

export function ControlPanel({
  onBack,
  onSwapLayout,
  onToggleSliders,
  onToggleSettings,
  slidersOpen,
  settingsOpen,
}: ControlPanelProps) {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/70 backdrop-blur-xl px-6 py-4 rounded-full shadow-2xl z-10 no-dismiss">
      <Button
        onClick={onBack}
        title="Exit AR"
        className="size-12 p-4 rounded-full transition z-20 bg-indigo-500/80 ring-indigo-500/40 hover:bg-indigo-700 shadow-2xl"
      >
        <X className="size-6 text-white" />
      </Button>
      
      <Button
        onClick={onSwapLayout}
        title="Swap Layout"
        className="p-4 size-12 rounded-full hover:bg-white/20 transition"
      >
        <FlipHorizontal className="size-6 text-white" />
      </Button>

      <Button
        onClick={onToggleSliders}
        title="Config Try-On"
        className="p-4 size-12 rounded-full hover:bg-white/20 transition"
      >
        <Settings2 className={`size-6 text-white transition-transform ${slidersOpen ? 'rotate-90' : ''}`} />
      </Button>

      <Button
        onClick={onToggleSettings}
        title="Setting Button"
        className="p-4 size-12 rounded-full hover:bg-white/20 transition relative"
      >
        <Settings className={`size-6 text-white transition-transform ${settingsOpen ? 'rotate-90' : ''}`} />
      </Button>

      <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
        <div className="w-5 h-5 bg-white rounded-full"></div>
      </div>
    </div>
  );
}
