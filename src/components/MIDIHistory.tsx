import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Trash2, Send } from 'lucide-react';
import { useMIDIStore } from '../store/midiStore';
import { MIDIHistoryEntry } from '../types/midi';
import { midiMessage } from '../utils/midiMessage';
import { getMIDIMessageDescription } from '../utils/midiMessageDefinition';

const formatNumber = (num: number, base: 'hex' | 'dec'): string => {
  if (base === 'hex') {
    return `0x${num.toString(16).toUpperCase().padStart(2, '0')}`;
  }
  return num.toString();
};

const formatMessage = (message: number[], base: 'hex' | 'dec'): string => {
  return `[${message.map(num => formatNumber(num, base)).join(', ')}]`;
};

const formatTimestamp = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3,
  });
};

const parseNumber = (value: string, base: 'hex' | 'dec'): number | null => {
  try {
    if (base === 'hex') {
      return parseInt(value.replace(/^0x/i, ''), 16);
    }
    return parseInt(value, 10);
  } catch {
    return null;
  }
};

export const MIDIHistory: React.FC = () => {
  const {
    midiHistory,
    clearMIDIHistory,
    selectedOutput,
    addMIDIHistory,
    isLoggingEnabled,
    setIsLoggingEnabled
  } = useMIDIStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [numberBase, setNumberBase] = useState<'hex' | 'dec'>('hex');
  const [manualInput, setManualInput] = useState(['', '', '']);

  const handleManualSend = async () => {
    const message = manualInput.map(val => parseNumber(val, numberBase));
    if (message.some(val => val === null || val < 0 || val > 255)) {
      alert('Invalid MIDI message. Each value must be between 0 and 255.');
      return;
    }

    try {
      const midiAccess = await navigator.requestMIDIAccess();
      const output = midiAccess.outputs.get(selectedOutput);
      
      if (output) {
        const midiMsg = midiMessage({
          channel: message[0] & 0x0F,
          status: message[0] & 0xF0,
          data1: message[1],
          data2: message[2],
        });

        output.send(message as number[]);
        addMIDIHistory({
          direction: 'out',
          message: message as number[],
          params: midiMsg.params,
          source: 'manual'
        });
        setManualInput(['', '', '']);
      }
    } catch (error) {
      console.error('Failed to send MIDI message:', error);
    }
  };

  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-white shadow-lg transition-all duration-300 z-50 overflow-hidden ${
      isExpanded ? 'h-[480px]' : 'h-auto'
    }`}>
      <div
        className="flex items-center justify-between p-4 bg-gray-100 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">MIDI History</h2>
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isLoggingEnabled}
              onChange={(e) => setIsLoggingEnabled(e.target.checked)}
              onClick={(e) => e.stopPropagation()}
              className="rounded border-gray-300"
            />
            <span className="text-sm" onClick={(e) => e.stopPropagation()}>
              Enable Logging
            </span>
          </label>
          <select
            className="px-2 py-1 rounded border"
            value={numberBase}
            onChange={(e) => setNumberBase(e.target.value as 'hex' | 'dec')}
            onClick={(e) => e.stopPropagation()}
          >
            <option value="hex">Hexadecimal</option>
            <option value="dec">Decimal</option>
          </select>
          <button
            className="text-red-500 hover:text-red-700"
            onClick={(e) => {
              e.stopPropagation();
              clearMIDIHistory();
            }}
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="h-[calc(100%-64px)] flex flex-col">
          <div className="p-4 border-b">
            <div className="flex gap-2 items-center">
              {manualInput.map((value, index) => (
                <input
                  key={index}
                  type="text"
                  className="w-24 px-2 py-1 border rounded"
                  placeholder={`Byte ${index + 1}`}
                  value={value}
                  onChange={(e) => {
                    const newInput = [...manualInput];
                    newInput[index] = e.target.value;
                    setManualInput(newInput);
                  }}
                />
              ))}
              <button
                className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 disabled:opacity-50"
                onClick={handleManualSend}
                disabled={!selectedOutput || manualInput.some(v => !v)}
              >
                <Send size={16} />
              </button>
            </div>
          </div>

          <div className="relative h-[calc(100%-120px)]">
            <div className="bg-gray-50 border-b">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left">Time</th>
                    <th className="px-4 py-2 text-left">Type</th>
                    <th className="px-4 py-2 text-left">Source</th>
                    <th className="px-4 py-2 text-left">Message</th>
                    <th className="px-4 py-2 text-left">Description</th>
                  </tr>
                </thead>
              </table>
            </div>
            <div className="overflow-y-auto absolute inset-0 top-[40px]">
              {midiHistory.length === 0 ? (
                <div className="p-4 text-gray-500 text-center">No MIDI messages yet</div>
              ) : (
                <table className="w-full text-sm">
                  <tbody>
                    {midiHistory.map((entry, index) => {
                      const description = getMIDIMessageDescription(
                        entry.params.status,
                        entry.params.channel,
                        entry.params.data1,
                        entry.params.data2
                      );
                      
                      return (
                        <tr
                          key={index}
                          className={`border-t ${
                            entry.source === 'manual' ? 'bg-blue-50' : 'hover:bg-gray-50'
                          }`}
                        >
                          <td className="px-4 py-2 font-mono">
                            {formatTimestamp(entry.timestamp)}
                          </td>
                          <td className="px-4 py-2">
                            <span
                              className={`px-2 py-1 rounded text-white ${
                                entry.direction === 'in'
                                  ? 'bg-green-500'
                                  : 'bg-blue-500'
                              }`}
                            >
                              {entry.direction.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            {entry.source === 'manual' ? (
                              <span className="text-gray-500">Manual</span>
                            ) : entry.source === 'daw' ? (
                              <span className="text-purple-500">DAW Input</span>
                            ) : (
                              <span className="text-orange-500">General Input</span>
                            )}
                          </td>
                          <td className="px-4 py-2 font-mono">
                            {formatMessage(entry.message, numberBase)}
                          </td>
                          <td className="px-4 py-2 text-gray-600">
                            {description}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};