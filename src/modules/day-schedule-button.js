import registerModule from '../utils/module';
import { waitForLoad, insertBefore, createElementFromHTML } from '../utils/dom';

const getMonthButton = () => (
  document.querySelector('.fc-header > :first-child > :first-child > :first-child > :nth-child(6)')
);

async function dayScheduleButton() {
  await waitForLoad(getMonthButton);

  const monthButton = getMonthButton();

  const dayButtonHtml = `
      <span class="fc-button fc-corner-left fc-state-default">
        <span class="fc-button-inner">
          <span class="fc-button-content">day</span>
          <span class="fc-button-effect">
            <span></span>
          </span>
        </span>
      </span>
    `;

  const dayButton = createElementFromHTML(dayButtonHtml);
  dayButton.addEventListener('click', () => {
    window.location.hash = 'studentmyday/schedule';
  });
  monthButton.classList.remove('fc-corner-left');
  monthButton.before(dayButton);
}

export default registerModule('Day Schedule Button', dayScheduleButton, {
  description: 'Button to return to day view',
});
