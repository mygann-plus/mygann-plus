import classNames from 'classnames';

import { UnloaderContext } from '~/core/module-loader';

import { createElement, waitForOne, insertCss, constructCheckbox } from '~/utils/dom';
import {
  addAssignmentTableMutationObserver,
  getAssignmentIdFromRow,
  isTask,
  getAssignmentRows,
} from '~/shared/assignments-center';

import {
  Checkpoint,
  getAssignmentCheckpoints,
  getAllCheckpoints,
  setCheckpointCompleted,
  addCheckpointsChangeListener,
} from './assignment-checkpoints-model';
import style from './checkpoints-preview-style.css';
import { compareDateMilliseconds } from '~/utils/date';
import tick from '~/utils/tick';

const selectors = {
  preview: {
    wrap: style.locals.preview__wrap,
    wrapShowingMore: style.locals['preview__wrap--showing-more'],
    more: style.locals.preview__more,
  },
  checkpoint: {
    wrap: style.locals.checkpoint__wrap,
    visible: style.locals['checkpoint__wrap--visible'],
    due: style.locals.checkpoint__due,
    checkbox: style.locals.checkpoint__checkbox,
    fadeOut: style.locals.checkpoint__fadeout,
  },
};

class CheckpointsPreview {

  private checkpoints: Checkpoint[];
  private checkpointList: HTMLElement[];
  private wrap: HTMLElement;

  constructor(checkpoints: Checkpoint[]) {
    this.checkpoints = checkpoints;

    this.checkpointList = [
      this.generateCheckpoint(checkpoints[0], true),
      ...checkpoints.slice(1).map(c => this.generateCheckpoint(c, false)),
    ];
    this.wrap = this.generateWrap();
  }

  /* eslint-disable class-methods-use-this */

  generateWrap() {
    return (
      <div className={selectors.preview.wrap}>
        {this.checkpointList}
        {
          this.checkpoints.length > 1
            ? <a href="#" onClick={(e: any) => this.handleShowClick(e)}>(More...)</a>
            : ''
        }
      </div>
    );
  }

  generateCheckpoint(checkpoint: Checkpoint, visible: boolean) {
    const checkbox = constructCheckbox(false, false, e => this.handleCheckboxClick(e, checkpoint));
    checkbox.classList.add(selectors.checkpoint.checkbox);
    return (
      <div
        className={classNames(
          selectors.checkpoint.wrap,
          visible && selectors.checkpoint.visible,
        )}
      >
        {checkbox}
        {checkpoint.name}
        <div className={selectors.checkpoint.due}>

          {
            checkpoint.due
              ? <span>Due {new Date(checkpoint.due).toLocaleDateString()}</span>
              : ''
          }

        </div>
      </div>
    );
  }

  handleShowClick(e: Event) {
    e.preventDefault();
    (e.target as HTMLElement).remove();
    for (const checkpointListItem of this.checkpointList) {
      checkpointListItem.classList.add(selectors.checkpoint.visible);
    }
    this.wrap.classList.add(selectors.preview.wrapShowingMore);
  }

  async handleCheckboxClick(e: Event, checkpoint: Checkpoint) {
    setCheckpointCompleted(checkpoint.id, true);
    const checkpointWrap = (e.target as HTMLElement).closest(`.${selectors.checkpoint.wrap}`);
    const checkbox = checkpointWrap.querySelector(`.${selectors.checkpoint.checkbox}`) as HTMLInputElement;
    checkbox.disabled = true;
    checkpointWrap.classList.add(selectors.checkpoint.fadeOut);
    await tick(200);
    checkpointWrap.remove();
    this.checkpointList = this.checkpointList.slice(1);
    if (this.checkpointList.length > 0) {
      this.checkpointList[0].classList.add(selectors.checkpoint.visible);
    } else {
      this.remove();
    }
  }

  /* Public Methods */

  getWrap() {
    return this.wrap;
  }

  remove() {
    this.wrap.remove();
  }

}

// Some assignments do not have links to their details pages by default
function addDetailsLink(row: HTMLElement, unloaderContext: UnloaderContext) {
  const details = row.querySelector('[data-heading="Details"]');
  if (!details) {
    return;
  }
  const existingLink = details.querySelector('a');
  if (existingLink) {
    return;
  }

  const button = row.querySelector('[data-id][data-index]') as HTMLElement;
  const { id, index } = button.dataset;
  const task = isTask(row);
  let hash;
  if (task) {
    hash = `#taskdetail/${id}`;
  } else {
    hash = `#assignmentdetail/${id}/${index}/0/studentmyday--assignment-center`;
  }

  const link = <a href={hash}></a>;
  if (task) {
    link.append(details.firstChild);
  } else {
    link.append(...details.children);
  }

  unloaderContext.addFunction(() => {
    details.append(...link.children);
    link.remove();
  });

  details.appendChild(link);
}

async function insertPreviews(allCheckpoints: Checkpoint[], unloaderContext: UnloaderContext) {
  const rows = await waitForOne(getAssignmentRows);

  for (const row of rows) {
    addDetailsLink(row, unloaderContext);

    const id = getAssignmentIdFromRow(row);
    if (!id) {
      continue;
    }

    const checkpoints = (await getAssignmentCheckpoints(id, allCheckpoints))
      .filter(checkpoint => !checkpoint.completed)
      .sort((a, b) => {
        return compareDateMilliseconds(a.due, b.due);
      });

    if (!checkpoints.length) {
      continue;
    }

    const preview = new CheckpointsPreview(checkpoints);

    const details = row.querySelector('[data-heading="Details"]');
    details.appendChild(preview.getWrap());
    unloaderContext.addRemovable(preview);
  }
}

export default async function insertCheckpointPreviews(unloaderContext: UnloaderContext) {
  const styles = insertCss(style.toString());
  unloaderContext.addRemovable(styles);

  let allCheckpoints = await getAllCheckpoints();
  insertPreviews(allCheckpoints, unloaderContext);
  const observer = await addAssignmentTableMutationObserver(async () => {
    insertPreviews(allCheckpoints, unloaderContext);
  });

  const checkpointsChangeListener = addCheckpointsChangeListener(checkpoints => {
    allCheckpoints = checkpoints;
  });

  unloaderContext.addRemovable(observer);
  unloaderContext.addRemovable(checkpointsChangeListener);
}
