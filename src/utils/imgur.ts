import { getUserId } from '~/utils/user';

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

const headers: Headers = new Headers({ Authorization: `Bearer ${process.env.ACCESS_TOKEN}` });

// eslint-disable-next-line max-len
const imgurResponse: Promise<imgurResponse> = fetch('https://api.imgur.com/3/account/mygannplus/images', {
  method: 'GET',
  headers,
}).then(res => res.json());

// return the object constaining information about an image on imgur
export const getImgurImage = async (studentId: string): Promise<imgurImage> =>
  (await imgurResponse).data.find((image: imgurImage) => image.title === studentId) || null; // eslint-disable-line implicit-arrow-linebreak

// delete the user's current custom image if it exists
export async function resetImage(): Promise<void> {
  const userId: string = await getUserId();
  const currentImage: imgurImage = await getImgurImage(userId);

  if (currentImage !== null) { // findImage returns null if the image could not be found
    fetch(`https://api.imgur.com/3/account/mygannplus/image/${currentImage.deletehash}`, {
      method: 'DELETE',
      headers,
    }); // delete current image from imgur
  }
}

// delete current custom student image and replace it with a new one
export async function changeImage(newImage: File): Promise<void> { // to change to add url option set newImage: string | File
  const userId: string = await getUserId();

  const body: FormData = new FormData(); // Options for the upload
  // body.set('type', newImage instanceof String ? 'URL' : 'File'); // Set the upload type to correct setting

  body.set('type', 'File');
  body.set('image', newImage);
  body.set('title', userId);

  resetImage();

  fetch('https://api.imgur.com/3/image', {
    method: 'POST',
    headers,
    body,
  }); // upload to imgur
}
