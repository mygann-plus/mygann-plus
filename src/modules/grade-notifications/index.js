import registerModule from '~/module';

import { insertCss } from '~/utils/dom';
import { fetchApi } from '~/utils/fetch';
import { getAssignmentData } from '~/shared/assignments-center';

import { getLastChecked, setLastChecked } from './grade-notifications-model';
import showGradedNotificationBubble, {
  removeGradeNotificationBubble,
} from './grade-notifications-bubble';
import showNewGradedButton, { removeNewGradedButton } from './grade-notifications-progress';
import style from './style.css';

let newGradedAssignments = [];

function clearNotifications() {
  const today = new Date();
  const nowDateTime = `${today.toLocaleDateString()} ${today.toLocaleTimeString()}`;
  setLastChecked(nowDateTime);
  removeGradeNotificationBubble();
  removeNewGradedButton();
}

/**
 * @returns {Object[]} Array of grade data objects
 */
async function getNewGradedAssignments(lastChecked, pointsThreshold) {
  const startDate = '9/17/2018'; // TODO: better, generally
  const endDate = new Date().toLocaleDateString();

  const endpoint = '/api/DataDirect/AssignmentCenterAssignments/';
  const query = `?format=json&filter=2&dateStart=${startDate}&dateEnd=${endDate}&persona=2&statusList=4`;

  const assignments = await fetchApi(endpoint + query);
  const assignmentsData = (await Promise.all(assignments
    .map(assignment => getAssignmentData(assignment.assignment_index_id))));

  return assignmentsData.filter(assignment => {
    const gradedDate = new Date(assignment.gradedDate);
    const passesThreshold = assignment.maxPoints >= pointsThreshold;
    return gradedDate.getTime() > new Date(lastChecked).getTime() && passesThreshold;
  });
}


async function gradeNotifications(suboptions, unloaderContext) {
  const styles = insertCss(style.toString());
  unloaderContext.addRemovable(styles);

  if (window.location.hash.startsWith('#studentmyday')) {
    showGradedNotificationBubble(newGradedAssignments, unloaderContext);
    const lastChecked = await getLastChecked();
    const pointsThreshold = Number(suboptions.pointsThreshold);
    newGradedAssignments = await getNewGradedAssignments(lastChecked, pointsThreshold);
    showGradedNotificationBubble(newGradedAssignments, unloaderContext);
  }

  if (window.location.hash.startsWith('#studentmyday/progress')) {
    showNewGradedButton(newGradedAssignments, unloaderContext, clearNotifications);
  }
}

export default registerModule('{170c6f0e-0a6b-4c6f-96c0-5525aac3dfb5}', {
  name: 'Grade Notifications',
  main: gradeNotifications,
  suboptions: {
    pointsThreshold: {
      name: 'Minimum Points Threshold',
      type: 'number',
      defaultValue: '5',
    },
  },
});
