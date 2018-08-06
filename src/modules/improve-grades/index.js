/*
  THIS IS AN APRIL FOOLS JOKE AND IS ONLY ACTIVE DURING THAT DAY
  THIS MODULE DOES NOT ACTUALLY IMPROVE THE USER'S GRADES
*/

import createModule from '~/utils/module';

import { waitForLoad, constructButton, insertCss, createElement } from '~/utils/dom';
import { coursesListLoaded } from '~/shared/progress';

import ConfettiGenerator from './confetti';
import style from './style.css';

const selectors = {
  button: style.locals.button,
  canvas: style.locals.canvas,
};

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
    const curGrade = Number(gradeText.textContent.split('%')[0]);
    const button = document.querySelector(`#${selectors.button}`);
    if (curGrade < 100 || Number.isNaN(curGrade)) {
      gradeText.textContent = '100.00%';
      button.textContent = 'IMPROVE GRADES MORE';
    } else if (curGrade < 300 || increaseBy) {
      gradeText.textContent = `${curGrade + (increaseBy || 10)}.00%`;
    } else {
      interval = setInterval(() => changeGrades(gradeText, 100), 500);
      button.textContent = 'RAPIDLY IMPROVE GRADES';
      button.removeEventListener('click', changeGrades);
      button.addEventListener('click', stopRapid);
    }
  }

}

function showConfetti() {
  const canvas = <canvas id={selectors.canvas} />;
  document.body.appendChild(canvas);
  const confettiSettings = {
    target: selectors.canvas,
    max: '1000',
    size: '1',
    animate: true,
    props: ['circle', 'square', 'triangle', 'line'],
    colors: [[165, 104, 246], [230, 61, 135], [0, 199, 228], [253, 214, 126]],
    clock: '50',
    width: '1536',
    height: '732',
  };
  const confetti = new ConfettiGenerator(confettiSettings);
  confetti.render();
}

function isAprilFools() {
  const date = new Date();
  return date.getMonth() === 3 && date.getDate() === 1;
}

async function improveGrades() {

  if (!isAprilFools()) {
    return;
  }
  await waitForLoad(coursesListLoaded);

  const button = constructButton('IMPROVE GRADES', selectors.button, '', () => {
    changeGrades();
    showConfetti();
  });
  button.className += ' pull-right';
  const wrap = document.getElementById('courses').children[0].children[0].children[1].children[0];
  wrap.children[0].children[0].appendChild(button);
  insertCss(style.toString());

}

export default createModule('Improve Grades', improveGrades, {
  showInOptions: false,
});
