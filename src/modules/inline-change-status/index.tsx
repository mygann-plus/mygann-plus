import registerModule from '~/core/module';
import { UnloaderContext } from '~/core/module-loader';

import { waitForLoad, insertCss, createElement, waitForOne } from '~/utils/dom';
import {
  addAssignmentTableMutationObserver,
  isTask,
  getAssignmentRows,
} from '~/shared/assignments-center';

import style from './style.css';

const selectors = {
  inlined: style.locals.inlined,
};

function getStatusFromRow(row: HTMLElement) {
  return row.querySelector('[data-heading="Status"] .label').textContent;
}

function getOverdueFromRow(row: HTMLElement) {
  return !!row.querySelector('[data-overdue="true"]');
}

class StatusDropdown {

  private assignmentRow: HTMLElement;
  private status: string;
  private task: boolean;
  private overdue: boolean;

  private select: HTMLSelectElement;

  constructor(assignmentRow: HTMLElement) {
    this.assignmentRow = assignmentRow;
    this.status = getStatusFromRow(assignmentRow);
    this.overdue = getOverdueFromRow(assignmentRow);
    this.task = isTask(assignmentRow);
    this.select = this.createSelect();
  }

  getSelectElement() {
    return this.select;
  }

  remove() {
    this.select.remove();
  }

  private createSelect() {
    const options = this.createOptionElements();

    const select = (
      <select
        onChange={() => this.handleSelectChange()}
        className="form-control"
      >
        { options }
      </select>
    );

    return select as HTMLSelectElement;
  }

  // Refresh select with new options, based on new status
  private refreshSelect() {
    const options = this.createOptionElements();
    this.select.innerHTML = ''; // remove all children
    this.select.append(...options);
  }

  private createOptionElements() {
    const optionNames = ['To Do', 'In\u00a0Progress', 'Completed'];

    if (this.overdue) {
      optionNames.splice(0, 1); // Cannot set to "Todo" if status is overdue
      if (this.status !== 'Overdue') {
        // only remove current status if assignment is overdue, but not set as "Overdue"
        optionNames.splice(optionNames.indexOf(this.status), 1);
      }
    } else {
      optionNames.splice(optionNames.indexOf(this.status), 1); // remove current status
    }

    const options = [
      this.createOptionElement('-- Select --', 'select'),
      this.createOptionElement(optionNames[0], '1'),
    ];

    if (optionNames[1]) {
      options.push(this.createOptionElement(optionNames[1], '2'));
    }
    if (this.task) {
      options.push(this.createOptionElement('Edit Task', 'edit-task'));
    }

    return options;
  }

  private createOptionElement(name: string, value: string) {
    return <option value={value}>{name}</option>;
  }

  handleSelectChange() {
    const { value: newValue } = this.select;

    if (newValue === 'select') { // "-- Select --"
      return;
    } else if (newValue === 'edit-task') {
      this.simulateEditClick();
      this.select.selectedIndex = 0;
      return;
    }
    this.status = this.select.options[this.select.selectedIndex].textContent;
    this.refreshSelect();
    this.simulateDropdownChange(Number(newValue));
  }

  // Click on real (hidden) edit link
  async simulateEditClick() {
    this.getHiddenChangeStatusButton().click();
    const editLink = await waitForLoad(() => (
      this.assignmentRow.querySelector('[data-value="edit-user-task"]') as HTMLElement
    ));
    editLink.click();
  }

  // Change real (hidden) dropdown
  async simulateDropdownChange(index: number) {
    this.getHiddenChangeStatusButton().click();
    const elem = await waitForLoad(() => (
      this.assignmentRow
        .querySelector('.assignment-status-dropdown') as HTMLSelectElement
    ));
    elem.selectedIndex = index;
    elem.dispatchEvent(new Event('change'));
  }

  // Get real/native MyGann change button
  private getHiddenChangeStatusButton() {
    return this.assignmentRow.querySelector('.assignment-status-update') as HTMLElement;
  }

}

function insertChangeStatusDropdowns(unloaderContext: UnloaderContext) {
  const assignmentRows = getAssignmentRows();

  for (const row of assignmentRows) {
    const dropdown = new StatusDropdown(row as HTMLElement);

    const changeStatusColumn = row.querySelector('td:last-child');
    changeStatusColumn.append(dropdown.getSelectElement());
    row.classList.add(selectors.inlined);

    unloaderContext.addRemovable(dropdown);
  }
}

async function inlineChangeStatusMain(opts: void, unloaderContext: UnloaderContext) {
  const styles = insertCss(style.toString());
  unloaderContext.addRemovable(styles);

  await waitForOne(getAssignmentRows);
  insertChangeStatusDropdowns(unloaderContext);

  const observer = await addAssignmentTableMutationObserver(() => {
    insertChangeStatusDropdowns(unloaderContext);
  });
  unloaderContext.addRemovable(observer);
}

export default registerModule('{4155f319-a10b-4e4e-8a10-999a43ef9d19}', {
  name: 'Improved Status Dropdown',
  description: 'Show status dropdown directly in assignment, without having to click on "Change Status" link', // eslint-disable-line max-len
  main: inlineChangeStatusMain,
});
