import { UnloaderContext } from '~/core/module-loader';

import registerModule from '~/core/module';
import insertCheckpointsBox from './checkpoints-box';
import insertCheckpointPreviews from './checkpoints-preview';

async function assignmentCheckpoints(opts: void, unloaderContext: UnloaderContext) {
  if (window.location.hash.includes('detail')) {
    insertCheckpointsBox(unloaderContext);
  } else if (window.location.hash.startsWith('#studentmyday/assignment-center')) {
    insertCheckpointPreviews(unloaderContext);
  }
}

export default registerModule('{bf1e5d7d-edc6-4c83-9d3a-494b6144bb44}', {
  name: 'Subtasks',
  description: 'Add subtasks, such as "Outline" or "Rough Draft", to larger assignments',
  main: assignmentCheckpoints,
});
