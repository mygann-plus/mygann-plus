export default function tick(t = 0) {
  return new Promise<void>(res => {
    setTimeout(() => {
      res();
    }, t);
  });
}

const minListeners: Function[] = [];
export function addMinuteListener(callback: () => void) {
  callback();
  minListeners.push(callback);
  return { remove() {
    minListeners.splice(minListeners.indexOf(callback), 1);
  } };
}

// return a promise that fulfills once the current minute is not a given last minute, checking every 10 ms
function ensureNewMinute(lastMinute: number) {
  return new Promise<number>(res => {
    let now = new Date().getMinutes();
    if (now !== lastMinute) return res(now);
    const interval = setInterval(() => {
      now = new Date().getMinutes();
      if (now !== lastMinute) {
        clearInterval(interval);
        return res(now);
      }
    }, 10);
  });
}

export async function startMinuteListeners() {
  const now = new Date();
  let lastMinute = now.getMinutes();
  await tick((60 - now.getSeconds()) * 1e3 - now.getMilliseconds());
  lastMinute = await ensureNewMinute(lastMinute);
  setInterval(async () => {
    lastMinute = await ensureNewMinute(lastMinute);
    for (let fn of minListeners) fn();
  }, 60_000); // TODO: Could be thrown off if tab is inactive
  // for (let fn of minListeners) fn();
  // await startMinuteListeners(); // so that it stays on track to run at beginning of minute
}

addMinuteListener(() => console.log('min', new Date()));
