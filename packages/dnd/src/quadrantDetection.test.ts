import { getQuadrant } from './quadrantDetection';

describe('getQuadrant', () => {
  const createElement = (top: number, height: number): HTMLElement =>
    ({
      getBoundingClientRect: () => ({
        top,
        bottom: top + height,
        height,
        left: 0,
        right: 100,
        width: 100,
        x: 0,
        y: top,
        toJSON: () => {},
      }),
    }) as unknown as HTMLElement;

  it('returns "upper" when cursor is in the top half', () => {
    const element = createElement(100, 40);
    // Midpoint is 120, cursor at 110 → upper
    expect(getQuadrant(element, 110)).toBe('upper');
  });

  it('returns "lower" when cursor is in the bottom half', () => {
    const element = createElement(100, 40);
    // Midpoint is 120, cursor at 130 → lower
    expect(getQuadrant(element, 130)).toBe('lower');
  });

  it('returns "lower" when cursor is exactly at midpoint', () => {
    const element = createElement(100, 40);
    // Midpoint is 120, cursor at 120 → lower (>= midpoint)
    expect(getQuadrant(element, 120)).toBe('lower');
  });

  it('returns "upper" when cursor is at the top edge', () => {
    const element = createElement(100, 40);
    expect(getQuadrant(element, 100)).toBe('upper');
  });

  it('returns "lower" when cursor is at the bottom edge', () => {
    const element = createElement(100, 40);
    expect(getQuadrant(element, 139)).toBe('lower');
  });

  it('handles elements with different sizes', () => {
    const tallElement = createElement(0, 200);
    expect(getQuadrant(tallElement, 50)).toBe('upper');
    expect(getQuadrant(tallElement, 150)).toBe('lower');

    const shortElement = createElement(50, 10);
    expect(getQuadrant(shortElement, 52)).toBe('upper');
    expect(getQuadrant(shortElement, 58)).toBe('lower');
  });
});
