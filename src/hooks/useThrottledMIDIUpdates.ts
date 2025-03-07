import { useCallback, useRef } from 'react';
import { throttle } from 'lodash';
import { useMIDIStore } from '../store/midiStore';

export function useThrottledMIDIUpdates() {
  const { 
    isThrottlingEnabled,
    setPitchValue,
    setModulationValue,
    setKnobValue
  } = useMIDIStore();

  // Create refs to store throttled functions
  const throttledFuncs = useRef({
    pitch: throttle((value: number) => setPitchValue(value), 10, { 
      leading: true, 
      trailing: true 
    }),
    modulation: throttle((value: number) => setModulationValue(value), 10, { 
      leading: true, 
      trailing: true 
    }),
    knob: throttle((index: number, value: number) => setKnobValue(index, value), 10, { 
      leading: true, 
      trailing: true 
    })
  });

  // Wrapper functions that only apply throttling when enabled
  const throttledSetPitchValue = useCallback((value: number) => {
    if (isThrottlingEnabled) {
      throttledFuncs.current.pitch(value);
    } else {
      setPitchValue(value);
    }
  }, [isThrottlingEnabled, setPitchValue]);

  const throttledSetModulationValue = useCallback((value: number) => {
    if (isThrottlingEnabled) {
      throttledFuncs.current.modulation(value);
    } else {
      setModulationValue(value);
    }
  }, [isThrottlingEnabled, setModulationValue]);

  const throttledSetKnobValue = useCallback((index: number, value: number) => {
    if (isThrottlingEnabled) {
      throttledFuncs.current.knob(index, value);
    } else {
      setKnobValue(index, value);
    }
  }, [isThrottlingEnabled, setKnobValue]);

  return {
    throttledSetPitchValue,
    throttledSetModulationValue,
    throttledSetKnobValue
  };
}