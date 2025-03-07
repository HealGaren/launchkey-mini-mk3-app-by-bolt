import { useEffect } from 'react';
import { useMIDIStore } from '../store/midiStore';

const STORAGE_KEYS = {
  SELECTED_INPUT: 'midiSelectedInput',
  SELECTED_DAW_INPUT: 'midiSelectedDawInput',
  SELECTED_OUTPUT: 'midiSelectedOutput',
  CURRENT_PAD_MODE: 'midiCurrentPadMode'
} as const;

export function useMIDIStorage() {
  const {
    selectedInput,
    selectedDawInput,
    selectedOutput,
    currentPadMode,
    setSelectedInput,
    setSelectedDawInput,
    setSelectedOutput,
    setCurrentPadMode,
  } = useMIDIStore();

  // Load saved settings on mount
  useEffect(() => {
    const savedInput = localStorage.getItem(STORAGE_KEYS.SELECTED_INPUT);
    const savedDawInput = localStorage.getItem(STORAGE_KEYS.SELECTED_DAW_INPUT);
    const savedOutput = localStorage.getItem(STORAGE_KEYS.SELECTED_OUTPUT);
    const savedMode = localStorage.getItem(STORAGE_KEYS.CURRENT_PAD_MODE);

    if (savedInput) setSelectedInput(savedInput);
    if (savedDawInput) setSelectedDawInput(savedDawInput);
    if (savedOutput) setSelectedOutput(savedOutput);
    if (savedMode) setCurrentPadMode(parseInt(savedMode, 10));
  }, []);

  // Save settings when they change
  useEffect(() => {
    if (selectedInput) {
      localStorage.setItem(STORAGE_KEYS.SELECTED_INPUT, selectedInput);
    } else {
      localStorage.removeItem(STORAGE_KEYS.SELECTED_INPUT);
    }
  }, [selectedInput]);

  useEffect(() => {
    if (selectedDawInput) {
      localStorage.setItem(STORAGE_KEYS.SELECTED_DAW_INPUT, selectedDawInput);
    } else {
      localStorage.removeItem(STORAGE_KEYS.SELECTED_DAW_INPUT);
    }
  }, [selectedDawInput]);

  useEffect(() => {
    if (selectedOutput) {
      localStorage.setItem(STORAGE_KEYS.SELECTED_OUTPUT, selectedOutput);
    } else {
      localStorage.removeItem(STORAGE_KEYS.SELECTED_OUTPUT);
    }
  }, [selectedOutput]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_PAD_MODE, currentPadMode.toString());
  }, [currentPadMode]);
}