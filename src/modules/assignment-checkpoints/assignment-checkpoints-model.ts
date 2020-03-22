import storage from '~/utils/storage';

const ASSIGNMENT_CHECKPOINTS_KEY = 'assignment_checkpoints';
const ASSIGNMENT_CHECKPOINTS_SCHEMA = 1;

/**
 * SCHEMA v1:
 * {
 *   {
 *     id, assignmentId, name, due, description, completed?
 *   }
 * }
 */

export interface Checkpoint {
  id: string;
  assignmentId: string;
  name: string;
  due: number;
  description: string;
  completed: boolean;
}

export async function getAllCheckpoints() {
  return (await storage.get(ASSIGNMENT_CHECKPOINTS_KEY, ASSIGNMENT_CHECKPOINTS_SCHEMA)) || [];
}

function filterCheckpointsByAssignment(checkpoints: Checkpoint[], assignmentId: string) {
  return checkpoints.filter(checkpoint => checkpoint.assignmentId === assignmentId);
}

// allCheckpoints is optional, used if multiple assignments are checked at once
export async function getAssignmentCheckpoints(
  assignmentId: string,
  allCheckpoints?: Checkpoint[],
) {
  const checkpoints = allCheckpoints || await getAllCheckpoints();
  return filterCheckpointsByAssignment(checkpoints, assignmentId);
}

export function addCheckpoint(checkpoint: Checkpoint) {
  return storage.addArrayItem(
    ASSIGNMENT_CHECKPOINTS_KEY,
    checkpoint,
    ASSIGNMENT_CHECKPOINTS_SCHEMA,
  );
}

function changeCheckpoint(
  checkpointId: string,
  reducer: (checkpoint: Checkpoint) => Checkpoint,
) {
  return storage.changeArrayItem(
    ASSIGNMENT_CHECKPOINTS_KEY,
    checkpointId,
    reducer,
    ASSIGNMENT_CHECKPOINTS_SCHEMA,
  );
}

export function setCheckpointCompleted(checkpointId: string, completed: boolean) {
  return changeCheckpoint(checkpointId, checkpoint => ({ ...checkpoint, completed }));
}

export function setCheckpointData(
  checkpointId: string,
  name: string,
  due: number,
  description: string,
) {
  return changeCheckpoint(checkpointId, checkpoint => ({
    ...checkpoint,
    name,
    due,
    description,
  }));
}

export function deleteCheckpoint(checkpointId: string) {
  return storage.deleteArrayItem(
    ASSIGNMENT_CHECKPOINTS_KEY,
    checkpointId,
    ASSIGNMENT_CHECKPOINTS_SCHEMA,
  );
}

export function addCheckpointsChangeListener(callback: (checkpoints: Checkpoint[]) => void) {
  return storage.addChangeListener<Checkpoint[]>(ASSIGNMENT_CHECKPOINTS_KEY, ({ newValue: checkpoints }) => {
    callback(checkpoints);
  });
}

// Add checkpoint change listener for specific assignment
export function addAssignmentCheckpointsChangeListener(
  assignmentId: string,
  callback: (checkpoints: Checkpoint[]) => void,
) {
  return addCheckpointsChangeListener(checkpoints => {
    callback(filterCheckpointsByAssignment(checkpoints, assignmentId));
  });
}
