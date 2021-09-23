import log from '~/utils/log';

const getVerificationToken = () => {
  const input = document.getElementsByName('__RequestVerificationToken')[0] as HTMLInputElement;
  return input.value;
};

function mergeHeaders(base: Headers, extension: Headers) {
  if (!extension) {
    return base;
  }

  const finalHeaders = new Headers();
  const copyHeaders = (headers: Headers) => {
    for (const header of headers.entries()) {
      finalHeaders.append(...header);
    }
  };

  copyHeaders(base);
  copyHeaders(extension);
  return finalHeaders;
}

export function fetchJson(url: string, opts: RequestInit = {}) {
  const headers = opts ? opts.headers : null;
  const jsonHeaders = mergeHeaders(new Headers({
    Accept: 'application/json',
    'Content-Type': 'application/json',
  }), headers as Headers);

  return fetch(url, { credentials: 'same-origin', ...opts, ...jsonHeaders })
    .then(r => r.json());
}

const apis: { [name: string]: (...params: any[]) => string; } = {
  // calender(startDate: string, endDate: string) { return `/api/dummyCalender?start=${startDate}&end=${endDate}`; },
  calender: (startDate: string, endDate: string) => `/api/dummyCalender?start=${startDate}&end=${endDate}`,
  daySchedule: (date: string) => `/api/dummyDayCalendar?date=${date}`,
  todaysStuff: () => '/api/dummyStuff',
};

let fetched: { [name: string]: Promise<any>; } = {};

export function updateApi(name: string, ...params: any[]) {
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  fetched[name] = fetchApi(apis[name](...params));
}

export function getApi(name: string) {
  if (!fetched[name]) updateApi(name);
  return fetched[name];
}

export function fetchApi(endpoint: string, opts: RequestInit = {}) {
  if (!endpoint.startsWith('/')) {
    throw new Error('Endpoint must start with /');
  }

  const headers = opts ? opts.headers : null;
  const apiHeaders = mergeHeaders(new Headers({
    requestverificationtoken: getVerificationToken(),
    accept: 'application/json, text/javascript, */*; q=0.01',
    'content-type': 'application/json',
  }), headers as Headers);

  return fetchJson(`https://gannacademy.myschoolapp.com${endpoint}`, Object.assign(opts, {
    headers: apiHeaders,
  }));
}

const DATA_ENDPOINT = 'https://mygannplus-data.surge.sh';

// Fetch path from /data endpoint
export function fetchRawData(name: string) {
  if (!name.startsWith('/')) {
    return log('warn', 'Data path must start with /');
  }

  return fetchJson(DATA_ENDPOINT + name);
}

export async function fetchData(name: string, schemaVersion: number) {
  const resource = await fetchRawData(name);
  if (resource) {
    return resource[schemaVersion];
  }
}
