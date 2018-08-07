import { getOptionsFor } from '~/options';
import log from '~/utils/log';

const loadedModules = new Map();

function tryRunFunction(fn) {
  try {
    fn();
    return true;
  } catch (e) {
    log('error', e);
    return false;
  }
}

export function isModuleLoaded(module) {
  return loadedModules.has(module);
}

export async function loadModule(module) {
  const options = await getOptionsFor(module.guid);
  if (!options.enabled) {
    return false;
  }
  if (!isModuleLoaded(module) && module.init) {
    tryRunFunction(() => module.init(options.suboptions));
  }
  if (module.main) {
    tryRunFunction(() => module.main(options.suboptions));
  }
  loadedModules.set(module, options.suboptions);
  return true;
}

export function softUnloadModule(module) {
  if (!isModuleLoaded(module)) {
    return false;
  }
  if (!module.config.affectsGlobalState) {
    loadedModules.delete(module);
    return true;
  }
  return false;
}

export function hardUnloadModule(module) {
  if (!isModuleLoaded(module) || !module.unload) {
    return false;
  }
  if (tryRunFunction(() => module.unload(loadedModules.get(module)))) {
    loadedModules.delete(module);
    return true;
  }
  return false;
}
