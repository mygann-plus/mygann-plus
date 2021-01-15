/* eslint-disable max-len */
import registerModule from '~/core/module';
import { getUserId } from '~/utils/user';
import { waitForLoad, waitForOne, createElement } from '~/utils/dom';
import { getImgurImage, changeImage } from '~/utils/imgur';

const domQuery = {
  avatarContainers: () => [
    document.querySelector('.directory-results-container') as HTMLElement, // directory
    document.querySelector('#RosterCardContainer') as HTMLElement, // class rosters
    document.querySelector('#communitiesContainer') as HTMLElement, // community container
    document.querySelector('#activity-stream') as HTMLElement, // news
    document.querySelector('#athleticteammaincontainer') as HTMLElement, // athletics roster
    document.querySelector('#contact-col-left > div > section') as HTMLElement, // profile image
  ],

  header: () => document.querySelector('.bb-avatar-image-nav') as HTMLImageElement, // sticky header
  sidebarImg: () => document.querySelector('#mobile-account-nav > span.iHolder.pull-left.ddd > img') as HTMLImageElement, // image in minimized screen menu
  profile: () => document.querySelector('#contact-col-left > div > section > div > div.bb-tile-content > div > div') as HTMLElement, // for profile buttons
};

let buttons = (
  <span style={{ display: 'inline-block', marginTop: '10px' }}>
    <input id="input" type="file" accept="image/*" style={{ display: 'none' }}/>
    <button className="btn btn-default btn-primary" style={{ marginLeft: '15px' }}>
      <label htmlFor="input" style={{ marginBottom: '0px', fontWeight: 'normal' }}>Choose Avatar</label>
    </button>
    <button className="btn btn-default" id="reset" style={{ marginLeft: '5px' }}>Reset</button>
    <button className="btn btn-default" id="reload" style={{ marginLeft: '5px', visibility: 'hidden' }}>Save</button>
  </span>
);

const actualInput = buttons.querySelector('#input') as HTMLInputElement;
let file = () => actualInput.files[0];
const reset = buttons.querySelector('#reset') as HTMLButtonElement;
const reload = buttons.querySelector('#reload') as HTMLButtonElement;

actualInput.addEventListener('input', () => {
  changeImage(file());
  reload.style.visibility = 'visible';
});

reset.onclick = async function () {
  await changeImage(null);
  reload.style.visibility = 'visible';
};

reload.onclick = async function () {
  window.location.reload();
};

async function replace(container: HTMLElement): Promise<void> {
  const images: NodeListOf<HTMLImageElement> = container.querySelectorAll('.bb-avatar-image');
  for (const image of images) {
    const [studentId] = /(?<=user)\d+/.exec(image.src) || [null];
    let newImage = await getImgurImage(studentId);
    image.src = newImage?.link || image.src;
  }
}

const obs = new MutationObserver(async mutationList => {
  for (let mutation of mutationList) {
    for (let newNode of mutation.addedNodes) {
      if (newNode instanceof HTMLElement) {
        replace(newNode);
      }
    }
  }
});

async function avatarInit() {
  const imgs: HTMLImageElement[] = [await waitForLoad(domQuery.header), await waitForLoad(domQuery.sidebarImg)];
  for (const img of imgs) {
    const imgurImage = await getImgurImage(await getUserId());
    img.src = imgurImage?.link || img.src;
    const obs = new MutationObserver(() => img.src = imgurImage?.link || img.src);
    obs.observe(img, { attributes: true });
  }
}

async function avatarMain() {
  const [container]: HTMLElement[] = await waitForOne(domQuery.avatarContainers, true);
  replace(container);
  const options: MutationObserverInit = { subtree: true, childList: true };
  obs.observe(container, options);
  if (window.location.href.endsWith(`${await getUserId()}/contactcard`)) {
    (await waitForLoad(domQuery.profile)).appendChild(buttons);
  }
}

export default registerModule('{df198a10-fcff-4e1b-8c8d-daf9630b4c99}', {
  name: 'Avatars',
  description: `Allows user to change their profile picture and view other students' changed pictures. 
  To change your picture, navigate to your profile page, click "Change Avatar" and then click "Save."`,
  defaultEnabled: true,
  main: avatarMain,
  init: avatarInit,
});
