import registerModule from '~/core/module';
import { UnloaderContext } from '~/core/module-loader';
import { insertCss } from '~/utils/dom';
import style from './style.css';

async function cleanUpMain(opts: void, unloaderContext: UnloaderContext) {
  const styles = insertCss(style.toString());
  unloaderContext.addRemovable(styles);
}

export default registerModule('{144550d9-70d8-4518-9f05-9eaa44221d8d}', {
  name: 'Improved Look',
  description: 'Refines styling',
  init: cleanUpMain,
});
