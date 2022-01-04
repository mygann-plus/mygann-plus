import { fetchData } from '~/utils/fetch';

interface SchoolEvents {
  brusherGames: boolean,
  zoomSchool: boolean
}

const SCHOOL_EVENTS_PATH = '/school-events/school-events.json';
const SCHOOL_EVENTS_SCHEMA = 1;

let schoolEvents: Promise<SchoolEvents>;

export function getAllSchoolEvents() {
  if (!schoolEvents) schoolEvents = fetchData(SCHOOL_EVENTS_PATH, SCHOOL_EVENTS_SCHEMA); // schoolEvents ??= await... gives expression expected. Maybe something about the typescript version idk
  return schoolEvents;
}

export default async function isSchoolEvent(eventName: keyof SchoolEvents) {
  let fetchedEvents = await getAllSchoolEvents();
  return fetchedEvents[eventName] ?? false; // if it was removed then its just not running
}
