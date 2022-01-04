/* eslint-disable max-len */
import registerModule from '~/core/module';
import { getUserId } from '~/utils/user';
import { waitForLoad, createElement, insertCss } from '~/utils/dom';
import { getImgurImage, changeImage } from '~/utils/imgur';
import style from './style.css';
import { appendUserMenuLink } from '~/shared/user-menu';
import { UnloaderContext } from '~/core/module-loader';

const selectors = {
  buttonsContainer: style.locals['buttons-container'],
  exampleImage: style.locals.exampleImage,
  message: style.locals.message,
  uploadBtn: style.locals['upload-btn'],
};

const domQuery = {
  header: () => document.querySelector('.bb-avatar-image-nav') as HTMLImageElement, // sticky header
  sidebarImg: () => document.querySelector('#mobile-account-nav > span.iHolder.pull-left.ddd > img') as HTMLImageElement, // image in minimized screen menu
  profile: () => document.querySelector('#contact-col-left > div > section > div > div.bb-tile-content > div > div') as HTMLElement, // for profile buttons
  profileDirect: () => document.querySelector('#contact-card-large-img') as HTMLImageElement, // actual image element for direct source change
  bio: () => document.querySelector('#contact-col-left > div > section > div > div.bb-tile-content > div > div > div.col-md-7') as HTMLElement, // profile bio
  about: () => document.querySelector('#contact-col-left > div > section > div > div:nth-child(1) > h2') as HTMLElement, // about header in profile
};

async function replace(container: HTMLElement): Promise<void> {
  // const images: NodeListOf<HTMLImageElement> = container.querySelectorAll('.bb-avatar-image');
  const images = container.querySelectorAll<HTMLImageElement>('[class^="bb-avatar-image"]');
  // const images = container instanceof HTMLImageElement ? [container] : container.querySelectorAll<HTMLImageElement>('[class^="bb-avatar-image"]');
  // const images = container.querySelectorAll<HTMLImageElement>('.bb-avatar-image, .bb-avatar-image-medium');
  for (const image of images) {
    const studentId = /(?<=user)\d+/.exec(image.src);
    if (!studentId) continue; // already replaced the image
    let newImage = await getImgurImage(studentId[0]);
    image.src = newImage?.link || image.src;
  }
}

let exampleImages = [
  'https://i1.wp.com/bestlifeonline.com/wp-content/uploads/2019/07/what-is-quokka.jpg?fit=1200%2C800&ssl=1',
  'https://upload.wikimedia.org/wikipedia/commons/7/7d/Wildlife_at_Maasai_Mara_%28Lion%29.jpg',
  'https://images.ctfassets.net/cnu0m8re1exe/w4TS6ONjG71UXC3pkZDLc/5f162a88da4bebf9a9d29a867205b795/Zebra.jpg?w=650&h=433&fit=fill',
  'https://c.files.bbci.co.uk/6BC0/production/_112548572_gettyimages-492611032-1.jpg',
  'https://media4.s-nbcnews.com/j/newscms/2016_36/1685951/ss-160826-twip-05_8cf6d4cb83758449fd400c7c3d71aa1f.fit-760w.jpg',
  'https://www.pbs.org/wnet/nature/files/2020/06/photo-of-hawksbill-sea-turtle-1618606-scaled.jpg',

  'https://i2.wp.com/css-tricks.com/wp-content/uploads/2020/03/chevron-pattern.png?fit=2400%2C1200&ssl=1',
  'https://images.template.net/wp-content/uploads/2016/06/28100451/Black-and-White-Patterns.jpg',
  'https://st.depositphotos.com/1451970/2314/v/600/depositphotos_23149542-stock-illustration-geometric-seamless-pattern.jpg',
  'https://images.unsplash.com/photo-1579546929662-711aa81148cf?ixlib=rb-1.2.1&ixid=MXwxMjA3fDB8MHxleHBsb3JlLWZlZWR8MXx8fGVufDB8fHw%3D&w=1000&q=80',
  'https://image.freepik.com/free-psd/abstract-background-design_1297-78.jpg',
  'https://cdn.shopify.com/s/files/1/1916/6049/products/colorful_geo1_large.jpg?v=1543181150',

  'https://i.pinimg.com/originals/d6/2a/fc/d62afc028ef952f5b4c60f1b7d904963.gif',
  'https://buffer.com/library/content/images/library/wp-content/uploads/2016/06/giphy.gif',
  'https://cdn.dribbble.com/users/1770290/screenshots/6183149/bg_79.gif',
  'https://dod6qkb6gz8ef.cloudfront.net/app/uploads/2020/09/08145740/Domcake-Dancing-Alien.gif',
  'https://i.imgur.com/XFCfLnt.gif',
  'https://i.pinimg.com/originals/de/62/d3/de62d38abae31e2430263462427ecbe7.gif',
];

let RESET_CLICKED = false;
let DEFAULT_IMAGE: string;
let SELECTED_IMAGE: string | File = null;

async function preview(image: File | string) {
  let changeProfile = await waitForLoad(domQuery.profileDirect);

  if (typeof image === 'string') {
    changeProfile.src = image;
  } else {

    let reader = new FileReader();

    reader.onload = (event: ProgressEvent) => {
      changeProfile.src = (event.target as FileReader).result as string;
    };

    reader.readAsDataURL(image);
  }
}

function selectImage(image: File | string) {
  SELECTED_IMAGE = image;
  preview(SELECTED_IMAGE);
}

/* eslint-disable @typescript-eslint/no-use-before-define */
let buttons = (
  <span id={selectors.buttonsContainer}>
    <p id={selectors.message}></p>
    <span>
      <button className="btn btn-primary" id={selectors.uploadBtn} style={{ marginLeft: '15px', padding: '0px' }}>
        <label>
          <input type="file" accept="image/*" onInput={({ target }) => {
            selectImage((target as HTMLInputElement).files[0]);
            let inputValueArr = (target as HTMLInputElement).value.split('\\');
            showMessage(`Previewing ${inputValueArr[inputValueArr.length - 1]}`);
          }} />
          Custom Avatar
        </label>
      </button>
      <button className="btn btn-default" onClick={async () => {
        RESET_CLICKED = true;
        SELECTED_IMAGE = null;
        buttons.querySelector('input').value = null;
        (await waitForLoad(domQuery.profileDirect)).src = `${DEFAULT_IMAGE}?resize=200,200`;
        showMessage('Previewing your default Gann image.');
      }}>Reset</button>
      <button className="btn btn-default" onClick={async () => {
        if (SELECTED_IMAGE) {
          showMessage('Uploading...');
          await changeImage(SELECTED_IMAGE);
          SELECTED_IMAGE = null;
          buttons.querySelector('input').value = null;
          showMessage('Image has succesfully uploaded.');
        } else if (RESET_CLICKED) {
          showMessage('Resetting...');
          await changeImage(null);
          RESET_CLICKED = false;
          showMessage('Image has succesfully reset.');
        } else {
          showMessage('Upload an image before clicking save.');
          return;
        }
        const imgs: HTMLImageElement[] = [await waitForLoad(domQuery.header), await waitForLoad(domQuery.sidebarImg)];
        for (const img of imgs) {
          const imgurImage = await getImgurImage(await getUserId());
          img.src = imgurImage?.link ?? `${DEFAULT_IMAGE}?resize=75,75`;
        }
      }}>Save</button>
    </span>
    <br></br>
    <div>
      {exampleImages.map(image => <img
        src={image}
        className={selectors.exampleImage}
        onClick={evt => { selectImage(evt.currentTarget.src); showMessage('Previewing image.'); }}
      />)}
    </div>
  </span>
);
/* eslint-enable @typescript-eslint/no-use-before-define */

const message = buttons.querySelector(`#${selectors.message}`) as HTMLButtonElement;

function showMessage(newMessage: string) {
  message.innerText = newMessage;
}

async function avatarInit() {
  const userId = await getUserId();
  appendUserMenuLink('Change Profile Image', `#profile/${userId}/contactcard`, true);
  insertCss(style.toString());

  const imgs: HTMLImageElement[] = [await waitForLoad(domQuery.header), await waitForLoad(domQuery.sidebarImg)];
  [DEFAULT_IMAGE] = imgs[0].src.split('?');
  for (const img of imgs) {
    const imgurImage = await getImgurImage(userId);
    img.src = imgurImage?.link || img.src;
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
  replace(document.body);
  obs.observe(document.body, { childList: true, subtree: true });
}

async function avatarMain() {
  if (window.location.href.endsWith(`${await getUserId()}/contactcard`)) {
    (await waitForLoad(domQuery.bio)).remove();
    (await waitForLoad(domQuery.about)).innerText = 'MyGann+ Avatars';
    SELECTED_IMAGE = null;
    message.innerText = '';
    (await waitForLoad(domQuery.profile)).appendChild(buttons);
  }
}

export default registerModule('{df198a10-fcff-4e1b-8c8d-daf9630b4c99}', {
  name: 'Avatars',
  description: 'Allows user to change their profile picture and view other students\' new pictures. To change your picture, navigate to your profile page.',
  defaultEnabled: true,
  main: avatarMain,
  init: avatarInit,
});
