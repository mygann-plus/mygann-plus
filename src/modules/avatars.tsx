/* eslint-disable max-len */
import registerModule from '~/core/module';
import { getUserId } from '~/utils/user';
import { waitForLoad, createElement } from '~/utils/dom';
import { getImgurImage, changeImage } from '~/utils/imgur';

// TODO
// Other peoples contact card
// Clear images on reset from no reload pages

const domQuery = {
  avatarContainer: (nononode: HTMLElement) => (): HTMLElement => {
    const container = document.querySelector(`
      #overview > div.student-header-body > div.pull-left.bb-avatar-wrapper.mr-10,
      .directory-results-container,
      #RosterCardContainer,
      #communitiesContainer,
      #activity-stream,
      #athleticteammaincontainer,
      #contact-col-left > div > section
    `) as HTMLElement;
    return container !== nononode && container;
  },

  image: () => document.querySelector('.bb-avatar-image') as HTMLElement, // every instance of image

  header: () => document.querySelector('.bb-avatar-image-nav') as HTMLImageElement, // sticky header
  sidebarImg: () => document.querySelector('#mobile-account-nav > span.iHolder.pull-left.ddd > img') as HTMLImageElement, // image in minimized screen menu
  profile: () => document.querySelector('#contact-col-left > div > section > div > div.bb-tile-content > div > div') as HTMLElement, // for profile buttons

  profileDirect: () => document.querySelector('#contact-card-large-img') as HTMLImageElement, // actual image element for direct source change
  bio: () => document.querySelector('#contact-col-left > div > section > div > div.bb-tile-content > div > div > div.col-md-7') as HTMLElement,
};

async function replace(container: HTMLElement): Promise<void> {
  const images: NodeListOf<HTMLImageElement> = container.querySelectorAll('.bb-avatar-image');
  for (const image of images) {
    const [studentId] = /(?<=user)\d+/.exec(image.src);
    if (!studentId) return;
    let newImage = await getImgurImage(studentId);
    image.src = newImage?.link || image.src;
    image.style.objectFit = 'cover';
  }
}

let buttons = (
  <span style={{ display: 'inline-block', marginTop: '10px' }}>
    <p id="message" style={{ marginLeft: '15px' }}></p>
    <span>
      <input id="input" type="file" accept="image/*" style={{ display: 'none' }}/>
      <button className="btn btn-default" style={{ marginLeft: '15px', padding: '0px', borderTopRightRadius: '0px', borderBottomRightRadius: '0px' }}>
        <label htmlFor="input" style={{ marginBottom: '0px', fontWeight: 'normal', padding: '6px 12px' }}>Choose Avatar</label>
      </button>
      <button className="btn btn-default" id="reset" style={{ borderTopLeftRadius: '0px', borderBottomLeftRadius: '0px' }}>Reset</button>
      <button className="btn btn-default" id="save" style={{ marginLeft: '5px' }}>Save</button>
    </span>
  </span>
);

const input = buttons.querySelector('#input') as HTMLInputElement;
const reset = buttons.querySelector('#reset') as HTMLButtonElement;
const save = buttons.querySelector('#save') as HTMLButtonElement;
const message = buttons.querySelector('#message') as HTMLButtonElement;

input.value = null;

let file = () => input.files[0];

let RESET_CLICKED = false;
let DEFAULT_IMAGE: string;

function showMessage(newMessage: string) {
  message.innerText = newMessage;
}

save.onclick = async () => {
  if (file()) {
    showMessage('Uploading...');
    await changeImage(file());
    const imgs: HTMLImageElement[] = [await waitForLoad(domQuery.header), await waitForLoad(domQuery.sidebarImg)];
    for (const img of imgs) {
      const imgurImage = await getImgurImage(await getUserId());
      img.src = imgurImage?.link || img.src;
    }
    input.value = null;
    showMessage('Image has succesfully uploaded.');
  } else if (RESET_CLICKED) {
    showMessage('Resetting...');
    await changeImage(null);
    (await waitForLoad(domQuery.header)).src = `${DEFAULT_IMAGE}?resize=75,75`;
    RESET_CLICKED = false;
    showMessage('Image has succesfully reset.');
  } else {
    showMessage('Upload an image before clicking save.');
  }
};

async function preview(image: File) {
  let reader = new FileReader();
  let changeProfile = await waitForLoad(domQuery.profileDirect);

  reader.onload = (event: ProgressEvent) => {
    changeProfile.src = (event.target as FileReader).result as string;
  };

  reader.readAsDataURL(image);
}

input.addEventListener('input', async (event: InputEvent) => {
  await preview((event.target as HTMLInputElement).files[0]);
  let inputValueArr = input.value.split('\\');
  showMessage(`Previewing ${inputValueArr[inputValueArr.length - 1]}`);
});

reset.onclick = async function () {
  RESET_CLICKED = true;
  (await waitForLoad(domQuery.profileDirect)).src = `${DEFAULT_IMAGE}?resize=200,200`;
  showMessage('Previewing your default Gann image.');
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

const options: MutationObserverInit = { subtree: true, childList: true, attributes: true };

async function avatarInit() {
  const imgs: HTMLImageElement[] = [await waitForLoad(domQuery.header), await waitForLoad(domQuery.sidebarImg)];
  [DEFAULT_IMAGE] = imgs[0].src.split('?');
  for (const img of imgs) {
    const imgurImage = await getImgurImage(await getUserId());
    img.src = imgurImage?.link || img.src;
    img.style.objectFit = 'cover';
  }
}

let container: HTMLElement;

async function avatarMain() {
  obs.disconnect();

  container = await waitForLoad(domQuery.avatarContainer(container));

  replace(container);
  obs.observe(container, options);
  if (window.location.href.endsWith(`${await getUserId()}/contactcard`)) {
    (await waitForLoad(domQuery.bio)).style.display = 'none';
    (await waitForLoad(domQuery.profile)).appendChild(buttons);
  }
}

export default registerModule('{df198a10-fcff-4e1b-8c8d-daf9630b4c99}', {
  name: 'Avatars',
  description: `Allows user to change their profile picture and view other students' changed pictures. 
  To change your picture, navigate to your profile page, click "Choose Avatar" and then click "Save."`,
  defaultEnabled: true,
  main: avatarMain,
  init: avatarInit,
});
