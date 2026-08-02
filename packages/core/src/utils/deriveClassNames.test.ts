import { standardClassnames as sc } from '../defaults';
import {
  deriveRuleClassNames,
  deriveRuleGroupClassNames,
  deriveRuleGroupOuterClassName,
  deriveRuleOuterClassName,
} from './deriveClassNames';

describe('deriveRuleClassNames', () => {
  it('applies standard classnames by default', () => {
    const result = deriveRuleClassNames({ classNames: {} });
    expect(result.fields).toBe(sc.fields);
    expect(result.value).toBe(sc.value);
    expect(result.cloneRule).toBe(sc.cloneRule);
  });

  it('appends custom classnames in source order', () => {
    const result = deriveRuleClassNames({
      classNames: { valueSelector: 'vs', fields: 'f', actionElement: 'ae', cloneRule: 'cr' },
    });
    expect(result.fields).toBe(`${sc.fields} vs f`);
    expect(result.cloneRule).toBe(`${sc.cloneRule} ae cr`);
  });

  it('omits standard classnames when suppressed', () => {
    const result = deriveRuleClassNames({
      classNames: { valueSelector: 'vs', fields: 'f' },
      suppressStandardClassnames: true,
    });
    expect(result.fields).toBe('vs f');
  });

  it('covers every documented key', () => {
    const result = deriveRuleClassNames({ classNames: {} });
    expect(Object.keys(result).toSorted()).toEqual(
      [
        'cloneRule',
        'dragHandle',
        'fields',
        'lockRule',
        'matchMode',
        'matchThreshold',
        'muteRule',
        'operators',
        'removeRule',
        'shiftActions',
        'value',
        'valueListItem',
        'valueSource',
      ].toSorted()
    );
  });
});

describe('deriveRuleOuterClassName', () => {
  it('includes the standard rule class', () => {
    expect(deriveRuleOuterClassName({ classNames: {} })).toBe(sc.rule);
  });

  it('applies leading classnames first', () => {
    const result = deriveRuleOuterClassName({
      classNames: {},
      leadingClassNames: ['lead1', 'lead2'],
    });
    expect(result).toBe(`lead1 lead2 ${sc.rule}`);
  });

  it.each([
    ['disabled', { disabled: true }, sc.disabled],
    ['muted', { muted: true }, sc.muted],
    ['dragging', { isDragging: true }, sc.dndDragging],
    ['over', { isOver: true }, sc.dndOver],
    ['drop not allowed', { dropNotAllowed: true }, sc.dndDropNotAllowed],
    ['subquery', { hasSubQuery: true }, sc.hasSubQuery],
  ])('adds the %s class', (_label, state, expected) => {
    expect(deriveRuleOuterClassName({ classNames: {}, ...state })).toContain(expected);
  });

  it('adds the copy class only when over', () => {
    expect(
      deriveRuleOuterClassName({ classNames: {}, isOver: true, dropEffect: 'copy' })
    ).toContain(sc.dndCopy);
    expect(deriveRuleOuterClassName({ classNames: {}, dropEffect: 'copy' })).not.toContain(
      sc.dndCopy
    );
  });

  it('adds the group class only when over', () => {
    expect(deriveRuleOuterClassName({ classNames: {}, isOver: true, groupItems: true })).toContain(
      sc.dndGroup
    );
    expect(deriveRuleOuterClassName({ classNames: {}, groupItems: true })).not.toContain(
      sc.dndGroup
    );
  });

  it('applies custom conditional classnames', () => {
    const result = deriveRuleOuterClassName({
      classNames: { disabled: 'd', muted: 'm' },
      disabled: true,
      muted: true,
    });
    expect(result).toContain('d');
    expect(result).toContain('m');
  });

  it('appends the validation classname last', () => {
    const result = deriveRuleOuterClassName({ classNames: {}, validationClassName: 'invalid' });
    expect(result.endsWith('invalid')).toBe(true);
  });

  it('omits standard classnames when suppressed', () => {
    const result = deriveRuleOuterClassName({
      classNames: {},
      suppressStandardClassnames: true,
      disabled: true,
      isOver: true,
      dropEffect: 'copy',
      groupItems: true,
      dropNotAllowed: true,
      hasSubQuery: true,
      muted: true,
      isDragging: true,
    });
    expect(result).toBe('');
  });
});

describe('deriveRuleGroupClassNames', () => {
  it('applies standard classnames by default', () => {
    const result = deriveRuleGroupClassNames({ classNames: {} });
    expect(result.header).toBe(sc.header);
    expect(result.body).toBe(sc.body);
    expect(result.addRule).toBe(sc.addRule);
  });

  it('appends custom classnames in source order', () => {
    const result = deriveRuleGroupClassNames({
      classNames: { actionElement: 'ae', addRule: 'ar', valueSelector: 'vs', combinators: 'c' },
    });
    expect(result.addRule).toBe(`${sc.addRule} ae ar`);
    expect(result.combinators).toBe(`${sc.combinators} vs c`);
  });

  it('adds drag-and-drop state to the header', () => {
    const result = deriveRuleGroupClassNames({
      classNames: { dndCopy: 'copy', dndDropNotAllowed: 'nope' },
      isOver: true,
      dropEffect: 'copy',
      dropNotAllowed: true,
    });
    expect(result.header).toContain(sc.dndOver);
    expect(result.header).toContain(sc.dndCopy);
    expect(result.header).toContain(sc.dndDropNotAllowed);
    expect(result.header).toContain('copy');
    expect(result.header).toContain('nope');
  });

  it('omits standard classnames when suppressed', () => {
    const result = deriveRuleGroupClassNames({
      classNames: {},
      suppressStandardClassnames: true,
      isOver: true,
      dropEffect: 'copy',
      dropNotAllowed: true,
    });
    expect(result.header).toBe('');
    expect(result.body).toBe('');
  });

  it('composes the header through the same table as every other key', () => {
    // `header` is not special-cased: it declares `sources` plus `conditions`, so a port that
    // walks the table cannot omit its conditional classes.
    const plain = deriveRuleGroupClassNames({ classNames: { header: 'h' } });
    expect(plain.header).toBe(`${sc.header} h`);
  });

  it('applies the standard dndOver class to the header without a custom counterpart', () => {
    const result = deriveRuleGroupClassNames({
      classNames: { dndOver: 'custom-over' },
      isOver: true,
    });
    expect(result.header).toContain(sc.dndOver);
    // There is no custom `dndOver` class on the header element.
    expect(result.header).not.toContain('custom-over');
  });

  it('orders header classes: standard, custom, then conditional', () => {
    const result = deriveRuleGroupClassNames({
      classNames: { header: 'h', dndCopy: 'c', dndDropNotAllowed: 'n' },
      isOver: true,
      dropEffect: 'copy',
      dropNotAllowed: true,
    });
    expect(result.header).toBe(
      `${sc.header} h c n ${sc.dndOver} ${sc.dndCopy} ${sc.dndDropNotAllowed}`
    );
  });

  it('covers every documented key', () => {
    const result = deriveRuleGroupClassNames({ classNames: {} });
    expect(Object.keys(result).toSorted()).toEqual(
      [
        'addGroup',
        'addRule',
        'body',
        'cloneGroup',
        'combinators',
        'dragHandle',
        'header',
        'lockGroup',
        'muteGroup',
        'notToggle',
        'redoAction',
        'removeGroup',
        'shiftActions',
        'undoAction',
        'undoRedoActions',
      ].toSorted()
    );
  });
});

describe('deriveRuleGroupOuterClassName', () => {
  it('includes the standard ruleGroup class', () => {
    expect(deriveRuleGroupOuterClassName({ classNames: {} })).toBe(sc.ruleGroup);
  });

  it('applies leading classnames first, tolerating null', () => {
    expect(deriveRuleGroupOuterClassName({ classNames: {}, leadingClassNames: ['g', null] })).toBe(
      `g ${sc.ruleGroup}`
    );
  });

  it.each([
    ['disabled', { disabled: true }, sc.disabled],
    ['muted', { muted: true }, sc.muted],
    ['dragging', { isDragging: true }, sc.dndDragging],
  ])('adds the %s class', (_label, state, expected) => {
    expect(deriveRuleGroupOuterClassName({ classNames: {}, ...state })).toContain(expected);
  });

  it('adds the group class only when over', () => {
    expect(
      deriveRuleGroupOuterClassName({ classNames: {}, isOver: true, groupItems: true })
    ).toContain(sc.dndGroup);
    expect(deriveRuleGroupOuterClassName({ classNames: {}, groupItems: true })).not.toContain(
      sc.dndGroup
    );
  });

  it('does NOT reflect the rule-only drag-and-drop states', () => {
    // A group reflects fewer states than a rule; this asymmetry is deliberate.
    const result = deriveRuleGroupOuterClassName({
      classNames: {},
      isOver: true,
      dropEffect: 'copy',
      dropNotAllowed: true,
      hasSubQuery: true,
    });
    expect(result).not.toContain(sc.dndOver);
    expect(result).not.toContain(sc.dndCopy);
    expect(result).not.toContain(sc.dndDropNotAllowed);
    expect(result).not.toContain(sc.hasSubQuery);
  });

  it('appends the validation classname last', () => {
    const result = deriveRuleGroupOuterClassName({
      classNames: {},
      validationClassName: 'invalid',
    });
    expect(result.endsWith('invalid')).toBe(true);
  });

  it('applies custom conditional classnames', () => {
    const result = deriveRuleGroupOuterClassName({
      classNames: { disabled: 'd', muted: 'm', dndDragging: 'dg', dndGroup: 'gr' },
      disabled: true,
      muted: true,
      isDragging: true,
      isOver: true,
      groupItems: true,
    });
    for (const cn of ['d', 'm', 'dg', 'gr']) expect(result).toContain(cn);
  });

  it('omits standard classnames when suppressed', () => {
    expect(
      deriveRuleGroupOuterClassName({
        classNames: {},
        suppressStandardClassnames: true,
        disabled: true,
        muted: true,
        isDragging: true,
        isOver: true,
        groupItems: true,
      })
    ).toBe('');
  });
});
