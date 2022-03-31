import { fetchData } from '~/utils/fetch';

const NONACADEMIC_CLASSES_PATH = '/nonacademic-classes/nonacademic-classes.json';
const NONACADEMIC_CLASSES_SCHEMA = 2;

interface NonacademicClasses {
  classesMenu: string[];
  progress: string[];
}

export default function fetchNonacademicClasses(): Promise<NonacademicClasses> {
  return fetchData(NONACADEMIC_CLASSES_PATH, NONACADEMIC_CLASSES_SCHEMA);
}
