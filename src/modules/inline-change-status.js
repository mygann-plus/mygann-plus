import { waitForLoad, registerListeners, getElementsByIds, getUnloadedElementsByIds } from '../utils/dom';

function simulateDropdownChange(elemIndex, index) {
  document.getElementsByClassName('btn btn-link assignment-status-update')[elemIndex]
    .parentNode.children[0].click();
  setTimeout(() => {
    const elem = document.getElementsByClassName('btn btn-link assignment-status-update')[elemIndex]
      .parentNode.children[1].children[2].children[0].children[1].children[0];
    elem.selectedIndex = index;
    elem.dispatchEvent(new Event('change'));
  }, 200);

}

function createOptionElem(name, val) {
  const e = document.createElement('option');
  e.value = val;
  e.innerHTML = name;
  return e;
}

function createDropdown(parentNode, controller, index, prevDropdown, preVal) {
  const existingValue = preVal || document.getElementsByClassName('btn btn-link assignment-status-update')[index].parentNode.parentNode.children[5].innerText.trim();
  const selectElem = document.createElement('select');
  const allOptionNames = ['To Do', 'In Progress', 'Completed'];
  const optionNames = Object.assign([], allOptionNames);
  // see if first letters are the same. there was an issue with &nbsp; characters
  optionNames.splice(allOptionNames.map(n => n[0]).indexOf(existingValue[0]), 1);
  const optionElems = [
    createOptionElem('-- Select --', '0'),
    createOptionElem(optionNames[0], '1'),
    createOptionElem(optionNames[1], '2'),
  ];
  optionElems.forEach(o => selectElem.appendChild(o));
  selectElem.onchange = e => {
    if (selectElem.value == 0) { // eslint-disable-line eqeqeq
      e.preventDefault();
      return;
    }
    simulateDropdownChange(index, selectElem.value);
    createDropdown(parentNode, controller, index, e.target, optionNames[selectElem.value - 1]);
  };
  selectElem.className = 'form-control';
  if (prevDropdown) {
    parentNode.removeChild(prevDropdown); // remove the outdated dropdown, if it exists. this will be called after value change -> rerender
  }
  parentNode.appendChild(selectElem);
}

function replaceButtons() {
  [].map.call(document.getElementsByClassName('btn btn-link assignment-status-update'), (button, i) => {
    button.style.display = 'none';
    createDropdown(button.parentNode, button, i);
  });
}

function enableModule() {
  waitForLoad(() => {
    return document.getElementById('assignment-center-assignment-items') &&
           document.getElementById('assignment-center-assignment-items').children.length;
  })
    .then(replaceButtons);
}

export default function() {
  enableModule();
  registerListeners(
    () => (
      getElementsByIds([
        'previous-button',
        'next-button',
        'button-today',
        'day-view',
        'week-view',
        'month-view',
        'filter-status',
        'filter-student-sections',
        'gocp-toggle-completed',
      ])),
    enableModule,
  );
}
