import React, { useState } from 'react';
import { ChordDetection } from './ChordDetection';
import { KeyboardSection } from './KeyboardSection';
import { KeyGroup } from '../../types/midi';
import { useMIDIStore } from '../../store/midiStore';

const keyGroups: KeyGroup[] = [
  { startIndex: 0, endIndex: 7, color: '#FF0000', name: 'Group 1' },
  { startIndex: 8, endIndex: 15, color: '#00FF00', name: 'Group 2' },
  { startIndex: 16, endIndex: 24, color: '#0000FF', name: 'Group 3' },
];

export const Keyboard: React.FC = () => {
  const { activeNotes } = useMIDIStore();
  const [isChordDetectionEnabled, setIsChordDetectionEnabled] = useState(true);
  const [assumePerfectFifth, setAssumePerfectFifth] = useState(false);

  return (
    <div className="flex flex-col items-center pt-2">
      <h3 className="text-lg font-semibold text-gray-700 mb-2">Keyboard</h3>
      <ChordDetection
        isEnabled={isChordDetectionEnabled}
        setIsEnabled={setIsChordDetectionEnabled}
        assumePerfectFifth={assumePerfectFifth}
        setAssumePerfectFifth={setAssumePerfectFifth}
        activeNotes={activeNotes}
      />
      <KeyboardSection keyGroups={keyGroups} />
    </div>
  );
};