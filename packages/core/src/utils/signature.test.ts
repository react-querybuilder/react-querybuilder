import { signatureOf, structuralSignature, unchangedSignature } from './signature';

const rule = (id: string, field = 'f1', value = 'v1') => ({ id, field, operator: '=', value });

const group = (id: string, rules: unknown[], extra: object = {}) =>
  ({ id, combinator: 'and', rules, ...extra }) as never;

describe('signatureOf', () => {
  it('returns unchangedSignature for identical references', () => {
    const q = group('g', [rule('r1')]);
    expect(signatureOf(q, q)).toBe(unchangedSignature);
  });

  it('returns unchangedSignature when nothing observable differs', () => {
    const r = rule('r1');
    expect(signatureOf(group('g', [r]), group('g', [r]))).toBe(unchangedSignature);
  });

  it('identifies a changed rule property', () => {
    const before = group('g', [rule('r1', 'f1', 'v1')]);
    const after = group('g', [rule('r1', 'f1', 'v2')]);
    expect(signatureOf(before, after)).toBe('r1:value');
  });

  it('produces the same signature for consecutive edits to the same property', () => {
    const a = group('g', [rule('r1', 'f1', 'v')]);
    const b = group('g', [rule('r1', 'f1', 'va')]);
    const c = group('g', [rule('r1', 'f1', 'val')]);
    expect(signatureOf(a, b)).toBe(signatureOf(b, c));
  });

  it('produces different signatures for different properties of the same rule', () => {
    const before = group('g', [rule('r1', 'f1', 'v1')]);
    expect(signatureOf(before, group('g', [rule('r1', 'f2', 'v1')]))).not.toBe(
      signatureOf(before, group('g', [rule('r1', 'f1', 'v2')]))
    );
  });

  it('produces different signatures for the same property of different rules', () => {
    // Untouched siblings must keep their identity, exactly as Immer's structural sharing
    // guarantees for queries produced by RQB's own update functions.
    const r1 = rule('r1');
    const r2 = rule('r2');
    const before = group('g', [r1, r2]);
    const afterR1 = group('g', [rule('r1', 'f1', 'x'), r2]);
    const afterR2 = group('g', [r1, rule('r2', 'f1', 'x')]);
    expect(signatureOf(before, afterR1)).not.toBe(signatureOf(before, afterR2));
  });

  it('reports a wholly rebuilt query as structural', () => {
    // Deep-equal but reference-distinct children (e.g. a query round-tripped through JSON)
    // are indistinguishable from a reordering, so no coalescing occurs.
    const before = group('g', [rule('r1'), rule('r2')]);
    const after = group('g', [rule('r1'), rule('r2', 'f1', 'x')]);
    expect(signatureOf(before, after)).toBe(structuralSignature);
  });

  it('sorts multiple changed properties for stability', () => {
    const before = group('g', [rule('r1', 'f1', 'v1')]);
    const after = group('g', [{ id: 'r1', field: 'f2', operator: '=', value: '' }]);
    expect(signatureOf(before, after)).toBe('r1:field,value');
  });

  it('identifies a changed group property', () => {
    const rules = [rule('r1')];
    expect(signatureOf(group('g', rules), group('g', rules, { combinator: 'or' }))).toBe(
      'g:combinator'
    );
  });

  it('reports added rules as structural', () => {
    expect(signatureOf(group('g', [rule('r1')]), group('g', [rule('r1'), rule('r2')]))).toBe(
      structuralSignature
    );
  });

  it('reports removed rules as structural', () => {
    expect(signatureOf(group('g', [rule('r1'), rule('r2')]), group('g', [rule('r1')]))).toBe(
      structuralSignature
    );
  });

  it('reports reordered rules as structural', () => {
    const r1 = rule('r1');
    const r2 = rule('r2');
    expect(signatureOf(group('g', [r1, r2]), group('g', [r2, r1]))).toBe(structuralSignature);
  });

  it('reports a rule replaced by a group as structural', () => {
    expect(signatureOf(group('g', [rule('r1')]), group('g', [group('g2', [])]))).toBe(
      structuralSignature
    );
  });

  it('reports simultaneous own-property and child changes as structural', () => {
    const before = group('g', [rule('r1', 'f1', 'v1')]);
    const after = group('g', [rule('r1', 'f1', 'v2')], { combinator: 'or' });
    expect(signatureOf(before, after)).toBe(structuralSignature);
  });

  it('descends into nested groups', () => {
    const inner = (value: string) => group('inner', [rule('r1', 'f1', value)]);
    expect(signatureOf(group('outer', [inner('v1')]), group('outer', [inner('v2')]))).toBe(
      'r1:value'
    );
  });

  it('prunes untouched subtrees by reference', () => {
    const untouched = group('big', [rule('a'), rule('b'), rule('c')]);
    const before = group('root', [untouched, rule('r1', 'f1', 'v1')]);
    const after = group('root', [untouched, rule('r1', 'f1', 'v2')]);
    expect(signatureOf(before, after)).toBe('r1:value');
  });

  describe('independent combinators', () => {
    it('identifies a changed combinator', () => {
      const r1 = rule('r1');
      const r2 = rule('r2');
      const before = { id: 'g', rules: [r1, 'and', r2] } as never;
      const after = { id: 'g', rules: [r1, 'or', r2] } as never;
      expect(signatureOf(before, after)).toBe('g:combinator[1]');
    });

    it('reports a combinator replaced by a rule as structural', () => {
      // Only the middle slot differs; the surrounding rules keep their identity.
      const r1 = rule('r1');
      const r2 = rule('r2');
      const before = { id: 'g', rules: [r1, 'and', r2] } as never;
      const after = { id: 'g', rules: [r1, rule('r3'), r2] } as never;
      expect(signatureOf(before, after)).toBe(structuralSignature);
    });
  });

  it('handles groups without ids', () => {
    const rules = [rule('r1')];
    const before = { combinator: 'and', rules };
    const after = { combinator: 'or', rules };
    expect(signatureOf(before as never, after as never)).toBe(':combinator');
  });

  it('handles nodes without ids', () => {
    const before = { combinator: 'and', rules: [{ field: 'f1', operator: '=', value: 'v1' }] };
    const after = { combinator: 'and', rules: [{ field: 'f1', operator: '=', value: 'v2' }] };
    expect(signatureOf(before as never, after as never)).toBe(':value');
  });
});
