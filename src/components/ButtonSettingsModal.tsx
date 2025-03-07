import React, { useState, useRef, useEffect } from 'react';
import { X, Copy } from 'lucide-react';
import { useMIDIStore } from '../store/midiStore';
import { ButtonSettings } from '../types/midi';
import { PadMode } from '../utils/midiMessageDefinition';
import { syncButtonSettings } from '../services/midi/buttonSync';

interface ButtonSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ButtonSettingsModal: React.FC<ButtonSettingsModalProps> = ({ isOpen, onClose }) => {
  const { 
    buttonSettings, 
    setButtonSettings, 
    selectedOutput, 
    addMIDIHistory 
  } = useMIDIStore();
  const [settingsText, setSettingsText] = useState(() => 
    JSON.stringify(buttonSettings || {}, null, 2)
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Update settings text when buttonSettings changes
  useEffect(() => {
    setSettingsText(JSON.stringify(buttonSettings || {}, null, 2));
  }, [buttonSettings]);

  const handleCopy = () => {
    if (textareaRef.current) {
      textareaRef.current.select();
      navigator.clipboard.writeText(textareaRef.current.value);
    }
  };

  const handleApply = () => {
    try {
      const settings = JSON.parse(settingsText);
      
      // Validate and update all settings at once
      if (!settings || typeof settings !== 'object') {
        throw new Error('Invalid settings format: must be an object');
      }
      
      // Clear all existing settings first
      const defaultSettings = {
        [PadMode.DRUM]: {},
        [PadMode.SESSION]: {},
        [PadMode.CUSTOM]: {},
        controls: {}
      };
      
      for (const mode in defaultSettings) {
        if (!(mode in settings)) {
          settings[mode] = {};
        }
      }
      
      // Validate pad modes
      for (const mode in settings) {
        if (mode === 'controls') continue;
        
        const padMode = parseInt(mode);
        if (![PadMode.DRUM, PadMode.SESSION, PadMode.CUSTOM].includes(padMode)) {
          throw new Error(`Invalid pad mode: ${mode}`);
        }
      }
      
      // Update the entire settings object at once
      for (const [mode, modeSettings] of Object.entries(settings)) {
        if (mode === 'controls') {
          // Clear existing control settings
          Object.keys(buttonSettings.controls).forEach(ccNumber => {
            setButtonSettings(1, -1, null, parseInt(ccNumber));
          });
          
          // Set new control settings
          Object.entries(modeSettings as Record<string, ButtonSettings>).forEach(([ccNumber, settings]) => {
            setButtonSettings(1, -1, settings, parseInt(ccNumber));
          });
        } else {
          const padMode = parseInt(mode);
          
          // Clear existing pad settings
          Object.keys(buttonSettings[padMode]).forEach(index => {
            setButtonSettings(padMode, parseInt(index), null);
          });
          
          // Set new pad settings
          Object.entries(modeSettings as Record<string, ButtonSettings>).forEach(([index, settings]) => {
            const buttonIndex = parseInt(index);
            if (isNaN(buttonIndex) || buttonIndex < 0 || buttonIndex > 15) {
              throw new Error(`Invalid button index: ${index}`);
            }
            setButtonSettings(padMode, buttonIndex, settings);
          });
        }
      }

      // Sync the current mode's button settings if connected
      if (selectedOutput) {
        syncButtonSettings(selectedOutput, settings, addMIDIHistory);
      }

      onClose();
    } catch (error) {
      alert('Invalid settings format: ' + (error as Error).message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Button Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          <div className="flex justify-end mb-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
            >
              <Copy size={16} />
              Copy
            </button>
          </div>
          <textarea
            ref={textareaRef}
            value={settingsText}
            onChange={(e) => setSettingsText(e.target.value)}
            className="w-full h-96 font-mono text-sm p-4 border rounded"
            spellCheck={false}
          />
        </div>

        <div className="flex justify-end gap-3 p-4 bg-gray-50 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded"
          >
            Apply Settings
          </button>
        </div>
      </div>
    </div>
  );
};