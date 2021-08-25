let s = document.createElement('script');
s.src = chrome.runtime.getURL('dist/content-script.js');
s.onload = function () {
  this.remove();
};
(document.head || document.documentElement).appendChild(s);
