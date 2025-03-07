-import { X, ChevronLeft, ChevronRight, Copy } from 'lucide-react';
+import { ButtonPopup } from './ButtonPopup';
+import { MultiSelectPopup } from './MultiSelectPopup';
import { useMIDIStore } from '../store/midiStore';
+import { PadMode, PadNotesInMode } from '../utils/midiMessageDefinition';
import { midiMessage } from '../utils/midiMessage';
import { syncButtonSettings } from '../../services/midi/buttonSync';
+import { getChannelForMode } from '../utils/midiChannels';

interface ButtonProps {
  index: number;
  row: number;
}

export const Button: React.FC<ButtonProps> = ({ index, row }) => {
  const { selectedOutput, buttonSettings, setButtonSettings, padMode, addMIDIHistory } = useMIDIStore();
  const buttonIndex = row * 8 + index;
  const savedSettings = buttonSettings[padMode][buttonIndex];

  const [state, setState] = useState({
    showMenu: false,
    colorMode: savedSettings?.colorMode || 'SOLID',
    colorValue: (savedSettings?.colorValue || 0).toString(),
    flashEnabled: savedSettings?.flashEnabled || false,
    flashValue: (savedSettings?.flashValue || 0).toString(),
    popupPosition: { x: 0, y: 0 },
    showMultiSelect: false,
    selectedButtons: [] as number[]
  });

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setState(prev => ({
      ...prev,
      popupPosition: { x: e.clientX, y: e.clientY },
      showMenu: true
    }));
  };

  const sendMIDIMessage = async (value: number, isFlash: boolean = false) => {
    if (!selectedOutput) return;

    try {
      const midiAccess = await navigator.requestMIDIAccess();
      const output = midiAccess.outputs.get(selectedOutput!);
      
      if (output && midiNote) {
        const channel = getChannelForMode(padMode, isFlash ? 'FLASH' : state.colorMode);
        const colorValueNum = Math.min(127, Math.max(0, value));
        
        const message = midiMessage({
          note: midiNote,
          velocity: colorValueNum,
          channel: channel
        });

        output.send(message);
        
        addMIDIHistory({
          type: 'output',
          note: midiNote,
          velocity: colorValueNum,
          channel: channel,
          timestamp: Date.now()
        });
      }
    } catch (error) {
      console.error('Failed to send MIDI message:', error);
    }
  };

  const handleApply = async () => {
    const solidValue = parseInt(state.colorValue) || 0;
    await sendMIDIMessage(solidValue);

    // Save settings
    const newSettings: ButtonSettings = {
      colorMode: state.colorMode,
      colorValue: solidValue,
      flashEnabled: state.colorMode === 'SOLID' ? state.flashEnabled : false,
      flashValue: state.colorMode === 'SOLID' && state.flashEnabled ? (parseInt(state.flashValue) || 0) : undefined
    };
    setButtonSettings(padMode, buttonIndex, newSettings);

    // Send flash message if enabled
    if (state.colorMode === 'SOLID' && state.flashEnabled) {
      await sendMIDIMessage(parseInt(state.flashValue) || 0, true);
    }
  };

  const handlePrevious = () => {
    const newValue = Math.max(0, (parseInt(state.colorValue) || 0) - 1);
    setState(prev => ({ ...prev, colorValue: newValue.toString() }));
    
    // Send SOLID message
    sendMIDIMessage(newValue);
    
    // Send FLASH message if enabled
    if (state.colorMode === 'SOLID' && state.flashEnabled) {
      sendMIDIMessage(parseInt(state.flashValue) || 0, true);
    }
    
    // Save settings
    const newSettings: ButtonSettings = {
      colorMode: state.colorMode,
      colorValue: newValue,
      flashEnabled: state.colorMode === 'SOLID' ? state.flashEnabled : false,
      flashValue: state.colorMode === 'SOLID' && state.flashEnabled ? (parseInt(state.flashValue) || 0) : undefined
    };
    setButtonSettings(padMode, buttonIndex, newSettings);
  };

  const handleNext = () => {
    const newValue = Math.min(127, (parseInt(state.colorValue) || 0) + 1);
    setState(prev => ({ ...prev, colorValue: newValue.toString() }));
    
    // Send SOLID message
    sendMIDIMessage(newValue);
    
    // Send FLASH message if enabled
    if (state.colorMode === 'SOLID' && state.flashEnabled) {
      sendMIDIMessage(parseInt(state.flashValue) || 0, true);
    }
    
    // Save settings
    const newSettings: ButtonSettings = {
      colorMode: state.colorMode,
      colorValue: newValue,
      flashEnabled: state.colorMode === 'SOLID' ? state.flashEnabled : false,
      flashValue: state.colorMode === 'SOLID' && state.flashEnabled ? (parseInt(state.flashValue) || 0) : undefined
    };
    setButtonSettings(padMode, buttonIndex, newSettings);
  };

  const handleFlashPrevious = () => {
    const newValue = Math.max(0, (parseInt(state.flashValue) || 0) - 1);
    setState(prev => ({ ...prev, flashValue: newValue.toString() }));
    sendMIDIMessage(newValue, true);
    
    // Save settings
    const newSettings: ButtonSettings = {
      colorMode: state.colorMode,
      colorValue: parseInt(state.colorValue) || 0,
      flashEnabled: true,
      flashValue: newValue
    };
    setButtonSettings(padMode, buttonIndex, newSettings);
  };

  const handleFlashNext = () => {
    const newValue = Math.min(127, (parseInt(state.flashValue) || 0) + 1);
    setState(prev => ({ ...prev, flashValue: newValue.toString() }));
    sendMIDIMessage(newValue, true);
    
    // Save settings
    const newSettings: ButtonSettings = {
      colorMode: state.colorMode,
      colorValue: parseInt(state.colorValue) || 0,
      flashEnabled: true,
      flashValue: newValue
    };
    setButtonSettings(padMode, buttonIndex, newSettings);
  };

  const handleApplyToSelected = async () => {
    if (state.selectedButtons.length === 0) return;
    
    // Create temporary settings map with only the selected buttons
    const tempSettings: ButtonSettingsMap = {
      [PadMode.SESSION]: {},
      [PadMode.DRUM]: {}
    };

    const newSettings: ButtonSettings = {
      colorMode: state.colorMode,
      colorValue: parseInt(state.colorValue) || 0,
      flashEnabled: state.colorMode === 'SOLID' ? state.flashEnabled : false,
      flashValue: state.colorMode === 'SOLID' && state.flashEnabled ? (parseInt(state.flashValue) || 0) : undefined
    };

    // Add selected buttons to temporary settings map
    for (const index of state.selectedButtons) {
      tempSettings[padMode][index] = newSettings;
      setButtonSettings(padMode, index, newSettings);
    }

    // Use syncButtonSettings to apply all changes at once
    await syncButtonSettings(selectedOutput!, tempSettings, addMIDIHistory);

    setState(prev => ({
      ...prev,
      showMultiSelect: false,
      selectedButtons: [],
      showMenu: false
    }));
  };

  const handleSelectGroup = (group: 'all' | 'top' | 'bottom' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight') => {
    let newSelection: number[] = [];
    switch (group) {
      case 'all':
        newSelection = Array.from({ length: 16 }, (_, i) => i);
        break;
      case 'top':
        newSelection = [0, 1, 2, 3, 4, 5, 6, 7];
        break;
      case 'bottom':
        newSelection = [8, 9, 10, 11, 12, 13, 14, 15];
        break;
      case 'topLeft':
        newSelection = [0, 1, 2, 3];
        break;
      case 'topRight':
        newSelection = [4, 5, 6, 7];
        break;
      case 'bottomLeft':
        newSelection = [8, 9, 10, 11];
        break;
      case 'bottomRight':
        newSelection = [12, 13, 14, 15];
        break;
    }
    setState(prev => ({ ...prev, selectedButtons: newSelection }));
  };

  const midiNote = PadNotesInMode[padMode]?.[row]?.[index];

  return (
    <div className="relative">
      <button
        className={`w-16 h-16 border border-gray-600 rounded-lg flex items-center justify-center 
                   ${savedSettings ? 'bg-blue-500' : 'bg-gray-700'} 
                   hover:bg-blue-600 transition-colors`}
        onClick={handleClick}
      >
        {midiNote}
      </button>

      {showMenu && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setState(prev => ({ ...prev, showMenu: false }))}
        >
          <ButtonPopup
            colorMode={state.colorMode}
            colorValue={state.colorValue}
            flashEnabled={state.flashEnabled}
            flashValue={state.flashValue}
            selectedOutput={selectedOutput}
            onClose={() => setState(prev => ({ ...prev, showMenu: false }))}
            onColorModeChange={(mode) => setState(prev => ({ ...prev, colorMode: mode }))}
            onColorValueChange={(value) => setState(prev => ({ ...prev, colorValue: value }))}
            onFlashEnabledChange={(enabled) => setState(prev => ({ ...prev, flashEnabled: enabled }))}
            onFlashValueChange={(value) => setState(prev => ({ ...prev, flashValue: value }))}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onFlashPrevious={handleFlashPrevious}
            onFlashNext={handleFlashNext}
            onApply={handleApply}
            onShowMultiSelect={() => setState(prev => ({ ...prev, showMultiSelect: true }))}
            midiNote={midiNote}
            padMode={padMode}
            getChannelForMode={getChannelForMode}
            position={state.popupPosition}
          />
        </div>
      )}
          
      {state.showMultiSelect && (
        <MultiSelectPopup
          selectedButtons={state.selectedButtons}
          onClose={() => setState(prev => ({ ...prev, showMultiSelect: false }))}
          onSelectGroup={handleSelectGroup}
          onButtonToggle={(i) => {
            setState(prev => ({
              ...prev,
              selectedButtons: prev.selectedButtons.includes(i)
                ? prev.selectedButtons.filter(b => b !== i)
                : [...prev.selectedButtons, i]
            }));
          }}
          onClear={() => setState(prev => ({ ...prev, selectedButtons: [] }))}
          onApply={handleApplyToSelected}
        />
      )}
    </div>
  );
};