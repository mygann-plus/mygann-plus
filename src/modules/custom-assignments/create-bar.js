import { nodeListToArray, insertAfter } from '../../utils/dom';
import { formatDate, setDateInputValue, getDateInputValue } from '../../utils/date';
import storage, { reduceArray } from '../../utils/storage';

// TODO: fix bug with date pickers
// TODO: RSS and temp. grid layout warnings

function getClassesList() {
  // todo: work with >2 collumns, mobile layout
  // TODO: deal with crashing issue (fail gracefully?)
  const menu = document.getElementsByClassName('subnav sec-75-bordercolor white-bgc subnav-multicol')[0];
  const getTextFromCol = e => e.children[0].children[0].children[0].innerText;
  const firstCol = nodeListToArray(menu.children[0].children)
    .filter(e => e.tagName !== 'input') // input created by search-classes-menu
    .map(getTextFromCol);
  const secondCol = nodeListToArray(menu.children[1].children).map(getTextFromCol);
  return firstCol.concat(secondCol).map(name => name.split('(')[0]);
}

function parseHTML(html) {
  const tbody = document.createElement('tbody');
  tbody.innerHTML = html;
  return tbody.children[0];
}

function insertBar(html, assignment) {
  const idAttribute = 'data-gocp_custom-assignments_assignment_id';
  if (assignment.id !== null) {
    const assignmentElems = document.getElementById('assignment-center-assignment-items').children;
    for (let i = 0; i < assignmentElems.length; i++) {
      const elem = assignmentElems[i];
      if (parseInt(elem.getAttribute(idAttribute), 10) === assignment.id) {
        insertAfter(elem, parseHTML(html));
        return elem.parentNode.removeChild(elem);
      }
    }
  } else {
    document.getElementById('assignment-center-assignment-items').innerHTML += html;
  }
}

export default function renderAssignmentCreateBar(assignment, renderAssignmentFunction, opts = {}) {

  if (document.getElementById('oes_custom_assignment_bar')) return;
  if (!assignment) {
    assignment = {
      details: '',
      className: '',
      assign: '',
      due: '',
      id: null,
    };
  }

  const datalist = getClassesList().map(course => `<option value="${course}">`);

  /* eslint-disable max-len */

  const html = `
    <tr id="oes_custom_assignment_bar" style="background: ${opts.background || 'lightgreen'};">
      <td data-heading="Class">
        <input 
          type="text" 
          id="oes_cab_class" 
          name="class" 
          value="${assignment.className}" 
          placeholder="Class" 
          list="oes_cab_class_datalist" 
          required 
          style="height: 38px"
        />
        <datalist id="oes_cab_class_datalist" name="Class">
          ${datalist}
        </datalist>
      </td>
      <td data-heading="Type">
        <i style="top: 9px; position: relative;">Private</i>
      </td>
      <td data-heading="Details">
        <input type="text" id="oes_cab_details" name="details" placeholder="Details" value="${assignment.details}" style="height: 38px" />
      </td>
      <td data-heading="Assign">
        <input type="date" id="oes_cab_assign" name="assign" value="${assignment.assign}" />
      </td>
      <td data-heading="Due">
        <input type="date" id="oes_cab_due" name="due" value="${assignment.due}" />
      </td>
      <td data-heading="Status">
        <div class="mt-3">
          <a href="#" class="btn btn-default btn-primary" id="oes_cab_save">Save</a>
        </div>
      </td>
      <td>
        <a href="#" class="btn btn-link" id="oes_custom_assignment_cancel">
          Cancel
        </a>
      </td>
    </tr>
  `;

  /* eslint-enable max-len */

  insertBar(html, assignment);

  // set default values
  const TODAY = formatDate(new Date(), '/', true);
  setDateInputValue(document.getElementById('oes_cab_assign'), TODAY);

  document.getElementById('oes_custom_assignment_cancel').onclick = e => {
    e.preventDefault();
    const bar = document.getElementById('oes_custom_assignment_bar');
    bar.parentNode.removeChild(bar);
    if (assignment.id !== null) {
      // show assignment if editing
      renderAssignmentFunction(assignment);
    }
  };
  document.getElementById('oes_cab_save').onclick = async e => {
    e.preventDefault();
    // TODO: validation
    // document.getElementById('oes_cab_form').reportValidity();

    const assignments = await storage.get('custom-assignments');

    const id = assignment.id === null ?
      (assignments.length > 0 ? assignments[assignments.length - 1].id + 1 : 0) :
      assignment.id;

    const details = document.getElementById('oes_cab_details').value;
    const className = document.getElementById('oes_cab_class').value;
    const assign = getDateInputValue(document.getElementById('oes_cab_assign'));
    let due = getDateInputValue(document.getElementById('oes_cab_due'));

    if (due === 'NaN/NaN/NaN') due = TODAY;

    const newAssignment = {
      id,
      details,
      className,
      assign,
      due,
      status: 'To Do',
    };

    let newSavedAssignments;
    if (assignment.id !== null) { // !== null necessary due to assignment.id = 0
      // if existing assignment, update in array
      newSavedAssignments = reduceArray(assignments, assignment.id, () => newAssignment);
    } else {
      // if new assignment, add to array
      newSavedAssignments = [...assignments, newAssignment];
    }

    storage.set({
      'custom-assignments': newSavedAssignments,
    });
    renderAssignmentFunction(newAssignment);

    const bar = document.getElementById('oes_custom_assignment_bar');
    bar.parentNode.removeChild(bar);


  };
  document.getElementById('oes_cab_class').focus();


}
