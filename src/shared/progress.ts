import he from 'he';
import stripHtml from 'string-strip-html';

import { waitForOne, addEventListener, waitForLoad } from '~/utils/dom';
import { fetchApi } from '~/utils/fetch';
import { getAssignmentData } from './assignments-center';
import { UnloaderContext } from '~/core/module-loader';

export function coursesListLoaded() {
  return (
    document.querySelector('#coursesContainer > *') &&
    document.querySelector('#coursesCollapse > div > div.row')
  );
}

async function observeSectionBar(id: string, fn: MutationCallback) {
  const courseWrap = await waitForLoad(
    () =>
      document.querySelector(`#${id}`) &&
      document.querySelector(`#${id}`).closest('.ch'),
  );
  const observer = new MutationObserver(fn);
  observer.observe(courseWrap, {
    childList: true,
  });
  return {
    remove() {
      observer.disconnect();
    },
  };
}

export function observeCoursesBar(fn: MutationCallback) {
  return observeSectionBar('coursesCollapse', fn);
}

export async function observeActivitiesBar(fn: MutationCallback) {
  return observeSectionBar('activitiesCollapse', fn);
}

export function computeGradePercentage(earned: string, total: string) {
  return Number(((Number(earned) / Number(total)) * 100).toFixed(2));
}

const domQuery = {
  dialogTitle: () => document.querySelector('.media-heading'),
  gradeDetailButton: () => document.querySelectorAll('.col-md-2 .btn'),
  prevButton: () =>
    document.querySelectorAll('button[data-analysis="prev"]')[0],
  nextButton: () =>
    document.querySelectorAll('button[data-analysis="next"]')[0],
};

export interface ProgressDialogListenerData {
  fromGradeDetailButton: boolean;
}

async function callWhenDialogChanges(
  callback: (data: ProgressDialogListenerData) => void,
  data: ProgressDialogListenerData,
) {
  const getDialogTitle = () =>
    domQuery.dialogTitle() && domQuery.dialogTitle().textContent;
  const currentTitle = getDialogTitle();
  await waitForLoad(
    () => getDialogTitle() && getDialogTitle() !== currentTitle,
  );
  callback(data);
}

export async function addProgressDialogListener(
  callback: (data: ProgressDialogListenerData) => void,
  unloaderContext: UnloaderContext,
) {
  const gradeDetailButtons = await waitForOne(() =>
    document.querySelectorAll('.showGrade + a'),
  );
  for (const button of gradeDetailButtons) {
    unloaderContext.addRemovable(
      addEventListener(button, 'click', async () => {
        await callWhenDialogChanges(callback, { fromGradeDetailButton: true });
        const navButtons = await waitForOne(() =>
          document.querySelectorAll(
            '[data-analysis="next"], [data-analysis="prev"]',
          ),
        );
        for (const navButton of navButtons) {
          const data = { fromGradeDetailButton: false };
          unloaderContext.addRemovable(
            addEventListener(navButton, 'click', () => callback(data)),
          );
        }
      }),
    );
  }
  unloaderContext.addRemovable(
    await observeCoursesBar(() => {
      return addProgressDialogListener(callback, unloaderContext);
    }),
  );
}

// removes HTML entities (for Hebrew characters) and HTML fragments
export function sanitizeAssignmentTitle(title: string) {
  return he
    .decode(
      stripHtml(title)
        .replace(/\s+/g, ' ')
        .replace(/<!--StartFragment-->/g, '')
        .replace(/<!--EndFragment-->/g, '')
        .trim(),
    )
    .trim();
}

// assigned date does not include year
// returns the year the assigned was assigned,
// based on the school year schedule
function getYearFromAssigned(assigned: string) {
  const month = Number(assigned.split('/')[0]);
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  if (month >= 9 && currentMonth < 9) {
    return currentYear - 1;
  }
  return currentYear;
}

// get all assignments on a certain assigned date
function getAssignmentsByAssigned(assigned: string) {
  const endpoint = '/api/DataDirect/AssignmentCenterAssignments';
  const year = getYearFromAssigned(assigned);
  const fullAssigned = `${assigned}/${year}`;
  const query = `?format=json&filter=0&dateStart=${fullAssigned}&dateEnd=${fullAssigned}&persona=2&statusList=&sectionList=`;
  return fetchApi(endpoint + query);
}

export async function getAssignmentBasicDataFromRow(
  assignmentRow: HTMLElement,
) {
  const assignedDate = assignmentRow.querySelector(
    '[data-heading="Assigned"]',
  ).textContent;
  const name = assignmentRow
    .querySelector('[data-heading="Assignment"]')
    .textContent.trim();
  const assignedAssignments = await getAssignmentsByAssigned(assignedDate);
  const assignment = assignedAssignments.find((a: any) => {
    return sanitizeAssignmentTitle(a.short_description) === name;
  });
  return assignment;
}

export async function getAssignmentDataFromRow(assignmentRow: HTMLElement) {
  const assignmentBasicData =
    await getAssignmentBasicDataFromRow(assignmentRow);
  // could not find assignment due to unexpected unstripped formatting
  if (!assignmentBasicData) {
    return;
  }
  return getAssignmentData(assignmentBasicData.assignment_index_id);
}

export function assignmentHasRubric(assignmentRow: HTMLElement) {
  return !!assignmentRow.querySelector('.rubric-detail-button');
}

export function letterGradeToPercentage(letter: string) {
  const letterMap: { [grade: string]: number } = {
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

// / Get sectionId for currently open "See grade detail" modal
export function getOpenCourseId() {
  const title = document.querySelector('.bb-dialog-header').textContent.trim();
  const courses = Array.from(
    document.querySelectorAll('#coursesContainer .row'),
  );
  const openCourse = courses.find((course) => {
    return course.querySelector('h3').textContent.trim() === title;
  });
  return (
    openCourse &&
    (openCourse.querySelector('.showGrade + a') as HTMLElement).dataset.analysis
  );
}

export async function getActiveMarkingPeriodId() {
  // TODO: Change to use https://gannacademy.myschoolapp.com/api/DataDirect/StudentGroupTermList/?studentUserId={userID}&schoolYearLabel=2023%20-%202024&personaId=2 style
  // - requires:
  //    - userID
  //    - schoolYearLabel (which allows us to change year too)
  // - returns:
  //    - list of semesters ( and seasons ) with durationID that can be used (sometimes instead of markingPeriod)
  const activeMarkingPeriod = await waitForLoad(() => {
    return document.querySelector(
      '#showHideGrade .dropdown-menu .active a',
    ) as HTMLElement;
  });
  // NOTE: I think it might be document.querySelector("#showHideGrade > div > ul > li > a") now
  return activeMarkingPeriod.dataset.value;
}
