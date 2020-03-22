import { getUserProfile } from './user';

/* eslint-disable import/prefer-default-export */

export async function getCDNImageUrl(fileName: string) {
  const userProfileHref = await getUserProfile();
  const ftpId = userProfileHref.split('/ftpimages/')[1].split('/')[0];
  return `https://gannacademy.myschoolapp.com/ftpimages/${ftpId}/${fileName}`;
}
