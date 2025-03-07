import React from 'react';
import { useMIDIStore } from '../../store/midiStore';
import { Play, Square, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { ControlButton } from './ControlButton';

const TouchPad: React.FC<{ value: number; label: string }> = ({ value, label }) => (
  <div className="w-8 h-32 bg-gray-300 rounded-lg relative overflow-hidden">
    <div 
      className="absolute bottom-0 left-0 right-0 bg-blue-500"
      style={{ height: `${(value / 127) * 100}%` }}
    />
    <div className="absolute inset-0 pointer-events-none">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="border-t border-gray-400 opacity-30"
          style={{ top: `${(i + 1) * 12.5}%` }}
        />
      ))}
    </div>
    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-gray-600">
      {label}
    </div>
  </div>
);

const Shift: React.FC = () => {
  const { controlStates } = useMIDIStore();
  return (
    <ControlButton 
      isPressed={controlStates.shift} 
      isControl 
      className="text-sm font-medium"
      ccNumber={108}
      channel={0}
    >
      Shift
    </ControlButton>
  );
};

const Navigation: React.FC = () => {
  const { controlStates } = useMIDIStore();
  return (
    <div className="flex gap-4 items-end">
      <div>
        <ControlButton 
          isPressed={controlStates.up} 
          ccNumber={104} 
          channel={0}
        >
          <ChevronUp size={24} />
        </ControlButton>
      </div>
      <div className="flex gap-4">
        <ControlButton 
          isPressed={controlStates.left} 
          isControl 
          ccNumber={103} 
          channel={15}
        >
          <ChevronLeft size={20} />
        </ControlButton>
        <ControlButton 
          isPressed={controlStates.right} 
          isControl 
          ccNumber={102} 
          channel={15}
        >
          <ChevronRight size={20} />
        </ControlButton>
      </div>
    </div>
  );
};

const Playback: React.FC = () => {
  const { controlStates } = useMIDIStore();
  return (
    <div className="flex gap-4 items-end">
      <div>
        <ControlButton 
          isPressed={controlStates.down} 
          ccNumber={105} 
          channel={0}
        >
          <ChevronDown size={24} />
        </ControlButton>
      </div>
      <div className="flex gap-4 items-end">
        <ControlButton 
          isPressed={controlStates.play} 
          isControl 
          ccNumber={115} 
          channel={15}
        >
          <Play size={20} />
        </ControlButton>
        <ControlButton 
          isPressed={controlStates.record} 
          isControl 
          ccNumber={117} 
          channel={15}
        >
          <Square className="fill-current" size={20} />
        </ControlButton>
      </div>
    </div>
  );
};

export const Controls = {
  TouchPad,
  Shift,
  Navigation,
  Playback,
};
