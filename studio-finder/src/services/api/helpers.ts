// from https://www.tutorialspoint.com/converting-any-case-to-camelcase-in-javascript
export const toCamelCase = (str: string) => str
  .replace(/[^a-z0-9]/gi, ' ').toLowerCase().split(' ')
  .map((el, ind) => (ind === 0 ? el : el[0].toUpperCase() + el.substring(1, el.length)))
  .join('');

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
