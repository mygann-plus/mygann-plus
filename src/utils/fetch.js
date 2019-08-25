import log from '~/utils/log';

const getVerificationToken = () => {
  return document.getElementsByName('__RequestVerificationToken')[0].value;
};

function mergeHeaders(base, extension) {
  if (!extension) {
    return base;
  }

  const finalHeaders = new Headers();
  const copyHeaders = headers => {
    for (let header of headers.entries()) {
      finalHeaders.append(...header);
    }
  };

  copyHeaders(base);
  copyHeaders(extension);
  return finalHeaders;
}

export function fetchJson(url, opts = {}) {
  const headers = opts ? opts.headers : null;
  const jsonHeaders = mergeHeaders(new Headers({
    Accept: 'application/json',
    'Content-Type': 'application/json',
  }), headers);

  return fetch(url, Object.assign({
    credentials: 'same-origin',
  }, opts, jsonHeaders))
    .then(r => r.json());
}

export function fetchApi(endpoint, opts = {}) {
  if (!endpoint.startsWith('/')) {
    throw new Error('Endpoint must start with /');
  }

  const headers = opts ? opts.headers : null;
  const apiHeaders = mergeHeaders(new Headers({
    requestverificationtoken: getVerificationToken(),
    accept: 'application/json, text/javascript, */*; q=0.01',
    'content-type': 'application/json',
  }), headers);

  return fetchJson(`https://gannacademy.myschoolapp.com${endpoint}`, Object.assign(opts, {
    headers: apiHeaders,
  }));
}

const DATA_ENDPOINT = 'https://mygannplus-data.surge.sh';

// Fetch path from /data endpoint
export function fetchRawData(name) {
  if (!name.startsWith('/')) {
    return log('warn', 'Data path must start with /');
  }

  return fetchJson(DATA_ENDPOINT + name);
}

export async function fetchData(name, schemaVersion) {
  const resource = await fetchRawData(name);
  if (resource) {
    return resource[schemaVersion];
  }
}
