import { getOptionsFor } from '~/options';

const loadedModules = new Set();

function tryRunFunction(fn) {
  try {
    fn();
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(e); // eslint-disable-line no-console
    }
  }
}

export function isModuleLoaded(module) {
  return loadedModules.has(module);
}

export async function tryLoadModule(module) {
  const options = await getOptionsFor(module.guid);
  if (!options.enabled) {
    return false;
  }
  if (!isModuleLoaded(module) && module.init) {
    tryRunFunction(() => module.init(options));
  }
  if (module.main) {
    tryRunFunction(() => module.main(options));
  }
  loadedModules.add(module);
  return true;
}

export function tryUnloadModule(module) {
  if (!isModuleLoaded(module)) {
    return false;
  }
  if (!module.config.affectsGlobalState) {
    loadedModules.delete(module);
    return true;
  }
  return false;
}
