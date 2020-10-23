import registerModule from '~/core/module';
import { UnloaderContext } from '~/core/module-loader';

import { getUserId } from '~/utils/user';
import { waitForLoad, waitForOne } from '~/utils/dom';
import { getImgurImage, changeImage } from '~/utils/imgur'; // replace with import *

/* TODO */

// local path preview
// fancy auth woot woot woot
// change setting from local path to imgur path on settings save
// defaultValue and reset
// onChange function
// unloaderContext

interface HTMLFileInputElement extends Omit<HTMLInputElement, 'value'> { // extends everything in HTMLInputElement except value
  value: File;
}

const domQuery = {
  avatarContainers: () => [
    document.querySelector('#directory-results') as HTMLElement,
    document.querySelector('#RosterCardContainer') as HTMLElement,
    document.querySelector('#activity-stream') as HTMLElement,
    document.querySelector('#communitiesContainer') as HTMLElement,
    document.querySelector('.activitiesfeed container-fluid') as HTMLElement,
  ],

  header: () => document.querySelector('#account-nav > div > img') as HTMLImageElement,
};

const obs = new MutationObserver(async mutationList => {
  for (let mutation of mutationList) { // for each mutation
    for (let newNode of mutation.addedNodes) { // for each new node
      if (newNode instanceof HTMLElement) {
        const images: NodeListOf<HTMLImageElement> = newNode.querySelectorAll('.bb-avatar-image');
        for (const image of images) {
          const [studentId] = /(?<=user)\d+/.exec(image.src) || [null]; // find the student id from the url, otherwise null. null is in an array since studentId should be the first element of the exec array
          image.src = (await getImgurImage(studentId))?.link || image.src; // sets src to imgur image if it can find it for the current students id, otherwise leaves it alone
        }
      }
    }
  }
});

async function avatarInit() {
  const img: HTMLImageElement = await waitForLoad(domQuery.header);
  const imgurImage = await getImgurImage(await getUserId());
  img.src = imgurImage?.link || img.src;
  console.log(img.src);
}

async function avatarMain() {
  const [container]: HTMLElement[] = await waitForOne(domQuery.avatarContainers, true);
  const options: MutationObserverInit = { subtree: true, childList: true };
  obs.observe(container, options);
}

/* eslint-disable max-len */
export default registerModule('{df198a10-fcff-4e1b-8c8d-daf9630b4c99}', {
  name: 'Avatars',
  description: 'Choose a new profile picture to display to other MyGann+ users. Toggling this module will also alow you to view other users\' new pictures.',
  main: avatarMain,
  init: avatarInit,
  suboptions: {
    avatar: {
      name: 'Choose your picture',
      type: 'image',
      defaultValue: null,
      id: 'avatarImage',
      onChange: () => changeImage((document.querySelector('#avatarImage').querySelector('input') as unknown as HTMLFileInputElement).value as File), // changeImage(currentSelectedImage || null)
    },
  },
});
