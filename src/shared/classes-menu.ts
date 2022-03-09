/* eslint-disable import/prefer-default-export */

export const getDesktopMenu = () => (
  document.querySelector('#group-header-Classes + * + .subnav') as HTMLElement
);

export const getMobileMenu = () => (
  document.querySelectorAll('.app-mobile-level')[2]
  && document.querySelectorAll('.app-mobile-level')[2].children[2] as HTMLElement
);

export function getDesktopCourses() {
  const courses = Array.from(getDesktopMenu().querySelectorAll('li'))
    .filter(course => !course.closest('.subnavfooter'));

  return courses.map(elem => ({
    title: elem.textContent.toLowerCase().trim(),
    elem: elem as HTMLElement,
  }));
}

export function getMobileCourses() {
  const elems = Array.from(document.querySelectorAll('.app-mobile-level')[2].children[2].children);
  elems.splice(elems.length - 1, 1);
  return Array.from(elems,
    elem => ({
      title: elem.firstElementChild.textContent.toLowerCase().trim(),
      elem: elem as HTMLElement,
    }));
}
