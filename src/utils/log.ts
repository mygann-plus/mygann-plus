type ConsoleFunction = 'log' | 'error' | 'warn' | 'info';

export default function log(functionName: ConsoleFunction, ...args: any[]) {
  if (process.env.NODE_ENV !== 'production') {
    console[functionName](...args); // eslint-disable-line no-console
  }
}
