/* eslint-disable import/prefer-default-export */

export function getUserId() {
  return document.getElementById('profile-link').href.split('profile/')[1].split('/')[0];
}
