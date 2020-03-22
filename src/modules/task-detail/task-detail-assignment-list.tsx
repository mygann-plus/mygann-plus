import { UnloaderContext, isModuleLoaded } from '~/core/module-loader';


import { createElement, waitForLoad, addEventListener } from '~/utils/dom';
import { fetchApi } from '~/utils/fetch';

import assignmentCheckpoints from '../assignment-checkpoints';

import { getTaskDetail, addOrChangeTaskDetail } from './task-detail-model';
import selectors from './task-detail-selectors';

const domQuery = {
  tasks: () => document.querySelectorAll('[data-user-task-ind="true"]'),
  assignmentList: () => document.querySelector('#assignment-center-list-view'),
  addTaskButton: () => document.querySelector('#add-task'),
  addTaskForm: () => document.querySelector('.modal-content .form-group'),
  shortDescription: () => document.querySelector('[name="ShortDescription"]') as HTMLInputElement,
};

async function hasSavedDetails(taskId: string) {
  const data = await getTaskDetail(taskId);
  return data && data.details;
}

export async function addTaskLinks(unloaderContext: UnloaderContext) {
  await waitForLoad(() => domQuery.tasks().length);

  const tasks = Array.from(domQuery.tasks())
    .map(statusLink => statusLink.parentNode.parentNode);

  if (isModuleLoaded(assignmentCheckpoints)) {
    return;
  }

  for (const task of tasks) {
    const detailsCol = task.querySelector('[data-heading="Details"]');
    const shortDetails = detailsCol.textContent;
    const { id } = (task.querySelector('.assignment-status-update') as HTMLElement).dataset;

    if (!(await hasSavedDetails(id))) {
      continue;
    }
    const link = <a href={`#taskdetail/${id}`}>{ shortDetails }</a>;
    detailsCol.textContent = '';
    detailsCol.appendChild(link);

    unloaderContext.addFunction(() => {
      link.remove();
      detailsCol.textContent = shortDetails;
    });
  }
}

async function getAllTasks() {
  const endpoint = '/api/DataDirect/AssignmentCenterAssignments/';
  const query = `?format=json&filter=2&dateStart=9/17/2018&dateEnd=${new Date().toLocaleDateString('en-US')}&persona=2&statusList=&sectionList=`;
  const data = await fetchApi(endpoint + query);
  return data.filter((item: any) => item.user_task_ind);
}

async function insertDetailsInput(e: Event) {
  await waitForLoad(domQuery.addTaskForm);
  const controls = document.querySelectorAll('.modal-content .form-group');

  let { id } = (e.target as HTMLElement).dataset;
  let existingTasks: any[];
  if (!id) { // adding new task
    existingTasks = await getAllTasks();
  }
  const taskDetailsObj = await getTaskDetail(id);
  const details = taskDetailsObj ? taskDetailsObj.details : '';

  if (document.querySelector(`#${selectors.descriptionInput}`)) {
    return;
  }

  const descriptionControl = (
    <div className="form-group" id={selectors.descriptionInput}>
      <label className="control-label">Description</label>
      <div className="controls">
        <textarea className="form-control">
          { details }
        </textarea>
      </div>
    </div>
  );

  controls[1].after(descriptionControl);
  const saveButton = document.querySelector('button[data-action="save"]');
  saveButton.addEventListener('click', async () => {
    const taskName = domQuery.shortDescription().value;
    const updatedDetails = descriptionControl.querySelector('textarea').value;

    if (!id) { // adding new task
      const newTasks = await getAllTasks();
      const createdTask = newTasks.find((t: any) => (
        !existingTasks.find(task => task.assignment_id === t.assignment_id)
        && t.short_description === taskName
      ));
      id = String(createdTask.assignment_id);
    }

    addOrChangeTaskDetail(id, {
      id,
      details: updatedDetails,
    });
  });
}

export async function addDetailsInputListener(unloaderContext: UnloaderContext) {
  const assignmentList = await waitForLoad(domQuery.assignmentList);
  const addTaskButton = await waitForLoad(domQuery.addTaskButton);
  const editTaskListener = addEventListener(assignmentList, 'click', e => {
    if ((e.target as HTMLElement).dataset.value === 'edit-user-task') {
      insertDetailsInput(e);
    }
  });
  const addTaskListener = addEventListener(addTaskButton, 'click', insertDetailsInput);

  unloaderContext.addRemovable(editTaskListener);
  unloaderContext.addRemovable(addTaskListener);
}
