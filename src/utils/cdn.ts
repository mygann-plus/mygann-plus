import { getUserProfile } from './user';

/* eslint-disable import/prefer-default-export */

export async function getCDNImageUrl(fileName: string) {
  // const userProfileHref = await getUserProfile();
  // const ftpId = userProfileHref.split('/ftpimages/')[1].split('/')[0];

  // const context = await (await fetch('https://gannacademy.myschoolapp.com/api/webapp/schoolcontext')).json();
  // .then(r => r.json);
  const response = await fetch('https://gannacademy.myschoolapp.com/api/webapp/schoolcontext');
  const context = await response.json();
  const ftpId = context.SchoolInfo.SchoolId;
  return `https://gannacademy.myschoolapp.com/ftpimages/${ftpId}/${fileName}`;
}
