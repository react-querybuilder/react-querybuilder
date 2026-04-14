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

  it('returns "upper" when cursor is in the top 25%', () => {
    const element = createElement(100, 40);
    // Quarter height = 10, upper boundary = 110, cursor at 105 → upper
    expect(getQuadrant(element, 105)).toBe('upper');
  });

  it('returns "lower" when cursor is in the bottom 25%', () => {
    const element = createElement(100, 40);
    // Quarter height = 10, lower boundary = 130, cursor at 135 → lower
    expect(getQuadrant(element, 135)).toBe('lower');
  });

  it('returns null when cursor is in the middle 50%', () => {
    const element = createElement(100, 40);
    // Quarter height = 10, middle zone is 110-130, cursor at 120 → null
    expect(getQuadrant(element, 120)).toBeNull();
  });

  it('returns "upper" when cursor is at the top edge', () => {
    const element = createElement(100, 40);
    expect(getQuadrant(element, 100)).toBe('upper');
  });

  it('returns "lower" when cursor is at the bottom edge', () => {
    const element = createElement(100, 40);
    expect(getQuadrant(element, 139)).toBe('lower');
  });

  it('returns null at exact quadrant boundaries', () => {
    const element = createElement(100, 40);
    // At 110 (top + quarterHeight): not < boundary, so middle zone
    expect(getQuadrant(element, 110)).toBeNull();
    // At 130 (bottom - quarterHeight): not > boundary, so middle zone
    expect(getQuadrant(element, 130)).toBeNull();
  });

  it('handles elements with different sizes', () => {
    const tallElement = createElement(0, 200);
    // Quarter = 50, upper zone: 0-50, lower zone: 150-200
    expect(getQuadrant(tallElement, 25)).toBe('upper');
    expect(getQuadrant(tallElement, 100)).toBeNull();
    expect(getQuadrant(tallElement, 175)).toBe('lower');

    const shortElement = createElement(50, 10);
    // Quarter = 2.5, upper zone: 50-52.5, lower zone: 57.5-60
    expect(getQuadrant(shortElement, 51)).toBe('upper');
    expect(getQuadrant(shortElement, 55)).toBeNull();
    expect(getQuadrant(shortElement, 59)).toBe('lower');
  });
});
