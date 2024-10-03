export const uuidV4regex: RegExp =
  /^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i;
const arr = Array.from<number>({ length: 10_000 }).fill(0);

export const testGenerateID = (generateID: () => string): void => {
  it('should generate valid, unique v4 UUIDs', () => {
    const ids = arr.map(() => generateID());
    for (const [idx, id] of ids.entries()) {
      expect(id).toMatch(uuidV4regex);
      expect(ids.indexOf(id)).toBe(idx);
    }
  });
};
