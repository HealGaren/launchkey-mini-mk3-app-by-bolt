import React, { useState } from 'react';
import { useMIDIStore } from '../../store/midiStore';
import { ButtonSettings, ButtonSettingsMap } from '../../types/midi';
import { ButtonPopup } from '../Button/ButtonPopup';
import { MIDIStatus, MIDIChannel } from '../../utils/midiMessageDefinition';
import { midiMessage } from '../../utils/midiMessage';

interface ControlButtonProps {
  isPressed: boolean;
  isControl?: boolean;
  className?: string;
  children: React.ReactNode;
  ccNumber: number;
  channel: number;
}

export const ControlButton: React.FC<ControlButtonProps> = ({
  isPressed,
  isControl = false,
  className = '',
  children,
  ccNumber,
  channel
}) => {
  const isShiftButton = ccNumber === 108;
  const { selectedOutput, addMIDIHistory, buttonSettings, setButtonSettings } = useMIDIStore();
  const [showMenu, setShowMenu] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const savedSettings = buttonSettings?.controls?.[ccNumber] || {
    colorMode: 'SOLID',
    colorValue: 0
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isShiftButton) {
      alert('Color settings are not available for the Shift button');
      return;
    }
    setPopupPosition({ x: e.clientX, y: e.clientY });
    setShowMenu(true);
  };

  const sendMIDIMessage = async (value: number, isFlash: boolean = false) => {
    try {
      const midiAccess = await navigator.requestMIDIAccess();
      const output = midiAccess.outputs.get(selectedOutput!);
      
      if (output) {
        const messageChannel = isFlash ? MIDIChannel.CH2 :
                             savedSettings.colorMode === 'PULSE' ? MIDIChannel.CH3 :
                             MIDIChannel.CH1;

        const message = midiMessage({
          channel: messageChannel,
          status: MIDIStatus.CC,
          data1: ccNumber,
          data2: value
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

  const handleSettingsChange = async (newSettings: ButtonSettings) => {
    // Save to global settings
    const tempSettings: ButtonSettingsMap = {
      ...buttonSettings,
      controls: {
        ...buttonSettings.controls,
        [ccNumber]: newSettings
      }
    };
    setButtonSettings(1, -1, newSettings, ccNumber);
    
    // Send solid/pulse color
    await sendMIDIMessage(newSettings.colorValue);
    
    // Send flash color if enabled
    if (newSettings.colorMode === 'SOLID' && newSettings.flashEnabled && newSettings.flashValue !== undefined) {
      await sendMIDIMessage(newSettings.flashValue, true);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={`w-16 flex items-center justify-center rounded-lg transition-all shadow-md transform hover:scale-105 ${
          isControl ? 'h-10' : 'h-16'
        } ${
          isPressed 
            ? 'shadow-inner' 
            : 'hover:bg-gray-400'
        } ${className}`}
        style={{
          backgroundColor: savedSettings.colorValue > 0 || (savedSettings.colorMode === 'SOLID' && savedSettings.flashEnabled && savedSettings.flashValue !== undefined)
            ? `hsl(${(savedSettings.colorValue / 127) * 360}, 70%, ${isPressed ? 45 : 55}%)`
            : isPressed ? '#3B82F6' : '#CBD5E1'
        }}
      >
        <div className={`flex flex-col items-center ${isControl && !isPressed && !savedSettings.colorValue ? 'text-gray-800' : 'text-white'}`}>
          {children}
          {(savedSettings.colorValue > 0 || (savedSettings.colorMode === 'SOLID' && savedSettings.flashEnabled && savedSettings.flashValue !== undefined)) && (
            <div className="text-[10px] opacity-75">
              {savedSettings.colorValue > 0 && `${savedSettings.colorMode[0]}${savedSettings.colorValue}`}
              {savedSettings.flashEnabled && savedSettings.flashValue !== undefined && 
                `+F${savedSettings.flashValue}`}
            </div>
          )}
        </div>
      </button>

      {showMenu && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowMenu(false);
            }
          }}
        >
          <ButtonPopup
            colorMode={savedSettings.colorMode}
            colorValue={savedSettings.colorValue.toString()}
            flashEnabled={savedSettings.flashEnabled || false}
            flashValue={(savedSettings.flashValue || 0).toString()}
            selectedOutput={selectedOutput}
            onClose={() => setShowMenu(false)}
            onColorModeChange={(mode) => handleSettingsChange({ ...savedSettings, colorMode: mode })}
            onColorValueChange={(value) => handleSettingsChange({ ...savedSettings, colorValue: parseInt(value) || 0 })}
           onFlashEnabledChange={(enabled) => {
             const newSettings = { 
               ...savedSettings, 
               flashEnabled: enabled,
               flashValue: enabled ? 0 : undefined 
             };
             handleSettingsChange(newSettings);
           }}
            onFlashValueChange={(value) => handleSettingsChange({ ...savedSettings, flashEnabled: true, flashValue: parseInt(value) || 0 })}
            onPrevious={() => handleSettingsChange({ ...savedSettings, colorValue: Math.max(0, savedSettings.colorValue - 1) })}
            onNext={() => handleSettingsChange({ ...savedSettings, colorValue: Math.min(127, savedSettings.colorValue + 1) })}
            onFlashPrevious={() => savedSettings.flashValue !== undefined && handleSettingsChange({ 
              ...savedSettings, 
              flashValue: Math.max(0, savedSettings.flashValue - 1) 
            })}
            onFlashNext={() => savedSettings.flashValue !== undefined && handleSettingsChange({ 
              ...savedSettings, 
              flashValue: Math.min(127, savedSettings.flashValue + 1) 
            })}
            onApply={() => handleSettingsChange(savedSettings)}
            midiNote={ccNumber}
            padMode={1}
            getChannelForMode={() => channel}
            position={popupPosition}
          />
        </div>
      )}
    </>
  );
};