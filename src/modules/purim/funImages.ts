import { waitForLoad } from '~/utils/dom';

const domQuery = () => document.querySelector('.bb-avatar-image-nav') as HTMLImageElement;

function replace(container: HTMLElement, imageURL: string) {
  const images = container.querySelectorAll<HTMLImageElement>('img[class^="bb-avatar-image"]:not(#mygannplusicon)');
  for (const image of images) {
    image.src = imageURL;
  }
}
function randomImage() {
  let x = Math.random() * 7;

  if (x <= 1) {
    return 'https://cdn.discordapp.com/attachments/939668210435887164/1082171985196490752/istockphoto-1282932721-612x612.jpg';
  } else if (x <= 2) {
    return 'https://cdn.discordapp.com/attachments/939668210435887164/1082172034391474226/279982.png';
  } else if (x <= 3) {
    return 'https://cdn.discordapp.com/attachments/939668210435887164/1082172070181474344/3347544.png';
  } else if (x <= 4) {
    return 'https://cdn.discordapp.com/attachments/939668210435887164/1082172134568239104/4062979.png';
  } else if (x <= 5) {
    return 'https://cdn.discordapp.com/attachments/939668210435887164/1082173128790245416/image.png';
  } else if (x <= 6) {
    return 'https://cdn.discordapp.com/attachments/939668210435887164/1082173904434499646/purim-holiday-hamantash-with-strawberry-jam-flat-vector-22788130.jpg';
  } else { return 'https://cdn.discordapp.com/attachments/939668210435887164/1082175165464596592/hamantaschen-vector-1345449.jpg'; }
}
export default async function setAllImages(imageURL: string) {
  const obs = new MutationObserver(async mutationList => {
    for (let mutation of mutationList) {
      for (let newNode of mutation.addedNodes) {
        if (newNode instanceof HTMLElement) {

          replace(newNode, randomImage());
        }
      }
    }
  });
  replace(document.body, imageURL);
  obs.observe(document.body, { childList: true, subtree: true });

  const header = await waitForLoad(domQuery);
  header.src = imageURL;
  const srcWatcher = new MutationObserver(() => {
    if (header.src !== imageURL) {
      header.src = imageURL;
    }
  });
  srcWatcher.observe(header, { attributes: true, attributeFilter: ['src'] });
}
