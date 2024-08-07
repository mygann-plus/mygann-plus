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
}

const mouseBox = new MouseBox(clickAction);

function updateStyles() {
  const styleElem = document.getElementById('zapperStyles') as HTMLElement;
  if (styleElem) {
    styleElem.innerHTML = listToCss(styles);
  }
}

function offStyles() {
  for (const selector of styles) {
    const elm = document.querySelector(selector) as HTMLElement;
    if (elm) {
      elm.dataset.clicked = 'true';
      elm.style.setProperty('background', 'rgba(255, 0, 0, 0.7)', 'important');
    }
  }
  const styleElem = document.getElementById('zapperStyles') as HTMLElement;
  if (styleElem) {
    styleElem.innerHTML = styleElem.innerHTML.replace(/{[^{}]*}/g, '{}');
  }
}

function onStyles() {
  const styleElem = document.getElementById('zapperStyles') as HTMLElement;
  if (styleElem) {
    styleElem.innerHTML = styleElem.innerHTML.replace(
      /{[^{}]*}/g,
      '{display: none}',
    );
  }
}
async function selectMode(on: boolean = true) {
  styles = await loadStyle();

  let css = listToCss(styles);
  let styleElem = <style id="zapperStyles">{css}</style>;
  document.head.appendChild(styleElem);

  if (!on) {
    mouseBox.mouseBoxOff();
  }

  document.addEventListener('keydown', (e) => {
    if (e.code === 'Escape') {
      mouseBox.mouseBoxOff();
      writeStyle('zapStyles', styles);
      updateStyles();
    } else if (e.code === 'KeyE' && e.ctrlKey) {
      e.preventDefault();
      mouseBox.mouseBoxOn();
      offStyles();
    }
  });
}

function zapperMain() {
  selectMode(true);
}

export default registerModule('{a1824798-1bd0-457b-9c29-241efba96b73}', {
  name: 'Zapper',
  description:
    'A tool to zap away items in mygann. Simply press ctrl + E to activate and the Escape key to deactivate. While in zapper mode you can click on items once to mark them as hidden (they will be marked red) and click on them again to unmark them. Once you click escape, they will be hidden until you go back into editing mode when you can change your prefrence.',
  main: zapperMain,
  showInOptions: true,
  defaultEnabled: false,
});
