export const isValidDate = (date: any): date is Date => (
  !!date && date instanceof Date && !Number.isNaN(date.getTime())
);

// adapted from https://dmitripavlutin.com/how-to-compare-objects-in-javascript/
export const isObject = (item: any) => item != null && typeof item === 'object';

export const isDateEqual = (val1: Date, val2: Date) => val1.getTime() === val2.getTime();

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

  if (isValidDate(item1) && isValidDate(item2)) {
    return isDateEqual(item1, item2);
  }

  // if number of properties differ
  if (keys1.length !== keys2.length) {
    return false;
  }

  // compare properties
  return keys1.every((key: string) => {
    const val1 = item1[key];
    const val2 = item2[key];
    return deepEqual(val1, val2);
  });
};

export const pad = (num: number, size: number) => {
  let s = `${num}`;
  while (s.length < size) s = `0${s}`;
  return s;
};

// adapted from https://stackoverflow.com/questions/6712034/sort-array-by-firstname-alphabetically-in-javascript
export const sortByKey = (arr: any[], key: string) => arr.sort((a, b) => {
  const valA = a[key];
  const valB = b[key];
  if (valA < valB) return -1;
  if (valA > valB) return 1;
  return 0;
});

export const getFilename = (url: string) => {
  const nameArr = url.split('/');
  return nameArr[nameArr.length - 1];
};

export const overflowText = (text: string, maxChars: number, overflowIndicator = '...') => {
  if (text.length > maxChars) {
    const maxCharsWithOverflowIndicator = maxChars - overflowIndicator.length;
    return `${text.substr(0, maxCharsWithOverflowIndicator)}${overflowIndicator}`;
  }
  return text;
};
