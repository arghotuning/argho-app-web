import {toFixedClean} from './numeric-util';

describe('numeric-util', () => {
  describe('toFixedClean()', () => {
    it('should prevent -0', () => {
      expect(toFixedClean(-0.0000000001, 0)).toEqual('0');
      expect(toFixedClean(-0.0000000001, 4)).toEqual('0.0000');
      expect(toFixedClean(-0.0000000001, 9)).toEqual('0.000000000');
    });

    it('should preserve other values', () => {
      expect(toFixedClean(-0.0000000001, 10)).toEqual('-0.0000000001');

      expect(toFixedClean(1.23456789, 0)).toEqual('1');
      expect(toFixedClean(1.23456789, 4)).toEqual('1.2346');
      expect(toFixedClean(1.23456789, 9)).toEqual('1.234567890');
    });
  });
});
