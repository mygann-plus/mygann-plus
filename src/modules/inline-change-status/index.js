import registerModule from '~/utils/module';
import { waitForLoad, insertCss, createElementFromHTML } from '~/utils/dom';

import style from './style.css';

function simulateDropdownChange(elemIndex, index) {
  document.querySelectorAll('.assignment-status-update')[elemIndex].parentNode.children[0].click();
  setTimeout(() => {
    const elem = document.querySelectorAll('.assignment-status-update')[elemIndex].parentNode
      .querySelector(`
        *:nth-child(2) > :nth-child(3) > :first-child > :nth-child(2) > :first-child
      `);
    elem.selectedIndex = index;
    elem.dispatchEvent(new Event('change'));
  }, 0);

}

function createOptionElem(name, val) {
  const html = `<option value="${val}">${name}</option>`;
  return createElementFromHTML(html);
}

function createDropdown(parentNode, controller, index, preVal) {
  const existingValue = preVal || document.getElementsByClassName('assignment-status-update')[index].parentNode.parentNode.children[5].textContent.trim();
  const selectElem = document.createElement('select');
  const optionNames = ['To Do', 'In Progress', 'Completed'];
  optionNames.splice(optionNames.map(n => n.trim()).indexOf(existingValue), 1);

  const optionElems = [
    createOptionElem('-- Select --', '0'),
    createOptionElem(optionNames[0], '1'),
    createOptionElem(optionNames[1], '2'),
  ];

  optionElems.forEach(o => selectElem.appendChild(o));
  selectElem.onchange = e => {
    if (selectElem.value === '0') {
      e.preventDefault();
      return;
    }
    selectElem.remove();
    createDropdown(parentNode, controller, index, optionNames[selectElem.value - 1]);
    simulateDropdownChange(index, selectElem.value);
  };
  selectElem.className = 'form-control';

  parentNode.appendChild(selectElem);
}

function replaceLinks() {
  const links = Array.from(document.getElementsByClassName('assignment-status-update'));
  links.forEach((button, i) => {
    button.style.display = 'none';
    createDropdown(button.parentNode, button, i);
  });
}

function addMutationObserver() {
  const table = document.querySelector('#assignment-center-assignment-items');
  const observer = new MutationObserver(replaceLinks);
  observer.observe(table, {
    childList: true,
  });
}

const domQuery = () => document.querySelector('#assignment-center-assignment-items *');

async function inlineChangeStatus() {
  insertCss(style.toString());
  await waitForLoad(domQuery);
  replaceLinks();
  addMutationObserver();
}

export default registerModule('Inline Change Status', inlineChangeStatus);

