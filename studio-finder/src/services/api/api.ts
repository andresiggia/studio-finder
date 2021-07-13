// from https://www.geeksforgeeks.org/how-to-convert-string-to-camel-case-in-javascript/
export const toCamelCase = (str: string) => str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => (
  index === 0 ? word.toLowerCase() : word.toUpperCase()
)).replace(/\s+/g, '');

// from https://stackoverflow.com/questions/30970286/convert-javascript-object-camelcase-keys-to-underscore-case
export const toUnderscoreCase = (str: string) => str.replace(/([A-Z])/g, '_$1').toLowerCase();

export const updateObjectKeysToCamelCase = (originalObj: any) => {
  let obj: any = null;
  if (originalObj) {
    obj = {};
    Object.keys(originalObj).forEach((key: string) => {
      const ccKey = toCamelCase(key);
      obj[ccKey] = originalObj[key];
    });
  }
  return obj;
};

export const updateObjectKeysToUnderscoreCase = (originalObj: any) => {
  let obj: any = null;
  if (originalObj) {
    obj = {};
    Object.keys(originalObj).forEach((key: string) => {
      const ucKey = toUnderscoreCase(key);
      obj[ucKey] = originalObj[key];
    });
  }
  return obj;
};
