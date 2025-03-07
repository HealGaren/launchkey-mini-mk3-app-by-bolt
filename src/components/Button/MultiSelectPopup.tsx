import React from 'react';
import { X } from 'lucide-react';

interface MultiSelectPopupProps {
  selectedButtons: number[];
  onClose: () => void;
  onSelectGroup: (group: 'all' | 'top' | 'bottom' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight') => void;
  onButtonToggle: (index: number) => void;
  onClear: () => void;
  onApply: () => void;
}

export const MultiSelectPopup: React.FC<MultiSelectPopupProps> = ({
  selectedButtons,
  onClose,
  onSelectGroup,
  onButtonToggle,
  onClear,
  onApply,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-[520px] p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Select Buttons to Apply</h3>
          <button onClick={onClose} className="text-gray-500">
            <X size={20} />
          </button>
        </div>
        
        <div className="relative">
          <div className="grid grid-cols-[auto_1fr_auto] gap-4 items-center">
            {/* Left side selections */}
            <div className="space-y-2">
              <button
                onClick={() => onSelectGroup('topLeft')}
                className="block w-20 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700"
              >
                Top Left
              </button>
              <button
                onClick={() => onSelectGroup('bottomLeft')}
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
                  onClick={() => onSelectGroup('top')}
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
                    onClick={() => onButtonToggle(i)}
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
                  onClick={() => onSelectGroup('bottom')}
                  className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700"
                >
                  Bottom Row
                </button>
              </div>
            </div>

            {/* Right side selections */}
            <div className="space-y-2">
              <button
                onClick={() => onSelectGroup('topRight')}
                className="block w-20 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700"
              >
                Top Right
              </button>
              <button
                onClick={() => onSelectGroup('bottomRight')}
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
                onClick={() => onSelectGroup('all')}
                className="px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 rounded-full text-blue-700"
              >
                Select All
              </button>
              <button
                onClick={onClear}
                className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700"
              >
                Clear
              </button>
            </div>
            <button
              onClick={onApply}
              disabled={selectedButtons.length === 0}
              className="px-4 py-2 bg-blue-500 text-white text-sm hover:bg-blue-600 rounded-full disabled:opacity-50"
            >
              Apply to Selected ({selectedButtons.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};