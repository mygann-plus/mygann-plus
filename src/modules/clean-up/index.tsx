import registerModule from '~/core/module';
import { createElement, waitForLoad } from '~/utils/dom';
import style from './style.css';

const domQuery = () => document.querySelector('#app-style style');

async function cleanUpMain() {
  const appStyles = await waitForLoad(domQuery);
  const themeStyles = <style>{ style.toString() }</style>;
  appStyles.after(themeStyles);
}

export default registerModule('{144550d9-70d8-4518-9f05-9eaa44221d8d}', {
  name: 'Improved Look',
  description: 'Refines styling',
  main: cleanUpMain,
});
