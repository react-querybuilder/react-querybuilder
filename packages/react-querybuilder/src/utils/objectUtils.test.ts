import { objectEntries, objectKeys } from './objectUtils';

it('gets the object keys', () => {
  expect(objectKeys({ THIS: 'this', that: 'that', theOther: 'the other' }).sort()).toEqual([
    'THIS',
    'that',
    'theOther',
  ]);
});

it('gets the object entries', () => {
  expect(
    objectEntries({ THIS: 'this', that: 'that', theOther: 'the other' }).sort((a, b) =>
      a[0].localeCompare(b[0])
    )
  ).toEqual([
    ['that', 'that'],
    ['theOther', 'the other'],
    ['THIS', 'this'],
  ]);
});
