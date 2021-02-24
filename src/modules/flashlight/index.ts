/* https://codepen.io/tomhodgins/pen/egWjBb */
import registerModule from '~/core/module';
import { insertCss } from '~/utils/dom';

import style from './style.css';

function update(e: Event) {
  let x = (e as MouseEvent).clientX || (e as TouchEvent).touches[0].clientX;
  let y = (e as MouseEvent).clientY || (e as TouchEvent).touches[0].clientY;

  document.documentElement.style.setProperty('--cursorX', `${x}px`);
  document.documentElement.style.setProperty('--cursorY', `${y}px`);
}

function flashlightMain() {
  insertCss(style.toString());
  document.addEventListener('mousemove', update);
  document.addEventListener('touchmove', update);
}

export default registerModule('{ad25e906-4c56-4494-9625-c3d09f8def73}', {
  name: 'Flashlight Mouse',
  description: 'Turn your muse into a flashlight',
  init: flashlightMain,
});
