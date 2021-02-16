/* eslint-disable import/prefer-default-export */

// https://stackoverflow.com/a/12646864/13998894
export function shuffle(array: Object[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
