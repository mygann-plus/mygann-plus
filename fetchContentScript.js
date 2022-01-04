/* eslint-disable no-eval, no-console */
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
