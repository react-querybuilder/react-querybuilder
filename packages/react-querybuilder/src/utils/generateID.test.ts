import { generateID } from './generateID';

const uuidV4regex = /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;
const arr = new Array(10_000).fill(0);
const ids = arr.map(generateID);

it('should generate valid, unique v4 UUIDs', () => {
  ids.forEach((id, idx) => {
    expect(id).toMatch(uuidV4regex);
    expect(ids.indexOf(id)).toBe(idx);
  });
});
