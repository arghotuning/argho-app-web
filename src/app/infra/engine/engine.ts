// TODO: Split this out into a separate argho-engine-js project and test thoroughly.

import {ArghoTuningLimits, FreqHz, Tuning} from '@arghotuning/arghotun';

function positiveMod(a: number, b: number): number {
  let rawMod = a % b;
  if (rawMod < 0) {
    rawMod += Math.abs(b);
  }
  return rawMod;
}

/**
 * Map (array) from MIDI pitch number (as index) to the frequency that should be
 * produced for that input key (or null if unmapped).
 */
export interface MidiFreqMap {
  [midiPitch: number]: FreqHz | null;
}

/**
 * Utilities to support playing back an Argho Tuning in a JavaScript
 * environment.
 */
export class Engine {
  private frequencies_!: MidiFreqMap;

  constructor(tuning: Tuning) {
    this.updateTuning(tuning);
  }

  /**
   * Updates state to reflect the given tuning. This tuning is not saved, so to
   * reflect any future changes, call this method again.
   */
  updateTuning(tuning: Tuning): void {
    // Calculate frequencies for primary key span.
    const scale = tuning.getScale();
    const rootFreqHz = scale.getRoot().getFreqHz();

    const mapping = tuning.getMapping();
    const keySpan = mapping.getKeySpan();

    const primaryMapping: (FreqHz|null)[] = [];
    for (let keyIndex = 0; keyIndex < keySpan; keyIndex++) {
      const deg = mapping.getMappedScaleDegreeIndexOrNull(keyIndex);
      if (deg == null) {
        primaryMapping.push(null);  // Unmapped.
      } else {
        const intervalFromRoot = scale.getIntervalFromSourceToDest(0, deg);
        const freqHz = rootFreqHz
            * intervalFromRoot.getRatioNumerator()
            / intervalFromRoot.getRatioDenominator();
        primaryMapping.push(freqHz);
      }
    }

    // Copy those primary frequencies over full MIDI pitch range, transposing by
    // octavesSpanned every key span repetition.
    const octavesSpanned = scale.getOctavesSpanned();

    const mappingRootPitch = tuning.getMapping().getRootMidiPitch();

    const freqs = [];
    for (let i = 0; i < ArghoTuningLimits.MIDI_PITCH_MAX; i++) {
      const semitonesFromMappingRoot = i - mappingRootPitch;

      const keyIndex = positiveMod(semitonesFromMappingRoot, keySpan);
      const primaryFreqHz = primaryMapping[keyIndex];
      if (!primaryFreqHz) {
        freqs.push(null);  // Unmapped.
        continue;
      }

      const keySpanOffset = Math.floor(semitonesFromMappingRoot / keySpan);
      const octaveOffset = keySpanOffset * octavesSpanned;
      const freqHz = Math.pow(2, octaveOffset) * primaryFreqHz;
      freqs.push(freqHz);
    }

    this.frequencies_ = Object.freeze(freqs);
  }

  /**
   * Returns array that maps MIDI pitch numbers (as indexes) to the frequency
   * that should be produced for that input key (or null if unmapped).
   *
   * The returned value may not be modified.
   */
  frequencies(): MidiFreqMap {
    return this.frequencies_;
  }
}
