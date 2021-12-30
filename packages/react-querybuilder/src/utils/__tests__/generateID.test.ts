import { generateID } from '../generateID';

describe('when generating IDs', () => {
  it('should generate different IDs', () => {
    const id1 = generateID();
    const id2 = generateID();

    expect(id1).not.toBe(id2);
  });
});
