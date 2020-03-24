import classNames from 'classnames';

import { fetchApi } from '~/utils/fetch';
import { daysBetween, getAbsoluteToday } from '~/utils/date';
import { createElement, constructButton } from '~/utils/dom';
import Dialog from '~/utils/dialog';
import { getTaskData } from '~/shared/assignments-center';

import selectors from './task-detail-selectors';
import { getTaskDetail, addOrChangeTaskDetail } from './task-detail-model';

// Full task data, including details and native OnCampus data
interface TaskData {
  details: string;
  id: string;
  name: string;
  status: number;
  course: string;
  due: string;
  assigned: string;
}

interface Status {
  name: string;
  index: number;
  className: string;
}

const statuses: { [key: string]: Status } = {
  TODO: {
    index: -1,
    className: 'todo',
    name: 'To Do',
  },
  IN_PROGRESS: {
    index: 0,
    className: 'inprogress',
    name: 'In Progress',
  },
  COMPLETED: {
    index: 1,
    className: 'completed',
    name: 'Completed',
  },
};


function updateStatus(taskIndex: string, status: number) {
  const endpoint = '/api/assignment2/assignmentstatusupdate';
  const query = `?format=json&assignmentIndexId=${taskIndex}&assignmentStatus=${status}`;
  const body = {
    assignmentIndexId: taskIndex,
    assignmentStatus: status,
    userTaskInd: true,
  };
  return fetchApi(endpoint + query, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

function getStatus(index: number) {
  for (const key in statuses) {
    if (statuses[key].index === index) {
      return statuses[key];
    }
  }
}

// includes details
async function getFullTaskData(id: string) {
  const data = await getTaskData(id);
  const { details } = await getTaskDetail(id);
  return {
    ...data,
    details,
  };
}

function isPageInserted() {
  return document.querySelector('#original-layout-container');
}

class TaskDetailPage {

  private id: string;
  private name: string;
  private course: string;
  private details: string;
  private status: Status;
  private daysDue: number;
  private formattedDue: string;
  private formattedAssigned: string;

  private page: HTMLElement;
  private statusDropdown: HTMLElement;
  private editDialog: Dialog;

  constructor(taskData: TaskData) {
    this.id = taskData.id;
    this.name = taskData.name;
    this.course = taskData.course;
    this.details = taskData.details;
    this.status = getStatus(taskData.status);
    this.daysDue = daysBetween(new Date(taskData.due).valueOf(), getAbsoluteToday().valueOf());
    /* eslint-disable prefer-destructuring */
    this.formattedDue = taskData.due.split(' ')[0]; // remove time
    this.formattedAssigned = taskData.assigned.split(' ')[0];
    /* eslint-enable prefer-destructuring */
    this.page = this.generatePage();
  }

  getPage() {
    return this.page;
  }

  changeStatus(e: Event, newStatusIndex: number) {
    e.preventDefault();
    updateStatus(this.id, newStatusIndex);
    const newStatus = getStatus(newStatusIndex);
    const newClassName = classNames('assignment-detail-header', newStatus.className);
    document.querySelector('#assignment-info-header > :first-child').className = newClassName;
    document.querySelector('.assignment-detail-status-label').textContent = ` ${newStatus.name}`;
    this.toggleDropdown();
  }

  toggleDropdown() {
    this.statusDropdown.classList.toggle(selectors.visibleStatusDropdown);
  }

  openEditDialog() {
    this.editDialog = new Dialog('Edit Task Description', this.generateEditDialogBody(), {
      leftButtons: [{
        name: 'Save',
        primary: true,
        onClick: () => this.saveNewDetails(),
      }],
    });
    this.editDialog.open();
    this.editDialog.getBody().querySelector('textarea').focus();
  }

  saveNewDetails() {
    const dialogBody = this.editDialog.getBody();
    const details = dialogBody.querySelector('textarea').value;
    addOrChangeTaskDetail(this.id, { id: this.id, details });
    this.details = details;
    this.page.querySelector(`.${selectors.taskDetails}`).innerHTML = this.generateDetailsHtml().innerHTML;
  }

  generatePage() {
    this.statusDropdown = this.generateStatusDropdown();
    return (
      <div>
      <div
        className="btn btn-link"
        id="BackButton"
      >
        <a href="#studentmyday/assignment-center">&lt; Back</a>
      </div>
      <div className="row" id="original-layout-container">
        <div id="assignment-detail-assignment" className="col-md-6 bb-page-content-tile-column">
          <div>
            <section className="bb-tile">
              <div className="bb-tile-title">
                <div>
                  <h2 className="bb-tile-header">Assignment detail</h2>
                </div>
              </div>
              <div className="bb-tile-content">
                <div className="bb-tile-content-section">
                  <h4 className={selectors.taskName}>{ this.name }</h4>
                  <div className="btn-group">
                    <button className="btn disabled" style={{ marginRight: '10px' }}>
                      Assigned: { this.formattedAssigned }&nbsp;
                      <span className="muted">|</span>
                      <strong className={selectors.due}>
                        &nbsp;Due: { this.formattedDue }&nbsp;
                      </strong>
                      <span className="muted">|</span>&nbsp;{ this.course }
                    </button>
                    {
                      constructButton({
                        iClassName: 'fa fa-edit',
                        onClick: () => this.openEditDialog(),
                        small: false,
                      })
                    }
                  </div>
                  <div className={selectors.taskDetails}>
                    { this.generateDetailsHtml() }
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
        <div className="col-md-6 bb-page-content-tile-column">
          <section className="bb-tile" id="assignment-status-tile">
            <div className="bb-tile-title">
              <div>
                <h2 className="bb-tile-header">Status</h2>
              </div>
            </div>
            <div className="bb-tile-content">
              <div>
                <div className="bb-tile-content-section" id="assignment-detail-extras">
                  <div>
                    <div className="whiteContainer1" style={{ backgroundColor: '#fff' }}>
                      <div id="assignment-info-header">
                        <div
                          className={classNames('assignment-detail-header', this.status.className)}
                        >
                          <div className="indicator-parent dropdown">
                            <div
                              className="indicator-field p3formWhite dropdown-toggle assignment-status-button"
                              onClick={ () => this.toggleDropdown() }
                            >
                              <span className="caret"></span>
                              <span className="assignment-detail-status-label">
                                { this.status.name }
                              </span>
                            </div>
                            { this.statusDropdown }
                          </div>
                          <span className="assignment-detail-header-info">
                          {
                            this.daysDue > 0
                              ? <span>Due in { this.daysDue } Days</span>
                              : <span>Overdue by { Math.abs(this.daysDue) } Days</span>
                          }
                          </span>
                        </div>
                      </div>
                      <div id="assignment-info-textedit" style={{ display: 'none' }}>
                        <div></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
        <div id="evaluation-tile"></div> {/* Empty div for checkpoint positioning */}
      </div>
      <div id="outer-lti-region" className="row">
        <div id="box-content" style={{ height: '500px' }}></div>
      </div>
    </div>
    );
  }

  generateStatusDropdown() {
    return (
      <ul className={classNames('dropdown-menu', selectors.statusDropdown)} id="status-dropdown">
        <li className="status-needs-action">
          <a className="assignment-status-link" href="#" onClick={(e: any) => this.changeStatus(e, -1)}>To Do</a>
        </li>
        <li className="status-in-progress">
          <a className="assignment-status-link" href="#" onClick={(e: any) => this.changeStatus(e, 0)}>In Progress</a>
        </li>
        <li className="status-completed">
          <a className="assignment-status-link" href="#" onClick={(e: any) => this.changeStatus(e, 1)}>Completed</a>
        </li>
      </ul>
    );
  }

  generateDetailsHtml() {
    return (
      <span>
        {
          this.details.split(/(?:\r\n|\r|\n)/g).map(line => (
            <span>{ line }<br></br></span>
          ))
        }
      </span>
    );
  }

  generateEditDialogBody() {
    return (
      <div className={ selectors.editDescriptionWrap }>
        <textarea>
          { this.details }
        </textarea>
      </div>
    );
  }

}

export default async function insertPage(siteMain: HTMLElement) {
  const [, id] = window.location.hash.match(/#taskdetail\/([0-9]+)/);
  const taskData = await getFullTaskData(id);
  const taskDetailPage = new TaskDetailPage(taskData);

  if (isPageInserted()) {
    return;
  }

  siteMain.appendChild(taskDetailPage.getPage());
  return taskDetailPage.getPage();
}
