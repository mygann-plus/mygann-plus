import registerModule from '~/core/module';
import { waitForLoad } from '~/utils/dom';

const domQuery = () => document.querySelector('#course-requests-btn');

export async function hideCourseRequestsMain() {
  const courseRequestsButton = await waitForLoad(domQuery);
  courseRequestsButton.style.display = 'none';
}

export default registerModule('{683a9158-9030-4015-bca6-3513b21caf72}', {
  name: 'Hide Course Requests Button',
  description: 'Hide course requests button until courses are available.',
  main: hideCourseRequestsMain,
});
