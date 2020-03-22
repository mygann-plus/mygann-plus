import classNames from 'classnames';

import registerModule from '~/core/module';
import { UnloaderContext } from '~/core/module-loader';

import { createElement, waitForLoad, constructButton, insertCss, waitForOne } from '~/utils/dom';
import { fetchApi } from '~/utils/fetch';
import { getCDNImageUrl } from '~/utils/cdn';
import { getUserId } from '~/utils/user';
import Dialog from '~/utils/dialog';

import style from './style.css';
import {
  getNicknames,
  setNickname,
  removeNickname,
  getMode,
  setMode,
  Nicknames,
} from './name-quiz-modal';

const getRandomItem = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
const normalizeName = (name: string) => name.toLowerCase().trim();
const getFirstName = (fullName: string) => fullName.split(' ')[0];
const capitalize = (str: string) => str[0].toUpperCase() + str.substring(1);
const removeStudent = (students: Student[], student: Student) => (
  students.filter(s => s.name !== student.name)
);

const selectors = {
  playButton: style.locals['play-button'],
  wrap: style.locals.wrap,
  wrongAnswer: style.locals['wrong-answer'],
  imageWrap: style.locals['image-wrap'],
  input: style.locals.input,
  hint: style.locals.hint,
  image: style.locals.image,
  points: style.locals.points,
  settingsButton: style.locals['settings-button'],
  upperRightWrap: style.locals['upper-right-wrap'],
  multipleChoice: {
    wrap: style.locals['Multiple-Choice--wrap'],
    box: style.locals['Multiple-Choice--box'],
  },
  settings: {
    nicknameRemove: style.locals['Settings--nickname-remove'],
    nicknameRow: 'mgp_name-quiz_nickname-row',
  },
};

const modes = {
  TYPE: 'Type Answer',
  CHOICE: 'Multiple Choice',
};

interface Student {
  name: string;
  nickname: string;
  image: string;
}

interface NameQuizElements {
  image?: HTMLImageElement;
  input?: HTMLInputElement;
  hint?: HTMLElement;
  points?: HTMLElement;
  multipleChoiceWrap?: HTMLElement;
  multipleChoiceBoxes?: HTMLElement[];
  nickname?: HTMLElement;
  wrap?: HTMLElement;
}

class NameQuizGame {

  private students: Student[];
  private nicknames: Nicknames;
  private shownStudents: Student[];
  private currentStudent: Student;
  private mode: string;
  private points: number;
  private hintLength: number;
  private turns: number;
  private correctIndex: number;
  private elements: NameQuizElements = {};

  constructor(students: Student[], nicknames: Nicknames, mode: string) {
    this.students = students;
    this.nicknames = nicknames;
    this.mode = mode;
    this.points = 0;
    this.shownStudents = [];
    this.hintLength = 0;
    this.createGameElements();
    this.updateInputType();
  }

  /* PUBLIC METHODS */

  beginGame() {
    this.elements.input.focus();
    this.generateNewQuestion();
  }

  getWrap() {
    return this.elements.wrap;
  }

  nextTurn() {
    this.turns++;
    this.elements.input.value = '';
    this.generateNewQuestion();
  }

  incrementPoints() {
    this.points++;
    this.elements.points.textContent = `${this.points} points`;
  }

  generateNewQuestion() {
    let student = getRandomItem(this.students);
    if (this.shownStudents.length === this.students.length - 1) {
      this.shownStudents = [];
    }
    if (this.currentStudent) {
      while (this.currentStudent.image === student.image || this.shownStudents.includes(student.name)) {
        student = getRandomItem(this.students);
      }
    }
    this.currentStudent = student;
    this.elements.image.src = student.image;
    if (this.mode === modes.CHOICE) {
      this.generateNewMultipleChoiceBoxes(student);
    }
    this.shownStudents.push(student.name);
  }

  generateNewMultipleChoiceBoxes(student: Student) {
    const correctIndex = Math.floor(Math.random() * 3);
    this.correctIndex = correctIndex;
    const otherStudents = removeStudent(this.students, student);
    for (let i = 0; i < 3; i++) {
      const box = this.elements.multipleChoiceBoxes[i];
      if (i === correctIndex) {
        box.textContent = this.getStudentName(student);
      } else {
        box.textContent = this.getStudentName(getRandomItem(otherStudents));
      }
    }
  }

  getStudentName(student: Student) {
    // current-user-set nickname takes priority, then self-set, then default
    const nickname = this.nicknames[student.name] || student.nickname;
    return nickname ? capitalize(nickname) : getFirstName(student.name);
  }

  isCorrectName(name: string) {
    const nickname = this.nicknames[this.currentStudent.name] || this.currentStudent.nickname;
    const currentName = getFirstName(normalizeName(this.currentStudent.name));
    const normalName = normalizeName(name);
    return (nickname && normalName === normalizeName(nickname)) || normalName === currentName;
  }

  /* EVENT LISTENERS */

  handleInput(e: KeyboardEvent) {
    this.elements.wrap.classList.remove(selectors.wrongAnswer);
    if (e.key === 'Enter') {
      if (this.isCorrectName((e.target as HTMLInputElement).value)) {
        this.incrementPoints();
        this.hideHint();
        this.nextTurn();
      } else {
        this.elements.wrap.classList.add(selectors.wrongAnswer);
        this.showHint();
      }
    }
  }

  handleChoiceClick(e: Event) {
    const button = e.target as HTMLElement;
    if (this.isCorrectName(button.textContent)) {
      button.blur();
      this.incrementPoints();
      this.nextTurn();
    }
  }

  handleNicknameClick(e: Event) {
    e.preventDefault();
    const nickname = prompt(`Nickname for ${this.currentStudent.name}`); // eslint-disable-line no-alert
    if (!nickname) {
      return;
    }
    this.nicknames[this.currentStudent.name] = nickname;
    setNickname(this.currentStudent.name, nickname);
    if (this.mode === modes.CHOICE) {
      this.elements.multipleChoiceBoxes[this.correctIndex].textContent = nickname;
    }
  }

  updateInputType() {
    switch (this.mode) {
      case modes.TYPE:
        this.elements.multipleChoiceWrap.style.display = 'none';
        this.elements.input.style.display = '';
        break;
      case modes.CHOICE:
        this.elements.multipleChoiceWrap.style.display = '';
        this.elements.input.style.display = 'none';
        if (this.currentStudent) {
          this.generateNewMultipleChoiceBoxes(this.currentStudent);
        }
        break;
      default:
        break;
    }
  }

  showHint() {
    this.hintLength++;
    const letters = this.getStudentName(this.currentStudent).substring(0, this.hintLength);
    this.elements.hint.textContent = `Hint: ${letters}`;
  }

  hideHint() {
    this.hintLength = 0;
    this.elements.hint.textContent = '';
  }

  createGameElements() {
    const image = (
      <img className={ selectors.image }></img>
    ) as HTMLImageElement;
    const imageWrap = <div className={ selectors.imageWrap }>{ image }</div>;
    const input = (
      <input
        placeholder="Student Name"
        onKeyUp={ (e: any) => this.handleInput(e) }
        className={ selectors.input }
      ></input>
    );
    const createMultipleChoiceBox = () => (
      constructButton(
        '', '', '',
        e => this.handleChoiceClick(e), selectors.multipleChoice.box,
      )
    );
    const multipleChoiceBoxes = [
      createMultipleChoiceBox(),
      createMultipleChoiceBox(),
      createMultipleChoiceBox(),
    ];
    const multipleChoiceWrap = (
      <div className={ selectors.multipleChoice.wrap }>
        { multipleChoiceBoxes }
      </div>
    );
    const settings = (
      <span
        className={selectors.settingsButton} onClick={() => this.handleSettingsClick()}>
        <i className="fa fa-cog"></i>
      </span>
    );
    const hint = <span className={ selectors.hint }></span>;
    const points = <span className={ selectors.points }>0 points</span>;
    const nickname = <a href="#" onClick={(e: any) => this.handleNicknameClick(e)}>Add nickname...</a>;
    const wrap = (
      <div className={ selectors.wrap }>
        { imageWrap }
        { input }
        { hint }
        { multipleChoiceWrap }
        <div className={ selectors.upperRightWrap }>
          { settings }
          { points }
        </div>
        { nickname }
      </div>
    );
    this.elements.image = image;
    this.elements.input = input as HTMLInputElement;
    this.elements.hint = hint;
    this.elements.points = points;
    this.elements.multipleChoiceWrap = multipleChoiceWrap;
    this.elements.multipleChoiceBoxes = multipleChoiceBoxes;
    this.elements.nickname = nickname;
    this.elements.wrap = wrap;
  }

  /* SETTINGS */

  generateSettingsDialog() {
    return (
      <div>
        <b>Mode: </b>
        <select onChange={ e => this.selectMode(e.target.value) }>
          {
            Object.values(modes).map(mode => (
              <option selected={ mode === this.mode }>
                { mode }
              </option>
            ))
          }
        </select>
        <br />
        <b>Nicknames:</b>
        <ul>
          {
            Object.keys(this.nicknames).map(fullName => (
              <li className={ selectors.settings.nicknameRow }>
                { fullName }: { this.nicknames[fullName] }
                <i
                  className={ classNames('fa fa-times', selectors.settings.nicknameRemove) }
                  onClick={ (e: any) => this.handleNicknameRemoveClick(e, fullName) }
                >
                </i>
              </li>
            ))
          }
        </ul>
      </div>
    );
  }

  handleSettingsClick() {
    const dialog = new Dialog('Name Quiz Options', this.generateSettingsDialog(), {
      leftButtons: [Dialog.buttons.CLOSE],
    });
    dialog.open();
  }

  selectMode(mode: string) {
    if (mode !== this.mode) {
      this.mode = mode;
      this.updateInputType();
    }
    this.mode = mode;
    setMode(mode);
  }

  handleNicknameRemoveClick(e: Event, fullName: string) {
    (e.target as HTMLElement).closest(`.${selectors.settings.nicknameRow}`).remove();
    delete this.nicknames[fullName];
    removeNickname(fullName);
  }
}

async function runGame(unloaderContext: UnloaderContext) {

  // extracts id from advisorypage, communitypage, activitypage, and academicclas
  const classId = window.location.href.match(/(?:#.+page|#academicclass)\/([0-9]+)/)[1];
  const userId = Number(await getUserId());

  const students: Student[] = await Promise.all((await fetchApi(`/api/datadirect/sectionrosterget/${classId}`))
    .filter((student: any) => {
      // only students have gradYears, some students don't have photos
      return student.gradYear && student.Id !== userId && student.userPhotoLarge;
    })
    .map(async (student: any) => ({
      name: student.name,
      nickname: student.nickName,
      image: await getCDNImageUrl(`user/${student.userPhotoLarge}?resize=200,200`),
    })));

  if (!students.length) {
    return alert('There are no students in this class.'); // eslint-disable-line no-alert
  }

  const nicknames = await getNicknames();
  const mode = (await getMode()) || modes.CHOICE;
  const game = new NameQuizGame(students, nicknames, mode);

  const [rosterBar] = await waitForOne(() => ([
    document.querySelector('#communitypagecontainer div'),
    document.querySelector('#academicclassmaincontainer div'),
    document.querySelector('#grouppagemaincontainer div'),
    document.querySelector('#activitypagecontainer div'),
  ] as HTMLElement[]), true);

  rosterBar.after(game.getWrap());
  unloaderContext.addRemovable(game.getWrap());
  game.beginGame();
}

function handleButtonClick(unloaderContext: UnloaderContext) {
  if (!document.querySelector(`.${selectors.wrap}`)) {
    runGame(unloaderContext);
  }
}

const domQuery = () => document.querySelector('#roster-term-picker');

async function nameQuiz(opts: void, unloaderContext: UnloaderContext) {
  const styles = insertCss(style.toString());
  unloaderContext.addRemovable(styles);

  const termButton = await waitForLoad(domQuery);
  const button = constructButton(
    'Name Quiz', '', '',
    () => handleButtonClick(unloaderContext),
    selectors.playButton,
  );
  termButton.before(button);
  unloaderContext.addRemovable(button);
}

export default registerModule('{2b9653de-c88c-4885-b43c-1845f8879e0f}', {
  name: 'Roster Name Quiz',
  description: 'Quiz to help you learn students\' names',
  main: nameQuiz,
});
