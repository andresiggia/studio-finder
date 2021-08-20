import { isValidDate } from '../helpers/misc';

// from https://www.tutorialspoint.com/converting-any-case-to-camelcase-in-javascript
export const toCamelCase = (str: string) => str
  .replace(/[^a-z0-9]/gi, ' ').toLowerCase().split(' ')
  .map((el, ind) => (ind === 0 ? el : el[0].toUpperCase() + el.substring(1, el.length)))
  .join('');

// from https://stackoverflow.com/questions/30970286/convert-javascript-object-camelcase-keys-to-underscore-case
export const toUnderscoreCase = (str: string) => str.replace(/([A-Z])/g, '_$1').toLowerCase();

export const convertObjectKeysToCamelCase = (originalObj: any) => {
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

export const convertObjectKeysToUnderscoreCase = (originalObj: any) => {
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

export const convertFromAPI = (original: any, dateFields: string[] = []) => {
  const converted = convertObjectKeysToCamelCase(original);
  dateFields.forEach((fieldName: string) => {
    const value = converted[fieldName];
    if (value) {
      const offsetMs = (new Date()).getTimezoneOffset() * 60 * 1000;
      const newValue = new Date((new Date(value)).getTime() - offsetMs);
      converted[fieldName] = newValue;
    }
  });
  return converted;
};

export const convertToAPI = (original: any, dateFields: string[] = []) => {
  const converted = convertObjectKeysToUnderscoreCase(original);
  dateFields.forEach((fieldName: string) => {
    const date = converted[fieldName];
    if (isValidDate(date)) {
      const offsetMs = (new Date()).getTimezoneOffset() * 60 * 1000;
      const newValue = new Date(date.getTime() + offsetMs);
      converted[fieldName] = newValue;
    }
  });
  return converted;
};

export const convertDateForComparison = (date: Date) => (
  date.toUTCString()
);
