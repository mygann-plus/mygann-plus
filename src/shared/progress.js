import he from 'he';

import { waitForOne, addEventListener, waitForLoad } from '~/utils/dom';

export function coursesListLoaded() {
  return document.querySelector('#coursesContainer > *') &&
    document.querySelectorAll('.bb-tile-content-section')[3] &&
    document.querySelectorAll('.bb-tile-content-section')[3].children[0];
}

export async function observeCoursesBar(fn) {
  const courseWrap = await waitForLoad(() => (
    document.querySelector('#coursesCollapse') &&
    document.querySelector('#coursesCollapse').closest('.ch')
  ));
  const observer = new MutationObserver(fn);
  observer.observe(courseWrap, {
    childList: true,
  });
  return {
    remove() { observer.disconnect(); },
  };
}

export function computeGradePercentage(earned, total) {
  let percentage = Number(((Number(earned) / Number(total)) * 100).toFixed(2));
  if (Math.floor(percentage) === percentage) {
    percentage = Math.floor(percentage); // don't display .00
  }
  return percentage;
}

const domQuery = {
  dialogTitle: () => document.querySelector('.media-heading'),
  gradeDetailButton: () => document.querySelectorAll('.col-md-2 .btn'),
  prevButton: () => document.querySelectorAll('button[data-analysis="prev"]')[0],
  nextButton: () => document.querySelectorAll('button[data-analysis="next"]')[0],
};

async function callWhenDialogChanges(callback, data) {
  const getDialogTitle = () => (
    domQuery.dialogTitle() &&
    domQuery.dialogTitle().textContent
  );
  const currentTitle = getDialogTitle();
  await waitForLoad(() => (
    getDialogTitle() && getDialogTitle() !== currentTitle
  ));
  callback(data);
}

export async function addProgressDialogListener(callback, unloaderContext) {
  const gradeDetailButtons = await waitForOne(() => document.querySelectorAll('.showGrade + a'));
  for (const button of gradeDetailButtons) {
    unloaderContext.addRemovable(addEventListener(button, 'click', async () => {
      await callWhenDialogChanges(callback, { fromGradeDetailButton: true });
      const navButtons = await waitForOne(() => (
        document.querySelectorAll('[data-analysis="next"], [data-analysis="prev"]')
      ));
      for (const navButton of navButtons) {
        const data = { fromGradeDetailButton: false };
        unloaderContext.addRemovable(addEventListener(navButton, 'click', () => callback(data)));
      }
    }));
  }
}

// removes HTML entities (for Hebrew characters) and HTML fragments
export function sanitizeAssignmentTitle(title) {
  return he.decode(title
    .replace(/\s+/g, ' ')
    .replace(/<br>/g, ' ')
    .replace(/<br \/>/g, ' ')
    .replace(/<div>/g, '')
    .replace(/<\/div>/g, '')
    .replace(/<b>/g, ' ')
    .replace(/<\/b>/g, ' ')
    .replace(/<i>/g, '')
    .replace(/<\/i>/g, '')
    .replace(/<!--StartFragment-->/g, '')
    .replace(/<!--EndFragment-->/g, '')
    .trim());
}
