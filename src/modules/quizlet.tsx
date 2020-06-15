/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import registerModule from '~/core/module';
import { waitForLoad, createElement } from '~/utils/dom';

const domQuery = {
  detail: () => document.querySelector('.bb-tile-content-section') as HTMLElement,
  parent: () => document.querySelector('#original-layout-container') as HTMLElement,
};

async function makePanel() {
  const panel: HTMLElement = (
    <div id="quizlet-panel" className="col-md-6 bb-page-content-tile-column">
      <section className="bb-tile">
        <div className="bb-tile-title">
          <h2 className="bb-tile-header">Attached Quizlets</h2>
        </div>
        <div className="bb-tile-content">
          {/* <div> */}
            <div id="quizlet-panel-content" className="bb-tile-content-section">
              {/* iframe(s) to be inserted here */}
            </div>
          {/* </div> */}
        </div>
    </section>
    </div>
  );

  let parent = await waitForLoad(domQuery.parent);
  parent.appendChild(panel);
  // let content : HTMLElement = document.getElementById('quizlet-panel-content') as HTMLElement;
  return document.getElementById('quizlet-panel-content'); // why does panel.getElementById throw an error?
}

async function makeIframe(quizCode : String) {
  const style = { border: 0, height: 500, width: 500 };
  const iframe: HTMLElement = (<iframe src={`https://quizlet.com/${quizCode}/flashcards/embed?i=1n65lh&x=1jj1`} style={style}></iframe>);
  (document.getElementById('quizlet-panel-content') || await makePanel()).appendChild(iframe);
}

async function quizletMain() {
  const text: String = (await waitForLoad(domQuery.detail)).innerText;
  // if (text.includes('https://quizlet.com/')) {
  //   await makePanel();
  // }

  // let promises = [];
  for (let [quizCode] of text.matchAll(/(?<=quizlet\.com\/)\d*/g)) {
    makeIframe(quizCode); // removed await
    // promises.push(makeIframe(quizCode));
  }
  // await Promise.all(promises);

}

export default registerModule('{440b57cd-80bd-457c-b236-3aba21bad418}', {
  name: 'Quizlets',
  description: 'Quizlet links found in description will open in a side panel for easy access.',
  main: quizletMain,
});
