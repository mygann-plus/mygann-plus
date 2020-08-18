import registerModule from '~/core/module';
import { UnloaderContext } from '~/core/module-loader';

import { getUserId } from '~/utils/user';

const headers = new Headers({ Authorization: 'Bearer .env-stuff' });

// Return the link for the image with the title of the given ID
function findImage(studentId: string, property: string = 'link'): Promise<string> {
  if (studentId === null) return; // may happen if no id is found in the picture with the change attempt

  return fetch('https://api.imgur.com/3/account/mygannplus/images', {
    method: 'GET',
    headers,
  })
    .then(r => r.json())
    .then(images => (images.data.find((image: any) => image.title === studentId) || {})[property]); // tries to find image and return with property, if it can't find image, it returns undefined ({}.property === undefined)
}

// delete current custom student image and replace it with a new one
async function changeImage(newImage: string | File): Promise<void> {
  const userId = await getUserId();

  let data = new FormData(); // Options for the upload
  data.set('type', newImage.constructor === String ? 'URL' : 'File'); // Set the upload type to correct setting
  data.set('image', newImage);
  data.set('title', userId);

  const currentImage = findImage(userId, 'deletehash'); // delete current custom image if it exists
  if (currentImage) {
    fetch(`https://api.imgur.com/3/account/mygannplus/image/${currentImage}`, {
      method: 'DELETE',
      headers,
      body: new FormData(), // Body is required and must be in this format, so it can use an empty FormData
    }); // delete current image from imgur
  }

  fetch('https://api.imgur.com/3/image', {
    method: 'POST',
    headers,
    body: data,
  }); // upload to imgur
}

let obs = new MutationObserver(async mutationList => {
  for (let mutation of mutationList) {
    for (let node of mutation.addedNodes) {
      if (node instanceof HTMLImageElement) {
        // node.src.match(/(?<=user)\d+/) // node.src.match(/\d{4,}/)[0]
        let [studentId] = /\d{4,}/.exec(node.src) || [null]; // find the first string of 4+ digits, otherwise null. null is in an array since studentId should be the first element of the exec array
        node.src = await findImage(studentId) || node.src; // sets src to imgur image if it can find it for the current students id, otherwise leaves it alone
      }
    }
  }
});
