export default function log(functionName, ...args) {
  if (process.env.NODE_ENV !== 'production') {
    console[functionName](...args); // eslint-disable-line no-console
  }
}
