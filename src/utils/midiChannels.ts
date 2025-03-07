import { MIDIChannel } from './midiMessageDefinition';
import { PadMode } from './midiMessageDefinition';
import { ColorMode } from '../types/midi';

export const getChannelForMode = (padMode: PadMode, colorMode: ColorMode): number => {
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