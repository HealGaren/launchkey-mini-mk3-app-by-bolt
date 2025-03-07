import { useEffect } from 'react';
import { useMIDIStore } from '../store/midiStore';
import { useMIDIStorage } from './useMIDIStorage';
import { useMIDIInputHandling } from './useMIDIInputHandling';
import { setupMIDIDevices, getMIDIDevices } from '../services/midi/deviceSetup';

export function useMIDIDevices() {
  const {
    setInputs,
    setOutputs,
    selectedInput,
    selectedDawInput,
    selectedOutput,
    setIsConnected
  } = useMIDIStore();

  // Handle persistent storage of MIDI settings
  useMIDIStorage();

  // Handle MIDI input processing
  useMIDIInputHandling();

  // Set up MIDI devices
  useEffect(() => {
    if (!navigator.requestMIDIAccess) return;

    navigator.requestMIDIAccess().then(
      (midiAccess) => {
        const { inputs: inputDevices, outputs: outputDevices } = getMIDIDevices(midiAccess);

        setInputs(inputDevices);
        setOutputs(outputDevices);

        // Auto-connect if we have saved devices
        if (selectedInput && selectedDawInput && selectedOutput) {
          setIsConnected(true);
        }

        // Set up MIDI device handlers
        setupMIDIDevices(midiAccess);
      },
      () => {
        console.error('MIDI access denied');
      }
    );
  }, [
    selectedInput,
    selectedDawInput,
    selectedOutput,
    setInputs,
    setOutputs,
    setIsConnected
  ]);
}