export const sanitizeString = (str: string): string =>
  str.replace(/[`~!@#$%^&*()_|+\-=?;:'",<>\{\}\[\]\\\/]/gi, "");
