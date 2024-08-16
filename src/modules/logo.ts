/* eslint-disable no-console */
import registerModule from '~/core/module';

/*
  __  __        _____
 |  \/  |      / ____|                   _
 | \  / |_   _| |  __  __ _ _ __  _ __ _| |_
 | |\/| | | | | | |_ |/ _` | '_ \| '_ \_   _|
 | |  | | |_| | |__| | (_| | | | | | | ||_|
 |_|  |_|\__, |\_____|\__,_|_| |_|_| |_|
          __/ |
         |___/
 ====================================================
 Take over MyGann+ for next year!
 22isperber@gannacademy.org
 22shirsh@gannacademy.org
 ====================================================
*/

function logoMain() {
  const logo = "  __  __        _____                        \n |  \\/  |      / ____|                   _   \n | \\  / |_   _| |  __  __ _ _ __  _ __ _| |_ \n | |\\/| | | | | | |_ |/ _` | '_ \\| '_ \\_   _|\n | |  | | |_| | |__| | (_| | | | | | | ||_|  \n |_|  |_|\\__, |\\_____|\\__,_|_| |_|_| |_|     \n          __/ |                              \n         |___/                               "; // eslint-disable-line max-len

  const contact = ` ====================================================
 wanna help? I'm 25nmeyer@gannacademy.org
 ====================================================`;

  console.log(`${logo}\n${contact}`);
}

export default registerModule('{291fedc2-fe40-4882-bbbc-6e7a9135be07}', {
  name: 'easteregg.logo',
  init: logoMain,
  showInOptions: false,
});
