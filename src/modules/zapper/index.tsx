import registerModule from '~/core/module';
import MouseBox from './mouseBox';
import { createElement, waitForLoad, insertCss } from '~/utils/dom';
import style from './style.css';
import { loadStyle, writeStyle, listToCss } from './utils';

function addStyle() {
  const css = `
  #assignment-center-btn {background: blue}
  /* *:hover {background: rgba(255, 0, 0, .7);}
    `;
  insertCss(css);
}
let styles: string[] = [];
function clickAction(add: boolean, path: string): void {
  if (add) {
    const index = styles.indexOf(path);
    if (index > -1) {
      styles.splice(index, 1);
    }
  } else {
    styles.push(path);
  }
  console.log(styles);
}

const mouseBox = new MouseBox(clickAction);

async function selectMode(on: boolean = true) {
  styles = await loadStyle();
  const css = listToCss(styles);
  console.log(css);
  const styleElem = <style>{css}</style>;
  document.head.appendChild(styleElem);

  if (!on) {
    mouseBox.mouseBoxOff();
  } else {
    // for (const s of styles) {
    //   const elm = document.querySelector(s) as HTMLElement;
    //   elm.style.setProperty('background', 'rgba(255, 0, 0, 0.7)', 'important');
    //   elm.dataset.clicked = 'true';
    // }
    mouseBox.mouseBoxOn();
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Escape') {
        mouseBox.mouseBoxOff();
        writeStyle('zapStyles', styles);
      } else if (e.code === 'KeyE') {
        mouseBox.mouseBoxOn();
      }
    });
  }
}

function zapperMain() {
  selectMode(true);
}

export default registerModule('{a1824798-1bd0-457b-9c29-241efba96b73}', {
  name: 'Zapper',
  description: 'Zapper',
  main: zapperMain,
  showInOptions: true,
});
