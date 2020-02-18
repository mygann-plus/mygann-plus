import classNames from 'classnames';

import {
  createElement,
  constructButton,
  waitForLoad,
  insertCss,
} from '~/utils/dom';
import { getDateFromInput, compareDateMilliseconds } from '~/utils/date';

import {
  addCheckpoint,
  setCheckpointCompleted,
  deleteCheckpoint,
  setCheckpointData,
  getAssignmentCheckpoints,
  addCheckpointsChangeListener,
} from './assignment-checkpoints-model';

import style from './checkpoints-box-style.css';

const selectors = {
  header: {
    wrap: style.locals.header__wrap,
    addButton: style.locals['header__add-button'],
  },
  checkpointsWrap: style.locals['checkpoint-wrap'],
  checkpoint: {
    wrap: style.locals.checkpoint__wrap,
    name: style.locals.checkpoint__name,
    due: style.locals.checkpoint__due,
    description: style.locals.checkpoint__description,
    controls: style.locals.checkpoint__controls,
  },
  editor: {
    wrap: style.locals.editor,
    visible: style.locals['editor--visible'],
    input: style.locals.editor__input,
    dueLabel: style.locals['editor__due-label'],
    description: style.locals.editor__description,
    buttonWrap: style.locals['editor__button-wrap'],
  },
};

/* UI Elements */

function generateCheckbox(isChecked, isDisabled, onChange) {
  return (
    <label className="bb-check-wrapper">
      <input
        type="checkbox"
        className="field"
        checked={isChecked}
        onChange={onChange}
      />
      <span className="check-label bb-check-checkbox"></span>
    </label>
  );
}

class CheckpointEditor {

  constructor(
    checkpoint,
    handleSaveClick,
    handleCancelClick,
    initialVisible,
    saveButtonText,
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
          {generateCheckbox(false, true, () => { })}
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
            { checkpoint.description }
          </textarea>

        </div>

        <div className={selectors.editor.buttonWrap}>
          {
            constructButton(
              this.saveButtonText, '', '',
              () => this.handleSaveClick(this), '',
              { primary: true },
            )
          }
          {constructButton('Cancel', '', '', () => this.handleCancelClick(this))}
        </div>
      </div>
    );
  }

  getWrap() {
    return this.wrap;
  }

  getNameInput() {
    return this.wrap.querySelector('[name="name"]');
  }

  getDueInput() {
    return this.wrap.querySelector('[name="due"]');
  }

  getDescriptionInput() {
    return this.wrap.querySelector('textarea');
  }

  setVisibility(visible) {
    this.wrap.classList.toggle(selectors.editor.visible, visible);
  }

}

class CheckpointsBox {

  constructor(checkpoints, assignmentId) {
    this.assignmentId = assignmentId;
    this.checkpoints = this.sortCheckpoints(checkpoints);

    this.listWrap = this.generateListWrap();
    this.addEditor = new CheckpointEditor(
      { name: '', due: '', completed: false },
      () => this.handleAddClick(),
      () => this.handleAddClose(),
      false,
      'Add',
    );
    this.wrap = this.createWrap();
  }

  createWrap() {

    return (
      <div className="col-md-6 bb-page-content-tile-column">
        <section className="bb-tile">
          <div className="bb-tile-title">
            <div className={selectors.header.wrap}>
              <h2 className="bb-tile-header">Checkpoints</h2>
              {
                constructButton(
                  '', '', 'fa fa-plus',
                  () => this.handleAddOpen(),
                  selectors.header.addButton,
                )
              }
            </div>
          </div>
          <div className="bb-tile-content">
            <div>
              <div className="bb-tile-content-section">
                {this.listWrap}
                {this.addEditor.getWrap()}
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  generateListWrap() {
    const listItems = this.checkpoints.map(c => this.generateCheckpoint(c));
    return (
      <div>
        {listItems}
      </div>
    );
  }

  /* eslint-disable class-methods-use-this */

  generateCheckpoint(checkpoint) {

    const { id } = checkpoint;

    const controls = [
      constructButton('', '', 'fa fa-edit', e => this.handleEditClick(e, checkpoint)),
      constructButton('', '', 'fa fa-trash', () => this.handleDeleteClick(id)),
    ];

    return (
      <div className={selectors.checkpoint.wrap}>
        <div>
          {
            generateCheckbox(
              checkpoint.completed,
              false,
              e => this.handleCompletedClick(e, id),
            )
          }
          <div className={selectors.checkpoint.name}>
            {checkpoint.name}
          </div>
          <div className={selectors.checkpoint.description}>
            {checkpoint.description}
          </div>
        </div>
        <div>
          <div className={selectors.checkpoint.controls}>
            {controls}
          </div>
          <div className={selectors.checkpoint.due}>
            Due {new Date(checkpoint.due).toLocaleDateString()}
          </div>
        </div>
      </div>
    );
  }

  async handleAddClick() {
    const editor = this.addEditor;
    const name = editor.getNameInput().value;
    const due = getDateFromInput(editor.getDueInput()).getTime();
    const description = editor.getDescriptionInput().value;

    const newCheckpoint = {
      name,
      due,
      description,
      completed: false,
      assignmentId: this.assignmentId,
    };
    await addCheckpoint(newCheckpoint);
    this.handleAddClose();
  }

  handleCompletedClick(e, checkpointId) {
    const { target } = e;
    const isCompleted = target.checked;
    setCheckpointCompleted(checkpointId, isCompleted);
  }

  handleEditClick(e, checkpoint) {
    const checkpointWrap = e.target.closest(`.${selectors.checkpoint.wrap}`);

    const editor = new CheckpointEditor(
      checkpoint,
      editorInst => {
        const name = editorInst.getNameInput().value;
        const due = getDateFromInput(editorInst.getDueInput()).getTime();
        const description = editorInst.getDescriptionInput().value;

        setCheckpointData(checkpoint.id, name, due, description);
      },
      editorInst => editorInst.getWrap().replaceWith(checkpointWrap),
      true,
      'Save',
    );

    checkpointWrap.replaceWith(editor.getWrap());
  }

  handleDeleteClick(checkpointId) {
    deleteCheckpoint(checkpointId);
  }

  handleAddOpen() {
    this.addEditor.setVisibility(true);
    this.addEditor.getNameInput().focus();
  }

  handleAddClose() {
    this.addEditor.setVisibility(false);
    this.addEditor.getNameInput().value = '';
    this.addEditor.getDueInput().value = '';
  }

  sortCheckpoints(checkpoints) {
    return checkpoints.sort((a, b) => {
      return compareDateMilliseconds(a.due, b.due);
    });
  }

  /* Public Methods */

  getWrap() {
    return this.wrap;
  }

  refreshCheckpoints(checkpoints) {
    this.checkpoints = this.sortCheckpoints(checkpoints);
    const newListWrap = this.generateListWrap();
    this.listWrap.replaceWith(newListWrap);
    this.listWrap = newListWrap;
  }

}

const domQuery = () => document.querySelector('#evaluation-tile');

export default async function insertCheckpointsBox(unloaderContext) {
  const styles = insertCss(style.toString());
  unloaderContext.addRemovable(styles);

  const evaluationTile = await waitForLoad(domQuery);
  const [, assignmentId] = window.location.hash.match(/#assignmentdetail\/([0-9]+)\//);
  const checkpoints = await getAssignmentCheckpoints(assignmentId);

  const checkpointsBox = new CheckpointsBox(checkpoints, assignmentId);
  evaluationTile.after(checkpointsBox.getWrap());

  const checkpointsListener = addCheckpointsChangeListener(assignmentId, newCheckpoints => {
    checkpointsBox.refreshCheckpoints(newCheckpoints);
  });
  unloaderContext.addRemovable(checkpointsListener);
}
