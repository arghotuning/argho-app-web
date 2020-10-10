import {SimpleAccidental} from '@arghotuning/argho-editor';

/**
 * Returns accidental as simple 'b', '#', or '' characters, which are much
 * easier for users to type than non-ASCII Unicode accidentals.
 */
export function simpleAccidentalStr(accidental: SimpleAccidental): string {
  switch (accidental) {
    case SimpleAccidental.FLAT: return 'b';
    case SimpleAccidental.SHARP: return '#';
    default: return '';
  }
}
