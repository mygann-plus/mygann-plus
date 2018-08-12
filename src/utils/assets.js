/* eslint-disable import/prefer-default-export */

/**
 * Get URL of asset in assets/ folder.
 * @param {string} assetName Asset name, relative to assets/
 * @returns {string} Full URL of asset
 */
export function getAssetUrl(assetName) {
  return chrome.runtime.getURL(assetName);
}
