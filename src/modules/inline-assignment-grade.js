import registerModule from '~/module';

import { createElement, waitForLoad, constructButton } from '~/utils/dom';
import { fetchApi } from '~/utils/fetch';
import { getUserId } from '~/utils/user';

import {
  appendMobileAssignmentCenterMenuLink,
  addAssignmentTableMutationObserver,
} from '~/shared/assignments-center';

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
  const studentId = await getUserId();
  const endpoint = '/api/datadirect/AssignmentStudentDetail';
  const query = `?format=json&studentId=${studentId}&AssignmentIndexId=${id}`;
  const [gradeData] = await fetchApi(endpoint + query);
  return calculateGrade(gradeData);
}

class InlineGrade {

  constructor(label) {
    this.label = label;
    this.id = getIdFromLabel(label);
    this.grade = null;

    this.gradeLabel = <span></span>;
    this.button = (
      <i
        className="fa fa-eye"
        onClick={ () => this.show() }
        style={{ marginLeft: '10px' }}
      />
    );

    this.label.appendChild(this.gradeLabel);
    this.label.appendChild(this.button);
  }

  async show() {
    if (!this.grade) {
      this.grade = await getGrade(this.id);
      this.gradeLabel.textContent = `: ${this.grade}%`;
    }
    this.gradeLabel.style.display = 'inline-block';
    this.button.style.display = 'none';
  }

  remove() {
    this.gradeLabel.remove();
    this.button.remove();
  }

}

async function showGrades(inlineGrades) {
  for (const inlineGrade of inlineGrades) {
    inlineGrade.show();
  }
}

function insertInlineGrades(unloaderContext) {
  const inlineGrades = [];
  const gradedLabels = Array.from(document.querySelectorAll('.label-success'))
    .filter(filterUngraded);

  for (const label of gradedLabels) {
    const inlineGrade = new InlineGrade(label);
    inlineGrades.push(inlineGrade);
    unloaderContext.addRemovable(inlineGrade);
  }

  return inlineGrades;
}

function toggleButtonDisabled(button, inlineGrades) {
  if (!inlineGrades.length) {
    button.classList.add('disabled');
  } else {
    button.classList.remove('disabled');
  }
}

const domQuery = () => document.querySelector('#filter-status');

async function inlineAssignmentGrade(opts, unloaderContext) {
  const filterStatusButton = await waitForLoad(domQuery);

  let inlineGrades = [];

  const showGradesBtn = constructButton(
    'Show Grades',
    'gocp_inline-assignment-grade_button',
    'fa fa-eye',
    () => showGrades(inlineGrades),
  );
  filterStatusButton.parentNode.appendChild(showGradesBtn);

  const showGradesLink = appendMobileAssignmentCenterMenuLink(
    'Show Grades',
    () => showGrades(inlineGrades),
    0,
  );

  inlineGrades = insertInlineGrades(unloaderContext);
  toggleButtonDisabled(showGradesBtn, inlineGrades);

  const observer = await addAssignmentTableMutationObserver(() => {
    inlineGrades = insertInlineGrades(unloaderContext);
    toggleButtonDisabled(showGradesBtn, inlineGrades);
  });

  unloaderContext.addRemovable(showGradesBtn);
  unloaderContext.addRemovable(showGradesLink);
  unloaderContext.addRemovable(observer);
}

export default registerModule('{0540d147-af76-4f44-a23d-415506e8e777}', {
  name: 'Preview Assignment Grade',
  main: inlineAssignmentGrade,
  description: 'Button to preview grade of graded assignments in main assignments list',
});
