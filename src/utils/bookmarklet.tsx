import { createElement } from '~/utils/dom';

const loadedIndicatorId = 'gocp_bookmarklet_loaded';

export function isBookmarklet() {
  // if window is undefined it is probably the background script, therefor not the bookmarklet
  return typeof window !== 'undefined'
    && !(window.chrome && window.chrome.runtime && window.chrome.runtime.getURL);
}

export function isBookmarletLoaded() {
  return !!document.querySelector(`#${loadedIndicatorId}`);
}

export function markBookmarkletLoaded() {
  const loadedIndicator = <span id={loadedIndicatorId} />;
  document.body.appendChild(loadedIndicator);
}
