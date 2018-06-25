import Dialog from '../../utils/dialogue';
import { createElementFromHTML } from '../../utils/dom';

function showDataExportExplanation() {

  /* eslint-disable max-len */
  const title = 'Why Private Assignments Will Not Appear in Exported Data';
  const html = `
    <div style="line-height: 2">
      Private Assignments are a feature of Gann OnCampus+. Private Assignments are not built into OnCampus, and so they
      does not have full access to everything OnCampus does because of technical limitations on how browser extensions, 
      like Gann OnCampus+, can operate. OnCampus controls the data that's exported through iCal or WebCal, and 
      <b>Gann OnCampus+ does not have the ability to access or change that data in order to include your private assignments.</b> 
    </div>
  `;
  /* eslint-enable max-len */

  const dialog = new Dialog(title, createElementFromHTML(html), {
    buttons: [Dialog.buttons.OKAY],
  });
  dialog.open();

}

function dataExportWarning() {
  const menu = document.getElementById('ical-menu').children[0];
  const html = `
    <span style="color: grey; padding-top: 4px; display: inline-block;">
      Private Assignments will not appear in exported data 
      <a href="#">(why?)</a>
    </span>
  `;
  const warningElem = createElementFromHTML(html);
  warningElem.children[0].addEventListener('click', e => {
    e.preventDefault();
    showDataExportExplanation();
  });
  menu.appendChild(warningElem);
}

export default function showWarnings() {
  dataExportWarning();
}
