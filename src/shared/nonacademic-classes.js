import { fetchData } from '~/utils/fetch';

const NONACADEMIC_CLASSES_PATH = '/nonacademic-classes/nonacademic-classes.json';
const NONACADEMIC_CLASSES_SCHEMA = 2;

export default function fetchNonacademicClasses() {
  return fetchData(NONACADEMIC_CLASSES_PATH, NONACADEMIC_CLASSES_SCHEMA);
}
