import registerModule from '~/module';

import { createElement, waitForLoad, constructButton } from '~/utils/dom';

import {
  appendMobileAssignmentCenterMenuLink,
  addAssignmentTableMutationObserver,
  getAssignmentData,
} from '~/shared/assignments-center';
import { computeGradePercentage } from '~/shared/progress';

const filterUngraded = label => {
  return label.textContent === 'Graded';
};
const getIdFromLabel = label => {
  const assignment = label.parentNode.parentNode.parentNode.parentNode;
  return assignment.children[2].children[0].href.split('/')[6];
};

async function getGrade(id) {
  const { pointsEarned, maxPoints } = await getAssignmentData(id);
  return computeGradePercentage(pointsEarned, maxPoints);
}

class InlineGrade {

  constructor(label) {
    this.label = label;
    this.id = getIdFromLabel(label);
    this.grade = null;
    this.hidden = true;

    this.gradeLabel = <span></span>;
    this.button = (
      <i
        className="fa fa-eye"
        onClick={ () => this.toggle() }
        style={{ marginLeft: '10px', cursor: 'pointer' }}
      />
    );

    this.label.appendChild(this.gradeLabel);
    this.label.appendChild(this.button);
  }

  toggle() {
    if (this.hidden) {
      this.show();
    } else {
      this.hide();
    }
  }

  async show() {
    this.hidden = false;
    if (!this.grade) {
      this.grade = await getGrade(this.id);
      this.gradeLabel.textContent = `: ${this.grade}%`;
    }
    this.gradeLabel.style.display = 'inline-block';
    this.button.className = 'fa fa-eye-slash';
  }

  hide() {
    this.hidden = true;
    this.gradeLabel.style.display = 'none';
    this.button.className = 'fa fa-eye';
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
    'Preview All Grades',
    'gocp_inline-assignment-grade_button',
    'fa fa-eye',
    () => showGrades(inlineGrades),
  );
  if (opts.showMainbutton) {
    filterStatusButton.parentNode.appendChild(showGradesBtn);
  }

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
  suboptions: {
    showMainbutton: {
      type: 'boolean',
      name: 'Show "Preview All" Button',
      defaultValue: false,
    },
  },
});
