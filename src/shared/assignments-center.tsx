import { createElement, waitForLoad } from '~/utils/dom';
import { getUserId } from '~/utils/user';
import { fetchApi } from '~/utils/fetch';
import runWithPodiumApp from '~/utils/podium-app';

export function appendMobileAssignmentCenterMenuLink(
  textContent: string,
  onClick: (event: MouseEvent) => void,
  sectionIndex: number,
) {
  const handleClick = (e: MouseEvent) => {
    e.preventDefault();
    onClick(e);
  };
  const link = (
    <li>
      <a className="sec-75-bgc-hover" href="#" onClick={(e: any) => handleClick(e)}>
        { textContent }
      </a>
    </li>
  );
  const divider = document.querySelectorAll('#optionsMenu .divider')[sectionIndex];
  if (!divider) { // last section
    document.querySelector('#optionsMenu').appendChild(link);
  } else {
    divider.before(link);
  }
  return link;
}

export async function addAssignmentTableMutationObserver(fn: MutationCallback) {
  const table = await waitForLoad(() => {
    return document.querySelector('#assignment-center-assignment-items');
  });
  const observer = new MutationObserver(fn);
  observer.observe(table, {
    childList: true,
  });
  return {
    remove() { observer.disconnect(); },
  };
}

export function isTask(assignmentRow: HTMLElement) {
  const type = assignmentRow.querySelector('[data-heading="Type"]');
  return type && type.textContent === 'My tasks';
}

export async function getAssignmentData(assignmentId: string) {
  const studentId = await getUserId();
  const endpoint = '/api/datadirect/AssignmentStudentDetail';
  const query = `?format=json&studentId=${studentId}&AssignmentIndexId=${assignmentId}`;
  const [gradeData] = await fetchApi(endpoint + query);
  return gradeData;
}

export async function getTaskData(id: string) {
  const endpoint = `/api/usertask/edit/${id}`;
  const data = await fetchApi(endpoint);
  const courseId = data.SectionId;
  let courseName = 'General Task';

  if (courseId) { // task is set to specific class
    const coursesEndpoint = '/api/datadirect/ParentStudentUserAcademicGroupsGet';
    const coursesQuery = `?userId=${await getUserId()}&persona=2&memberLevel=-1&durationList=`;
    const courses = await fetchApi(coursesEndpoint + coursesQuery);
    const course = courses.find((c: any) => c.sectionid === courseId);
    courseName = course.sectionidentifier;
  }

  return {
    id,
    name: data.ShortDescription,
    status: data.TaskStatus,
    course: courseName,
    due: data.DueDate,
    assigned: data.AssignedDate,
  };
}

export function getAssignmentIdFromRow(row: HTMLElement) {
  const update = row.querySelector('.assignment-status-update') as HTMLElement;
  return update ? update.dataset.id : null;
}

export function getAssignmentRows() {
  return document.querySelectorAll('#assignment-center-assignment-items > tr');
}

export function changeDate(date: Date) {
  runWithPodiumApp(({ p3, $ }, dateString) => {
    p3.Data.LMS.AssignmentCenterDate = new Date(dateString);
    $('#assignment-center-assignment-items').trigger($.Event('listRefresh'));
  }, date.toString());
}
