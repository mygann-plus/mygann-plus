/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import registerModule from '~/core/module';
import { waitForLoad } from '~/utils/dom';

// find url and get quizlet code



const quizCode: String;

const panel = (<div id="quizlet-panel" class="col-md-6 bb-page-content-tile-column">
  <section class="bb-tile">
    <div class="bb-tile-title">
      <div class="_2gWpUJuiJeyc-AxRks32ng">
        <h2 class="bb-tile-header">STUDY UP (but known by Sam as &quotQuizlets&quot)</h2>
      </div>
    </div>
    <div class="bb-tile-content">
      <div>
        <div class="bb-tile-content-section">
          <iframe src={`https://quizlet.com/${quizCode}/match/embed?i=1n65lh&x=1jj1`} height="500" width="100%" style="border:0"></iframe>
        </div>
      </div>
    </div>
  </section>
</div>);

export default registerModule('{440b57cd-80bd-457c-b236-3aba21bad418}', {
  name: 'In Assignment Quizlets',
  description: 'Quizlet links will automatically open in side panel.',
  main: quizletMain,
});
