import { defaultJsonLogicSerializers } from './jsonLogic';

// Invoke a built-in serializer (all built-ins are opts-first functions; opts ignored).
const call = (fn: string, ...args: unknown[]): unknown => {
  const serializer = defaultJsonLogicSerializers[fn];
  return typeof serializer === 'function' ? serializer({}, ...args) : { [serializer]: args };
};

describe('defaultJsonLogicSerializers', () => {
  it('maps arithmetic and mod to stock JSONLogic operators', () => {
    expect(call('add', 'a', 'b')).toEqual({ '+': ['a', 'b'] });
    expect(call('subtract', 'a', 'b')).toEqual({ '-': ['a', 'b'] });
    expect(call('multiply', 'a', 'b')).toEqual({ '*': ['a', 'b'] });
    expect(call('divide', 'a', 'b')).toEqual({ '/': ['a', 'b'] });
    expect(call('mod', 'a', 'b')).toEqual({ '%': ['a', 'b'] });
  });

  it('maps min/max to stock variadic operators', () => {
    expect(call('min', 'a', 'b', 'c')).toEqual({ min: ['a', 'b', 'c'] });
    expect(call('max', 'a', 'b', 'c')).toEqual({ max: ['a', 'b', 'c'] });
  });

  it('emits same-named custom operators for abs/upper/lower', () => {
    expect(call('abs', 'x')).toEqual({ abs: 'x' });
    expect(call('upper', 'x')).toEqual({ upper: 'x' });
    expect(call('lower', 'x')).toEqual({ lower: 'x' });
  });
});
