import registerModule from '~/core/module';

import { insertCss } from '~/utils/dom';

import style from './style.css';
import setAllImages from './funImages';

function isPurim() {
  const date = new Date();
  return (date.getDate() === 6 || date.getDate() === 7) && date.getMonth() === 2;
}

let initRun = false;

// const ELI_BENNET = 'https://bbk12e1-cdn.myschoolcdn.com/ftpimages/591/user/large_user4321840_2403859_930.JPG?resize=200,200';
const ELI_BENNET = 'https://cdn.discordapp.com/attachments/939668210435887164/1082171985196490752/istockphoto-1282932721-612x612.jpg';

function waitForElm(selector: string) {
  return new Promise(resolve => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver(mutations => {
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
  waitForElm('#site-logo > a > img').then((elm) => {
    // @ts-ignore
    document.querySelector('#site-logo > a > img').src = url;
    document.querySelector('body').style.backgroundImage = "url('https://media.istockphoto.com/id/1373141996/vector/hamantash-purim-pattern.jpg?s=612x612&w=0&k=20&c=Dgw5apYCbYufOFnuK3IxSiegpSnatzQCysB1BzD0D7s=')"
    document.querySelector("body").style.cursor =  "url('https://lh3.googleusercontent.com/TsraUfU531F4_gd9HlROT3TFXjHFwV9z2uLD_ZlZJo5cp71uE6buJnDYTFODz6MHjg5n4IU1RGUha-mzLDK7hG7d6pVqBL-0S7ab0hpBfw6f8uPje2nFkiXTZOscqjtJ1bFNkZTjNw=s128-p-k'),auto"
  })
}

function extremeInit() {
  replaceText()
  if (!isPurim()) {
    return;
  }
  insertCss(style.toString());

  initRun = true;
  setAllImages(ELI_BENNET);
}

function extremeMain() {
  replaceText()
  if (!isPurim()) {
    return;
  }
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
