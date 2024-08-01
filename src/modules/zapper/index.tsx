import registerModule from '~/core/module';

import { createElement, waitForLoad, insertCss } from '~/utils/dom';
import storage from '~/utils/storage';
import style from './style.css';

function addStyle() {
  const css = `
  #assignment-center-btn {background: blue}
  /* *:hover {background: rgba(255, 0, 0, .7);}
    `;
  insertCss(css);
}

function handleSubnavtop() {
  const elements = document.getElementsByClassName('subnavtop');
  for (let i = 0; i < elements.length; i++) {
    const elm = elements[i] as HTMLElement;
    elm.remove();
    i--;
  }
}

async function zapperMain() {
  handleSubnavtop();

  const overlay = document.createElement('div');
  overlay.style.position = 'absolute';
  overlay.style.pointerEvents = 'none';
  overlay.style.border = '2px solid rgba(255, 0, 0, 0.5)';
  overlay.style.background = 'rgba(255,0, 0, 0.2)';
  overlay.style.zIndex = '9999';
  overlay.style.display = 'none';
  document.body.appendChild(overlay);

  let currentTarget: HTMLElement | null = null;
  document.addEventListener('mouseover', (event: MouseEvent) => {
    handleSubnavtop();
    const target = event.target as HTMLElement;
    if (target && target !== overlay) {
      const rect = target.getBoundingClientRect();
      overlay.style.width = `${rect.width}px`;
      overlay.style.height = `${rect.height}px`;
      overlay.style.left = `${rect.left + window.scrollX}px`;
      overlay.style.top = `${rect.top + window.scrollY}px`;
      overlay.style.display = 'block';
    }
  });

  document.addEventListener('mouseout', (event: MouseEvent) => {
    handleSubnavtop();
    const target = event.target as HTMLElement;
    if (target && target !== overlay && target !== currentTarget) {
      overlay.style.display = 'none';
    }
  });

  document.addEventListener('click', (event: MouseEvent) => {
    handleSubnavtop();
    const target = event.target as HTMLElement;
    event.preventDefault();
    if (target && target !== overlay) {
      if (target.dataset.clicked === 'true') {
        target.style.removeProperty('background');
        target.dataset.clicked = 'false';
      } else {
        target.style.setProperty(
          'background',
          'rgba(255, 0, 0, 0.7)',
          'important',
        );
        target.dataset.clicked = 'true';
      }
      overlay.style.display = 'none';
      currentTarget = target;
    }
  });
}

export default registerModule('{a1824798-1bd0-457b-9c29-241efba96b73}', {
  name: 'Zapper',
  description: 'Zapper',
  main: zapperMain,
  showInOptions: true,
});
