// adapted from https://dmitripavlutin.com/how-to-compare-objects-in-javascript/
export const isObject = (item: any) => item != null && typeof item === 'object';

// adapted from https://dmitripavlutin.com/how-to-compare-objects-in-javascript/
export const deepEqual = (item1: any, item2: any): boolean => {
  const isObject1 = isObject(item1);
  const isObject2 = isObject(item2);

  // if only one is an object
  if (isObject1 !== isObject2) {
    return false;
  }

  // if both are not objects
  if (!isObject1 && !isObject2) {
    return item1 === item2;
  }

  // if both are objects
  const keys1 = Object.keys(item1);
  const keys2 = Object.keys(item2);

  // if number of properties differ
  if (keys1.length !== keys2.length) {
    return false;
  }

  // compare properties
  return Object.keys(keys1).every((key: string) => {
    const val1 = item1[key];
    const val2 = item2[key];
    if (val1 instanceof Date && val2 instanceof Date) {
      return val1.getTime() === val2.getTime();
    }
    const areObjects = isObject(val1) && isObject(val2);
    return areObjects
      ? deepEqual(val1, val2)
      : val1 === val2;
  });
};
