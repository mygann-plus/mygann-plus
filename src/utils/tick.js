export default function tick(t = 0) {
  return new Promise(res => {
    setTimeout(() => {
      res();
    }, t);
  });
}
