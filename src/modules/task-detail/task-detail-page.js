import classNames from 'classnames';

import { fetchApi } from '~/utils/fetch';
import { daysBetween, getAbsoluteToday } from '~/utils/date';
import { createElement, constructButton } from '~/utils/dom';
import { getUserId } from '~/utils/user';
import Dialog from '~/utils/dialog';

import selectors from './task-detail-selectors';
import { getTaskDetail, addOrChangeTaskDetail } from './task-detail-model';

const statuses = {
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

function updateStatus(taskIndex, status) {
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

function getStatus(index) {
  for (const key in statuses) {
    if (statuses[key].index === index) {
      return statuses[key];
    }
  }
}

async function getTaskData(id) {
  const endpoint = `/api/usertask/edit/${id}`;
  const data = await fetchApi(endpoint);
  const courseId = data.SectionId;
  let courseName = 'General Task';
  const { details } = await getTaskDetail(id);

  if (courseId) { // task is set to specific class
    const coursesEndpoint = '/api/datadirect/ParentStudentUserAcademicGroupsGet';
    const coursesQuery = `?userId=${await getUserId()}&persona=2&memberLevel=-1&durationList=`;
    const courses = await fetchApi(coursesEndpoint + coursesQuery);
    const course = courses.find(c => c.sectionid === courseId);
    courseName = course.sectionidentifier;
  }

  return {
    id,
    name: data.ShortDescription,
    status: data.TaskStatus,
    course: courseName,
    due: data.DueDate,
    assigned: data.AssignedDate,
    details,
  };
}

function isPageInserted() {
  return document.querySelector('#original-layout-container');
}

class TaskDetailPage {

  constructor(taskData) {
    this.id = taskData.id;
    this.name = taskData.name;
    this.course = taskData.course;
    this.details = taskData.details;
    this.status = getStatus(taskData.status);
    this.daysDue = daysBetween(new Date(taskData.due), getAbsoluteToday());
    /* eslint-disable prefer-destructuring */
    this.formattedDue = taskData.due.split(' ')[0]; // remove time
    this.formattedAssigned = taskData.assigned.split(' ')[0];
    /* eslint-enable prefer-destructuring */
    this.page = this.generatePage();
  }

  getPage() {
    return this.page;
  }

  changeStatus(e, newStatusIndex) {
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
    this.page.querySelector(`.${selectors.taskDetails}`).textContent = details;
    this.details = details;
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
                      <strong className={selectors.due}>&nbsp;Due: { this.formattedDue }&nbsp;</strong>
                      <span className="muted">|</span>&nbsp;{ this.course }
                    </button>
                    { constructButton('', '', 'fa fa-edit', () => this.openEditDialog(), '', { small: false }) }
                  </div>
                  <div className={selectors.taskDetails}>
                    { this.details }
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
        <div className="col-md-6 bb-page-content-tile-column">
          <section className="bb-tile" id="assignment-status-tile" style="">
            <div className="bb-tile-title">
              <div>
                <h2 className="bb-tile-header">Status</h2>
              </div>
            </div>
            <div className="bb-tile-content">
              <div>
                <div className="bb-tile-content-section" id="assignment-detail-extras">
                  <div>
                    <div className="whiteContainer1" style="background-color:#fff;">
                      <div id="assignment-info-header">
                        <div className={classNames('assignment-detail-header', this.status.className)}>
                          <div className="indicator-parent dropdown">
                            <div
                              className="indicator-field p3formWhite dropdown-toggle assignment-status-button"
                              onClick={ () => this.toggleDropdown() }
                            >
                              <span className="caret"></span>
                              <span className="assignment-detail-status-label"> { this.status.name }</span>
                            </div>
                            { this.statusDropdown }
                          </div>
                          <span className="assignment-detail-header-info">
                          {
                            this.daysDue > 0 ?
                            <span>Due in { this.daysDue } Days</span> :
                            <span>Overdue by { Math.abs(this.daysDue) } Days</span>
                          }
                          </span>
                        </div>
                      </div>
                      <div id="assignment-info-textedit" style="display: none;">
                        <div></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
      <div id="outer-lti-region" className="row">
        <div id="box-content" style="height:500px;"></div>
      </div>
    </div>
    );
  }

  generateStatusDropdown() {
    return (
      <ul className={classNames('dropdown-menu', selectors.statusDropdown)} id="status-dropdown">
        <li className="status-needs-action">
          <a className="assignment-status-link" href="#" onClick={e => this.changeStatus(e, -1)}>To Do</a>
        </li>
        <li className="status-in-progress">
          <a className="assignment-status-link" href="#" onClick={e => this.changeStatus(e, 0)}>In Progress</a>
        </li>
        <li className="status-completed">
          <a className="assignment-status-link" href="#" onClick={e => this.changeStatus(e, 1)}>Completed</a>
        </li>
      </ul>
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

export default async function insertPage(siteMain) {
  let id = window.location.hash.split('taskdetail/')[1];
  if (id[id.length] === '/') {
    id.substring(0, id.length - 2);
  }
  const taskData = await getTaskData(id);
  const taskDetailPage = new TaskDetailPage(taskData);

  if (isPageInserted()) {
    return;
  }

  siteMain.appendChild(taskDetailPage.getPage());
  return taskDetailPage.getPage();
}
