import createModule from '~/module';
import { waitForLoad, createElement } from '~/utils/dom';

const getMonthButton = () => (
  document.querySelector('.fc-header > :first-child > :first-child > :first-child > :nth-child(6)')
);

const goToDay = () => { window.location.hash = 'studentmyday/schedule'; };

async function dayScheduleButton(opts, unloaderContext) {
  await waitForLoad(getMonthButton);

  const monthButton = getMonthButton();

  const dayButton = (
    <span className="fc-button fc-corner-left fc-state-default" onClick={ goToDay }>
      <span className="fc-button-inner">
        <span className="fc-button-content">day</span>
        <span className="fc-button-effect">
          <span></span>
        </span>
      </span>
    </span>
  );

  monthButton.classList.remove('fc-corner-left');
  monthButton.before(dayButton);

  unloaderContext.addRemovable(dayButton);
}

function unloadDayScheduleButton() {
  getMonthButton().classList.add('fc-corner-left');
}

export default createModule('{0ae24306-a117-447f-94e1-9a296d2b8a7d}', {
  name: 'Day Schedule Button',
  main: dayScheduleButton,
  unload: unloadDayScheduleButton,
  description: 'Button to return to day view',
});
