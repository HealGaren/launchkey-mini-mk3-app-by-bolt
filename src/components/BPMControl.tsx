import React, { useState, useRef } from 'react';
import { Play, Square } from 'lucide-react';
import { useMIDIStore } from '../store/midiStore';
import { MIDIStatus } from '../utils/midiMessageDefinition';

export const BPMControl: React.FC = () => {
  const { selectedOutput, addMIDIHistory } = useMIDIStore();
  const [bpmInput, setBpmInput] = useState('120');
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<number>();
  
  const currentBpm = Math.max(20, Math.min(300, parseInt(bpmInput) || 120));

  const handleSync = async () => {
    if (!selectedOutput || isPlaying) return;

    try {
      const midiAccess = await navigator.requestMIDIAccess();
      const output = midiAccess.outputs.get(selectedOutput);
      
      if (output) {
        setIsPlaying(true);
        
        // Calculate interval in milliseconds for the MIDI clock
        // MIDI clock sends 24 pulses per quarter note
        const interval = (60 * 1000) / (currentBpm * 24);
        
        // Send MIDI Start message
        output.send([MIDIStatus.START]);
        addMIDIHistory({
          direction: 'out',
          message: [MIDIStatus.START],
          params: {
            channel: 0,
            status: MIDIStatus.START,
            data1: 0,
            data2: 0
          },
          source: 'manual'
        });
        
        // Start sending clock pulses
        intervalRef.current = window.setInterval(() => {
          output.send([MIDIStatus.CLK]);
        }, interval);
      }
    } catch (error) {
      console.error('Failed to send MIDI clock:', error);
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      
      // Send MIDI Stop message when manually stopping
      if (selectedOutput) {
        navigator.requestMIDIAccess().then(midiAccess => {
          const output = midiAccess.outputs.get(selectedOutput);
          if (output) {
            output.send([MIDIStatus.STOP]);
            addMIDIHistory({
              direction: 'out',
              message: [MIDIStatus.STOP],
              params: {
                channel: 0,
                status: MIDIStatus.STOP,
                data1: 0,
                data2: 0
              },
              source: 'manual'
            });
          }
        });
      }
      
      setIsPlaying(false);
    }
  };

  return (
    <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">BPM:</label>
        <input
          type="number"
          min="20"
          max="300"
          value={bpmInput}
          onChange={(e) => setBpmInput(e.target.value)}
          onBlur={() => setBpmInput(currentBpm.toString())}
          className="w-20 px-2 py-1 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      
      <button
        onClick={isPlaying ? handleStop : handleSync}
        disabled={!selectedOutput}
        className={`flex items-center gap-2 px-4 py-2 rounded ${
          isPlaying
            ? 'bg-red-500 hover:bg-red-600'
            : 'bg-blue-500 hover:bg-blue-600'
        } text-white disabled:opacity-50`}
      >
        {isPlaying ? (
          <>
            <Square size={16} />
            Stop Sync
          </>
        ) : (
          <>
            <Play size={16} />
            Sync BPM
          </>
        )}
      </button>
    </div>
  );
};