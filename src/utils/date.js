export function isLeapYear() {
  const year = (new Date()).getFullYear();
  return ((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0);
}

/**
 * Formats date mm/dd/yyyy
 * @param {Date} date Date to format
 * @param {string} [divider=/] Character to divide mm/dd/yyy
 * @param {boolean} [addLeadingZeros=false]
 */
export function formatDate(date, divider = '/', addLeadingZeros) {
  let d = new Date(date);
  let month = d.getMonth() + 1;
  let day = d.getDate();
  let year = d.getFullYear();

  if (addLeadingZeros) {
    if (month.toString().length === 1) { month = `0${month}`; }
    if (day.toString().length === 1) { day = `0${day}`; }
  }

  return [month, day, year].join(divider);
}

/**
 * @param {Date} a
 * @param {Date} b
 * @returns {number} 1 if a > b; 0 if a = b; -1 if a < b
 */
export function compareDate(a, b) {
  const aVal = a.valueOf();
  const bVal = b.valueOf();
  return (aVal > bVal) - (aVal < bVal);
}

/**
 *
 * @param {HTMLInputElement} input
 * @param {string} dateString Date string in format mm/dd/yyyy
 */
export function setDateInputValue(input, dateString) {
  const str = dateString;
  const value = `${str.substring(6, 10)}-${dateString.substring(0, 2)}-${str.substring(3, 5)}`;
  input.value = value;
}
/**
 * @param {*} input
 * @returns Value of date input in format mm/dd/yyyy
 */
export function getDateInputValue(input) {
  const { value } = input;
  const val = `${value.substring(5, 7)}/${value.substring(8, 10)}/${value.substring(0, 4)}`;
  return formatDate(val);
}
/**
 * @param {number} month
 * @param {number} [year=currentYear]
 */
export function getDaysInMonth (month, year) {
  year = year || new Date().getFullYear();
  return new Date(year, month, 0).getDate();
}
/**
 * Convert a month string to a zero-based index
 * @param {string} monthString Name of month in any common form (e.g. Jan, January)
 */
export function getMonthFromString(monthString) {
  return new Date(Date.parse(`${monthString} 1, 2000`)).getMonth();
}
