import createModule from '~/utils/module';

import { waitForLoad, constructButton } from '~/utils/dom';
import { fetchApi } from '~/utils/fetch';
import { getUserId } from '~/utils/user';
import { loadModule } from '~/module-loader';
import resizeAssignmentsToolbar from '~/modules/resize-assignments-toolbar';

const filterUngraded = label => {
  return label.textContent === 'Graded';
};
const getIdFromLabel = label => {
  const assignment = label.parentNode.parentNode.parentNode.parentNode;
  return assignment.children[2].children[0].href.split('/')[6];
};
const calculateGrade = data => {
  const grade = (Number(data.pointsEarned) / Number(data.maxPoints)) * 100;
  return Math.round(grade * 10) / 10;
};

async function getGrade(id) {
  const studentId = getUserId();
  const endpoint = '/api/datadirect/AssignmentStudentDetail';
  const query = `?format=json&studentId=${studentId}&AssignmentIndexId=${id}`;
  return fetchApi(endpoint + query);
}

async function showGrades() {
  const gradedLabels = Array.from(document.getElementsByClassName('label-success')).filter(filterUngraded);
  const ids = gradedLabels.map(getIdFromLabel);
  const data = await Promise.all(ids.map(getGrade));
  const grades = data.map(([d]) => calculateGrade(d));
  gradedLabels.forEach((label, i) => {
    label.textContent += `: ${grades[i]}`;
  });
}

const domQuery = () => document.querySelector('#filter-status');

async function inlineAssignmentGrade(opts, unloaderContext) {
  const filterStatusButton = await waitForLoad(domQuery);

  const showGradesBtn = constructButton(
    'Show Grades',
    'gocp_inline-assignment-grade_button',
    'fa fa-eye',
    showGrades,
  );
  filterStatusButton.parentNode.appendChild(showGradesBtn);
  unloaderContext.addRemovable(showGradesBtn);
}

export default createModule('{0540d147-af76-4f44-a23d-415506e8e777}', {
  name: 'Inline Assignment Grade',
  main: inlineAssignmentGrade,
  description: 'Button to preview grade of graded assignments in main assignments list',
});
