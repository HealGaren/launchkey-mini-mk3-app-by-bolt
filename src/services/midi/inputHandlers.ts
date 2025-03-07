import { MIDIStatus, Knob, PadNotesInMode, PadMode } from '../../utils/midiMessageDefinition';

interface GeneralMIDIHandlers {
  addMIDIHistory: Function;
  setKeyState: Function;
  setPitchValue: Function;
  setModulationValue: Function;
  setControlState: Function;
}

interface DAWMIDIHandlers {
  addMIDIHistory: Function;
  setCurrentPadMode: Function;
  setKnobValue: Function;
  setButtonState: Function;
  setControlState: Function;
}

export function handleGeneralMIDIInput(
  event: WebMidi.MIDIMessageEvent,
  handlers: GeneralMIDIHandlers
) {
  const [status, data1, data2] = event.data;
  
  if (status >= MIDIStatus.CLK) return;

  const channel = status & 0x0F;
  const messageType = status & 0xF0;
  const isNoteOn = messageType === MIDIStatus.NON && data2 > 0;

  handlers.addMIDIHistory({
    direction: 'in',
    message: Array.from(event.data),
    params: {
      channel,
      status: messageType,
      data1,
      data2
    },
    source: 'general'
  });

  // Handle keyboard input (channel 1)
  if ((messageType === MIDIStatus.NON || messageType === MIDIStatus.NOF) && 
      channel === 0) {
    const isNoteOn = messageType === MIDIStatus.NON && data2 > 0;
    const keyIndex = data1 - 36; // Adjust index to match our keyboard layout starting at C2 (36)
    handlers.setKeyState(keyIndex, isNoteOn, isNoteOn ? data2 : 0);
  }

  // Handle pitch bend (channel 1)
  if (messageType === MIDIStatus.PB && channel === 0) {
    const pitchValue = ((data2 << 7) + data1) >> 7;
    handlers.setPitchValue(pitchValue);
  }

  // Handle modulation (CC 1 on channel 1)
  if (messageType === MIDIStatus.CC && channel === 0 && data1 === 1) {
    handlers.setModulationValue(data2);
  }
}

export function handleDAWMIDIInput(
  event: WebMidi.MIDIMessageEvent,
  handlers: DAWMIDIHandlers
) {
  const [status, data1, data2] = event.data;
  
  if (status >= MIDIStatus.CLK) return;

  const channel = status & 0x0F;
  const messageType = status & 0xF0;

  handlers.addMIDIHistory({
    direction: 'in',
    message: Array.from(event.data),
    params: {
      channel,
      status: messageType,
      data1,
      data2
    },
    source: 'daw'
  });

  if (messageType === MIDIStatus.CC) {
    // Handle mode change (CC 3 on channel 16)
    if (channel === 0xF && data1 === 0x03) {
      handlers.setCurrentPadMode(data2);
    }
    
    // Handle knobs (CC 21-28)
    if (data1 >= Knob.K1 && data1 <= Knob.K8) {
      const knobIndex = data1 - Knob.K1;
      handlers.setKnobValue(knobIndex, data2);
    }
    
    // Handle control buttons
    const controlMap = {
      // Channel 1
      '0,104': 'up',
      '0,105': 'down',
      '0,108': 'shift',
      // Channel 16
      '15,103': 'left',
      '15,102': 'right',
      '15,115': 'play',
      '15,117': 'record'
    };

    const key = `${channel},${data1}`;
    if (key in controlMap) {
      handlers.setControlState(controlMap[key], data2 === 127);
    }
  } else if (messageType === MIDIStatus.NON || messageType === MIDIStatus.NOF) {
    const isNoteOn = messageType === MIDIStatus.NON && data2 > 0;
    
    // Handle pad buttons (channel 1 for SESSION mode, channel 10 for DRUM mode)
    if (channel === 0 || channel === 9) {
      Object.values(PadMode).forEach(mode => {
        if (mode in PadNotesInMode) {
          const notes = PadNotesInMode[mode];
          notes.forEach((row, rowIndex) => {
            row.forEach((note, colIndex) => {
              if (note === data1) {
                const buttonIndex = rowIndex * 8 + colIndex;
                handlers.setButtonState(buttonIndex, isNoteOn, data2);
              }
            });
          });
        }
      });
    }
  }
}