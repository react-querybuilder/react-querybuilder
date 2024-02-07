import { act } from '@testing-library/react';
import userEvent, { PointerEventsCheckLevel } from '@testing-library/user-event';
import { defaultCombinators, defaultControlElements } from '../src';
import type { Classnames, Field, Schema } from '../src/types';

export const UNUSED = 'UNUSED';

const admonish = (fn: string) => () => {
  throw new Error(`Implement schema.${fn} for this test.`);
};

export const basicSchema: Schema<Field, string> = {
  qbId: 'qbId',
  fields: [],
  fieldMap: {},
  classNames: {} as Classnames,
  combinators: defaultCombinators,
  controls: defaultControlElements,
  createRule: admonish('createRule'),
  createRuleGroup: admonish('createRuleGroup'),
  dispatchQuery: admonish('dispatchQuery'),
  getQuery: admonish('getQuery'),
  getOperators: admonish('getOperators'),
  getValueEditorType: admonish('getValueEditorType'),
  getValueEditorSeparator: admonish('getValueEditorSeparator'),
  getValueSources: admonish('getValueSources'),
  getInputType: admonish('getInputType'),
  getValues: admonish('getValues'),
  getRuleClassname: admonish('getRuleClassname'),
  getRuleGroupClassname: admonish('getRuleGroupClassname'),
  accessibleDescriptionGenerator: admonish('accessibleDescriptionGenerator'),
  showCombinatorsBetweenRules: false,
  showNotToggle: false,
  showShiftActions: false,
  showCloneButtons: false,
  showLockButtons: false,
  autoSelectField: true,
  autoSelectOperator: true,
  addRuleToNewGroups: false,
  enableDragAndDrop: false,
  validationMap: {},
  independentCombinators: false,
  listsAsArrays: false,
  parseNumbers: false,
  disabledPaths: [],
};

export const findInput = (el: HTMLElement) =>
  (el.tagName === 'INPUT' ? el : el.querySelector('input')) as HTMLInputElement;

export const findInputs = (el: HTMLElement) =>
  (el.tagName === 'INPUT' ? el : el.querySelectorAll('input')) as NodeListOf<HTMLInputElement>;

export const findTextarea = (el: HTMLElement) =>
  (el.tagName === 'TEXTAREA' ? el : el.querySelector('textarea')) as HTMLTextAreaElement;

export const findSelect = (el: HTMLElement) =>
  (el.tagName === 'SELECT' ? el : el.querySelector('select')) as HTMLSelectElement;

export const hasOrInheritsClass = (el: HTMLElement | null, className: string) => {
  if (el && (el.classList.contains(className) || el.closest(`.${className}`))) {
    return true;
  }
  return false;
};

export const hasOrInheritsData = (
  el: HTMLElement | null,
  dataAttr: string,
  attempt = 1
): boolean => {
  if (!el || el.tagName === 'BODY') {
    return false;
  }
  if (typeof el.dataset[dataAttr] !== 'undefined') {
    return true;
  }
  if (attempt >= 10) {
    return false;
  }
  return hasOrInheritsData(el.parentElement, dataAttr, attempt + 1);
};

export const isOrInheritsChecked = (el: HTMLElement | null, attempt = 1): boolean => {
  if (!el || el.tagName === 'BODY') {
    return false;
  }
  try {
    expect(el).toBeChecked();
    return true;
  } catch (er) {
    if (attempt < 10) {
      return isOrInheritsChecked(el.parentElement, attempt + 1);
    }
  }
  return false;
};

export const userEventSetup = () => {
  const user = userEvent.setup({ pointerEventsCheck: PointerEventsCheckLevel.Never });
  // TODO: figure out a way to avoid these wrapper functions.
  // See http://kcd.im/react-act
  const click: (typeof userEvent)['click'] = async el =>
    act(async () => {
      await user.click(el);
    });
  const type: (typeof userEvent)['type'] = async (el, txt) =>
    act(async () => {
      await user.type(el, txt);
    });
  const selectOptions: (typeof userEvent)['selectOptions'] = async (el, opts) =>
    act(async () => {
      await user.selectOptions(el, opts);
    });
  return { ...user, click, selectOptions, type };
};

export const consoleMocks = () => {
  // TODO: This version works for Vitest. Not sure about bun:test yet.
  /*
  const consoleLog = jest.spyOn(console, 'log');
  const consoleError = jest.spyOn(console, 'error');
  const consoleInfo = jest.spyOn(console, 'info');
  const consoleWarn = jest.spyOn(console, 'warn');

  afterEach(() => {
    consoleError.mockReset();
    consoleInfo.mockReset();
    consoleLog.mockReset();
    consoleWarn.mockReset();
  });

  return {
    consoleError,
    consoleInfo,
    consoleLog,
    consoleWarn,
  };
  */

  const consoleErrorActual = console.error;
  const consoleInfoActual = console.info;
  const consoleLogActual = console.log;
  const consoleWarnActual = console.warn;
  const consoleLog = jest.fn();
  const consoleError = jest.fn();
  const consoleInfo = jest.fn();
  const consoleWarn = jest.fn();

  beforeAll(() => {
    console.error = consoleError;
    console.info = consoleInfo;
    console.log = consoleLog;
    console.warn = consoleWarn;
  });

  beforeEach(() => {
    consoleError.mockReset();
    consoleInfo.mockReset();
    consoleLog.mockReset();
    consoleWarn.mockReset();
  });

  afterAll(() => {
    console.error = consoleErrorActual;
    console.info = consoleInfoActual;
    console.log = consoleLogActual;
    console.warn = consoleWarnActual;
  });

  return {
    consoleError,
    consoleErrorActual,
    consoleInfo,
    consoleInfoActual,
    consoleLog,
    consoleLogActual,
    consoleWarn,
    consoleWarnActual,
  };
};
