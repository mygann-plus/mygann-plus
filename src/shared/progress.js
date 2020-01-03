import he from 'he';
import stripHtml from 'string-strip-html';

import { waitForOne, addEventListener, waitForLoad } from '~/utils/dom';
import { fetchApi } from '~/utils/fetch';
import { getAssignmentData } from './assignments-center';

export function coursesListLoaded() {
  return document.querySelector('#coursesContainer > *')
    && document.querySelectorAll('.bb-tile-content-section')[3]
    && document.querySelectorAll('.bb-tile-content-section')[3].children[0];
}

async function observeSectionBar(id, fn) {
  const courseWrap = await waitForLoad(() => (
    document.querySelector(`#${id}`)
    && document.querySelector(`#${id}`).closest('.ch')
  ));
  const observer = new MutationObserver(fn);
  observer.observe(courseWrap, {
    childList: true,
  });
  return {
    remove() { observer.disconnect(); },
  };
}

export async function observeCoursesBar(fn) {
  return observeSectionBar('coursesCollapse', fn);
}

export async function observeActivitiesBar(fn) {
  return observeSectionBar('activitiesCollapse', fn);
}

export function computeGradePercentage(earned, total) {
  return Number(((Number(earned) / Number(total)) * 100).toFixed(2));
}

const domQuery = {
  dialogTitle: () => document.querySelector('.media-heading'),
  gradeDetailButton: () => document.querySelectorAll('.col-md-2 .btn'),
  prevButton: () => document.querySelectorAll('button[data-analysis="prev"]')[0],
  nextButton: () => document.querySelectorAll('button[data-analysis="next"]')[0],
};

async function callWhenDialogChanges(callback, data) {
  const getDialogTitle = () => (
    domQuery.dialogTitle()
    && domQuery.dialogTitle().textContent
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
  unloaderContext.addRemovable(observeCoursesBar(() => addProgressDialogListener(callback, unloaderContext)));
}

// removes HTML entities (for Hebrew characters) and HTML fragments
export function sanitizeAssignmentTitle(title) {
  return he.decode(stripHtml(title)
    .replace(/\s+/g, ' ')
    .replace(/<!--StartFragment-->/g, '')
    .replace(/<!--EndFragment-->/g, '')
    .trim()).trim();
}

// get all assignments on a certain assigned date
function getAssignmentsByAssigned(assigned) {
  const endpoint = '/api/DataDirect/AssignmentCenterAssignments';
  const year = (new Date()).getFullYear();
  const fullAssigned = `${assigned}/${year}`;
  const query = `?format=json&filter=0&dateStart=${fullAssigned}&dateEnd=${fullAssigned}&persona=2&statusList=&sectionList=`;
  return fetchApi(endpoint + query);
}

export async function getAssignmentBasicDataFromRow(assignmentRow) {
  const assignedDate = assignmentRow.querySelector('[data-heading="Assigned"]').textContent;
  const name = assignmentRow.querySelector('[data-heading="Assignment"]').textContent;
  const assignedAssignments = await getAssignmentsByAssigned(assignedDate);
  const assignment = assignedAssignments.find(a => {
    return sanitizeAssignmentTitle(a.short_description) === name;
  });
  return assignment;
}

export async function getAssignmentDataFromRow(assignmentRow) {
  const assignmentBasicData = await getAssignmentBasicDataFromRow(assignmentRow);
  return getAssignmentData(assignmentBasicData.assignment_index_id);
}

export function assignmentHasRubric(assignmentRow) {
  return assignmentRow.querySelector('.rubric-detail-button');
}
export function letterGradeToPercentage(letter) {
  const letterMap = {
    A: 96.99,
    B: 86.99,
    C: 76.99,
    D: 66.99,
  };
  let grade = letterMap[letter[0]];
  // adjust grade based on +/-
  if (letter[1]) {
    grade += letter[1] === '+' ? 3 : -4;
  }
  return grade;
}
