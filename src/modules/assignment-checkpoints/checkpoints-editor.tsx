import classNames from 'classnames';

import {
  createElement,
  constructButton,
  constructCheckbox,
} from '~/utils/dom';

import style from './checkpoints-box-style.css';
import { Checkpoint } from './assignment-checkpoints-model';

const selectors = {
  editor: {
    wrap: style.locals.editor,
    visible: style.locals['editor--visible'],
    input: style.locals.editor__input,
    dueLabel: style.locals['editor__due-label'],
    description: style.locals.editor__description,
    buttonWrap: style.locals['editor__button-wrap'],
  },
};

/* Editor for a single checkpoint (either edit or add) */

export default class CheckpointEditor {

  private checkpoint: Checkpoint;
  private handleSaveClick: (checkpoint: CheckpointEditor) => void;
  private handleCancelClick: (checkpoint: CheckpointEditor) => void;
  private saveButtonText: string;
  private initialVisible: boolean;
  private wrap: HTMLElement;

  constructor(
    checkpoint: Checkpoint,
    handleSaveClick: (checkpoint: CheckpointEditor) => void,
    handleCancelClick: (checkpoint: CheckpointEditor) => void,
    initialVisible: boolean,
    saveButtonText: string,
  ) {
    this.checkpoint = checkpoint;
    this.handleSaveClick = handleSaveClick;
    this.handleCancelClick = handleCancelClick;
    this.saveButtonText = saveButtonText;
    this.initialVisible = initialVisible;

    this.wrap = this.generateEditorWrap();
  }

  generateEditorWrap() {

    const { checkpoint } = this;
    const due = checkpoint.due && new Date(checkpoint.due).toISOString().substring(0, 10);

    return (
      <div
        className={classNames(
          selectors.editor.wrap,
          this.initialVisible && selectors.editor.visible,
        )}
      >
        <div>
          {constructCheckbox(false, true, () => { })}
          <input
            value={checkpoint.name || ''}
            placeholder="Title"
            name="name"
            className={selectors.editor.input}
          />
          <label className={selectors.editor.dueLabel}>
            Due
            <input
              value={due || ''}
              type="date"
              placeholder="Due"
              name="due"
              className={selectors.editor.input}
            />
          </label>
          <textarea
            placeholder="Description"
            className={selectors.editor.description}
          >
            {checkpoint.description}
          </textarea>

        </div>

        <div className={selectors.editor.buttonWrap}>
          {
            constructButton({
              textContent: this.saveButtonText,
              onClick: () => this.handleSaveClick(this),
              primary: true,
            })
          }
          {
            constructButton({
              textContent: 'Cancel',
              onClick: () => this.handleCancelClick(this),
            })
          }
        </div>
      </div>
    );
  }

  getWrap() {
    return this.wrap;
  }

  getNameInput() {
    return this.wrap.querySelector('[name="name"]') as HTMLInputElement;
  }

  getDueInput() {
    return this.wrap.querySelector('[name="due"]') as HTMLInputElement;
  }

  getDescriptionInput() {
    return this.wrap.querySelector('textarea');
  }

  setVisibility(visible: boolean) {
    this.wrap.classList.toggle(selectors.editor.visible, visible);
  }

}
