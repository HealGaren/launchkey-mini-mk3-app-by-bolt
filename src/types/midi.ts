import { MIDIMessageParams } from '../utils/midiMessage';
import { PadMode } from '../utils/midiMessageDefinition';

export type ColorMode = 'SOLID' | 'FLASH' | 'PULSE';

export interface ButtonSettings {
  colorMode: ColorMode;
  colorValue: number;
  flashEnabled?: boolean;
  flashValue?: number;
}

export interface ButtonSettingsMap {
  [PadMode.DRUM]: { [buttonIndex: number]: ButtonSettings };
  [PadMode.SESSION]: { [buttonIndex: number]: ButtonSettings };
  [PadMode.CUSTOM]: { [buttonIndex: number]: ButtonSettings };
  controls: {
    [ccNumber: string]: ButtonSettings;
  };
}

export interface MIDIDeviceInfo {
  id: string;
  name: string;
  manufacturer: string;
}

export interface MIDIHistoryEntry {
  timestamp: number;
  direction: 'in' | 'out';
  message: number[];
  params: MIDIMessageParams;
  manual?: boolean;
  source?: 'manual' | 'daw' | 'general';
}

export interface MIDIState {
  inputs: MIDIDeviceInfo[];
  outputs: MIDIDeviceInfo[];
  pitchValue: number;
  modulationValue: number;
  controlStates: {
    shift: boolean;
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
    play: boolean;
    record: boolean;
  };
  selectedInput: string | null;
  selectedDawInput: string | null;
  selectedOutput: string | null;
  isConnected: boolean;
  currentPadMode: number;
  knobValues: number[];
  buttonStates: boolean[];
  buttonVelocities: number[];
  keyStates: boolean[];
  keyVelocities: number[];
  activeNotes: number[];
  buttonSettings: ButtonSettingsMap;
  midiHistory: MIDIHistoryEntry[];
  isLoggingEnabled: boolean;
  isThrottlingEnabled: boolean;
  setInputs: (inputs: MIDIDeviceInfo[]) => void;
  setOutputs: (outputs: MIDIDeviceInfo[]) => void;
  setSelectedInput: (id: string | null) => void;
  setSelectedDawInput: (id: string | null) => void;
  setSelectedOutput: (id: string | null) => void;
  setIsConnected: (isConnected: boolean) => void;
  setPitchValue: (value: number) => void;
  setModulationValue: (value: number) => void;
  setControlState: (control: keyof MIDIState['controlStates'], state: boolean) => void;
  setCurrentPadMode: (mode: number) => void;
  setKnobValue: (index: number, value: number) => void;
  setButtonState: (index: number, state: boolean, velocity?: number) => void;
  setKeyState: (index: number, state: boolean, velocity?: number) => void;
  setActiveNotes: (midiNote: number, isActive: boolean) => void;
  setButtonSettings: (mode: PadMode, buttonIndex: number, settings: ButtonSettings) => void;
  addMIDIHistory: (entry: Omit<MIDIHistoryEntry, 'timestamp'>) => void;
  clearMIDIHistory: () => void;
  setIsLoggingEnabled: (enabled: boolean) => void;
  setIsThrottlingEnabled: (enabled: boolean) => void;
}