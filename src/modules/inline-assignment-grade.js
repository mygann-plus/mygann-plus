import registerModule from '../utils/module';
import { waitForLoad, nodeListToArray, constructButton, insertAfter } from '../utils/dom';
import { fetchApi } from '../utils/fetch';
import { getUserId } from '../utils/user';

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
  const gradedLabels = nodeListToArray(document.getElementsByClassName('label-success')).filter(filterUngraded);
  const ids = gradedLabels.map(getIdFromLabel);
  const data = await Promise.all(ids.map(getGrade));
  const grades = data.map(([d]) => calculateGrade(d));
  gradedLabels.forEach((label, i) => {
    label.textContent += `: ${grades[i]}`;
  });
}

function resizeToolbars() {
  const datebar = document.getElementsByClassName('col-md-4')[1];
  const buttonbar = document.getElementsByClassName('col-md-8')[0];
  datebar.classList.remove('col-md-4');
  datebar.classList.add('col-md-3');
  buttonbar.classList.remove('col-md-8');
  buttonbar.classList.add('col-md-9');

}

function inlineAssignmentGrade() {
  waitForLoad(() => document.getElementById('gocp-toggle-completed'))
    .then(() => {
      const toggleCompletedBtn = document.getElementById('gocp-toggle-completed');
      const showGradesBtn = constructButton('Show Grades', 'gocp_inline-assignment-grade_button', 'fa fa-eye', showGrades);
      insertAfter(toggleCompletedBtn, showGradesBtn);
      resizeToolbars();
    });
}

export default registerModule('Inline Assignment Grade', inlineAssignmentGrade, {
  description: 'Show grade of graded assignments in main assignments list',
});
