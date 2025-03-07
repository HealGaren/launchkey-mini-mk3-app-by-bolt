import React from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { ColorMode, ButtonSettings } from '../../types/midi';
import { PadMode } from '../../utils/midiMessageDefinition';

interface ButtonPopupProps {
  colorMode: ColorMode;
  colorValue: string;
  flashEnabled: boolean;
  flashValue: string;
  selectedOutput: string | null;
  onClose: () => void;
  onColorModeChange: (mode: ColorMode) => void;
  onColorValueChange: (value: string) => void;
  onFlashEnabledChange: (enabled: boolean) => void;
  onFlashValueChange: (value: string) => void;
  onPrevious: () => void;
  onNext: () => void;
  onFlashPrevious: () => void;
  onFlashNext: () => void;
  onApply: () => void;
  onShowMultiSelect?: () => void;
  midiNote: number;
  padMode: PadMode;
  getChannelForMode: (padMode: PadMode, colorMode: ColorMode) => number;
  position: { x: number; y: number };
}

export const ButtonPopup: React.FC<ButtonPopupProps> = ({
  colorMode,
  colorValue,
  flashEnabled,
  flashValue,
  selectedOutput,
  onClose,
  onColorModeChange,
  onColorValueChange,
  onFlashEnabledChange,
  onFlashValueChange,
  onPrevious,
  onNext,
  onFlashPrevious,
  onFlashNext,
  onApply,
  onShowMultiSelect,
  midiNote,
  padMode,
  getChannelForMode,
  position,
}) => {
  return (
    <div 
      className="absolute z-50 mt-2 w-64 bg-white rounded-lg shadow-xl"
      style={{
        left: `${Math.min(window.innerWidth - 256, Math.max(0, position.x))}px`,
        top: `${Math.min(window.innerHeight - 300, Math.max(0, position.y))}px`
      }}
    >
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-lg font-medium">Button Settings</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
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
            onChange={(e) => onColorModeChange(e.target.value as ColorMode)}
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
              onChange={(e) => onColorValueChange(e.target.value)}
              className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {colorMode === 'SOLID' && (
            <div className="mt-4 space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={flashEnabled} 
                  onChange={(e) => {
                    onFlashEnabledChange(e.target.checked);
                    if (e.target.checked && !flashValue) {
                      onFlashValueChange('0');
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
                  onChange={(e) => onFlashValueChange(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Flash Value (0-127)"
                />
              )}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={onPrevious}
            disabled={!selectedOutput || parseInt(colorValue) <= 0}
            className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="mx-auto" size={20} />
          </button>
          <button
            onClick={onApply}
            disabled={!selectedOutput}
            className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Apply
          </button>
          <button
            onClick={onNext}
            disabled={!selectedOutput || parseInt(colorValue) >= 127}
            className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="mx-auto" size={20} />
          </button>
        </div>
        
        {colorMode === 'SOLID' && flashEnabled && (
          <div className="flex gap-2 mt-2">
            <button
              onClick={onFlashPrevious}
              disabled={!selectedOutput || parseInt(flashValue) <= 0}
              className="flex-1 bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="mx-auto" size={20} />
            </button>
            <div className="flex-1 text-center py-2 text-sm font-medium text-gray-600">
              Flash Controls
            </div>
            <button
              onClick={onFlashNext}
              disabled={!selectedOutput || parseInt(flashValue) >= 127}
              className="flex-1 bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="mx-auto" size={20} />
            </button>
          </div>
        )}
        
        {onShowMultiSelect && (
          <div className="pt-2 mt-2 border-t text-center">
            <button
              onClick={onShowMultiSelect}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Apply to multiple buttons...
            </button>
          </div>
        )}
      </div>

      <div className="px-4 py-3 bg-gray-50 text-xs text-gray-500 rounded-b-lg">
        Note: {midiNote} | Channel: {getChannelForMode(padMode, flashEnabled ? 'FLASH' : colorMode) + 1}
      </div>
    </div>
  );
};