import registerModule from '../utils/module';
import { waitForLoad, insertBefore, createElementFromHTML } from '../utils/dom';

const domQuery = () => (
  document.getElementsByClassName('fc-header')[0] &&
  document.getElementsByClassName('fc-header')[0].children[0] &&
  document.getElementsByClassName('fc-header')[0].children[0].children[0] &&
  document.getElementsByClassName('fc-header')[0].children[0].children[0].children[0] &&
  document.getElementsByClassName('fc-header')[0].children[0].children[0].children[0].children[5]
);

function dayScheduleButton() {
  waitForLoad(domQuery).then(() => {

    const monthButton = document.getElementsByClassName('fc-header')[0]
      .children[0].children[0].children[0].children[5];
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
    insertBefore(monthButton, dayButton);

  });
}

export default registerModule('Day Schedule Button', dayScheduleButton);
