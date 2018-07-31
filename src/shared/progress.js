/* eslint-disable import/prefer-default-export */

export function coursesListLoaded() {
  return document.querySelector('#coursesContainer > *') &&
    document.querySelectorAll('.bb-tile-content-section')[3] &&
    document.querySelectorAll('.bb-tile-content-section')[3].children[0];
}

/* eslint-enable import/prefere-default-export */
