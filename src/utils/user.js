/* eslint-disable import/prefer-default-export */

export function getUserId() {
  return document.getElementById('profile-link').href.split('profile/')[1].split('/')[0];
}
export function getUserProfile() {
  return document.getElementById('mobile-account-nav').children[0].children[0].src.split('?')[0];
}
