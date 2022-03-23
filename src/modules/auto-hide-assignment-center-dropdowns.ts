import registerModule from '~/core/module';
import { UnloaderContext } from '~/core/module-loader';
import { addEventListener } from '~/utils/dom';

// https://src-e1.myschoolapp.com/1.52.22068.10/src/modules/lms/shared/assignmentcenter.js

function hideDropdowns() {
  for (const el of document.querySelectorAll('#ical-menu, #report-menu, .range-dropdown')) {
    (el as HTMLElement).style.display = 'none';
  }
}

function autoHideRangeBoxMain(opts: void, unloaderContext: UnloaderContext) {
  const listener = addEventListener(document.body, 'click', e => {
    // if it clicks a dropdown ignore it. range-dropdown already ignores clicks
    if (!(e.target as HTMLElement).closest('#ical-menu, #report-menu')) {
      hideDropdowns();
    }
  });
  unloaderContext.addRemovable(listener);
}

export default registerModule('{028e865a-00b5-447d-9fe7-f0ff8cd10b4f}', {
  name: 'fix.autoHideAssignmentCenterDropdowns',
  init: autoHideRangeBoxMain, // affectsGlobalState
  showInOptions: false,
});
