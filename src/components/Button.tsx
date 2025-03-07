import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Copy } from 'lucide-react';
import { useMIDIStore } from '../store/midiStore';
import { PadMode, PadNotesInMode, MIDIChannel } from '../utils/midiMessageDefinition';
import { midiMessage } from '../utils/midiMessage';
import { ButtonSettings } from '../types/midi';
import { syncButtonSettings } from '../services/midi/buttonSync';

type ColorMode = 'SOLID' | 'FLASH' | 'PULSE';

const getChannelForMode = (padMode: PadMode, colorMode: ColorMode): number => {
  if (padMode === PadMode.SESSION) {
    return colorMode === 'SOLID' ? MIDIChannel.CH1 :
           colorMode === 'FLASH' ? MIDIChannel.CH2 :
           MIDIChannel.CH3;
  } else { // DRUM mode
    return colorMode === 'SOLID' ? MIDIChannel.CH10 :
           colorMode === 'FLASH' ? MIDIChannel.CH11 :
           MIDIChannel.CH12;
  }
};

interface ButtonProps {
  index: number;
  row: number;
  padMode: PadMode;
}

export const Button: React.FC<ButtonProps> = ({ index, row, padMode }) => {
  const {
    buttonStates,
    buttonVelocities,
    selectedOutput,
    addMIDIHistory,
    buttonSettings,
    setButtonSettings
  } = useMIDIStore();

  const buttonIndex = row * 8 + index;
  const savedSettings = buttonSettings[padMode][buttonIndex];

  const [showMenu, setShowMenu] = useState(false);
  const [colorMode, setColorMode] = useState<ColorMode>(savedSettings?.colorMode || 'SOLID');
  const [colorValue, setColorValue] = useState((savedSettings?.colorValue || 0).toString());
  const [flashEnabled, setFlashEnabled] = useState(savedSettings?.flashEnabled || false);
  const [flashValue, setFlashValue] = useState((savedSettings?.flashValue || 0).toString());
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [showMultiSelect, setShowMultiSelect] = useState(false);
  const [selectedButtons, setSelectedButtons] = useState<number[]>([]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setPopupPosition({ x: e.clientX, y: e.clientY });
    setShowMenu(true);
  };

  const sendMIDIMessage = async (value: number, isFlash: boolean = false) => {
    try {
      const midiAccess = await navigator.requestMIDIAccess();
      const output = midiAccess.outputs.get(selectedOutput!);
      
      if (output && midiNote) {
        const channel = getChannelForMode(padMode, isFlash ? 'FLASH' : colorMode);
        const colorValueNum = Math.min(127, Math.max(0, value));
        
        const message = midiMessage({
          channel,
          status: 0x90, // Note On
          data1: midiNote,
          data2: colorValueNum
        });

        output.send(message.midi);
        addMIDIHistory({
          direction: 'out',
          message: message.midi,
          params: message.params,
          source: 'manual'
        });
      }
    } catch (error) {
      console.error('Failed to send MIDI message:', error);
    }
  };

  const handleApply = async () => {
    const solidValue = parseInt(colorValue) || 0;
    await sendMIDIMessage(solidValue);

    // Save settings
    const newSettings: ButtonSettings = {
      colorMode,
      colorValue: solidValue,
      flashEnabled: colorMode === 'SOLID' ? flashEnabled : false,
      flashValue: colorMode === 'SOLID' && flashEnabled ? (parseInt(flashValue) || 0) : undefined
    };
    setButtonSettings(padMode, buttonIndex, newSettings);

    // Send flash message if enabled
    if (colorMode === 'SOLID' && flashEnabled) {
      await sendMIDIMessage(parseInt(flashValue) || 0, true);
    }
  };

  const handlePrevious = () => {
    const newValue = Math.max(0, (parseInt(colorValue) || 0) - 1);
    setColorValue(newValue.toString());
    
    // Send SOLID message
    sendMIDIMessage(newValue);
    
    // Send FLASH message if enabled
    if (colorMode === 'SOLID' && flashEnabled) {
      sendMIDIMessage(parseInt(flashValue) || 0, true);
    }
    
    // Save settings
    const newSettings: ButtonSettings = {
      colorMode,
      colorValue: newValue,
      flashEnabled: colorMode === 'SOLID' ? flashEnabled : false,
      flashValue: colorMode === 'SOLID' && flashEnabled ? (parseInt(flashValue) || 0) : undefined
    };
    setButtonSettings(padMode, buttonIndex, newSettings);
  };

  const handleNext = () => {
    const newValue = Math.min(127, (parseInt(colorValue) || 0) + 1);
    setColorValue(newValue.toString());
    
    // Send SOLID message
    sendMIDIMessage(newValue);
    
    // Send FLASH message if enabled
    if (colorMode === 'SOLID' && flashEnabled) {
      sendMIDIMessage(parseInt(flashValue) || 0, true);
    }
    
    // Save settings
    const newSettings: ButtonSettings = {
      colorMode,
      colorValue: newValue,
      flashEnabled: colorMode === 'SOLID' ? flashEnabled : false,
      flashValue: colorMode === 'SOLID' && flashEnabled ? (parseInt(flashValue) || 0) : undefined
    };
    setButtonSettings(padMode, buttonIndex, newSettings);
  };

  const handleFlashPrevious = () => {
    const newValue = Math.max(0, (parseInt(flashValue) || 0) - 1);
    setFlashValue(newValue.toString());
    sendMIDIMessage(newValue, true);
    
    // Save settings
    const newSettings: ButtonSettings = {
      colorMode,
      colorValue: parseInt(colorValue) || 0,
      flashEnabled: true,
      flashValue: newValue
    };
    setButtonSettings(padMode, buttonIndex, newSettings);
  };

  const handleFlashNext = () => {
    const newValue = Math.min(127, (parseInt(flashValue) || 0) + 1);
    setFlashValue(newValue.toString());
    sendMIDIMessage(newValue, true);
    
    // Save settings
    const newSettings: ButtonSettings = {
      colorMode,
      colorValue: parseInt(colorValue) || 0,
      flashEnabled: true,
      flashValue: newValue
    };
    setButtonSettings(padMode, buttonIndex, newSettings);
  };

  const handleApplyToSelected = async () => {
    if (selectedButtons.length === 0) return;
    
    // Create temporary settings map with only the selected buttons
    const tempSettings: ButtonSettingsMap = {
      [PadMode.DRUM]: {},
      [PadMode.SESSION]: {},
      [PadMode.CUSTOM]: {},
    };

    const newSettings: ButtonSettings = {
      colorMode,
      colorValue: parseInt(colorValue) || 0,
      flashEnabled: colorMode === 'SOLID' ? flashEnabled : false,
      flashValue: colorMode === 'SOLID' && flashEnabled ? (parseInt(flashValue) || 0) : undefined
    };

    // Add selected buttons to temporary settings map
    for (const index of selectedButtons) {
      tempSettings[padMode][index] = newSettings;
      setButtonSettings(padMode, index, newSettings);
    }

    // Use syncButtonSettings to apply all changes at once
    await syncButtonSettings(selectedOutput!, tempSettings, addMIDIHistory);

    setShowMultiSelect(false);
    setSelectedButtons([]);
    setShowMenu(false);
  };

  const handleSelectGroup = (group: 'all' | 'top' | 'bottom' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight') => {
    let newSelection: number[] = [];
    switch (group) {
      case 'all':
        newSelection = Array.from({ length: 16 }, (_, i) => i);
        break;
      case 'top':
        newSelection = Array.from({ length: 8 }, (_, i) => i);
        break;
      case 'bottom':
        newSelection = Array.from({ length: 8 }, (_, i) => i + 8);
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
    setSelectedButtons(newSelection);
  };

  const midiNote = PadNotesInMode[padMode]?.[row]?.[index];
  const isPressed = buttonStates[buttonIndex];
  const velocity = buttonVelocities[buttonIndex];

  if (!midiNote) {
    return (
      <div className="w-12 h-12 bg-gray-200 flex items-center justify-center text-gray-400">
        N/A
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        className={`w-16 h-16 rounded-lg transition-all relative shadow-md ${
          isPressed ? 'shadow-inner' : ''
        } transform hover:scale-105`}
        style={{
          backgroundColor: savedSettings && (savedSettings.colorValue > 0 || (savedSettings.colorMode === 'SOLID' && savedSettings.flashEnabled && savedSettings.flashValue !== undefined))
            ? `hsl(${(savedSettings.colorValue / 127) * 360}, 70%, ${isPressed ? 45 : 55}%)`
            : isPressed
            ? '#3B82F6'
            : '#4B5563'
        }}
        onClick={handleClick}
      >
        <div className="text-white text-xs flex flex-col items-center">
          <span>{midiNote}</span>
          {savedSettings && savedSettings.colorMode === 'SOLID' && savedSettings.flashEnabled && savedSettings.flashValue !== undefined && (
            <>
              <span className="text-[10px] opacity-75">
                {`${savedSettings.colorMode[0]}${savedSettings.colorValue}+F${savedSettings.flashValue}`}
              </span>
              {savedSettings.colorValue === 0 && (
                <div 
                  className="absolute inset-0 rounded-lg"
                  style={{
                    backgroundColor: `hsl(${(savedSettings.flashValue / 127) * 360}, 70%, ${isPressed ? 45 : 55}%)`,
                    opacity: 0.5
                  }}
                />
              )}
            </>
          )}
        </div>
        {isPressed && velocity !== undefined && (
          <div className="absolute bottom-1 right-1 text-xs text-white bg-black bg-opacity-50 px-1 rounded">
            {velocity}
          </div>
        )}
      </button>

      {showMenu && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowMenu(false)}
          >
            <div 
              className="absolute z-50 mt-2 w-64 bg-white rounded-lg shadow-xl"
              style={{
                left: `${Math.min(window.innerWidth - 256, Math.max(0, popupPosition.x))}px`,
                top: `${Math.min(window.innerHeight - 300, Math.max(0, popupPosition.y))}px`
              }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-medium">Button Settings</h3>
                <button
                  onClick={() => setShowMenu(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color Mode
                  </label>
                  <select
                    value={colorMode}
                    onChange={(e) => setColorMode(e.target.value as ColorMode)}
                    className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="SOLID">Solid</option>
                    <option value="PULSE">Pulse</option>
                  </select>
                </div>
  
                <div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Color Value (0-127)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="127"
                      value={colorValue}
                      onChange={(e) => setColorValue(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
  
                  {colorMode === 'SOLID' && (
                    <div className="mt-4 space-y-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={flashEnabled} 
                          onChange={async (e) => {
                            const isEnabled = e.target.checked;
                            setFlashEnabled(isEnabled);
                            if (isEnabled) {
                              const initialValue = '0';
                              setFlashValue(initialValue);
                              await sendMIDIMessage(parseInt(initialValue), true);
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm font-medium text-gray-700">Enable Flash</span>
                      </label>
                      {flashEnabled && (
                        <input
                          type="number"
                          min="0"
                          max="127"
                          value={flashValue}
                          onChange={(e) => setFlashValue(e.target.value)}
                          className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Flash Value (0-127)"
                        />
                      )}
                    </div>
                  )}
                </div>
  
                <div className="flex gap-2">
                  <button
                    onClick={handlePrevious}
                    disabled={!selectedOutput || parseInt(colorValue) <= 0}
                    className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="mx-auto" size={20} />
                  </button>
                  <button
                    onClick={handleApply}
                    disabled={!selectedOutput}
                    className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Apply
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={!selectedOutput || parseInt(colorValue) >= 127}
                    className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="mx-auto" size={20} />
                  </button>
                </div>
                
                {colorMode === 'SOLID' && flashEnabled && (
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={handleFlashPrevious}
                      disabled={!selectedOutput || parseInt(flashValue) <= 0}
                      className="flex-1 bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="mx-auto" size={20} />
                    </button>
                    <div className="flex-1 text-center py-2 text-sm font-medium text-gray-600">
                      Flash Controls
                    </div>
                    <button
                      onClick={handleFlashNext}
                      disabled={!selectedOutput || parseInt(flashValue) >= 127}
                      className="flex-1 bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="mx-auto" size={20} />
                    </button>
                  </div>
                )}
                
                <div className="pt-2 mt-2 border-t text-center">
                  <button
                    onClick={() => setShowMultiSelect(true)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Apply to multiple buttons...
                  </button>
                </div>
              </div>
  
              <div className="px-4 py-3 bg-gray-50 text-xs text-gray-500 rounded-b-lg">
                Note: {midiNote} | Channel: {getChannelForMode(padMode, flashEnabled ? 'FLASH' : colorMode) + 1}
              </div>
            </div>
          </div>
          
          {showMultiSelect && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-[520px] p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Select Buttons to Apply</h3>
                  <button onClick={() => setShowMultiSelect(false)} className="text-gray-500">
                    <X size={20} />
                  </button>
                </div>
                
                <div className="relative">
                  <div className="grid grid-cols-[auto_1fr_auto] gap-4 items-center">
                    {/* Left side selections */}
                    <div className="space-y-2">
                      <button
                        onClick={() => handleSelectGroup('topLeft')}
                        className="block w-20 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700"
                      >
                        Top Left
                      </button>
                      <button
                        onClick={() => handleSelectGroup('bottomLeft')}
                        className="block w-20 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700"
                      >
                        Bottom Left
                      </button>
                    </div>

                    {/* Center content */}
                    <div className="space-y-4">
                      {/* Top row selection */}
                      <div className="text-center">
                        <button
                          onClick={() => handleSelectGroup('top')}
                          className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700"
                        >
                          Top Row
                        </button>
                      </div>

                      {/* Main 16-button grid */}
                      <div className="grid grid-cols-8 gap-2">
                        {Array.from({ length: 16 }, (_, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              setSelectedButtons(prev =>
                                prev.includes(i)
                                  ? prev.filter(b => b !== i)
                                  : [...prev, i]
                              );
                            }}
                            className={`w-10 h-10 rounded ${
                              selectedButtons.includes(i)
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                          >
                            {i + 1}
                          </button>
                        ))}
                      </div>

                      {/* Bottom row selection */}
                      <div className="text-center">
                        <button
                          onClick={() => handleSelectGroup('bottom')}
                          className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700"
                        >
                          Bottom Row
                        </button>
                      </div>
                    </div>

                    {/* Right side selections */}
                    <div className="space-y-2">
                      <button
                        onClick={() => handleSelectGroup('topRight')}
                        className="block w-20 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700"
                      >
                        Top Right
                      </button>
                      <button
                        onClick={() => handleSelectGroup('bottomRight')}
                        className="block w-20 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700"
                      >
                        Bottom Right
                      </button>
                    </div>
                  </div>

                  {/* Global controls */}
                  <div className="flex justify-between items-center mt-6 pt-4 border-t">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSelectGroup('all')}
                        className="px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 rounded-full text-blue-700"
                      >
                        Select All
                      </button>
                      <button
                        onClick={() => setSelectedButtons([])}
                        className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700"
                      >
                        Clear
                      </button>
                    </div>
                    <button
                      onClick={handleApplyToSelected}
                      disabled={selectedButtons.length === 0}
                      className="px-4 py-2 bg-blue-500 text-white text-sm hover:bg-blue-600 rounded-full disabled:opacity-50"
                    >
                      Apply to Selected ({selectedButtons.length})
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};