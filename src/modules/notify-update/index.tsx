import registerModule from '~/core/module';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const text: string = '<strong>- Clear theme - ENABLE BY CLICKING "CLEAR"</strong><br>       - pick your own image as the background for mygann<br>       - change the amount of blur (how transparent everything is)<br>       - change the size of image<br><br><strong>- New color theme - ENABLE BY CLICKING "ENHANCED"</strong><br>       - looks super good<br>       - pick color by changing color next to "color" and select "enhanced"<br><br><strong>-New dark mode toggle</strong><br><br><strong>-New invert filter for page due to request</strong><br><br><br>If you don\'t know how to change options, click on the mygann box at the top left of the screen and click on options.<br><br><u>If you have any additional requests, email 25nmeyer@gannacademy.org</u>';

function notifyUpdate() {
  // chrome.storage.sync.get('notifiedupdate', (result) => {
  //   if (result.notifiedupdate !== 1) {
  //     document.querySelector('body').insertAdjacentHTML('afterend', `<section id="e0fff7fa-411f-4bd3-a873-b7dddb1526e3" style="color: black;position: fixed; z-index: 10000000; width: 70%;height: 80%;background: white;top: 15%;left: 15%;"><div id="a8ee356f-335d-4843-a28f-fedd3a8f4803" style="position: fixed; z-index: 10000000; text-align: left;content-align: center;top: 15%;font-size: xx-large;right: 15.5%;display: block;">x</div><p id="e668366f-3f11-47c8-ab43-4b3201010b7a" style="font-size: xx-large;color: black;z-index: 10000000; margin-left: 3vh; margin-top: 5vh;">New Update</p><p id="b3f994ce-9253-49e1-b02d-ded7560ef71d" style=";color: black;z-index: 10000000;margin-left: 3vh;line-height: 3.5vh; margin-top: 3vh;">${text}</p></section>`);
  //     document.getElementById('a8ee356f-335d-4843-a28f-fedd3a8f4803').addEventListener('click', () => {
  //       document.getElementById('e0fff7fa-411f-4bd3-a873-b7dddb1526e3').remove();
  //       document.getElementById('e0fff7fa-411f-4bd3-a873-b7dddb1526e3').remove();
  //       waitForElm('#xdmM4n8SgdnGpSor2zMs').then((elm) => {
  //       // @ts-ignore
  //         document.querySelector('#xdmM4n8SgdnGpSor2zMs').click();
  //         waitForElm('#site-user-nav > div > ul > li.oneline.parentitem.last > div.subnav.pri-75-bordercolor.white-bgc.gray-nav-boxshadow.sky-nav.nav-visible > ul > li.first > a').then((a) => {
  //         // @ts-ignore
  //           document.querySelector('#site-user-nav > div > ul > li.oneline.parentitem.last > div.subnav.pri-75-bordercolor.white-bgc.gray-nav-boxshadow.sky-nav.nav-visible > ul > li.first > a').click();
  //         });
  //       });
  //     });
  //     chrome.storage.sync.set({ notifiedupdate: 1 }).then(() => {});
  //
  //   }
  // });
}
// "#site-user-nav > div > ul > li.oneline.parentitem.last > div.subnav.pri-75-bordercolor.white-bgc.gray-nav-boxshadow.sky-nav.nav-visible > ul > li.first"
// document.querySelector("#site-user-nav > div > ul > li.oneline.parentitem.last > div.subnav.pri-75-bordercolor.white-bgc.gray-nav-boxshadow.sky-nav.nav-visible > ul > li.first")
export default registerModule('{14e8c6da-b9da-435c-8ddf-de0099e9e290}', {
  name: 'notifyUpdate',
  showInOptions: false,
  init: notifyUpdate,
  main: notifyUpdate,
  unload: notifyUpdate,
});
