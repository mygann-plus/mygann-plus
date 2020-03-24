import { UnloaderContext } from '~/core/module-loader';

import {
  createElement,
  constructButton,
  waitForLoad,
  insertCss,
  constructCheckbox,
} from '~/utils/dom';
import { getDateFromInput, compareDateMilliseconds } from '~/utils/date';

import {
  Checkpoint,
  addCheckpoint,
  setCheckpointCompleted,
  deleteCheckpoint,
  setCheckpointData,
  getAssignmentCheckpoints,
  addAssignmentCheckpointsChangeListener,
} from './assignment-checkpoints-model';

import style from './checkpoints-box-style.css';
import CheckpointEditor from './checkpoints-editor';

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
};

/* UI Elements */

class CheckpointsBox {

  private assignmentId: string;
  private checkpoints: Checkpoint[];

  private listWrap: HTMLElement;
  private wrap: HTMLElement;
  private addEditor: CheckpointEditor;

  constructor(checkpoints: Checkpoint[], assignmentId: string) {
    this.assignmentId = assignmentId;
    this.checkpoints = this.sortCheckpoints(checkpoints);

    this.listWrap = this.generateListWrap();
    this.addEditor = new CheckpointEditor(
      {
        name: '',
        due: null,
        completed: false,
        id: null,
        assignmentId: null,
        description: '',
      },
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
              <h2 className="bb-tile-header">Subtasks</h2>
              {
                constructButton({
                  iClassName: 'fa fa-plus',
                  onClick: () => this.handleAddOpen(),
                  className: selectors.header.addButton,
                })
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

  generateCheckpoint(checkpoint: Checkpoint) {

    const { id } = checkpoint;

    const controls = [
      constructButton({
        iClassName: 'fa fa-edit',
        onClick: e => this.handleEditClick(e, checkpoint),
      }),
      constructButton({
        iClassName: 'fa fa-trash',
        onClick: () => this.handleDeleteClick(id),
      }),
    ];

    return (
      <div className={selectors.checkpoint.wrap}>
        <div>
          {
            constructCheckbox(
              checkpoint.completed,
              false,
              (e: Event) => this.handleCompletedClick(e, id),
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
          {
            checkpoint.due
              ? (
                <div className={selectors.checkpoint.due}>
                  Due {new Date(checkpoint.due).toLocaleDateString()}
                </div>
              )
              : ''
          }
        </div>
      </div>
    );
  }

  async handleAddClick() {
    const editor = this.addEditor;
    const name = editor.getNameInput().value;
    const due = getDateFromInput(editor.getDueInput()).getTime();
    const description = editor.getDescriptionInput().value;

    const newCheckpoint: Checkpoint = {
      name,
      id: null,
      due,
      description,
      completed: false,
      assignmentId: this.assignmentId,
    };
    await addCheckpoint(newCheckpoint);
    this.handleAddClose();
  }

  handleCompletedClick(
    e: Event, checkpointId: string,
  ) {
    const checkbox = e.target as HTMLInputElement;
    const isCompleted = checkbox.checked;
    setCheckpointCompleted(checkpointId, isCompleted);
  }

  handleEditClick(e: Event, checkpoint: Checkpoint) {
    const checkpointWrap = (e.target as HTMLElement).closest(`.${selectors.checkpoint.wrap}`);

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

  handleDeleteClick(checkpointId: string) {
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

  sortCheckpoints(checkpoints: Checkpoint[]) {
    return checkpoints.sort((a, b) => {
      return compareDateMilliseconds(a.due, b.due);
    });
  }

  /* Public Methods */

  getWrap() {
    return this.wrap;
  }

  refreshCheckpoints(checkpoints: Checkpoint[]) {
    this.checkpoints = this.sortCheckpoints(checkpoints);
    const newListWrap = this.generateListWrap();
    this.listWrap.replaceWith(newListWrap);
    this.listWrap = newListWrap;
  }

  remove() {
    this.wrap.remove();
  }

}

const domQuery = () => document.querySelector('#evaluation-tile');

export default async function insertCheckpointsBox(unloaderContext: UnloaderContext) {
  const styles = insertCss(style.toString());
  unloaderContext.addRemovable(styles);

  const evaluationTile = await waitForLoad(domQuery);
  const [, assignmentId] = window.location.hash.match(/#(?:task|assignment)detail\/([0-9]+)(\/|$)/);
  const checkpoints = await getAssignmentCheckpoints(assignmentId);

  const checkpointsBox = new CheckpointsBox(checkpoints, assignmentId);
  evaluationTile.after(checkpointsBox.getWrap());
  unloaderContext.addRemovable(checkpointsBox);

  const checkpointsListener = addAssignmentCheckpointsChangeListener(
    assignmentId,
    (newCheckpoints: Checkpoint[]) => checkpointsBox.refreshCheckpoints(newCheckpoints),
  );
  unloaderContext.addRemovable(checkpointsListener);
}
