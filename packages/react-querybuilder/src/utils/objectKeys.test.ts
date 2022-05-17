import { objectKeys } from './objectKeys';

it('gets the object keys', () => {
  expect(objectKeys({ THIS: 'this', that: 'that', theOther: 'the other' }).sort()).toEqual([
    'THIS',
    'that',
    'theOther',
  ]);
});
