import registerModule from '~/core/module';
import { insertCss, waitForLoad } from '~/utils/dom';

import style from './style.css';
import setAllImages from './funImages';
import isPurim from './checkPurim';
//
// function isPurim() {
//   const date = new Date();
//   return (date.getDate() === 6 || date.getDate() === 7) && date.getMonth() === 2;
// }

// const ELI_BENNET = 'https://bbk12e1-cdn.myschoolcdn.com/ftpimages/591/user/large_user4321840_2403859_930.JPG?resize=200,200';
const ELI_BENNET = 'https://i.imgur.com/PzHUOGT.jpeg';

function waitForElm(selector: string) {
  return new Promise(resolve => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver(() => {
      if (document.querySelector(selector)) {
        resolve(document.querySelector(selector));
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}

function replaceText() {
  let url = 'https://see.fontimg.com/api/renderfont4/oODV/eyJyIjoiZnMiLCJoIjoxMzgsInciOjE1MDAsImZzIjo5MiwiZmdjIjoiI0ZGRkZGRiIsImJnYyI6IiMwMDAwMDAiLCJ0IjoxfQ/R0FOTiBBQ0FERU1Z/kanisah.png';
  waitForElm('#site-logo > a > img').then(() => {
    // @ts-ignore
    document.querySelector('#site-logo > a > img').src = url;
    document.querySelector('body').style.backgroundImage = "url('https://media.istockphoto.com/id/1373141996/vector/hamantash-purim-pattern.jpg?s=612x612&w=0&k=20&c=Dgw5apYCbYufOFnuK3IxSiegpSnatzQCysB1BzD0D7s=')";
    document.querySelector('body').style.cursor = 'url("https://lh3.googleusercontent.com/5euME0_VdxZQm5BzNx8S7WBsnmKXCKMIxJcosnsB9rMqNkbbB7Ods-XFEkCqofkw25xIu9MqMbJdUP671X8T5mfGlSIEcq9T3iNVYFjmuiYcZgVxIEqvvBLPZ6cXkwsQb-d71sXXDQ=s32-p-k"), default';

  });
}
const domQuery = () => document.querySelector('*') as HTMLElement;

function replace(container: HTMLElement) {
  const images = container.querySelectorAll<HTMLElement>('*');
  for (const image of images) {
    image.style.cursor = 'url("https://lh3.googleusercontent.com/5euME0_VdxZQm5BzNx8S7WBsnmKXCKMIxJcosnsB9rMqNkbbB7Ods-XFEkCqofkw25xIu9MqMbJdUP671X8T5mfGlSIEcq9T3iNVYFjmuiYcZgVxIEqvvBLPZ6cXkwsQb-d71sXXDQ=s32-p-k"), auto';
  }
}
async function setCursor() {
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

  const header = await waitForLoad(domQuery);
  header.style.cursor = 'url("https://lh3.googleusercontent.com/5euME0_VdxZQm5BzNx8S7WBsnmKXCKMIxJcosnsB9rMqNkbbB7Ods-XFEkCqofkw25xIu9MqMbJdUP671X8T5mfGlSIEcq9T3iNVYFjmuiYcZgVxIEqvvBLPZ6cXkwsQb-d71sXXDQ=s32-p-k"), auto';
  const srcWatcher = new MutationObserver(() => {
    if (header.style.cursor !== 'url("https://lh3.googleusercontent.com/5euME0_VdxZQm5BzNx8S7WBsnmKXCKMIxJcosnsB9rMqNkbbB7Ods-XFEkCqofkw25xIu9MqMbJdUP671X8T5mfGlSIEcq9T3iNVYFjmuiYcZgVxIEqvvBLPZ6cXkwsQb-d71sXXDQ=s32-p-k"), auto') {
      header.style.cursor = 'url("https://lh3.googleusercontent.com/5euME0_VdxZQm5BzNx8S7WBsnmKXCKMIxJcosnsB9rMqNkbbB7Ods-XFEkCqofkw25xIu9MqMbJdUP671X8T5mfGlSIEcq9T3iNVYFjmuiYcZgVxIEqvvBLPZ6cXkwsQb-d71sXXDQ=s32-p-k"), auto';
    }
  });
  srcWatcher.observe(header, { attributes: true, attributeFilter: ['src'] });
}

function buttons() {
  const css = `
  .chCal-button-next.chCal-corner-right > span > span.chCal-button-content,
  .chCal-button-prev.chCal-corner-left > span > span.chCal-button-content {
    background-image: url("https://lh3.googleusercontent.com/5euME0_VdxZQm5BzNx8S7WBsnmKXCKMIxJcosnsB9rMqNkbbB7Ods-XFEkCqofkw25xIu9MqMbJdUP671X8T5mfGlSIEcq9T3iNVYFjmuiYcZgVxIEqvvBLPZ6cXkwsQb-d71sXXDQ=s32-p-k");
    background-size: contain;
    color: transparent;
  }
  .chCal-button-prev.chCal-corner-left > span > span.chCal-button-content {
    transform: scaleX(-1);
  }`;
  //  @ts-ignore
  document.head.appendChild(Object.assign((document as HTMLDocument).createElement('style'), { textContent: css }));
}

async function extremeInit() {
  if (!await isPurim()) {
    return;
  }
  buttons();
  setCursor();
  replaceText();
  insertCss(style.toString());

  setAllImages(ELI_BENNET);
}

async function extremeMain() {
  if (!await isPurim()) {
    return;
  }
  buttons();
  setCursor();
  replaceText();
  // if it is now april first but on page load it wasn't
  extremeInit();
  switch (window.location.hash) {
    case '#studentmyday/assignment-center':
      break;
    case '#studentmyday/schedule':
      break;
    default:
  }
}

export default registerModule('{508be51e-75e5-41da-afeb-d7b5cad20e94}', {
  name: 'purim yall',
  main: extremeMain,
  init: extremeInit,
  defaultEnabled: true,
  showInOptions: false,
});
