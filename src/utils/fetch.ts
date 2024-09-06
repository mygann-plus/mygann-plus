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

// const DATA_ENDPOINT = 'https://mygannplus-data.surge.sh';
const DATA_ENDPOINT = 'https://mygann-plus.netlify.app/data';

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
