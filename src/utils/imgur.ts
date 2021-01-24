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
  const data = await fetchRawData('/imgur-authorization/authorization.json');
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

export const getImgurImage = async (studentId: string): Promise<imgurImage> => {
  return (await imgurResponse).data.find((image: imgurImage) => image.title === studentId);
};

async function resetImage(): Promise<void> {
  const userId: string = await getUserId();
  const currentImage: imgurImage = await getImgurImage(userId);

  if (currentImage) {
    fetch(`https://api.imgur.com/3/account/mygannplus/image/${currentImage.deletehash}`, {
      method: 'DELETE',
      headers: await headers,
    });
  }
}

export async function changeImage(newImage: File): Promise<void> {
  resetImage();

  if (newImage === null) return;

  const userId: string = await getUserId();
  const body: FormData = new FormData();

  body.set('type', 'File');
  body.set('image', newImage);
  body.set('title', userId);

  const response = await fetch('https://api.imgur.com/3/image', {
    method: 'POST',
    headers: await headers,
    body,
  });

  //imgurResponse = getImgurResponse();
}
