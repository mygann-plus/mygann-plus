import { getOptionsFor } from '~/options';
import log from '~/utils/log';

/**
module: {
  suboptions: {},
  unloaderContext: UnloaderContext
}
 */
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

class UnloaderContext {
  constructor() {
    this.removables = [];
  }
  /**
   * @param {*} removable Object which has a .remove method
   */
  addRemovable(removable) {
    this.removables.push(removable);
    return {
      remove: () => {
        this.removables.splice(this.removables.indexOf(removable), 1);
      },
    };
  }
}

function runUnloaderContext(context) {
  for (const removable of context.removables) {
    removable.remove();
  }
}

export function isModuleLoaded(module) {
  return loadedModules.has(module);
}

export async function loadModule(module) {
  const options = await getOptionsFor(module.guid);
  const unloaderContext = new UnloaderContext();
  if (!options.enabled) {
    return false;
  }
  if (!isModuleLoaded(module) && module.init) {
    tryRunFunction(() => module.init(options.suboptions, unloaderContext));
  }
  if (module.main) {
    tryRunFunction(() => module.main(options.suboptions, unloaderContext));
  }
  loadedModules.set(module, {
    suboptions: options.suboptions,
    unloaderContext,
  });
  return true;
}

export function softUnloadModule(module) {
  if (!isModuleLoaded(module)) {
    return true;
  }
  if (!module.config.affectsGlobalState) {
    loadedModules.delete(module);
    return true;
  }
  return false;
}

export function hardUnloadModule(module) {
  const { suboptions, unloaderContext } = loadedModules.get(module);
  if (!isModuleLoaded(module)) {
    return true;
  }
  if (!unloaderContext.removables.length && !module.unload) {
    return false;
  }
  const unloaded = tryRunFunction(() => {
    runUnloaderContext(unloaderContext);
    if (module.unload) {
      module.unload(suboptions);
    }
  });
  if (unloaded) {
    loadedModules.delete(module);
    return true;
  }
  return false;
}
