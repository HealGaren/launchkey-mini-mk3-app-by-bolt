export enum MIDIChannel {
    CH1 = 0x0,
    CH2 = 0x1,
    CH3 = 0x2,
    CH4 = 0x3,
    CH5 = 0x4,
    CH6 = 0x5,
    CH7 = 0x6,
    CH8 = 0x7,
    CH9 = 0x8,
    CH10 = 0x9,
    CH11 = 0xA,
    CH12 = 0xB,
    CH13 = 0xC,
    CH14 = 0xD,
    CH15 = 0xE,
    CH16 = 0xF
}

export enum MIDIStatus {
    NOF = 0x80, // Note Off
    NON = 0x90, // Note On
    PKP = 0xA0, // Polyphonic Key Pressure
    CC = 0xB0,  // Control Change
    PC = 0xC0,  // Program Change
    CP = 0xD0,  // Channel Pressure
    PB = 0xE0,  // Pitch Bend
    CLK = 0xF8, // Timing Clock
    START = 0xFA,
    CONT = 0xFB,
    STOP = 0xFC,
    ACTSENS = 0xFE,
    SYSRES = 0xFF,
}

export enum MIDINote {
    C_2 = 0, Db_2, D_2, Eb_2, E_2, F_2, Gb_2, G_2, Ab_2, A_2, Bb_2, B_2,
    C_1, Db_1, D_1, Eb_1, E_1, F_1, Gb_1, G_1, Ab_1, A_1, Bb_1, B_1,
    C0, Db0, D0, Eb0, E0, F0, Gb0, G0, Ab0, A0, Bb0, B0,
    C1, Db1, D1, Eb1, E1, F1, Gb1, G1, Ab1, A1, Bb1, B1,
    C2, Db2, D2, Eb2, E2, F2, Gb2, G2, Ab2, A2, Bb2, B2,
    C3, Db3, D3, Eb3, E3, F3, Gb3, G3, Ab3, A3, Bb3, B3,
    C4, Db4, D4, Eb4, E4, F4, Gb4, G4, Ab4, A4, Bb4, B4,
    C5, Db5, D5, Eb5, E5, F5, Gb5, G5, Ab5, A5, Bb5, B5,
    C6, Db6, D6, Eb6, E6, F6, Gb6, G6, Ab6, A6, Bb6, B6,
    C7, Db7, D7, Eb7, E7, F7, Gb7, G7, Ab7, A7, Bb7, B7,
    C8, Db8, D8, Eb8, E8, F8, Gb8, G8
}

export enum DrumPads {
    DP1 = MIDINote.E1,
    DP2,
    DP3,
    DP4,
    DP5 = MIDINote.C2,
    DP6,
    DP7,
    DP8,
    DP9 = MIDINote.C1,
    DP10,
    DP11,
    DP12,
    DP13 = MIDINote.Ab1,
    DP14,
    DP15,
    DP16,
}

export enum SessionPads {
    SP1 = MIDINote.C6,
    SP2,
    SP3,
    SP4,
    SP5,
    SP6,
    SP7,
    SP8,
    SP9 = MIDINote.E7,
    SP10,
    SP11,
    SP12,
    SP13,
    SP14,
    SP15,
    SP16
}

export type PadNotes = [number[], number[]];

export const DrumPadNotes: PadNotes = [
    [DrumPads.DP1, DrumPads.DP2, DrumPads.DP3, DrumPads.DP4, DrumPads.DP5, DrumPads.DP6, DrumPads.DP7, DrumPads.DP8],
    [DrumPads.DP9, DrumPads.DP10, DrumPads.DP11, DrumPads.DP12, DrumPads.DP13, DrumPads.DP14, DrumPads.DP15, DrumPads.DP16],
];

export const SessionPadNotes: PadNotes = [
    [SessionPads.SP1, SessionPads.SP2, SessionPads.SP3, SessionPads.SP4, SessionPads.SP5, SessionPads.SP6, SessionPads.SP7, SessionPads.SP8],
    [SessionPads.SP9, SessionPads.SP10, SessionPads.SP11, SessionPads.SP12, SessionPads.SP13, SessionPads.SP14, SessionPads.SP15, SessionPads.SP16],
];

export enum PadMode {
    DRUM = 1,
    SESSION = 2,
    CUSTOM = 5
}

// Available pad modes for UI
export const availablePadModes = [
    { mode: PadMode.DRUM, label: 'DRUM' },
    { mode: PadMode.SESSION, label: 'SESSION' },
    { mode: PadMode.CUSTOM, label: 'CUSTOM' }
] as const;

export const PadNotesInMode = {
    [PadMode.DRUM]: DrumPadNotes,
    [PadMode.SESSION]: SessionPadNotes
} as const;

export enum Knob {
    K1 = 21,
    K2,
    K3,
    K4,
    K5,
    K6,
    K7,
    K8
}

export enum Brightness {
    P0      =   0x00,
    P25     =   0x20,
    P50     =   0x30,
    P75     =   0x40,
    P100    =   0x60
}

export const getMIDIMessageDescription = (status: number, channel: number, data1: number, data2: number): string => {
    const messageType = status & 0xF0;
    const descriptions: Record<number, string> = {
        [MIDIStatus.NOF]: 'Note Off',
        [MIDIStatus.NON]: 'Note On',
        [MIDIStatus.PKP]: 'Poly Pressure',
        [MIDIStatus.CC]: 'Control Change',
        [MIDIStatus.PC]: 'Program Change',
        [MIDIStatus.CP]: 'Channel Pressure',
        [MIDIStatus.PB]: 'Pitch Bend',
    };

    let description = `${descriptions[messageType] || 'Unknown'} (Ch ${channel + 1})`;
    
    if (messageType === MIDIStatus.CC) {
        description += ` CC#${data1}=${data2}`;
    } else if (messageType === MIDIStatus.NON || messageType === MIDIStatus.NOF) {
        description += ` Note=${data1} Vel=${data2}`;
    }

    return description;
};