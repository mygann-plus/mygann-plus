import classNames from 'classnames';

import { createElement, waitForOne, insertCss } from '~/utils/dom';

import {
  addAssignmentTableMutationObserver,
  getAssignmentIdFromRow,
} from '~/shared/assignments-center';

import { getAssignmentCheckpoints } from './assignment-checkpoints-model';
import style from './checkpoints-preview-style.css';

const selectors = {
  preview: {
    wrap: style.locals.preview__wrap,
    more: style.locals.preview__more,
  },
  checkpoint: {
    wrap: style.locals.checkpoint__wrap,
    visible: style.locals['checkpoint__wrap--visible'],
    due: style.locals.checkpoint__due,
  },
};

const domQuery = () => document.querySelectorAll('#assignment-center-assignment-items tr');

class CheckpointsPreview {

  constructor(checkpoints) {
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
        { this.checkpointList }
        {
          this.checkpoints.length > 1
            ? <a href="#" onClick={e => this.handleShowClick(e)}>(More...)</a>
            : ''
        }
      </div>
    );
  }

  generateCheckpoint(checkpoint, visible) {
    return (
      <div
        className={classNames(
          selectors.checkpoint.wrap,
          visible && selectors.checkpoint.visible,
        )}
      >
        - {checkpoint.name}
        <div className={selectors.checkpoint.due}>
          Due { new Date(checkpoint.due).toLocaleDateString() }
        </div>
      </div>
    );
  }

  handleShowClick(e) {
    e.preventDefault();
    e.target.remove();
    for (const checkpointListItem of this.checkpointList) {
      checkpointListItem.classList.add(selectors.checkpoint.visible);
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

export default async function insertPreview(unloaderContext) {
  const styles = insertCss(style.toString());
  unloaderContext.addRemovable(styles);

  const observer = addAssignmentTableMutationObserver(async () => {
    const rows = await waitForOne(domQuery);
    for (const row of rows) {
      const id = getAssignmentIdFromRow(row);

      const checkpoints = (await getAssignmentCheckpoints(id))
        .filter(checkpoint => !checkpoint.completed);

      if (!checkpoints.length) {
        return;
      }

      const preview = new CheckpointsPreview(checkpoints);

      const details = row.querySelector('[data-heading="Details"]');
      details.appendChild(preview.getWrap());
      unloaderContext.addRemovable(preview);
    }
  });

  unloaderContext.addRemovable(observer);
}
