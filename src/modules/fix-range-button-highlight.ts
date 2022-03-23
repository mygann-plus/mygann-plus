import registerModule from '~/core/module';
import { waitForLoad } from '~/utils/dom';

// when the range option is selected, it doesn't unhighlight the other options

const domQuery = () => document.querySelector('#custom-view');

async function fixAssignmentNavMain() {
  const button = await waitForLoad(domQuery);
  let active = button.classList.contains('active');

  const activityObserver = new MutationObserver(() => {
    if (button.classList.contains('active')) {
      if (!active) {
        // if it just became active remove other active elements
        // this button is the last button in te list
        const firstActive = button.parentElement.querySelector('.active');
        if (firstActive !== button) firstActive.classList.remove('active');
      }
      active = true;
    } else {
      active = false;
    }
  });

  activityObserver.observe(button, { attributes: true, attributeFilter: ['class'] });
}

export default registerModule('{ad2c0c7f-1a8b-4958-a456-ae7a402533c1}', {
  name: 'fix.assignmentNavHighlight',
  main: fixAssignmentNavMain,
  showInOptions: false,
});
