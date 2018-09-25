import registerModule from '~/module';

import { waitForLoad, insertCss } from '~/utils/dom';
import {
  getDesktopMenu,
  getDesktopCourses,
  getMobileMenu,
  getMobileCourses,
} from '~/shared/classes-menu';

import style from './style.css';

const selectors = {
  hiddenClass: style.locals['hidden-class'],
};

function hideClasses(classes, keywords) {
  for (const classObj of classes) {
    const matches = keywords.find(c => classObj.title.includes(c));
    if (matches) {
      classObj.elem.classList.add(selectors.hiddenClass);
    }
  }
}

async function hideClassesMenu(suboptions, unloaderContext) {
  const styles = insertCss(style.toString());
  unloaderContext.addRemovable(styles);

  const keywords = suboptions.keywords.split(',').map(k => k.trim());

  waitForLoad(getDesktopMenu).then(() => {
    const classes = getDesktopCourses();
    hideClasses(classes, keywords);
  });

  waitForLoad(getMobileMenu).then(() => {
    const classes = getMobileCourses();
    hideClasses(classes, keywords);
  });

}

function unloadHideClassesMenu() {
  const hiddenClasses = document.querySelectorAll(`.${selectors.hiddenClass}`);
  for (const classElem of hiddenClasses) {
    classElem.classList.remove(selectors.hiddenClass);
  }
}

/* eslint-disable max-len */

export default registerModule('{e6bf215e-1286-47e7-baac-d17ec598c4f8}', {
  name: 'Hide Classes in Menu',
  description: 'Hides non-academic "classes" in the classes menu. By default, this hides Lunch, Z\'man Kodesh, Mincha, Special Program, Assembly, Hakhel, Clubs/Lunch, Minyan, and Community Service',
  init: hideClassesMenu,
  unload: unloadHideClassesMenu,
  suboptions: {
    keywords: {
      name: 'Keywords to Hide (separated by commas, not case sensative)',
      type: 'textarea',
      defaultValue: 'mincha, special program, assembly, hakhel, z\'man kodesh, community service, lunch',
    },
  },
});

/* eslint-enable max-len */
