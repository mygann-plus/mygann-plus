import { loadModule } from '~/core/module-loader';
import { getUserId } from '~/utils/user';
import { fetchRawData } from '~/utils/fetch'

interface imgurResponse {
  data: imgurImage[]
}

interface imgurImage {
  id: string,
  title: string,
  description: string,
  datetime: string,
  type: string,
  animated: boolean,
  width: number,
  height: number,
  size: number,
  views: number,
  bandwidth: number,
  deletehash?: string,
  name?: string,
  section: string,
  link: string,
  gifv?: string,
  mp4?: string,
  mp4_size?: number,
  looping?: boolean,
  favorite: boolean,
  nsfw: boolean,
  vote: string,
  in_gallery: boolean,
}
//http://mygannplus-data.surge.sh

// http://mygannplus-data.surge.sh/imgur-authorization/authorization.json
const headers: any = (async () => {
  const data = await fetchRawData('/imgur-authorization/authorization.json'); // eslint-disable-line max-len
  // const data = await response.json();
  // console.log(data.code);
  // return data.code;
  const token = data.code;
  return new Headers({ Authorization: `Bearer ${token}` });
})();
// console.log(token);

// const headers: Headers = new Headers({ Authorization: `Bearer ${token}` });

async function getImgurRresponse(): Promise<imgurResponse> {
  const res = await fetch('https://api.imgur.com/3/account/mygannplus/images', {
    method: 'GET',
    headers,
  });
  return await res.json();
}

// eslint-disable-next-line max-len
const imgurResponse: Promise<imgurResponse> = getImgurRresponse();
// return the object constaining information about an image on imgur
export const getImgurImage = async (studentId: string, reset: boolean=false): Promise<imgurImage> =>
  (await (reset ? getImgurRresponse() : imgurResponse)).data.find((image: imgurImage) => image.title === studentId) || null; // eslint-disable-line implicit-arrow-linebreak

// delete the user's current custom image if it exists
async function resetImage(): Promise<void> {
  const userId: string = await getUserId();
  const currentImage: imgurImage = await getImgurImage(userId, true);

  if (currentImage !== null) { // findImage returns null if the image could not be found
    fetch(`https://api.imgur.com/3/account/mygannplus/image/${currentImage.deletehash}`, {
      method: 'DELETE',
      headers,
    }); // delete current image from imgur
  }
}

// delete current custom student image and replace it with a new one
export async function changeImage(newImage: File): Promise<void> { // to change to add url option set newImage: string | File

  resetImage(); // delete the current custom image if it exists
  if (newImage === null) { console.log('well shit'); return; } // can happen if the user resets the setting to the default value (null) then saves

  const userId: string = await getUserId();
  const body: FormData = new FormData(); // Options for the upload

  // body.set('type', newImage instanceof File ? 'File' : 'URL'); // Set the upload type to correct setting
  body.set('type', 'File');
  body.set('image', newImage);
  body.set('title', userId);

  console.log('I got this far');

  fetch('https://api.imgur.com/3/image', {
    method: 'POST',
    headers,
    body,
  }); // upload to imgur
}
