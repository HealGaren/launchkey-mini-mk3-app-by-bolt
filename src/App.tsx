import React, { useState } from 'react';
import { Settings } from './components/Settings';
import { Controls } from './components/Controls';
import { Knob } from './components/Knob';
import { Button } from './components/Button';
import { ButtonSettingsModal } from './components/ButtonSettingsModal';
import { Keyboard } from './components/Keyboard';
import { BPMControl } from './components/BPMControl';
import { midiMessageWith, MIDIMessages } from './utils/midiMessage';
import { PadMode, availablePadModes, PadNotesInMode } from './utils/midiMessageDefinition';
import { useMIDIStore } from "./store/midiStore";
import { MIDIHistory } from './components/MIDIHistory';

function App() {
  const { 
    selectedOutput, 
    currentPadMode, 
    setCurrentPadMode, 
    addMIDIHistory, 
    isConnected,
    pitchValue,
    modulationValue
  } = useMIDIStore();
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const handleModeChange = async (newMode: PadMode) => {
    try {
      const midiAccess = await navigator.requestMIDIAccess();
      const output = midiAccess.outputs.get(selectedOutput);
      
      if (output) {
        const message = midiMessageWith(MIDIMessages.PadMode, { data2: newMode });
        output.send(message.midi);
        
        addMIDIHistory({
          direction: 'out',
          message: message.midi,
          params: message.params,
          source: 'manual'
        });
      }
    } catch (error) {
      console.error('Failed to change pad mode:', error);
    }
  };

  const isVisualizableMode = (mode: PadMode): boolean => {
    return mode in PadNotesInMode;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 pb-[480px]">
      <Settings />
      <ButtonSettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} />
      
      <div className={`max-w-[1280px] mx-auto bg-gray-200 p-8 rounded-xl shadow-lg flex-grow transition-opacity duration-200 ${!isConnected ? 'opacity-50' : ''}`}>
        <div className="flex flex-col gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Controls</h3>
            <div className="flex items-start justify-center gap-8">
              <div className="w-[160px] flex justify-end">
                <Controls.Shift />
              </div>
              <div className="grid grid-cols-8 gap-4 w-[640px] justify-center">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Knob key={i} index={i} />
                ))}
              </div>
              <div className="w-[160px]" />
            </div>
          </div>
           
          {/* Middle Row - Touch Pads, Buttons, and Navigation */}
          <div className="border-b border-gray-300 pb-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Pads & Navigation</h3>
              <div className="flex-1 flex justify-center gap-4 items-center mx-8">
                <div className="flex gap-4">
                  {availablePadModes.map(({ mode, label }) => (
                    <button
                      key={mode}
                      className={`px-4 py-2 rounded ${
                        currentPadMode === mode
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                      onClick={() => handleModeChange(mode)}
                    >
                      {label} Mode
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <button
                  onClick={() => setIsSettingsModalOpen(true)}
                  className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
                >
                  Button Settings
                </button>
              </div>
            </div>
            <div className="flex items-center">
              {/* Left - Touch Pads */}
              <div className="w-[320px] flex justify-end gap-8 pr-8">
                <Controls.TouchPad value={pitchValue} label="Pitch" />
                <Controls.TouchPad value={modulationValue} label="Mod" />
              </div>
              
              {/* Center - Buttons */}
              <div className="flex justify-center">
                {isVisualizableMode(currentPadMode as PadMode) ? (
                  <div className="flex flex-col gap-4">
                    {[0, 1].map((row) => (
                      <div key={row} className="flex gap-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                          <Button key={i} index={i} row={row} padMode={currentPadMode as PadMode} />
                        ))}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-300 p-8 rounded text-center text-gray-600">
                    This mode is not visualizable
                  </div>
                )}
              </div>
              
              {/* Right - Navigation and Playback */}
              <div className="w-[320px] flex flex-col gap-4 pl-8">
                <Controls.Navigation />
                <Controls.Playback />
              </div>
             </div>
           </div>
           
           <Keyboard />
         </div>
      </div>
      <MIDIHistory />
    </div>
  );
}

export default App;