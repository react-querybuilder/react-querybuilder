import { objectEntries, objectKeys } from './objectUtils';

it('gets the object keys', () => {
  // oxlint-disable-next-line no-array-sort
  expect(objectKeys({ THIS: 'this', that: 'that', theOther: 'the other' }).sort()).toEqual([
    'THIS',
    'that',
    'theOther',
  ]);
});

it('gets the object entries', () => {
  expect(
    // oxlint-disable-next-line no-array-sort
    objectEntries({ THIS: 'this', that: 'that', theOther: 'the other' }).sort((a, b) =>
      a[0].localeCompare(b[0])
    )
  ).toEqual([
    ['that', 'that'],
    ['theOther', 'the other'],
    ['THIS', 'this'],
  ]);
});
