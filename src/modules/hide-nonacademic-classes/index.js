import registerModule from '~/module';

import { waitForLoad, insertCss, waitForOne } from '~/utils/dom';
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

async function hideClassesMenu(keywords) {


  waitForLoad(getDesktopMenu).then(() => {
    const classes = getDesktopCourses();
    hideClasses(classes, keywords);
  });

  waitForLoad(getMobileMenu).then(() => {
    const classes = getMobileCourses();
    hideClasses(classes, keywords);
  });

}

const domQuery = {
  progressCourses: () => document.querySelectorAll('#coursesContainer .row'),
};

async function hideProgressPage(keywords) {
  const courseElems = await waitForOne(domQuery.progressCourses);

  const classes = Array.from(courseElems).map(elem => ({
    title: elem.querySelector('h3').textContent.toLowerCase(),
    elem,
  }));

  hideClasses(classes, keywords);
}

async function hideNonacademicClasses(suboptions, unloaderContext) {
  const styles = insertCss(style.toString());
  unloaderContext.addRemovable(styles);

  const keywords = suboptions.keywords.split(',').map(k => k.trim());

  if (window.location.hash === '#studentmyday/progress' && suboptions.inProgressPage) {
    hideProgressPage(keywords);
  }
  if (suboptions.inClassesMenu) {
    hideClassesMenu(keywords);
  }
}

function unloadedHideNonacademicClasses() {
  const hiddenClasses = document.querySelectorAll(`.${selectors.hiddenClass}`);
  for (const classElem of hiddenClasses) {
    classElem.classList.remove(selectors.hiddenClass);
  }
}

/* eslint-disable max-len */

export default registerModule('{e6bf215e-1286-47e7-baac-d17ec598c4f8}', {
  name: 'Hide Non-Academic Classes',
  description: 'Hides non-academic "classes" in the classes menu and the progress page. By default, this hides Lunch, Z\'man Kodesh, Mincha, Special Program, Assembly, Hakhel, Clubs/Lunch, Minyan, and Community Service',
  init: hideNonacademicClasses,
  unload: unloadedHideNonacademicClasses,
  suboptions: {
    keywords: {
      name: 'Keywords to Hide (separated by commas, not case sensative)',
      type: 'textarea',
      defaultValue: 'mincha, special program, assembly, hakhel, z\'man kodesh, community service, lunch',
    },
    inClassesMenu: {
      name: 'Hide in Classes Menu',
      type: 'boolean',
      defaultValue: true,
    },
    inProgressPage: {
      name: 'Hide in Progress Page',
      type: 'boolean',
      defaultValue: true,
    },
  },
});

/* eslint-enable max-len */
