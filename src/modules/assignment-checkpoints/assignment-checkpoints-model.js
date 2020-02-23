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

export async function getAllCheckpoints() {
  return (await storage.get(ASSIGNMENT_CHECKPOINTS_KEY, ASSIGNMENT_CHECKPOINTS_SCHEMA)) || [];
}

function filterCheckpointsByAssignment(checkpoints, assignmentId) {
  return checkpoints.filter(checkpoint => checkpoint.assignmentId === assignmentId);
}

// allCheckpoints is optional, used if multiple assignments are checked at once
export async function getAssignmentCheckpoints(assignmentId, allCheckpoints) {
  const checkpoints = allCheckpoints || await getAllCheckpoints();
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

export function addCheckpointsChangeListener(callback) {
  return storage.addChangeListener(ASSIGNMENT_CHECKPOINTS_KEY, ({ newValue: checkpoints }) => {
    callback(checkpoints);
  });
}

// Add checkpoint change listener for specific assignment
export function addAssignmentCheckpointsChangeListener(assignmentId, callback) {
  return addCheckpointsChangeListener(checkpoints => {
    callback(filterCheckpointsByAssignment(checkpoints, assignmentId));
  });
}
