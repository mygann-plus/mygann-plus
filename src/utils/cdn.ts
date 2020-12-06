// import { getUserProfile } from './user';

/* eslint-disable import/prefer-default-export */

const ftpId = (async () => {
  const response = await fetch('https://gannacademy.myschoolapp.com/api/webapp/schoolcontext');
  const context = await response.json();
  return context.SchoolInfo.SchoolId;
})();

export async function getCDNImageUrl(fileName: string) {
  return `https://gannacademy.myschoolapp.com/ftpimages/${await ftpId}/${fileName}`;
}
