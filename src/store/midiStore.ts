import { create } from 'zustand';
import { produce } from 'immer';
import { MIDIState, ButtonSettingsMap } from '../types/midi';
import { PadMode } from '../utils/midiMessageDefinition';

// Load saved button settings from localStorage
const loadButtonSettings = (): ButtonSettingsMap => {
  try {
    const savedSettings = localStorage.getItem('buttonSettings');
    const parsedSettings = savedSettings ? JSON.parse(savedSettings) : null;
    
    // Validate the structure
    if (parsedSettings && 
        typeof parsedSettings === 'object' &&
        PadMode.DRUM in parsedSettings &&
        PadMode.SESSION in parsedSettings &&
        PadMode.CUSTOM in parsedSettings &&
        'controls' in parsedSettings) {
      return parsedSettings;
    }
  } catch (error) {
    console.error('Failed to load button settings:', error);
  }
  
  // Return default settings if loading fails or data is invalid
  return {
    [PadMode.DRUM]: {},
    [PadMode.SESSION]: {},
    [PadMode.CUSTOM]: {},
    controls: {}
  };
};

export const useMIDIStore = create<MIDIState>((set) => ({
  inputs: [],
  outputs: [],
  selectedInput: null,
  selectedDawInput: null,
  selectedOutput: null,
  pitchValue: 64, // Center position
  modulationValue: 0,
  controlStates: {
    shift: false,
    up: false,
    down: false,
    left: false,
    right: false,
    play: false,
    record: false
  },
  isConnected: false,
  currentPadMode: 1, // Default to DRUM mode
  knobValues: new Array(8).fill(0),
  buttonStates: new Array(16).fill(false),
  buttonVelocities: new Array(16).fill(0),
  keyStates: new Array(96).fill(false), // Expanded range for transposition
  keyVelocities: new Array(96).fill(0),
  activeNotes: [],
  buttonSettings: loadButtonSettings(),
  midiHistory: [],
  isLoggingEnabled: false,
  isThrottlingEnabled: false,
  setInputs: (inputs) => set({ inputs }),
  setOutputs: (outputs) => set({ outputs }),
  setSelectedInput: (id) => set({ selectedInput: id }),
  setSelectedDawInput: (id) => set({ selectedDawInput: id }),
  setSelectedOutput: (id) => set({ selectedOutput: id }),
  setIsConnected: (isConnected) => set({ isConnected }),
  setCurrentPadMode: (mode) => set({ currentPadMode: mode }),
  setPitchValue: (value) => set({ pitchValue: value }),
  setModulationValue: (value) => set({ modulationValue: value }),
  setControlState: (control, controlState) =>
    set(produce((state) => {
      state.controlStates[control] = controlState;
    })),
  setKnobValue: (index, value) =>
    set(produce((state) => {
      state.knobValues[index] = value;
    })),
  setButtonState: (index, buttonState, velocity = 0) =>
    set(produce((state) => {
      state.buttonStates[index] = buttonState;
      state.buttonVelocities[index] = velocity;
    })),
  setActiveNotes: (midiNote: number, isActive: boolean) =>
    set(produce((state) => {
      if (isActive && !state.activeNotes.includes(midiNote)) {
        state.activeNotes.push(midiNote);
      } else if (!isActive) {
        state.activeNotes = state.activeNotes.filter(note => note !== midiNote);
      }
    })),
  setKeyState: (index, keyState, velocity = 0) =>
    set(produce((state) => {
      state.keyStates[index] = keyState;
      state.keyVelocities[index] = velocity;
    })),
  setButtonSettings: (mode, buttonIndex, settings: ButtonSettings | null, ccNumber?: number) =>
    set(produce((state) => {
      if (ccNumber !== undefined) {
        if (settings === null) {
          delete state.buttonSettings.controls[ccNumber];
        } else {
          state.buttonSettings.controls[ccNumber] = settings;
        }
      } else {
        if (settings === null) {
          delete state.buttonSettings[mode][buttonIndex];
        } else {
          state.buttonSettings[mode][buttonIndex] = settings;
        }
      }
      // Save to localStorage
      localStorage.setItem('buttonSettings', JSON.stringify(state.buttonSettings));
    })),
  addMIDIHistory: (entry) =>
    set(produce((state) => {
      if (!state.isLoggingEnabled) return state;
      state.midiHistory.unshift({ ...entry, timestamp: Date.now() });
      state.midiHistory = state.midiHistory.slice(0, 1000);
    })),
  clearMIDIHistory: () => set({ midiHistory: [] }),
  setIsLoggingEnabled: (enabled) => set({ isLoggingEnabled: enabled }),
  setIsThrottlingEnabled: (enabled) => set({ isThrottlingEnabled: enabled }),
}));