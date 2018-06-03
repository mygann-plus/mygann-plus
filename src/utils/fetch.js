/* eslint-disable import/prefer-default-export */

export function fetchJson(url, opts) {
  return fetch(url, Object.assign({
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    credentials: 'same-origin',
  }, opts))
    .then(r => r.json());
}
export function fetchApi(endpoint, opts) {
  if (!endpoint.startsWith('/')) {
    throw new Error('Endpoint must start with /');
  }
  return fetchJson(`https://gannacademy.myschoolapp.com${endpoint}`, opts);
}
