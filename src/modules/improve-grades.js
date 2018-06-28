/*
  THIS IS AN APRIL FOOLS JOKE AND IS ONLY ACTIVE DURING THAT DAY
  THIS MODULE DOES NOT ACTUALLY IMPROVE THE USER'S GRADES
*/

import { waitForLoad, constructButton, nodeListToArray } from '../utils/dom';
import registerModule from '../utils/module';

let interval;
function stopRapid() {
  if (interval) {
    clearInterval(interval);
  }
}

function generateReport(event, increaseBy) {

  document.querySelector('label[data-action="showGrade"]').click();
  nodeListToArray(document.getElementsByClassName('showGrade')).forEach(e => {
    const curGrade = Number(e.innerText.split('%')[0]);
    if (curGrade < 100 || Number.isNaN(curGrade)) {
      e.innerText = '100.00%';
      document.getElementById('gocp_improve-grades_button').innerText = 'IMPROVE GRADES MORE';
    } else if (curGrade < 300 || increaseBy) {
      e.innerText = `${curGrade + (increaseBy || 10)}.00%`;
    } else {
      interval = setInterval(() => generateReport(e, 100), 500);
      document.getElementById('gocp_improve-grades_button').innerText = 'RAPIDLY IMPROVE GRADES';
      document.getElementById('gocp_improve-grades_button').removeEventListener('click', generateReport);
      document.getElementById('gocp_improve-grades_button').addEventListener('click', stopRapid);
    }
  });

}
const DOM_QUERY = () => (
  document.getElementById('coursesContainer') &&
  document.getElementById('coursesContainer').children &&
  document.getElementById('coursesContainer').children.length &&
  document.getElementsByClassName('bb-tile-content-section')[3] &&
  document.getElementsByClassName('bb-tile-content-section')[3].children[0]
);

function isAprilFools() {
  const date = new Date();
  return date.getMonth() === 3 && date.getDate() === 1;
}

function improveGrades() {

  // only enable on april 1st
  if (!isAprilFools()) {
    return;
  }

  waitForLoad(DOM_QUERY).then(() => {
    // TODO: investigate potential performance issues
    const button = constructButton('IMPROVE GRADES', 'gocp_improve-grades_button', '', generateReport);
    button.className += ' pull-right';
    const wrap = document.getElementById('courses').children[0].children[0].children[1].children[0];
    wrap.children[0].children[0].appendChild(button);
    setTimeout(() => {
      document.head.innerHTML += `
      <style>
      #gocp_improve-grades_button {
        color: white !important;
        font-weight: bold;
        margin-right: 10px;
      
        /* W3C 
        background: linear-gradient(top, #ff3232 0%,#fcf528 16%,#28fc28 32%,#28fcf8 50%,#272ef9 66%,#ff28fb 82%,#ff3232 100%);
      
        /* Firefox */
        background: -moz-linear-gradient(top, #ff3232 0%, #fcf528 16%, #28fc28 32%, #28fcf8 50%, #272ef9 66%, #ff28fb 82%, #ff3232 100%);
      
        /* Chrome,Safari4+ */
        background: -webkit-gradient(linear, left top, left bottom, color-stop(0%,#ff3232), color-stop(16%,#fcf528), color-stop(32%,#28fc28), color-stop(50%,#28fcf8), color-stop(66%,#272ef9), color-stop(82%,#ff28fb), color-stop(100%,#ff3232));
      
        /* Chrome10+,Safari5.1+ */
        background: -webkit-linear-gradient(top, #ff3232 0%,#fcf528 16%,#28fc28 32%,#28fcf8 50%,#272ef9 66%,#ff28fb 82%,#ff3232 100%);
      
        background-size: 1000%;
        -moz-background-size: 1000%;
        -webkit-background-size: 1000%;
      
        /* W3C */
        animation-name: fun-time-awesome;
        animation-duration: 40s;
        animation-timing-function: linear;
        animation-iteration-count: infinite;
        animation-direction: alternate;
        animation-play-state: running;
      
        /* Chrome, Safari */
        -webkit-animation-name: fun-time-awesome;
        -webkit-animation-duration: 1s;
        -webkit-animation-timing-function: linear;
        -webkit-animation-iteration-count: infinite;
        -webkit-animation-direction: alternate;
        -webkit-animation-play-state: running;
      }
      
      /* W3C */
      @keyframes fun-time-awesome {
        0% {background-position: left top;}
        100% {background-position: left bottom;}
      }
      
      /* Firefox */
      @-moz-keyframes fun-time-awesome {
        0% {background-position: left top;}
        100% {background-position: left bottom;}
      }
      
      /* Chrome, Safari */
      @-webkit-keyframes fun-time-awesome {
        0% {background-position: left top;}
        100% {background-position: left bottom;}
      }
      
      */
      
      </style>
    `;
    });
  }, 1000000000);
}

export default registerModule('Improve Grades', improveGrades, {
  showInOptions: false,
});
