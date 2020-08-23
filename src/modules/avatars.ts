import registerModule from '~/core/module';
import { UnloaderContext } from '~/core/module-loader';

import { getUserId } from '~/utils/user';
import { waitForLoad, waitForOne } from '~/utils/dom';

const domQuery = {
  avatarContainers: () => [
    document.querySelector('#directory-results') as HTMLElement,
    document.querySelector('#RosterCardContainer') as HTMLElement,
    document.querySelector('#activity-stream') as HTMLElement,
  ],
  header: () => document.querySelector('#account-nav > div > img') as HTMLImageElement,
};
// activitiesfeed container-fluid

const headers: Headers = new Headers({ Authorization: `Bearer ${process.env.ACCESS_TOKEN}` });

// function handleError(error: Error) {

// }

// Return the link for the image with the title of the given ID
async function findImage(studentId: string): Promise<any> {
  if (studentId === null) return {}; // may happen if no id is found in the picture with the change attempt

  const response = await fetch('https://api.imgur.com/3/account/mygannplus/images', {
    method: 'GET',
    headers,
  });

  if (response.ok) {
    const images = await response.json();
    return (images.data.find((image: any) => image.title === studentId) || {}); // tries to find image and return with property, if it can't find image, it returns undefined ({}.property === undefined)
  }
  // handle error
}

// delete current custom image if it exists
async function resetImage(): Promise<void> {
  const userId: string = await getUserId();
  const currentImage = await findImage(userId);

  if (currentImage === undefined) {
    // error finding it
  }

  if (currentImage !== {}) { // findImage returns an empty object if the image could not be found
    fetch(`https://api.imgur.com/3/account/mygannplus/image/${currentImage.deletehash}`, {
      method: 'DELETE',
      headers,
    }); // delete current image from imgur
  }
}

// delete current custom student image and replace it with a new one
async function changeImage(newImage: File): Promise<void> { // to change to add url option set newImage: string | File
  const userId: string = await getUserId();

  let body: FormData = new FormData(); // Options for the upload
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

const obs = new MutationObserver(async mutationList => {
  for (let mutation of mutationList) {
    for (let node of mutation.addedNodes) {
      if (node instanceof HTMLImageElement) {
        // node.src.match(/(?<=user)\d+/) // node.src.match(/\d{4,}/)[0]
        let [studentId] = /\d{4,}/.exec(node.src) || [null]; // find the first string of 4+ digits, otherwise null. null is in an array since studentId should be the first element of the exec array
        node.src = (await findImage(studentId)).link || node.src; // sets src to imgur image if it can find it for the current students id, otherwise leaves it alone
      }
    }
  }
});

async function avatarInit() {
  const img: HTMLImageElement = await waitForLoad(domQuery.header);
  img.src = await findImage(await getUserId());
}

// obs.observe() whatever it needs to depeding on the page
async function avatarMain() {
  const [container]: HTMLElement[] = await waitForOne(domQuery.avatarContainers);
  const options: MutationObserverInit = { subtree: true, childList: true };
  obs.observe(container, options);
}

export default registerModule('{df198a10-fcff-4e1b-8c8d-daf9630b4c99}', {
  name: 'Avatar',
  description: 'Choose a new profile picture to display to other MyGann+ users. Toggling this module will also alow you to view other users\' new pictures.', // eslint-disable-line max-len
  main: avatarMain,
  suboptions: {
    avatar: {
      name: 'Choose your picture',
      type: 'file',
      defaultValue: null,
    },
  },
});
