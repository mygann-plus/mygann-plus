/**
 * @returns {number} 1 if a > b; 0 if a = b; -1 if a < b
 */
export function compareDate(a: Date, b: Date) {
  const aVal = a.valueOf();
  const bVal = b.valueOf();
  return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
}

/**
 * @returns {number} 1 if a > b; 0 if a = b; -1 if a < b
 */
export function compareDateMilliseconds(a: number, b: number) {
  return a > b ? 1 : a < b ? -1 : 0;
}

export function to24Hr(timeString: string) {
  let hours = Number(timeString.match(/^(\d+)/)[1]);
  const minutes = Number(timeString.match(/:(\d+)/)[1]);
  const ampm = timeString.match(/\s(.*)$/)[1];
  if (ampm === 'PM' && hours < 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours -= 12;
  let sHours = hours.toString();
  let sMinutes = minutes.toString();
  if (hours < 10) sHours = `0${sHours}`;
  if (minutes < 10) sMinutes = `0${sMinutes}`;
  return `${sHours}:${sMinutes}:00`;
}

/**
 * Converts a 24-hour time string to a Date object
*/
export function timeStringToDate(timeString: string) {
  const date = new Date();
  const [hours, minutes, seconds] = timeString.split(':').map(Number);
  date.setHours(hours, minutes, seconds, 0);
  return date;
}

/**
 * Converts a Date object to a 12-hour time string
 * @param {Date} date
 */
export function dateTo12HrTimeString(date: Date) {
  const hours = date.getHours();
  const minutes = date.getMinutes();

  const formattedHours = hours <= 12 ? hours : hours - 12;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  const period = hours < 12 ? 'AM' : 'PM';
  return `${formattedHours}:${formattedMinutes} ${period}`;
}

function isBetween(start: string, end: string) {
  const currentDate = new Date();
  const startDate = new Date(currentDate.getTime());
  const startTime = start.split(':').map(Number);
  startDate.setHours(startTime[0], startTime[1], startTime[2], 0);
  const endDate = new Date(currentDate.getTime());
  const endTime = end.split(':').map(Number);
  endDate.setHours(endTime[0], endTime[1], endTime[2], 0);
  return startDate <= currentDate && endDate > currentDate;
}

export function isCurrentTime(timeString: string) {
  const times = timeString.split('-').map(s => to24Hr(s.trim()));
  return isBetween(times[0], times[1]);
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
  today.setHours(0, 0, 0, 0);
  return today;
}

export function daysBetween(date1: number, date2: number) {
  return Math.floor((date1 - date2) / 86400000);
}

/**
 * Get Date object from date input
 * @param {HTMLDateInput} dateInput
 */
export function getDateFromInput(dateInput: HTMLInputElement) {
  return new Date(`${dateInput.value}T00:00`);
}
