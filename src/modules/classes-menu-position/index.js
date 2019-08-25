import registerModule from '~/module';

import { createElement, addEventListener, waitForLoad, insertCss } from '~/utils/dom';
import { getDesktopMenu, getDesktopCourses } from '~/shared/classes-menu';

import style from './style.css';

function isInViewport(elem) {
  const bounding = elem.getBoundingClientRect();
  return (
    bounding.top >= 0
      && bounding.left >= 0
      && bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight)
      && bounding.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// Move all items to top level & remove column elems
function resetMenu(menu) {
  const menuItems = menu.querySelectorAll('li');
  const columns = menu.querySelectorAll('ul');
  for (const item of menuItems) {
    menu.appendChild(item);
  }
  for (const ul of columns) {
    ul.remove();
  }
}

// Get index of the first course in list that is cut off
function getFirstHiddenIndex(menu) {
  const menuItems = menu.querySelectorAll('li');
  for (let i = 0; i < menuItems.length; i++) {
    const item = menuItems[i];
    item.closest('.subnav').style.display = 'block';
    const visible = isInViewport(item);
    item.closest('.subnav').style.display = '';
    if (!visible) {
      return i;
    }
  }
  return null;
}

async function repositionClasses() {
  const menu = await waitForLoad(() => getDesktopMenu());
  const parent = menu.querySelector('ul');

  resetMenu(parent);
  const firstHidden = getFirstHiddenIndex(menu);

  if (firstHidden === null) {
    return;
  }

  parent.innerHTML = `<ul>${parent.innerHTML}</ul>`;
  const secondCol = <ul></ul>;
  // const newLis = parent.querySelectorAll('li');
  const courses = getDesktopCourses().map(c => c.elem);
  // console.log(courses);

  const toMove = Array.from(courses).slice(firstHidden);

  const visibleCount = firstHidden - 1;
  const totalCount = courses.length;
  // console.log(visibleCount, totalCount);

  for (const elem of toMove) {
    secondCol.appendChild(elem);
  }
  parent.appendChild(secondCol);
}

async function classesMenuPosition(opts, unloaderContext) {
  const styles = insertCss(style.toString());
  unloaderContext.addRemovable(styles);

  repositionClasses();
  const resizeListener = addEventListener(window, 'resize', repositionClasses);
  unloaderContext.addRemovable(resizeListener);
}

function unloadClassesMenuPosition() {
  const menu = getDesktopMenu();
  const parent = menu.querySelector('ul');
  resetMenu(parent);

}

export default registerModule('{eab75ea6-aaa6-4ef2-8041-80e3910f79eb}', {
  name: 'Classes Menu Position',
  main: classesMenuPosition,
  unload: unloadClassesMenuPosition,
  affectsGlobalState: true,
});
