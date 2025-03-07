import React, { useState } from 'react';
import { Settings as SettingsIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { useMIDIStore } from '../store/midiStore';
import { useMIDIDevices } from '../hooks/useMIDIDevices';
import { BPMControl } from './BPMControl';
import { useMIDIConnection } from '../hooks/useMIDIConnection';

export const Settings: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const {
    inputs,
    outputs,
    isThrottlingEnabled,
    setIsThrottlingEnabled,
    selectedInput,
    selectedDawInput,
    selectedOutput,
    setSelectedInput,
    setSelectedDawInput,
    setSelectedOutput,
  } = useMIDIStore();

  const { toggleConnection, isConnected, canConnect } = useMIDIConnection();
  useMIDIDevices();

  return (
    <div className="fixed top-4 right-4 bg-white rounded-lg shadow-lg z-50">
      <div 
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <SettingsIcon className="w-5 h-5" />
          <h2 className="text-lg font-semibold">Settings</h2>
        </div>
        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </div>
      
      {isExpanded && (
        <div className="p-4 border-t">
          <div className="space-y-4">
            <div className="mb-4">
              <BPMControl />
            </div>
            
            <div className="mb-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isThrottlingEnabled}
                  onChange={(e) => setIsThrottlingEnabled(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="font-medium">Enable MIDI Throttling</span>
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Throttles continuous MIDI signals (knobs, pitch, modulation) to reduce CPU usage
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">General MIDI Input</label>
              <select
                className="w-full p-2 border rounded"
                value={selectedInput || ''}
                onChange={(e) => setSelectedInput(e.target.value || null)}
              >
                <option value="">Select Input Device</option>
                {inputs.map((device) => (
                  <option key={device.id} value={device.id}>
                    {device.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">DAW Mode Control Input</label>
              <select
                className="w-full p-2 border rounded"
                value={selectedDawInput || ''}
                onChange={(e) => setSelectedDawInput(e.target.value || null)}
              >
                <option value="">Select DAW Control Input</option>
                {inputs.map((device) => (
                  <option key={device.id} value={device.id}>
                    {device.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">MIDI Output</label>
              <select
                className="w-full p-2 border rounded"
                value={selectedOutput || ''}
                onChange={(e) => setSelectedOutput(e.target.value || null)}
              >
                <option value="">Select Output Device</option>
                {outputs.map((device) => (
                  <option key={device.id} value={device.id}>
                    {device.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              className={`w-full p-2 rounded ${
                isConnected
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-green-500 hover:bg-green-600'
              } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
              onClick={toggleConnection}
              disabled={!canConnect}
            >
              {isConnected ? 'Disconnect' : 'Connect'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}