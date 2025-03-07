import React from 'react';
import { Key } from '../Key';
import { KeyGroup } from '../../types/midi';

interface KeyboardSectionProps {
  keyGroups: KeyGroup[];
}

export const KeyboardSection: React.FC<KeyboardSectionProps> = ({ keyGroups }) => {
  // Four octaves: C2-B2 (36-47), C3-B3 (48-59), C4-B4 (60-71), C5-B5 (72-83)
  const keyLayout = [
    false, true, false, true, false, false, true, false, true, false, true, false,
    false, true, false, true, false, false, true, false, true, false, true, false,
    false, true, false, true, false, false, true, false, true, false, true, false,
    false, true, false, true, false, false, true, false, true, false, true, false
  ];

  const getKeyGroup = (index: number): KeyGroup | undefined => {
    return keyGroups.find(group => index >= group.startIndex && index <= group.endIndex);
  };

  return (
    <div className="relative flex overflow-x-auto pb-4 justify-center">
      {keyLayout.map((isBlack, i) => (
        <Key
          key={i}
          index={i}
          isBlack={isBlack}
          group={getKeyGroup(i)}
          midiNote={36 + i}
          isMainSection={i >= 12 && i <= 36} // Main section is C3-C5 (48-72)
        />
      ))}
    </div>
  );
};