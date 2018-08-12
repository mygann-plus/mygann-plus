import { modulesForHash } from '~/module-map';
import { loadModule, softUnloadModule, hardUnloadModule } from '~/module-loader';

import setCssVars from '~/utils/css-vars';
import { getFlattenedOptions, setFlattenedOptions, mergeDefaultOptions } from '~/options';
import log from '~/utils/log';

function getHash(url) {
  return new URL(url).hash || '#';
}

function loadModules(hash) {
  for (const module of modulesForHash(hash)) {
    loadModule(module);
  }
}

function unloadModules(oldHash, newHash) {
  const oldModules = modulesForHash(oldHash);
  const newModules = modulesForHash(newHash);

  const unloadedModules = new Set([...oldModules].filter(m => !newModules.has(m)));

  for (const module of unloadedModules) {
    if (!softUnloadModule(module)) { // module affects global state
      if (!hardUnloadModule(module)) {
        log('warn', `Failed to hard unload module '${module.config.name}'`);
      }
    }
  }
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
  loadModules(getHash(window.location.href));
  window.addEventListener('hashchange', e => {
    const newHash = getHash(e.newURL);
    const oldHash = getHash(e.oldURL);
    unloadModules(oldHash, newHash);
    loadModules(newHash);
  });
}

runExtension();
