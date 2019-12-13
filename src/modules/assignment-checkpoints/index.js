import registerModule from '~/module';
import insertCheckpointsBox from './checkpoints-box';
import insertPreview from './checkpoints-preview';

async function assignmentCheckpoints(opts, unloaderContext) {
  if (window.location.hash.includes('detail')) {
    insertCheckpointsBox(unloaderContext);
  } else if (window.location.hash.startsWith('#studentmyday/assignment-center')) {
    insertPreview(unloaderContext);

  }
}

export default registerModule('{bf1e5d7d-edc6-4c83-9d3a-494b6144bb44}', {
  name: 'Assignment Checkpoints',
  main: assignmentCheckpoints,
});
