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

/**
 * Converts a 24-hour time string to a Date object
*/
export function timeStringToDate(timeString) {
  const date = new Date();
  date.setHours(timeString.split(':')[0]);
  date.setMinutes(timeString.split(':')[1]);
  date.setSeconds(timeString.split(':')[2]);
  return date;
}

export function getCurrentDay() {
  return document.querySelector('.chCal-header-space + h2').textContent.split(',')[0].trim();
}
