import classNames from 'classnames';

import { UnloaderContext } from '~/core/module-loader';
import { createElement, waitForLoad } from '~/utils/dom';

import selectors from './selectors';

const domQuery = {
  progressHeader: () => document.querySelector('#progress-btn'),
  progressIcon: (progressHeader: Element) => {
    return progressHeader.querySelector('.p3icon-progress') as HTMLElement;
  },
};

export function removeGradeNotificationBubble() {
  const bubble = document.querySelector(`.${selectors.progressHeaderBubble}`);
  if (bubble) {
    const progressHeader = domQuery.progressHeader();
    (progressHeader.querySelector('.p3icon-progress') as HTMLElement).style.display = '';
    bubble.remove();
  }
}

export async function showGradedNotificationBubble(
  newGradedAssignments: any[],
  unloaderContext: UnloaderContext,
) {
  removeGradeNotificationBubble();
  if (!newGradedAssignments.length) {
    return;
  }

  const progressHeader = await waitForLoad(domQuery.progressHeader);
  const label = (
    <span
      className={classNames('label label-success', selectors.progressHeaderBubble)}
    >
      { newGradedAssignments.length }
    </span>
  );

  domQuery.progressIcon(progressHeader).style.display = 'none';
  progressHeader.prepend(label);

  unloaderContext.addRemovable(label);
}
