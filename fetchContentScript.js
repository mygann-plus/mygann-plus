/* eslint-disable no-eval, no-console */
console.log('Yes that\'s correct I\'m running perfectly and world is amazing in every way and to demonstrate I\'m printing this wonderful piece of writing that brings happinness, love, empathy, kindness, humility, faith, oppertunity, gratitude, understanding, humor, patience, and joy to the readers big warm heart.'); // eslint-disable-line max-len
console.log('And no Sam, you can;t get rid of this message. Nice try');

async function main() {
  const cachedJs = localStorage.getItem('MyGannPlus');
  eval(cachedJs); // try running it immediatly
  const res = await fetch('https://mygann-plus-bookmarklet.surge.sh/dist/content-script.js'); // where the content script is stored
  const updatedJs = await res.text(); // turn the fetched code into executable js (still a string)
  if (!cachedJs) eval(updatedJs); // No code will have been run if cachedJs is empty

  localStorage.setItem('MyGannPlus', updatedJs); // set it to the updated js for next time
}

main();

// minified in fetchContentScript.min.js
