import { getFirstOption, toOptions } from '../optGroupUtils';

it('handles invalid inputs', () => {
  expect(toOptions()).toBeNull();
  expect(getFirstOption()).toBeNull();
  expect(getFirstOption([])).toBeNull();
});
