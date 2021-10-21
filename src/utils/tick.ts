export default function tick(t = 0) {
  return new Promise<void>(res => {
    setTimeout(() => {
      res();
    }, t);
  });
}
