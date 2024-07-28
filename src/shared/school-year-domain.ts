import { fetchData } from '~/utils/fetch';

const SCHOOL_YEAR_DOMAIN__PATH = '/school-year-domain/school-year-domain.json';
const SCHOOL_YEAR_DOMAIN_SCHEMA = 1;

interface SchoolYearDomain {
  start: string;
  end: string;
}

export default function fetchSchoolYearDomain(): Promise<SchoolYearDomain> {
  return fetchData(SCHOOL_YEAR_DOMAIN__PATH, SCHOOL_YEAR_DOMAIN_SCHEMA);
}
