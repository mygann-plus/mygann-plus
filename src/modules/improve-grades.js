/*
  THIS IS AN APRIL FOOLS JOKE AND IS ONLY ACTIVE DURING THAT DAY
  THIS MODULE DOES NOT ACTUALLY IMPROVE THE USER'S GRADES
*/

import { waitForLoad, constructButton, insertCss } from '../utils/dom';
import registerModule from '../utils/module';

function addStyles() {
  insertCss(`
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

    #gocp_improve-grades_button {
      color: white !important;
      font-weight: bold;
      margin-left: 10px;
      margin-right: 10px;
    
      background: linear-gradient(to top, #ff3232 0%,#fcf528 16%,#28fc28 32%,#28fcf8 50%,#272ef9 66%,#ff28fb 82%,#ff3232 100%);
      /* Chrome has a bug (?) where unprefixed background-size cause background-position animation to not work */
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
  `);
}

let interval;
function stopRapid() {
  if (interval) {
    clearInterval(interval);
  }
}

function changeGrades(e, increaseBy) {

  document.querySelector('label[data-action="showGrade"]').click();
  const gradeTexts = document.getElementsByClassName('showGrade');
  for (const gradeText of gradeTexts) {
    const curGrade = Number(gradeText.innerText.split('%')[0]);
    const button = document.querySelector('#gocp_improve-grades_button');
    if (curGrade < 100 || Number.isNaN(curGrade)) {
      gradeText.innerText = '100.00%';
      button.innerText = 'IMPROVE GRADES MORE';
    } else if (curGrade < 300 || increaseBy) {
      gradeText.innerText = `${curGrade + (increaseBy || 10)}.00%`;
    } else {
      interval = setInterval(() => changeGrades(gradeText, 100), 500);
      button.innerText = 'RAPIDLY IMPROVE GRADES';
      button.removeEventListener('click', changeGrades);
      button.addEventListener('click', stopRapid);
    }
  }

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

async function improveGrades() {

  if (!isAprilFools()) {
    // return;
  }
  await waitForLoad(DOM_QUERY);

  const button = constructButton('IMPROVE GRADES', 'gocp_improve-grades_button', '', changeGrades);
  button.className += ' pull-right';
  const wrap = document.getElementById('courses').children[0].children[0].children[1].children[0];
  wrap.children[0].children[0].appendChild(button);
  addStyles();
}

export default registerModule('Improve Grades', improveGrades, {
  showInOptions: false,
});
