import storage from '../../utils/storage';
import registerModule from '../../utils/module';
import { waitForLoad, constructButton, removeElement } from '../../utils/dom';

import addListeners from './listeners';
import renderAssignment from './render-assignments';
import renderAssignmentCreateBar from './create-bar';

function removeNoAssignmentsLabel() {
  const noAssignmentText = 'There are no assignments to display.';

  const tableBody = document.getElementById('assignment-center-assignment-items');
  const firstAssignment = tableBody.children[0];
  if (firstAssignment && firstAssignment.children[2].innerText === noAssignmentText) {
    removeElement(firstAssignment);
  }
}

async function renderSavedAssignments() {
  if (document.getElementsByClassName('gocp_custom-assignment_assignment').length) return;
  const assignments = await storage.get('custom-assignments');
  if (assignments.length) {
    const someAssignmentsRendered = assignments.some(renderAssignment);
    if (someAssignmentsRendered) {
      removeNoAssignmentsLabel();
    }
  }
}
async function addAssignment() {
  renderAssignmentCreateBar(null, assignment => {
    renderAssignment(assignment);
    removeNoAssignmentsLabel();
  });
}

async function showButton() {
  const button = constructButton(
    ' Add Private Assignment',
    'add-assignment',
    'fa fa-plus',
    addAssignment,
  );
  document.getElementsByClassName('pull-right assignment-calendar-button-bar')[0].prepend(button);
}

async function initializeData() {
  const data = await storage.get('custom-assignments');
  if (!data) {
    storage.set({ 'custom-assignments': [] });
  }
}

const domQuery = {
  button: () => (
    document.getElementsByClassName('pull-right assignment-calendar-button-bar')[0] &&
    !document.getElementById('add-assignment')
  ),
  list: () => (
    document.getElementById('assignment-center-assignment-items')
    && document.getElementById('assignment-center-assignment-items').children.length
  ),
  listeners: () => (
    document.getElementsByClassName('hidden-lg text-center bb-section-heading').length
  ),
};

function customAssignment() {
  initializeData();
  waitForLoad(domQuery.button).then(showButton);
  waitForLoad(domQuery.list).then(renderSavedAssignments);
  waitForLoad(domQuery.listeners).then(() => addListeners(renderSavedAssignments));
}

export default registerModule('Custom Assignments', customAssignment);
