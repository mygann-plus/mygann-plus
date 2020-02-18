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

async function getAllCheckpoints() {
  return (await storage.get(ASSIGNMENT_CHECKPOINTS_KEY, ASSIGNMENT_CHECKPOINTS_SCHEMA)) || [];
}

function filterCheckpointsByAssignment(checkpoints, assignmentId) {
  return checkpoints.filter(checkpoint => checkpoint.assignmentId === assignmentId);
}

export async function getAssignmentCheckpoints(assignmentId) {
  const checkpoints = await getAllCheckpoints();
  return filterCheckpointsByAssignment(checkpoints, assignmentId);
}

export function addCheckpoint(checkpoint) {
  return storage.addArrayItem(
    ASSIGNMENT_CHECKPOINTS_KEY,
    checkpoint,
    ASSIGNMENT_CHECKPOINTS_SCHEMA,
  );
}

function changeCheckpoint(checkpointId, reducer) {
  return storage.changeArrayItem(
    ASSIGNMENT_CHECKPOINTS_KEY,
    checkpointId,
    reducer,
    ASSIGNMENT_CHECKPOINTS_SCHEMA,
  );
}

export function setCheckpointCompleted(checkpointId, completed) {
  return changeCheckpoint(checkpointId, checkpoint => ({ ...checkpoint, completed }));
}

export function setCheckpointData(checkpointId, name, due, description) {
  return changeCheckpoint(checkpointId, checkpoint => ({
    ...checkpoint,
    name,
    due,
    description,
  }));
}

export function deleteCheckpoint(checkpointId) {
  return storage.deleteArrayItem(
    ASSIGNMENT_CHECKPOINTS_KEY,
    checkpointId,
    ASSIGNMENT_CHECKPOINTS_SCHEMA,
  );
}

export function addCheckpointsChangeListener(assignmentId, callback) {
  return storage.addChangeListener(ASSIGNMENT_CHECKPOINTS_KEY, ({ newValue: checkpoints }) => {
    callback(filterCheckpointsByAssignment(checkpoints, assignmentId));
  });
}
