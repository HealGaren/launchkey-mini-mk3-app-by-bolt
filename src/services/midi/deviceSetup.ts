import { MIDIDeviceInfo } from '../../types/midi';

export function setupMIDIDevices(midiAccess: WebMidi.MIDIAccess) {
  // Remove existing message handlers
  midiAccess.inputs.forEach(input => {
    input.onmidimessage = null;
  });

  // Set up state change handlers
  midiAccess.onstatechange = (e) => {
    const port = e.port;
    console.log(`MIDI port ${port.name} ${port.state}`);
  };
}

export function getMIDIDevices(midiAccess: WebMidi.MIDIAccess): {
  inputs: MIDIDeviceInfo[];
  outputs: MIDIDeviceInfo[];
} {
  const inputs = Array.from(midiAccess.inputs.values()).map(
    (input): MIDIDeviceInfo => ({
      id: input.id,
      name: input.name || 'Unknown Device',
      manufacturer: input.manufacturer || 'Unknown Manufacturer',
    })
  );

  const outputs = Array.from(midiAccess.outputs.values()).map(
    (output): MIDIDeviceInfo => ({
      id: output.id,
      name: output.name || 'Unknown Device',
      manufacturer: output.manufacturer || 'Unknown Manufacturer',
    })
  );

  return { inputs, outputs };
}