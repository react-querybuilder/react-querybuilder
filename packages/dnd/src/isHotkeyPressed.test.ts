import { userEventSetup } from '@rqb-testing';
import { isHotkeyPressed } from './isHotkeyPressed';

const user = userEventSetup();

it.each([
  ['⌘', 'Meta'],
  ['Cmd', 'Meta'],
  ['Command', 'Meta'],
  ['⊞', 'Meta'],
  ['Win', 'Meta'],
  ['Windows', 'Meta'],
  ['Meta', 'Meta'],
  ['⇧', 'Shift'],
  ['⌥', 'Alt'],
  ['⌃', 'Control'],
  ['Control', 'Control'],
])('works for "%s"', async (alias, keyCode) => {
  expect(isHotkeyPressed(alias)).toBe(false);
  await user.keyboard(`{${keyCode}>}`);
  expect(isHotkeyPressed(alias)).toBe(true);
  await user.keyboard(`{/${keyCode}}`);
  expect(isHotkeyPressed(alias)).toBe(false);
  window.dispatchEvent(new Event('blur'));
});
