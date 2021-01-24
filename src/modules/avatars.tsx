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

  profileDirect: () => document.querySelector('#contact-card-large-img') as HTMLImageElement, // actual image element for direct source change
  bio: () => document.querySelector('#contact-col-left > div > section > div > div.bb-tile-content > div > div > div.col-md-7') as HTMLElement,
};

async function replace(container: HTMLElement): Promise<void> {
  const images: NodeListOf<HTMLImageElement> = container.querySelectorAll('.bb-avatar-image');
  for (const image of images) {
    if (window.location.href.endsWith(`${await getUserId()}/contactcard`) && FIRST_TIME) {
      DEFAULT_IMAGE = image.src;
      FIRST_TIME = false;
    }
    const [studentId] = /(?<=user)\d+/.exec(image.src) || [null];
    let newImage = await getImgurImage(studentId);
    image.src = newImage?.link || image.src;
  }
}

let buttons = (
  <span style={{ display: 'inline-block', marginTop: '10px' }}>
    <p id="message" style={{ marginLeft: '15px' }}>Choose a new avatar!</p>
    <input id="input" type="file" accept="image/*" style={{ display: 'none' }}/>
    <button className="btn btn-default" style={{ marginLeft: '15px', padding: '0px', borderTopRightRadius: '0px', borderBottomRightRadius: '0px' }}>
      <label htmlFor="input" style={{ marginBottom: '0px', fontWeight: 'normal', padding: '6px 12px' }}>Choose Avatar</label>
    </button>
    <button className="btn btn-default" id="reset" style={{ borderTopLeftRadius: '0px', borderBottomLeftRadius: '0px' }}>Reset</button>
    <button className="btn btn-default" id="save" style={{ marginLeft: '5px' }}>Save</button>
  </span>
);

const input = buttons.querySelector('#input') as HTMLInputElement;
const reset = buttons.querySelector('#reset') as HTMLButtonElement;
const save = buttons.querySelector('#save') as HTMLButtonElement;
const message = buttons.querySelector('#message') as HTMLButtonElement;

input.value = null;

let file = () => input.files[0];

let RESET_CLICKED = false;
let DEFAULT_IMAGE: string = null;
let FIRST_TIME = true;

save.onclick = async () => {
  if (file()) {
    message.innerText = 'Uploading...';
    await changeImage(file());
    input.value = null;
    message.innerText = 'Image has succesfully uploaded.';
  } else if (RESET_CLICKED) {
    message.innerText = 'Resetting...';
    await changeImage(null);
    (await waitForLoad(domQuery.header)).src = DEFAULT_IMAGE;
    RESET_CLICKED = true;
    message.innerText = 'Image has succesfully reset.';
  }
};

input.addEventListener('input', async (event) => {
  await preview(event);
  let inputValueArr = input.value.split('\\');
  message.innerHTML = `Previewing ${inputValueArr[inputValueArr.length - 1]}`;
});

async function preview(event) {
  let selectedFile = event.target.files[0];
  let reader = new FileReader();
  let changeHeader = await waitForLoad(domQuery.header);
  let changeProfile = await waitForLoad(domQuery.profileDirect);

  reader.onload = function (event) {
    changeHeader.src = event.target.result;
    changeProfile.src = event.target.result;
  };

  reader.readAsDataURL(selectedFile);
}

reset.onclick = async function () {
  RESET_CLICKED = true;
  (await waitForLoad(domQuery.profileDirect)).src = DEFAULT_IMAGE;
  (await waitForLoad(domQuery.header)).src = DEFAULT_IMAGE;
  message.innerHTML = 'Previewing your default Gann image.';
};

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
