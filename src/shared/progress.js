export function coursesListLoaded() {
  return document.querySelector('#coursesContainer > *') &&
    document.querySelectorAll('.bb-tile-content-section')[3] &&
    document.querySelectorAll('.bb-tile-content-section')[3].children[0];
}

export function observeCoursesBar(fn) {
  const courseWrap = document.querySelector('#coursesCollapse').closest('.ch');
  const observer = new MutationObserver(fn);
  observer.observe(courseWrap, {
    childList: true,
  });
  return {
    remove() { observer.disconnect(); },
  };
}
