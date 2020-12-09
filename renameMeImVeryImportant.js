eval(localStorage.getItem('MyGannPlus')); // try running it immediatly
(async () => {
  const res = await fetch('https://mygann-plus-bookmarklet.surge.sh/dist/content-script.js');
  const text = await res.text();
  if (localStorage.getItem('MyGannPlus') === null) eval(text); // if there was nothing to run run it now
  localStorage.setItem('MyGannPlus', text); // updste the localStorage
})();

// Minified (by me so might not be great)
eval(localStorage.getItem('MyGannPlus'));fetch('https://mygann-plus-bookmarklet.surge.sh/dist/content-script.js').then(d=>d.text()).then(s=>{localStorage.getItem('MyGannPlus')??eval(s);localStorage.setItem('MyGannPlus',s);});