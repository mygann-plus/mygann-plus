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
 * @param {number} a valueOf date
 * @param {number} b valueOf date
 * @returns {number} 1 if a > b; 0 if a = b; -1 if a < b
 */
export function compareDateMilliseconds(a, b) {
  return (a > b) - (a < b);
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

/**
 * Converts a Date object to a 12-hour time string
 * @param {Date} date
 */
export function dateTo12HrTimeString(date) {
  const hours = date.getHours();
  const minutes = date.getMinutes();

  const formattedHours = hours <= 12 ? hours : hours - 12;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  const period = hours < 12 ? 'AM' : 'PM';
  return `${formattedHours}:${formattedMinutes} ${period}`;
}

export function isDaylightSavings(date = new Date()) {
  const year = new Date().getFullYear();
  const jan = new Date(year, 0, 1);
  const jul = new Date(year, 6, 1);
  const standardTimezoneOffset = Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
  return !(date.getTimezoneOffset() < standardTimezoneOffset);
}

/**
 * Get Date object from the begining of today's date
 */
export function getAbsoluteToday() {
  const today = new Date();
  today.setHours(0);
  today.setMinutes(0);
  today.setSeconds(0);
  today.setMilliseconds(0);
  return today;
}

export function daysBetween(date1, date2) {
  return Math.floor((date1 - date2) / 86400000);
}

/**
 * Get Date object from date input
 * @param {HTMLDateInput} dateInput
 */
export function getDateFromInput(dateInput) {
  return new Date(`${dateInput.value}T00:00`);
}
