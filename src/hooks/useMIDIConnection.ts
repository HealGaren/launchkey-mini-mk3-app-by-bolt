import { useCallback } from 'react';
import { useMIDIStore } from '../store/midiStore';
import { MIDIMessages, midiMessageWith } from '../utils/midiMessage';
import { syncButtonSettings } from '../services/midi/buttonSync';

export function useMIDIConnection() {
  const { 
    selectedOutput, 
    isConnected, 
    setIsConnected, 
    addMIDIHistory,
    currentPadMode,
    buttonSettings
  } = useMIDIStore();

  const toggleConnection = useCallback(async () => {
    if (!selectedOutput) return;

    const newConnectionState = !isConnected;
    setIsConnected(newConnectionState);

    try {
      const midiAccess = await navigator.requestMIDIAccess();
      const output = midiAccess.outputs.get(selectedOutput);
      
      if (output) {
        // Send DAW Mode message
        const dawModeMessage = newConnectionState
          ? MIDIMessages.DAWModeOn
          : MIDIMessages.DAWModeOff;
        
        output.send(dawModeMessage.midi);
        addMIDIHistory({
          direction: 'out',
          message: dawModeMessage.midi,
          params: dawModeMessage.params,
          source: 'manual'
        });

        // If connecting, also send the current mode
        if (newConnectionState) {
          const modeMessage = midiMessageWith(MIDIMessages.PadMode, { data2: currentPadMode });
          output.send(modeMessage.midi);
          addMIDIHistory({
            direction: 'out',
            message: modeMessage.midi,
            params: modeMessage.params,
            source: 'manual'
          });

          // Sync button settings after connection
          await syncButtonSettings(selectedOutput, buttonSettings, addMIDIHistory);
        }
      }
    } catch (error) {
      console.error('Failed to toggle MIDI connection:', error);
      setIsConnected(false);
    }
  }, [selectedOutput, isConnected, setIsConnected, addMIDIHistory, currentPadMode, buttonSettings]);

  return {
    toggleConnection,
    isConnected,
    canConnect: !!selectedOutput,
  };
}