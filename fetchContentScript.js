console.log('Yes that\'s correct I\'m running perfectly and world is amazing in every way and to demonstrate I\'m printing this wonderful piece of writing that brings happinness, love, empathy, kindness, humility, faith, oppertunity, gratitude, understanding, humor, patience, and joy to the readers big warm heart.');

eval(localStorage.getItem('MyGannPlus')); // try running it immediatly
(async () => {
  const res = await fetch('https://mygann-plus-bookmarklet.surge.sh/dist/content-script.js');
  const text = await res.text();
  if (localStorage.getItem('MyGannPlus') === null) eval(text); // if there was nothing to run run it now
  if (localStorage.getItem('MyGannPlus') !== text) localStorage.setItem('MyGannPlusUpdated', 'true');
  localStorage.setItem('MyGannPlus', text); // update the localStorage
})();

// minified in fetchContentScript.min.js