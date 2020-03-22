import { waitForLoad } from '~/utils/dom';

/* eslint-disable import/prefer-default-export */

const domQuery = {
  profileLink: () => document.querySelector('#profile-link') as HTMLAnchorElement,
  profileImage: () => document.querySelector('.bb-avatar-image-nav') as HTMLImageElement,
};

export async function getUserId(): Promise<string> {
  const profileLink = await waitForLoad(domQuery.profileLink);
  return profileLink.href.split('profile/')[1].split('/')[0];
}

export async function getUserProfile(): Promise<string> {
  return (await waitForLoad(domQuery.profileImage)).src;
}
