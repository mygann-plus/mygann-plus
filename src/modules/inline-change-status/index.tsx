import classNames from 'classnames';

import registerModule from '~/core/module';
import { UnloaderContext } from '~/core/module-loader';

import { waitForLoad, insertCss, createElement } from '~/utils/dom';
import { addAssignmentTableMutationObserver, isTask } from '~/shared/assignments-center';

import style from './style.css';

const selectors = {
  inlined: style.locals.inlined,
  dropdown: 'gocp_inline-change-status_dropdown',
};

async function simulateEditClick(elemIndex: number) {
  const statusBtn = document.querySelectorAll('.assignment-status-update')[elemIndex].parentNode.children[0] as HTMLElement;
  statusBtn.click();
  const elem = await waitForLoad(() => (
    document.querySelectorAll('.assignment-status-update')[elemIndex].parentNode
      .querySelector(`
        *:nth-child(2) > :nth-child(3) > :first-child .btn
      `)
  ));
  if (!elem) {
    return setTimeout(() => simulateEditClick(elemIndex));
  }
  (elem as HTMLElement).click();
}

async function simulateDropdownChange(elemIndex: number, index: number) {
  (document.querySelectorAll('.assignment-status-update')[elemIndex].parentNode.children[0] as HTMLElement).click();
  const elem = await waitForLoad(() => (
    document.querySelectorAll('.assignment-status-update')[elemIndex].parentNode
      .querySelector(`
        *:nth-child(2) > :nth-child(3) > :first-child > :nth-child(2) > :first-child
      `) as HTMLSelectElement
  ));
  if (!elem) {
    return setTimeout(() => simulateDropdownChange(elemIndex, index));
  }
  elem.selectedIndex = index;
  elem.dispatchEvent(new Event('change'));
}

function createOptionElem(name: string, val: string) {
  return <option value={val}>{name}</option>;
}

function createDropdown(
  parentNode: HTMLElement,
  controller: any,
  index: number,
  preVal: string,
  task: boolean,
) {
  const existingValue = (
    preVal
    || document
      .querySelectorAll('.assignment-status-update')[index]
      .parentNode.parentNode.children[5].textContent.trim()
  );
  const isOverdue = (parentNode.querySelector('button.btn-link') as HTMLElement).dataset.overdue === 'true';
  // MyGann natively uses non breaking spaces for ONLY in progress labels
  const optionNames = ['To Do', 'In\u00a0Progress', 'Completed'];
  if (isOverdue) {
    optionNames.splice(0, 1);
    if (existingValue !== 'Overdue') {
      optionNames.splice(optionNames.indexOf(existingValue), 1);
    }
  } else {
    optionNames.splice(optionNames.indexOf(existingValue), 1);
  }

  const optionElems = [
    createOptionElem('-- Select --', '0'),
    createOptionElem(optionNames[0], '1'),
  ];
  if (optionNames[1]) {
    optionElems.push(createOptionElem(optionNames[1], '2'));
  }
  if (task) {
    optionElems.push(createOptionElem('Edit Task', '10'));
  }
  const handleSelectChange = (e: Event) => {
    const selectElem = e.target as HTMLSelectElement;
    if (selectElem.value === '0') {
      return;
    } else if (selectElem.value === '10') {
      simulateEditClick(index);
      selectElem.selectedIndex = 0;
      return;
    }
    selectElem.remove();
    createDropdown(parentNode, controller, index, optionNames[Number(selectElem.value) - 1], task);
    simulateDropdownChange(index, Number(selectElem.value));
  };

  const selectElem = (
    <select
      onChange={(e: any) => handleSelectChange(e)}
      className={ classNames('form-control', selectors.dropdown) }
    >
      { optionElems }
    </select>
  );

  parentNode.appendChild(selectElem);
}

function replaceLinks() {
  const links = Array.from(document.getElementsByClassName('assignment-status-update'));
  links.forEach((button, i) => {
    const assignmentRow = button.parentNode.parentNode as HTMLElement;
    assignmentRow.classList.add(selectors.inlined);
    createDropdown(button.parentNode as HTMLElement, button, i, null, isTask(assignmentRow));
  });
}

const domQuery = () => document.querySelector('#assignment-center-assignment-items *');

async function inlineChangeStatusMain(opts: void, unloaderContext: UnloaderContext) {
  const styles = insertCss(style.toString());
  unloaderContext.addRemovable(styles);

  await waitForLoad(domQuery);
  replaceLinks();

  const observer = await addAssignmentTableMutationObserver(replaceLinks);
  unloaderContext.addRemovable(observer);
}

function unloadInlineChangeStatus() {
  for (const inlineLink of document.querySelectorAll(`.${selectors.inlined}`)) {
    inlineLink.classList.remove(selectors.inlined);
  }
  for (const dropdown of document.querySelectorAll(`.${selectors.dropdown}`)) {
    dropdown.remove();
  }
}

export default registerModule('{4155f319-a10b-4e4e-8a10-999a43ef9d19}', {
  name: 'Improved Status Dropdown',
  description: 'Show status dropdown directly in assignment, without having to click on "Change Status" link', // eslint-disable-line max-len
  main: inlineChangeStatusMain,
  unload: unloadInlineChangeStatus,
});
