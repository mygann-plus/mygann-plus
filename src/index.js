import { MODULE_MAP } from '~/module-map';
import { tryLoadModule, tryUnloadModule } from '~/module-loader';

import setCssVars from '~/utils/css-vars';
import { getFlattenedOptions, setFlattenedOptions, mergeDefaultOptions } from '~/options';

function forModules(hash, fn) {
  for (const section in MODULE_MAP) {
    if (hash.startsWith(section)) {
      for (const module of MODULE_MAP[section]) {
        fn(module);
      }
    }
  }
}

function loadModules(hash) {
  forModules(hash, tryLoadModule);
}

function unloadModules(oldHash) {
  forModules(oldHash, tryUnloadModule);
}

async function initializeOptions() {
  const optsObj = await getFlattenedOptions();
  await setFlattenedOptions(mergeDefaultOptions(optsObj));
}

async function runExtension() {
  // TODO: only call initializeOptions on install and update
  // (plus dev feature to force initialization)
  await initializeOptions();
  setCssVars();
  loadModules(window.location.hash);
  window.addEventListener('hashchange', e => {
    unloadModules(new URL(e.oldURL).hash);
    loadModules(new URL(e.newURL).hash);
  });
}

runExtension();
