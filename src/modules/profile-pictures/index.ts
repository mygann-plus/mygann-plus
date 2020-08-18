/*

*/

import registerModule from '~/core/module';
import { UnloaderContext } from '~/core/module-loader';

import { getUserId } from '~/utils/user';

// Return the link for the image with the title of the given ID
function findImage(studentId: string, property: string = 'link'): Promise<string> {
  return fetch('https://api.imgur.com/3/account/mygannplus/images', {
    method: 'GET',
    headers: new Headers({ Authorization: 'Bearer .env-stuff' }),
  })
    .then(r => r.json())
    .then(images => (images.data.find(image => image.title === studentId) || false)[property]); // tries to find image and return with property, if it can't find image, it uses false since false[property] === undefined
}

async function changeImage(newImage: string | File): Promise<void> {
  // delete image in imgur named userID. use findImage property deletehash
  // put in new one
  let userId = await getUserId();

  let data = new FormData(); // Options for the upload
  data.set('type', newImage.constructor === String ? 'URL' : 'File'); // Set the upload type to correct setting
  data.set('image', newImage);
  data.set('title', userId);

  fetch(`https://api.imgur.com/3/account/mygannplus/image/${findImage(userId, 'deletehash')}`, {
    method: 'DELETE',
    headers: new Headers({ Authorization: 'Bearer .env-stuff' }),
    body: new FormData(), // Body is required and must be in this format, so it can use an empty FormData
  }); // delete current image from imgur

  fetch('https://api.imgur.com/3/image', {
    method: 'POST',
    headers: new Headers({ Authorization: 'Bearer .env-stuff' }),
    body: data,
  }); // upload to imgur
}

let obs = new MutationObserver(mutationList => {
  for (let mutation of mutationList) {
    for (let node of mutation.addedNodes) {
      if (node.nodeName === 'IMG') {
        node.src = findImage(node.src.match(/(?<=user)\d+/)) || node.src; //  sets src to imgur image if it can find it for the current students id. the regex is to extract the id from the link
      }
    }
  }
})