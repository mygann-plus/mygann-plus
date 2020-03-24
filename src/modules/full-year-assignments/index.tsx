import classNames from 'classnames';

import registerModule from '~/core/module';
import { UnloaderContext } from '~/core/module-loader';

import { getUserId } from '~/utils/user';
import { fetchApi } from '~/utils/fetch';
import { createElement, waitForLoad, waitForOne, constructButton, insertCss } from '~/utils/dom';

import {
  ProgressDialogListenerData,
  addProgressDialogListener,
  sanitizeAssignmentTitle,
  computeGradePercentage,
} from '~/shared/progress';

import style from './style.css';
import fetchNonacademicClasses from '~/shared/nonacademic-classes';

const selectors = {
  table: 'gocp_full-year-assignments_table',
  title: 'gocp_full-year-assignments-title',
  firstSemesterBtn: style.locals['first-semester-btn'],
  pointsWrap: style.locals['points-wrap'],
  percentage: style.locals.percentage,
  dataShown: 'gocpFullYearAssignmentsShown',
};

const domQuery = {
  termButtons: () => document.querySelectorAll('label[data-action="term"]'),
  gradeColumn: () => document.querySelector('.modal-body .col-md-2'),
  assignmentTable: () => document.querySelector('.table'),
  dialogHeader: () => document.querySelector('.bb-dialog-header'),
  dialogBody: () => document.querySelector('.modal-body') as HTMLElement,
  courseTitles: () => document.querySelectorAll('#coursesContainer h3'),
};

const formatDate = (dateString: string) => { // remove time and year
  const dateParts = dateString.split(' ')[0].split('/').slice(0, 2);
  return dateParts.join('/');
};

/* DATA FETCHING */

async function getFirstSemesterCourseList() {
  const termButtons = await waitForOne(domQuery.termButtons);
  const durationListId = Array.from(termButtons)
    .find(button => button.textContent.trim() === '1st Semester')
    .dataset.value;
  const endpoint = '/api/datadirect/ParentStudentUserAcademicGroupsGet';
  const query = `?userId=4109775&memberLevel=3&persona=2&durationList=${durationListId}`;
  const courseList = await fetchApi(endpoint + query);
  return courseList.map((course: any) => ({
    name: course.sectionidentifier,
    id: course.sectionId,
    markingPeriodId: course.markingperiodid,
  }));
}

async function getFirstSemesterAssignments(firstSemMarkingPeriod: string) {
  await waitForLoad(domQuery.assignmentTable);
  const title = domQuery.dialogHeader().textContent;
  const courseId = Number((Array.from(domQuery.courseTitles())
    .find(e => e.textContent === title)
    .closest('.row')
    .querySelector('.btn[data-analysis') as HTMLElement)
    .dataset.analysis) - 1;

  const userId = await getUserId();
  const endpoint = '/api/datadirect/GradeBookPerformanceAssignmentStudentList/';
  const query = `?sectionId=${courseId}&markingPeriodId=${firstSemMarkingPeriod}&studentUserId=${userId}`;
  return fetchApi(endpoint + query);
}

/* UI */

// Is first/both semester(s) currently selected
async function isFirstSemester() {
  const [firstSemButton] = await waitForOne(domQuery.termButtons);
  return firstSemButton.classList.contains('active');
}

function calculateSectionCumulativeGrade(assignments: any[]) {
  const { Points, MaxPoints } = assignments.reduce((a, b) => {
    if (a.Points === null || b.Points === null) {
      const validAssignment = a.Points === null ? b : a;
      return { Points: validAssignment.Points, MaxPoints: validAssignment.MaxPoints };
    }
    return {
      Points: Number(a.Points) + Number(b.Points), // points may be null if ungraded
      MaxPoints: a.MaxPoints + b.MaxPoints,
    };
  });
  return computeGradePercentage(Points, MaxPoints);
}

function generateAssignmentSectionTable(sectionName: string, assignments: any[]) {
  const sectionCumulativeGrade = calculateSectionCumulativeGrade(assignments);
  const header = (
    <div className={selectors.title}>
      <div className="pull-right back-to-top cursor-pointer ws-nw">
        <h6>Back to top <i className="icon-arrow-up"></i></h6>
      </div>
      <h3>{ sectionName }&nbsp;
      <span className="muted">
        (First Semester)&nbsp;&nbsp;
        { sectionCumulativeGrade }%
      </span></h3>
    </div>
  );
  const table = (
    <table className={
      classNames('table table-striped table-condensed table-mobile-stacked', selectors.table)
    }>
      <thead>
        <tr>
          <th>Assignment</th>
          <th>Assigned</th>
          <th>Due</th>
          <th>Points</th>
          <th>Notes</th>
        </tr>
      </thead>
      <tbody>
        {
          assignments.map(assignment => (
            <tr>
              <td data-heading="Assignment" className="col-md-3">
                { sanitizeAssignmentTitle(assignment.AssignmentShortDescription) }
              </td>
              <td data-heading="Assigned" className="col-md-1">
                { formatDate(assignment.DateAssigned) }
              </td>
              <td data-heading="Due" className="col-md-1">{ formatDate(assignment.DateDue) }</td>
              <td data-heading="Points" className="col-md-2">
                <h4 className={selectors.pointsWrap}>
                  { assignment.Points }<span className="muted">/{ assignment.MaxPoints }</span>
                  <span className={selectors.percentage}>
                    { computeGradePercentage(assignment.Points, assignment.MaxPoints) }%
                  </span>
                </h4>
              </td>
              <td data-heading="Notes"></td>
            </tr>
          ))
        }
      </tbody>
    </table>
  );
  return {
    header, table,
  };
}

async function showFirstSemesterGrades(firstSemMarkingPeriodId: string, modalBody: HTMLElement) {
  const assignments = await getFirstSemesterAssignments(firstSemMarkingPeriodId);
  const assignmentSections: { [type: string]: any } = {};
  for (const assignment of assignments) {
    const type = assignment.AssignmentType as string;
    assignmentSections[type] = assignmentSections[type] || [];
    assignmentSections[type].push(assignment);
  }
  for (const section in assignmentSections) {
    const { header, table } = generateAssignmentSectionTable(section, assignmentSections[section]);
    modalBody.appendChild(header);
    modalBody.appendChild(table);
  }
}

function hideFirstSemesterGrades() {
  const tables = document.querySelectorAll(`.${selectors.table}`);
  const titles = document.querySelectorAll(`.${selectors.title}`);
  for (const table of tables) {
    table.remove();
  }
  for (const title of titles) {
    title.remove();
  }
}

function handleShowFirstSemesterClick(
  e: Event,
  firstSemesterCourseList: void,
  markingPeriodId: string,
  modalBody: HTMLElement,
) {
  const button = e.target as HTMLElement;
  const isShown = button.dataset[selectors.dataShown];
  if (isShown) {
    hideFirstSemesterGrades();
    button.textContent = 'Show 1st Semester';
    button.dataset[selectors.dataShown] = '';
  } else {
    showFirstSemesterGrades(markingPeriodId, modalBody);
    button.textContent = 'Hide 1st Semester';
    button.dataset[selectors.dataShown] = 'true';
  }
}

async function insertFirstSemesterButton(
  firstSemesterCourseList: void,
  markingPeriodId: string,
  nonacademicClasses: string[],
) {
  const modalBody = await waitForLoad(domQuery.dialogBody);
  const courseName = (await waitForLoad(domQuery.dialogHeader)).textContent.toLowerCase();
  const isNonacademic = !!nonacademicClasses.find(c => courseName.includes(c));

  if (document.querySelector(`#${selectors.firstSemesterBtn}`) || isNonacademic) {
    return;
  }
  const firstSemesterBtn = constructButton({
    textContent: 'Show 1st Semester',
    id: selectors.firstSemesterBtn,
    onClick: (e: any) => {
      handleShowFirstSemesterClick(e, firstSemesterCourseList, markingPeriodId, modalBody);
    },
  });
  modalBody.appendChild(firstSemesterBtn);
}

async function handleProgressDialogChange(
  data: ProgressDialogListenerData,
  firstSemCourseList: void,
  markingPeriodId: string,
  nonacademicClasses: string[],
) {
  if (await isFirstSemester()) {
    return;
  } else if (data.fromGradeDetailButton) {
    await waitForLoad(domQuery.assignmentTable);
  } else {
    const previousCourseGradeElem = domQuery.gradeColumn();
    await waitForLoad(() => !document.body.contains(previousCourseGradeElem));
  }
  insertFirstSemesterButton(firstSemCourseList, markingPeriodId, nonacademicClasses);
}

async function fullYearAssignmentsMain(opts: void, unloaderContext: UnloaderContext) {
  const styles = insertCss(style.toString());
  unloaderContext.addRemovable(styles);

  const firstSemesterCourseList = await getFirstSemesterCourseList();
  const { markingPeriodId } = firstSemesterCourseList[0];

  const nonacademicClasses = (await fetchNonacademicClasses()).progress || [];

  addProgressDialogListener(data => {
    handleProgressDialogChange(data, firstSemesterCourseList, markingPeriodId, nonacademicClasses);
  }, unloaderContext);
}

function unloadFullYearAssignments() {
  hideFirstSemesterGrades();
}

export default registerModule('{705f08d2-de45-434b-bf51-c613e5d39f55}', {
  name: 'Full Year Assignments',
  description: `
    View your graded assignments from the entire year, instead of only the current semester
  `,
  main: fullYearAssignmentsMain,
  unload: unloadFullYearAssignments,
});
