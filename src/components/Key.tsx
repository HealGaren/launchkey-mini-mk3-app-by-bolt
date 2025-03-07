import React, { useEffect } from 'react';
import { fromMidi } from '@tonaljs/note';
import { useMIDIStore } from '../store/midiStore';
import { KeyGroup } from '../types/midi';

interface KeyProps {
  index: number;
  isBlack: boolean;
  group?: KeyGroup;
  midiNote: number;
  isMainSection: boolean;
}

export const Key: React.FC<KeyProps> = ({ index, isBlack, group, midiNote, isMainSection }) => {
  const { keyStates, keyVelocities, setActiveNotes } = useMIDIStore();
  const isPressed = keyStates[index];
  const velocity = keyVelocities[index];

  useEffect(() => {
    if (isPressed) {
      setActiveNotes(midiNote, true);
    } else {
      setActiveNotes(midiNote, false);
    }
  }, [isPressed, midiNote, setActiveNotes]);

  return (
    <div
      className={`relative ${
        isBlack
          ? 'w-7 h-28 -mx-3.5 z-10 border border-gray-700'
          : 'w-10 h-40 border border-gray-300'
      }`}
      style={{
        backgroundColor: isPressed 
          ? (isBlack ? '#4B5563' : '#93C5FD')
          : (isBlack ? '#111827' : '#FFFFFF'),
        opacity: isMainSection ? 1 : 0.85,
        borderBottomWidth: !isBlack && isMainSection ? '2px' : '1px',
        borderBottomColor: !isBlack && isMainSection ? '#3B82F6' : undefined
      }}
    >
      {isPressed && velocity !== undefined && (
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] bg-black bg-opacity-50 text-white px-1 rounded">
          {velocity}
        </div>
      )}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[10px] text-gray-500">
        {midiNote}
      </div>
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-[10px] text-gray-500">
        {fromMidi(midiNote)}
      </div>
    </div>
  );
};