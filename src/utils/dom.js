export function waitForLoad(condition, intervalTime = 500) {
  const c = typeof condition === 'string' ? () => eval(condition) : condition; // eslint-disable-line no-eval
  return new Promise(res => {
    let interval = setInterval(() => {
      if (c()) {
        clearInterval(interval);
        res();
      }
    }, intervalTime); // allow for shorter intervals for in-page waits (see registerListeners)
  });
}

export function registerListeners(elemsFunc, listener) {
  // elemsFunc returns an array of elements, not a NodeList
  waitForLoad(() => elemsFunc().every(e => !!e), 10) // every element is defined
    .then(() => {
      elemsFunc().forEach(e => e.addEventListener('click', listener));
    });
}
