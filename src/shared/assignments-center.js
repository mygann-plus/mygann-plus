import { createElement, waitForLoad } from '~/utils/dom';
import { getUserId } from '~/utils/user';
import { fetchApi } from '~/utils/fetch';

export function appendMobileAssignmentCenterMenuLink(textContent, onClick, sectionIndex) {
  const handleClick = e => {
    e.preventDefault();
    onClick(e);
  };
  const link = (
    <li>
      <a className="sec-75-bgc-hover" href="#" onClick={handleClick}>
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

export async function addAssignmentTableMutationObserver(fn) {
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

export function isTask(assignmentRow) {
  const type = assignmentRow.querySelector('[data-heading="Type"]');
  return type && type.textContent === 'My tasks';
}

export async function getAssignmentData(assignmentId) {
  const studentId = await getUserId();
  const endpoint = '/api/datadirect/AssignmentStudentDetail';
  const query = `?format=json&studentId=${studentId}&AssignmentIndexId=${assignmentId}`;
  const [gradeData] = await fetchApi(endpoint + query);
  return gradeData;
}
