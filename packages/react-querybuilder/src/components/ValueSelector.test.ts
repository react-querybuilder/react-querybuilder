import { testValueSelector } from '@rqb-testing';
import { renderHook } from '@testing-library/react';
import { ValueSelector, useValueSelector } from './ValueSelector';
import type { UseValueSelectorParams } from './ValueSelector';

testValueSelector(ValueSelector);

describe('useValueSelector', () => {
  describe('val normalization for multiselect', () => {
    it('should convert numeric array values to strings when multiple is true', () => {
      const { result } = renderHook(() =>
        useValueSelector({
          handleOnChange: jest.fn(),
          multiple: true,
          value: [42, 43] as unknown as UseValueSelectorParams['value'],
        })
      );
      expect(result.current.val).toEqual(['42', '43']);
    });

    it('should convert mixed numeric/string array values to strings when multiple is true', () => {
      const { result } = renderHook(() =>
        useValueSelector({
          handleOnChange: jest.fn(),
          multiple: true,
          value: [42, '43'] as unknown as UseValueSelectorParams['value'],
        })
      );
      expect(result.current.val).toEqual(['42', '43']);
    });

    it('should handle string array values unchanged when multiple is true', () => {
      const { result } = renderHook(() =>
        useValueSelector({
          handleOnChange: jest.fn(),
          multiple: true,
          value: ['42', '43'] as unknown as UseValueSelectorParams['value'],
        })
      );
      expect(result.current.val).toEqual(['42', '43']);
    });

    it('should not alter value when multiple is false', () => {
      const { result } = renderHook(() =>
        useValueSelector({
          handleOnChange: jest.fn(),
          multiple: false,
          value: 42 as unknown as UseValueSelectorParams['value'],
        })
      );
      expect(result.current.val).toBe(42);
    });

    it('should handle comma-separated string when multiple is true', () => {
      const { result } = renderHook(() =>
        useValueSelector({ handleOnChange: jest.fn(), multiple: true, value: '42,43' })
      );
      expect(result.current.val).toEqual(['42', '43']);
    });

    it('should handle a single numeric value when multiple is true', () => {
      const { result } = renderHook(() =>
        useValueSelector({
          handleOnChange: jest.fn(),
          multiple: true,
          value: 42 as unknown as UseValueSelectorParams['value'],
        })
      );
      expect(result.current.val).toEqual(['42']);
    });

    it('should handle empty array when multiple is true', () => {
      const { result } = renderHook(() =>
        useValueSelector({
          handleOnChange: jest.fn(),
          multiple: true,
          value: [] as unknown as UseValueSelectorParams['value'],
        })
      );
      expect(result.current.val).toEqual([]);
    });
  });
});
