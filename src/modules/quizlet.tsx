/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import registerModule from '~/core/module';
import { waitForLoad } from '~/utils/dom';

const domQuery = {
  detail: () => document.querySelector('.bb-tile-content-section') as HTMLElement,
  parent: () => document.querySelector('#original-layout-container') as HTMLElement,
};

async function makePanel(quizCode) {
  const panel = (
    <div id="quizlet-panel" class="col-md-6 bb-page-content-tile-column">
      <section class="bb-tile">
        <div class="bb-tile-title">
          <h2 class="bb-tile-header">Attached Quizlets</h2>
        </div>
        <div class="bb-tile-content">
          <div>
            <div class="bb-tile-content-section">
              <iframe src={`https://quizlet.com/${quizCode}/match/embed?i=1n65lh&x=1jj1`} height="500" width="100%" style="border:0"></iframe>
            </div>
          </div>
        </div>
      </section>
    </div>
  );

  let parent = await waitForLoad(domQuery.parent);
  parent.appendChild(panel);
}

async function quizletMain() {
  const text = (await waitForLoad(domQuery.detail)).innerText;
  console.log(text)
  let quizCode = null;

  if (text.includes('https://quizlet.com/')) {
    let split = text.split('/');
    quizCode = split[split.indexOf('quizlet.com') + 1];
  }
  await makePanel(quizCode);
}

export default registerModule('{440b57cd-80bd-457c-b236-3aba21bad418}', {
  name: 'Quizlets',
  description: 'Quizlet links found in description will open in a side panel for easy access.',
  main: quizletMain,
});
