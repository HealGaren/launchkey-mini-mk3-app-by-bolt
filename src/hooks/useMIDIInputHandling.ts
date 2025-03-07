import { useEffect } from 'react';
import { useMIDIStore } from '../store/midiStore';
import { handleGeneralMIDIInput, handleDAWMIDIInput } from '../services/midi/inputHandlers';
import { useThrottledMIDIUpdates } from './useThrottledMIDIUpdates';

export function useMIDIInputHandling() {
  const {
    selectedInput,
    selectedDawInput,
    addMIDIHistory,
    setKnobValue,
    setButtonState,
    setKeyState,
    setControlState,
    setCurrentPadMode,
  } = useMIDIStore();

  const {
    throttledSetPitchValue,
    throttledSetModulationValue,
    throttledSetKnobValue
  } = useThrottledMIDIUpdates();

  useEffect(() => {
    if (!navigator.requestMIDIAccess) return;

    navigator.requestMIDIAccess().then(midiAccess => {
      // Remove any existing listeners
      midiAccess.inputs.forEach(input => {
        input.onmidimessage = null;
      });

      // Set up general MIDI input handling
      if (selectedInput) {
        const input = midiAccess.inputs.get(selectedInput);
        if (input) {
          input.onmidimessage = (event) => {
            handleGeneralMIDIInput(event, {
              setPitchValue: throttledSetPitchValue,
              setModulationValue: throttledSetModulationValue,
              setControlState,
              addMIDIHistory,
              setKeyState
            });
          };
        }
      }

      // Set up DAW mode control input handling
      if (selectedDawInput) {
        const dawInput = midiAccess.inputs.get(selectedDawInput);
        if (dawInput) {
          dawInput.onmidimessage = (event) => {
            handleDAWMIDIInput(event, {
              addMIDIHistory,
              setCurrentPadMode,
              setKnobValue: throttledSetKnobValue,
              setButtonState,
              setControlState
            });
          };
        }
      }
    });
  }, [
    selectedInput,
    selectedDawInput,
    addMIDIHistory,
    throttledSetPitchValue,
    throttledSetModulationValue,
    throttledSetKnobValue,
    setControlState,
    setButtonState,
    setKeyState,
    setCurrentPadMode,
    setControlState
  ]);
}