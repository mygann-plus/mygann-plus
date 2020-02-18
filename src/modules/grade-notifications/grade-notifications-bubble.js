import classNames from 'classnames';

import { createElement, waitForLoad } from '~/utils/dom';

import selectors from './selectors';

const getProgressHeader = () => document.querySelector('#progress-btn');

export function removeGradeNotificationBubble() {
  const bubble = document.querySelector(`.${selectors.progressHeaderBubble}`);
  if (bubble) {
    const progressHeader = getProgressHeader();
    progressHeader.querySelector('.p3icon-progress').style.display = '';
    bubble.remove();
  }
}

export async function showGradedNotificationBubble(newGradedAssignments, unloaderContext) {
  removeGradeNotificationBubble();
  if (!newGradedAssignments.length) {
    return;
  }

  const progressHeader = await waitForLoad(getProgressHeader);
  const label = (
    <span
      className={classNames('label label-success', selectors.progressHeaderBubble)}
    >
      { newGradedAssignments.length }
    </span>
  );
  progressHeader.querySelector('.p3icon-progress').style.display = 'none';
  progressHeader.prepend(label);

  unloaderContext.addRemovable(label);
}
