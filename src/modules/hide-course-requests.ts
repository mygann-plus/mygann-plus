import registerModule from '~/core/module';

import { waitForLoad } from '~/utils/dom';

const courseRequestsButton = () => document.querySelector('#course-requests-btn');

export default registerModule('{683a9158-9030-4015-bca6-3513b21caf72}', {
  name: 'Hide Course Requests Tab',
  description: 'Hide course requests tab until requests are opened'
});