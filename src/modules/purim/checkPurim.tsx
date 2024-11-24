import { HebrewCalendar, Location } from '@hebcal/core';
import storage from '~/utils/storage';

const SCHEMA_VERSION = 1;
const PURIM_KEY = 'purim_date';

function getPurimDate(year: number) {
  const options = {
    year,
    isHebrewYear: false,
    candlelighting: true,
    location: Location.lookup('Boston'),
    sedrot: false,
    omer: false,
  };
  const events = HebrewCalendar.calendar(options);

  for (const ev of events) {
    const hd = ev.getDate();
    const date = hd.greg();
    if (ev.render('en') === 'Purim') {
      return date;
    }
  }
}

function compareDates(target: Date) {
  const date = new Date();
  const targetDate = new Date(
    target.getFullYear(),
    target.getMonth(),
    target.getDate(),
  );
  const testDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );

  if (testDate < targetDate) return -1;
  if (testDate > targetDate) return 1;
  return 0;
}

async function getLocalPurimDate() {
  const purimDate = await storage.get(PURIM_KEY, SCHEMA_VERSION);
  if (purimDate !== null && !Number.isNaN(Date.parse(purimDate))) {
    return new Date(purimDate);
  } else {
    let tempDate = new Date(2007, 0, 24);
    storage.set(PURIM_KEY, tempDate.toISOString(), SCHEMA_VERSION);
    return tempDate;
  }
}

export default async function isPurim() {
  let year = new Date().getFullYear() - 1;
  let target = await getLocalPurimDate();
  let compare = compareDates(target);

  if (compare === 1) {
    while (compare === 1) {
      year++;
      target = await getPurimDate(year);
      compare = compareDates(target);
    }

    storage.set(PURIM_KEY, target.toISOString(), SCHEMA_VERSION);
  }
  return compare === 0;
}
