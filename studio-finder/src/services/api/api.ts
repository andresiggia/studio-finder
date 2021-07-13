// from https://www.geeksforgeeks.org/how-to-convert-string-to-camel-case-in-javascript/
export const toCamelCase = (str: string) => str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => (
  index === 0 ? word.toLowerCase() : word.toUpperCase()
)).replace(/\s+/g, '');

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
