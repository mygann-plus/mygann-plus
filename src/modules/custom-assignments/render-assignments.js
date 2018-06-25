import { nodeListToArray, insertBefore } from '../../utils/dom';
import getSortFnFromTable from './sort';
import storage, { reduceArray } from '../../utils/storage';
import renderAssignmentCreateBar from './create-bar';
import filterAssignment from './filter';

// TODO: move to storage
async function deleteAssignment(id) {
  const assignments = await storage.get('custom-assignments');
  const newAssignments = assignments.filter(assignment => (
    assignment.id !== id
  ));
  storage.set({
    'custom-assignments': newAssignments,
  });
}

function createOptionElem(name, val) {
  const e = document.createElement('option');
  e.value = val;
  e.innerHTML = name;
  return e;
}

function renderDropdown(status, handleChange) {
  const allOptionNames = ['To Do', 'In Progress', 'Completed'];
  const optionNames = Object.assign([], allOptionNames);
  // see if first letters are the same. there was an issue with &nbsp; characters
  optionNames.splice(allOptionNames.map(n => n[0]).indexOf(status[0]), 1);
  const divider = document.createElement('option');
  divider.disabled = true;
  divider.innerHTML = '──────────';
  const optionElems = [
    createOptionElem('-- Select --', 'select'),
    createOptionElem(optionNames[0], optionNames[0]),
    createOptionElem(optionNames[1], optionNames[1]),
    divider,
    createOptionElem('Edit', 'edit'),
    createOptionElem('Delete', 'delete'),
  ];
  const select = document.createElement('select');
  select.className = 'form-control';
  select.addEventListener('change', handleChange);
  optionElems.forEach(e => select.appendChild(e));
  return select;
}

function renderStatusWrap(statusText) {

  const labelClasses = {
    'To Do': 'todo',
    'In Progress': 'warning',
    Completed: 'success',
  };

  const statusWrap = document.createElement('div');
  const statusDiv = document.createElement('div');
  const statusLabel = document.createElement('div');
  statusWrap.className = 'mt-3';
  statusDiv.className = 'mb-10';
  statusLabel.className = `label label-${labelClasses[statusText]} primary-status`;
  statusLabel.innerText = statusText;
  statusDiv.appendChild(statusLabel);
  statusWrap.appendChild(statusDiv);
  return statusWrap;
}

export default function renderAssignment(assignment) {

  if (!filterAssignment(assignment)) return false;
  if (document.querySelector(`tr[data-gocp_custom-assignments_assignment_id="${assignment.id}"]`)) return false;

  const sortFn = getSortFnFromTable();

  const tdGenerator = (heading, innerHTML) => {
    const td = document.createElement('td');
    td.innerHTML = innerHTML;
    td.setAttribute('data-heading', heading);
    return td;
  };

  async function handleDropdownChange(e) {
    const { value } = e.target;

    const wrapElem = e.target.parentNode.parentNode;
    const dropdownElem = wrapElem.children[6];
    const statusElem = wrapElem.children[5];

    switch (value) {
      case 'edit':
        renderAssignmentCreateBar(assignment, renderAssignment, {
          background: 'blanchedalmond',
        });
        break;
      case 'delete':
        if (window.confirm('Are you sure you want to delete this assignment?')) { // eslint-disable-line max-len, no-alert
          deleteAssignment(assignment.id);
          wrapElem.parentNode.removeChild(wrapElem);
        } else {
          e.preventDefault(); // prevent switching to "delete" option
        }
        break;
      default: // status change
        // update label
        statusElem.removeChild(statusElem.children[0]);
        statusElem.appendChild(renderStatusWrap(value));
        // update dropdown
        dropdownElem.removeChild(dropdownElem.children[0]);
        dropdownElem.appendChild(renderDropdown(value, handleDropdownChange));
        // save change
        const assignments = await storage.get('custom-assignments');
        const newAssignments = reduceArray(assignments, assignment.id, a => Object.assign({}, a, {
          status: value,
        }));
        storage.set({
          'custom-assignments': newAssignments,
        });
    }

  }

  const wrap = document.createElement('tr');
  const course = tdGenerator('Class', assignment.className);
  const type = tdGenerator('Type', '<i>Private</i>');
  const details = tdGenerator('Details', assignment.details);
  const assign = tdGenerator('Assign', assignment.assign);
  const due = tdGenerator('Due', assignment.due);
  const status = tdGenerator('Status', '');
  const dropdownWrap = document.createElement('td');
  const dropdown = renderDropdown(assignment.status, handleDropdownChange);

  wrap.setAttribute('data-gocp_custom-assignments_assignment_id', assignment.id);
  wrap.className = 'gocp_custom-assignment_assignment';

  status.appendChild(renderStatusWrap(assignment.status));
  dropdownWrap.appendChild(dropdown);
  wrap.appendChild(course);
  wrap.appendChild(type);
  wrap.appendChild(details);
  wrap.appendChild(assign);
  wrap.appendChild(due);
  wrap.appendChild(status);
  wrap.appendChild(dropdownWrap);

  const assignmentElems = nodeListToArray(document.getElementById('assignment-center-assignment-items').children)
    .filter(e => e.tagName.toLowerCase() !== 'form');

  for (let i = 0; i < assignmentElems.length; i++) {
    if (sortFn(assignment, assignmentElems[i]) > 0) {
      return insertBefore(assignmentElems[i], wrap);
    } else if (i + 1 === assignmentElems.length) {
      return document.getElementById('assignment-center-assignment-items').appendChild(wrap);
    }
  }

  // tell main renderSavedAssignment that this assignment did render
  return true;

}
