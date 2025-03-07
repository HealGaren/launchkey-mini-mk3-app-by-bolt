import React from 'react';
import { useMIDIStore } from '../store/midiStore';
import { Knob as KnobCC } from '../utils/midiMessageDefinition';

interface KnobProps {
  index: number;
}

export const Knob: React.FC<KnobProps> = ({ index }) => {
  const { knobValues } = useMIDIStore();
  const value = knobValues[index];
  const rotation = (value / 127) * 270 - 135; // Map 0-127 to -135° to 135°
  const ccNumber = KnobCC.K1 + index;
  const percentage = (value / 127) * 100;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-12 h-12">
        {/* Background and value bars */}
        <div className="absolute top-0 -left-3 h-full w-2 rounded-full">
          {/* Background bar (100%) */}
          <div className="absolute inset-0 bg-gray-600" />
          {/* Value bar */}
          <div 
            className="absolute bottom-0 left-0 w-full bg-blue-500"
            style={{ 
              height: `${percentage}%`
            }} 
          />
        </div>

        {/* Knob */}
        <div 
          className="w-full h-full rounded-full bg-gray-700 border-2 border-gray-600 relative shadow-lg transform hover:scale-105"
          style={{
            transform: `rotate(${rotation}deg)`
          }}
        >
          <div className="absolute top-1.5 left-1/2 w-0.5 h-3 bg-white -translate-x-1/2" />
        </div>
      </div>
      <div className="text-sm text-center">
        <div>CC {ccNumber}</div>
        <div className="text-blue-600 font-medium">{Math.round(percentage)}%</div>
      </div>
    </div>
  );
}