/* eslint-disable max-len */
import registerModule from '~/core/module';
import { getUserId } from '~/utils/user';
import { waitForLoad, createElement, insertCss } from '~/utils/dom';
import { getImgurImage, changeImage } from '~/utils/imgur';
import { Children } from 'react';

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

  about: () => document.querySelector('#contact-col-left > div > section > div > div:nth-child(1) > h2') as HTMLElement, // about header in profile
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

let imageCss = `
.exampleImage {
  display: inline;
  width: 52px ;
  height: 52px;
  object-fit: cover;
  border-radius: 50%;
  padding: 5px; 
}

.exampleImage:hover {
  border: 1px solid #ccc;
  cursor: pointer;
}
`;

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
  'https://images.unsplash.com/photo-1495578942200-c5f5d2137def?ixlib=rb-1.2.1&ixid=MXwxMjA3fDB8MHxleHBsb3JlLWZlZWR8MXx8fGVufDB8fHw%3D&w=1000&q=80',
  'https://cdn.shopify.com/s/files/1/1916/6049/products/colorful_geo1_large.jpg?v=1543181150',

  'https://i1.adis.ws/i/canon/canon-pro-ambassador-exchange-landscapes-1-1140?w=1140&qlt=70&fmt=jpg&fmt.options=interlaced&bg=rgb(255,255,255)',
  'https://eco-business.imgix.net/uploads/ebmedia/fileuploads/shutterstock_158925020.jpg?fit=crop&h=960&ixlib=django-1.2.0&w=1440',
  'https://i0.wp.com/environment.umn.edu/wp-content/uploads/2016/04/global_landscapes_initiative_directory_pages.jpg?fit=847%2C328',
  'https://images.ctfassets.net/u0haasspfa6q/2sMNoIuT9uGQjKd7UQ2SMQ/1bb98e383745b240920678ea2daa32e5/sell_landscape_photography_online',
  'https://renzlandscapes.com/wp-content/uploads/2016/02/1a-1024x768.jpg',
  'https://media-exp1.licdn.com/dms/image/C511BAQHKVJfYvoDBHQ/company-background_10000/0/1519809258043?e=2159024400&v=beta&t=YKoskyj_LQ8xRFU5PoPUU2-UritcDq8h_aHlg0jtd90',
];

let buttons = (
  <span style={{ display: 'inline-block', marginTop: '10px' }}>
    <p id="message" style={{ marginLeft: '15px' }}></p>
    <span>
      <input id="input" type="file" accept="image/*" style={{ display: 'none' }}/>
      <button className="btn btn-primary" style={{ marginLeft: '15px', padding: '0px' }}>
        <label htmlFor="input" style={{ marginBottom: '0px', fontWeight: 'normal', padding: '6px 12px', cursor: 'pointer' }}>Upload Avatar</label>
      </button>
      <button className="btn btn-default" id="reset" style={{ marginLeft: '5px' }}>Reset</button>
      <button className="btn btn-default" id="save" style={{ marginLeft: '5px' }}>Save</button>
    </span>
    <br></br>
    <div id="exampleImagesContainer" style={{ marginTop: '15px', marginLeft: '15px' }}></div>
  </span>
);

const input = buttons.querySelector('#input') as HTMLInputElement;
const reset = buttons.querySelector('#reset') as HTMLButtonElement;
const save = buttons.querySelector('#save') as HTMLButtonElement;
const message = buttons.querySelector('#message') as HTMLButtonElement;
const exampleImagesContainer = buttons.querySelector('#exampleImagesContainer') as HTMLButtonElement;

for (let exampleSource of exampleImages) {
  let image = new Image();
  image.src = exampleSource;
  image.className = 'exampleImage';
  exampleImagesContainer.append(image);
}

input.value = null;

let file = () => input.files[0];

let RESET_CLICKED = false;
let DEFAULT_IMAGE: string;
let SELECTED_IMAGE = null;

function showMessage(newMessage: string) {
  message.innerText = newMessage;
}

document.addEventListener('mousedown', () => {
  for (let i = 0, len = exampleImagesContainer.children.length; i < len; i++) {
    (function (index) {
      ((exampleImagesContainer.children[i] as HTMLElement).onclick) = async () => {
        showMessage('Previewing image.');
        fetch(exampleImages[index])
          .then(response => {
            return response.blob();
          }).then(blob => {
            preview(blob);
            SELECTED_IMAGE = blob;
          });
      };
    }(i));
  }
});

save.onclick = async () => {
  if (file() || SELECTED_IMAGE) {
    showMessage('Uploading...');
    await changeImage(SELECTED_IMAGE || file());
    const imgs: HTMLImageElement[] = [await waitForLoad(domQuery.header), await waitForLoad(domQuery.sidebarImg)];
    for (const img of imgs) {
      const imgurImage = await getImgurImage(await getUserId());
      img.src = imgurImage?.link || img.src;
    }
    SELECTED_IMAGE = null;
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
  SELECTED_IMAGE = null;
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
    insertCss(imageCss);
    (await waitForLoad(domQuery.bio)).style.display = 'none';
    (await waitForLoad(domQuery.about)).innerText = 'MyGann+ Avatars';
    (await waitForLoad(domQuery.profile)).appendChild(buttons);
  }
}

export default registerModule('{df198a10-fcff-4e1b-8c8d-daf9630b4c99}', {
  name: 'Avatars',
  description: `Allows user to change their profile picture and view other students' changed pictures. 
  To change your picture, navigate to your profile page, click "Upload Avatar" and then click "Save."`,
  defaultEnabled: true,
  main: avatarMain,
  init: avatarInit,
});
