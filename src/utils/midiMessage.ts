import {MIDIChannel, MIDIStatus} from "./midiMessageDefinition";

export interface MIDIMessageParams {
    channel: number,
    status: number,
    data1: number,
    data2: number
}

export interface MIDIMessage {
    params: MIDIMessageParams;
    midi: number[];
}

export function midiMessage(params: MIDIMessageParams): MIDIMessage {
    const {channel, status, data1, data2} = params;
    return {
        params,
        midi: [
            channel + status,
            data1,
            data2
        ]
    };
}

export function midiMessageWith(baseMIDIMessage: MIDIMessage, params: Partial<MIDIMessageParams>): MIDIMessage {
    return midiMessage({
        ...baseMIDIMessage.params,
        ...params
    });
}

export const MIDIMessages = {
    DAWModeOn: midiMessage({
        channel: MIDIChannel.CH16,
        status: MIDIStatus.NON,
        data1: 0x0C,
        data2: 0x7F
    }),
    DAWModeOff: midiMessage({
        channel: MIDIChannel.CH16,
        status: MIDIStatus.NON,
        data1: 0x0C,
        data2: 0x00
    }),
    SessionPadColor: midiMessage({
        channel: MIDIChannel.CH1,
        status: MIDIStatus.NON,
        data1: 0x00,
        data2: 0x00
    }),
    SessionPadColorFlash: midiMessage({
        channel: MIDIChannel.CH2,
        status: MIDIStatus.NON,
        data1: 0x00,
        data2: 0x00
    }),
    SessionPadColorPulse: midiMessage({
        channel: MIDIChannel.CH3,
        status: MIDIStatus.NON,
        data1: 0x00,
        data2: 0x00
    }),
    DrumPadColor: midiMessage({
        channel: MIDIChannel.CH10,
        status: MIDIStatus.NON,
        data1: 0x00,
        data2: 0x00
    }),
    DrumPadColorFlash: midiMessage({
        channel: MIDIChannel.CH11,
        status: MIDIStatus.NON,
        data1: 0x00,
        data2: 0x00
    }),
    DrumPadColorPulse: midiMessage({
        channel: MIDIChannel.CH12,
        status: MIDIStatus.NON,
        data1: 0x00,
        data2: 0x00
    }),
    PadBrightness: midiMessage({
        channel: MIDIChannel.CH16,
        status: MIDIStatus.CC,
        data1: 0x00,
        data2: 0x60
    }),
    PadMode: midiMessage({
        channel: MIDIChannel.CH16,
        status: MIDIStatus.CC,
        data1: 0x03,
        data2: 0x00
    }),
    KnobModeVolume: midiMessage({
        channel: MIDIChannel.CH16,
        status: MIDIStatus.CC,
        data1: 0x09,
        data2: 0x01
    }),
    KnobModeDevice: midiMessage({
        channel: MIDIChannel.CH16,
        status: MIDIStatus.CC,
        data1: 0x09,
        data2: 0x02
    }),
    KnobModePan: midiMessage({
        channel: MIDIChannel.CH16,
        status: MIDIStatus.CC,
        data1: 0x09,
        data2: 0x03
    }),
    KnobModeSendsA: midiMessage({
        channel: MIDIChannel.CH16,
        status: MIDIStatus.CC,
        data1: 0x09,
        data2: 0x04
    }),
    KnobModeSendsB: midiMessage({
        channel: MIDIChannel.CH16,
        status: MIDIStatus.CC,
        data1: 0x09,
        data2: 0x05
    }),
    KnobModeCustom: midiMessage({
        channel: MIDIChannel.CH16,
        status: MIDIStatus.CC,
        data1: 0x09,
        data2: 0x06
    }),
    ArrUp: midiMessage({
        channel: MIDIChannel.CH1,
        status: MIDIStatus.CC,
        data1: 0x68,
        data2: 0x7F
    }),
    ArrDown: midiMessage({
        channel: MIDIChannel.CH1,
        status: MIDIStatus.CC,
        data1: 0x69,
        data2: 0x7F
    }),
    ArrLeft: midiMessage({
        channel: MIDIChannel.CH16,
        status: MIDIStatus.CC,
        data1: 0x67,
        data2: 0x7F
    }),
    ArrRight: midiMessage({
        channel: MIDIChannel.CH16,
        status: MIDIStatus.CC,
        data1: 0x66,
        data2: 0x7F
    }),
    Shift: midiMessage({
        channel: MIDIChannel.CH1,
        status: MIDIStatus.CC,
        data1: 0x6C,
        data2: 0x7F
    }),
    Play: midiMessage({
        channel: MIDIChannel.CH16,
        status: MIDIStatus.CC,
        data1: 0x73,
        data2: 0x7F
    }),
    Record: midiMessage({
        channel: MIDIChannel.CH16,
        status: MIDIStatus.CC,
        data1: 0x75,
        data2: 0x7F
    })
};
