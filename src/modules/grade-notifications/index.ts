import registerModule from '~/core/module';
import { UnloaderContext } from '~/core/module-loader';

import { insertCss } from '~/utils/dom';
import { fetchApi } from '~/utils/fetch';
import { getAssignmentData } from '~/shared/assignments-center';

import {
  getLastChecked,
  setLastChecked,
  getClearedNotifications,
  addClearedNotification,
} from './grade-notifications-model';
import {
  showGradedNotificationBubble,
  removeGradeNotificationBubble,
} from './grade-notifications-bubble';
import showNewGradedButton, { removeNewGradedButton } from './grade-notifications-progress';

import style from './style.css';

let newGradedAssignments: any[] = [];
let lastFetchedAssignments: Date;

async function clearAllNotifications() {
  // const today = new Date();
  const nowDateTime = `${lastFetchedAssignments.toLocaleDateString('en-US')} ${lastFetchedAssignments.toLocaleTimeString()}`;
  newGradedAssignments = [];
  setLastChecked(nowDateTime);
  removeGradeNotificationBubble();
  removeNewGradedButton();
}

function clearNotification(assignmentId: string, unloaderContext: UnloaderContext) {
  addClearedNotification(assignmentId);
  newGradedAssignments = newGradedAssignments.filter(assignment => {
    return assignment.AssignmentId !== assignmentId;
  });
  showGradedNotificationBubble(newGradedAssignments, unloaderContext);
  removeNewGradedButton();
  showNewGradedButton(
    newGradedAssignments,
    unloaderContext,
    clearAllNotifications,
    id => clearNotification(id, unloaderContext),
  );
}

// unique endpoint used to get grade published status
async function getFullAssignmentData(assignment: any) {
  const publishedEndpoint = `/api/assignment2/read/${assignment.assignment_id}/?format=json`;
  const publishedData = await fetchApi(publishedEndpoint);
  const data = await getAssignmentData(assignment.assignment_index_id);
  return {
    ...data,
    ...publishedData,
  };
}

/**
 * @returns {Object[]} Array of grade data objects
 */
async function getNewGradedAssignments(
  lastChecked: string,
  clearedNotifications: any[],
  pointsThreshold: number,
) {
  const startDate = '9/17/2018'; // NOTE\: better, generally - how was this "TODO"?
  const endDate = new Date().toLocaleDateString('en-US');

  const endpoint = '/api/DataDirect/AssignmentCenterAssignments/';
  const query = `?format=json&filter=2&dateStart=${startDate}&dateEnd=${endDate}&persona=2&statusList=4`;

  const assignments = await fetchApi(endpoint + query);
  lastFetchedAssignments = new Date();

  const assignmentsData = await Promise.all(assignments
    .map((assignment: any) => getFullAssignmentData(assignment)));

  return assignmentsData.filter((assignment: any) => {
    if (clearedNotifications.includes(assignment.AssignmentId)) {
      return false;
    }

    const gradedDate = new Date(assignment.gradedDate);
    const passesThreshold = assignment.maxPoints >= pointsThreshold;
    const published = assignment.PublishGrade === true;
    return gradedDate.getTime() > new Date(lastChecked).getTime() && passesThreshold && published;
  });
}

async function gradeNotificationsMain(
  suboptions: GradeNotificationsSuboptions,
  unloaderContext: UnloaderContext,
) {
  const styles = insertCss(style.toString());
  unloaderContext.addRemovable(styles);

  if (window.location.hash.startsWith('#studentmyday')) {
    showGradedNotificationBubble(newGradedAssignments, unloaderContext);
    const lastChecked = await getLastChecked();
    const clearedNotifications = await getClearedNotifications();
    const pointsThreshold = Number(suboptions.pointsThreshold);
    newGradedAssignments = await getNewGradedAssignments(
      lastChecked,
      clearedNotifications,
      pointsThreshold,
    );
    showGradedNotificationBubble(newGradedAssignments, unloaderContext);
  }

  if (window.location.hash.startsWith('#studentmyday/progress')) {
    showNewGradedButton(
      newGradedAssignments,
      unloaderContext,
      clearAllNotifications,
      id => clearNotification(id, unloaderContext),
    );
  }
}

interface GradeNotificationsSuboptions {
  pointsThreshold: number;
}

export default registerModule('{170c6f0e-0a6b-4c6f-96c0-5525aac3dfb5}', {
  name: 'Grade Notifications',
  main: gradeNotificationsMain,
  suboptions: {
    pointsThreshold: {
      name: 'Minimum Points Threshold',
      type: 'number',
      defaultValue: 5,
    },
  },
});
