import registerModule from '~/core/module';
import { UnloaderContext } from '~/core/module-loader';

import { createElement, waitForLoad, constructButton } from '~/utils/dom';

import {
  appendMobileAssignmentCenterMenuLink,
  addAssignmentTableMutationObserver,
  getAssignmentData,
} from '~/shared/assignments-center';
import { computeGradePercentage } from '~/shared/progress';

const filterUngraded = (label: HTMLElement) => {
  return label.textContent === 'Graded';
};
const getIdFromLabel = (label: HTMLElement) => {
  const assignment = label.parentNode.parentNode.parentNode.parentNode;
  const link = assignment.children[2].children[0] as HTMLAnchorElement;
  return link.href.split('/')[6];
};

async function getGrade(id: string) {
  const { pointsEarned, maxPoints, Letter } = await getAssignmentData(id);
  if (pointsEarned) {
    return `${computeGradePercentage(pointsEarned, maxPoints)}%`;
  }
  return Letter;
}

class InlineGrade {

  private label: HTMLElement;
  private id: string;
  private grade: string;
  private hidden: boolean;

  private gradeLabel: HTMLElement;
  private button: HTMLElement;

  constructor(label: HTMLElement) {
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
      this.grade = await getGrade(this.id) || 'No grade';
      this.gradeLabel.textContent = `: ${this.grade}`;
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

async function showGrades(inlineGrades: InlineGrade[]) {
  for (const inlineGrade of inlineGrades) {
    inlineGrade.show();
  }
}

const domQuery = {
  filterStatus: () => document.querySelector('#filter-status'),
  gradedLabels: () => document.querySelectorAll('.label-success'),
};

function insertInlineGrades(unloaderContext: UnloaderContext) {
  const inlineGrades = [];
  const gradedLabels = (Array.from(domQuery.gradedLabels()) as HTMLElement[])
    .filter(filterUngraded);

  for (const label of gradedLabels) {
    const inlineGrade = new InlineGrade(label);
    inlineGrades.push(inlineGrade);
    unloaderContext.addRemovable(inlineGrade);
  }

  return inlineGrades;
}

function toggleButtonDisabled(button: HTMLElement, inlineGrades: InlineGrade[]) {
  if (!inlineGrades.length) {
    button.classList.add('disabled');
  } else {
    button.classList.remove('disabled');
  }
}

async function inlineAssignmentGradeMain(
  opts: InlineAssignmentGradeSuboptions, unloaderContext: UnloaderContext,
) {
  const filterStatusButton = await waitForLoad(domQuery.filterStatus);

  let inlineGrades: InlineGrade[] = [];

  const showGradesBtn = constructButton({
    textContent: 'Preview All Grades',
    id: 'gocp_inline-assignment-grade_button',
    iClassName: 'fa fa-eye',
    onClick: () => showGrades(inlineGrades),
  });
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

interface InlineAssignmentGradeSuboptions {
  showMainbutton: boolean;
}

export default registerModule('{0540d147-af76-4f44-a23d-415506e8e777}', {
  name: 'Preview Assignment Grade',
  main: inlineAssignmentGradeMain,
  description: 'Button to preview grade of graded assignments in main assignments list',
  suboptions: {
    showMainbutton: {
      type: 'boolean',
      name: 'Show "Preview All" Button',
      defaultValue: false,
    },
  },
});
