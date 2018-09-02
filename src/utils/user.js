import { waitForLoad } from '~/utils/dom';

/* eslint-disable import/prefer-default-export */

export async function getUserId() {
  const profileLink = await waitForLoad(() => document.querySelector('#profile-link'));
  return profileLink.href.split('profile/')[1].split('/')[0];
}
