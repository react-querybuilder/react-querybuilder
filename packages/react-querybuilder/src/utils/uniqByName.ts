const uniqByName = <T extends { name: string }>(originalArray: T[]): T[] => {
  const names = new Set();
  const newArray: any[] = [];
  originalArray.forEach(el => {
    if (!names.has(el.name)) {
      names.add(el.name);
      newArray.push(el);
    }
  });
  return newArray;
};

export default uniqByName;
