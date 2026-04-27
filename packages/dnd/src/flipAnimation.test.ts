import { createFlipAnimator } from './flipAnimation';

const createMockElement = (
  id: string,
  rect: Partial<DOMRect>
): { el: Element; htmlEl: HTMLElement } => {
  const fullRect: DOMRect = {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    width: 0,
    height: 0,
    x: 0,
    y: 0,
    toJSON: () => {},
    ...rect,
  };
  const el = {
    getAttribute: (attr: string) => (attr === 'data-rule-id' ? id : null),
    getBoundingClientRect: () => fullRect,
    style: { transform: '', transition: '' },
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  } as unknown as HTMLElement;
  return { el, htmlEl: el };
};

const createMockContainer = (elements: HTMLElement[]) =>
  ({ querySelectorAll: () => elements }) as unknown as HTMLElement;

describe('createFlipAnimator', () => {
  it('captures first positions and animates to last positions', () => {
    const rAF = vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation(cb => {
      cb(0);
      return 0;
    });

    const { el: el1, htmlEl: htmlEl1 } = createMockElement('r1', { top: 0, left: 0 });
    const { el: el2, htmlEl: htmlEl2 } = createMockElement('r2', { top: 40, left: 0 });

    const container1 = createMockContainer([el1 as HTMLElement, el2 as HTMLElement]);
    const flip = createFlipAnimator('.rule');

    // Capture first positions
    flip.captureFirst(container1);

    // Simulate position change — element r1 moved down, r2 moved up
    const el1Moved = {
      ...htmlEl1,
      getAttribute: (attr: string) => (attr === 'data-rule-id' ? 'r1' : null),
      getBoundingClientRect: () => ({
        top: 40,
        left: 0,
        bottom: 80,
        right: 100,
        width: 100,
        height: 40,
        x: 0,
        y: 40,
        toJSON: () => {},
      }),
      style: { transform: '', transition: '' },
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as HTMLElement;

    const el2Moved = {
      ...htmlEl2,
      getAttribute: (attr: string) => (attr === 'data-rule-id' ? 'r2' : null),
      getBoundingClientRect: () => ({
        top: 0,
        left: 0,
        bottom: 40,
        right: 100,
        width: 100,
        height: 40,
        x: 0,
        y: 0,
        toJSON: () => {},
      }),
      style: { transform: '', transition: '' },
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as HTMLElement;

    const container2 = createMockContainer([el1Moved, el2Moved]);

    // Play last positions
    flip.playLast(container2);

    // After rAF, transition should be set
    expect(el1Moved.style.transition).toContain('transform');
    expect(el1Moved.style.transform).toBe('');
    expect(el2Moved.style.transition).toContain('transform');

    rAF.mockRestore();
  });

  it('skips elements without data-rule-id or data-testid', () => {
    const rAF = vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation(cb => {
      cb(0);
      return 0;
    });

    const noIdEl = {
      getAttribute: () => null,
      getBoundingClientRect: () => ({
        top: 0,
        bottom: 40,
        left: 0,
        right: 100,
        width: 100,
        height: 40,
        x: 0,
        y: 0,
        toJSON: () => {},
      }),
      style: { transform: '', transition: '' },
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as HTMLElement;

    const container = createMockContainer([noIdEl]);
    const flip = createFlipAnimator('.rule');

    flip.captureFirst(container);
    flip.playLast(container);

    // No error, no transform applied
    expect(noIdEl.style.transform).toBe('');

    rAF.mockRestore();
  });

  it('skips elements with zero delta (no movement)', () => {
    const rAF = vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation(cb => {
      cb(0);
      return 0;
    });

    const { el } = createMockElement('r1', { top: 50, left: 10 });
    const container = createMockContainer([el as HTMLElement]);

    const flip = createFlipAnimator('.rule');
    flip.captureFirst(container);
    flip.playLast(container);

    // No transform because position didn't change
    expect((el as HTMLElement).style.transform).toBe('');

    rAF.mockRestore();
  });

  it('skips elements in playLast that were not captured in captureFirst', () => {
    const rAF = vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation(cb => {
      cb(0);
      return 0;
    });

    const emptyContainer = createMockContainer([]);
    const flip = createFlipAnimator('.rule');
    flip.captureFirst(emptyContainer);

    // Now play with an element that wasn't captured
    const { el } = createMockElement('r-new', { top: 0, left: 0 });
    const container2 = createMockContainer([el as HTMLElement]);
    flip.playLast(container2);

    // No error, no transform
    expect((el as HTMLElement).style.transform).toBe('');

    rAF.mockRestore();
  });

  it('uses data-testid as fallback key', () => {
    const rAF = vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation(cb => {
      cb(0);
      return 0;
    });

    const el = {
      getAttribute: (attr: string) => (attr === 'data-testid' ? 'tid1' : null),
      getBoundingClientRect: () => ({
        top: 0,
        left: 0,
        bottom: 40,
        right: 100,
        width: 100,
        height: 40,
        x: 0,
        y: 0,
        toJSON: () => {},
      }),
      style: { transform: '', transition: '' },
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as HTMLElement;

    const container = createMockContainer([el]);
    const flip = createFlipAnimator('.rule');
    flip.captureFirst(container);

    // Change position for playLast
    const elMoved = {
      ...el,
      getAttribute: (attr: string) => (attr === 'data-testid' ? 'tid1' : null),
      getBoundingClientRect: () => ({
        top: 100,
        left: 0,
        bottom: 140,
        right: 100,
        width: 100,
        height: 40,
        x: 0,
        y: 100,
        toJSON: () => {},
      }),
      style: { transform: '', transition: '' },
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as HTMLElement;

    const container2 = createMockContainer([elMoved]);
    flip.playLast(container2);

    // Transition should be applied
    expect(elMoved.style.transition).toContain('transform');

    rAF.mockRestore();
  });

  it('cleans up transition on transitionend event', () => {
    const rAF = vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation(cb => {
      cb(0);
      return 0;
    });

    const addEventListenerMock = vi.fn();
    const removeEventListenerMock = vi.fn();

    const el = {
      getAttribute: (attr: string) => (attr === 'data-rule-id' ? 'r1' : null),
      getBoundingClientRect: () => ({
        top: 0,
        left: 0,
        bottom: 40,
        right: 100,
        width: 100,
        height: 40,
        x: 0,
        y: 0,
        toJSON: () => {},
      }),
      style: { transform: '', transition: '' },
      addEventListener: addEventListenerMock,
      removeEventListener: removeEventListenerMock,
    } as unknown as HTMLElement;

    const container1 = createMockContainer([el]);
    const flip = createFlipAnimator('.rule');
    flip.captureFirst(container1);

    const elMoved = {
      ...el,
      getBoundingClientRect: () => ({
        top: 50,
        left: 0,
        bottom: 90,
        right: 100,
        width: 100,
        height: 40,
        x: 0,
        y: 50,
        toJSON: () => {},
      }),
      style: { transform: '', transition: '' },
      addEventListener: addEventListenerMock,
      removeEventListener: removeEventListenerMock,
    } as unknown as HTMLElement;

    const container2 = createMockContainer([elMoved]);
    flip.playLast(container2);

    // Find the transitionend handler
    const transitionEndCall = addEventListenerMock.mock.calls.find(
      call => call[0] === 'transitionend'
    );
    expect(transitionEndCall).toBeDefined();

    // Call the handler
    const handler = transitionEndCall![1];
    handler();

    // Transition should be cleared
    expect(elMoved.style.transition).toBe('');
    expect(removeEventListenerMock).toHaveBeenCalledWith('transitionend', handler);

    rAF.mockRestore();
  });
});
