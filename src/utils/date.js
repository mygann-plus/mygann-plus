/* eslint-disable import/prefer-default-export */

export function isLeapYear() {
  const year = (new Date()).getFullYear();
  return ((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0);
}
