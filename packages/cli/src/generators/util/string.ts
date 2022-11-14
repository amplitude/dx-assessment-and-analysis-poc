import { camelCase, upperFirst } from "lodash";

export function upperCamelCase(str: string) {
  return upperFirst(camelCase(str));
}

export function containsSpecialCharacters(str: string): boolean { // eslint-disable-line @typescript-eslint/no-unused-vars
  const specialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/; // eslint-disable-line
  return specialChars.test(str);
}
