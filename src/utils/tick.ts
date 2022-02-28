export default function tick(t = 0) {
  return new Promise<void>(res => {
    setTimeout(res, t);
  });
}

const minuteListeners: Function[] = [];
setInterval(() => {
  for (const fn of minuteListeners) {
    fn();
  }
}, 60_000);

export function addMinuteListener(callback: () => void) {
  minuteListeners.push(callback);
  return {
    remove() {
      minuteListeners.splice(minuteListeners.indexOf(callback), 1);
    },
  };
}
