import { getUserId } from '~/utils/user';
import { fetchRawData } from '~/utils/fetch';

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

const headers: Promise<Headers> = (async () => {
  const data = await fetchRawData('/imgur-authorization/authorization.json'); // eslint-disable-line max-len
  return new Headers({ Authorization: `Bearer ${data.code}` });
})();

async function getImgurResponse(): Promise<imgurResponse> {
  const res = await fetch('https://api.imgur.com/3/account/mygannplus/images', {
    method: 'GET',
    headers: await headers,
  });
  return res.json();
}

let imgurResponse: Promise<imgurResponse> = getImgurResponse();

// Return the object containing information about an image on imgur
export const getImgurImage = async (studentId: string, reset: boolean = false): Promise<imgurImage> => {
  return (await imgurResponse).data.find((image: imgurImage) => image.title === studentId);
};

// Delete the user's current custom image if it exists
export async function resetImage(): Promise<void> {
  const userId: string = await getUserId();
  const currentImage: imgurImage = await getImgurImage(userId, true);

  if (currentImage) { // findImage returns null if the image could not be found
    fetch(`https://api.imgur.com/3/account/mygannplus/image/${currentImage.deletehash}`, {
      method: 'DELETE',
      headers: await headers,
    }); // Delete current image from imgur
  }
}

// Delete current custom student image and replace it with a new one
export async function changeImage(newImage: File): Promise<void> { // To change to add url option set newImage: string | File
  imgurResponse = getImgurResponse();
  resetImage(); // Delete the current custom image if it exists

  const userId: string = await getUserId();
  const body: FormData = new FormData(); // Options for the upload

  body.set('type', 'File');
  body.set('image', newImage);
  body.set('title', userId);

  fetch('https://api.imgur.com/3/image', {
    method: 'POST',
    headers: await headers,
    body,
  }); // Upload to imgur
}
