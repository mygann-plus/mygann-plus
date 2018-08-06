import createModule from '~/utils/module';
import { waitForLoad, createElement } from '~/utils/dom';

const getMonthButton = () => (
  document.querySelector('.fc-header > :first-child > :first-child > :first-child > :nth-child(6)')
);

const goToDay = () => { window.location.hash = 'studentmyday/schedule'; };

async function dayScheduleButton() {
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
}

export default createModule('Day Schedule Button', dayScheduleButton, {
  description: 'Button to return to day view',
});
