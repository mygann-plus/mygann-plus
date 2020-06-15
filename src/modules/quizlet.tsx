/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import registerModule from '~/core/module';
import { waitForLoad, createElement } from '~/utils/dom';

const domQuery = {
  detail: () => document.querySelector('.bb-tile-content-section') as HTMLElement,
  parent: () => document.querySelector('#original-layout-container') as HTMLElement,
};

async function makePanel(quizCode : String) {
  const style = { border: 0 };
  const panel: HTMLElement = (
    <div id="quizlet-panel" className="col-md-6 bb-page-content-tile-column">
      <section className="bb-tile">
        <div className="bb-tile-title">
          <h2 className="bb-tile-header">Attached Quizlets</h2>
        </div>
        <div className="bb-tile-content">
          <div>
            <div className="bb-tile-content-section">
              <iframe src={`https://quizlet.com/${quizCode}/flashcards/embed?i=1n65lh&x=1jj1`} height="500" width="100%" style={style}></iframe>
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
  // let quizCode = null;

  // if (text.includes('https://quizlet.com/')) {
  //   let split = text.split('/');
  //   quizCode = split[split.indexOf('quizlet.com') + 1];
  // }

  // await makePanel(quizCode);

  // let quizCodes = [];
  // let matches = str['matchAll'](regexp);


  for (let [quizCode] of text.matchAll(/(?<=quizlet\.com\/)\d*/g)) {
    await makePanel(quizCode);
  }

}

export default registerModule('{440b57cd-80bd-457c-b236-3aba21bad418}', {
  name: 'Quizlets',
  description: 'Quizlet links found in description will open in a side panel for easy access.',
  main: quizletMain,
});
