import { ButtonSettingsMap } from '../../types/midi';
import { midiMessage } from '../../utils/midiMessage';
import { PadMode, PadNotesInMode, MIDIChannel, MIDIStatus, MIDINote } from '../../utils/midiMessageDefinition';

export async function syncButtonSettings(
  selectedOutput: string,
  buttonSettings: ButtonSettingsMap,
  addMIDIHistory: Function
) {
  try {
    const midiAccess = await navigator.requestMIDIAccess();
    const output = midiAccess.outputs.get(selectedOutput);
    
    if (!output) return;
    
    // Sync control button settings first
    const controlButtons = [102, 103, 104, 105, 115, 117]; // right, left, up, down, play, record
    
    if (buttonSettings.controls) {
      // First send default values (0) for buttons without settings
      controlButtons.forEach(cc => {
        if (!(cc.toString() in buttonSettings.controls)) {
          const message = midiMessage({
            channel: MIDIChannel.CH1,
            status: MIDIStatus.CC,
            data1: cc,
            data2: 0
          });
          
          output.send(message.midi);
          addMIDIHistory({
            direction: 'out',
            message: message.midi,
            params: message.params,
            source: 'manual'
          });
        }
      });

      // Then send configured settings
      Object.entries(buttonSettings.controls).forEach(([ccNumber, settings]) => {
        // Skip the shift button (CC 108)
        if (ccNumber === '108') return;
        
        const cc = parseInt(ccNumber);
        
        // Send solid/pulse color
        const channel = settings.colorMode === 'PULSE' ? MIDIChannel.CH3 : MIDIChannel.CH1;
        const message = midiMessage({
          channel,
          status: MIDIStatus.CC,
          data1: cc,
          data2: settings.colorValue
        });
        
        output.send(message.midi);
        addMIDIHistory({
          direction: 'out',
          message: message.midi,
          params: message.params,
          source: 'manual'
        });
        
        // Send flash color if enabled
        if (settings.colorMode === 'SOLID' && 
            settings.flashEnabled && 
            settings.flashValue !== undefined) {
          const flashMessage = midiMessage({
            channel: MIDIChannel.CH2,
            status: MIDIStatus.CC,
            data1: cc,
            data2: settings.flashValue
          });
          
          output.send(flashMessage.midi);
          addMIDIHistory({
            direction: 'out',
            message: flashMessage.midi,
            params: flashMessage.params,
            source: 'manual'
          });
        }
      });
    }

    // Iterate through all modes
    Object.entries(buttonSettings).forEach(([modeStr, modeSettings]) => {
      // Skip the controls object
      if (modeStr === 'controls') return;
      
      const mode = parseInt(modeStr) as PadMode;
      
      // Skip modes without note mappings
      if (!(mode in PadNotesInMode)) return;
      
      const notes = PadNotesInMode[mode as keyof typeof PadNotesInMode];
      
      // Send messages for each button in this mode
      for (let row = 0; row < notes.length; row++) {
        for (let col = 0; col < notes[row].length; col++) {
          const buttonIndex = row * 8 + col;
          const settings = modeSettings[buttonIndex];
          const note = notes[row][col];
          
          // Default settings for buttons without configuration
          const defaultSettings = {
            colorMode: 'SOLID',
            colorValue: 0
          };
          
          const effectiveSettings = settings || defaultSettings;
          
          // Send solid/pulse color
          const channel = mode === PadMode.SESSION
            ? (effectiveSettings.colorMode === 'PULSE' ? MIDIChannel.CH3 : MIDIChannel.CH1)
            : (effectiveSettings.colorMode === 'PULSE' ? MIDIChannel.CH12 : MIDIChannel.CH10);
          
          const message = midiMessage({
            channel,
            status: MIDIStatus.NON,
            data1: note,
            data2: effectiveSettings.colorValue
          });
          
          output.send(message.midi);
          addMIDIHistory({
            direction: 'out',
            message: message.midi,
            params: message.params,
            source: 'manual'
          });
          
          // Send flash color if enabled
          if (effectiveSettings.colorMode === 'SOLID' && 
              effectiveSettings.flashEnabled && 
              effectiveSettings.flashValue !== undefined) {
            const flashChannel = mode === PadMode.SESSION ? MIDIChannel.CH2 : MIDIChannel.CH11;
            const flashMessage = midiMessage({
              channel: flashChannel,
              status: MIDIStatus.NON,
              data1: note,
              data2: effectiveSettings.flashValue
            });
            
            output.send(flashMessage.midi);
            addMIDIHistory({
              direction: 'out',
              message: flashMessage.midi,
              params: flashMessage.params,
              source: 'manual'
            });
          }
        }
      }
    });
  } catch (error) {
    console.error('Failed to sync button settings:', error);
  }
}