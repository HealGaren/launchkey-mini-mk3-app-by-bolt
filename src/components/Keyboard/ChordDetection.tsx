import React from 'react';
import { detect } from '@tonaljs/chord-detect';
import { fromMidi } from '@tonaljs/note';

interface ChordDetectionProps {
  isEnabled: boolean;
  setIsEnabled: (enabled: boolean) => void;
  assumePerfectFifth: boolean;
  setAssumePerfectFifth: (assume: boolean) => void;
  activeNotes: number[];
}

const getChordColor = (chord: string): string => {
  if (chord.includes('m') && !chord.includes('maj')) {
    return 'text-red-500'; // Minor chords in red
  } else if (chord.includes('dim')) {
    return 'text-purple-500'; // Diminished chords in purple
  } else if (chord.includes('aug')) {
    return 'text-yellow-500'; // Augmented chords in yellow
  } else if (chord.includes('sus')) {
    return 'text-cyan-500'; // Suspended chords in cyan
  } else {
    return 'text-blue-500'; // Major chords in blue
  }
};

export const ChordDetection: React.FC<ChordDetectionProps> = ({
  isEnabled,
  setIsEnabled,
  assumePerfectFifth,
  setAssumePerfectFifth,
  activeNotes
}) => {
  const getChordName = () => {
    if (activeNotes.length < 2) return null;
    
    // Convert MIDI notes to note names, sorted from lowest to highest pitch
    const noteNames = [...activeNotes]
      .sort((a, b) => a - b)
      .map(midi => fromMidi(midi));

    return detect(noteNames, { assumePerfectFifth });
  };

  return (
    <div className="flex flex-col items-center gap-2 mb-4">
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={(e) => setIsEnabled(e.target.checked)}
            className="rounded border-gray-300"
          />
          <span>Enable Chord Detection</span>
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={assumePerfectFifth}
            onChange={(e) => setAssumePerfectFifth(e.target.checked)}
            className="rounded border-gray-300"
          />
          <span>Assume Perfect Fifth</span>
        </label>
      </div>
      <div className="h-8 flex items-center">
        {isEnabled && (
          <div className="text-lg">
            {(() => {
              const chords = getChordName();
              if (!chords || activeNotes.length < 2) {
                return <span className="text-gray-400">Play notes to detect chord</span>;
              } else if (chords.length === 0) {
                return <span className="text-gray-400">No chord detected</span>;
              }
              
              return chords.map((chord, index) => (
                <React.Fragment key={chord}>
                  {index === 0 ? (
                    <span className={`font-bold ${getChordColor(chord)}`}>
                      {chord}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400 ml-2">
                      {chord}
                    </span>
                  )}
                  {index < chords.length - 1 && <span className="text-gray-400">, </span>}
                </React.Fragment>
              ));
            })()}
          </div>
        )}
      </div>
    </div>
  );
};