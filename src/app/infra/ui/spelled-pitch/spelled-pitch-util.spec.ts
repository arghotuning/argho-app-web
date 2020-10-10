import {SimpleAccidental} from '@arghotuning/argho-editor';

import {simpleAccidentalStr} from './spelled-pitch-util';

describe('spelled-pitch-util', () => {
  describe('simpleAccidentalStr()', () => {
    it('should yield b, #, and empty string', () => {
      expect(simpleAccidentalStr(SimpleAccidental.FLAT)).toEqual('b');
      expect(simpleAccidentalStr(SimpleAccidental.NATURAL)).toEqual('');
      expect(simpleAccidentalStr(SimpleAccidental.SHARP)).toEqual('#');
    });
  });
});
